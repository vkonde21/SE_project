/*client side chat.js*/
const socket = io();
const form = document.querySelector('#chatform');
const form_button = form.querySelector('#chatbutton');
const form_input = form.querySelector('#msg');
const messages = document.querySelector('#messages');
const messageTemplate = document.getElementById('message-template').innerHTML;
const rendermsg = Handlebars.compile(messageTemplate);
var curr_username;

/*receive an event
socket.on('event_name', () => { //function contains arguments passed by the server side
    console.log("client received the msg!!");
});*/
socket.on('message', (message, ch) => {
    //console.log(rendermsg({message:message.text, createdAt: moment(message.createdAt).format('h:mm A')}));
    console.log(message.text.length);
    if(message.text.length > 0)
        messages.insertAdjacentHTML('beforeend', rendermsg({message:message.text, createdAt: moment(message.createdAt).format('D MMM h:mm a')}));
})

document.querySelector('#chatform').addEventListener('submit', (e) => {
    e.preventDefault();
    form_button.setAttribute('disabled', 'disabled');
    const message = e.target.elements.msg.value;
    const username = e.target.elements.chat_curr_user.value;
    const other_username = e.target.elements.chat_other_user.value;
    console.log(message, username, other_username);
    curr_username = username;
    if(message){
        socket.emit('sendMessage', message, username, other_username, (msg) => {
            console.log("Message was delivered!", msg);
            /*reset previous values once the msg is delivered*/
            form_button.removeAttribute('disabled');
            form_input.value = '';
            form_input.focus(); /*brings back the cursor in the input box*/
        });
    }
    
})