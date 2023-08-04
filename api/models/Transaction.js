/**
 * Person.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        bp:{ // Person
            model: "BettingPartner",
            required: true
        },
        poid:{ // Betting partner Order Id
            type: "string",
            required: true
        },
        puid: { // Partner User Id
            type: "string",
            required: true  
        },
        pud: { // Partner User Detail
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
        pd: { //Payment description
            type: "json"
        },
        ei: { // Extra Info
            type:"json"
        },
        c:{ // comment
            type: "string"
        },
        s: {
            type: "string"
        }
    }
};

