let roomUsersReady = new Map();
let roomCount = 0;

const { clients, roomSizes, rooms, SendToRoom, GetRoomUsernames } = require('./state');
const { StartGame } = require('./gameManager');

function JoinRoom(userId, roomSize) {
    socket = clients.get(userId);
    if (!socket) {
        return "Client not connected";
    }

    // Check if the user is already in a room
    for (const [key, value] of rooms) {
        if (value.has(userId)) {
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
        if (roomSizes.get(key) == roomSize && value.size < roomSize) {
            value.add(userId);
            SendJoinMessage(socket, key);
            return;
        }
    }

    // Create a new room if neither of the previous cases
    roomUsers = new Set();
    roomUsers.add(userId);
    rooms.set(roomCount, roomUsers);
    roomUsersReady.set(roomCount, new Set());
    roomSizes.set(roomCount, roomSize);
    SendJoinMessage(socket, roomCount);
    roomCount++;
    return;
}

function SendJoinMessage(socket, roomId) {
    socket.send(JSON.stringify({
        joinRoom: true,
        roomSize: GetRoomSize(roomId),
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
        if (value.has(userId)) {
            if (value.size == GetRoomSize(key)) {
                roomUsersReady.get(key).clear();
            }
            value.delete(userId);
            socket.send(JSON.stringify({
                leaveRoom: true,
                message: "User left room " + key
            }));
            if (value.size == 0) {
                rooms.delete(key);
                roomUsersReady.delete(key);
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
    SendToRoom(roomId, {
        roomUpdate: true,
        users: GetRoomUsernames(roomId),
        readyUsers: GetRoomReadyUsernames(roomId)
    });
}

function UserReady(userId) {
    roomId = GetRoomId(userId);
    roomReadies = roomUsersReady.get(roomId);
    if (roomReadies) {
        roomReadies.add(userId);
        RoomUpdate(roomId);
        if (roomReadies.size == GetRoomSize(roomId)) {
            StartGame(roomId);
        }
    }
}

function UserNotReady(userId) {
    roomId = GetRoomId(userId);
    roomReadies = roomUsersReady.get(roomId);
    if (roomReadies && roomReadies.has(userId)) {
        roomReadies.delete(userId);
        RoomUpdate(roomId);
    }
}

function GetRoomId(userId) {
    for (const [key, value] of rooms) {
        if (value.has(userId)) {
            return key;
        }
    }
}

function GetRoomSize(roomId) {
    return roomSizes.get(roomId);
}

function GetRoomReadyUsernames(roomId) {
    return Array.from(roomUsersReady.get(roomId)).map((userId) => {user = clients.get(userId); return user.username ? user.username : user.userId});
}

module.exports = { JoinRoom, SendJoinMessage, LeaveRoom, GetRoomId, GetRoomSize, UserReady, UserNotReady }