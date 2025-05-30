import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { CONFIG } from './config.js';

import { displayInventoryTable } from './viewTable.js';
import { displayProducts } from './viewProducts.js';
import { loadUpdateTableForm } from './updateTable.js';
import { loadCreateTableForm } from './createTable.js';

console.log("url: ", CONFIG.url); // Supabase URL
console.log("key: ", CONFIG.key); // Supabase Key

export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);

// Test 2
document.getElementById('submit-selection').addEventListener('click', (e) => {
    e.preventDefault();
    handleSelection();
});

export function loadInitialForm() {
    window.location.reload(true); 
}

function handleSelection() {
    const selectedRadio = document.querySelector('input[name="option"]:checked');
    if (!selectedRadio) {
        alert("Please select an option.");
        return;
    }
    
    const selectedOption = selectedRadio.value;
    localStorage.setItem('selectedOption', selectedOption);

    if (selectedOption === 'viewTable') {
        // testPageLoad()
        loadTableInputForm();
    } else if (selectedOption === 'viewProductInformation') {
        loadTableInputForm();
    } else if (selectedOption === 'updateProduct') {
        loadTableInputForm();
    } else if (selectedOption === 'updateTable') {
        //updateTable();
        loadTableInputForm();
    } else if (selectedOption === 'createTable') {
        loadCreateTableForm();
    } else if (selectedOption === 'stats') {
        statSelectionForm();
    }
}

// ======================
// TABLE SELECTION FUNCTIONS
// ======================


export function loadTableInputForm() {
    localStorage.setItem('currentView', 'tableInputForm');  

    const contentDiv = document.getElementById('dynamic-content');
    if (!contentDiv) {
        console.error("Element with id 'dynamic-content' not found.");
        return;
    }
    
    const formHTML = `
        <form id="table-input-form">
            <h2>Select one of the following options</h2>
            <div class="table-input-section">                    
                <div class="table-selection-section" id="table-selection-section">                    
                    <label>
                        <input type="radio" name="input-option" id="table-selection" value="table-selection" checked>
                        Select a table name
                    </label>
                    <div class="table-list-section" id="table-list-section"></div>
                </div>
                <div class="table-text-section">
                    <label id="table-text-label">
                        <input type="radio" name="input-option" id="text-input" value="text-input">
                        Search for similar table names
                    </label>
                    <div class="text-input-section" id="table-text-input-section">
                        <label for="text-input-field">Enter a table name to search for tables with similar names:</label>
                        <input type="text" name="text-input-field">
                    </div>
                </div>
            </div>
            <div class="button-container">
                <button type="button" id="submit-table-name" class="btn">Continue</button>
                <button type="button" id="back-button" class="btn back-btn">Back</button>
            </div>
        </form>
    `;
    
    contentDiv.innerHTML = formHTML;
    
    
    // Initialize visibility
    const tableListSection = document.getElementById('table-list-section');
    const textInputSection = document.getElementById('table-text-input-section');
    textInputSection.style.display = 'none';
    
    //await delay(20000);

    // Load initial table list
    getTableNames("all-tables", "table-list-section");
    
    // Set up radio button event delegation
    document.getElementById('table-input-form').addEventListener('change', function(e) {
        if (e.target.name === 'input-option') {
            if (e.target.value === 'table-selection') {
                tableListSection.style.display = 'block';
                textInputSection.style.display = 'none';
                getTableNames("all-tables", "table-list-section");
            } else {
                tableListSection.style.display = 'none';
                textInputSection.style.display = 'block';
            }
        }
    });
    
    

    document.getElementById('table-input-form').addEventListener('submit', (e) => {
        e.preventDefault(); // Stop default form submission
    });

    

    

    // Set up button event listeners
    document.getElementById('submit-table-name').addEventListener('click', function() {
        localStorage.removeItem('currentView'); // Clear state
        localStorage.setItem('previousView', loadTableInputForm); // Clear state
        handleRadioSelection(true);
    });
    
    document.getElementById('back-button').addEventListener('click', () => {
        localStorage.removeItem('currentView'); // Clear state
        loadInitialForm();
    });
}


function getTableNames(option, location) {
    
    localStorage.setItem('location', location);
    const procedure = option==="all-tables"? "get_tablenames" : "getTablesLike"
    
    fetchData(procedure, displayTableNames);
}

async function displayTableNames(data) {
    
    console.log("Tables: ", data);
    console.log(localStorage.getItem('location'));

    //await delay(20000);

    const destination = localStorage.getItem('location');
    
    console.log("location: ", destination);

    //await delay(20000);
    
    const contentDiv = document.getElementById("table-list-section");

    if (!contentDiv) {
        console.error(`Element with id '${location}' not found.`);
        return;
    }
    
    // Format the data for display
    if (data && data.length > 0) {
      const tableList = data.map(item => `
        <div class="table-option">
          <label>
            <input type="radio" name="table-radio" value="${item.table_name}" required>
            ${item.table_name} (Rows: ${item.row_count})
          </label>
        </div>
      `).join('');
      contentDiv.innerHTML = tableList;
    } else {
      contentDiv.innerHTML = '<p>No tables found in the database.</p>';
    }

    localStorage.removeItem('location');

    
}

function getSelectedTable() {
    const selectedTableRadio = document.querySelector('input[name="table-radio"]:checked');
    if (!selectedTableRadio) {
        alert('Please select a table.');
        return null;
    }
    
    const tableName = selectedTableRadio.value;

    localStorage.setItem('tableName', tableName);
    return tableName;
}

function handleRadioSelection(tableForm) {
    const option = document.querySelector('input[name="input-option"]:checked').value;
    
    if (option === "text-input") {
        const tableName = document.querySelector('input[name="text-input-field"]').value.trim();
        if (!tableName) {
            alert('Please enter a table name to search');
            return;
        }
        loadTableResultsPage(tableName);
    } else {
        const selected = getSelectedTable();
        if (selected) {
            console.log("Selected table is", selected);
            handleActionMap(selected);
        }
    }
}

function loadTableResultsPage(tableName) {
    const contentDiv = document.getElementById('dynamic-content');
    
    contentDiv.innerHTML = `
        <form id="table-results-page">
            <h2>Table Results</h2>
            <h3>Select a table to view its contents</h3>
            <div class="table-selection">
                <div class="table-list-section" id="results-table-list-section"></div>
            </div>
            <div class="button-container">
                <button type="button" id="back-button" class="btn back-btn">Back</button>
                <button type="button" id="tables-page-submit" class="btn">Submit</button>
            </div>
        </form>
    `;
    
    getTableNames(tableName, "results-table-list-section");
    
    document.getElementById('back-button').addEventListener('click', loadInitialForm);
    document.getElementById('tables-page-submit').addEventListener('click', function() {
        const selected = getSelectedTable();
        if (selected) {
            handleActionMap(selected);
        }
    });
}

// ======================
// ACTION HANDLING FUNCTIONS
// ======================
function handleActionMap(selected) {
    console.log("handleActionMap function invoked");

    //const sentData = {tableName: selected, test: "test"};

    //console.log(sentData);
    const selectedOption = localStorage.getItem('selectedOption');
    
    switch(selectedOption) {
        case "viewTable":
            fetchData("get_table_data", displayInventoryTable, {target_table: selected});
            break;
        case "viewProductInformation":
        case "updateProduct":
            fetchData("get_table_data", displayProducts,{target_table: selected});
            break;
        case "updateTable":
            loadUpdateTableForm();
            break;
    }
}

// ======================
// DATA FETCHING FUNCTION
// ======================
export async function fetchData(procedure, handler, params = {}) {
  const contentDiv = document.getElementById('dynamic-content');

    if (!contentDiv) {
      throw new Error(`Element with ID '${location}' not found`);
    }

  try {
    
    let result;

    const { data, error } = await supabase
        .rpc(procedure, params);
      
      if (error) throw error;
      result = data;

    console.log('Returned data:', result);
    handler(result);

  } catch (error) {
    console.error('Error fetching table names:', error);
    
    contentDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
  }
}


// ======================
// UTILITY FUNCTIONS
// ======================
export function addBackButton() {
    const contentDiv = document.getElementById('dynamic-content');
    const backButton = document.createElement('button');
    backButton.textContent = 'Back';
    backButton.className = 'btn back-btn';
    backButton.addEventListener('click', loadInitialForm);
    contentDiv.appendChild(backButton);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
