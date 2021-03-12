// Global Variables
const FILES_ROOT_FOLDER = 'Office3Files';

let CURRENT_FOLDER_FULL_PATH = FILES_ROOT_FOLDER;
let CURRENT_FOLDER_FIRESTORE_DOC_NAME = '';
let CURRENT_FOLDER_PARENT_FOLDER = '';
let CURRENT_FOLDER_DISPLAY_NAME = '';

let PREVIOUS_FOLDER_DISPLAY_NAME_LIST = [];
let PREVIOUS_FOLDER_FULL_PATH_LIST = [];
let PREVIOUS_FOLDER_FIRESTORE_DOC_NAME_LIST = [];


// Event: Display Files categories when the page finish loading
document.addEventListener('DOMContentLoaded', () => {
  switchToFilesTab();
});


// Event: Switch to Files Tab
document.getElementById('nav-files-tab').addEventListener('click', () => {
  switchToFilesTab();
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

  resetSearchFilesInput();
  resetFilesTabRightSide();
  displayParentFileCategories();
}

function generateFilesTabLeftSideHTML() {
  const filesTabLeftSideHTML = `
    <!-- Search File Categories Form -->
    <form class="form-inline mt-3" autocomplete="off">
      <input id="input-search-file-categories" class="form-control border-dark w-100" onkeyup="searchFileCategories()" 
        type="text" placeholder="Search Folder">
    </form>

    <h5 class="my-2" style="color:#fff;"><strong>BUSINESS ORDER</strong></h5>
    
    <!-- File Categories Container -->
    <div id="file-categories-container" class="overflow-auto">
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
        <div id="${displayName}"></div>
      `;

      folderButtonsHTML += folderButton;
    });
  } else {
    folderButtonsHTML = `<h5 class="text-center mt-2" style="color:#fff">No files saved</h5>`;
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
            <div class=" ${textColor} mb-0 px-2 py-1 file-and-folder-title us-none" style="background-color:#90050c;" >${displayName}</div>
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
            <p class="${textColor} mb-0 px-2 py-1 file-and-folder-title us-none" style="background-color:#90050c;" >${fileName}</p>
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
        li = `<li class="breadcrumb-item us-none" style="color:#fff;"><a class="breadcrumb-link" onclick="navigateFolder('${PREVIOUS_FOLDER_FULL_PATH_LIST[index]}', '${PREVIOUS_FOLDER_FIRESTORE_DOC_NAME_LIST[index]}', ${index})">${PREVIOUS_FOLDER_DISPLAY_NAME_LIST[index]}</a></li>`;
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

function deleteFolderData(firestoreDocName) {
  return new Promise( resolve => {
    cloudFirestore.collection(FILES_ROOT_FOLDER).doc(firestoreDocName).delete().then( () => {
      return resolve('Delete success');
    }).catch( error => {
      displayErrorAlert(error.message);
    });
  });
}

function resetFilesMaxHeight() {
  const filesTabRightSideHeader = document.getElementById('files-tab-right-side-header');
  const filesTabContentContainer = document.getElementById('files-tab-content-container');
  const filesTabRightSideHeaderClientHeight = filesTabRightSideHeader.clientHeight;

  const filesTabContentContainerMaxHeight = 104 + (filesTabRightSideHeaderClientHeight + 16) + 'px';
  filesTabContentContainer.style.maxHeight = 'calc(100vh - ' + filesTabContentContainerMaxHeight + ')';
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
