const {ObjectId} = require('mongodb');

module.exports = {


  friendlyName: 'Authorize user',


  description: '',


  inputs: {
    personId:{ 
      type:"string",
      required: true
    },
    approverId:{
      type: "string"
    },
    isPaidApproval: {
      type: "boolean",
      defaultsTo: false
    },
    amount: {
      type: "number",
      required: true
    }
  },


  exits: {
    success: {},
    person_not_found: {"success": false, "msg": "Person not found"},
    approver_not_found: {"success": false, "msg": "Approver not found"},
    already_registered: {"success": false, "msg": "Person already registered"},
    insufficient_balance: {"success": false, "msg":"Insufficient Balance", "description": "Insufficient Balance."},
    invalid_amount: {"success": false, "msg": "Invalid amount"},
    dbError: {success: false, "msg": "Some database error occured"}
  },


  fn: async function (inputs, exits) {    

    var joiningAmount = sails.config.custom.REGISTRATION_CHARGE;
    var donationAmount = sails.config.custom.DONATION_PERCENT_OF_PAID_AMOUNT * joiningAmount;

    if((joiningAmount + donationAmount) !== inputs.amount){
      throw "invalid_amount";
    }

    var person = await Person.findOne({id: inputs.personId}).populate("p");
    if(!person){
      throw "person_not_found";
    }

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
      throw "already_registered";
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

      var dist_amt = sails.config.custom.DIST_PERCENT.map(ele=>ele*joiningAmount/100);

      var operations = [];

    try {
      await session.withTransaction(async () => {
          const personColl = Person.getDatastore().manager.collection(Person.tableName);
          const approvalLogCollection = ApprovalLog.getDatastore().manager.collection(ApprovalLog.tableName);
          const globalEarningColl = GlobalEarning.getDatastore().manager.collection(GlobalEarning.tableName);
          // Important:: You must pass the session to the operations

          if(inputs.isPaidApproval){

          }
          else if(!inputs.isPaidApproval && inputs.approverId){
            var result = await personColl.updateOne({
              "_id": ObjectId(inputs.approverId)}, 
              {"$inc": {"aw": -1*Math.abs(inputs.amount), "taw": Math.abs(inputs.amount)}}, 
              {session}
            );

            if(result['modifiedCount']===0){
              return exits.success(false);
            }
            await approvalLogCollection.insertOne({p: inputs.personId, a: inputs.approverId}, {session});
          }else if(!inputs.isPaidApproval && !inputs.approverId){
            throw "approver_not_found";
          }

          await personColl.updateOne({"_id": personId}, {
            "$set": {
              s: "ACTIVE",
              pamt: inputs.amount,
              curr_orbit: 1,
              ul: uplines,
              dq: donationAmount
            }
          }, {session});

          await personColl.updateOne({"_id": parentId}, 
            {
              "$set": {"ddl": ddl},
              "$inc": {"team.s": 1}
            }, {session});

          for(var i=uplines.length-1, k=0; i>=0; i--, k++){
            await personColl.updateOne({"_id": ObjectId(uplines[i])}, {
                "$inc": {
                  "tac": dist_amt[k], 
                  "aw": dist_amt[k]*0.8, 
                  "ts": 1, 
                  "acnl": dist_amt[k]*0.18, 
                  "dq": dist_amt[k]*0.02
                }
              }, {session}
            );
            
            await personColl.updateOne({"_id": ObjectId(uplines[i])}, {
                "$inc": {[`lwdlc.${k+1}.count`]: 1, [`lwdlc.${k+1}.1`]: 1}
                }, {session});
          }

          var currDate = new Date();
          await globalEarningColl.updateOne(
            {"ged": `${currDate.getDate()}/${currDate.getMonth()+1}/${currDate.getFullYear()}`},
            {
              "$inc": {
                "tc": joiningAmount*sails.config.custom.GLOBAL_COMMISSION/100,
                "dc.new_joining": joiningAmount*sails.config.custom.GLOBAL_COMMISSION/100
              }
            },
            {"upsert": true},
            {session}
          );
      }, transactionOptions);   
      return exits.success(true);
    } catch(e){
      console.log(e);
      throw "dbError";
    }
    finally {
        await session.endSession();
    }
  }
};

