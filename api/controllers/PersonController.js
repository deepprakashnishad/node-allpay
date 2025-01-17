const {ObjectId} = require('mongodb');

module.exports = {
  /**
   * `PersonController.create()`
   */
  create: async function (req, res) {
    const isAuthorized = await sails.helpers.authorizeUser.with
    ({token: req.headers.authorization, "permission": "CREATE_PERSON"})
    .tolerate(()=>false)
    .intercept('tokenExpired', ()=>{
      return res.successResponse({code:"tokenExpired"}, 403, null, false, "Permission denied. Token Expired.");
    })
    .intercept('invalidToken', ()=>{
      return res.successResponse({code: "invalidToken"}, 403, null, false, "Permission denied");
    }).intercept('dbError', ()=>{
      return res.successResponse({code: "dbError"}, 500, null, false, "Some database error occured");
    });;

    if (isAuthorized) {
      console.log(req.body);
      if(req.body.r===undefined || req.body.r===null || req.body.r==={}){
        req.body.r="ADMIN";
      }
      var auth = req.headers.authorization;
      /*if (auth) {
        var tmp = auth.split(' ');   // Split on a space, the original auth looks like  "Basic Y2hhcmxlczoxMjM0NQ==" and we need the 2nd part

        var buf = new Buffer(tmp[1], 'base64'); // create a buffer and tell it the data coming in is base64
        var plain_auth = buf.toString();        // read it back out as a string
        var creds = plain_auth.split(':');      // split on a ':'
        var password = creds[1];
      }else */
      if(req.body.pass){
        var password = req.body.pass;
      }else{
        res.statusCode = 401;
        res.json({"success": false, "msg":"Credentials missing"});
        return;
      }
      console.log(password);
      try{
        var user;
        var person;
        if(
          sails.config.custom.APP_CONFIG['authentication'].indexOf("email")>-1 &&
          !req.body.email && req.body.e.length===0){
          return res.successResponse({code: "Email missing"}, 400, null, false, "Email missing");
        }

        if(sails.config.custom.APP_CONFIG['authentication'].indexOf("email")===-1 ||
          req.body.e===null || req.body.e==="" || req.body.e==="null"){
          var users = await UserLogin.find({or: [
            {"m": req.body.m.replace(/[- )(]/g,'')}
          ]});
          var persons = await Person.find({or: [
            {"m": req.body.m.replace(/[- )(]/g,'')}
          ]});
        }else{
          var users = await UserLogin.find({or: [
            {"m": req.body.m.replace(/[- )(]/g,'')},
            {"e": req.body.e},
          ]});
          var persons = await Person.find({or: [
            {"m": req.body.m.replace(/[- )(]/g,'')},
            {"e": req.body.e},
          ]});
        }
        
        if(users.length > 0 || persons.length > 0){
          return res.successResponse({code: "Duplicate user"}, 200, null, false, "Mobile number already registered");
        }
        var mobile = req.body.m.replace(/[- )(]/g,'');      

        if(req.body.e===""){
          req.body.e = null;
        }
        person = await Person.create({n:req.body.n, m: mobile, e: req.body.e})
        .intercept('E_UNIQUE', (err)=> {
          return res.successResponse({code: "duplicate"}, 200, null, false, "Email or mobile already in use");
        })
        .intercept('UsageError', (err)=>{return new Error("err.message")}).fetch();
        if(person){
          console.log(req.body.r);
          var role = await Role.findOne({name: "ADMIN"}).populate("permissions");
          console.log(role);
          if(role){
            await Person.update({id: person.id}, {r: role.id});

            var permissions = [];
            for (var i = 0; i <role.permissions.length; i++) {
              permissions[i] = role.permissions[i].id;
            }
            console.log(permissions);
            await Person.addToCollection(person.id, "permissions").members(permissions);
          }
          
          person = await Person.findOne({id: person.id}).populate("permissions").populate("r");
          user = await UserLogin.create({lt: "Portal", 
          e: req.body.e, m: mobile, p: person.id, pass: password })
          .intercept('E_UNIQUE', async ()=> {
            await Person.destroyOne({id:person.id});
            return {"code":"usernameAlreadyInUse", "msg": "Username already taken"}
          })
          .intercept({name: 'UsageError'}, async ()=>{
            await Person.destroyOne({id:person.id});
            return {"code":"InvalidUser", "msg": "Invalid user"}
          }).fetch();
        }else{
          return res.successResponse(person, 200, null, false, "Failed to create user");
        }
      }catch(e){
        console.log(e);
        await Person.destroyOne({id:person.id});
        return res.successResponse(e.message, 200, null, false, e.message);
      }

      if(user){
        if(password && password.length>0){
          person.token = await sails.helpers.jwt.with({payload:{uid: person.id}});
        }
        // person.fbToken = await sails.helpers.firebaseTokenGenerator(person.id, {role: person.role.name})
        return res.successResponse(person, 201, null, true, "User created successfully");
      }else{
        return res.successResponse(person, 200, null, false, "Failed to create person.");
      }

    } else {
      return res.successResponse({msg: "Permission denied"}, 403, null, false, "Permission denied");
    }
    if(person){
      return res.successResponse(person, 201, null, true, "Person with role ${req.body.role} created successfully");
    }else{
      return res.successResponse({msg: "Failed to create person"}, 400, null, false, "Failed to create person.");
    }
  },

  /**
   * `PersonController.update()`
   */
  update: async function (req, res) {
    const isAuthorized = await sails.helpers.authorizeUser.with
    ({token: req.headers.authorization, "permission": "UPDATE_PERSON"})
    .intercept('tokenExpired', ()=>{
      return res.successResponse({code:"tokenExpired"}, 403, null, false, "Permission denied. Token Expired.");
    })
    .intercept('invalidToken', ()=>{
      return res.successResponse({code: "invalidToken"}, 403, null, false, "Permission denied");
    }).intercept('dbError', ()=>{
      return res.successResponse({code: "dbError"}, 500, null, false, "Some database error occured");
    });
    payload = await sails.helpers.verifyJwt.with({token: req.headers.authorization})
    .tolerate(()=>{});

    if (payload && (isAuthorized || payload.id === req.body.id)) {
      var person = await Person.updateOne({id: req.body.id}).set({n:req.body.n, 
      m: req.body.m, e: req.body.e, s: req.body.s})
      .intercept('E_UNIQUE', ()=>{
        return res.successResponse({msg: "Failed to update person"}, 400, null, false, "Failed to update person.");
      })
      .intercept('UsageError', (err)=>{
        return res.successResponse({msg: "Failed to update person"}, 400, null, false, "Failed to update person.");
      });
      var userData = {m: req.body.m, e: req.body.e};
      if(req.body.pass){
        userData['pass'] = req.body.pass;
      }
      var user = await UserLogin.updateOne({p: req.body.id}).set(userData)
      .intercept('E_UNIQUE', ()=>{
        return res.successResponse({msg: "Failed to update person"}, 400, null, false, "Failed to update person.");
      })
      .intercept('UsageError', (err)=>{
        return res.successResponse({msg: "Failed to update person"}, 400, null, false, "Failed to update person.");
      });  
    } else {
        return res.successResponse({msg: "Permission denied"}, 403, null, false, "Permission denied");    
    }
    return res.successResponse(person, 200, null, true, "Person updated successfully");
  },

  /**
   * `PersonController.delete()`
   */
  delete: async function (req, res) {
    const isAuthorized = await sails.helpers.authorizeUser.with
    ({token: req.headers.authorization, "permission": "DELETE_PERSON"})
    .intercept(()=>{return false});
    
    payload = await sails.helpers.verifyJwt.with({token: req.headers.authorization}).tolerate(()=>{});
    // return res.json({"payload":payload, "id":req.params.id, "isAuthorized":isAuthorized});
    if (payload && (isAuthorized || payload.id == req.params.id)) {
      var user = await UserLogin.destroyOne({p: req.params.id})
                .intercept('UsageError', (err)=>{
                  return res.successResponse({msg: "Failed to delete person"}, 400, null, false, "Failed to delete person.");
                });
      var person = await Person.destroyOne({id: req.params.id})
                  .intercept('UsageError', (err)=>{
                    return res.successResponse({msg: "Failed to delete person"}, 400, null, false, "Failed to delete person.");
                  });  
    } else {
        return res.successResponse({msg: "Permission denied"}, 403, null, false, "Permission denied");    
    }
    return res.successResponse(person, 200, null, true, "Person with role ${req.body.role} deleted successfully");    
  },

  /**
   * `PersonController.get()`
   */
  get: async function (req, res) {
    const isAuthorized = await sails.helpers.authorizeUser.with(
      {token: req.headers.authorization, permission: "GET_PERSON"})
      .intercept('tokenExpired', ()=>{
      return res.successResponse({code:"tokenExpired"}, 403, null, false, "Permission denied. Token Expired.");
    })
    .intercept('invalidToken', ()=>{
      return res.successResponse({code: "invalidToken"}, 403, null, false, "Permission denied");
    }).intercept('dbError', ()=>{
      return res.successResponse({code: "dbError"}, 500, null, false, "Some database error occured");
    });
    if(isAuthorized){
      if(req.query){
        var result = await Person.find(req.query).populate("permissions").populate("r");
        res.json(result);
      }else{
        res.json(await Person.find().populate("permissions").populate("r"));
      }
    }else if(req.headers.authorization){
      const payload = await sails.helpers.verifyJwt.with({"token": req.headers.authorization})
      .intercept('invalidToken', ()=>{
            return res.successResponse({msg: "Permission denied 1"}, 403, null, false, "Permission denied 1");
          });
      if(payload)
        res.json(await Person.findOne({id: payload.id}).populate("permissions").populate("r"));
    }else{
      return res.successResponse({msg: "Permission denied"}, 403, null, false, "Permission denied");
    }
  },

  getUserDetail: async function(req, res){
    const payload = await sails.helpers.verifyJwt.with({"token": req.headers.authorization})
    .intercept('invalidToken', ()=>{
          return res.successResponse({msg: "Permission denied 1"}, 403, null, false, "Permission denied 1");
        });
    if(payload){
      res.json(await Person.findOne({id: payload.uid}).populate("p"));
    }else{
      return res.successResponse({msg: "Permission denied"}, 403, null, false, "Permission denied");
    }
  },

  getTotalCustomers: async function (req, res) {
    const isAuthorized = await sails.helpers.authorizeUser.with(
      {token: req.headers.authorization, permission: "GET_PERSON"})
      .intercept('tokenExpired', ()=>{
      return res.successResponse({code:"tokenExpired"}, 403, null, false, "Permission denied. Token Expired.");
    })
    .intercept('invalidToken', ()=>{
      return res.successResponse({code: "invalidToken"}, 403, null, false, "Permission denied");
    }).intercept('dbError', ()=>{
      return res.successResponse({code: "dbError"}, 500, null, false, "Some database error occured");
    });
    if(isAuthorized){
      var result = await Person.count();
      res.json(result);
    }else if(req.headers.authorization){
      const payload = await sails.helpers.verifyJwt.with({"token": req.headers.authorization})
      .intercept('invalidToken', ()=>{
            return res.successResponse({msg: "Permission denied 1"}, 403, null, false, "Permission denied 1");
          });
      return res.json(payload);
      if(payload)
        res.json(await Person.findOne({id: payload.id}).populate("permissions").populate("role"));
    }else{
      return res.successResponse({msg: "Permission denied"}, 403, null, false, "Permission denied");
    }
  },

  getCustomers: async function (req, res) {
    const isAuthorized = await sails.helpers.authorizeUser.with(
      {token: req.headers.authorization, permission: "GET_PERSON"})
      .intercept('tokenExpired', ()=>{
      return res.successResponse({code:"tokenExpired"}, 403, null, false, "Permission denied. Token Expired.");
    })
    .intercept('invalidToken', ()=>{
      return res.successResponse({code: "invalidToken"}, 403, null, false, "Permission denied");
    }).intercept('dbError', ()=>{
      return res.successResponse({code: "dbError"}, 500, null, false, "Some database error occured");
    });
    if(isAuthorized){
      if(req.query){
        var limit = req.query.limit;
        var offset = req.query.offset;
        delete req.query.limit;
        delete req.query.offset;
        var result = await Person.find(req.query).limit(limit).skip(offset);
        res.json(result);
      }else{
        res.json(await Person.find().limit(100));
      }
    }else if(req.headers.authorization){
      const payload = await sails.helpers.verifyJwt.with({"token": req.headers.authorization})
      .intercept('invalidToken', ()=>{
            return res.successResponse({msg: "Permission denied 1"}, 403, null, false, "Permission denied 1");
          });
      return res.json(payload);
      if(payload)
        res.json(await Person.findOne({id: payload.id}).populate("permissions").populate("role"));
    }else{
      return res.successResponse({msg: "Permission denied"}, 403, null, false, "Permission denied");
    }
  },

  queryCustomers: async function(req, res){
    const isAuthorized = await sails.helpers.authorizeUser.with(
      {token: req.headers.authorization, permission: "GET_PERSON"})
      .intercept('tokenExpired', ()=>{
      return res.successResponse({code:"tokenExpired"}, 403, null, false, "Permission denied. Token Expired.");
    })
    .intercept('invalidToken', ()=>{
      return res.successResponse({code: "invalidToken"}, 403, null, false, "Permission denied");
    }).intercept('dbError', ()=>{
      return res.successResponse({code: "dbError"}, 500, null, false, "Some database error occured");
    });
    if(isAuthorized){
      var result = await Person.find({
        where: {
          or: [
            {name: {contains: req.query.q}},
            {mobile: {contains: req.query.q}},
            {email: {contains: req.query.q}},
          ]          
        },
        skip: req.query.offset,
        limit: req.query.limit,
      }).meta({makeLikeModifierCaseInsensitive: true});
      res.json(result);  
    }else{
      return res.successResponse({msg: "Permission denied"}, 403, null, false, "Permission denied");
    }
  },

  fetchFilteredList: async function(req,res){
    const isAuthorized = await sails.helpers.authorizeUser.with(
      {token: req.headers.authorization, permission: "GET_PERSON"})
      .intercept('tokenExpired', ()=>{
      return res.successResponse({code:"tokenExpired"}, 403, null, false, "Permission denied. Token Expired.");
    })
    .intercept('invalidToken', ()=>{
      return res.successResponse({code: "invalidToken"}, 403, null, false, "Permission denied");
    }).intercept('dbError', ()=>{
      return res.successResponse({code: "dbError"}, 500, null, false, "Some database error occured");
    });
    if(isAuthorized){
      var result = await Person.find({
        where: {
          or: [
            {name: {contains: req.query.strQuery}},
            {mobile: {contains: req.query.strQuery}},
            {email: {contains: req.query.strQuery}},
          ]          
        },
        skip: req.query.offset,
        limit: req.query.limit,
        sort: "createdAt DESC"
      }).meta({makeLikeModifierCaseInsensitive: true});

      res.json(result);  
    }else if(req.headers.authorization){
      const payload = await sails.helpers.verifyJwt.with({"token": req.headers.authorization})
      .intercept('invalidToken', ()=>{
            return res.successResponse({msg: "Permission denied 1"}, 403, null, false, "Permission denied");
          });
      return res.json(payload);
      if(payload)
        res.json(await Person.findOne({id: payload.id}).populate("permissions").populate("role"));
    }else{
      return res.successResponse({msg: "Permission denied"}, 403, null, false, "Permission denied");
    }
  },

  assignPermissionToPerson: async function(req, res){
    const isAuthorized = await sails.helpers.authorizeUser
    .with({token: req.headers.authorization, "permission": "ASSIGN_PERMISSION_TO_USER"})
    .intercept('tokenExpired', ()=>{
      return res.successResponse({code:"tokenExpired"}, 403, null, false, "Permission denied. Token Expired.");
    })
    .intercept('invalidToken', ()=>{
      return res.successResponse({code: "invalidToken"}, 403, null, false, "Permission denied");
    }).intercept('dbError', ()=>{
      return res.successResponse({code: "dbError"}, 500, null, false, "Some database error occured");
    });
    if(isAuthorized){
      var oldPerson = await Person.findOne({id: req.body.personid});
      await Person.addToCollection(req.body.personid, "permissions").members(req.body.permissions);
      var person = await Person.findOne({id: req.body.personid}).populate("permissions");

      //Log to activity log table
      sails.helpers.activityLogger.with({
          token: req.headers.authorization,
          entityAffected: Person.tableName,
          actionType: 'UPDATE',
          newValue: person,
          oldValue: oldPerson
        }).tolerate(()=>{
          console.log("Failed to log activity");
        }).then((result)=>{
          if(result){
            console.log("Activity logged successfully");
          }else{
            console.log("Failed to log activity");
          }
        });
      return res.successResponse(person, 200, null, true, "Role assigned successResponse");      
    }else{
      return res.successResponse({msg: "Permission denied"}, 403, null, false, "Permission denied"); 
    }
  },
  
  removePermissionFromPerson: async function(req, res){
    const isAuthorized = await sails.helpers.authorizeUser
    .with({token: req.headers.authorization, "permission": "REMOVE_PERMISSION_FROM_USER"})
    .intercept('tokenExpired', ()=>{
      return res.successResponse({code:"tokenExpired"}, 403, null, false, "Permission denied. Token Expired.");
    })
    .intercept('invalidToken', ()=>{
      return res.successResponse({code: "invalidToken"}, 403, null, false, "Permission denied");
    }).intercept('dbError', ()=>{
      return res.successResponse({code: "dbError"}, 500, null, false, "Some database error occured");
    });
    if(isAuthorized){
      await Person.removeFromCollection(req.body.personid, "permissions").members(req.body.permissions);
      var person = await Person.findOne({id: req.body.personid}).populate("permissions");
      return res.successResponse(person, 200, null, true, "Role removed successResponse");      
    }else{
      return res.successResponse({msg: "Permission denied"}, 403, null, false, "Permission denied");
    }
  },

  updatePermissions: async function(req, res){
    const isAuthorized = await sails.helpers.authorizeUser
    .with({token: req.headers.authorization, "permission": "REMOVE_PERMISSION_FROM_USER"})
    .intercept('tokenExpired', ()=>{
      return res.successResponse({code:"tokenExpired"}, 403, null, false, "Permission denied. Token Expired.");
    })
    .intercept('invalidToken', ()=>{
      return res.successResponse({code: "invalidToken"}, 403, null, false, "Permission denied");
    }).intercept('dbError', ()=>{
      return res.successResponse({code: "dbError"}, 500, null, false, "Some database error occured");
    });
    if(isAuthorized){
      let permissionIds = [];
      for(let i=0; i< req.body.permissions.length;i++){
        permissionIds.push(req.body.permissions[i].id);
      }
      var oldPerson = await Person.findOne({id: req.body.id});
      await Person.replaceCollection(req.body.id, "permissions").members(permissionIds);
      var person = await Person.findOne({id: req.body.id}).populate("permissions").populate("role");
      //Log to activity log table
      sails.helpers.activityLogger.with({
          token: req.headers.authorization,
          entityAffected: Person.tableName,
          actionType: 'UPDATE',
          newValue: person,
          oldValue: oldPerson
        }).tolerate(()=>{
          console.log("Failed to log activity");
        }).then((result)=>{
          if(result){
            console.log("Activity logged successfully");
          }else{
            console.log("Failed to log activity");
          }
        });
      return res.successResponse(person, 200, null, true, "Person updated successfully");
    }else{
      return res.successResponse({msg: "Permission denied"}, 403, null, false, "Permission denied");
    }
  },
};

