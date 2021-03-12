// Global Variables
const USERS_FOLDER = '/users/';



// Event: Listen for authentication status changes
authentication.onAuthStateChanged( async (user) => {
	if (user) {
    const email = user.email;
    const userList = await fetchUserList();
    const userType = getUserType(userList, email);
    const emailExist = checkIfEmailExist(userList, email);

    if (emailExist) {
      if (userType === 'Admin User') {
        window.location.href = "admin-home.html";
      } else {
        window.location.href = "regular-home.html";
      }
    } else {
      displayErrorAlert('This email has been Deleted by an Admin');
      logout();
    }
	}
});


// Event: Login
document.getElementById('login-button').addEventListener('click', (e) => {
  e.preventDefault();
  login();
});


// Event: Go to signup page
document.getElementById('signup-button').addEventListener('click', () => {
  window.location.href = "signup.html";
});



// Listen for Authentication Status Changes Function
function fetchUserList() {
  return new Promise( resolve => {
    realtimeDatabase.ref(USERS_FOLDER).once('value').then( userList => {
      return resolve(userList);
    }).catch( error => {
      displayErrorAlert(error.message);
    });
  });
}

function getUserType(userList, email) {
  let userType = '';

  userList.forEach( user => {
    if (user.val().email === email) {
      userType = user.val().usertype;
    }
  });

  return userType;
}

function checkIfEmailExist(userList, email) {
  let emailExist = false;

  userList.forEach( user => {
    if (user.val().email === email) {
      emailExist = true;
    }
  });

  return emailExist;
}

function logout() {
  authentication.signOut();
}


// Login Function
function login() {
  const email = document.getElementById('email-input').value;
  const password = document.getElementById('password-input').value;

  authentication.signInWithEmailAndPassword(email, password).then( () => {
    // User is now login
  }).catch( error => {
    displayErrorAlert(error.message);
  });
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