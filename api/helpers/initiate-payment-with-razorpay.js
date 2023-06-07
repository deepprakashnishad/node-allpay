module.exports = {


  friendlyName: 'Initiate transaction with paytm',


  description: '',


  inputs: {
    orderId:{ 
      type:"string",
      required: true
    },
    currency: {
      type: "string",
      defaultsTo: "INR"
    },
    amount:{
      type: "number",
      required: true
    },
  },


  exits: {
    success: {},
    invalidToken: {"description":"Provided token is invalid."},
    tokenExpired: {"description": "Permission denied. Token Expired."},
    authorizationFailed: {"success": false, "msg":"Permission denied", "description": "Unauthorized access attempted."},
    dbError: {success: false, "msg": "Some database error occured"}
  },


  fn: async function (inputs, exits) {
    if(inputs.orderId){
      try{
        const axios = require('axios');
        var data = {
          "receipt": inputs.orderId,
          "amount": inputs.amount*100,
          "currency": inputs.currency,
        };

        var options = {
          auth: {
            username: sails.config.custom.RAZORPAY.keyId,
            password: sails.config.custom.RAZORPAY.keySecret
          },
          headers: {
            'Content-Type': 'application/json',
          }
        };

        var result = await axios.post(sails.config.custom.RAZORPAY.url.createOrder, data, options);

        console.log(result.data);
        result.data['amount'] = result.data['amount']/100;
        result.data['amount_due'] = result.data['amount_due']/100;
        return exits.success(result.data);
      }catch(err){
        console.log(err);
      }
      return exits.success(false);
    }else{
      return exits.success(false);
    }
  }
};
