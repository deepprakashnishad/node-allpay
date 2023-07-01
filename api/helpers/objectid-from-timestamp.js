const {ObjectId} = require('mongodb');


module.exports = {


  friendlyName: 'Object id from timestamp',


  description: '',


  inputs: {
    mDate:{ 
      type:"string",
      required: true
    }
  },


  exits: {
    success: {},
    invalidDate: {"description":"Provided date is invalid."},
  },


  fn: async function (inputs, exits) {
    if(inputs.mDate){
      var timestamp = inputs.mDate;
      try{
        /* Convert string date to Date object (otherwise assume timestamp is a date) */
        if (typeof(timestamp) == 'string') {
            timestamp = new Date(timestamp);
        }

        /* Convert date object to hex seconds since Unix epoch */
        var hexSeconds = Math.floor(timestamp/1000).toString(16);

        /* Create an ObjectId with that hex timestamp */
        var constructedObjectId = ObjectId(hexSeconds + "0000000000000000");
        return exits.success(constructedObjectId);
      }catch(err){
        console.log(err);
        return exits.success(false);
      }
    }else{
      return exits.success(false);
    }
  }
};
