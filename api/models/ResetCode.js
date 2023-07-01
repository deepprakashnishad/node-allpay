module.exports = {
  attributes: {
    username: {
        type: "String",
        required: true,
        unique: true,
        minLength: 3
    },
    email: {
        type: "String",
        unique: true,
        minLength: 3,
        allowNull: true
    },
    code: {
        type: "String",
        required: true,
        minLength: 6,
        maxLength: 6
    },
    expiryAt: {
      type: "number",
    }
  },
};