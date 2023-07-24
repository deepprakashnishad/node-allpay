module.exports = {
  schema: true,
  attributes: {
    m: {
      model: "Merchant"
    },
    pg: {
      model: "PaymentGateway"
    },
    dcoll: { //Today's collection
      type: "number",
      defaultsTo: 0
    },
    wcoll: { //Week's collection
      type: "number",
      defaultsTo: 0
    },
    mcoll: { // Month's collection
      type: "number",
      defaultsTo: 0
    },
    dTrans: { //Today's number of transactions
      type: "number",
      defaultsTo: 0
    },
    wTrans: { //Week's collection
      type: "number",
      defaultsTo: 0
    },
    mTrans: { // Month's collection
      type: "number",
      defaultsTo: 0
    },
    priority: {
      type: "number",
      defaultsTo: 0
    },
    status: {
        type: "string",
        isIn: ['INACTIVE', 'ACTIVE'],
        defaultsTo: 'ACTIVE'
    },
  }
};