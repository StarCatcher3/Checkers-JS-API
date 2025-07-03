let roomCount = 0;

const { clients, rooms, SendToRoom, GetUsernames, IsRoomPlaying } = require('./state');
const { StartGame, EndGame } = require('./gameManager');

function JoinRoom(userId, roomSize) {
    socket = clients.get(userId);
    if (!socket) {
        return "Client not connected";
    }

    // Check if the user is already in a room
    for (const [key, value] of rooms) {
        if (value.users.has(userId)) {
            socket.send(JSON.stringify({
                joinRoom: false,
                roomId: key,
                message: "User already in room " + key
            }));
            return;
        }
    }

    // Check for any rooms that still have space
    for (const [key, value] of rooms) {
        if (value.size == roomSize && value.users.size < roomSize) {
            value.users.add(userId);
            SendJoinMessage(socket, key);
            return;
        }
    }

    // Create a new room if neither of the previous cases
    rooms.set(roomCount, {users: new Set([userId]), usersReady: new Set(), size: roomSize});
    SendJoinMessage(socket, roomCount);
    roomCount++;
    return;
}

function SendJoinMessage(socket, roomId) {
    socket.send(JSON.stringify({
        joinRoom: true,
        roomSize: rooms.get(roomId).size,
        message: "User entering room " + roomId
    }));
    RoomUpdate(roomId);
}

function LeaveRoom(userId) {
    console.log(userId + " is leaving the room");
    socket = clients.get(userId);
    if (!socket) {
        return "Client not connected";
    }
    for (const [key, value] of rooms) {
        if (value.users.has(userId)) {
            if (value.users.size == value.size) {
                value.usersReady.clear();
            }
            if (IsRoomPlaying(key)) {
                EndGame(key);
            }
            value.users.delete(userId);
            if (socket.userId == userId) {
                socket.send(JSON.stringify({
                    leaveRoom: true,
                    message: "User left room " + key
                }));
            }
            if (value.users.size == 0) {
                rooms.delete(key);
            } else {
                RoomUpdate(key);
            }
            return;
        }
    }
    // In case the user happened to not actually be in a room
    socket.send(JSON.stringify({
        leaveRoom: true,
        message: "User was not in a room"
    }));
}

function RoomUpdate(roomId) {
    let room = rooms.get(roomId);
    SendToRoom(roomId, {
        roomUpdate: true,
        users: GetUsernames(room.users),
        readyUsers: GetUsernames(room.usersReady)
    });
}

function UserReady(userId) {
    let roomId = GetRoomId(userId);
    let room = rooms.get(roomId);
    if (room.usersReady) {
        room.usersReady.add(userId);
        RoomUpdate(roomId);
        if (room.usersReady.size == room.size) {
            StartGame(roomId);
        }
    }
}

function UserNotReady(userId) {
    let roomId = GetRoomId(userId);
    let room = rooms.get(roomId);
    if (room.usersReady && room.usersReady.has(userId)) {
        room.usersReady.delete(userId);
        RoomUpdate(roomId);
    }
}

function GetRoomId(userId) {
    for (const [key, value] of rooms) {
        if (value.users.has(userId)) {
            return key;
        }
    }
}

module.exports = { JoinRoom, SendJoinMessage, LeaveRoom, GetRoomId, UserReady, UserNotReady }