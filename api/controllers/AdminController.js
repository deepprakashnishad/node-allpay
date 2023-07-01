const {ObjectId} = require('mongodb');

module.exports = {

	approveRegistration: async function(req, res){
		const isAuthorized = await sails.helpers.authorizeUser.with
	    ({token: req.headers.authorization, "permission": "APPROVE_REGISTRATION"})
	    .tolerate(()=>false)
	    .intercept('tokenExpired', ()=>{
	      return res.successResponse({code:"tokenExpired"}, 403, null, false, "Permission denied. Token Expired.");
	    })
	    .intercept('invalidToken', ()=>{
	      return res.successResponse({code: "invalidToken"}, 403, null, false, "Permission denied");
	    }).intercept('dbError', ()=>{
	      return res.successResponse({code: "dbError"}, 500, null, false, "Some database error occured");
	    });

	    if(isAuthorized){
	    	if(!req.body.paidAmount || req.body.paidAmount < sails.config.custom.REGISTRATION_CHARGE){
	    		return res.successResponse({msg: `Min amount for registration is ${sails.config.custom.REGISTRATION_CHARGE}`}, 200, null, false, "Insufficient amount");	
	    	}

	    	var person = await Person.findOne({id: req.body.personId}).populate("p");
	    	var parent = await Person.findOne({id: person.p.id});
	    	var uplines = parent.ul;
	    	if(uplines===undefined){
	    		uplines = [];
	    	}
	    	uplines.push(ObjectId(person.p.id));

	   		if(uplines.length>sails.config.custom.DIST_PERCENT.length){
	   			uplines = uplines.splice(0, 1);
	   		}
	    	if(!person){
	    		return res.successResponse({msg: "Person id not found. Try again with other id."}, 403, null, false, "Person not found");
	    	}
	    	if(person.s!=="APPROVAL_PENDING"){
	    		return res.successResponse({msg: "Person is already registered"}, 403, null, false, "Person is already registered");
	    	}

	    	var client = Person.getDatastore().manager.client;
	    	var session = client.startSession();

	    	const transactionOptions = {
			    readPreference: 'primary',
			    readConcern: { level: 'local' },
			    writeConcern: { w: 'majority' }
			};

			var personId=ObjectId(person.id);
	      	var parentId = ObjectId(person.p.id);
	      	var ddl = parent.ddl;
	      	if(ddl===undefined){
	      		ddl = [personId];
	      	}else{
	      		ddl.push(personId);
	      	}

	      	var dist_amt = sails.config.custom.DIST_PERCENT.map(ele=>ele*sails.config.custom.REGISTRATION_CHARGE/100);

	      	var operations = [
	      		{
	      			updateOne: {
	      				filter: {"_id": personId},
	      				update: {
	      					"$set": {
					      		s: "ACTIVE",
					      		pamt: req.body.paidAmount,
					      		curr_orbit: 1,
					      		ul: uplines
					      	}
	      				}
	      			},
      			},
      			{
	      			updateOne: {
	      				filter: {"_id": parentId}, 
	      				update: {"$set": {
				      		"ddl": ddl
				      	},
	      			}},
	      		}
      		];

      		for(var i=uplines.length-1, k=0; i>=0; i--, k++){
      			operations.push({
      				updateOne: {
      					filter: {"_id": ObjectId(uplines[i])},
      					update: {
  							"$inc": {"tac": dist_amt[k], "aw": dist_amt[k]*0.78, "ts": 1, "acnl": dist_amt[k]*0.2, "dq": dist_amt[k]*0.02}
      					}
      				}
      			});

      			// var key = "lwdlc.".concat((k+1).toString());
				operations.push({
      				updateOne: {
      					filter: {"_id": ObjectId(uplines[i])},
      					update: {
  							"$inc": {[`lwdlc.${k+1}.count`]: 1, [`lwdlc.${k+1}.1`]: 1}
      					}
      				}
      			});      			
      		}

		  	try {
			    await session.withTransaction(async () => {
			      	const personColl = Person.getDatastore().manager.collection(Person.tableName);
			      	// Important:: You must pass the session to the operations
			      	
			      	var result = await personColl.bulkWrite(operations, {ordered: true}, {session});

			    }, transactionOptions);   
			}
			finally {
			    await session.endSession();
			}

	    	res.successResponse(person, 200, null, true, "Update success");
	    	
	    }else{
	    	return res.successResponse({msg: "Permission denied"}, 403, null, false, "Permission denied");
	    }
	},

	approveWithdrawlReq: async function(req, res){
		const isAuthorized = await sails.helpers.authorizeUser.with
	    ({token: req.headers.authorization, "permission": "APPROVE_WITHDRAWL_REQUEST"})
	    .tolerate(()=>false)
	    .intercept('tokenExpired', ()=>{
	      return res.successResponse({code:"tokenExpired"}, 403, null, false, "Permission denied. Token Expired.");
	    })
	    .intercept('invalidToken', ()=>{
	      return res.successResponse({code: "invalidToken"}, 403, null, false, "Permission denied");
	    }).intercept('dbError', ()=>{
	      return res.successResponse({code: "dbError"}, 500, null, false, "Some database error occured");
	    });

	    if(isAuthorized){

	    }else{
	    	return res.successResponse({msg: "Permission denied"}, 403, null, false, "Permission denied");
	    }
	},

	nextOrbitActivation: async function(req, res){
		const isAuthorized = await sails.helpers.authorizeUser.with
	    ({token: req.headers.authorization, "permission": "APPROVE_REGISTRATION"})
	    .tolerate(()=>false)
	    .intercept('tokenExpired', ()=>{
	      return res.successResponse({code:"tokenExpired"}, 403, null, false, "Permission denied. Token Expired.");
	    })
	    .intercept('invalidToken', ()=>{
	      return res.successResponse({code: "invalidToken"}, 403, null, false, "Permission denied");
	    }).intercept('dbError', ()=>{
	      return res.successResponse({code: "dbError"}, 500, null, false, "Some database error occured");
	    });

	    if(isAuthorized){

			var person = await Person.findOne({id: req.body.personId}).populate("p");
			var uplines = person.ul;
			var curr_orbit = person.curr_orbit;
			if(!person){
	    		return res.successResponse({msg: "Person id not found. Try again with other id."}, 403, null, false, "Person not found");
	    	}
			var reqdActivationAmount = sails.config.custom.REGISTRATION_CHARGE*(2**person.curr_orbit); 
	    	if(!req.body.paidAmount || 
	    		req.body.paidAmount < reqdActivationAmount){
	    		return res.successResponse({
	    			msg: `Min amount for level${person.curr_orbit+1} is ${reqdActivationAmount}`}, 
	    			200, null, false, "Insufficient amount"
    			);	
	    	}
	    	var client = Person.getDatastore().manager.client;
	    	var session = client.startSession();

	    	const transactionOptions = {
			    readPreference: 'primary',
			    readConcern: { level: 'local' },
			    writeConcern: { w: 'majority' }
			};

	      	var dist_amt = sails.config.custom.DIST_PERCENT.map(ele=>ele*reqdActivationAmount/100);

	      	var operations = [
	      		{
	      			updateOne: {
	      				filter: {"_id": ObjectId(person.id)},
	      				update: {
	      					"$inc": {
					      		pamt: req.body.paidAmount,
					      		curr_orbit: 1,
					      	}
	      				}
	      			},
      			}
      		];

	      	//Next orbit activation function
	      	// Updating uplines earning and levelwise downline count in each orbit

      		for(var i=uplines.length-1, k=0; i>=0; i--, k++){
  				operations.push({
      				updateOne: {
      					filter: {"_id": ObjectId(uplines[i].id), "curr_orbit": {"$gt": curr_orbit}},
      					update: {
  							"$inc": {"tac": dist_amt[k], "aw": dist_amt[k]*0.78, "acnl": dist_amt[k]*0.2, "dq": dist_amt[k]*0.02}
      					}
      				}
      			});

				operations.push({
      				updateOne: {
      					filter: {"_id": ObjectId(uplines[i].id)},
      					update: {
  							"$inc": {
  								[`lwdlc.${k+1}.${curr_orbit+1}`]: 1,
  								[`lwdlc.${k+1}.${curr_orbit}`]: -1
  							},
      					}
      				}
      			});      			
      		}

		  	try {
			    await session.withTransaction(async () => {
			      	const personColl = Person.getDatastore().manager.collection(Person.tableName);
			      	// Important:: You must pass the session to the operations
			      	
			      	var result = await personColl.bulkWrite(operations, {ordered: true}, {session});
			    }, transactionOptions);
			    
			} finally {
			    await session.endSession();
			}

	    	res.successResponse(person, 200, null, true, "Update success");
	    	
	    }else{
	    	return res.successResponse({msg: "Permission denied"}, 403, null, false, "Permission denied");
	    }
	},

	distributeGlobalCommission: async function(req, res) {

		var currDate = new Date();

		currDate = `${currDate.getDate()-1}/${currDate.getMonth() + 1}/${currDate.getFullYear()}`;

		var globalEarning = await GlobalEarning.findOne({'ged': currDate, 'ds': "p"});

		var total_collection = globalEarning.tc;

	 	const personColl = Person.getDatastore().manager.collection(Person.tableName);

	 	/*var persons = personColl.aggregate([
	 		{
	 			"$match": {"s": "ACTIVE"}
	 		},
			  {
			    "$group": {
			      "_id": "$pf",
			      "personIds": {
			        "$push": {"$toString": "$_id"}
			      }
			    }
			  }
		]);

		var person_group = {};

		for await (var person of persons){
			person_group[person._id] = person.personIds;
		}*/

	 	var aggCursor = personColl.aggregate([
	 		{
	 			"$match": {"s": "ACTIVE"}
	 		},
	 		{
		 		"$group": {
		 			_id: "$pf",

		 			count: {
		 				$count: {}
		 			}
	 			}
	 	}]);

	 	// await GlobalEarning.updateOne({"id": globalEarning.id}).set({"s": "d"});

	 	for await (const doc of aggCursor) {
		    if(doc._id==="s"){
		    	var silverAmt = (total_collection*sails.config.custom.SILVER_PERCENT)/doc.count;

		    	await personColl.updateMany(
		    		{"s": "ACTIVE", "curr_orbit": {"$gt": 0}, "pf": "s"}, 
		    		{"$inc": {"tac": silverAmt, "aw": silverAmt}}
		    	);
		    }
		    if(doc._id==="g"){
		    	var goldAmt = (total_collection*sails.config.custom.GOLD_PERCENT)/doc.count;
		    	await personColl.updateMany(
		    		{"s": "ACTIVE", "curr_orbit": {"$gt": 0}, "pf": "g"}, 
		    		{"$inc": {"tac": goldAmt, "aw": goldAmt}}
		    	);
		    }
		    if(doc._id==="d"){
		    	var diamondAmt = (total_collection*sails.config.custom.DIAMOND_PERCENT)/doc.count;
		    	await personColl.updateMany(
		    		{"s": "ACTIVE", "curr_orbit": {"$gt": 0}, "pf": "d"}, 
		    		{"$inc": {"tac": diamondAmt, "aw": diamondAmt}}
		    	);
		    }
		    if(doc._id==="p"){
		    	var platinumAmt = (total_collection*sails.config.custom.PLATINUM_PERCENT)/doc.count;
		    	await personColl.updateMany(
		    		{"s": "ACTIVE", "curr_orbit": {"$gt": 0}, "pf": "p"}, 
		    		{"$inc": {"tac": platinumAmt, "aw": platinumAmt}}
		    	);
		    }
		}

		await GlobalEarning.update({'ged': currDate}).set({
			"ds": "d", 
			// "dpd": person_group, 
			"dad":{ "s": silverAmt, "g": goldAmt, "d": diamondAmt, "p": platinumAmt}
		}); 
	 	res.successResponse({msg: "result"}, 200, null, true, "Update success");
	}
}