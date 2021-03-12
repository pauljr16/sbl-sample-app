// Global Variables
const FILES_ROOT_FOLDER = 'Office3Files';

let CURRENT_FOLDER_FULL_PATH = FILES_ROOT_FOLDER;
let CURRENT_FOLDER_FIRESTORE_DOC_NAME = '';
let CURRENT_FOLDER_PARENT_FOLDER = '';
let CURRENT_FOLDER_DISPLAY_NAME = '';

let PREVIOUS_FOLDER_DISPLAY_NAME_LIST = [];
let PREVIOUS_FOLDER_FULL_PATH_LIST = [];
let PREVIOUS_FOLDER_FIRESTORE_DOC_NAME_LIST = [];

let ADD_FILE_CATEGORY_TO = 'Parent';

// Event: Display Files categories when the page finish loading
document.addEventListener('DOMContentLoaded', () => {
  switchToFilesTab();
});


// Event: Switch to Files Tab
document.getElementById('nav-files-tab').addEventListener('click', () => {
  switchToFilesTab();
});


// Event: Delete Files
document.getElementById('delete-files-button').addEventListener('click', () => {
  deleteFiles();
});


// Event: Add File Category
document.getElementById('file-to-upload-input').addEventListener('change', (file) => {
  addFileCategory(file);
});


// Event: Add File
document.getElementById('file-upload-input').addEventListener('change', (file) => {
  addFile(file);
});


// Event: Rename File Category
document.getElementById('rename-file-category-button').addEventListener('click', () => {
  renameFileCategory();
});

// Switch to Files Tab Functions
function switchToFilesTab() {
  const leftSideTab = document.getElementById('left-side-tab');
  leftSideTab.innerHTML = generateFilesTabLeftSideHTML();

  CURRENT_FOLDER_FULL_PATH = FILES_ROOT_FOLDER;
  CURRENT_FOLDER_FIRESTORE_DOC_NAME = '';
  CURRENT_FOLDER_PARENT_FOLDER = '';
  CURRENT_FOLDER_DISPLAY_NAME = '';

  PREVIOUS_FOLDER_DISPLAY_NAME_LIST = [];
  PREVIOUS_FOLDER_FULL_PATH_LIST = [];
  PREVIOUS_FOLDER_FIRESTORE_DOC_NAME_LIST = [];

  ADD_FILE_CATEGORY_TO = 'Parent';

  displayParentFileCategories();
  resetSearchFilesInput();
  resetFilesTabRightSide();
}

function generateFilesTabLeftSideHTML() {
  const filesTabLeftSideHTML = `
    <!-- Search File Categories Form -->
    <form class="form-inline mt-3" autocomplete="off" style="margin-bottom: 0.75rem">
      <input id="input-search-file-categories" class="form-control border-dark w-100" onkeyup="searchFileCategories()" 
        type="text" placeholder="Search Folder">
    </form>

    <button class="btn btn-outline-warning btn-block mt-auto" type="button" onclick="setAddFileCategoryToParent()" data-toggle="modal" data-target="#add-file-category-modal" >
    <i class="fa fa-plus" aria-hidden="true" ></i>
    &nbsp;
    Add Folder
    </button>

    <h5 class="my-2" style="color:#fff;"><strong>ORDER OF BUSINESS</strong></h5>
    
    <!-- File Categories Container -->
    <div id="file-categories-container" class="overflow-auto" >
    </div>

    <button class="btn btn-outline-warning btn-block my-2" onclick="logOutUser()"> 
    <i class="fa fa-sign-out" aria-hidden="true"></i>
      &nbsp;
      Log Out
    </button>
  `;
  return filesTabLeftSideHTML;
}

function resetSearchFilesInput() {
  const searchInput = document.getElementById('search-input');
  searchInput.setAttribute('style', 'display: inline-block');
  searchInput.setAttribute('placeholder', 'Search Files');
  searchInput.setAttribute('onkeyup', 'searchFilesAndFolders()');
  searchInput.value = '';
}

function searchFilesAndFolders() {
  let filter, li, a, i, txtValue;
  filter = document.getElementById('search-input').value.toUpperCase();
  li = document.querySelectorAll('.file-and-foler-container');

  // Loop through all list items, and hide those who don't match the search query
  for (i = 0; i < li.length; i++) {
    a = li[i].getElementsByTagName("div")[0];
    txtValue = a.textContent || a.innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      li[i].style.display = "";
    } else {
      li[i].style.display = "none";
    }
  }
}

function resetFilesTabRightSide() {
  const fileTabRightSideHeader = document.getElementById('files-tab-right-side-header');
  const filesTabContentContainer = document.getElementById('files-tab-content-container');
  fileTabRightSideHeader.setAttribute('style', 'display: none');
  filesTabContentContainer.innerHTML = '';
}


// Search File Categories Function
function searchFileCategories() {
  let filter, li, a, i, txtValue;
  filter = document.getElementById('input-search-file-categories').value.toUpperCase();
  li = document.querySelectorAll('.file-category-button');

  // Loop through all list items, and hide those who don't match the search query
  for (i = 0; i < li.length; i++) {
    a = li[i];
    txtValue = a.textContent || a.innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      li[i].style.display = "";
    } else {
      li[i].style.display = "none";
    }
  }
}


// Load Parent Folders Functions
async function displayParentFileCategories() {
  const fileCategoriesContainer = document.getElementById('file-categories-container');
  fileCategoriesContainer.innerHTML = generateGrowingSpinner(0, 0);

  // Create a reference under which you want to list
  const folderReference = storage.ref(FILES_ROOT_FOLDER + '/');
  const filesAndFolders = await folderReference.list({ maxResults: 1000 });
  const folders = filesAndFolders.prefixes;
  
  const subFoldersData = await fetchSpecificFoldersData(FILES_ROOT_FOLDER);
  const folderButtonsHTML = generateFolderButtonsHTML(folders, subFoldersData);
  fileCategoriesContainer.innerHTML = folderButtonsHTML;
}

function fetchSpecificFoldersData(parentFolder) {
  return new Promise( resolve => {
    cloudFirestore.collection(FILES_ROOT_FOLDER).where('parent_folder', '==', parentFolder).get().then( folders => {
      return resolve(folders);
    }).catch( error => {
      displayErrorAlert(error.message);
    });
  });
}

function generateFolderButtonsHTML(folders, subFoldersData) {
  let folderButtonsHTML = '';
  
  if (folders.length != 0) {
    let foldersList = [];

    folders.forEach( folder => {
      foldersList.push(folder.name);
    });

    folders.reverse().forEach( folder => {
      let displayName = '';
      let firestoreDocName = '';
      const actualName = folder.name;
      const folderFullPath = folder.fullPath;
      
      subFoldersData.forEach( subFolderData => {
        const folderData = subFolderData.data();

        // Check if folder data is valid
        indexTheFolders(folderData.actual_name, folderData.firestore_doc_name, foldersList);

        if (actualName === folderData.actual_name) {
          displayName = folderData.display_name;
          firestoreDocName = folderData.firestore_doc_name;
        }
      });
      
      const folderButton = `
        <button class="btn file-category-button" style="background-color:#fff;" style="color:#fff;" type="button" onclick="openFolder('${folderFullPath}', '${firestoreDocName}', ${false})">
          <i class="fa fa-folder mr-1" aria-hidden="true"></i>
          ${displayName}
        </button>
      `;

      folderButtonsHTML += folderButton;
    });
  } else {
    folderButtonsHTML = `<h5 class="text-center mt-2" style="color:#fff;">No files saved</h5>`;
  }

  return folderButtonsHTML;
}


// Open Folder Function
async function openFolder(folderFullPath, firestoreDocName, forward) {
  resetSearchFilesInput();
  resetFilesTabRightSide();

  const filesTabContentContainer = document.getElementById('files-tab-content-container');
  filesTabContentContainer.innerHTML = generateGrowingSpinner(5, 5);

  // Create a reference under which you want to list
  const folderReference = storage.ref(folderFullPath);
  const filesAndFolders = await folderReference.list({ maxResults: 1000 });
  const folders = filesAndFolders.prefixes;
  const files = filesAndFolders.items;
  
  const currentFolderData = await fetchFolderData(firestoreDocName);
  const subFoldersData = await fetchSpecificFoldersData(folderFullPath);
  const folderAndFileButtonsHTML = generateFolderAndFileButtonsHTML(folders, files, currentFolderData, subFoldersData);
  
  if (forward === true) {
    PREVIOUS_FOLDER_FULL_PATH_LIST.push(CURRENT_FOLDER_FULL_PATH);
    PREVIOUS_FOLDER_FIRESTORE_DOC_NAME_LIST.push(CURRENT_FOLDER_FIRESTORE_DOC_NAME);
    PREVIOUS_FOLDER_DISPLAY_NAME_LIST.push(CURRENT_FOLDER_DISPLAY_NAME);
  }

  CURRENT_FOLDER_FULL_PATH = folderFullPath;
  CURRENT_FOLDER_FIRESTORE_DOC_NAME = firestoreDocName;
  CURRENT_FOLDER_PARENT_FOLDER = currentFolderData.data().parent_folder;
  CURRENT_FOLDER_DISPLAY_NAME = currentFolderData.data().display_name;

  const fileTabRightSideHeader = document.getElementById('files-tab-right-side-header');
  fileTabRightSideHeader.setAttribute('style', 'display: flex');
  
  const folderNavigatorList = document.getElementById('folder-navigator-list');
  folderNavigatorList.innerHTML = generateFolderNavigatorHTML(currentFolderData.data().display_name);

  resetFilesMaxHeight();

  filesTabContentContainer.innerHTML = folderAndFileButtonsHTML;
}

function fetchFolderData(firestoreDocName) {
  return new Promise( resolve => {
    cloudFirestore.collection(FILES_ROOT_FOLDER).doc(firestoreDocName).get().then( folder => {
      return resolve(folder);
    }).catch( error => {
      displayErrorAlert(error.message);
    });
  });
}

function generateFolderAndFileButtonsHTML(folders, files, currentFolderData, subFoldersData) {
  let folderAndFileButtonsHTML = '';

  let foldersList = [];
  folders.forEach( folder => {
    foldersList.push(folder.name);
  });

  // Generate Folders HTML
  folders.forEach( folder => {
    const actualName = folder.name;
    const folderFullPath = folder.fullPath;
    let displayName = '';
    let firestoreDocName = '';
    let linkColor = '';
    let backgroundColor = '';
    let textColor = '';
    
    subFoldersData.forEach( subFolderData => {
      const folderData = subFolderData.data();

      // Check if folder data is valid
      indexTheFolders(folderData.actual_name, folderData.firestore_doc_name, foldersList);

      if (actualName === folderData.actual_name) {
        displayName = folderData.display_name;
        firestoreDocName = folderData.firestore_doc_name;
        linkColor = folderData.link_color;
        backgroundColor = folderData.background_color;

        if (backgroundColor === 'btn-warning') {
          textColor = 'text-dark';
        } else {
          textColor = 'text-white';
        }
      }
    });
    
    const folderButtonHTML = `
      <div class="col-6 col-sm-4 col-md-3 col-lg-3 custom-folder-col-xl px-1 mb-2 text-center file-and-foler-container" onclick="openFolder('${folderFullPath}', '${firestoreDocName}', ${true})">
        <div class="document-list border border-secondary">
          <a class="text-decoration-none" style="cursor: pointer;">
            <i class="fa fa-folder" style="color: ${linkColor}" aria-hidden="true"></i>
            <div class=" ${textColor} mb-0 px-2 py-1 file-and-folder-title us-none" style="background-color:#90050c;">${displayName}</div>  
          </a>
        </div>
      </div>
    `;

    folderAndFileButtonsHTML += folderButtonHTML;
  });

  const linkColor = currentFolderData.data().link_color;
  const backgroundColor = currentFolderData.data().background_color;

  // Generate Files HTML
  files.forEach( file => {
    const fileFullPath = file.fullPath;
    const fileName = file.name;
    let textColor = '';

    if (backgroundColor === 'btn-warning') {
      textColor = 'text-dark';
    } else {
      textColor = 'text-white';
    }

    const fileButton = `
      <div class="col-6 col-sm-4 col-md-3 col-lg-3 custom-folder-col-xl px-1 mb-2 text-center file-and-foler-container" onclick="openFile('${fileFullPath}')">
        <div class="document-list border border-secondary">
          <a class="text-decoration-none">
            <i class="fa fa-file" style="color: ${linkColor}" aria-hidden="true"></i>
            <p class=" ${textColor} mb-0 px-2 py-1 file-and-folder-title us-none" style="background-color:#90050c;">${fileName}</p>
          </a>
        </div>
      </div>
    `;

    folderAndFileButtonsHTML += fileButton;
  });

  return folderAndFileButtonsHTML;
}

function indexTheFolders(folderName, firestoreDocName, folderList) {
  const index = folderList.indexOf(folderName);

  if (index === -1) {
    deleteFolderData(firestoreDocName);
  }
}

function generateFolderNavigatorHTML(folderDisplayName) {
  let folderNavigatorListHTML = ``;
  let li = ``;

  if (CURRENT_FOLDER_PARENT_FOLDER === FILES_ROOT_FOLDER) {
    li = `<li class="breadcrumb-item us-none active" aria-current="page" style="color:#fff;">${folderDisplayName}</li>`;

    PREVIOUS_FOLDER_DISPLAY_NAME_LIST = [];
    PREVIOUS_FOLDER_FULL_PATH_LIST = [];
    PREVIOUS_FOLDER_FIRESTORE_DOC_NAME_LIST = [];

    folderNavigatorListHTML += li;
  } else {
    for (let index = 0; index <= PREVIOUS_FOLDER_DISPLAY_NAME_LIST.length; index++) {
      if (index === PREVIOUS_FOLDER_DISPLAY_NAME_LIST.length) {
        li = `<li class="breadcrumb-item us-none active" aria-current="page" style="color:#fff;">${CURRENT_FOLDER_DISPLAY_NAME}</li>`;
      } else {
        li = `<li class="breadcrumb-item us-none"style="color:#fff;" ><a class="breadcrumb-link" onclick="navigateFolder('${PREVIOUS_FOLDER_FULL_PATH_LIST[index]}', '${PREVIOUS_FOLDER_FIRESTORE_DOC_NAME_LIST[index]}', ${index})">${PREVIOUS_FOLDER_DISPLAY_NAME_LIST[index]}</a></li>`;
      }
      
      folderNavigatorListHTML += li;
    }
  }

  return folderNavigatorListHTML;
}

function navigateFolder(folderFullPath, firestoreDocName, folderIndex) {
  while (true) {
    if (PREVIOUS_FOLDER_DISPLAY_NAME_LIST.length === folderIndex) {
      break;
    }

    PREVIOUS_FOLDER_DISPLAY_NAME_LIST.pop();
    PREVIOUS_FOLDER_FULL_PATH_LIST.pop();
    PREVIOUS_FOLDER_FIRESTORE_DOC_NAME_LIST.pop();
  }

  openFolder(folderFullPath, firestoreDocName, false);
}

function resetFilesMaxHeight() {
  const filesTabRightSideHeader = document.getElementById('files-tab-right-side-header');
  const filesTabContentContainer = document.getElementById('files-tab-content-container');
  const filesTabRightSideHeaderClientHeight = filesTabRightSideHeader.clientHeight;

  const filesTabContentContainerMaxHeight = 104 + (filesTabRightSideHeaderClientHeight + 16) + 'px';
  filesTabContentContainer.style.maxHeight = 'calc(100vh - ' + filesTabContentContainerMaxHeight + ')';
}

function deleteFolderData(firestoreDocName) {
  return new Promise( resolve => {
    cloudFirestore.collection(FILES_ROOT_FOLDER).doc(firestoreDocName).delete().then( () => {
      return resolve('Delete success');
    }).catch( error => {
      displayErrorAlert(error.message);
    });
  });
}


// Open File Function
function openFile(fileFullPath) {
  storage.ref(fileFullPath).getDownloadURL().then( url => {
    const anchorTag = document.createElement('a');
    anchorTag.setAttribute('href', url);
    anchorTag.setAttribute('target', "_blank");
    anchorTag.setAttribute('style', 'display: none');
    document.body.appendChild(anchorTag);
    anchorTag.click();
    document.body.removeChild(anchorTag);
  }).catch( error => {
    displayErrorAlert(error.message);
  });
}


// Delete Files Functions
async function deleteFiles() {
  const deleteFilesButton = document.getElementById('delete-files-button');
  deleteFilesButton.disabled = true;

  const filesFullPathList = getSelectedFilesToDelete();
  let deleteStatus = '';
  
  for (let index = 0; index < filesFullPathList.length; index++) {
    deleteStatus = await deleteFile(filesFullPathList[index]);
  }

  const folderExist = await checkIfFolderStillExist();
  
  if (folderExist) {
    openFolder(CURRENT_FOLDER_FULL_PATH, CURRENT_FOLDER_FIRESTORE_DOC_NAME, false);
  } else {
    let deleteData = await deleteFolderData(CURRENT_FOLDER_FIRESTORE_DOC_NAME);
    const prevFolderFullPath = PREVIOUS_FOLDER_FULL_PATH_LIST[PREVIOUS_FOLDER_FULL_PATH_LIST.length - 1];
    const prevFolderFirestoreDocName = PREVIOUS_FOLDER_FIRESTORE_DOC_NAME_LIST[PREVIOUS_FOLDER_FIRESTORE_DOC_NAME_LIST.length - 1];

    if (prevFolderFullPath === undefined) {
      resetFilesTabRightSide();
      displayParentFileCategories();
    } else {
      openFolder(prevFolderFullPath, prevFolderFirestoreDocName, false);
    }
  }

  resetDeleteFilesModal(true);

  if (deleteStatus === 'success') {
    displaySuccessAlert('Delete files success');
  } else {
    displayErrorAlert('Delete files failed');
  }
}

function deleteFile(fileFullPath) {
  return new Promise( (resolve, reject) => {
    const storageRef = storage.ref();
    const fileRef = storageRef.child(fileFullPath);

    fileRef.delete().then( () => {
      return resolve('success');
    }).catch( error => {
      displayErrorAlert(error.message);
      return reject('failed');
    });
  });
}

async function displayFilesToDelete() {
  resetDeleteFilesModal(false);

  const filesToDeleteContainer = document.getElementById('file-list-to-delete-container');
  filesToDeleteContainer.innerHTML = generateGrowingSpinner(1, 0);

  // Create a reference under which you want to list
  const folderReference = storage.ref(CURRENT_FOLDER_FULL_PATH);
  const filesAndFolders = await folderReference.list({ maxResults: 1000 });
  const files = filesAndFolders.items;
  filesToDeleteContainer.innerHTML = generateFileListToDeleteHTML(files);
}

function resetDeleteFilesModal(hide) {
  if (hide) {
    const deleteFilesModal = document.getElementById('delete-files-modal');
    $(deleteFilesModal).modal('hide');
  }

  const deleteFilesButton = document.getElementById('delete-files-button');
  deleteFilesButton.disabled = false;
  const filesToDeleteContainer = document.getElementById('file-list-to-delete-container');
  filesToDeleteContainer.innerHTML = '';
}

function generateFileListToDeleteHTML(files) {
  let fileListToDeleteHTML = ``;
  let index = 0;

  files.forEach(file => {
    const fileName = file.name;
    const fileFullPath = file.fullPath;

    const fileHTML = `
      <a class="list-group-item list-group-item-action files-to-delete-button">
        <div class="custom-control custom-checkbox">
          <input id="file-${index}" class="custom-control-input files-checkbox" value="${fileFullPath}" type="checkbox">
          <label class="custom-control-label w-100 us-none" for="file-${index}">${fileName}</label>
        </div>
      </a>
    `;

    index++;
    fileListToDeleteHTML += fileHTML;
  });

  return fileListToDeleteHTML;
}

function getSelectedFilesToDelete() {
  const filesCheckbox = document.querySelectorAll('.files-checkbox');
  let filesFullPathList = []; 

  for (let index = 0; index < filesCheckbox.length; index++) {
    if (filesCheckbox[index].type === 'checkbox' && filesCheckbox[index].checked) {
      filesFullPathList.push(filesCheckbox[index].value);
    }
  }

  return filesFullPathList;
}

async function checkIfFolderStillExist() {
  // Create a reference under which you want to list
  const folderReference = storage.ref(CURRENT_FOLDER_FULL_PATH);
  const filesAndFolders = await folderReference.list({ maxResults: 1000 });
  const files = filesAndFolders.items;
  const folders = filesAndFolders.prefixes;

  if (files.length != 0 || folders.length != 0) {
    return true;
  } else {
    return false;
  }
}

function searchFilesToDelete() {
  let filter, li, a, i, txtValue;
  filter = document.getElementById('search-files-to-delete-input').value.toUpperCase();
  li = document.querySelectorAll('.files-to-delete-button');

  // Loop through all list items, and hide those who don't match the search query
  for (i = 0; i < li.length; i++) {
    a = li[i];
    txtValue = a.textContent || a.innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      li[i].style.display = "";
    } else {
      li[i].style.display = "none";
    }
  }
}


// Add File Category Function
async function addFileCategory(file) {
  const addFileCategoryButtonContainer = document.getElementById('add-file-category-button-container');
  const fileCategoryUploadProgressContainer = document.getElementById('file-category-upload-progress-container');
  addFileCategoryButtonContainer.setAttribute('style', 'display: none');
  fileCategoryUploadProgressContainer.setAttribute('style', 'display: block');

  let folders = '';

  if (ADD_FILE_CATEGORY_TO === 'Parent') {
    folders = await fetchSpecificFoldersData(FILES_ROOT_FOLDER);
  } else {
    folders = await fetchSpecificFoldersData(CURRENT_FOLDER_FULL_PATH);
  }
  
  const folderNameList = getDisplayAndActualNames(folders);
  const fileCategoryName =  document.getElementById('file-category-name-input').value;
  const isFolderNameValid = validateFolderName(fileCategoryName, folderNameList);

  if (isFolderNameValid) {
    const selectedColor = getSelectedColor();
    const linkColor = getLinkColor(selectedColor);
    const backgroundColor = getBackgroundColor(selectedColor);

    // Prepare the File and link for storage upload
    const targetFile = file.target.files[0];
    let parentFolder = '';
    let firestoreDocName = '';
    let folderFullPath = '';
    let storageRef = '';

    if (ADD_FILE_CATEGORY_TO === 'Parent') {
      parentFolder = FILES_ROOT_FOLDER;
      firestoreDocName = FILES_ROOT_FOLDER + '>' + fileCategoryName;
      folderFullPath = FILES_ROOT_FOLDER + '/' + fileCategoryName;
      storageRef = storage.ref(folderFullPath + '/' + targetFile.name);
    } else {
      parentFolder = CURRENT_FOLDER_FULL_PATH;
      firestoreDocName = CURRENT_FOLDER_FIRESTORE_DOC_NAME + '>' + fileCategoryName;
      folderFullPath = CURRENT_FOLDER_FULL_PATH + '/' + fileCategoryName;
      storageRef = storage.ref(folderFullPath + '/' + targetFile.name);
    }
  
    const task = storageRef.put(targetFile);

    const folderData = {
      fileCategoryName: fileCategoryName,
      parentFolder: parentFolder,
      linkColor: linkColor,
      backgroundColor: backgroundColor,
      firestoreDocName: firestoreDocName,
      folderFullPath: folderFullPath
    };

    uploadFileCategory(task, folderData);
  } else {
    resetAddFileCategoryModal(true);
    displayErrorAlert('File category name already exist');
  }
}

function fetchFolders() {
  return new Promise( resolve => {
    cloudFirestore.collection(FILES_ROOT_FOLDER).get().then( folders => {
      return resolve(folders);
    }).catch( error => {
      addFileCategoryError(error.message);
    });
  });
}

function getDisplayAndActualNames(folders) {
  let folderNameList = [];

  folders.forEach( folder => {
    const folderData = folder.data();
    folderNameList.push(folderData.actual_name);
    folderNameList.push(folderData.display_name);
  });

  return folderNameList;
}

function validateFolderName(folderName, folderNameList) {
  const index = folderNameList.indexOf(folderName);

  if (index === -1 && folderName.length != 0 && folderName.length <= 40) {
    return true;
  } else {
    return false;
  }
}

function getSelectedColor() {
  const radios = document.querySelectorAll('.color-radio-input');

  for (let i = 0; i < radios.length; i++) {
    if (radios[i].type === 'radio' && radios[i].checked) {
      const selectedRadioId = radios[i].id;
      return selectedRadioId;
    }
  }
}

function getLinkColor(selectedColor) {
  switch (selectedColor) {
    case '0':
      return "#90050c";
    case '1':
      return "#90050c";
    case '2':
      return "#90050c";
    case '3':
      return "#90050c";
    case '4':
      return "#90050c";
    case '5':
      return "#90050c";
    case '6':
      return "#343a40";
    default:
      return "#007bff";
  }
}

function getBackgroundColor(selectedColor) {
  switch (selectedColor) {
    case '0':
      return "btn-primary";
    case '1':
      return "btn-secondary";
    case '2':
      return "btn-success";
    case '3':
      return "btn-danger";
    case '4':
      return "btn-warning";
    case '5':
      return "btn-info";
    case '6':
      return "btn-dark";
    default:
      return "btn-primary";
  }
}

function uploadFileCategory(task, folderData) {
  const uploadFileCategoryProgressBar = document.getElementById('file-category-upload-progress-bar');

  task.on('state_changed', function progress(snapshot) {
    const percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    uploadFileCategoryProgressBar.style.width = percentage + "%";
  }, function error(error) {
    resetAddFileCategoryModal(true);
    displayErrorAlert(error.message);
  }, function complete() {
    saveFileCategoryData(folderData);
  });
}

function saveFileCategoryData(folderData) {
  cloudFirestore.collection(FILES_ROOT_FOLDER).doc(folderData.firestoreDocName).set({
    actual_name: folderData.fileCategoryName,
    display_name: folderData.fileCategoryName,
    parent_folder: folderData.parentFolder,
    link_color: folderData.linkColor, 
    background_color: folderData.backgroundColor,
    firestore_doc_name: folderData.firestoreDocName
  }).then( () => {
    addFileCategorySuccess(folderData);
  }).catch( error => {
    resetAddFileCategoryModal(true);
    displayErrorAlert(error.message);
  });
}

function resetAddFileCategoryModal(hide) {
  if (hide) {
    const addFileCategoryModal = document.getElementById('add-file-category-modal');
    $(addFileCategoryModal).modal('hide');
  }

  const addFileCategoryButtonContainer = document.getElementById('add-file-category-button-container');
  const fileCategoryUploadProgressContainer = document.getElementById('file-category-upload-progress-container');
  const fileCategoryUploadProgressBar = document.getElementById('file-category-upload-progress-bar');
  const addFileCategoryForm = document.getElementById('add-file-category-form');

  addFileCategoryButtonContainer.setAttribute('style', 'display: block');
  fileCategoryUploadProgressContainer.setAttribute('style', 'display: none');
  fileCategoryUploadProgressBar.setAttribute('style', 'width: 0%');
  addFileCategoryForm.reset();
}

function addFileCategorySuccess(folderData) {
  const searchFileCategoriesInput = document.getElementById('input-search-file-categories');
  searchFileCategoriesInput.value = '';

  resetAddFileCategoryModal(true);
  resetFilesTabRightSide();

  if (ADD_FILE_CATEGORY_TO === 'Parent') {
    const folderFullPath = folderData.folderFullPath;
    const firestoreDocName = folderData.firestoreDocName
  
    displayParentFileCategories();
    openFolder(folderFullPath, firestoreDocName, false);
  } else {
    openFolder(CURRENT_FOLDER_FULL_PATH, CURRENT_FOLDER_FIRESTORE_DOC_NAME, false);
  }

  displaySuccessAlert('Add File Category Success');
}

function setAddFileCategoryToParent() {
  resetAddFileCategoryModal(false);
  ADD_FILE_CATEGORY_TO = 'Parent';
}

function setAddFileCategoryToSubFolders() {
  resetAddFileCategoryModal(false);
  ADD_FILE_CATEGORY_TO = 'Sub Folder';
}


// Add File Function
function addFile(file) {
  const addFileModal = document.getElementById('add-file-modal');
  $(addFileModal).modal('show');

  const targetFile = file.target.files[0];
  const storageRef = storage.ref((CURRENT_FOLDER_FULL_PATH + '/') + targetFile.name);
  const task = storageRef.put(targetFile);

  const addFileUploadProgressBar = document.getElementById('add-file-upload-progress-bar');

  task.on('state_changed', function progress(snapshot) {
    const percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    addFileUploadProgressBar.style.width = percentage + '%';
  }, function error(error) {
    displayErrorAlert(error.message);
  }, function complete() {
    setTimeout( () => {
      $(addFileModal).modal('hide');
    }, 1000);
  
    openFolder(CURRENT_FOLDER_FULL_PATH, CURRENT_FOLDER_FIRESTORE_DOC_NAME, false);
    displaySuccessAlert('Add File Complete');
  });
}


// Rename File Category Function
async function renameFileCategory() {
  const renameFileCategoryButton = document.getElementById('rename-file-category-button');
  renameFileCategoryButton.disabled = true;

  const newFolderName = document.getElementById('rename-file-category-input').value;
  const folders = await fetchSpecificFoldersData(CURRENT_FOLDER_PARENT_FOLDER);
  const folderDisplayNameList = getFoldersDisplayName(folders);
  const isFolderNameValid = validateFolderName(newFolderName, folderDisplayNameList);

  if (isFolderNameValid) {
    cloudFirestore.collection(FILES_ROOT_FOLDER).doc(CURRENT_FOLDER_FIRESTORE_DOC_NAME).set({
      display_name: newFolderName
    }, { merge: true }).then( () => {
      renameFileCategorySuccess();
    }).catch( error => {
      resetRenameFileCategoryModal(true);
      displayErrorAlert(error.message);
    });
  } else {
    resetRenameFileCategoryModal(true);
    displayErrorAlert('File category name already exist');
  }
}

function getFoldersDisplayName(folders) {
  let folderDisplayNameList = [];

  folders.forEach( folder => {
    const folderDisplayName = folder.data().display_name;
    folderDisplayNameList.push(folderDisplayName);
  });

  return folderDisplayNameList;
}

function renameFileCategorySuccess() {
  const searchFileCategoriesInput = document.getElementById('input-search-file-categories');
  searchFileCategoriesInput.value = '';

  resetRenameFileCategoryModal(true);
  resetSearchFilesInput();
  resetFilesTabRightSide();
  displayParentFileCategories();
  openFolder(CURRENT_FOLDER_FULL_PATH, CURRENT_FOLDER_FIRESTORE_DOC_NAME, false);
  displaySuccessAlert('Rename File Category Success');
}

function resetRenameFileCategoryModal(hide) {
  if (hide) {
    const renameFileCategoryModal = document.getElementById('rename-file-category-modal');
    $(renameFileCategoryModal).modal('hide');
  }

  const fileCategoryName = document.getElementById('rename-file-category-input');
  const renameFileCategoryButton = document.getElementById('rename-file-category-button');
  fileCategoryName.value = '';
  renameFileCategoryButton.disabled = false;
}