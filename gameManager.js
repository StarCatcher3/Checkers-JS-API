const { rooms, SendToRoom, GetUsernames } = require("./state");

function StartGame(roomId) {
    console.log("Starting game");
    let room = rooms.get(roomId);
    room.playerOrder = [];
    GetUsernames(room.users).forEach(user => {
        room.playerOrder.push(user);
    });
    room.playersLeft = Array.from({ length: room.size }, (_, i) => i);
    room.activePlayerId = 0;
    room.gameOver = false;

    newCheckers = new Set();
    switch (room.size) {
        case 2:
            for (i = 0; i < 8; i++) {
                for (j = 0; j < 3; j++) {
                    if ((i + j) % 2 == 0) {
                        newCheckers.add({x: i, y: j, p: 0, king: false});
                    }
                }
                for (j = 5; j < 8; j++) {
                    if ((i + j) % 2 == 0) {
                        newCheckers.add({x: i, y: j, p: 1, king: false});
                    }
                }
            }
            break;
        case 4:
            for (i = 3; i < 11; i++) {
                for (j = 0; j < 3; j++) {
                    if ((i + j) % 2 == 0) {
                        newCheckers.add({x: i, y: j, p: 0, king: false});
                    }
                }
                for (j = 11; j < 14; j++) {
                    if ((i + j) % 2 == 0) {
                        newCheckers.add({x: i, y: j, p: 2, king: false});
                    }
                }
            }
            for (i = 3; i < 11; i++) {
                for (j = 0; j < 3; j++) {
                    if ((i + j) % 2 == 0) {
                        newCheckers.add({x: j, y: i, p: 1, king: false});
                    }
                }
                for (j = 11; j < 14; j++) {
                    if ((i + j) % 2 == 0) {
                        newCheckers.add({x: j, y: i, p: 3, king: false});
                    }
                }
            }
            break;
        case 6:
            for (i = 0; i < 8; i++) {
                for (j = 0; j < 3; j++) {
                    if ((i + j) % 2 == 0) {
                        newCheckers.add({x: i, y: j, p: 0, z: 0, king: false});
                        newCheckers.add({x: i, y: j, p: 1, z: 1, king: false});
                        newCheckers.add({x: i, y: j, p: 2, z: 2, king: false});
                        newCheckers.add({x: i, y: j, p: 3, z: 3, king: false});
                        newCheckers.add({x: i, y: j, p: 4, z: 4, king: false});
                        newCheckers.add({x: i, y: j, p: 5, z: 5, king: false});
                    }
                }
            }
            break;
    }
    room.checkers = newCheckers;

    room.playing = true;
    SendInitialStates(roomId);
}

function SendInitialStates(roomId) {
    SendToRoom(roomId, {
        gameStart: true,
        playerOrder: rooms.get(roomId).playerOrder
    });
    UpdateGameState(roomId);
}

function SendInitialStatesToUser(roomId, socket) {
    let room = rooms.get(roomId);
    socket.send(JSON.stringify({
        gameStart: true,
        playerOrder: room.playerOrder
    }));
    socket.send(JSON.stringify({
        gameStateUpdate: true,
        checkers: Array.from(room.checkers),
        playerId: room.activePlayerId
    }));
    socket.send(JSON.stringify({
        gameStateUpdate: true,
        checkers: Array.from(room.checkers),
        playerId: room.activePlayerId
    }));
}

function UpdateGameState(roomId) {
    let room = rooms.get(roomId);
    SendToRoom(roomId, {
        gameStateUpdate: true,
        checkers: Array.from(room.checkers),
        playerId: room.activePlayerId
    });
}

function UpdatePlayersLeft(roomId) {
    let room = rooms.get(roomId);
    SendToRoom(roomId, {
        playersLeft: room.playersLeft
    });
}

function UpdateCheckers(roomId, newCheckers) {
    let room = rooms.get(roomId);
    room.checkers = new Set(newCheckers);
    let playersLeft = [];
    for (const checker of newCheckers) {
        if (!playersLeft.includes(checker.p)) {
            playersLeft.push(checker.p);
        }
    };
    if (playersLeft.length < room.playersLeft.length) {
        room.playersLeft = playersLeft;
        UpdatePlayersLeft(roomId);
    }

    if (room.playersLeft.length > 1) {
        UpdateActivePlayer(room);
        UpdateGameState(roomId);
    } else {
        EndGame(roomId, room.playersLeft[0]);
    }
}

function UpdateActivePlayer(room) {
    newActivePlayer = room.activePlayerId + 1;
    if (newActivePlayer >= room.size) {
        room.activePlayerId = 0;
    } else {
        room.activePlayerId = newActivePlayer;
    }
    if (!room.playersLeft.includes(room.activePlayerId)) {
        UpdateActivePlayer(room);
    }
}

function EndGame(roomId, playerId) {
    console.log("Ending Game, the winner is: " + playerId);
    let room = rooms.get(roomId);
    SendToRoom(roomId, {
        gameEnd: true,
        checkers: Array.from(room.checkers),
        winnerId: playerId
    });
    room.usersReady = new Set();
    room.gameOver = true;
}

module.exports = { StartGame, EndGame, SendInitialStates, SendInitialStatesToUser, UpdateCheckers }