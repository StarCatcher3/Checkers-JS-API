let clients = new Map();
let clientCount = 0;

function StartSocket() {
    const WebSocket = require('ws');
    const server = new WebSocket.Server({ port: 3001 });

    server.on('connection', (socket) => {
        socket.userId = "user" + clientCount;
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
                if (data.oldUserId && data.newUserId) {
                    socket.userId = data.oldUserId;
                    clients.delete(data.newUserId);
                    clients.set(data.oldUserId, socket);
                }
                if (data.message) {
                    console.log("Client Message: " + data.message);
                    socket.send(JSON.stringify({
                        message: "Message Received from " + socket.userId + "!"
                    }));
                }
                socket.send(JSON.stringify({
                    message: "All Connected Clients: " + Array.from(clients.keys()).toString()
                }));
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
}

module.exports = { StartSocket, clients }