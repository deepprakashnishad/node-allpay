module.exports = {


  friendlyName: 'Authorize user',


  description: '',


  inputs: {
    personId:{ 
      type:"string",
      required: true
    },
    approverId:{
      type: "string",
      required: true
    },
    amount: {
      type: number,
      required: true
    }
  },


  exits: {
    success: {},
    Insufficient balance: {"success": false, "msg":"Insufficient Balance", "description": "Insufficient Balance."},
    dbError: {success: false, "msg": "Some database error occured"}
  },


  fn: async function (inputs, exits) {
    if(inputs.token){
      var person = await Person.findOne({id: inputs.personId}).populate("p");
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
          return exits.success(false);
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
                "$inc": {"tac": dist_amt[k], "aw": dist_amt[k]*0.8, "ts": 1, "acnl": dist_amt[k]*0.2}
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
    }else{
      return exits.success(false);
    }
  }
};

