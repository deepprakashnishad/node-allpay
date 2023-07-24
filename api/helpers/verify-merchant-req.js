module.exports = {


  friendlyName: 'Verify Merchant Request',


  description: 'This helper can be used for verifying and decoding jwt token',


  inputs: {
    token:{
      type: "string"
    },
    algorithm:{
      type:"string",
      "defaultsTo": "HS256",
    },
    secretKey:{
      type:"string",
      defaultsTo: sails.config.models.dataEncryptionKeys.merchantSecretKey
    },
    isOperationSign:{
      type: "boolean",
      defaultsTo: true
    },
    req:{
      type: "json",
    },
    tokenOwnerType:{
      type: "string",
      defaultsTo: "merchant"
    }
  },


  exits: {
    success: {},
    tokenExpired: {"description":"Token is expired"},
    invalidToken: {"description":"Provided token is invalid."},
    passCodeMismatch: {"description": "Passcode mismatched"}
  },


  fn: async function (inputs, exits) {
    if(inputs.token){
      var req = inputs.req;

      var jwt = require('jsonwebtoken');
      token = inputs.token.split(" ");
      if(!token[1]){
        throw 'invalidToken';
        return;
      }
      try{
        var payload = jwt.verify(token[1], inputs.secretKey,{algorithm: inputs.algorithm});
        if(inputs.tokenOwnerType==='merchant'){
          var merchant = await Merchant.findOne({id: payload.mid});

          if(payload.passCode === merchant.passcode){
            return exits.success(merchant);
          }else{
            throw 'passCodeMismatch';
          }
        }else{
          var partner = await BettingPartner.findOne({id: payload.bpid});

          if(payload.passCode === partner.passcode){
            return exits.success(partner);
          }else{
            throw 'passCodeMismatch';
          }
        }
      }catch(err){
        if(err.name === 'TokenExpiredError'){
          throw 'tokenExpired';
        }else{
          throw 'invalidToken';
        }
        return;
      }
    }else{
      throw 'invalidToken';
      return;
    }
  }
};

