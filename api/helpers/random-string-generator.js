module.exports = {


  friendlyName: 'Random String Generator',


  description: 'Random String Generator',


  inputs: {
    len:{
      type: "number",
      defaultsTo: 24
    },
    stringType:{
      type:"string",
      "defaultsTo": "alphanumeric",
    }
  },


  exits: {
    success:{
    }
  },


  fn: async function (inputs, exits) {
    var charSet = '0123456789';
    if(inputs.stringType==="alphanumeric"){
      charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    } else if(inputs.charSet === "alphabets"){
      charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    }

    let result = '';
    const charactersLength = charSet.length;
    for ( let i = 0; i < inputs.len; i++ ) {
        result += charSet.charAt(Math.floor(Math.random() * charactersLength));
    }

    exits.success(result);
  }
};

