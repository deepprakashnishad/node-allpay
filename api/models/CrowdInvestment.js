/**
 * Person.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    pr:{ // Project
        model: "Project",
        required: true
    },
    p:{ // Person
        model:"Person",
        required: true
    },
    amt:{ // Amt invested
        type: "number",
        defaultsTo: 2000
    }
  },
};

