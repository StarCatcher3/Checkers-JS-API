let rooms = new Map();
let roomSizes = new Map();
let roomCount = 0;

const { clients } = require('./state');

function JoinRoom(userId, roomSize) {
    console.log(userId + " is joining a room of size " + roomSize);
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
    console.log(userId + " is not already in a room");
    for (const [key, value] of rooms) {
        if (roomSizes.get(key) == roomSize && value.size < roomSize) {
            socket.send(JSON.stringify({
                joinRoom: true,
                roomId: key,
                roomSize: roomSize,
                message: "User joining room " + key
            }));
            value.add(userId);
            RoomUpdate(key);
            return;
        }
    }

    // Create a new room if neither of the previous cases
    console.log("A new room is being created for " + userId);
    roomUsers = new Set();
    roomUsers.add(userId);
    rooms.set(roomCount, roomUsers);
    roomSizes.set(roomCount, roomSize);
    socket.send(JSON.stringify({
        joinRoom: true,
        roomId: roomCount,
        roomSize: roomSize,
        message: "User joining room " + roomCount
    }));
    roomCount++;
    rooms.forEach((value, key) => {
        console.log("Room " + key + ": size" + roomSizes.get(key) + ": " + Array.from(value).toString());
    });
    return;
}

function LeaveRoom(userId) {
    console.log(userId + " is leaving the room");
    socket = clients.get(userId);
    if (!socket) {
        return "Client not connected";
    }
    for (const [key, value] of rooms) {
        if (value.has(userId)) {
            value.delete(userId);
            socket.send(JSON.stringify({
                leaveRoom: true,
                message: "User left room " + key
            }));
            if (value.size == 0) {
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
    console.log("Room Update Information triggered");
    rooms.get(roomId).forEach((userId) => {
        socket = clients.get(userId);
        if (!socket) {
            console.log("Client not connected");
            return;
        }
        socket.send(JSON.stringify({
            RoomUpdate: true,
            message: "Users in this room: " + Array.from(rooms.get(roomId)).map((userId) => {user = clients.get(userId); return user.username ? user.username : user.userId}).toString()
        }));
    })
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

module.exports = { JoinRoom, LeaveRoom, GetRoomId, GetRoomSize }