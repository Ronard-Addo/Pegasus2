import { loadTableInputForm } from './Main.js';
import { displayInventoryTable } from './viewTable.js';
import { loadColumnSelectionForm } from './updateProducts.js';

// ======================
// PRODUCT FUNCTIONS
// ======================
export function displayProducts(products) {
    
    const previousView = localStorage.getItem('previousView');

    const contentDiv = document.getElementById('dynamic-content');
    
    let formHTML = `
        <form id="product-selection-form">
            <h2>Select Products</h2>
            <h3>Select at least one of the following products:</h3>
            <div class="product-list">
    `;
    
    
    // Format the data for display
    if (products && products.length > 0) {
      formHTML += products.map(item => `
        <div class="product-item">
          <label>
            <input type="checkbox" name="product_ids[]" value="${item.id}">
            ${item.product_name} (ID: ${item.id})
          </label>
        </div>
      `).join('');
    } else {
      contentDiv.innerHTML = '<p>No tables found in the database.</p>';
    }

    formHTML += `
            </div>
            <div class="button-container">
                <button type="button" id="submit-selected-products" class="btn">View Details</button>
                <button type="button" id="back-button" class="btn back-btn">Back</button>
            </div>
        </form>
    `;
    
    contentDiv.innerHTML = formHTML;
    
    document.getElementById('submit-selected-products').addEventListener('click', function() {
        handleProductSelection(products);
    });
    document.getElementById('back-button').addEventListener('click', function() {
        loadTableInputForm;
    });
}



function handleProductSelection(products) {
    
    console.log("products: ", products);

    const checkboxes = document.querySelectorAll('input[name="product_ids[]"]:checked');
    const selectedIds = Array.from(checkboxes).map(cb => cb.value);

    console.log("selectedIds: ", selectedIds);
    
    if (selectedIds.length === 0) {
        alert("Please select at least one product");
        return;
    }
    
    const selectedProducts = products.filter(product => selectedIds.includes(product.id.toString()));

    console.log("selectedProducts: ", selectedProducts);

    localStorage.setItem('selectedProducts', JSON.stringify(selectedProducts));
    
    const selectedOption = localStorage.getItem('selectedOption');
    
    if (selectedOption === "viewProductInformation") {
        displayInventoryTable(selectedProducts);
    } else if (selectedOption === "updateProduct") {
        loadColumnSelectionForm(selectedProducts);
    }
}