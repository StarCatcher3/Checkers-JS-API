
let clientCount = 0;
const sessionId = Math.random().toString(36).substring(2,6);

const { SendInitialStates, UpdateCheckers } = require('./gameManager');
const { JoinRoom, SendJoinMessage, LeaveRoom, GetRoomId, UserReady, UserNotReady } = require('./roomManager');
const { IsRoomPlaying, clients } = require('./state');

const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 3000 });

server.on('connection', (socket) => {

    socket.on('message', (message) => {
        try {
            data = JSON.parse(message);

            // Update Username
            if (data.username) {
                socket.username = data.username;
            }

            // Assign UserId from an existing session
            if (data.firstConnection) {
                currentRoom = null;
                if (data.oldUserId && data.oldUserId.substring(0, 4) == sessionId) {
                    socket.userId = data.oldUserId;
                    currentRoom = GetRoomId(socket.userId);
                } else {
                    socket.userId = sessionId + clientCount;
                    clientCount++;
                    socket.send(JSON.stringify(
                        {
                            userId: socket.userId
                        }
                    ))
                }
                clients.set(socket.userId, socket);
                console.log("Client connected: " + socket.userId);
                if (currentRoom != null) {
                    SendJoinMessage(socket, currentRoom);
                    if (IsRoomPlaying(currentRoom)) {
                        SendInitialStates(currentRoom);
                    }
                }
            }

            // Manage Join Room Requests
            if (data.joinRoom && data.userId && data.roomSize) {
                JoinRoom(data.userId, data.roomSize);
            }

            // Manage Leave Room Requests
            if (data.leaveRoom && data.userId) {
                LeaveRoom(data.userId);
            }

            if (data.ready) {
                UserReady(socket.userId);
            }

            if (data.notReady) {
                UserNotReady(socket.userId);
            }

            if (data.gameStateUpdate) {
                UpdateCheckers(GetRoomId(socket.userId), data.checkers);
            }

            // Show the message received in the console
            if (data.message) {
                console.log("Client Message: " + data.message);
                socket.send(JSON.stringify({
                    message: "Message Received from user " + (socket.username ? socket.username : socket.userId) + "!"
                }));
            }
            
            /* 
            socket.send(JSON.stringify({
                message: "All Connected Clients: " + Array.from(clients.keys()).toString()
            })); */

        } catch (error) {
            socket.send(JSON.stringify({
                message: error.message
            }));
        }
    })

    socket.on('close', () => {
        console.log("Client disconnected: " + socket.userId);
        //clients.delete(socket.userId); // to be moved elsewhere
    })
})