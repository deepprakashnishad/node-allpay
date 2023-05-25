/**
 * PermissionController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  create: async function (req, res) {
    const isAuthorized = await sails.helpers.authorizeUser.with
    ({token: req.headers.authorization, "permission": "CREATE_PERMISSION"})
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
          let permission = await Permission.create(req.body).fetch();
          //Log to activity log table
          sails.helpers.activityLogger.with({
              token: req.headers.authorization,
              entityAffected: Permission.tableName,
              actionType: 'CREATE',
              newValue: permission
            }).tolerate(()=>{
              console.log("Failed to log activity");
            }).then((result)=>{
              if(result){
                console.log("Activity logged successfully");
              }else{
                console.log("Failed to log activity");
              }
            });
          return res.successResponse(permission, 201, null, true, "Permission created successfully");
      }catch(err){
        switch(err.code){
          case 'UsageError': return res.badRequest(err);
            break;
          case 'E_UNIQUE': return res.successResponse({code:err.code, msg: "Unique constraint voilated"}, 400, null, false, "Permission already exists");
          default: {
            throw err;
          }
        }
      }
    }else{
      return res.successResponse({msg: "Permission denied"}, 403, null, false, "Permission denied");
    }
  },

  /**
   * `ClassroomSyllabusController.update()`
   */
  update: async function (req, res) {
    const isAuthorized = await sails.helpers.authorizeUser.with(
      {token: req.headers.authorization, "permission": "UPDATE_PERMISSION"})
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
        var oldPermission = await Permission.findOne({id: req.body.id});
        let permission = await Permission.update({id: req.body.id}, req.body).fetch();
        //Log to activity log table
        sails.helpers.activityLogger.with({
            token: req.headers.authorization,
            entityAffected: Permission.tableName,
            actionType: 'UPDATE',
            newValue: permission,
            oldValue: oldPermission
          }).tolerate(()=>{
            console.log("Failed to log activity");
          }).then((result)=>{
            if(result){
              console.log("Activity logged successfully");
            }else{
              console.log("Failed to log activity");
            }
          });
        return res.successResponse(permission, 200, null, true, "Permission updated successfully");
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

  /**
   * `ClassroomSyllabusController.delete()`
   */
  delete: async function (req, res) {
    const isAuthorized = await sails.helpers.authorizeUser.with(
      {token: req.headers.authorization, "permission": "DELETE_PERMISSION"})
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
        let permission = await Permission.destroy({id: req.params.id}).fetch();
        //Log to activity log table
        sails.helpers.activityLogger.with({
          token: req.headers.authorization,
          entityAffected: Permission.tableName,
          actionType: 'DELETE',
          oldValue: permission
        }).tolerate(()=>{
          console.log("Failed to log activity");
        }).then((result)=>{
          if(result){
            console.log("Activity logged successfully");
          }else{
            console.log("Failed to log activity");
          }
        });
        return res.successResponse(permission, 200, null, true, "Permission deleted successfully");
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

  /**
   * `ClassroomSyllabusController.get()`
   */
  get: async function (req, res) {
    if(req.query){
    var permissions = await Permission.find(req.query);       
    }else{
      var permissions = await Permission.find();      
    }
  return res.successResponse(permissions, 200, null, true, '${permissions.size()} permissions are found.');
  }
};

