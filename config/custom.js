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

  RAZORPAY: {
    keyId: "rzp_test_OhtTwkr00dbNU1",
    keySecret: "ceaEtmg5bpuW11w6l565mt3U",
    url: {
      createOrder: "https://api.razorpay.com/v1/orders",
      capture: "https://api.razorpay.com/v1/payments/:payment_id/capture",
      paymentStatus: "https://api.razorpay.com/v1/payments/:payment_id",
      fetchPaymentsByOrderId: "https://api.razorpay.com/v1/orders/:order_id/payments"
    }
  },

  GOOGLE_RECAPTCHA_KEY: "",

  LINK_READ_LIMIT: 8
};
