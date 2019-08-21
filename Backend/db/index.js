var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

//Connection String
var connection = mongoose.connect('mongodb://localhost:27017/message',{useNewUrlParser:true} )
.then(() => console.log("Connected To Mongoose"))
.catch(err => console.error("Can't connect ",err));

//Exported variable
module.exports = connection;
module.exports = mongoose;
 