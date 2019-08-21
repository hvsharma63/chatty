var mongoose1 = require('../db');
Schema = mongoose1.Schema;

//Schema
const groupChatSchema = new mongoose1.Schema({
    fromUser : String,
    group_id : mongoose1.Schema.ObjectId,
    message : String,
    image : String,
    read_by : [],
    fromDate : { type: Date, default: Date.now },
});

//Exported variable
var groupChat = mongoose1.model('GroupChats', groupChatSchema);
module.exports = groupChat;