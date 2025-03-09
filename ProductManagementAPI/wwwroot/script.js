// API Base URL - Update this to match your API endpoint
const API_URL = '/api/products';

// DOM Elements
const productForm = document.getElementById('productForm');
const productIdInput = document.getElementById('productId');
const productNameInput = document.getElementById('productName');
const quantityInput = document.getElementById('quantity');
const notesInput = document.getElementById('notes');
const saveBtn = document.getElementById('saveBtn');
const updateBtn = document.getElementById('updateBtn');
const cancelBtn = document.getElementById('cancelBtn');
const productsTableBody = document.getElementById('productsTableBody');
const searchInput = document.getElementById('searchInput');
const notification = document.getElementById('notification');
const notificationIcon = document.getElementById('notificationIcon');
const notificationMessage = document.getElementById('notificationMessage');
const confirmDialog = document.getElementById('confirmDialog');
const confirmDeleteBtn = document.getElementById('confirmDelete');
const cancelDeleteBtn = document.getElementById('cancelDelete');
const closeConfirmDialog = document.getElementById('closeConfirmDialog');
const loader = document.getElementById('loader');
const noProducts = document.getElementById('noProducts');
const themeToggle = document.getElementById('themeToggle');
const menuToggle = document.getElementById('menuToggle');
const productModal = document.getElementById('productModal');
const closeModal = document.getElementById('closeModal');
const modalTitle = document.getElementById('modalTitle');
const newProductBtn = document.getElementById('newProductBtn');
const emptyStateAddBtn = document.getElementById('emptyStateAddBtn');
const viewControls = document.querySelectorAll('.view-btn');
const tableView = document.getElementById('tableView');
const gridView = document.getElementById('gridView');
const totalProductsCounter = document.getElementById('totalProducts');
const lowStockCounter = document.getElementById('lowStock');
const newProductsCounter = document.getElementById('newProducts');

// State
let products = [];
let currentProductId = null;
let deleteProductId = null;
let isDarkTheme = localStorage.getItem('darkTheme') === 'true';
let isSidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
let currentView = localStorage.getItem('currentView') || 'table';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Apply theme
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
        themeToggle.querySelector('i').className = 'fas fa-sun';
    }
    
    // Apply sidebar state
    if (isSidebarCollapsed) {
        document.body.classList.add('sidebar-collapsed');
    }
    
    // Apply view preference
    setView(currentView);
    
    // Load products
    fetchProducts();
    
    // Event listeners
    productForm.addEventListener('submit', handleFormSubmit);
    updateBtn.addEventListener('click', handleUpdate);
    cancelBtn.addEventListener('click', closeProductModal);
    searchInput.addEventListener('input', handleSearch);
    confirmDeleteBtn.addEventListener('click', confirmDelete);
    cancelDeleteBtn.addEventListener('click', cancelDelete);
    closeConfirmDialog.addEventListener('click', cancelDelete);
    themeToggle.addEventListener('click', toggleTheme);
    menuToggle.addEventListener('click', toggleSidebar);
    newProductBtn.addEventListener('click', openNewProductModal);
    emptyStateAddBtn.addEventListener('click', openNewProductModal);
    closeModal.addEventListener('click', closeProductModal);
    
    // View control buttons
    viewControls.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.getAttribute('data-view');
            setView(view);
        });
    });
    
    // Close notification when clicking X
    document.querySelector('.close-notification').addEventListener('click', () => {
        notification.classList.remove('show');
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === productModal) {
            closeProductModal();
        }
        if (e.target === confirmDialog) {
            cancelDelete();
        }
    });
});

async function fetchProducts() {
    showLoader();
    
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        
        products = await response.json();
        renderProducts();
        updateDashboardStats();
        
    } catch (error) {
        showNotification('Failed to load products: ' + error.message, 'error', 'fa-exclamation-circle');
        console.error('Error fetching products:', error);
    } finally {
        hideLoader();
    }
}

// Update dashboard statistics
function updateDashboardStats() {
    // Total products
    totalProductsCounter.textContent = products.length;
    
    // Low stock (less than 10)
    const lowStockCount = products.filter(product => product.quantity < 10).length;
    lowStockCounter.textContent = lowStockCount;
    
    // New products (for demo, show 3)
    newProductsCounter.textContent = Math.min(3, products.length);
}

// Render products in current view
function renderProducts(filteredProducts = null) {
    const displayProducts = filteredProducts || products;
    
    if (displayProducts.length === 0) {
        noProducts.classList.remove('hidden');
        if (currentView === 'table') {
            tableView.querySelector('table').classList.add('hidden');
        } else {
            gridView.innerHTML = '';
        }
        return;
    }
    
    noProducts.classList.add('hidden');
    
    if (currentView === 'table') {
        renderTableView(displayProducts);
    } else {
        renderGridView(displayProducts);
    }
}

// Render table view
function renderTableView(products) {
    productsTableBody.innerHTML = '';
    tableView.querySelector('table').classList.remove('hidden');
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', product.productId);
        
        // Determine product status
        let status = 'In Stock';
        let statusClass = 'status-in-stock';
        
        if (product.quantity <= 0) {
            status = 'Out of Stock';
            statusClass = 'status-out-of-stock';
        } else if (product.quantity < 10) {
            status = 'Low Stock';
            statusClass = 'status-low-stock';
        }
        
        row.innerHTML = `
            <td>${product.productId}</td>
            <td>${product.productName}</td>
            <td>${product.quantity}</td>
            <td><span class="status-badge ${statusClass}">${status}</span></td>
            <td>${product.notes || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit-btn" onclick="editProduct('${product.productId}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteProduct('${product.productId}')">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </td>
        `;
        
        productsTableBody.appendChild(row);
    });
}

// Render grid view
function renderGridView(products) {
    gridView.innerHTML = '';
    
    products.forEach(product => {
        // Determine product status
        let status = 'In Stock';
        let statusClass = 'status-in-stock';
        
        if (product.quantity <= 0) {
            status = 'Out of Stock';
            statusClass = 'status-out-of-stock';
        } else if (product.quantity < 10) {
            status = 'Low Stock';
            statusClass = 'status-low-stock';
        }
        
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-id', product.productId);
        
        card.innerHTML = `
            <div class="product-header">
                <div class="product-title">${product.productName}</div>
                <span class="status-badge ${statusClass}">${status}</span>
            </div>
            <div class="product-body">
                <div class="product-info">
                    <div class="product-label">ID:</div>
                    <div class="product-value">${product.productId}</div>
                </div>
                <div class="product-info">
                    <div class="product-label">Quantity:</div>
                    <div class="product-value">${product.quantity}</div>
                </div>
                <div class="product-notes">${product.notes || 'No notes available'}</div>
            </div>
            <div class="product-footer">
                <div class="action-buttons">
                    <button class="action-btn edit-btn" onclick="editProduct('${product.productId}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteProduct('${product.productId}')">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `;
        
        gridView.appendChild(card);
    });
}

// Open modal to add new product
function openNewProductModal() {
    resetForm();
    modalTitle.textContent = 'Add New Product';
    saveBtn.style.display = 'block';
    updateBtn.style.display = 'none';
    productModal.classList.add('show');
}

// Close product modal
function closeProductModal() {
    productModal.classList.remove('show');
}

// Handle form submission for new product
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const productData = {
        productId: productIdInput.value,
        productName: productNameInput.value,
        quantity: parseInt(quantityInput.value),
        notes: notesInput.value
    };
    
    showLoader();
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to add product');
        }
        
        await fetchProducts();
        closeProductModal();
        showNotification('Product added successfully!', 'success', 'fa-check-circle');
        
    } catch (error) {
        showNotification('Error adding product: ' + error.message, 'error', 'fa-exclamation-circle');
        console.error('Error adding product:', error);
    } finally {
        hideLoader();
    }
}

// Edit product
function editProduct(id) {
    const product = products.find(p => p.productId === id);
    if (!product) return;
    
    currentProductId = id;
    
    productIdInput.value = product.productId;
    productIdInput.disabled = true;
    productNameInput.value = product.productName;
    quantityInput.value = product.quantity;
    notesInput.value = product.notes || '';
    
    modalTitle.textContent = 'Edit Product';
    saveBtn.style.display = 'none';
    updateBtn.style.display = 'block';
    updateBtn.disabled = false;
    
    productModal.classList.add('show');
}

// Handle product update
async function handleUpdate() {
    if (!currentProductId) return;
    
    const productData = {
        productId: productIdInput.value,
        productName: productNameInput.value,
        quantity: parseInt(quantityInput.value),
        notes: notesInput.value
    };
    
    showLoader();
    
    try {
        const response = await fetch(`${API_URL}/${currentProductId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to update product');
        }
        
        await fetchProducts();
        closeProductModal();
        highlightRow(currentProductId, 'updated-row');
        showNotification('Product updated successfully!', 'success', 'fa-check-circle');
        
    } catch (error) {
        showNotification('Error updating product: ' + error.message, 'error', 'fa-exclamation-circle');
        console.error('Error updating product:', error);
    } finally {
        hideLoader();
        currentProductId = null;
        productIdInput.disabled = false;
    }
}

// Delete product
function deleteProduct(id) {
    deleteProductId = id;
    confirmDialog.classList.add('show');
}

// Confirm deletion
async function confirmDelete() {
    if (!deleteProductId) return;
    
    showLoader();
    
    try {
        const response = await fetch(`${API_URL}/${deleteProductId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete product');
        }
        
        // Remove from UI first for better UX
        if (currentView === 'table') {
            const row = productsTableBody.querySelector(`tr[data-id="${deleteProductId}"]`);
            if (row) {
                row.classList.add('delete-row');
                // Remove after animation
                setTimeout(() => row.remove(), 500);
            }
        } else {
            const card = gridView.querySelector(`.product-card[data-id="${deleteProductId}"]`);
            if (card) {
                card.classList.add('fade-out');
                // Remove after animation
                setTimeout(() => card.remove(), 500);
            }
        }
        
        // Then fetch updated data
        await fetchProducts();
        showNotification('Product deleted successfully!', 'success', 'fa-check-circle');
        
    } catch (error) {
        showNotification('Error deleting product: ' + error.message, 'error', 'fa-exclamation-circle');
        console.error('Error deleting product:', error);
    } finally {
        hideLoader();
        cancelDelete();
    }
}

// Cancel deletion
function cancelDelete() {
    confirmDialog.classList.remove('show');
    deleteProductId = null;
}

// Reset form
function resetForm() {
    productForm.reset();
    productIdInput.disabled = false;
    currentProductId = null;
}

// Handle search
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!searchTerm) {
        renderProducts();
        return;
    }
    
    const filteredProducts = products.filter(product => 
        product.productId.toLowerCase().includes(searchTerm) || 
        product.productName.toLowerCase().includes(searchTerm) ||
        (product.notes && product.notes.toLowerCase().includes(searchTerm))
    );
    
    renderProducts(filteredProducts);
}

// Show notification
function showNotification(message, type, icon) {
    notification.className = 'notification';
    notification.classList.add(type);
    notificationIcon.className = `fas ${icon}`;
    notificationMessage.textContent = message;
    
    // Reset animation by removing and adding the class
    notification.classList.remove('show');
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Highlight row or card
function highlightRow(id, className) {
    if (currentView === 'table') {
        const row = productsTableBody.querySelector(`tr[data-id="${id}"]`);
        if (row) {
            row.classList.add(className);
            setTimeout(() => row.classList.remove(className), 2000);
        }
    } else {
        const card = gridView.querySelector(`.product-card[data-id="${id}"]`);
        if (card) {
            card.classList.add('fade-in');
            setTimeout(() => card.classList.remove('fade-in'), 2000);
        }
    }
}

// Toggle theme
function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    document.body.classList.toggle('dark-theme');
    
    if (isDarkTheme) {
        themeToggle.querySelector('i').className = 'fas fa-sun';
        themeToggle.querySelector('span').textContent = 'Light Mode';
    } else {
        themeToggle.querySelector('i').className = 'fas fa-moon';
        themeToggle.querySelector('span').textContent = 'Dark Mode';
    }
    
    localStorage.setItem('darkTheme', isDarkTheme);
}

// Toggle sidebar
function toggleSidebar() {
    isSidebarCollapsed = !isSidebarCollapsed;
    document.body.classList.toggle('sidebar-collapsed');
    localStorage.setItem('sidebarCollapsed', isSidebarCollapsed);
}

// Set view (table or grid)
function setView(view) {
    currentView = view;
    
    // Update active button
    viewControls.forEach(btn => {
        if (btn.getAttribute('data-view') === view) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Show selected view
    if (view === 'table') {
        tableView.style.display = 'block';
        gridView.style.display = 'none';
    } else {
        tableView.style.display = 'none';
        gridView.style.display = 'grid';
    }
    
    // Save preference
    localStorage.setItem('currentView', view);
    
    // Render with current data
    renderProducts();
}

// Show loader
function showLoader() {
    loader.classList.remove('hidden');
}

// Hide loader
function hideLoader() {
    loader.classList.add('hidden');
}

// Make functions available globally
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;