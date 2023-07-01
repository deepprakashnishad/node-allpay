const {ObjectId} = require('mongodb');

module.exports = {
  getDailyTransactionReport: async function (req, res) {
    payload = await sails.helpers.verifyJwt.with({token: req.headers.authorization})
    .tolerate(()=>{});

    if(!payload){
      return res.successResponse({code: "invalidToken"}, 403, null, false, "Permission denied"); 
    }

    var start = req.query.start;
    var end =req.query.end;
    const transColl = Transaction.getDatastore().manager.collection(Transaction.tableName);

    await transColl.aggregate([
      {
        "$match": {
          "p": ObjectId(payload.uid),
          "_id": {"$gte": await sails.helpers.objectidFromTimestamp.with({"mDate": start})},
          "_id": {"$lt": await sails.helpers.objectidFromTimestamp.with({"mDate": end})},
        }
      }
    ]).toArray(async(err, results)=>{
      if(err){
        return res.serverError(err);
      }  
      return res.successResponse(results, 200, null, true, "Transactions fetched successfully");
    });
  },

  getGlobalEarningReport: async function(req, res) {
    payload = await sails.helpers.verifyJwt.with({token: req.headers.authorization})
    .tolerate(()=>{});

    if(!payload){
      return res.successResponse({code: "invalidToken"}, 403, null, false, "Permission denied"); 
    }
    
    var results = await GlobalEarning.find({ged: req.query.mDate});
    return res.successResponse(results, 200, null, true, "Transactions fetched successfully");
  }

}