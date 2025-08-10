const express = require('express');
const app = express();
const path = require('path');

app
.use(express.static(path.join(__dirname, 'public')))
.set('views', path.join(__dirname, 'views'))
.set('view engine', 'ejs');

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

const PORT = process.env.PORT || '8000';
app.set('port', PORT);

const http = require('http');
const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server);

let canvasLines = [];

io.on('connection', (socket) => {
    console.log('A user connected');
    
    socket.on('requestCanvas', () => {
        socket.emit('canvasState', canvasLines);
    });
    
    socket.on('drawing', (data) => {
        canvasLines.push(data);
        
        socket.broadcast.emit('drawing', data);
    });
    
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(PORT);

server.on('listening', () => {
    console.log(`Listening at port ${PORT}`);
});