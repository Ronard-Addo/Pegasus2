
import { loadInitialForm } from './Main.js';
import { fetchData } from './Main.js';
import { postFileUpload } from './Main.js';

import * as XLSX from "https://cdn.sheetjs.com/xlsx-0.20.2/package/xlsx.mjs";

// ======================
// UPDATE TABLE FUNCTIONS
// ======================
function updateTable() {
    loadTableInputForm();
    console.log("finish");
}

export function loadUpdateTableForm() {
    const contentDiv = document.getElementById('dynamic-content');
    contentDiv.innerHTML = `
        <form id="update-table-form">
            <h2>Update Table via Excel File</h2>
            <div class="table-selection">
                <h3>Select Table to Update:</h3>
            </div>
            <div class="form-group">
                <label for="excelFile">Select Excel File:</label>
                <input type="file" id="excelFile" name="excelFile" accept=".xlsx, .xls" required>
                <small>File should match table structure</small>
            </div>
            <div id="upload-message"></div>
            <div class="button-container">
                <button type="button" id="back-button" class="btn back-btn">Back</button>
                <button type="button" id="submit-excel" class="btn">Upload & Update</button>
            </div>
        </form>
    `;
    
    document.getElementById('back-button').addEventListener('click', loadInitialForm);
    document.getElementById('submit-excel').addEventListener('click', handleFileUpload);
}


export async function handleFileUpload() {
    
    const fileInput = document.getElementById('excelFile');

    if (!fileInput.files.length) {
        messageDiv.innerHTML = '<p class="error">Please select an Excel file</p>';
        return;
    }

    const messageDiv = document.getElementById('upload-message');

    const selected = localStorage.getItem('selectedOption');

    let tableName;

    if (selected === 'updateTable') {
        tableName = localStorage.getItem('tableName');
    } else if (selected === 'createTable') {
        tableName = document.getElementById('newTableName').value.trim();
        localStorage.setItem('tableName', tableName);
    }

    console.log("Table name: ", tableName);

    if (!tableName) {
        messageDiv.innerHTML = '<div class="error">Please enter a table name</div>';
        return;
    } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
        messageDiv.innerHTML = '<div class="error">Invalid table name. Only letters, numbers and underscores are allowed, starting with a letter</div>';
        return;
    }

    messageDiv.innerHTML = '<div class="loading-spinner">Processing file...</div>';
    
    try {
        const file = fileInput.files[0];
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        console.log("jsonData: ", jsonData);

        if (!jsonData || jsonData.length === 0) {
            alert("Uploaded Excel file does not contain any data");
            return;
        }

        let valid = false;

        const keys = Object.keys(jsonData[0]);       

        for (const key of keys) {
            if (key === 'id') {
                valid = true;
                break;
            }
        }

        if (!valid) {
            alert("Uploaded Excel file must contain an 'id' column");
            return;
        }

        if (selected === 'updateTable') {
            fetchData('update_table', postFileUpload, {target_table: tableName, excel_data: jsonData});
        } else if (selected === 'createTable') {
            fetchData('create_table', postFileUpload, {target_table: tableName, excel_data: jsonData});
        }

    } catch (error) {
        console.error('Upload failed:', error);
        messageDiv.innerHTML = `
            <p class="error">Upload failed: ${error.message}</p>
            ${error.details ? `<p>${error.details}</p>` : ''}
        `;
    }
}