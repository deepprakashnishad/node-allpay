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
	    	var merchant = await Merchant.destroyOne({id: req.params.id});
	    	merchant['success'] = true;
	    	return res.successResponse(merchant, 200, null, true, "Merchant deleted successfully");
	    }else{
	    	return res.successResponse({msg: "Permission denied"}, 403, null, false, "Permission denied");
	    }
	},
}