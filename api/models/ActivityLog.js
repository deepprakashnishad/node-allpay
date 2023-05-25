module.exports = {

  attributes: {
    person: {model: "Person"},
    entityAffected: {type: "string"},
    actionType: {type: "string", isIn: ['CREATE', 'UPDATE', 'DELETE']},
    oldValue: {type: "json"},
    newValue: {type: "json"},
  },
};