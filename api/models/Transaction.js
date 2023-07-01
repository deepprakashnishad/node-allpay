/**
 * Person.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        p:{ // Person
            model: "Person",
            required: true
        },
        a:{ // Amount
            type:"number",
            required: true
        },
        c:{ // comment
            type: "string",
            defaultsTo: ""
        },
        c_d:{ //Credit or Debit
            type: "string",
            isIn: ['c', 'd'],
            defaultsTo: 'd'
        }
    }
};

