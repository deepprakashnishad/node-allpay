module.exports = {
    schema: true,
    attributes: {
        name: {
            type: "string",
            required: true
        },
        status: {
            type: "string",
            isIn: ['INACTIVE', 'ACTIVE'],
            defaultsTo: 'ACTIVE'
        },
        apikey: {
            type: "string",
            required: false
        },
        apisecret: {
            type: "string",
            required: false
        },
        comment: {
            type: "string"
        },
    }
};