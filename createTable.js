import { loadInitialForm } from './Main.js';
import { fetchData } from './Main.js';
import { handleFileUpload } from './updateTable.js';
import { postFileUpload } from './Main.js';

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
                <input type="file" id="excelFile" name="excelFile" accept=".xlsx, .xls" required>
            </div>
            <div id="upload-message"></div>
            <div class="button-container">
                <button type="button" id="create-table-back" class="btn back-btn">Back</button>
                <button type="button" id="submit-create-table" class="btn">Create Table</button>
            </div>
        </form>
    `;
    
    document.getElementById('create-table-back').addEventListener('click', loadInitialForm);
    document.getElementById('submit-create-table').addEventListener('click', handleFileUpload);
}