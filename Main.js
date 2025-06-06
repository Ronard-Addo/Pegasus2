import { displayInventoryTable } from './viewTable.js';
import { displayProducts } from './viewProducts.js';
import { loadUpdateTableForm } from './updateTable.js';
import { loadCreateTableForm } from './createTable.js';

document.getElementById('submit-selection').addEventListener('click', (e) => {
    e.preventDefault();
    handleSelection();
});

export function loadInitialForm() {
    window.location.reload(true); // The 'true' forces a hard reload
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
export async function loadTableInputForm() {
    localStorage.setItem('currentView', 'tableInputForm');  

    const contentDiv = document.getElementById('dynamic-content');
    if (!contentDiv) {
        console.error("Element with id 'dynamic-content' not found.");
        return;
    }
    
    const tables = await fetchData('get_tablenames', null, {});

    console.log("tables: ", tables);

    let formHTML = `
        <form id="table-selection-form">
            <h2>Table Selection Page</h2>
            <div class="main-section">                    
                <label for="select-element">Select one of the following tables:</label>
                <select class="table-selection-section" id="select-element" size="5">                    
                    <option value="" disabled selected>
                        Select a table
                    </option>`

    tables.forEach(table => {
        console.log("table name: ", table.table_name);
        formHTML += `<option value="${table.table_name}">${table.table_name}</option>`;
    });
                    
    
    formHTML += `
                </select>
                </div>
            <div class="button-container">
                <button type="button" id="back-button" class="btn back-btn">Back</button>
                <button type="button" id="submit-table-name" class="btn">Continue</button>
            </div>
        </form>
    `;
    
    contentDiv.innerHTML = formHTML;
     
    // Wait for next tick to ensure DOM is updated
    setTimeout(() => {
        const submitBtn = document.getElementById('submit-table-name');
        const backBtn = document.getElementById('back-button');
        
        if (!submitBtn || !backBtn) {
            console.error("Buttons not found in DOM");
            return;
        }
        
        submitBtn.addEventListener('click', () => {
            const tableName = getSelectedTable();
            
            if (tableName) {
                localStorage.setItem('tableName', tableName);
                handleActionMap(tableName);
            } else {
                alert("Please select a table first!");
            }
        });
        
        backBtn.addEventListener('click', loadInitialForm);
    }, 0);
}


function getSelectedTable() {
    const selectElement = document.getElementById('select-element');
    
    if (!selectElement) {
        console.error("Select element not found");
        return null;
    }
    
    const selectedValue = selectElement.value;
    
    if (!selectedValue) {
        console.warn("No table selected");
        return null;
    }
    
    console.log("Selected table:", selectedValue);
    return selectedValue;
}

export function postFileUpload() {

    const tableName = localStorage.getItem('tableName');

    const messageDiv = document.getElementById('upload-message');

    fetchData("get_table_data", displayInventoryTable, {target_table: tableName});
}

// ========================
// ACTION HANDLING FUNCTION
// ========================
function handleActionMap(tableName) {
    console.log("handleActionMap function invoked");

    console.log("tableName: ", tableName);

    const selectedOption = localStorage.getItem('selectedOption');
    
    switch(selectedOption) {
        case "viewTable":
            fetchData("get_table_data", displayInventoryTable, {target_table: tableName});
            break;
        case "viewProductInformation":
        case "updateProduct":
            fetchData("get_table_data", displayProducts,{target_table: tableName});
            break;
        case "updateTable":
            loadUpdateTableForm();
    }
}

// ======================
// DATA FETCHING FUNCTION
// ======================
    export async function fetchData(procedure, handler, params = {}) {
    
        return fetch('https://supabase-proxy-tq5t.onrender.com/profile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            procedure: procedure,
            params: params
        })
        })
        .then(res => res.json())
        .then(data => {
            console.log('Response:', data);
            if (handler) handler(data.data);
            else return data.data;
        })
        .catch(err => console.error('Fetch error:', err));

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