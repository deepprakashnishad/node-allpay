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
    e:{ // Email
        type:"string",
        isEmail: true,
        allowNull: true
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
    s:{ //Status
        type: "string",
        isIn: ['APPROVAL_PENDING', 'ACTIVE', 'SUSPENDED', 'DELETED', 'BLACKLISTED'],
        defaultsTo: 'APPROVAL_PENDING'
    },
    pic: { //Profile pic url
        type: "json"
    },
  },
};

