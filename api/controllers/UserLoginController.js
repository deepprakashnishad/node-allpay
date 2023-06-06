/**
 * UserLoginController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const ttl = 1800*1000;
const {ObjectId} = require('mongodb');

module.exports = {
  signup: async function (req, res) {
    var auth = req.headers.authorization;
    if (auth) {
      var tmp = auth.split(' ');   // Split on a space, the original auth looks like  "Basic Y2hhcmxlczoxMjM0NQ==" and we need the 2nd part

      var buf = new Buffer(tmp[1], 'base64'); // create a buffer and tell it the data coming in is base64
      var plain_auth = buf.toString();        // read it back out as a string
      var creds = plain_auth.split(':');      // split on a ':'
      var password = creds[1];
    }else if(req.body.password){
      var password = req.body.password;
    }else{
      res.statusCode = 401;
      res.json({"success": false, "msg":"Credentials missing"});
      return;
    }
    try{
      var user;
      var person;
      if(req.body.e===null || req.body.e==="" || req.body.e==="null"){
        var users = await UserLogin.find({"m": req.body.m.replace(/[- )(]/g,'')});
        var persons = await Person.find({"m": req.body.m.replace(/[- )(]/g,'')});
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
        return res.successResponse({code: "Duplicate user"}, 400, null, false, "Email or mobile already registered");
      }
      var mobile = req.body.m.replace(/[- )(]/g,'');      

      person = await Person.create({n:req.body.n, m: mobile, e: req.body.e, p: req.body.p})
      .intercept('E_UNIQUE', (err)=> {
        return res.successResponse({code: "duplicate"}, 400, null, false, "Email or mobile already in use");
      })
      .intercept('UsageError', (err)=>{return new Error("err.message")}).fetch();

      if(person){
        var role = "GUEST"
        var role = await Role.findOne({name: role}).populate("permissions");
        await Person.update({id: person.id}, {r: role.id});

        var permissionIds = [];
        for (var i = 0; i <role.permissions.length; i++) {
          permissionIds[i] = role.permissions[i].id;
        }
        await Person.addToCollection(person.id, "permissions").members(permissionIds);
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
        return res.successResponse(person, 400, null, false, "Failed to create user");
      }
    }catch(e){
      return res.successResponse(e.message, 400, null, false, e.message);
    }

    if(user){
      person.token = await sails.helpers.jwt.with({payload:{uid: person.id}});
      // person.fbToken = await sails.helpers.firebaseTokenGenerator(person.id, {role: person.role.name})
      return res.successResponse(person, 201, null, true, "User created successfully");
    }else{
      return res.successResponse(person, 400, null, false, "Failed to create person.");
    }
  },

  /**
   * `UserController.get()`
   */
  get: async function (req, res) {
    const payload = await sails.helpers.verifyJwt.with({"token": req.headers.authorization});
    const isAuthorized = await sails.helpers.authorizeUser.with({token: req.headers.authorization, resource: "GET_USERS"});
    if(isAuthorized){
      if(req.params.userid){
        res.json(await UserLogin.findOne({id: req.params.userid}).populate("resources").populate("role"));
      }else{
        res.json(await UserLogin.find().populate("resources").populate("role"));
      }

    }else{
      res.json(await UserLogin.findOne({id: payload.id}).populate("resources").populate("role"));
    }
  },

  login: async function (req, res) {
    try{
      var auth = req.headers.authorization;
      if (!auth) {
        res.statusCode = 401;
        res.json({"success": true, "msg":"Credentials missing"});
      }else{
        var tmp = auth.split(' ');   // Split on a space, the original auth looks like  "Basic Y2hhcmxlczoxMjM0NQ==" and we need the 2nd part

        var buf = new Buffer(tmp[1], 'base64'); // create a buffer and tell it the data coming in is base64
        var plain_auth = buf.toString();        // read it back out as a string
        var creds = plain_auth.split(':');      // split on a ':'
        var username = creds[0];
        var password = creds[1];
      }
      var user = await UserLogin.findOne({
         or: [
           {'m': username.replace(/[- )(]/g,'')},
           {'e': username},
         ],
         'lt': "Portal"
        }
      ).populate("p");
      if(!user){
         return res.errResponse({"msg": "User not found"}, 404, null, false, "User not found");
      }
      const crypto = require('crypto');
      const hashedSentPassword = crypto.createHmac('sha256', sails.config.models.dataEncryptionKeys.passHashKey)
                     .update(password)
                     .digest('hex');
      if (user && user.pass==hashedSentPassword) {
        var person = await Person.findOne({'id': user.p.id}).populate("r").populate("permissions")
        person.token = await sails.helpers.jwt.with({payload: {uid: person.id}})
        // person.fbToken = await sails.helpers.firebaseTokenGenerator(person.id, {role: person.role.name})
        res.successResponse(person, 200, null);
      } else {
        return res.errResponse({"msg": "Invalid credentials"}, 403, null, false, "Invalid credential");
      }
    }catch(e){
      console.log(e);
      return res.serverError({"msg": "Internal server error"});
    }
  },

  sendResetPasswordCode: async function(req, res){
    var code;
    try{
      var users = await UserLogin.find({
         or: [
           {'mobile': req.body.username.replace(/[- )(]/g,'')},
           {'email': req.body.username},
         ],
         'loginType': "Portal"
        }
      ).populate("person");
      
      if(users.length == 0){
        return res.successResponse({success: true, msg: "User not found"}, 404, null);
      }
      var user = users[0];
      console.log(user);
      var result = await ResetCode.find({"username": req.body.username});
      if(result.length == 0){
        code = Math.floor(100000 + Math.random() * 900000);
        await ResetCode.create({username: req.body.username, code: code});
      }else{
        var timestamp = result[0]['updatedAt'];
        if(timestamp + ttl < Date.now()){
          code = Math.floor(100000 + Math.random() * 900000);
          await ResetCode.update({username: req.body.username}, {code: code});
        }else{
          code = result[0]['code'];
        }
      }
      await mailer.sendForgotPassword({"name": `${user.person.name}`, "email": user.email, "code": code});
      res.successResponse({success: true, msg: "Reset code sent"}, 200, null);
    }catch(e){
      console.log(e);
      res.successResponse({success: false, msg: "Some error occured"}, 500, null);
    }
  },

  updatePasswordWithIdToken: async function(req, res) {
    try{
      var auth = req.headers.authorization;
      if (!auth) {
        res.statusCode = 401;
        res.json({"success": true, "msg":"Credentials missing"});
      }else{
        var tmp = auth.split(' ');   // Split on a space, the original auth looks like  "Basic Y2hhcmxlczoxMjM0NQ==" and we need the 2nd part

        var buf = new Buffer(tmp[1], 'base64'); // create a buffer and tell it the data coming in is base64
        var plain_auth = buf.toString();        // read it back out as a string
        var creds = plain_auth.split(':');      // split on a ':'
        var newPassword = creds[0];
        var idToken = creds[1];
      }

      var payload = await sails.helpers.verifyIdToken.with({token: idToken});
      var user = await UserLogin.updateOne({
        or: [
           {'mobile': payload.phone_number},
           {'email': payload.phone_number},
         ],
         'loginType': "Portal"
      }, {password: newPassword});
      
      if(user){
        return res.successResponse(user, 200, "Password updated");
      }else{
        return res.successResponse(user, 404, "User not found");
      }
    }catch(e){
      console.log(e);
      return res.serverError({"msg": "Internal server error"});
    }
  },

  updatePassword: async function (req, res) {
    try{
      var auth = req.headers.authorization;
      if (!auth) {
        res.statusCode = 401;
        res.json({"success": true, "msg":"Credentials missing"});
      }else{
        var tmp = auth.split(' ');   // Split on a space, the original auth looks like  "Basic Y2hhcmxlczoxMjM0NQ==" and we need the 2nd part

        var buf = new Buffer(tmp[1], 'base64'); // create a buffer and tell it the data coming in is base64
        var plain_auth = buf.toString();        // read it back out as a string
        var creds = plain_auth.split(':');      // split on a ':'
        var oldPassword = creds[0];
        var newPassword = creds[1];
      }
      var user = await UserLogin.findOne({'person': req.body.id});
      
      const crypto = require('crypto');
      const hashedOldPassword = crypto.createHmac('sha256', sails.config.models.dataEncryptionKeys.passHashKey)
                     .update(oldPassword)
                     .digest('hex');
      if (user && user.password===hashedOldPassword) {
        var person = await Person.find({
          or: [
             {'mobile': user.email.replace(/[- )(]/g,'')},
             {'email': user.email},
           ]
        });
        var user = await UserLogin.updateOne({'person': req.body.id}, {password: newPassword});
        res.successResponse(user, 200, "Password updated");
        await mailer.sendPasswordUpdatedMail({name: person[0].name, email: person[0].email, subject: "Password updated successfully"});
      } else {
        return res.errResponse({"msg": "Invalid credentials"}, 403, null, false, "Invalid credentials");
      }
    }catch(e){
      console.log(e);
      return res.serverError({"msg": "Internal server error"});
    }
  },

  resetUserPasswordByAdmin: async function (req, res) {
    const isAuthorized = await sails.helpers.authorizeUser.with(
      {token: req.headers.authorization, "permission": "UPDATE_PERSON"})
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
        var user = await UserLogin.updateOne({person: req.body.personId, loginType: "Portal"}).set({password: req.body.password});       
        if(user){
          return res.successResponse(user, 200, null, true, 'Password updated successfully.');
        }else{
          return res.successResponse(null, 400, null, true, 'Failed to update password.');
        }
      }catch(err){
        console.log(err);
        switch(err){
          case 'UsageError': return res.badRequest(err);
            break;
          default: {
            return res.serverError(err);
          }
        }
      }
    }else{
      return res.successResponse({msg: "Permission denied"}, 403, null, false, "Permission denied");
    }
  },

  updatePasswordWithResetCode: async function (req, res) {
    try{
      var auth = req.headers.authorization;
      if (!auth) {
        res.statusCode = 401;
        res.json({"success": true, "msg":"Credentials missing"});
      }else{
        var tmp = auth.split(' ');   // Split on a space, the original auth looks like  "Basic Y2hhcmxlczoxMjM0NQ==" and we need the 2nd part

        var buf = new Buffer(tmp[1], 'base64'); // create a buffer and tell it the data coming in is base64
        var plain_auth = buf.toString();        // read it back out as a string
        var creds = plain_auth.split(':');      // split on a ':'
        var resetCode = creds[0];
        var newPassword = creds[1];
      }
      var resetCodeDetail = await ResetCode.find({'username': req.body.username}).limit(1);
      if(resetCodeDetail.length===0){
        return res.successResponse({"success": false, "msg": "Invalid verification code"}, 201);  
      }else{
        resetCodeDetail = resetCodeDetail[0];
      }
      if(resetCodeDetail['code'] != resetCode){
        return res.successResponse({"success": false, "msg": "Invalid verification code"}, 201);  
      }
      if(resetCodeDetail['updatedAt'] + ttl < Date.now()){
        return res.successResponse({"success": false, "msg": "Verification code expired"}, 202);
      }

      var user = await UserLogin.updateOne({
        or: [
           {'mobile': req.body.username.replace(/[- )(]/g,'')},
           {'email': req.body.username},
         ],
         'loginType': "Portal"
      }, {password: newPassword});

      await ResetCode.destroy({'username': req.body.username});
      if(user){
        var person = await Person.find({
          or: [
             {'mobile': req.body.username.replace(/[- )(]/g,'')},
             {'email': req.body.username},
           ]
        });
        await mailer.sendPasswordUpdatedMail({name: person[0].name, email: person[0].email, subject: "Password updated successfully"});
        return res.successResponse({"success": true, "msg": "Password updated successfully"}, 200, "Password updated");
      }else{
        return res.successResponse(user, 404, "User not found");
      }
    }catch(e){
      console.log(e);
      return res.serverError({"msg": "Internal server error"});
    }
  },

  /**
   * `UserController.logout()`
   */
  logout: async function (req, res) {
    
  },

  delete:async function(req, res){
    const isAuthorized = await sails.helpers.authorizeUser.with({token: req.headers.authorization, "resource": "DELETE_USER"});
    if(isAuthorized){
      try{
          let person = await Person.findOne({id: req.params.personId});
          let user = await UserLogin.destroy({id: person.userLogin}).fetch();
          await Person.destroy({id: person.id});
          return res.successResponse(address, 201, null, true, "User deleted successfully");
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
      return res.successResponse(null, 403, null, false, "Permission denied");
    }
  }, 

  checkUserExist: async function(req, res) {
    try{
      var users = await UserLogin.find({
           or: [
             {'mobile': req.body.username.replace(/[- )(]/g,'')},
             {'email': req.body.username},
           ],
           'loginType': "Portal"
          }
        );
      if(users.length > 0){
        return res.successResponse({success: true}, 200, null, false, "User exists");
      }else{
        return res.successResponse({success: false}, 404, null, false, "User not found");
      }
    }catch(err){
      console.log(e);
      return res.serverError({"msg": "Some error occured"});
    }
  },

  loginWithFirebaseIdToken: async function(req,res) {
    try{
      var auth = req.headers.authorization;
      if (!auth) {
        res.statusCode = 401;
        res.json({"success": true, "msg":"Credentials missing"});
      }else{
        var tmp = auth.split(' ');   // Split on a space, the original auth looks like  "Basic Y2hhcmxlczoxMjM0NQ==" and we need the 2nd part

        var buf = new Buffer(tmp[1], 'base64'); // create a buffer and tell it the data coming in is base64
        var plain_auth = buf.toString();        // read it back out as a string
        var creds = plain_auth.split(':');      // split on a ':'
        var username = creds[0];
        var idToken = creds[1];
      }
      var users = await UserLogin.find({
         or: [
           {'mobile': username.replace(/[- )(]/g,'')},
           {'email': username},
         ],
         'loginType': "Portal"
        }
      ).populate("person");
      var user = users[0];
      var result = await sails.helpers.verifyIdToken.with({token: idToken});

      if (result) {
        var person = await Person.findOne({'id': user.person.id}).populate("role").populate("resources")
        person.token = await sails.helpers.jwt.with({payload: {uid: person.id}})
        person.fbToken = await sails.helpers.firebaseTokenGenerator(person.id, {role: person.role.name})
        res.successResponse(person, 200, null);
      } else {
        return res.errResponse({"msg": "Invalid credentials"}, 403, null, false, "Invalid credential");
      }
    }catch(e){
      console.log(e);
      return res.serverError({"msg": "Internal server error"});
    }
  },

  signInWithGoogle: async function(req, res){  
    const token = req.body.id_token;
    const {OAuth2Client} = require('google-auth-library');
    
    const client = new OAuth2Client(sails.config.custom.GOOGLE_APP_CLIENT_ID);
    async function verify() {
      try{
        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: [sails.config.custom.GOOGLE_APP_CLIENT_ID, sails.config.custom.GOOGLE_IOS_CLIENT_ID]
        });

        const payload = ticket.getPayload();
        const userid = payload['sub'];


        var user = await UserLogin.findOne({email: req.body.email});
        if(user && user.loginType != "Google"){
          return res.successResponse({code: `Email already exists with ${user.loginType}`}, 404, null, false, `Email already registered with ${user.loginType=="Portal"?"email/password": user.loginType} login. Try another`);
        } else if(user){
          var person = await Person.findOne({email: user.email}).populate("resources").populate("role")
          person.token = await sails.helpers.jwt.with({payload: {uid: person.id}});    
          person.fbToken = await sails.helpers.firebaseTokenGenerator(person.id, {role: person.role.name})    
          person.success = true;
          return res.successResponse(person, 200, null, true, "User logged in successfully");
        }else{
          var data = {
            firstname:req.body.firstname, 
            lastname:req.body.lastname, 
            email: req.body.email, 
            mobile: userid,
          };

          var person = await Person.findOne({email: data['email']});
          if(!person){
            person = await Person.create(data)
            .intercept('E_UNIQUE', (err)=> {
              if(req.body.role=="COOK"){
                return {"code":"mobileAlreadyInUse", "msg": "Mobile number already registered"}
              }else{
                return {"code":"emailAlreadyInUse", "msg": "Email id already registered"};
              }
            })
            .intercept('UsageError', (err)=>{return {"code":"InvalidUser", "msg": "Invalid user"}}).fetch();
          }
          if(person){
            if(user){
              user = await UserLogin.updateOne({email: user.email, loginType: "Google"}, 
                          {email: person['email'], mobile: userid,person: person['id'],
                          loginType: "Google", issuer: payload['iss'], token1: req.body.id_token, token2: req.body.access_token,
                          issuer_unique_userid: userid, 
              }).intercept('UsageError', (err)=>{return "invalid";});
            }else{
              user = await UserLogin.create({email: person['email'], mobile: userid,person: person['id'],
                          loginType: "Google", issuer: payload['iss'], token1: req.body.id_token, token2: req.body.access_token,
                          issuer_unique_userid: userid, 
              }).intercept('E_UNIQUE', (err)=>{ return new Error('Email address exists!') })
                .intercept('UsageError', (err)=>{return "invalid";}).fetch();
            }
            
            var role = await Role.findOne({name: req.body.role}).populate("resources");
            await Person.update({id: person.id}, {role: role.id});
            var resourceIds = [];
            for (var i = 0; i <role.resources.length; i++) {
              resourceIds[i] = role.resources[i].id;
            }
            await Person.addToCollection(person.id, "resources").members(resourceIds);
            person = await Person.findOne({id: person.id}).populate("resources").populate("role");
            person.token = await sails.helpers.jwt.with({payload: {uid: person.id}});        
            person.fbToken = await sails.helpers.firebaseTokenGenerator(person.id, {role: person.role.name})
            person.success = true;
            return res.successResponse(person, 200, null, true, "User created successfully created successfully");
          }
        }
      }catch(e){
        console.log(e);
        return res.successResponse({code: e.message}, 403, null, false, e.message);
      }
    }
    verify().catch((error=>{
      res.json({success: false, msg:error});
    }));
  },

  signInWithFacebook: async function(req, res){
    const token = req.body.access_token;
    var axios = require('axios');

    try{
      var response =  await axios.get(`https://graph.facebook.com/v2.12/me?fields=name,first_name,last_name,email,picture&access_token=${token}`);
      var profile = response.data;
    }catch(e){
      console.log(e);
      return res.successResponse(null, 403, null, false, "Permission denied");      
    }
    
    try{
      if(profile && profile['id']===req.body.issuer_unique_userid){
        var user = await UserLogin.findOne({email: profile['email']});
        if(user && user.loginType != "Facebook"){
          return res.successResponse({code: `Email already exists with ${user.loginType}`}, 404, null, false, `Email already registered with ${user.loginType=="Portal"?"email/password": user.loginType} login. Try another`);
        } else if(user){
          var person = await Person.findOne({email: user.email}).populate("resources").populate("role")
          person.token = await sails.helpers.jwt.with({payload: {uid: person.id}});        
          person.fbToken = await sails.helpers.firebaseTokenGenerator(person.id, {role: person.role.name})
          person.success = true;
          return res.successResponse(person, 200, null, true, "User logged in successfully");
        }else{
          var data = {firstname:req.body.firstname, lastname:req.body.lastname, 
            email: req.body.email, mobile: profile['id']};

          var person = await Person.findOne({email: data['email']});
          if(!person){
            person = await Person.create(data)
            .intercept('E_UNIQUE', (err)=> {
              if(err.attrNames[0]=="mobile"){
                return {"code":"mobileAlreadyInUse", "msg": "Mobile number already registered"}
              }else{
                return {"code":"emailAlreadyInUse", "msg": "Email already registered"};
              }
            })
            .intercept('UsageError', (err)=>{return {"code":"InvalidUser", "msg": "Invalid user"}}).fetch();
          }

          // var fs = require('fs');
          // var https = require('https');

          /*var avatarPath = require('util').format('images/avatar/%s.png', person['id']);
          if(!fs.existsSync(`.tmp/public/images/avatar/`)){
            fs.mkdirSync(`.tmp/public/images/avatar/`, {recursive: true});
          }
          var assetFile = fs.createWriteStream(`assets/${avatarPath}`);
          var tempFile = fs.createWriteStream(`.tmp/public/${avatarPath}`);

          var request = https.get(profile['picture']['data']['url'], function(response) {
            response.pipe(assetFile);
            response.pipe(tempFile);
          });*/
          if(person){
            var role = await Role.findOne({name: req.body.role}).populate("resources");
            await Person.update({id: person.id}, {role: role.id});
            var resourceIds = [];
            for (var i = 0; i <role.resources.length; i++) {
              resourceIds[i] = role.resources[i].id;
            }
            await Person.addToCollection(person.id, "resources").members(resourceIds);

            if(user){
              user = await UserLogin.updateOne({email: user.email, loginType: "Facebook"}, 
                          {email: person['email'], person: person['id'],
                          loginType: "Facebook", issuer: "Facebook", token2: req.body.access_token,
                          issuer_unique_userid: profile['id'], mobile: profile['id'], 
              }).intercept('E_UNIQUE', (err)=> {
                if(err.attrNames[0]=="mobile"){
                  return {"code":"mobileAlreadyInUse", "msg": "Mobile number already registered"}
                }else{
                  return {"code":"emailAlreadyInUse", "msg": "Email already registered"};
                }
              })
              .intercept('UsageError', (err)=>{return "invalid";});
            }else{
              user = await UserLogin.create({email: person['email'], person: person['id'],
                          loginType: "Facebook", issuer: "Facebook", token2: req.body.access_token,
                          issuer_unique_userid: profile['id'], mobile: profile['id'], 
              }).intercept('E_UNIQUE', (err)=> {
                if(err.attrNames[0]=="mobile"){
                  return {"code":"mobileAlreadyInUse", "msg": "Mobile number already registered"}
                }else{
                  return {"code":"emailAlreadyInUse", "msg": "Email already registered"};
                }
              })
              .intercept('UsageError', (err)=>{return "invalid";}).fetch();
            }

            person = await Person.findOne({id: person['id']}).populate("resources").populate("role");
            person.token = await sails.helpers.jwt.with({payload: {uid: person['id']}});        
            person.fbToken = await sails.helpers.firebaseTokenGenerator(person.id, {role: person.role.name})
            person.success = true;
            return res.successResponse(person, 200, null, true, "User created successfully created successfully");
          }
        }
      }else{
        return res.successResponse(null, 403, null, false, "Permission denied");
      }
    }catch(e){
      try{
        e['msg'] = e.raw.msg;
      }catch(e){}
      return res.successResponse(e, 500, null, false, e['msg']);
    }    
  },

  signInWithMobileAuthentication: async function(mobile){
    console.log("Printing in UserLogin controller - "+mobile);
    return "Hare Krishna";
    try{
      if(mobile){
        var user = await UserLogin.findOne({email: profile['email']});
        if(user && user.loginType != "Facebook"){
          return res.successResponse({code: `Email already exists with ${user.loginType}`}, 404, null, false, `Email already registered with ${user.loginType=="Portal"?"email/password": user.loginType} login. Try another`);
        } else if(user){
          var person = await Person.findOne({email: user.email}).populate("resources").populate("role")
          person.token = await sails.helpers.jwt.with({payload: {uid: person.id}});        
          person.fbToken = await sails.helpers.firebaseTokenGenerator(person.id, {role: person.role.name})
          person.success = true;
          return res.successResponse(person, 200, null, true, "User logged in successfully");
        }else{
          var data = {firstname:req.body.firstname, lastname:req.body.lastname, 
            email: req.body.email, mobile: profile['id']};

          var person = await Person.findOne({email: data['email']});
          if(!person){
            person = await Person.create(data)
            .intercept('E_UNIQUE', (err)=> {
              if(err.attrNames[0]=="mobile"){
                return {"code":"mobileAlreadyInUse", "msg": "Mobile number already registered"}
              }else{
                return {"code":"emailAlreadyInUse", "msg": "Email already registered"};
              }
            })
            .intercept('UsageError', (err)=>{return {"code":"InvalidUser", "msg": "Invalid user"}}).fetch();
          }

          // var fs = require('fs');
          // var https = require('https');

          /*var avatarPath = require('util').format('images/avatar/%s.png', person['id']);
          if(!fs.existsSync(`.tmp/public/images/avatar/`)){
            fs.mkdirSync(`.tmp/public/images/avatar/`, {recursive: true});
          }
          var assetFile = fs.createWriteStream(`assets/${avatarPath}`);
          var tempFile = fs.createWriteStream(`.tmp/public/${avatarPath}`);

          var request = https.get(profile['picture']['data']['url'], function(response) {
            response.pipe(assetFile);
            response.pipe(tempFile);
          });*/
          if(person){
            var role = await Role.findOne({name: req.body.role}).populate("resources");
            await Person.update({id: person.id}, {role: role.id});
            var resourceIds = [];
            for (var i = 0; i <role.resources.length; i++) {
              resourceIds[i] = role.resources[i].id;
            }
            await Person.addToCollection(person.id, "resources").members(resourceIds);

            if(user){
              user = await UserLogin.updateOne({email: user.email, loginType: "Facebook"}, 
                          {email: person['email'], person: person['id'],
                          loginType: "Facebook", issuer: "Facebook", token2: req.body.access_token,
                          issuer_unique_userid: profile['id'], mobile: profile['id'], 
              }).intercept('E_UNIQUE', (err)=> {
                if(err.attrNames[0]=="mobile"){
                  return {"code":"mobileAlreadyInUse", "msg": "Mobile number already registered"}
                }else{
                  return {"code":"emailAlreadyInUse", "msg": "Email already registered"};
                }
              })
              .intercept('UsageError', (err)=>{return "invalid";});
            }else{
              user = await UserLogin.create({email: person['email'], person: person['id'],
                          loginType: "Facebook", issuer: "Facebook", token2: req.body.access_token,
                          issuer_unique_userid: profile['id'], mobile: profile['id'], 
              }).intercept('E_UNIQUE', (err)=> {
                if(err.attrNames[0]=="mobile"){
                  return {"code":"mobileAlreadyInUse", "msg": "Mobile number already registered"}
                }else{
                  return {"code":"emailAlreadyInUse", "msg": "Email already registered"};
                }
              })
              .intercept('UsageError', (err)=>{return "invalid";}).fetch();
            }

            person = await Person.findOne({id: person['id']}).populate("resources").populate("role");
            person.token = await sails.helpers.jwt.with({payload: {uid: person['id']}});        
            person.fbToken = await sails.helpers.firebaseTokenGenerator(person.id, {role: person.role.name})
            person.success = true;
            return res.successResponse(person, 200, null, true, "User created successfully created successfully");
          }
        }
      }else{
        return res.successResponse(null, 403, null, false, "Permission denied");
      }
    }catch(e){
      try{
        e['msg'] = e.raw.msg;
      }catch(e){}
      return res.successResponse(e, 500, null, false, e['msg']);
    }    
  }  
};