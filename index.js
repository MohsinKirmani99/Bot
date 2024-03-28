// const express= require("express")
// const http= require("http")
// const app= express()
// const server= http.createServer(app)
// const path= require("path")
// const {Server}= require("socket.io")

// const io= new Server(server);
// app.use(express.static(path.resolve('./public')))

// io.on('connection',(socket)=>{
//     //console.log("new user found",socket.id)
//     socket.on('user-message',(message) =>{
//         //console.log('Message received',message)
//         io.emit('message',message)
// })
// })

// app.get('/',(req,res)=>{
//     return res.sendFile('/public/index.html')
// })

// server.listen(4000,()=>{
//     console.log("server is running on port 4000");
// })

const express = require('express');
const http = require('http');
const multer = require('multer');
const socketio = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
app.use(express.static(path.resolve('./public')))
// Set storage engine
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Init Upload
const upload = multer({
    storage: storage
}).single('file');

//Socket.io
// io.on('connection', (socket) => {
//     console.log('New WS Connection...');

//     socket.on('chatMessage', (msg) => {
//         io.emit('message', msg);
//     });

//     socket.on('fileUploaded', (filename) => {
//         io.emit('file', filename);
//     });
// });

// Handle socket connections
// io.on('connection', (socket) => {
//     console.log('New WS Connection...',socket.id);

//     // Handle joining room
//     socket.on('joinRoom', (roomId) => {
//         socket.join(roomId);
//         //console.log("roomID",roomId)
//     });

//     // Handle chat messages
//     socket.on('chatMessage', (msg, roomId) => {
//         io.to(roomId).emit('message', msg);
//     });

//     // Handle file uploads
//     socket.on('fileUploaded', (filename, roomId) => {
//         io.to(roomId).emit('file', filename);
//     });

//     // Disconnect event
//   socket.on('disconnect', () => {
//     console.log('User disconnected:', socket.id);
//   });

// Socket.io
io.on('connection', (socket) => {
    console.log('New WS Connection...', socket.id);

    // Handle joining room
    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);

        socket.to(roomId).emit('userJoined', 'A new user joined the room');
    });

    // Handle chat messages
    socket.on('chatMessage', (msg, roomId) => {
        console.log(`Message received in room ${roomId}: ${msg}`);
        io.to(roomId).emit('message', msg);
    });

    // Handle file uploads
    socket.on('fileUploaded', (filename, roomId) => {
        console.log(`File uploaded in room ${roomId}: ${filename}`);
        io.to(roomId).emit('file', filename);
    });

    // Disconnect event
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});






// File Upload Endpoint
app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.status(400).send('Error uploading file');
        } else {
            if (req.file == undefined) {
                res.status(400).send('No file selected');
            } else {
                io.emit('fileUploaded', req.file.filename);
                res.status(200).send('File uploaded successfully');
            }
        }
    });
});

app.get('/',(req,res)=>{
        return res.sendFile('/public/index.html')
    })



server.listen(3000, () => {
    console.log('Server running on port 3000');
});

