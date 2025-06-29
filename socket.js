
let clientCount = 0;
const sessionId = Math.random().toString(36).substring(2,6);

const { JoinRoom } = require('./logic');
const { clients } = require('./state');

const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 3000 });

server.on('connection', (socket) => {
    socket.userId = sessionId + clientCount;
    clientCount++;
    console.log("Client connected: " + socket.userId);
    socket.send(JSON.stringify(
        {
            userId: socket.userId
        }
    ))
    clients.set(socket.userId, socket);

    socket.on('message', (message) => {
        try {
            data = JSON.parse(message);

            // Assign UserId from an existing session
            if (data.oldUserId && data.newUserId) {
                if (data.oldUserId.substring(0, 4) == sessionId) {
                    socket.userId = data.oldUserId;
                    clients.delete(data.newUserId);
                    clients.set(data.oldUserId, socket);
                } else {
                    socket.send(JSON.stringify(
                        {
                            userId: socket.userId,
                            forceUserId: true
                        }
                    ))
                }
            }

            if (data.joinRoom && data.userId && data.roomSize) {
                JoinRoom(data.userId, data.roomSize);
            }

            // Show the message received in the console
            if (data.message) {
                console.log("Client Message: " + data.message);
                socket.send(JSON.stringify({
                    message: "Message Received from user " + socket.userId + "!"
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
        clients.delete(socket.userId); // to be moved elsewhere
    })
})