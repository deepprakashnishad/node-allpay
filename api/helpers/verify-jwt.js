module.exports = {


  friendlyName: 'Verify jwt',


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
      defaultsTo: sails.config.models.dataEncryptionKeys.jwtSecretKey
    },
    isOperationSign:{
      type: "boolean",
      defaultsTo: true
    }
  },


  exits: {
    success: {},
    tokenExpired: {"description":"Token is expired"},
    invalidToken: {"description":"Provided token is invalid."},
  },


  fn: async function (inputs, exits) {
    if(inputs.token){
      var jwt = require('jsonwebtoken');
      token = inputs.token.split(" ");
      if(!token[1]){
        throw 'invalidToken';
        return;
      }
      try{
        var payload = jwt.verify(token[1], inputs.secretKey,{algorithm: inputs.algorithm});
        return exits.success(payload);
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

