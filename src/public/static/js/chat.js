/*client side chat.js*/
const socket = io();
const form = document.querySelector('#chatform');
const form_button = form.querySelector('button');
const form_input = form.querySelector('input');
const messages = document.querySelector('#messages');
const messageTemplate = document.getElementById('message-template').innerHTML;
const rendermsg = Handlebars.compile(messageTemplate);
/*receive an event
socket.on('event_name', () => { //function contains arguments passed by the server side
    console.log("client received the msg!!");
});*/
socket.on('message', (message) => {
    console.log(rendermsg({message}));
    messages.insertAdjacentHTML('beforeend', rendermsg({message}))
})

document.querySelector('#chatform').addEventListener('submit', (e) => {
    e.preventDefault();
    form_button.setAttribute('disabled', 'disabled');
    const message = e.target.elements.msg.value;
    socket.emit('sendMessage', message, (msg) => {
        console.log("Message was delivered!", msg);
        /*reset previous values once the msg is delivered*/
        form_button.removeAttribute('disabled');
        form_input.value = '';
        form_input.focus(); /*brings back the cursor in the input box*/
    })
})