/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` your home page.            *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  '/': { view: 'pages/homepage' },

  'POST /OTP/verifyOTPAndSignIn': {controller: "OTP", action: "verifyOTPAndSignIn"},
  'POST /OTP/requestOTP': {controller: "OTP", action: "requestOTP"},

  'POST /UserLogin': {controller: "UserLogin", action:"signup"},
  'DELETE /UserLogin/:personId': {controller: "UserLogin", action:"delete"},
  'PUT /UserLogin': {controller: "UserLogin", action:"update"},
  'PUT /UserLogin/resetUserPasswordByAdmin': {controller: "UserLogin", action:"resetUserPasswordByAdmin"},
  'POST /UserLogin/login': {
      controller: "UserLogin", 
      action:"login"
  },
  'POST /UserLogin/resetPassword': {controller: "UserLogin", action:"sendResetPasswordCode"},
  'POST /UserLogin/updatePasswordWithResetCode': {controller: "UserLogin", action:"updatePasswordWithResetCode"},

  'POST /Role': {controller: "Role", action:"create"},
  'DELETE /Role/:id': {controller: "Role", action:"delete"},
  'PUT /Role': {controller: "Role", action:"update"},
  'PUT /Role/updatePermissionCollection': {controller: "Role", action:"updateRolePermissions"},
  'GET /Role': {controller: "Role", action:"get"},

  'POST /Permission': {controller: "Permission", action:"create"},
  'DELETE /Permission/:id': {controller: "Permission", action:"delete"},
  'PUT /Permission': {controller: "Permission", action:"update"},
  'GET /Permission': {controller: "Permission", action:"get"},

  'POST /Person': {controller: "Person", action:"create"},
  'DELETE /Person/:id': {controller: "Person", action:"delete"},
  'PUT /Person': {controller: "Person", action:"update"},  
  'GET /Person': {controller: "Person", action:"get"},
  'GET /Person/getUserDetail': {controller: "Person", action:"getUserDetail"},
  'GET /Person/getReferrer': {controller: "Person", action:"getReferrer"},
  'GET /Person/getCustomers': {controller: "Person", action:"getCustomers"},  
  'GET /Person/queryCustomers': {controller: "Person", action:"queryCustomers"},  
  'GET /Person/getTotalCustomers': {controller: "Person", action:"getTotalCustomers"},  
  'GET /Person/updatePersonPlatform': {controller: "Person", action:"updatePersonPlatform"},  
  'GET /Person/get': {controller: "Person", action:"fetchFilteredList"},  
  'PATCH /Person/assignPermission': {controller: "Person", action:"assignPermissionToPerson"},  
  'PATCH /Person/removePermission': {controller: "Person", action:"removePermissionFromPerson"}, 
  'PATCH /Person/updatePermissionCollection': {controller: "Person", action:"updatePermissions"},
  'POST /Person/approveNewJoinee': {controller: "Person", action:"approveNewJoinee"},
  'POST /Person/updateProfileImages': {controller: "Person", action: "updateProfileImages"},

  'POST /Admin/approveRegistration': {controller: "Admin", action:"approveRegistration"}, 
  'POST /Admin/nextOrbitActivation': {controller: "Admin", action:"nextOrbitActivation"}, 
  'GET /Admin/distributeGlobalCommission': {controller: "Admin", action:"distributeGlobalCommission"}, 

  'POST /Campaign': {controller: "Campaign", action:"create"}, 
  'PATCH /Campaign': {controller: "Campaign", action:"update"},
  'DELETE /Campaign': {controller: "Campaign", action:"delete"},
  'GET /Campaign': {controller: "Campaign", action:"list"},
  'GET /Campaign/:id': {controller: "Campaign", action:"get"},

  'POST /Payment': {controller: "Payment", action:"create"}, 
  'POST /Payment/verifyRazorpayPayment': {controller: "Payment", action:"verifyRazorpayPayment"}, 

  'POST /Generic/submit-contact-details': {controller: "Generic", action:"submitContactDetails"}, 

  'GET /Test/firebase': { controller: "TestController", action: "initializeFirebase"}
};
//Added to restart server