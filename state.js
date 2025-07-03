let clients = new Map();
let rooms = new Map();

function SendToRoom(roomId, json) {
    rooms.get(roomId).users.forEach((userId) => {
        socket = clients.get(userId);
        if (!socket) {
            console.log("Client not connected: " + userId);
            return;
        }
        socket.send(JSON.stringify(json));
    })
}

function GetUsernames(userIds) {
    return Array.from(userIds).map((userId) => {user = clients.get(userId); return user.username ? user.username : user.userId});
}

function IsRoomPlaying(roomId) {
    let room = rooms.get(roomId);
    return room.playing && !room.gameOver;
}

module.exports = { clients, rooms, SendToRoom, GetUsernames, IsRoomPlaying }