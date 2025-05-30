//import { loadInitialForm } from './Main.js';
import { fetchData } from './Main.js';
import { displayProducts } from './viewProducts.js';
import { displayInventoryTable } from './viewTable.js';
// ======================
// UPDATE PRODUCT FUNCTIONS
// ======================
export function loadUpdateProductForm(products) {
    const contentDiv = document.getElementById('dynamic-content');
    
    let formHTML = `
        <form id="update-product-form">
            <h2>Update Product Information</h2>
            <h3>Enter Amount Sold for Each Selected Product:</h3>
            <div class="product-update-section">
    `;
    
    products.forEach(product => {
        formHTML += `
            <div class="product-option">
                <label>                       
                    <b>${product.product_name}</b>   (Current Stock: ${product.stock_available})
                </label>
                <div class="amount-sold-section">
                    <label for "amount-sold">Amount Sold:</label>
                    <input type="number" id="${product.id}" name="amount-sold" min="1" required>
                </div>
            </div>
        `;
    });
    
    formHTML += `
            </div>
            <div class="button-container">
                <button type="button" id="back-button" class="btn back-btn">Back</button>
                <button type="button" id="submit-update" class="btn">Update</button>
            </div>
        </form>
    `;
    
    contentDiv.innerHTML = formHTML;
    
    document.getElementById('submit-update').addEventListener('click', handleProductUpdate);
    document.getElementById('back-button').addEventListener('click', displayProducts);
}

function handleProductUpdate() {
    const inputs = document.querySelectorAll('input[name="amount-sold"]');
    const inputData = [];
    
    inputs.forEach(input => {
        if (input.value && input.value.trim() !== "") {
            inputData.push({ id: input.id, amount_sold: input.value });
        }
    });
    
    if (inputData.length === 0) {
        alert("Please enter an amount sold for at least one product.");
        return;
    }

    let tableName = localStorage.getItem('tableName');

    //const sentData = { /*tableName: tableName,*/ inputData: inputData};
    
    console.log("input data", inputData);
    fetchData("update_products", displayInventoryTable, {target_table: tableName, input_data: inputData});
}