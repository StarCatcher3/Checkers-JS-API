const express = require('express');
const cors = require('cors');
const app = express();

const { joinRoom } = require('./logic');
const { StartSocket } = require('./socket');

const port = process.env.port || 3000;
app.listen(port, () => {
    console.log(`Checkers API listening on port ${port}`);
})

app.use(express.json());
app.use(cors());

app.get('/', (req, res) =>{
    res.send("Connection successful!");
})

app.get('/join', (req, res) => {
    res.send(joinRoom());
})

StartSocket();