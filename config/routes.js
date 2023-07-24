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

  'POST /Merchant': {controller: "Merchant", action: "create"},
  'PATCH /Merchant': {controller: "Merchant", action: "update"},
  'DELETE /Merchant/:id': {controller: "Merchant", action: "delete"},
  'GET /Merchant': {controller: "Merchant", action: "get"},
  'GET /Merchant/getPartners': {controller: "Merchant", action: "getPartners"},
  'POST /Merchant/generateMerchantToken': {controller: "Merchant", action: "generateMerchantToken"},

  'POST /PaymentGateway': {controller: "PaymentGateway", action: "create"},
  'PATCH /PaymentGateway': {controller: "PaymentGateway", action: "update"},
  'DELETE /PaymentGateway/:id': {controller: "PaymentGateway", action: "delete"},
  'GET /PaymentGateway': {controller: "PaymentGateway", action: "get"},
  'GET /PaymentGateway/availablePGM': {controller: "PaymentGateway", action: "availablePGM"},
  'PATCH /PaymentGateway/initializePGM': {controller: "PaymentGateway", action: "initializePGM"},
  'POST /PaymentGateway/redirectToPayment': {controller: "PaymentGateway", action: "redirectToPayment"},

  'POST /BettingPartner': {controller: "BettingPartner", action: "create"},
  'PATCH /BettingPartner': {controller: "BettingPartner", action: "update"},
  'DELETE /BettingPartner/:id': {controller: "BettingPartner", action: "delete"},
  'GET /BettingPartner': {controller: "BettingPartner", action: "get"},
  'POST /BettingPartner/generatePartnerToken': {controller: "BettingPartner", action: "generatePartnerToken"},

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
  'GET /Person/getCustomers': {controller: "Person", action:"getCustomers"},  
  'GET /Person/queryCustomers': {controller: "Person", action:"queryCustomers"},  
  'GET /Person/get': {controller: "Person", action:"fetchFilteredList"},
  'GET /Person/getTransactions': {controller: "Person", action:"getTransactions"},  
  'PATCH /Person/assignPermission': {controller: "Person", action:"assignPermissionToPerson"},  
  'PATCH /Person/removePermission': {controller: "Person", action:"removePermissionFromPerson"}, 
  'PATCH /Person/updatePermissionCollection': {controller: "Person", action:"updatePermissions"},
  'POST /Person/updateProfileImages': {controller: "Person", action: "updateProfileImages"},

  'POST /Payment': {controller: "Payment", action:"create"}, 
  'POST /Payment/verifyRazorpayPayment': {controller: "Payment", action:"verifyRazorpayPayment"}, 

  'GET /Report/daily-transaction-report': {controller: "Report", action: "getDailyTransactionReport"},
  'GET /Report/global-earning-report': {controller: "Report", action: "getGlobalEarningReport"},

  'POST /Transaction': {controller: "Transaction", action:"create"}, 

  'POST /Generic/submit-contact-details': {controller: "Generic", action:"submitContactDetails"}, 
};
//Added to restart server