module.exports = {
  submitContactDetails: async function (req, res) {
    await NewContact.create(req.body);
    res.successResponse({"msg": "Details submitted successfully."}, 200, null, true, "Success");
  },

  wakeUp: async function(req, res){
    return res.ok(200);
  }
}