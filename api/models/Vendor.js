module.exports = {

    attributes: {
        name: {
            type: "string",
            required: true
        },
        status: {
            type: "string",
            isIn: ["ACTIVE", "INACTIVE"],
            defaultsTo: "ACTIVE"
        }
    }
};
