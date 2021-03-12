// Global variables
let CURRENT_RECORD_CATEGORY = undefined;

const RECORDS_ROOT_FOLDER = 'Office1Records';



// Event: Switch to Records Tab
document.getElementById('nav-records-tab').addEventListener('click', () => {
  switchToRecordsTab();
});


// Event: Add Record Category
document.getElementById('add-record-category-button').addEventListener('click', () => {
  addRecordCategory();
});


// Event: Add Record
document.getElementById('add-record-button').addEventListener('click', () => {
  addRecord();
});


// Event: Rename Record Category
document.getElementById('rename-record-category-button').addEventListener('click', () => {
  renameRecordCategory();
});



// Switch to Files Tab Functions
function switchToRecordsTab() {
  const leftSideTab = document.getElementById('left-side-tab');
  leftSideTab.innerHTML = generateRecordsTabLeftSideHTML();

  CURRENT_RECORD_CATEGORY = undefined;

  resetSearchRecordsInput();
  resetRecordsTabRightSide();
  displayRecordCategories()
}

function generateRecordsTabLeftSideHTML() {
  const recordsTabLeftSideHTML = `
    <!-- Search Record Categories Form -->
    <form class="form-inline mt-3" autocomplete="off">
      <input id="input-search-record-categories" class="form-control border-dark w-100" onkeyup="searchRecordCategories()" 
        type="text" placeholder="Search Record Categories">
    </form>

    <h5 class="my-2"><strong>Record Categories</strong></h5>
    
    <!-- Record Categories Container -->
    <div id="record-categories-container" class="overflow-auto">
    </div>

    <button class="btn btn-outline-primary btn-block mt-auto" style="margin-bottom: 0.75rem" type="button" onclick="resetAddRecordCategoryModal(false)" data-toggle="modal" data-target="#add-record-category-modal">
      <i class="fa fa-plus" aria-hidden="true"></i>
      &nbsp;
      Add Record Category
    </button>
  `;

  return recordsTabLeftSideHTML;
}

function resetSearchRecordsInput() {
  const searchInput = document.getElementById('search-input');
  searchInput.setAttribute('style', 'display: inline-block');
  searchInput.setAttribute('placeholder', 'Search Records');
  searchInput.setAttribute('onkeyup', 'searchRecords()');
  searchInput.value = '';
}

function searchRecords() {
  let filter, li, a, i, txtValue;
  
  filter = document.getElementById('search-input').value.toUpperCase();
  li = document.querySelectorAll('.record-div');

  // Loop through all list items, and hide those who don't match the search query
  for (i = 0; i < li.length; i++) {
    a = li[i].getElementsByTagName("a")[0];
    txtValue = a.textContent || a.innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      li[i].style.display = "";
    } else {
      li[i].style.display = "none";
    }
  }
}

function resetRecordsTabRightSide() {
  const recordsTabRightSideHeader = document.getElementById('records-tab-right-side-header');
  const recordsCategoryNameField = document.getElementById('record-category-name-field');
  const recordsTabContentContainer = document.getElementById('records-tab-content-container');

  recordsTabRightSideHeader.setAttribute('style', 'display: none');
  recordsCategoryNameField.innerHTML = '';
  recordsTabContentContainer.innerHTML = '';
}


// Display Record Categories
async function displayRecordCategories() {
  const recordCategoriesContainer = document.getElementById('record-categories-container');
  recordCategoriesContainer.innerHTML = generateGrowingSpinner(0, 0);

  const recordCategories = await fetchRecords();
  const recordCategoriesButton = generateRecordCategoryButtons(recordCategories);
  recordCategoriesContainer.innerHTML = recordCategoriesButton;

  CURRENT_RECORD_CATEGORY = undefined;
}

function fetchRecords() {
  return new Promise( resolve => {
    cloudFirestore.collection(RECORDS_ROOT_FOLDER).get().then( records => {
      return resolve(records);
    }).catch( error => {
      displayErrorAlert(error.message);
    });
  });
}

function generateRecordCategoryButtons(recordCategories) {
  let recordCategoriesButton = '';

  if (recordCategories.size != 0) {
    recordCategories.forEach( recordCategory => {
      const recordCategoryName = recordCategory.data().recordname;
      const recordCategoryButton = `
        <button class="btn btn-outline-secondary text-truncate record-category-button" type="button" onclick="displayRecords('${recordCategoryName}')">
          <i class="fa fa-folder-open mr-1" aria-hidden="true"></i>
          ${recordCategoryName}
        </button>
      `;
      recordCategoriesButton += recordCategoryButton;
    });
  } else {
    recordCategoriesButton = `<h5 class="text-center mt-2">No records saved</h5>`;
  }

  return recordCategoriesButton;
}


// Display Records
async function displayRecords(recordCategory) {
  resetRecordsTabRightSide();

  const recordsTabContentContainer = document.getElementById('records-tab-content-container');
  recordsTabContentContainer.innerHTML = generateGrowingSpinner(5, 5);

  const records = await fetchSpecificRecord(recordCategory);
  const recordsHTML = generateRecordsHTML(records);

  recordsTabContentContainer.innerHTML = generateAccordionContainerHTML();

  const accordionContainer = document.getElementById('accordionContainer');
  accordionContainer.innerHTML = recordsHTML;

  const recordsTabRightSideHeader = document.getElementById('records-tab-right-side-header');
  recordsTabRightSideHeader.style.display = 'flex';

  const recordCategoryNameField = document.getElementById('record-category-name-field');
  recordCategoryNameField.innerHTML = recordCategory;
  
  resetRecordsMaxHeight();

  CURRENT_RECORD_CATEGORY = recordCategory;
}

function fetchSpecificRecord(recordCategory) {
  return new Promise( resolve => {
    cloudFirestore.collection(RECORDS_ROOT_FOLDER).doc(recordCategory).get().then( record => {
      return resolve(record);
    }).catch (error => {
      displayErrorAlert(error.message);
    });
  });
}

function generateRecordsHTML(records) {
  const recordItem = records.data();
  const recordCount = records.data().count;
  let recordsHTML = ``;

  for (let index = 1; index <= recordCount; index++) {
    const itemNumber = 'item' + index;

    const accordion = `
    <div class="card mb-2 record-container">
      <div class="card-header record-max-lines">
        <a class="card-link text-dark" data-toggle="collapse" href="#${itemNumber}">
          <p class="mb-0" style="white-space: pre-wrap;">${recordItem[itemNumber]}</p>                             
        </a>
      </div>

      <div id="${itemNumber}" class="collapse" data-parent="#accordionContainer">
        <div class="card-body">
          <p class="mb-0" style="white-space: pre-wrap;">${recordItem[itemNumber]}</p>                             
        </div>
      </div>
    </div>
    `;

    recordsHTML += accordion;
  }

  return recordsHTML;
}

function generateAccordionContainerHTML() {
  const accordionContainerHTML = `
    <div id="accordionContainer" class="accordion"></div>
  `;

  return accordionContainerHTML;
}

function searchRecordCategories() {
  let filter, li, a, i, txtValue;

  filter = document.querySelector('#input-search-record-categories').value.toUpperCase();
  li = document.querySelectorAll('.record-category-button');

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

function searchRecords() {
  let filter, li, a, i, txtValue;
  
  filter = document.getElementById('search-input').value.toUpperCase();
  li = document.querySelectorAll('.record-container');

  // Loop through all list items, and hide those who don't match the search query
  for (i = 0; i < li.length; i++) {
    a = li[i].getElementsByTagName("a")[0];
    txtValue = a.textContent || a.innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      li[i].style.display = "";
    } else {
      li[i].style.display = "none";
    }
  }
}

function resetRecordsMaxHeight() {
  const recordsTabRightSideHeader = document.getElementById('records-tab-right-side-header');
  const recordsTabContentContainer = document.getElementById('records-tab-content-container');
  const recordsTabRightSideHeaderClientHeight = recordsTabRightSideHeader.clientHeight;

  const filesTabContentContainerMaxHeight = 103 + (recordsTabRightSideHeaderClientHeight + 16) + 'px';
  recordsTabContentContainer.style.maxHeight = 'calc(100vh - ' + filesTabContentContainerMaxHeight + ')';
}


// Add Record Category Function
async function addRecordCategory() {
  const addRecordCategoryButton = document.getElementById('add-record-category-button');
  addRecordCategoryButton.disabled = true;

  const recordCategoryName = document.getElementById('record-category-name-input').value;
  const recordContent = document.getElementById('record-content').value;

  const recordCategories = await fetchRecords();
  const recordCategoryNameList = getRecordNames(recordCategories);
  const isRecordCategoryNameValid = validateRecordCategoryName(recordCategoryNameList, recordCategoryName, recordContent);

  if (isRecordCategoryNameValid) {
    cloudFirestore.collection(RECORDS_ROOT_FOLDER).doc(recordCategoryName).set({
      recordname: recordCategoryName,
      item1: recordContent,
      count: 1
    }).then( () => {
      addRecordCategorySuccess(recordCategoryName);
    }).catch( error => {
      resetAddRecordCategoryModal(true);
      displayErrorAlert(error.message);
    });
  } else {
    resetAddRecordCategoryModal(true);
    displayErrorAlert('Record category name already exist');
  }
}

function resetAddRecordCategoryModal(hide) {
  if (hide) {
    const addRecordCategoryModal = document.getElementById('add-record-category-modal');
    $(addRecordCategoryModal).modal('hide');
  }

  const addRecordCategoryForm = document.getElementById('add-record-category-form');
  const addRecordCategoryButton = document.getElementById('add-record-category-button');
  addRecordCategoryForm.reset();
  addRecordCategoryButton.disabled = false;
}

function getRecordNames(recordCategories) {
  let recordCategoryNameList = [];

  recordCategories.forEach( recordCategory => {
    const recordCategoryName = recordCategory.data().recordname;
    recordCategoryNameList.push(recordCategoryName);
  });

  return recordCategoryNameList;
}

function validateRecordCategoryName(recordCategoryNameList, recordCategoryName, recordContent) {
  const index = recordCategoryNameList.indexOf(recordCategoryName);

  if (index == -1 && recordCategoryName.length != 0 && recordContent.length != 0 && recordCategoryName.length <= 40) {
    return true;
  } else {
    return false;
  }
}

function addRecordCategorySuccess(recordCategoryName) {
  const searchRecordCategories = document.getElementById('input-search-record-categories');
  searchRecordCategories.value = '';

  resetAddRecordCategoryModal(true);
  displayRecordCategories();
  displayRecords(recordCategoryName);
  displaySuccessAlert('Add Record Category Success');
}


// Add Record Function
async function addRecord() {
  const addRecordButton = document.getElementById('add-record-button');
  addRecordButton.disabled = true;

  const recordContent = document.getElementById('add-record-input').value;
  const isRecordContentValid = validateRecordContent(recordContent);

  if (isRecordContentValid) {
    const recordCategoryInfo = await fetchSpecificRecord(CURRENT_RECORD_CATEGORY);
    const lastItemNumberCount = recordCategoryInfo.data().count + 1;
    const itemNumber = 'item' + lastItemNumberCount;

    cloudFirestore.collection(RECORDS_ROOT_FOLDER).doc(CURRENT_RECORD_CATEGORY).set({
      [itemNumber]: recordContent,
      count: lastItemNumberCount
    }, { merge: true }).then( () => {
      addRecordSuccess();
    }).catch( error => {
      resetAddRecordModal(true);
      displayErrorAlert(error.message);
    });
  } else {
    resetAddRecordModal(true);
    displayErrorAlert('Write content before sumbitting');
  }
}

function validateRecordContent(recordContent) {
  if (recordContent.length != 0 && CURRENT_RECORD_CATEGORY != undefined) {
    return true;
  } else {
    return false;
  }
}

function resetAddRecordModal(hide) {
  if (hide) {
    const addRecordModal = document.getElementById('add-record-modal');
    $(addRecordModal).modal('hide');
  }

  const addRecordInput = document.getElementById('add-record-input');
  const addRecordButton = document.getElementById('add-record-button');
  addRecordInput.value = '';
  addRecordButton.disabled = false;
}

function addRecordSuccess() {
  resetAddRecordModal(true);
  displayRecords(CURRENT_RECORD_CATEGORY);
  displaySuccessAlert('Add Record Success');
}


// Rename Record Category Function
async function renameRecordCategory() {
  const renameRecordCategoryModalNote = document.getElementById('rename-record-category-modal-note');
  const renameRecordCategoryButton = document.getElementById('rename-record-category-button');
  renameRecordCategoryModalNote.setAttribute('style', 'display: block');
  renameRecordCategoryButton.disabled = true;

  const newRecordName = document.getElementById('rename-record-category-input').value;

  const recordCategories = await fetchRecords();
  const recordCategoryNameList = getRecordNames(recordCategories);
  const isNewRecordCategoryNameValid = validateNewRecordCategoryName(recordCategoryNameList, newRecordName);

  if (isNewRecordCategoryNameValid) {
    const recordCategoryInfo = await fetchSpecificRecord(CURRENT_RECORD_CATEGORY);

    const recordItems = recordCategoryInfo.data();
    const lastItemCount = recordCategoryInfo.data().count;

    const recordItemList = getRecordItems(recordItems, lastItemCount);

    cloudFirestore.collection(RECORDS_ROOT_FOLDER).doc(CURRENT_RECORD_CATEGORY).delete().then( () => {
      // Loop through each Record Items from temporary array and save them to firestore one at a time
      for (let currentItem = 1; currentItem <= lastItemCount; currentItem++) {
        const name = 'item' + currentItem;

        cloudFirestore.collection(RECORDS_ROOT_FOLDER).doc(newRecordName).set({
          recordname: newRecordName,
          [name]: recordItemList[currentItem - 1],
          count: lastItemCount
        }, { merge: true }).then( () => {
          if (currentItem === lastItemCount) {
            renameRecordCategorySuccess(newRecordName);
          }
        }).catch( error => {
          resetRenameRecordCategoryModal(true);
          displayErrorAlert(error.message);
        });
      }
    }).catch( error => {
      resetRenameRecordCategoryModal(true);
      displayErrorAlert(error.message);
    });
  } else {
    resetRenameRecordCategoryModal(true);
    displayErrorAlert('Try Other Name');
  }
}

function resetRenameRecordCategoryModal(hide) {
  if (hide) {
    const renameRecordCategoryModal = document.getElementById('rename-record-category-modal');
    $(renameRecordCategoryModal).modal('hide');
  }
  
  const newRecordCategoryInput = document.getElementById('rename-record-category-input');
  const renameRecordCategoryButton = document.getElementById('rename-record-category-button');
  const renameRecordCategoryModalNote = document.getElementById('rename-record-category-modal-note');
  
  newRecordCategoryInput.value = '';
  renameRecordCategoryButton.disabled = false;
  renameRecordCategoryModalNote.style.display = 'none';
}

function validateNewRecordCategoryName(recordCategoryNameList, newRecordCategoryName) {
  const index = recordCategoryNameList.indexOf(newRecordCategoryName);

  if (index == -1 && newRecordCategoryName.length != 0 && newRecordCategoryName.length <= 40) {
    return true;
  } else {
    return false;
  }
}

function getRecordItems(recordItems, lastItemCount) {
  let recordItemList = [];

  for (let index = 1; index <= lastItemCount; index++) {
    const name = 'item' + index;
    recordItemList.push(recordItems[name]);
  }

  return recordItemList;
}

function renameRecordCategorySuccess(recordCategory) {
  const searchRecordCategories = document.getElementById('input-search-record-categories');
  searchRecordCategories.value = '';

  resetRenameRecordCategoryModal(true);
  displayRecordCategories();
  displayRecords(recordCategory);
  displaySuccessAlert('Rename Record Category Success');
}