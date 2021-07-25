document.addEventListener('DOMContentLoaded', function() {


  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  //document.querySelector('#compose').onclick = function () {alert("Hey")};

  // By default, load the inbox
  load_mailbox('inbox');
  
  
});

function compose_email() {
	const click = document.createEvent('Event');
	click.initEvent('click', true, true);

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  
  
  document.querySelector('#compose-form').onsubmit = function (){
		alert("pressed");
		let msg_recipient = document.querySelector('#compose-recipients').value;
		let msg_subject = document.querySelector('#compose-subject').value;
		let msg_text = document.querySelector('#compose-body').value;
		if (msg_recipient.length === 0 || msg_subject.length === 0 || msg_text === 0){
		alert("Fields must not be empty!");
		} else {
		 alert("Recipient: " + msg_recipient + ", subject: " + msg_text);
		 fetch('/emails', {
			 method : "post",
			 body : JSON.stringify({
				 recipients: msg_recipient,
				 subject: msg_subject,
				 body: msg_text
			 })
		 })
		 .then(r => r.json())
		 .then(result => {
			 console.log(result);
		 }).catch(error => console.log(error + Date.now()));
		}
		document.querySelector('#sent').click();
		return false;
		
  };
	  

  
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  let emails_view = document.getElementById('#emails-view');
  
  let email_list = [];
  
  fetch('/emails/' + mailbox)
  .then(response => response.json())
  .then(emails => email_list.push(...emails))
  .catch(error => console.log(error));
  
  alert(email_list.length);
  
}