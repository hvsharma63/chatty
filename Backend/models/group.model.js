var mongoose1 = require('../db');
Schema = mongoose1.Schema;

//Schema
const groupchatSchema = new mongoose1.Schema({
    created_by : mongoose1.Schema.ObjectId,
    group_name : String,
    group_members : [],
    group_image : String,
    created_at : { type: Date, default: Date.now },
});

//Exported variable
var group = mongoose1.model('groups', groupchatSchema);
module.exports = group;