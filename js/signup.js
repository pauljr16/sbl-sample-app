// Global Variables
const USERS_FOLDER = '/users/';

// Event: Listen for authentication status changes
authentication.onAuthStateChanged( user => {
	if (user) {
    const email = user.email;

    realtimeDatabase.ref(USERS_FOLDER + filterEmail(email)).update({
      email: email,
      active: true,
      usertype: 'Regular User',      
      picUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqZAjknpF5QsPYopf68cGKaMVUP_L8SkM4cqM-VIlk0-CVRtAh"
    }).then( () => {
      window.location.href = "regular-user.html";
    }).catch( error => {
      displayErrorAlert(error.message);
    });
	}
});


// Event: Signup
document.getElementById('signup-button').addEventListener('click', (e) => {
  e.preventDefault();
  signup();
});

// Event: Navigate to Login Page
document.getElementById('login-button').addEventListener('click', () => {
  window.location.href = "login.html";
});



// Listen for Authentication Status Changes Function
function filterEmail(email) {
  let filteredEmail = email.replace(/\./g, '-');
  filteredEmail = filteredEmail.replace(/\#/g, '-');
  filteredEmail = filteredEmail.replace(/\$/g, '-');
  filteredEmail = filteredEmail.replace(/\[/g, '-');
  filteredEmail = filteredEmail.replace(/\]/g, '-');

  return filteredEmail;
}


// Signup Function
function signup() {
  const email = document.getElementById('email-input').value;
  const password = document.getElementById('password-input').value;
  const name = document.getElementById('name').value;
  const conpassword = document.getElementById('conpassword-input').value;
  const contact = document.getElementById('contact').value;

  if(password!==conpassword) {
    displayErrorAlert('Password did not match');
  }else if(contact==='' || name===''){
    displayErrorAlert('Fillout all the fields');
  }
  else{
  authentication.createUserWithEmailAndPassword(email, password).then( () => {
    // New user created
    realtimeDatabase.ref(USERS_FOLDER + filterEmail(email)).update({
      name: name,
      contact:contact
    });   
  }).catch( error => {
    if (error.message === 'The password must be 6 characters long or more.') {
      displayErrorAlert(error.message);
    } else if (error.message === 'The email address is badly formatted.') {
      displayErrorAlert(error.message);
    } else{
      displayErrorAlert(error.message + ' Or Deleted by Admin');
    }
  });
}
}


// Show Error Alert Function
function displayErrorAlert(errorMessage) {
  let errorAlertModal = document.getElementById('error-alert-modal');
  let errorMessageField = document.getElementById('error-alert-field');

  console.log(errorMessage);
  errorMessageField.innerHTML = errorMessage;
  $(errorAlertModal).modal({backdrop: false});

  setTimeout( () => {
    $(errorAlertModal).modal('hide');
  }, 3000);
}