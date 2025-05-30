
import { loadInitialForm } from './Main.js';
import { fetchData } from './Main.js';
import { displayInventoryTable } from './viewTable.js';
import { supabase } from './Main.js';

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


async function handleFileUpload() {
    const fileInput = document.getElementById('excelFile');
    const messageDiv = document.getElementById('upload-message');
    const tableName = localStorage.getItem('tableName');
    
    if (!fileInput.files.length) {
        messageDiv.innerHTML = '<p class="error">Please select an Excel file</p>';
        return;
    }
    
    messageDiv.innerHTML = '<div class="loading-spinner">Processing file...</div>';
    
    try {
        // 1. Read Excel file
        const file = fileInput.files[0];
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        console.log("jsonData: ", jsonData);

        // 2. Send to Supabase
        const { data: result, error } = await supabase.rpc('update_table', {
            target_table: tableName,
            excel_data: jsonData
        });
        
        if (error) throw error;
        
        // 3. Show success
        messageDiv.innerHTML = `
            <div class="success-message">
                <p>Table "${tableName}" created successfully!</p>
                <p>Columns: ${result.columns.join(', ')}</p>
                <p>Rows inserted: ${result.row_count}</p>
            </div>
        `;
        
        // 4. Refresh table display
        displayInventoryTable(await getTableData(tableName));
        
    } catch (error) {
        console.error('Upload failed:', error);
        messageDiv.innerHTML = `
            <p class="error">Upload failed: ${error.message}</p>
            ${error.details ? `<p>${error.details}</p>` : ''}
        `;
    }
}

// Helper function to get table data
async function getTableData(tableName) {
    const { data, error } = await supabase.rpc('get_table_data', {
        target_table: tableName
    });
    if (error) throw error;
    return data;
}

/*function handleFileUpload() {
    const fileInput = document.getElementById('excelFile');
    const messageDiv = document.getElementById('upload-message');
    
    if (!fileInput.files.length) {
        alert("Please select an Excel file");
        return;
    }
    
    messageDiv.innerHTML = '<div class="loading-spinner">Uploading and processing file...</div>';
    
    const tableName = localStorage.getItem('tableName');

    const sentData = {target_table: tableName, excelFile: fileInput.files[0] };

    console.log(sentData);

    fetchData("update_table", displayInventoryTable, sentData);
    
}*/