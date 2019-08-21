var mongoose1 = require('../db');
Schema = mongoose1.Schema;

//Schema
const chatSchema = new mongoose1.Schema({
    fromUser : mongoose1.Schema.ObjectId,
    chatUniqueId : String,
    toUser : mongoose1.Schema.ObjectId,
    message : String,
    read_status : Boolean,
    users : [],
    image : String,
    fromDate : { type: Date, default: Date.now },
});

//Exported variable
var chat = mongoose1.model('Chats', chatSchema);

module.exports = chat;