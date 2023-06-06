/**
 * Custom configuration
 * (sails.config.custom)
 *
 * One-off settings specific to your application.
 *
 * For more information on custom configuration, visit:
 * https://sailsjs.com/config/custom
 */

module.exports.custom = {

  /***************************************************************************
  *                                                                          *
  * Any other custom config this Sails app should use during development.    *
  *                                                                          *
  ***************************************************************************/
  // mailgunDomain: 'transactional-mail.example.com',
  // mailgunSecret: 'key-testkeyb183848139913858e8abd9a3',
  // stripeSecret: 'sk_test_Zzd814nldl91104qor5911gjald',
  // …
  baseurl: 'http://localhost:1337',
  enableActivityLog: true,

  APP_CONFIG: {
    authentication: [
      // "email",
      "mobile"
    ]
  },

  GOOGLE_RECAPTCHA_KEY: "",

  MAX_DIST_LEVEL: 9,

  DIST_PERCENT: [50, 10, 5, 5, 2, 4, 2, 5, 2],

  REGISTRATION_CHARGE: 2000
};
