 /**
 * RoleController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  create: async function (req, res) {
    const isAuthorized = await sails.helpers.authorizeUser.with
    ({token: req.headers.authorization, "permission": "CREATE_ROLE"})
    .intercept('tokenExpired', ()=>{
      return res.successResponse({code:"tokenExpired"}, 403, null, false, "Permission denied. Token Expired.");
    })
    .intercept('invalidToken', ()=>{
      return res.successResponse({code: "invalidToken"}, 403, null, false, "Permission denied");
    }).intercept('dbError', ()=>{
      return res.successResponse({code: "dbError"}, 500, null, false, "Some database error occured");
    });
    if(isAuthorized){
      try{
      		req.body.name = req.body.name.toUpperCase();
          let role = await Role.create(req.body).fetch();
          return res.successResponse(role, 201, null, true, "Role created successfully");
      }catch(err){
        switch(err.code){
          case 'UsageError': return res.badRequest(err);
            break;
          case 'E_UNIQUE': return res.successResponse({msg: "Unique constraint voilated"}, 400, null, false, "Unique constraint voilated");
          default: {
            throw err;
          }
        }
      }
    }else{
      return res.successResponse({msg: "Permission denied"}, 403, null, false, "Permission denied");
    }
  },

  update: async function (req, res) {
    const isAuthorized = await sails.helpers.authorizeUser.with(
      {token: req.headers.authorization, "permission": "UPDATE_ROLE"})
    .intercept('tokenExpired', ()=>{
      return res.successResponse({code:"tokenExpired"}, 403, null, false, "Permission denied. Token Expired.");
    })
    .intercept('invalidToken', ()=>{
      return res.successResponse({code: "invalidToken"}, 403, null, false, "Permission denied");
    }).intercept('dbError', ()=>{
      return res.successResponse({code: "dbError"}, 500, null, false, "Some database error occured");
    });
    if(isAuthorized){
      try{
      	req.body.name = req.body.name.toUpperCase();
        let role = await Role.update({id: req.body.id}, req.body).fetch();
        return res.successResponse(role, 200, null, true, "Role updated successfully");
      }catch(err){
        switch(err){
          case 'UsageError': return res.badRequest(err);
            break;
          default: {
            throw err;
          }
        }
      }
    }else{
      return res.successResponse({msg: "Permission denied"}, 403, null, false, "Permission denied");
    }
  },

  updateRolePermissions: async function(req, res){
    const isAuthorized = await sails.helpers.authorizeUser.with(
      {token: req.headers.authorization, "permission": "UPDATE_ROLE"})
    .intercept('tokenExpired', ()=>{
      return res.successResponse({code:"tokenExpired"}, 403, null, false, "Permission denied. Token Expired.");
    })
    .intercept('invalidToken', ()=>{
      return res.successResponse({code: "invalidToken"}, 403, null, false, "Permission denied");
    }).intercept('dbError', ()=>{
      return res.successResponse({code: "dbError"}, 500, null, false, "Some database error occured");
    });
    if(isAuthorized){
      try{
        let permissionIds = [];
        for(let i=0; i< req.body.permissions.length;i++){
          permissionIds.push(req.body.permissions[i].id);
        }
        await Role.replaceCollection(req.body.id, "permissions").members(permissionIds);
        let role = await Role.findOne({"id": req.body.id}).populate("permissions");
        return res.successResponse(role, 200, null, true, "Role updated successfully");
      }catch(err){
        switch(err){
          case 'UsageError': return res.badRequest(err);
            break;
          default: {
            throw err;
          }
        }
      }
    }else{
      return res.successResponse({msg: "Permission denied"}, 403, null, false, "Permission denied");
    }
  },

  delete: async function (req, res) {
    const isAuthorized = await sails.helpers.authorizeUser.with(
      {token: req.headers.authorization, "permission": "DELETE_ROLE"})
    .intercept('tokenExpired', ()=>{
      return res.successResponse({code:"tokenExpired"}, 403, null, false, "Permission denied. Token Expired.");
    })
    .intercept('invalidToken', ()=>{
      return res.successResponse({code: "invalidToken"}, 403, null, false, "Permission denied");
    }).intercept('dbError', ()=>{
      return res.successResponse({code: "dbError"}, 500, null, false, "Some database error occured");
    });
    if(isAuthorized){
      try{
          let role = await Role.destroy({id: req.params.id}).fetch();
        return res.successResponse(role, 200, null, true, "Role deleted successfully");
      }catch(err){
        switch(err){
          case 'UsageError': return res.badRequest(err);
            break;
          default: {
            throw err;
          }
        }
      }
    }else{
      return res.successResponse({msg: "Permission denied"}, 403, null, false, "Permission denied");
    }
  },

  get: async function (req, res) {
    if(req.query){
    var roles = await Role.find(req.query).populate("permissions");       
    }else{
      var roles = await Role.find().populate("permissions");      
    }
  return res.successResponse(roles, 200, null, true, '${roles.size()} roles are found.');
  }
};

