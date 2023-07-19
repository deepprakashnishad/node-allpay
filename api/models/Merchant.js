module.exports = {
  attributes: {
    name: {
      type: "string",
      required: true
    },
    website: {
      type: "string",
      required: true
    },
    pgs: {
      collection: "PaymentGateway"
    },
    status: {
        type: "string",
        isIn: ['INACTIVE', 'ACTIVE'],
        defaultsTo: 'ACTIVE'
    },
  }
};