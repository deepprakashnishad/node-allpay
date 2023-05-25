module.exports = {


  friendlyName: 'GoogleRecaptchaVerifier',


  description: 'Verify google recaptcha token',

  inputs: {
    token:{
      type: "string",
      required: true
    },
    clientIP:{
    	type: "string"
    }
  },


  exits: {
    success:{
    },
  },


  fn: async function (inputs, exits) {
    var axios = require('axios');
    data = {
    	"secret": sails.config.custom.GOOGLE_RECAPTCHA_KEY,
    	"response": inputs.token
    }

    if(inputs.clientIP){
    	data['remoteip'] = inputs.clientIP;
    }
    try{
      var response = await axios.post("https://www.google.com/recaptcha/api/siteverify", data);
      return exists.success(response.data);
    }catch(e){
      console.log(e);
      return exits.success(false);
    }
  }
};