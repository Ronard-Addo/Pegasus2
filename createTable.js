import { loadInitialForm } from './Main.js';
import { fetchData } from './Main.js';
import { displayInventoryTable } from './viewTable.js';
import { supabase } from './Main.js';

import * as XLSX from "https://cdn.sheetjs.com/xlsx-0.20.2/package/xlsx.mjs";


// ======================
// CREATE TABLE FUNCTIONS
// ======================
export function loadCreateTableForm() {
    const contentDiv = document.getElementById('dynamic-content');
    contentDiv.innerHTML = `
        <form id="create-table-form">
            <h2>Create New Table from Excel File</h2>
            <div class="form-group">
                <label for="newTableName">Table Name:</label>
                <input type="text" id="newTableName" name="newTableName" required>
            </div>
            <div class="form-group">
                <label for="newExcelFile">Select Excel File:</label>
                <input type="file" id="newExcelFile" name="newExcelFile" accept=".xlsx, .xls" required>
            </div>
            <div id="create-table-message"></div>
            <div class="button-container">
                <button type="button" id="create-table-back" class="btn back-btn">Back</button>
                <button type="button" id="submit-create-table" class="btn">Create Table</button>
            </div>
        </form>
    `;
    
    document.getElementById('create-table-back').addEventListener('click', loadInitialForm);
    document.getElementById('submit-create-table').addEventListener('click', createTable);
}


async function createTable() {
    const tableName = document.getElementById('newTableName').value.trim();
    const fileInput = document.getElementById('newExcelFile');
    const messageDiv = document.getElementById('dynamic-content');
    
    // Clear previous messages
    messageDiv.innerHTML = '';
    
    // Validation
    if (!tableName) {
        messageDiv.innerHTML = '<div class="error">Please enter a table name</div>';
        return;
    }
    
    if (!fileInput.files.length) {
        messageDiv.innerHTML = '<div class="error">Please select an Excel file</div>';
        return;
    }
    
    // Basic table name validation
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
        messageDiv.innerHTML = '<div class="error">Invalid table name. Only letters, numbers and underscores are allowed, starting with a letter</div>';
        return;
    }
    
    try {
        messageDiv.innerHTML = '<div class="loading-spinner">Processing file...</div>';
        
        // 1. Read Excel file
        const file = fileInput.files[0];
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        console.log("jsonData: ", jsonData);

        // 2. Convert to JSONB format
        //const jsonbData = JSON.stringify(jsonData);
        
        // 3. Send to Supabase
        const { data: result, error } = await supabase.rpc('create_table', {
            target_table: tableName,
            excel_data: jsonData  // Now properly formatted as JSONB
        });

        console.log("Raw result from PostgreSQL:", result);
        
        if (error) throw error;
        
        // 4. Show success
        messageDiv.innerHTML = `
            <div class="success-message">
                <p>Table "${tableName}" created successfully!</p>
                <p>Columns: ${result.columns.join(', ')}</p>
                <p>Rows inserted: ${result.row_count}</p>
            </div>
        `;
        
        // 5. Refresh table display
        displayInventoryTable(await getTableData(tableName));
        
    } catch (error) {
        console.error('Upload failed:', error);
        let errorMessage = error.message;
        
        // Special handling for "table already exists" error
        if (error.message.includes('already exists')) {
            errorMessage = `Table "${tableName}" already exists. Please choose a different name.`;
        }
        
        messageDiv.innerHTML = `
            <div class="error">
                <p>Upload failed: ${errorMessage}</p>
                ${error.details ? `<p>Details: ${error.details}</p>` : ''}
            </div>
        `;
    }
}

// Helper function to get table data
async function getTableData(tableName) {
    const { data, error } = await supabase
        .from(tableName)
        .select('*');
    
    if (error) throw error;
    return data;
}

/*async function createTable() {
    const tableName = document.getElementById('newTableName').value.trim();
    const fileInput = document.getElementById('newExcelFile');
    const messageDiv = document.getElementById('dynamic-content');
    //const messageDiv = document.getElementById('create-table-message');
    
    if (!tableName) {
        messageDiv.innerHTML = '<div class="error">Please enter a table name</div>';
        return;
    }
    
    if (!fileInput.files.length) {
        messageDiv.innerHTML = '<div class="error">Please select an Excel file</div>';
        return;
    }
    
    try {
        // 1. Read Excel file
        const file = fileInput.files[0];
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        console.log("jsonData: ", jsonData);

        // 2. Send to Supabase
        const { data: result, error } = await supabase.rpc('create_table', {
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
}*/