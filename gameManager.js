let checkers = new Map();
let activePlayerId = new Map();

const { roomSizes, SendToRoom, GetRoomUsernames, SetRoomPlaying, roomPlayerOrder } = require("./state");

function StartGame(roomId) {
    console.log("Starting game");
    playerOrder = [];
    GetRoomUsernames(roomId).forEach(user => {
        playerOrder.push(user);
    });
    roomPlayerOrder.set(roomId, playerOrder);
    activePlayerId.set(roomId, 0);

    newCheckers = new Set();
    switch (roomSizes.get(roomId)) {
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
            for (i = 4; i < 12; i++) {
                for (j = 0; j < 3; j++) {
                    if ((i + j) % 2 == 0) {
                        newCheckers.add({x: i, y: j, p: 0, king: false});
                    }
                }
                for (j = 13; j < 16; j++) {
                    if ((i + j) % 2 == 0) {
                        newCheckers.add({x: i, y: j, p: 2, king: false});
                    }
                }
            }
            for (i = 4; i < 12; i++) {
                for (j = 0; j < 3; j++) {
                    if ((i + j) % 2 == 0) {
                        newCheckers.add({x: j, y: i, p: 1, king: false});
                    }
                }
                for (j = 13; j < 16; j++) {
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
    checkers.set(roomId, newCheckers);

    SetRoomPlaying(roomId, true);
    SendInitialStates(roomId);
}

function SendInitialStates(roomId) {
    SendToRoom(roomId, {
        gameStart: true,
        playerOrder: roomPlayerOrder.get(roomId),
        message: "Initial Game State"
    });
    UpdateGameState(roomId);
}

function UpdateGameState(roomId) {
    SendToRoom(roomId, {
        gameStateUpdate: true,
        checkers: Array.from(checkers.get(roomId)),
        playerId: activePlayerId.get(roomId),
        message: "Game State Update"
    });
}

function UpdateCheckers(roomId, newCheckers) {
    newActivePlayer = activePlayerId.get(roomId) + 1;
    if (newActivePlayer >= roomSizes.get(roomId)) {
        activePlayerId.set(roomId, 0);
    } else {
        activePlayerId.set(roomId, newActivePlayer);
    }
    checkers.set(roomId, new Set(newCheckers));
    UpdateGameState(roomId);
}

module.exports = { StartGame, SendInitialStates, UpdateCheckers }