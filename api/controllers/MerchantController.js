module.exports = {
	create: async function(req, res){
		const isAuthorized = await sails.helpers.authorizeUser.with
	    ({token: req.headers.authorization, "permission": "CREATE_PERMISSION"})
	    .intercept('tokenExpired', ()=>{
	      return res.successResponse({code:"tokenExpired"}, 403, null, false, "Permission denied. Token Expired.");
	    })
	    .intercept('invalidToken', ()=>{
	      return res.successResponse({code: "invalidToken"}, 403, null, false, "Permission denied");
	    }).intercept('dbError', ()=>{
	      return res.successResponse({code: "dbError"}, 500, null, false, "Some database error occured");
	    });
	    if(isAuthorized){
	    	var merchant = await Merchant.create({
	    		name: req.body.name, 
	    		website: req.body.website, 
	    		status: req.body.status
	    	}).fetch();
	    	return res.successResponse(merchant, 201, null, true, "Merchant created successfully");
	    }else{
	    	return res.successResponse({msg: "Permission denied"}, 403, null, false, "Permission denied");
	    }
	},

	update: async function(req, res){
		const isAuthorized = await sails.helpers.authorizeUser.with
	    ({token: req.headers.authorization, "permission": "CREATE_PERMISSION"})
	    .intercept('tokenExpired', ()=>{
	      return res.successResponse({code:"tokenExpired"}, 403, null, false, "Permission denied. Token Expired.");
	    })
	    .intercept('invalidToken', ()=>{
	      return res.successResponse({code: "invalidToken"}, 403, null, false, "Permission denied");
	    }).intercept('dbError', ()=>{
	      return res.successResponse({code: "dbError"}, 500, null, false, "Some database error occured");
	    });
	    if(isAuthorized){
	    	var merchant = await Merchant.updateOne({"id": req.body.id}).set({
	    		name: req.body.name, 
	    		website: req.body.website, 
	    		status: req.body.status
	    	});
	    	return res.successResponse(merchant, 200, null, true, "Merchant created successfully");
	    }else{
	    	return res.successResponse({msg: "Permission denied"}, 403, null, false, "Permission denied");
	    }
	},

	get: async function(req, res){
		const isAuthorized = await sails.helpers.authorizeUser.with
	    ({token: req.headers.authorization, "permission": "CREATE_PERMISSION"})
	    .intercept('tokenExpired', ()=>{
	      return res.successResponse({code:"tokenExpired"}, 403, null, false, "Permission denied. Token Expired.");
	    })
	    .intercept('invalidToken', ()=>{
	      return res.successResponse({code: "invalidToken"}, 403, null, false, "Permission denied");
	    }).intercept('dbError', ()=>{
	      return res.successResponse({code: "dbError"}, 500, null, false, "Some database error occured");
	    });
	    if(isAuthorized){
	    	var merchants = await Merchant.find();
	    	return res.successResponse(merchants, 200, null, true, "Merchants retrieved successfully");
	    }else{
	    	return res.successResponse({msg: "Permission denied"}, 403, null, false, "Permission denied");
	    }
	},

	delete: async function(req, res){
		const isAuthorized = await sails.helpers.authorizeUser.with
	    ({token: req.headers.authorization, "permission": "CREATE_PERMISSION"})
	    .intercept('tokenExpired', ()=>{
	      return res.successResponse({code:"tokenExpired"}, 403, null, false, "Permission denied. Token Expired.");
	    })
	    .intercept('invalidToken', ()=>{
	      return res.successResponse({code: "invalidToken"}, 403, null, false, "Permission denied");
	    }).intercept('dbError', ()=>{
	      return res.successResponse({code: "dbError"}, 500, null, false, "Some database error occured");
	    });
	    if(isAuthorized){
	    	var merchant = await Merchant.destroyOne({id: req.params.id});
	    	merchant['success'] = true;
	    	return res.successResponse(merchant, 200, null, true, "Merchant deleted successfully");
	    }else{
	    	return res.successResponse({msg: "Permission denied"}, 403, null, false, "Permission denied");
	    }
	},

	generateMerchantToken: async function(req, res){
		const isAuthorized = await sails.helpers.authorizeUser.with
	    ({token: req.headers.authorization, "permission": "CREATE_PERMISSION"})
	    .intercept('tokenExpired', ()=>{
	      return res.successResponse({code:"tokenExpired"}, 403, null, false, "Permission denied. Token Expired.");
	    })
	    .intercept('invalidToken', ()=>{
	      return res.successResponse({code: "invalidToken"}, 403, null, false, "Permission denied");
	    }).intercept('dbError', ()=>{
	      return res.successResponse({code: "dbError"}, 500, null, false, "Some database error occured");
	    });
	    if(isAuthorized){
	    	var passCode = await sails.helpers.randomStringGenerator();
	    	var merchant = await Merchant.updateOne({"id": req.body.mid}).set({"passcode": passCode});

	    	var merchantToken = await sails.helpers.jwt.with({payload:{"passCode": passCode, "mid": merchant.id, "website":merchant.website}, secretKey: sails.config.models.dataEncryptionKeys.merchantSecretKey});

	    	return res.successResponse({"mToken": merchantToken}, 200, null, true, "Merchant token generated successfully");
	    }else{
	    	return res.successResponse({msg: "Permission denied"}, 403, null, false, "Permission denied");
	    }
	},

	getPartners: async function(req, res){
		var isMerchantRequestValid = await sails.helpers.verifyMerchantReq.with({
			token: req.headers.authorization, 
			secretKey: sails.config.models.dataEncryptionKeys.merchantSecretKey,
			"req": req
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

	    if(isMerchantRequestValid){
	    	var bettingpartners = await BettingPartner.find({status: 'ACTIVE'}); 
	    	return res.successResponse(bettingpartners, 200, null, true, "Bettingpartners retrieved successfully");
	    }
	}
}