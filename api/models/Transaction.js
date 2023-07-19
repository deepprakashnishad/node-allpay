/**
 * Person.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        v:{ // Person
            model: "Vendor",
            required: true
        },
        void:{ // Vendor Order Id
            type: "string",
            required: true
        },
        vuid: { // Vendor User Id
            type: "string",
            required: true  
        },
        vud: { // Vendor User Detail
            type: "json"
        },
        m: { //Merchant
            model: "Merchant"
        },
        a:{ // Amount
            type:"number",
            required: true
        },
        pg: { // Payment Gateway
            type: "string",
            required: true
        },
        pm: { //Payment Mode
            type: "string",
            required: true
        },
        pd: {
            type: "json"
        },
        ei: { // Extra Info
            type:"json"
        },
        c:{ // comment
            type: "string"
        },
    }
};

