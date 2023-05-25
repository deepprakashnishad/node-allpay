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
    fixed:{ // Fixed Cost
        type:"number",
        defaultsTo: 1200000
    },
    rCost:{
        type: "number",
        defaultsTo:800000
    },
    clct:{ //Collected Till date
        type: "number",
        defaultsTo:0
    },
    bplan:{ //Business Plan
        type: "string",
    },
    usp:{ // Unique selling point of bussiness
        type: "string"
    },
    aroi:{ //Annual ROI
        type: "number",
        defaultsTo:60
    },
    sTime:{ //Setup Time in days
        type: "number",
        defaultsTo: 90
    },
    bTime: { //Breakeven time in days
        type: "number",
        defaultsTo: 365
    },
    s:{ //Status
        type: "string",
        isIn: ['Active', 'Pending', 'Deleted'],
        defaultsTo: 'Active'
    },
    owner: {
        model: "Person",
        required: true  
    },
    invl: {//Investors list 
        collection: "CrowdInvestment",
        via: "pr"
    }
  },
};

