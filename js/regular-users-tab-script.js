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
    
    <div id="online-users-container" style="padding: 20%;display: block; ">
              </div>

    <button class="btn btn-outline-warning btn-block mt-4 mb-2" style="color:#fff" onclick="resetChangePasswordModal(false)" data-toggle="modal" data-target="#change-password-modal">
      <i class="fa fa-lock" aria-hidden="true"></i>
      &nbsp;
      Change Password
    </button>

    <!-- Change Profile Pic Button -->
    <label id="change-profile-pic-button" class="btn btn-outline-warning btn-block my-2" style="color:#fff" for="change-profile-pic-input">
      <i class="fa fa-user-circle" aria-hidden="true"></i>
      &nbsp;
      Change Profile Pic
    </label>

    <!-- Print Users Button -->
    <button class="btn btn-outline-warning btn-block my-2" style="color:#fff" onclick="logOutUser()"> 
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
  onlineUsersTitle.setAttribute('style', 'display: none');

  const userList = await fetchUserList();
  const onlineUsersHTML = generateOnlineAndOfflineUserListHTML(userList);

  onlineUsersTitle.setAttribute('style', 'display: block');
  onlineUsersContainer.innerHTML = onlineUsersHTML;
}

function generateOnlineAndOfflineUserListHTML(userList) {
  let onlineUsersHTML = ``;

  const currentUserEmail = authentication.currentUser.email;

  userList.forEach( user => {
    const userData = user.val();

    if (userData.email === currentUserEmail) {
      const onlineUser = `
          <div class="card text-center">
            <img src="${userData.picUrl}" class="card-img-top w-100 p-1" alt="User Profile">
            <div class="card-body p-2" style="background-color: rgba(0,0,0,.03);">
              <h5 class="card-title mb-1">${userData.name}</h5>
              <p class="card-text text-truncate lead text-success" data-toggle="tooltip" data-placement="bottom" title="${userData.email}">${userData.email}</p>
            </div>
          </div>

      `;
      
      onlineUsersHTML += onlineUser;
    }
  });

  return onlineUsersHTML;
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