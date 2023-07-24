const {ObjectId} = require('mongodb');

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
	    	var paymentgateway = await PaymentGateway.create({
	    		name: req.body.name, 
	    		website: req.body.website, 
	    		status: req.body.status
	    	}).fetch();
	    	return res.successResponse(paymentgateway, 201, null, true, "Paymentgateway created successfully");
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
	    	var paymentgateway = await PaymentGateway.updateOne({"id": req.body.id}).set({
	    		name: req.body.name, 
	    		website: req.body.website, 
	    		status: req.body.status
	    	});
	    	return res.successResponse(paymentgateway, 200, null, true, "Paymentgateway created successfully");
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
	    	var paymentgateways = await PaymentGateway.find();
	    	return res.successResponse(paymentgateways, 200, null, true, "Paymentgateways retrieved successfully");
	    }else{
	    	return res.successResponse({msg: "Permission denied"}, 403, null, false, "Permission denied");
	    }
	},

	delete: async function(req, res){
		console.log("Hello delete");
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
	    	var paymentgateway = await PaymentGateway.destroyOne({id: req.params.id});
	    	paymentgateway['success'] = true;
	    	return res.successResponse(paymentgateway, 200, null, true, "Paymentgateway deleted successfully");
	    }else{
	    	return res.successResponse({msg: "Permission denied"}, 403, null, false, "Permission denied");
	    }
	},

	availablePGM: async function(req, res){
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

		var paymentGatewayList = await MerchantPG.find({select: ["m", "pg", "status", "priority"], where: {status: "ACTIVE"}})
									.populate("m")
									.populate("pg").sort({priority: 1});

		var m = paymentGatewayList[0]["m"];
		var pg = paymentGatewayList[0]["pg"];

		var encodedUrl = encodeURIComponent(`mid=${m['id']}&pg=${pg['name']}&pgid=${pg['id']}&amount={amount}&pbid=${bettingPartner['bpid']}&partner_orderid={poid}&partner_uid={userid}&prod_desc={desc}&username={username}&userphone={phone}&useremail={email}&extra_info_json={extra_info}`);

		var mLink = `${paymentGatewayList[0]['m']['website']}?${encodedUrl}`
		return res.successResponse({link: mLink}, 200, null, true, "Link retrieved successfully");
	},

	initializePGM: async function(req, res){
		var merchants = await Merchant.find();
		var pgs = await PaymentGateway.find();

		const merchantPGColl = MerchantPG.getDatastore().manager.collection(MerchantPG.tableName);
		for(var i=0;i<merchants.length;i++){
			for(var j=0;j<pgs.length;j++){
				await merchantPGColl.updateOne({
					m: ObjectId(merchants[i].id), 
					pg: ObjectId(pgs[j].id)
				}, 
				{$set: {priority: 0, dcoll: 0, wcoll: 0,mcoll: 0,dTrans: 0,wTrans: 0, mTrans: 0, status: "ACTIVE"}},
				{upsert: true})
			}
		}

		return res.successResponse({}, 200, null, true, "PGM initialized successfully");
	},

	redirectToPayment: async function(req, res){
		var paymentGatewayList = await MerchantPG.find(
			{
				select: ["m", "pg", "status", "priority"], 
				where: {status: "ACTIVE"},
				sort: 'priority ASC'
			}
		)
		.populate("m")
		.populate("pg").sort({priority: 1});

		return res.redirect(302, paymentGatewayList[0]['m'].website);
	}
}