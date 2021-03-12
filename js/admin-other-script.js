// Global Variables
const USERS_FOLDER = '/users/';



// Event: Listen for authentication status changes
authentication.onAuthStateChanged( async (user) => {
  if (user) {
    const email = user.email;
    const userList = await fetchUserList();
    const userType = getUserType(email, userList);
    
    if (userType === 'Admin User') {
      const filteredEmail = filterEmail(email);
      setUserActiveStatusToTrue(filteredEmail);
      setUserActiveStatusToFalseOnDisconnect(filteredEmail);
    } else {
      window.location.href = "regular-home.html";
    }
  } else {
    window.location.href = "login.html";
  }
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

function getUserType(email, userList) {
  let userType = '';

  userList.forEach( user => {
    if (user.val().email === email) {
      userType = user.val().usertype;
    }
  });

  return userType;
}

function filterEmail(email) {
  let filteredEmail = email.replace(/\./g, '-');
  filteredEmail = filteredEmail.replace(/\#/g, '-');
  filteredEmail = filteredEmail.replace(/\$/g, '-');
  filteredEmail = filteredEmail.replace(/\[/g, '-');
  filteredEmail = filteredEmail.replace(/\]/g, '-');

  return filteredEmail;
}

function setUserActiveStatusToTrue(filteredEmail) {
  realtimeDatabase.ref(USERS_FOLDER + filteredEmail).update({
    active: true
  });
}

function setUserActiveStatusToFalseOnDisconnect(filteredEmail) {
  realtimeDatabase.ref(USERS_FOLDER + filteredEmail).onDisconnect().update({
    active: false
  });
}


// Show Alert Function
function displaySuccessAlert(successMessage) {
  let successAlertModal = document.getElementById('success-alert-modal');
  let successMessageField = document.getElementById('success-alert-field');

  console.log(successMessage);
  successMessageField.innerHTML = successMessage;
  $(successAlertModal).modal({backdrop: false});

  setTimeout( () => {
    $(successAlertModal).modal('hide');
  }, 3000);
}

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


// Generate Growing Spinner Function
function generateGrowingSpinner(marginTop, paddingTop) {
  const growingSpinner = `
    <!-- Loading Files Growing Spinner Container -->
    <div class="d-flex flex-column justify-content-center align-items-center w-100 h-100 mt-${marginTop} pt-${paddingTop}">
      <!-- Growing Spinner -->
      <div class="spinner-grow text-info" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
  `;

  return growingSpinner;
}


// Tooltips Function
$(function () {
  $('[data-toggle="tooltip"]').tooltip();
});