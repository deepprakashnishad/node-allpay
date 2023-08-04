const {ObjectId} = require('mongodb');
var axios = require('axios');

module.exports = {
	create: async function(req, res){
		var merchant = await sails.helpers.verifyMerchantReq.with({
			token: req.headers.authorization, 
			secretKey: sails.config.models.dataEncryptionKeys.merchantSecretKey
		})
    	.intercept('invalidToken', (err)=>{
    		console.log(err);
    		return res.successResponse(err, 403, null, false, "Invalid token");
    	}).intercept('tokenExpired', (err)=>{
    		console.log(err);
    		return res.successResponse(err, 403, null, false, "Token Expired");
    	}).intercept('passCodeMismatch', (err)=>{
    		console.log(err);
    		return res.successResponse(err, 403, null, false, "Passcode in token is invalid");
    	});
	    if(merchant){ 
	    	var trans = {}; 
	    	trans['bp'] = req.body.bpid;
		    trans['poid'] = req.body.partnerOrderId; 
		    trans['puid'] = req.body.partnerUserId; 
		    if(req.body.partnerUserDetail){
		    	trans['pud'] = req.body.partnerUserDetail;
		    }else{
		    	trans['pud'] = {username: req.body.username, phone: req.body.userphone, email: req.body.useremail}; 	
		    }
		    trans['m'] = merchant.id; 
		    trans['a'] = req.body.amount; 
		    if(req.body.paymentGateway){
		    	trans['pg'] = req.body.paymentGateway	
		    }else{
		    	trans['pg'] = req.body.paymentGatewayId;	
		    }		    
		    trans['pm'] = req.body.paymentMode; 
		    trans['pd'] = req.body.paymentDetails;
		    trans['ei'] = req.body.extra_info; 
		    trans['c'] = req.body.comment; 
		    trans['s'] = req.body.status.toUpperCase();

	        try{ 
	        	var mTransaction = await Transaction.create(trans).fetch(); 
		        res.successResponse({}, 201, null, true, "Transaction created"); 	
		        if(req.body.allpayCallbackUrl){ 
		        	var completeCallbackUrl = `${req.body.allpayCallbackUrl}?payment_status=${req.body.status}&trans
		        	['poid']=${req.body.partnerOrderId}&pom=${req.body.paymentMode}&transactionId=${mTransaction.id}`;
		        	console.log(completeCallbackUrl);
		        	var response = await axios.get(completeCallbackUrl);
		        	if(response.status!==200){
		        		console.log(response);
		        	}
		        	return;
		        } 
		    }catch(e){ 
		    	console.log(e); return res.successResponse(e, 500, null, false, "Passcode in token is invalid"); 	 
	        }

	    }else{
	    	return res.successResponse({}, 403, null, false, "Invalid merchant. Permission Denied");
	    }
	},

	getTransactionByPartnerOrderId: async function(req, res){
		var bettingPartner = await sails.helpers.verifyMerchantReq.with({
			token: req.headers.authorization, 
			secretKey: sails.config.models.dataEncryptionKeys.merchantSecretKey,
			"req": req.body,
			"tokenOwnerType": "betting-partner"
		})
    	.intercept('invalidToken', (err)=>{
    		console.log(err);
    		return res.successResponse(err, 500, null, false, "Invalid token");
    	}).intercept('tokenExpired', (err)=>{
    		console.log(err);
    		return res.successResponse(err, 500, null, false, "Token Expired");
    	}).intercept('passCodeMismatch', (err)=>{
    		console.log(err);
    		return res.successResponse(err, 500, null, false, "Passcode in token is invalid");
    	});
    	if(bettingPartner){
    		console.log(bettingPartner.id);
    		console.log(req.query.poid);
	    	var transactionList = await Transaction.find({bp: bettingPartner.id, poid: req.query.poid});
	    	res.successResponse({"transactionList": transactionList}, 200, null, true, "Transaction retrived"); 	
    	}else{
	    	return res.successResponse({}, 403, null, false, "Invalid merchant. Permission Denied");
	    }
	}
}