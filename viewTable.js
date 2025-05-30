import { loadInitialForm } from './Main.js';
import { addBackButton } from './Main.js';
// ======================
// VIEW TABLE FUNCTIONS
// ======================
export function displayInventoryTable(inventoryData) {
    localStorage.setItem('tableData', JSON.stringify(inventoryData));

    localStorage.setItem('currentView', 'inventoryTable');

    const contentDiv = document.getElementById('dynamic-content');
    
    if (!inventoryData || inventoryData.length === 0) {
        contentDiv.innerHTML = '<p class="no-data">No inventory data found.</p>';
        addBackButton();
        return;
    }
    
    const columns = Object.keys(inventoryData[0]);
    
    let tableHTML = `
        <h2>Inventory Overview</h2>
        <div class="table-container">          
            <table class="product-table">
                <tr>
                    ${columns.map(col => `<th>${formatColumnName(col)}</th>`).join('')}
                </tr>
                <tbody>
                    ${inventoryData.map(item => `
                        <tr>
                            ${columns.map(col => `<td>${item[col] !== null ? item[col] : 'N/A'}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <div class="button-container">
            <button type="button" id="back-button" class="btn back-btn">Back to Main Menu</button>
        </div>
    `;
    
    contentDiv.innerHTML = tableHTML;
    
    document.getElementById('back-button').addEventListener('click', () => {
        localStorage.removeItem('currentView'); // Clear state
        loadInitialForm();
    });
}

function formatColumnName(column) {
    return column
        .replace(/_/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\b\w/g, l => l.toUpperCase());
}