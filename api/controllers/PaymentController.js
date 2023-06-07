const {ObjectId} = require('mongodb');

module.exports = {

	create: async function(req, res){
		var data = req.body;



		if(data['product']==="Starter Plan Activation"){
			data['amount'] = sails.config.custom.REGISTRATION_CHARGE + sails.config.custom.REGISTRATION_CHARGE*sails.config.custom.DONATION_PERCENT_OF_PAID_AMOUNT;
		}

		var payment = await Payment.create(data).fetch();

		var result = await sails.helpers.initiatePaymentWithRazorpay.with({
	    					orderId: payment.id,
		    				amount: payment.amount
	    				});
        
        payment['currency'] = result['currency'];
        payment['status'] = result['status'];
        payment["notes"] = {
        	razorpay_order_id: result['id'],
			attempts: result['attempts'],
	    }
	    payment['success'] = true;

	    console.log(payment);

	    return res.successResponse(payment, 201, null, true, "Payment drafted successfully");
	},

	verifyRazorpayPayment: async function (req, res) {
	    const crypto = require('crypto');
	    const hash = crypto.createHmac('sha256', sails.config.custom.RAZORPAY.keySecret)
	                   .update(`${req.body.razorpay_order_id}|${req.body.razorpay_payment_id}`)
	                   .digest('hex');
	    if(hash === req.body.razorpay_signature){
	      try{
	        const axios = require('axios');
	        var paymentResult = await axios.get(
	          sails.config.custom.RAZORPAY.url.paymentStatus.replace(
	          	":payment_id", req.body.razorpay_payment_id), {
	          auth: {
	            username: sails.config.custom.RAZORPAY.keyId,
	            password: sails.config.custom.RAZORPAY.keySecret
	          },
	          headers: {"content-type": "application/json"}
	        });

	        paymentResult = paymentResult['data'];
	        if(paymentResult["status"]==="authorized"){
	          var paymentResult = await axios.post(
	            sails.config.custom.RAZORPAY.url.capture.replace(":payment_id", req.body.razorpay_payment_id), {
	            amount: req.body.amount*100,
	            currency: req.body.currency
	          }, {
	            auth: {
	              username: sails.config.custom.RAZORPAY.keyId,
	              password: sails.config.custom.RAZORPAY.keySecret
	            },
	            headers: {"content-type": "application/json"}
	          });
	          paymentResult = paymentResult['data'];
	        }
	        console.log(paymentResult);
	        if(paymentResult["status"]==="captured" || paymentResult["status"]==="authorized"){
	          var payment = await Payment.updateOne({
	            "id": req.body.payment_id
	          }).set({
	            transactionId: req.body.razorpay_payment_id,
	            s: paymentResult["status"]
	          });

	          console.log(payment);
	        }
	      }catch(err){
	        console.log(err);
	        return res.successResponse({msg: "Failed to capture payment.", success: false}, 200, null, false, "Payment failed");        
	      }
	      
	      res.successResponse({msg: "Payment successfully processed", success: true}, 200, null, true, "Payment successfull");

          // Process network joining
	      	if(payment.product==="Starter Plan Activation"){
	      		await sails.helpers.approveNewJoinee.with({
			      personId: payment.person, 
			      amount: req.body.amount,
			      isPaidApproval: true
			    })
			    .intercept('invalid_amount', (e)=>{
			      // console.log(e);
			      return res.successResponse({code: "Invalid Amount"}, 500, null, false, "Invalid Amount");
			    });
	      	}
	    }else{
	      return res.successResponse({msg: "Signature mismatch. Try again later"}, 400, null, true, "Bad request");  
	    }
    },
}