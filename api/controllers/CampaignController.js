module.exports = {
  create: async function (req, res) {
    const payload = await sails.helpers.verifyJwt.with({"token": req.headers.authorization})
    .intercept('invalidToken', ()=>{
          return res.successResponse({msg: "Permission denied 1"}, 403, null, false, "Permission denied 1");
        });
    if(payload){
      var campaign = req.body;
      campaign['owner'] = payload.uid;

      var campaign = await Campaign.create(campaign).fetch();
    }else{
      return res.successResponse({msg: "Permission denied"}, 403, null, false, "Permission denied");
    }
    return res.successResponse(campaign, 201, null, true, "Success");
  },

  update: async function(req, res){
    const payload = await sails.helpers.verifyJwt.with({"token": req.headers.authorization})
    .intercept('invalidToken', ()=>{
          return res.successResponse({msg: "Permission denied 1"}, 403, null, false, "Permission denied 1");
        });
    if(payload){
      var campaign = req.body;
      console.log(campaign['owner']);
      console.log(payload.uid);
      if(campaign['owner'] === payload.uid){
        console.log("Owner id and user id are same");
        campaign = await Campaign.updateOne({id: campaign.id, owner: campaign.owner}).set(campaign);
      }else{
        console.log("Owner id and user id are different")
      }

      // var campaign = await Campaign.create(campaign).fetch();
    }else{
      return res.successResponse({msg: "Permission denied"}, 403, null, false, "Permission denied");
    }
    return res.successResponse(campaign, 201, null, true, "Success"); 
  },

  list: async function(req, res){
    if(req.query){
      var campaigns = await Campaign.find({'cat': req.query.category});
      return res.successResponse(campaigns, 200, null, true, "Success"); 
    }else{
      return res.successResponse({msg: "Please provide category"}, 400, null, false, "Category missing"); 
    }
  },

  get: async function(req, res){
    var campaign = await Campaign.findOne({id:req.param('id')});
    res.successResponse(campaign, 200, null, true, "Campaign fetched");
  }
}