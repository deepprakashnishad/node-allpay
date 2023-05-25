module.exports.sendForgotPassword = function(obj) {
 sails.hooks.email.send(
 	"forgotPassword", 
 	{
 		name: obj.name,
 		code: obj.code
 	},
 	{
		to: obj.email,
		subject: "Everything Satvik - Reset password"
 	},
	function(err) {console.log(err ||"Mail Sent!");}
	)
}

module.exports.sendFeedbackMail = function(obj) {
 sails.hooks.email.send(
 	"feedback", 
 	{
 		title: obj.title,
 		comment: obj.comment,
 		name: obj.name,
 		mobile: obj.mobile
 	},
 	{
		to: obj.email,
		subject: obj.subject
 	},
	function(err) {console.log(err ||"Mail Sent!");}
	)
}

module.exports.sendPasswordUpdatedMail = function(obj) {
 sails.hooks.email.send(
 	"passwordUpdated", 
 	{
 		name: obj.name,
 	},
 	{
		to: obj.email,
		subject: obj.subject
 	},
	function(err) {console.log(err ||"Mail Sent!");}
	)
}

module.exports.sendOrderConfirmationMail = function(recipient, order) {
 	sails.hooks.email.send(
 	"orderConfirmation", 
 	{
 		orderId: order.id,
 		address: order.fulfillment,
 		totalAmount: order.netPrice,
 		personName: order.personId.name,
 		deliveryCharge: order.deliveryCharge,
 		items: order.items,
 	},
 	{
		to: order.personId.email,
		subject: "Order confirmation"
 	},
	function(err) {console.log(err ||"Mail Sent!");}
	)
}