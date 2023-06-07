module.exports = {
  attributes: {
    person: {
        model: "person",
        required: true
    },
    amount: {
        type: "number",
        required: true
    },
    s: {
        type: "string",
        isIn: ['created', 'authorized', 'captured', 'refunded', 'failed'],
        defaultsTo: "created"
    },
    method: {
        type: "string",
        isIn: ['card', 'netbanking', 'wallet', 'upi']
    },
    oid: {
        type: "string"
    },
    desc:{
        type: "string"  
    },
    international:{
        type: "boolean",
        defaultsTo: false
    },
    pfee:{
        type: "number"
    },
    product:{
        type: "string"
    },
    prodid: {
        type: "string"
    },
    notes: {
        type: "json"
    }
  }
};