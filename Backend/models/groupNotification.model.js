var mongoose1 = require('../db');
Schema = mongoose1.Schema;

//Schema
const groupNotificationSchema = new mongoose1.Schema({
    group_id : mongoose1.Schema.ObjectId,
    read_by : [],
    created_at : { type: Date, default: Date.now },
});

//Exported variable
var groupNotification = mongoose1.model('groupNotifications', groupNotificationSchema);
module.exports = groupNotification;