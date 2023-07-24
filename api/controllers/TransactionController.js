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
	    	trans['pud'] = req.body.partnerUserDetail;
	    	trans['m'] = merchant.id;
	    	trans['a'] = req.body.amount;
	    	trans['pg'] = req.body.paymentGatewayId;
    		trans['pm'] = req.body.paymentMode;
	        trans['pd'] = req.body.paymentDetails;
	        trans['ei'] = req.body.extra_info;
	        trans['c'] = req.body.comment;
	        trans['s'] = req.body.status;

	        try{
	        	await Transaction.create(trans);
	        	return res.successResponse({}, 201, null, false, "Transaction created"); 	
	        }catch(e){
	        	console.log(e);
	       		return res.successResponse(e, 500, null, false, "Passcode in token is invalid"); 	
	        }

	    }else{
	    	return res.successResponse({}, 403, null, false, "Invalid merchant. Permission Denied");
	    }
	}
}