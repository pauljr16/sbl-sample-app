// Global Variables
const REMOVE_USERS_FOLDER = '/remove-users/';
const USER_PROFILE_PICTURE_FOLDER = 'UserProfilePictures/';



// Event: Switch to Users Tab
document.getElementById('nav-users-tab').addEventListener('click', () => {
  switchToUsersTab();
});


// Event: Change Password
document.getElementById('change-password-modal-button').addEventListener('click', () => {
  changePassword();
});


// Event: Make Admin
document.getElementById('make-admin-button-modal').addEventListener('click', () => {
  makeAdmin();
});


// Event: Remove User
document.getElementById('remove-user-button').addEventListener('click', () => {
  removeUser();
});


// Event: Change Profile Pic
document.getElementById('change-profile-pic-input').addEventListener('change', (file) => {
  changeProfilePic(file);
});



// Switch to Users Tab Function
function switchToUsersTab() {
  const searchInputForm = document.getElementById('search-input');
  searchInputForm.setAttribute('style', 'display: none');

  const leftSideTab = document.getElementById('left-side-tab');
  leftSideTab.innerHTML = generateUsersTabLeftSideHTML();

  const currentUserEmail = authentication.currentUser.email;
  const filteredUserEmail = filterEmail(currentUserEmail);
  setUserActiveStatusToTrue(filteredUserEmail);
  displayUsers();
}

function generateUsersTabLeftSideHTML() {
  const usersTabLeftSideHTML = `
    <!-- Change Password Button -->
    <button class="btn btn-outline-warning btn-block mt-4 mb-2" onclick="resetChangePasswordModal(false)" data-toggle="modal" data-target="#change-password-modal">
      <i class="fa fa-lock" aria-hidden="true"></i>
      &nbsp;
      Change Password
    </button>

    <!-- Make Admin Button -->
    <button class="btn btn-outline-primary btn-block my-2" onclick="resetMakeAdminModal(false)" data-toggle="modal" data-target="#make-admin-modal"> 
      <i class="fa fa-user-plus" aria-hidden="true"></i>
      &nbsp;
      Make Admin
    </button>

    <!-- Remove User Button -->
    <button class="btn btn-outline-danger btn-block my-2" onclick="resetRemoveUserModal(false)" data-toggle="modal" data-target="#remove-user-modal"> 
      <i class="fa fa-minus-square" aria-hidden="true"></i>
      &nbsp;
      Remove User
    </button>

    <!-- Print Users Button -->
    <button class="btn btn-outline-secondary btn-block my-2" onclick="printUsers()"> 
      <i class="fa fa-print" aria-hidden="true"></i>
      &nbsp;
      Print Users
    </button>

    <!-- Change Profile Pic Button -->
    <label id="change-profile-pic-button" class="btn btn-outline-info btn-block my-2" for="change-profile-pic-input">
      <i class="fa fa-user-circle" aria-hidden="true"></i>
      &nbsp;
      Change Profile Pic
    </label>

    <!-- Print Users Button -->
    <button class="btn btn-outline-dark btn-block my-2" onclick="logOutUser()"> 
    <i class="fa fa-sign-out" aria-hidden="true"></i>
      &nbsp;
      Log Out
    </button>

    <!-- Progress Bar -->
    <div id="profile-pic-upload-progress-container" class="mt-3" style="display: none;">
      <p class="text-center lead mb-2">Uploading Picture...</p>

      <div class="progress">
        <div id="profile-pic-upload-progress-bar" class="progress-bar" style="width: 0%;"></div>
      </div>
    </div>
  `;

  return usersTabLeftSideHTML;
}

async function displayUsers() {
  const onlineUsersContainer = document.getElementById('online-users-container');
  onlineUsersContainer.innerHTML = generateGrowingSpinner(5, 5);

  const onlineUsersTitle = document.getElementById('online-users-title');
  const offileUsersTitle = document.getElementById('offline-users-title');
  const offlineUsersContainer = document.getElementById('offline-users-container');
  onlineUsersTitle.setAttribute('style', 'display: none');
  offileUsersTitle.setAttribute('style', 'display: none');
  offlineUsersContainer.innerHTML = '';

  const userList = await fetchUserList();
  const onlineAndOfflineUsersHTMLObject = generateOnlineAndOfflineUserListHTML(userList);

  onlineUsersTitle.setAttribute('style', 'display: block');
  offileUsersTitle.setAttribute('style', 'display: block');
  onlineUsersContainer.innerHTML = onlineAndOfflineUsersHTMLObject.onlineUsers;
  offlineUsersContainer.innerHTML = onlineAndOfflineUsersHTMLObject.offlineUsers;
}

function generateOnlineAndOfflineUserListHTML(userList) {
  let onlineUsersHTML = ``;
  let offlineUsersHTML = ``;

  userList.forEach( user => {
    const userData = user.val();

    if (userData.active === true) {
      const onlineUser = `
      <div class="col-6 col-sm-4 col-md-3 col-lg-4 col-xl-3 col-xxl-2 px-1 px-lg-2 mb-3">
        <div class="card text-center">
          <img src="${userData.picUrl}" class="card-img-top w-100 p-1" alt="User Profile">
          <div class="card-body p-2" style="background-color: rgba(0,0,0,.03);">
            <h5 class="card-title mb-1">${userData.usertype}</h5>
            <p class="card-text text-truncate lead text-success" data-toggle="tooltip" data-placement="bottom" title="${userData.email}">${userData.email}</p>
          </div>
        </div>
      </div>
      `;
      
      onlineUsersHTML += onlineUser;
    } else {
      const offlineUser = `
        <div class="col-6 col-sm-4 col-md-3 col-lg-4 col-xl-3 col-xxl-2 px-1 px-lg-2 mb-3">
          <div class="card text-center">
            <img src="${userData.picUrl}" class="card-img-top w-100 p-1" alt="User Profile">
            <div class="card-body p-2" style="background-color: rgba(0,0,0,.03);">
              <h5 class="card-title mb-1">${userData.usertype}</h5>
              <p class="card-text text-truncate lead" data-toggle="tooltip" data-placement="bottom" title="${userData.email}">${userData.email}</p>
            </div>
          </div>
        </div>
      `;

      offlineUsersHTML += offlineUser;
    }
  });

  const usersHTML = {
    onlineUsers: onlineUsersHTML,
    offlineUsers: offlineUsersHTML
  };

  return usersHTML;
}


// Change Password Function
function changePassword() {
  const changePasswordGrowingSpinner = document.getElementById('loading-change-password-growing-spinner-container');
  changePasswordGrowingSpinner.setAttribute('style', 'display: flex');

  const changePasswordButton = document.getElementById('change-password-modal-button');
  changePasswordButton.disabled = true;

  const newPassword = document.getElementById('change-password-input').value;

  const user = authentication.currentUser;

  user.updatePassword(newPassword).then( () => {
    resetChangePasswordModal(true);
    displaySuccessAlert('Change Password Success');
  }).catch( error => {
    resetChangePasswordModal(true);
    displayErrorAlert(error.message);
  });
}

function resetChangePasswordModal(hideModal) {
  if (hideModal) {
    const changePasswordModal = document.getElementById('change-password-modal');
    $(changePasswordModal).modal('hide');
  }

  const changePasswordInput = document.getElementById('change-password-input');
  const changePasswordButton = document.getElementById('change-password-modal-button');
  const changePasswordGrowingSpinner = document.getElementById('loading-change-password-growing-spinner-container');

  changePasswordInput.value = '';
  changePasswordButton.disabled = false;
  changePasswordGrowingSpinner.setAttribute('style', 'display: none');
}


// Make Admin Function
async function makeAdmin() {
  const makeAdminGrowingSpinner = document.getElementById('loading-make-admin-growing-spinner-container');
  makeAdminGrowingSpinner.setAttribute('style', 'display: flex');

  const makeAdminButton = document.getElementById('make-admin-button-modal');
  makeAdminButton.disabled = true;

  const makeAdminInputValue = document.getElementById('make-admin-input').value;
  const userList = await fetchUserList();
  const emailExist = checkIfEmailExist(userList, makeAdminInputValue);

  if (emailExist) {
    const filteredUserEmail = filterEmail(makeAdminInputValue);
  
    realtimeDatabase.ref(USERS_FOLDER + filteredUserEmail).update({
      usertype: "Admin User"
    }).then( () => {
      resetMakeAdminModal(true);
      displayUsers();
      displaySuccessAlert('Make Admin Success');
    }).catch( error => {
      resetMakeAdminModal(true);
      displayErrorAlert(error.message);
    });
  } else {
    resetMakeAdminModal(true);
    displayErrorAlert('Email not Found');
  }
}

function resetMakeAdminModal(hideModal) {
  if (hideModal) {
    const makeAdminModal = document.getElementById('make-admin-modal');
    $(makeAdminModal).modal('hide');
  }

  const makeAdminInput = document.getElementById('make-admin-input');
  const makeAdminButton = document.getElementById('make-admin-button-modal');
  const makeAdminGrowingSpinner = document.getElementById('loading-make-admin-growing-spinner-container');

  makeAdminInput.value = '';
  makeAdminButton.disabled = false;
  makeAdminGrowingSpinner.setAttribute('style', 'display: none');
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


// Remove User Function
async function removeUser() {
  const removeUserGrowingSpinner = document.getElementById('remove-user-growing-spinner-container');
  const removeUserButton = document.getElementById('remove-user-button');
  removeUserGrowingSpinner.setAttribute('style', 'display: flex');
  removeUserButton.disabled = true;

  const currentUserEmail = authentication.currentUser.email;
  const userList = await fetchUserList();
  const removeUserInputValue = document.getElementById('remove-user-input').value;
  const emailExist = checkIfEmailExist(userList, removeUserInputValue);

  if (emailExist && removeUserInputValue != currentUserEmail) {
    const filteredUserEmail = filterEmail(removeUserInputValue);
  
    realtimeDatabase.ref(REMOVE_USERS_FOLDER + filteredUserEmail).update({
      email: removeUserInputValue,
    }).then( () => {
      realtimeDatabase.ref(USERS_FOLDER + filteredUserEmail).remove().then( () => {
        resetRemoveUserModal(true);
        displayUsers();
        displaySuccessAlert('Remove user success');
      }).catch( error => {
        resetRemoveUserModal(true);
        displayErrorAlert(error.message);
      });
    }).catch( error => {
      resetRemoveUserModal(true);
      displayErrorAlert(error.message);
    });
  } else {
    resetRemoveUserModal(true);
    displayErrorAlert('User not found');
  }
}

function resetRemoveUserModal(hideModal) {
  if (hideModal) {
    const removeUserModal = document.getElementById('remove-user-modal');
    $(removeUserModal).modal('hide');
  }

  const removeUserInput = document.getElementById('remove-user-input');
  const removeUserButton = document.getElementById('remove-user-button');
  const removeUserGrowingSpinner = document.getElementById('remove-user-growing-spinner-container');

  removeUserInput.value = '';
  removeUserButton.disabled = false;
  removeUserGrowingSpinner.setAttribute('style', 'display: none');
}


// Print Users Function
async function printUsers() {
  const userList = await fetchUserList();
  const userListTableContainer = document.getElementById('user-list-table-container');
  const userListTableBody = document.getElementById('user-list-table-body');
  const userListTableRow = generateUserListTableHTML(userList);
  userListTableBody.innerHTML = userListTableRow;

  const newTab = window.open('', 'PRINT');
  newTab.document.write('<html><head><title>' + document.title + '</title>');
  newTab.document.write('</head><body>');
  newTab.document.write(userListTableContainer.innerHTML);
  newTab.document.write('</body></html>');
  newTab.document.close(); // necessary for IE >= 10
  newTab.focus(); // necessary for IE >= 10*/
  newTab.print();

  userListTableBody.innerHTML = '';
}

function generateUserListTableHTML(userList) {
  let userListTableBodyHTML = `
    <tr>
      <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Email</th>
      <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">User Type</th>
    </tr >
  `;

  userList.forEach( user => {
    const userData = user.val();
    const tr = `
      <tr>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${userData.email}</td>
        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${userData.usertype}</td>
      </tr>
    `;

    userListTableBodyHTML += tr;
  });

  return userListTableBodyHTML;
}


// Change Profile Pic Function
function changeProfilePic(file) {
  if (file.target.files[0].type == 'image/jpeg' || file.target.files[0].type == 'image/png') {
    const currentUserEmail = authentication.currentUser.email;
    const targetFile = file.target.files[0];
    const storageRef = storage.ref(USER_PROFILE_PICTURE_FOLDER + currentUserEmail + '.jpeg');
    const task = storageRef.put(targetFile);

    const profilePicUploadProgressContainer = document.getElementById('profile-pic-upload-progress-container');
    const profilePicUploadProgressBar = document.getElementById('profile-pic-upload-progress-bar');
    profilePicUploadProgressContainer.setAttribute('style', 'display: block');

    task.on('state_changed', function progress(snapshot) {
      const uploadPercentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      profilePicUploadProgressBar.style.width = uploadPercentage + '%';
    }, function error(error) {
      displayErrorAlert(error.message);
    }, function complete() {
      savePicUrl();
    });
  } else {
    displayErrorAlert('Select Image File First');
  }
}

function savePicUrl() {
  const currentUserEmail = authentication.currentUser.email;
  const filteredUserEmail = filterEmail(currentUserEmail);
  const downloadLink = storage.ref(USER_PROFILE_PICTURE_FOLDER + currentUserEmail + '.jpeg');

  downloadLink.getDownloadURL().then( url => {
    realtimeDatabase.ref(USERS_FOLDER + filteredUserEmail).update({
      picUrl: url
    }).then( () => {
      changeProfilePicSuccess();
    }).catch( error => {
      displayErrorAlert(error.message);
    });
  }).catch( error => {
    displayErrorAlert(error.message);
  });
}

function changeProfilePicSuccess() {
  const profilePicUploadProgressContainer = document.getElementById('profile-pic-upload-progress-container');
  const profilePicUploadProgressBar = document.getElementById('profile-pic-upload-progress-bar');
  profilePicUploadProgressContainer.setAttribute('style', 'display: none');
  profilePicUploadProgressBar.style.width = 0 + '%';

  displayUsers();
  displaySuccessAlert('Change Profile Pic Success');
}


// Log Out Function
function logOutUser() {
  const userEmail =  authentication.currentUser.email;
  const filteredUserEmail = filterEmail(userEmail);

  realtimeDatabase.ref(USERS_FOLDER + filteredUserEmail).update({
    active: false
  });

  authentication.signOut();
}