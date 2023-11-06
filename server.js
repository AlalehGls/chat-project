// server side 
const http = require('http') // allows node js to transfer data over http
const path = require('path') // handling and transforming file paths
const express = require('express'); //express server
const socketio = require('socket.io'); // bidirectional and realtime communication between client and server
const formatMessage = require('./utils/messages');  // format of messages including username, text , time
const {userJoin,getCurrentUser, userLeave,getRoomUsers} = require('./utils/users');


const app = express(); 
const server = http.createServer(app);
const io = socketio(server);

//set statc folder
app.use(express.static(path.join(__dirname, 'public')));  // dirnam = current directory, and the set public as our static folder 

const botName= 'Bot';

// run when client connects
io.on('connection', socket => { // listen for an event, here a connection
    socket.on('joinRoom', ({username,room}) => {

        const user = userJoin(socket.id, username,room);
        socket.join(user.room);

        
socket.emit('message',formatMessage(botName, 'Welcome to Chatroom.')); // to single user


//broadcast when a user connects
socket.broadcast.to(user.room).emit('message',formatMessage(botName, `${user.username} has joined the chat`)); // to all user except for the user who is connecting

// send users and room info
io.to(user.room).emit('roomUsers', {
    room: user.room,
    users: getRoomUsers(user.room)
});
    });



// listen for chatMessage
socket.on('chatMessage', msg => {

const user = getCurrentUser(socket.id);
io.to(user.room).emit('message',formatMessage(user.username, msg)); // emit the users message back to the client side
});


        // Listen for typing event
        // Initialize typing status for the user
        let isUserTyping = false;

        // Listen for typing event
        socket.on('typing', (typingStatus) => {
            const user = getCurrentUser(socket.id);
            if (user) {
            if (typingStatus && !isUserTyping) {
                // User started typing
                isUserTyping = true;
                socket.to(user.room).emit('isTyping', user.username);
            } else if (!typingStatus && isUserTyping) {
                // User stopped typing
                isUserTyping = false;
                socket.to(user.room).emit('isTyping', '');
            }
            }
        });



// runs when user disconnect
socket.on('disconnect', ()=>{
    const user = userLeave(socket.id);

    if(user){
        io.to(user.room).emit('message',formatMessage(botName, `${user.username} has left the chat`)); // to everyone

        // send users and room info
    io.to(user.room).emit('roomUsers', {
    room: user.room,
    users: getRoomUsers(user.room)
});
    }
 
   });
});

const PORT = (3000  || process.env.PORT); // look to see if we have environment variable called port

server.listen( PORT, ()=> console.log(`server running on port ${PORT} `)); // we call listen to run a server