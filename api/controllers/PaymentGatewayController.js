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
}