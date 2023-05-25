module.exports = {


  friendlyName: 'Authorize user',


  description: '',


  inputs: {
    token:{ 
      type:"ref"
    },
    permission:{
      type: "string",
      required: true
    }
  },


  exits: {
    success: {},
    invalidToken: {"description":"Provided token is invalid."},
    tokenExpired: {"description": "Permission denied. Token Expired."},
    authorizationFailed: {"success": false, "msg":"Permission denied", "description": "Unauthorized access attempted."},
    dbError: {success: false, "msg": "Some database error occured"}
  },


  fn: async function (inputs, exits) {
    if(inputs.token){
      payload = await sails.helpers.verifyJwt.with({token: inputs.token})
                .intercept('invalidToken', ()=>'invalidToken')
                .intercept('tokenExpired', ()=>'tokenExpired');
      try{
        var user = await Person.findOne({id: payload.uid}).populate("permissions");
        let reqdPermissionList = inputs.permission.split(",");
        reqdPermissionList = reqdPermissionList.map(val => val.trim());
        let userPermissions = user.permissions.map(val => val.permission);
        var result = reqdPermissionList.every(val => userPermissions.indexOf(val)>=0);
        return exits.success(result);
      }catch(err){
        // throw 'invalidToken';
      }
      return exits.success(false);
    }else{
      return exits.success(false);
    }
  }
};

