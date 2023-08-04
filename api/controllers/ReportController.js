const {ObjectId} = require('mongodb');

module.exports = {

  getTransactions: async function(req, res){
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
        $addFields: {
          creationDate: { $toDate: "$createdAt" }
        }
      },
      {
        $addFields: {
          creationDate: {$dateToString: {"format": "%d-%m-%Y %H:%M:%S", "date": "$creationDate"}}
        }
      },
      {
        $lookup:{
            from: "merchant",       // other table name
            localField: "m",   // name of users table field
            foreignField: "_id", // name of userinfo table field
            as: "m"         // alias for userinfo table
        }
      },
      {   $unwind:"$m" }, 
      {
        $lookup:{
            from: "bettingpartner",       // other table name
            localField: "bp",   // name of users table field
            foreignField: "_id", // name of userinfo table field
            as: "bp"         // alias for userinfo table
        }
      },
      {   $unwind:"$bp" }, 
      {
        $project: {
          _id: 1,
          "bp._id": 1,
          "bp.name": 1,
          poid: 1,
          puid: 1,
          pud: 1,
          pd: 1,
          "m._id": 1,
          "m.name": 1,
          a: 1,
          pg: 1,
          pm: 1,
          ei: 1,
          c: 1,
          s: 1
        }
      }
    ]).toArray(async(err, results)=>{
      if(err){
        return res.serverError(err);
      }  
      return res.successResponse({txns: results}, 200, null, true, "Transactions fetched successfully");
    });
  },

  getDailyTransactionReport: async function (req, res) {
    payload = await sails.helpers.verifyJwt.with({token: req.headers.authorization})
    .tolerate(()=>{});

    if(!payload){
      return res.successResponse({code: "invalidToken"}, 403, null, false, "Permission denied"); 
    }

    var start = req.query.start;
    var end =req.query.end;

    var period = "daily";
    var format = "%d-%m-%Y";
    if(req.query.period){
      period = req.query.period;
    }

    if(period==="weekly"){
      format = "%V-%Y";
    }else if(period==="monthly"){
      format = "%m-%Y";
    }else if(period==="yearly"){
      format = "%Y";
    }

    const transColl = Transaction.getDatastore().manager.collection(Transaction.tableName);

    await transColl.aggregate([
      {
        $addFields: {
          creationDate: { $toDate: "$createdAt" }
        }
      },
      {
        $addFields: {
          creationDate: {$dateToString: {"format": format, "date": "$creationDate"}}
        }
      },
      {
        $group:{
          "_id": "$creationDate",
          "amt": {"$sum": "$a"},
          "cnt": {"$sum": 1},
        }
      },
      {$sort: {"_id": 1}}
    ]).toArray(async(err, results)=>{
      if(err){
        return res.serverError(err);
      }  
      return res.successResponse({txns: results}, 200, null, true, "Transactions fetched successfully");
    });
  },

  getMerchantPGSummary: async function(req, res){
    payload = await sails.helpers.verifyJwt.with({token: req.headers.authorization})
    .tolerate(()=>{});

    if(!payload){
      return res.successResponse({code: "invalidToken"}, 403, null, false, "Permission denied"); 
    }

    var result = await MerchantPG.find().populate("m").populate("pg");
    return res.successResponse({txns: result}, 200, null, true, "Summary fetched successfully");
  }
}