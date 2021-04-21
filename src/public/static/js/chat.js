/*client side chat.js*/
const socket = io();
const form = document.querySelector('#chatform');
const form_button = form.querySelector('#chatbutton');
const form_input = form.querySelector('#msg');
const messages = document.querySelector('#messages');
const messageTemplate = document.getElementById('message-template').innerHTML;
const rendermsg = Handlebars.compile(messageTemplate);
var url = new URL(document.URL)
var pathnames =url.pathname.split('/');
console.log(pathnames[0], pathnames[1], pathnames[2], pathnames[3]);

/*receive an event
socket.on('event_name', () => { //function contains arguments passed by the server side
    console.log("client received the msg!!");
});*/

socket.on('message', ({message, sender}) => {
    //console.log(rendermsg({message:message.text, createdAt: moment(message.createdAt).format('h:mm A')}));
    var p,s,q, r, t;
    if(message.text.length > 0){
        console.log(sender._id, pathnames[2]);
        if(sender._id == pathnames[2]){
            p = document.createElement("div");
            p.className = "incoming_msg";
            s = document.createElement("div");
            s.className = "received_msg";
            q = document.createElement("div");
            q.className = "received_withd_msg";
            z = document.createElement("p");
            r = document.createElement("span");
            r.innerText = message.text;
            r.setAttribute("style", "background: #ebebeb none repeat scroll 0 0;border-radius: 3px;color: #646464;font-size: 14px;margin: 0;padding: 5px 10px 5px 12px;width: 100%;")
            q.appendChild(r);
            t = document.createElement("span");
            t.className = "time_date";
            t.innerText = moment(message.createdAt).format('D MMM h:mm a');
            q.appendChild(t);
            s.appendChild(q);
            p.appendChild(s);
        }
        else{
            p = document.createElement("div");
            p.className = "outgoing_msg";
            s = document.createElement("div");
            s.className = "sent_msg";
            z = document.createElement("p");
            r = document.createElement("span");
            r.innerText = message.text;
            r.setAttribute("style","background: #05728f none repeat scroll 0 0;border-radius: 3px;font-size: 14px;margin: 0; color:#fff; padding: 5px 10px 5px 12px;width:100%;" );
            s.appendChild(r);
            t = document.createElement("span");
            t.className = "time_date";
            
            t.innerText = moment(message.createdAt).format('D MMM h:mm a');
            s.appendChild(t);
            p.appendChild(s);
        }
        messages.append(p);
        console.log(messages);
    }
    
})

document.querySelector('#chatform').addEventListener('submit', (e) => {
    e.preventDefault();
    form_button.setAttribute('disabled', 'disabled');
    const message = e.target.elements.msg.value;
    const username = e.target.elements.chat_curr_user.value;
    const other_username = e.target.elements.chat_other_user.value;
    //console.log(message, username, other_username);
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
    
});

socket.emit('join', {room:pathnames[3]})