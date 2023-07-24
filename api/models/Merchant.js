module.exports = {
  schema: true,
  attributes: {
    name: {
      type: "string",
      required: true
    },
    website: {
      type: "string",
      required: true
    },
    plp: { //Payment Landing Page
      type: "string",
      defaultsTo: ""
    },
    pgs: {
      collection: "PaymentGateway"
    },
    status: {
      type: "string",
      isIn: ['INACTIVE', 'ACTIVE'],
      defaultsTo: 'ACTIVE'
    },
    passcode: {
      type: "string"  
    }
  }
};