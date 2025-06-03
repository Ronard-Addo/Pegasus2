import { fetchData } from './Main.js';
import { supabase } from './Main.js';
import { displayProducts } from './viewProducts.js';
import { displayInventoryTable } from './viewTable.js';

// ======================
// UPDATE PRODUCT FUNCTIONS
// ======================
async function fetchColumns(procedure, params) {
    const contentDiv = document.getElementById('dynamic-content');

    if (!contentDiv) {
        throw new Error(`Element with ID 'dynamic-content' not found`);
    }

    try {
        const { data, error } = await supabase.rpc(procedure, params);
        if (error) throw error;
        
        console.log('Returned data: ', data);
        return data;
    } catch (error) {
        console.error('Error fetching table names:', error);
        contentDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
        throw error; // Re-throw to allow handling in calling function
    }
}

export async function loadColumnSelectionForm(products) {
    const contentDiv = document.getElementById('dynamic-content');
    
    let formHTML = `
        <form id="update-product-form">
            <h2>Update Product Information</h2>
            <h3>Select Columns to Update for Each Product:</h3>
            <div class="product-update-section">
    `;
    
    const tableName = localStorage.getItem('tableName');
    
    try {
        const columns = await fetchColumns('get_colnames', {target_table: tableName});
        
        if (!Array.isArray(columns)) {
            throw new Error('Columns data is not in expected format');
        }

        products.forEach(product => {
            formHTML += `
                <div class="product-option">
                    <h4>${product.product_name} (Current Stock: ${product.stock_available})</h4>
                    <div class="columns-section">
                        <p>Select columns to update:</p>
                        <div id="${product.id}-column-list" class="column-list">
            `;
            
            columns.forEach(column => {
                formHTML += `
                    <div class="column-checkbox">
                        <label for="${product.id}-${column.column_name}">
                            <input type="checkbox" 
                                id="${product.id}-${column.column_name}" 
                                name="${product.id}-columns" 
                                value="${column.column_name}"
                            >
                            ${column.column_name}
                        </label>
                    </div>
                `;
            });

            formHTML += `
                        </div>
                    </div>
                </div>
            `;
        });

        formHTML += `
                <div class="button-container">
                    <button type="button" id="back-button" class="btn back-btn">Back</button>
                    <button type="button" id="continue-button" class="btn continue-btn">Continue</button>
                </div>
            </form>
        `;
        
        contentDiv.innerHTML = formHTML;
        
        document.getElementById('continue-button').addEventListener('click', () => handleColumnSelections(products));
        document.getElementById('back-button').addEventListener('click', displayProducts);
        
    } catch (error) {
        console.error('Error loading product form:', error);
        contentDiv.innerHTML = `<div class="error">Error loading form: ${error.message}</div>`;
    }
}

function handleColumnSelections(products) {
    const productsWithColumns = products.map(product => {
        const checkboxes = document.querySelectorAll(`input[name="${product.id}-columns"]:checked`);
        const selectedColumns = Array.from(checkboxes).map(cb => cb.value);
        
        if (selectedColumns.length === 0) {
            alert(`Please select at least one column for ${product.product_name}`);
            return null;
        }

        return {
            id: product.id,
            name: product.product_name,
            selectedColumns: selectedColumns
        };
    }).filter(Boolean); // Remove null entries (products with no selections)

    if (productsWithColumns.length > 0) {
        loadProductUpdateForm(productsWithColumns);
    }
}

function loadProductUpdateForm(productsWithColumns) {
    const contentDiv = document.getElementById('dynamic-content');

    let formHTML = `
        <form id="update-product-values-form">
            <h2>Enter New Values</h2>
            <div class="product-update-fields">
    `;

    productsWithColumns.forEach(product => {
        formHTML += `
            <div class="product-section">
                <h3>${product.name}</h3>
                <div class="product-fields">
        `;

        product.selectedColumns.forEach(column => {
            formHTML += `
                <div class="form-group">
                    <label for="${product.id}-${column}-input">${column}:</label>
                    <input type="text" 
                           id="${product.id}-${column}-input" 
                           name="${product.id}-inputs" 
                           class="form-input"
                    required>
                </div>
            `;
        });

        formHTML += `
                </div>
            </div>
        `;
    });

    formHTML += `
                <div class="button-container">
                    <button type="button" id="back-button" class="btn back-btn">Back</button>
                    <button type="button" id="submit-update" class="btn submit-btn">Update Products</button>
                </div>
            </div>
        </form>
    `;
    
    contentDiv.innerHTML = formHTML;
    
    document.getElementById('submit-update').addEventListener('click', () => handleProductUpdate(productsWithColumns));
    document.getElementById('back-button').addEventListener('click', () => loadColumnSelectionForm(productsWithColumns));
}

async function handleProductUpdate(productsWithColumns) {
    const tableName = localStorage.getItem('tableName');
    const productsArray = [];

    // Validate inputs first
    for (const product of productsWithColumns) {
        const inputData = [];
        
        for (const column of product.selectedColumns) {
            const input = document.getElementById(`${product.id}-${column}-input`);
            
            if (!input.value || input.value.trim() === "") {
                alert(`Please enter a value for ${column} in ${product.name}`);
                input.focus();
                return;
            }           

            inputData.push({ 
                column: column, 
                value: input.value.trim() 
            });

            
        }

        productsArray.push({
            id: product.id,
            input_data: inputData
        });

        console.log(productsArray);
    }

    fetchData("update_products", displayInventoryTable, {
            target_table: tableName,
            products: productsArray
    });
}