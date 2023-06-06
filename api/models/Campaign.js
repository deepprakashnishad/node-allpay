/**
 * Person.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    title:{ // Title
        type: "string",
        required: true
    },
    desc:{ // Mobile
        type:"string",
        required: true
    },
    areqd:{ // Amt required
        type: "number",
        defaultsTo: 2000000
    },
    clct:{ //Collected Till date
        type: "number",
        defaultsTo:0
    },
    s:{ //Status
        type: "string",
        isIn: ['Active', 'Pending', 'Deleted', 'Paused', 'Suspended', 'Draft', 'Blacklisted'],
        defaultsTo: 'Active'
    },
    owner: {
        model: "Person",
        required: true  
    },
    cat: { //Category or Domain
        type: "string",
        required: true
    },
    expiryDate: {
        type:"number"
    }
  },
};

