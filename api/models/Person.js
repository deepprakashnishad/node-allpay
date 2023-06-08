/**
 * Person.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    n:{ // Name
        type: "string",
        defaultsTo: "User"
    },
    m:{ // Mobile
        type:"string",
        required: true,
        unique: true
    },
    mv:{ // Is mobile verified
        type: "boolean",
        defaultsTo: true
    },
    e:{ // Email
        type:"string",
        isEmail: true,
        allowNull: true
    },
    ev:{ //Is email verified
        type: "boolean",
        defaultsTo:false
    },
    userLogin:{
        model: "userLogin",
    },
    r:{ //Role
        model: "role",
    },
    permissions:{
        collection: "permission",
        via:"persons"
    },
    p:{ //parent or referred by
        model: "person"
    },
    ul: { //Uplines
        collection: "person"
    },
    lwdlc:{ // Level wise downline count. Level 1(Direct downline) is index 0
        type: "json",
        defaultsTo: {}
    },
    s:{ //Status
        type: "string",
        isIn: ['APPROVAL_PENDING', 'ACTIVE', 'SUSPENDED', 'DELETED', 'BLACKLISTED'],
        defaultsTo: 'APPROVAL_PENDING'
    },
    pamt:{ //Paid Amount
        type: "number",
        defaultsTo: 0
    },  
    aw:{ //Amount Withdrawble
        type: "number",
        defaultsTo: 0
    },
    taw: { //Total amount withdrawn till date
        type: "number",
        defaultsTo: 0
    },
    tac: { //Total Amount collected - Coming through team growth
        type: "number",
        defaultsTo: 0
    },
    dq: { //Donation Quota
        type: "number",
        defaultsTo: 0
    },
    acnl: { //Amount collected for next level
        type: "number",
        defaultsTo: 0
    },
    ddl:{ //Direct downlines
        collection: "person"
    },
    ts:{ //Team Size
        type: "number",
        defaultsTo: 0
    },
    curr_orbit: {
        type: "number",
        defaultsTo: 0
    },
    pii: { // Projects invested in
        collection: "CrowdInvestment",
        via: "p"
    },
    pic: { //Profile pic url
        type: "json"
    },
    adh_f: { //Aadhar front Url
        type: "json"
    },
    adh_b: { //Aadhar back Url
        type: "json"
    },
    pan: { //Pan Card
        type: "json"
    }
  },
};

