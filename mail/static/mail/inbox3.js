window.onpopstate = function(event){	
	if (event.state.endpoint == "compose"){
		compose_email();
	} else if (event.state.endpoint === "inbox" || event.state.endpoint === "sent" || event.state.endpoint === "archive") {
		load_mailbox(event.state.endpoint);
	} else if (event.state.endpoint.includes("response")){
		let endpoint_split = event.state.endpoint.split("_");
		let email_id = endpoint_split[1];
		
		console.log("ID is: " + email_id);
		fetch(`/emails/${email_id}`)
		.then(r => r.json())
		.then(email => compose_email_response(email))
		.catch(error => console.log(error));
		
	} else {
		getEmail2(parseInt(event.state.endpoint));
	}
};


document.addEventListener('DOMContentLoaded', function() {


  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => push_mailbox_to_history('inbox'));
  document.querySelector('#sent').addEventListener('click', () => push_mailbox_to_history('sent'));
  document.querySelector('#archived').addEventListener('click', () => push_mailbox_to_history('archive'));
  document.querySelector('#compose').addEventListener('click', push_compose_to_history);
  //document.querySelector('#compose').onclick = function () {alert("Hey")};

  // By default, load the inbox
  push_mailbox_to_history('inbox');
  
  
});

function push_compose_to_history(){
	history.pushState({endpoint: "compose"}, "", "/compose");
	compose_email();
}

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
				 body: msg_text,
				 read : false
			 })
		 })
		 .then(r => r.json())
		 .then(result => {
			 console.log(result);
		 }).catch(error => console.log(error + Date.now()));
		}
		document.querySelector('#sent').click();
		return false;
		
  }
}
	  
function push_compose_response_to_history(email){
	console.log("In push");
	history.pushState({endpoint: "response_" + email.id}, "", "/compose/" + email.id);
	compose_email_response(email); 
}

function compose_email_response(email){
	// Show (pre-filled) compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Fill composition fields with pre-defined text
  document.querySelector('#compose-recipients').value = email.sender;
  document.querySelector('#compose-subject').value = "Re: "  + email.subject;
  document.querySelector('#compose-body').value = "On " + email.timestamp + ", " + email.sender + " wrote: " + email.body;
  
  document.querySelector('#compose-form').onsubmit = function (){
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
				 body: msg_text,
				 read: false
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

function push_mailbox_to_history(mailbox){
	history.pushState({endpoint: mailbox.toString()}, "", "/" + mailbox);
	load_mailbox(mailbox);
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  

	  myObj = fetch('/emails/' + mailbox)
	  .then(response => {return response.json()})
	  .then(emails => {emails.forEach(email => 
		{
			
		// makes inbox-entries
			div = makeDivision(email);
			
			if (mailbox === 'inbox'){
				openButton = document.createElement("button");
				
				openButton.innerHTML = "Open";
				openButton.style.width = "75px";
				openButton.style.height = "35px";
				openButton.style.position = "relative";
				openButton.style.left = "90%";
				openButton.setAttribute("id", email.id);
				
				openButton.style.backgroundColor = "white";
				openButton.className = "btn btn-sm btn-outline-primary";
				
				div.appendChild(openButton);
				div = add_open_button_functionality(div, email.id);
				
			// Adds 'unarchive' button to archived entries!			
			} else if (mailbox === 'archive'){
				console.log(email);
				div = add_unarchive_button(div, email);
			}
			
			if (email.read === true){
				div.style.backgroundColor = 'grey';
				
			} else {
				div.style.backgroundColor = 'blue';		
			}
			div.style.animationPlayState = "running";
			
			document.querySelector('#emails-view').appendChild(div);
			//document.querySelector('.allMails').style.animationPlayState = "running";
			
			
	  });
	  return emails;})
	  .catch(error => console.log(error));
	  
	  console.log(myObj);
  
  
    
}

const makeDivision = function (email){
	
	console.log(email);
	
	div = document.createElement("div");
	div.className = "allMails";
			
	// Create paragraphs for division
	p_from = document.createElement("p");
	p_from.innerText = `From: ${email.sender}`;
	
	p_subj = document.createElement("p");
	p_subj.innerText = `Subject: ${email.subject}`;
	
	p_time = document.createElement("p");
	p_time.innerText = `Timestamp: ${email.timestamp}`;
	
	div.append(p_from);
	div.append(p_subj);
	div.append(p_time);
			
	
	return div;
}

const add_open_button_functionality = function (div, email_id){
	console.log(email_id);
	
	openButton = div.querySelector('button')
	
	openButton.addEventListener('click', function(event){push_email_to_history(email_id);});
	
	console.log(div);
	
	return div;
	
}

const change_status = function(email_id){
	
	fetch(`/emails/${email_id}`, {
		method : "put",
		body : JSON.stringify({
			read : true
		})
	}).then(r => r.json())
	.catch(error => {});

	push_mailbox_to_history('inbox')

}

const change_status_archived = function(email_id, archive_state){
	console.log("In archive!");
	fetch(`/emails/${email_id}`, {
		method : "put",
		body : JSON.stringify({
			archived : archive_state
		})
	}).then(r => r.json())
	.then(email => email.archived = archive_state)
	.catch(error => {});
	
	push_mailbox_to_history('inbox')
}

const push_email_to_history = function(email_id){
	history.pushState({endpoint: email_id.toString()}, "",  "/email/" + email_id.toString());
	getEmail2(email_id);
}


const getEmail2 = function(email_id){
	
	var is_read = false;
	var is_archived = false;
	// get element by id!
	
	fetch(`/emails/${email_id}`)
	.then(r => r.json())
	.then(email => {		
		is_read = email.read;
		
		// marks email as 'read'
		
		if (is_read === false){
			change_status(email.id);
		}
		
		document.querySelector('#emails-view').innerHTML = '';
		document.querySelector('#compose-view').style.display = 'none';
		
		sender = document.createElement("h2");
		sender.innerHTML = `From: ${email.sender}`;
		
		receivers = document.createElement("h2");
		receivers.innerHTML = `To: ${email.recipients}`;
		
		subject = document.createElement("h2")
		subject.innerHTML = `Subject: ${email.subject}`;
		
		content_div = document.createElement("div");
		
		//content_div.className = "allMails";
		
		content = document.createElement("p");
		content.innerHTML = `${email.body}`;
		
		content_div.appendChild(content);
		
		content_div = add_archive_button(content_div, email);
		content_div = add_reply_button(content_div, email);
		
		document.querySelector('#emails-view').appendChild(sender);
		document.querySelector('#emails-view').appendChild(receivers);
		document.querySelector('#emails-view').appendChild(subject);
		document.querySelector('#emails-view').appendChild(content_div);
		
		console.log(`Read? : ${is_read}`);
		
	})
	.catch(error => {});
	
	
}

const add_archive_button = function(content_div, email){
	archiveButton = document.createElement("button");
		
	archiveButton.innerHTML = "Archive";
	archiveButton.style.width = "75px";
	archiveButton.style.height = "35px";
	archiveButton.style.position = "relative";
	archiveButton.style.left = "90%";
	archiveButton.setAttribute("id", email.id);
				
	archiveButton.style.backgroundColor = "white";
	archiveButton.className = "btn btn-sm btn-outline-primary";
	
	archiveButton.onclick = function(){
		change_status_archived(email.id, true);
		console.log(`Archived? :${email.archived}`)
	}
		
	content_div.append(archiveButton);
	
	return content_div;
}

const add_unarchive_button = function(content_div, email){
	unarchiveButton = document.createElement("button");
		
	unarchiveButton.innerHTML = "Unarchive";
	unarchiveButton.style.width = "75px";
	unarchiveButton.style.height = "35px";
	unarchiveButton.style.position = "relative";
	unarchiveButton.style.left = "90%";
	unarchiveButton.setAttribute("id", email.id);
				
	unarchiveButton.style.backgroundColor = "white";
	unarchiveButton.className = "btn btn-sm btn-outline-primary";
	
	unarchiveButton.onclick = function(){
		change_status_archived(email.id, false);
		console.log(`Archived? :${email.archived}`)
	}
		
	content_div.append(unarchiveButton);
	
	return content_div;
}

function add_reply_button(content_div, email){
	replyButton = document.createElement('button');
	
	replyButton.innerHTML = "Reply";
	replyButton.style.width = "75px";
	replyButton.style.height = "35px";
	replyButton.style.position = "relative";
	replyButton.style.left = "90%";
	replyButton.setAttribute("id", email.id);
				
	replyButton.style.backgroundColor = "white";
	replyButton.className = "btn btn-sm btn-outline-primary";
	
	replyButton.onclick = function(){
		 push_compose_response_to_history(email);
	}
	
	content_div.append(replyButton);
	return content_div;
}
