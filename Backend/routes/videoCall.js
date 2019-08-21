exports = module.exports = function(io){
    const RoomService = require('./RoomService')(io);
    io.sockets.on('connection', RoomService.listen);
    io.sockets.on('error', e => console.log(e));
};