module.exports = {
	attributes:{
		dc: { // Businesswise distributed collection
			type: "json",
			defaultsTo: {}
		},
		tc: { // Total collection
			type: "number",
			defaultsTo: 0
		},
		ged: { // Global earning date
			type: "string",
			required: true
		},
		ds:{ // Distribution Status
			type: "string",
			isIn: ['p', 'd'], //p - Pending, d - Distributed
			defaultsTo: "p"
		},
		dpd: { //Distribution person detail
			type: "json"	
		},
		dad: { //Levelwise amount distribution
			type: "json"	
		},
	}
}