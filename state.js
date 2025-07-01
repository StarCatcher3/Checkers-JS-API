let clients = new Map();
let roomSizes = new Map();
let rooms = new Map();
let roomPlaying = new Map();
let roomPlayerOrder = new Map();

function SendToRoom(roomId, json) {
    rooms.get(roomId).forEach((userId) => {
        socket = clients.get(userId);
        if (!socket) {
            console.log("Client not connected: " + userId);
            return;
        }
        socket.send(JSON.stringify(json));
    })
}

function GetRoomUsernames(roomId) {
    return Array.from(rooms.get(roomId)).map((userId) => {user = clients.get(userId); return user.username ? user.username : user.userId});
}

function IsRoomPlaying(roomId) {
    return roomPlaying.get(roomId);
}

function SetRoomPlaying(roomId, bool) {
    roomPlaying.set(roomId, bool);
}

module.exports = { clients, roomSizes, rooms, SendToRoom, GetRoomUsernames, IsRoomPlaying, SetRoomPlaying, roomPlayerOrder }