module.exports = {


  friendlyName: 'Jwt',


  description: 'Jwt something.',


  inputs: {
    payload:{
      type: "ref",
      required: true
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
    },
    expiryInSeconds:{
      type: "number",
      defaultsTo: 86400000,
      description: "Expiry time of token in seconds"
    }
  },


  exits: {
    success:{
    },
    invalidToken: {"description":"Provided token is invalid."},
    invalidPayload: {"description":"Supplied payload is invalid"}
  },


  fn: async function (inputs, exits) {
    var jwt = require('jsonwebtoken');
      var token = await jwt.sign(JSON.parse(JSON.stringify(inputs.payload)), 
        inputs.secretKey, {algorithm: inputs.algorithm, expiresIn: inputs.expiryInSeconds});
      return exits.success(token);
  }
};

