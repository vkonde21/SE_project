/*client side chat.js*/
const socket = io();
/*receive an event*/
socket.on('event_name', () => { /*function contains arguments passed by the server side*/
    console.log("client received the msg!!");
});