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
    for (const [key, value] of rooms) {
        if (value.has(userId)) {
            socket.send(JSON.stringify({
                message: "User already in room " + key
            }));
            return;
        }
    }
    console.log(userId + " is not already in a room");
    for (const [key, value] of rooms) {
        if (roomSizes.get(key) == roomSize && value.size < roomSize) {
            socket.send(JSON.stringify({
                message: "User joining room " + key
            }));
            value.add(userId);
            return;
        }
    }


    console.log("A new room is being created for " + userId);
    roomUsers = new Set();
    roomUsers.add(userId);
    rooms.set(roomCount, roomUsers);
    roomSizes.set(roomCount, roomSize);
    socket.send(JSON.stringify({
        message: "User joining room " + roomCount
    }));
    roomCount++;
    rooms.forEach((value, key) => {
        console.log("Room " + key + ": size" + roomSizes.get(key) + ": " + Array.from(value).toString());
    });
    return;
}

module.exports = { JoinRoom }