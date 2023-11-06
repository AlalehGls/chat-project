// Frontend javascript


const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');


/// get username and room from URL
const {username , room} = Qs.parse(location.search, {
  ignoreQueryPrefix : true
});


const socket = io(); // because of script tag in chat html socket io

// join chatroom
socket.emit('joinRoom', {username, room});

// get room and users
socket.on('roomUsers', ({room,users})=>{
outputRoomName(room);
outputUsers(users);
});


socket.on('message', message =>{ // catch the message on the client side

  console.log(message); // refers to welcome message to chatcord in server.js file (socket.emit)
  outputMessage(message);
  // scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;

});


// Create a variable to track typing status
let isTyping = false;
let typingTimeout = null;


// Add event listeners for input events
chatForm.addEventListener('input', () => {
  if (!isTyping) {
    socket.emit('typing', true);
    isTyping = true;
  }

  // Clear the previous timeout
  clearTimeout(typingTimeout);

  // Set a new timeout to show the "is typing" message after 500 milliseconds
  typingTimeout = setTimeout(() => {
      if (isTyping) {
          socket.emit('typing', false);
          isTyping = false;
      }
  }, 4000);

});



// message submit
chatForm.addEventListener('submit', (e)=> {
e.preventDefault();

// get message text
const msg = e.target.elements.msg.value; // text sent in to the text input to share in chat
//emit message to server
socket.emit('chatMessage', msg) // get the msg from the text input (enter message) and log it on the client side

     // Stop typing when form is submitted
     if (isTyping) {
      socket.emit('typing', false);
      isTyping = false;
  }


 // Clear the typing timeout
 clearTimeout(typingTimeout);


// clear input
e.target.elements.msg.value = '';
e.target.elements.msg.focus();
});

// output message to DOM
function outputMessage(message){
   // Clear the "isTyping" div
    //showIsTyping(false);

  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="meta"> ${message.username} <span> ${message.time}</span></p>
  <p class="text">
  ${message.text}
  </p>`;
  document.querySelector('.chat-messages').appendChild(div);
}

// add room name to DOM
function outputRoomName(room){
roomName.innerText = room;
}

// add users to DOM
function outputUsers(users){
 userList.innerHTML= `
 ${users.map(user => `<li>${user.username}</li>`).join('')}
 `;
  }

  socket.on('isTyping', (username) => {
    const isTypingElement = document.querySelector('#isTyping');
    isTypingElement.textContent = username ? `${username} is typing...` : '';
  
    // Scroll to the bottom of the chat messages
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
  





 