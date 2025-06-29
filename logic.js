let rooms = [];
let roomCount = 0;

function joinRoom() {
    rooms.push({id: roomCount, players: [1]});
    roomCount++;
    return rooms.at(-1).id;
}

module.exports = { joinRoom }