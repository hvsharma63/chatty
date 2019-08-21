var mongoose1 = require('../db');
Schema = mongoose1.Schema;

//Schema
const requestSchema = new mongoose1.Schema({
    fromUser : mongoose1.Schema.ObjectId,
    toUser : mongoose1.Schema.ObjectId,
    request_status : Boolean,
    request_sent : Boolean,
    reject_status : Boolean,
    read_status : Boolean,
    users : [],
    fromDate : { type: Date, default: Date.now },
});

//Exported variable
var requests = mongoose1.model('Requests', requestSchema);
module.exports = requests;