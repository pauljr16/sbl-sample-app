// Global variables
let CURRENT_RECORD_CATEGORY = undefined;

const RECORDS_ROOT_FOLDER = 'Office1Records';



// Event: Switch to Records Tab
document.getElementById('nav-records-tab').addEventListener('click', () => {
  switchToRecordsTab();
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