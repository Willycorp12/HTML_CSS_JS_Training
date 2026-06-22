/**
 * js/inventory-data.js
 * Logic for Inventory Master Data screen.
 */

window.inventoryState = {
    selectedMainCatId: null,
    selectedSubCatId: null,
    selectedItemId: null,
    mainCategories: [],
    subCategories: [],
    items: [],
    query: ''
};

/**
 * Inventory Item Modal Manager
 * Handles creation and modification of individual inventory items.
 */
window.InventoryItemModalManager = {
    config: { action: 'create', editingItemId: null },

    async openModal(action = 'create', itemId = null) {
        await ensureInventoryItemModalLoaded();
        if (window.inventoryState.mainCategories.length === 0) {
            await fetchInventoryMetadata();
        }

        this.config.action = action;
        this.config.editingItemId = itemId;

        const title = (action === 'create' ? 'New ' : 'Modify ') + 'Inventory Item';
        document.getElementById('MIG_ItemTitle').textContent = title;

        if (action === 'modify' && itemId) {
            const item = window.inventoryState.items.find(x => String(x.id) === String(itemId));
            if (item) {
                this.populateCategoryDropdowns(); // Ensure dropdowns are ready
                document.getElementById('MIG_ItemName').value = item.name;
                document.getElementById('MIG_ItemBarcode').value = item.barcode || '';
                document.getElementById('MIG_ItemQty').value = item.qty || 0;
                document.getElementById('MIG_ItemSellPrice').value = item.sell || 0;
                document.getElementById('MIG_ItemBuyPrice').value = item.buy || 0;
                document.getElementById('MIG_ItemMinStock').value = item.minStock || 0;
                document.getElementById('MIG_ItemMinQty1').value = item.minq;
                document.getElementById('MIG_ItemMinPrice1').value = item.minp1;
                document.getElementById('MIG_ItemMinQty2').value = item.minq2;
                document.getElementById('MIG_ItemMinPrice2').value = item.minp2;
                document.getElementById('MIG_ItemMainCat').value = item.mainId;
                document.getElementById('MIG_ItemMainCat').dispatchEvent(new Event('change'));
                document.getElementById('MIG_ItemSubCat').value = item.subCatId;
            } else {
                showAlert("Item not found for modification.", "error");
            }
        } else { // Action is 'create'
            this.populateCategoryDropdowns();
            document.getElementById('MIG_ItemForm').reset(); // Reset the form fields
        }

        const saveBtn = document.getElementById('MIG_ItemSaveBtn');
        saveBtn.innerHTML = action === 'create' ? 'Validate <i class="fa-solid fa-circle-check"></i>' : 'Update Record <i class="fa-solid fa-save"></i>';
        
        const modalOverlay = document.getElementById('MODAL_InventoryItem');
        if (!modalOverlay.dataset.shortcutsInitialized) {
            modalOverlay.dataset.shortcutsInitialized = "true";
            modalOverlay.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
                        e.preventDefault();
                        this.handleSave();
                    }
                } else if (e.key === 'Escape') {
                    this.closeModal();
                }
            });
        }

        modalOverlay.style.display = 'flex';
        setTimeout(() => document.getElementById('MIG_ItemName').focus(), 50);
    },

    closeModal() {
        document.getElementById('MODAL_InventoryItem').style.display = 'none';
        this.config.editingItemId = null;
    },

    populateCategoryDropdowns() {
        const mainCatSelect = document.getElementById('MIG_ItemMainCat');
        const subCatSelect = document.getElementById('MIG_ItemSubCat');

        mainCatSelect.innerHTML = '<option value="">-- Select Main Category --</option>' + 
            window.inventoryState.mainCategories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

        mainCatSelect.onchange = () => {
            const mid = mainCatSelect.value;
            const filtered = window.inventoryState.subCategories.filter(s => !mid || String(s.mainId) === String(mid));
            subCatSelect.innerHTML = '<option value="">-- Select Sub Category --</option>' + 
                filtered.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        };
        mainCatSelect.dispatchEvent(new Event('change'));
    },

    handleSave() {
        const newItem = {
            id: this.config.action === 'create' ? Date.now() : this.config.editingItemId,
            name: document.getElementById('MIG_ItemName').value.trim(),
            barcode: document.getElementById('MIG_ItemBarcode').value.trim(),
            qty: parseInt(document.getElementById('MIG_ItemQty').value) || 0,
            sell: parseFloat(document.getElementById('MIG_ItemSellPrice').value) || 0,
            buy: parseFloat(document.getElementById('MIG_ItemBuyPrice').value) || 0,
            minStock: parseInt(document.getElementById('MIG_ItemMinStock').value) || 0,
            minq: parseInt(document.getElementById('MIG_ItemMinQty1').value) || 0,
            minp1: parseFloat(document.getElementById('MIG_ItemMinPrice1').value) || 0,
            minq2: parseInt(document.getElementById('MIG_ItemMinQty2').value) || 0,
            minp2: parseFloat(document.getElementById('MIG_ItemMinPrice2').value) || 0,
            op: 0, // Opening balance, not in modal yet
            mainId: document.getElementById('MIG_ItemMainCat').value,
            subCatId: document.getElementById('MIG_ItemSubCat').value,
            subCat: document.getElementById('MIG_ItemSubCat').options[document.getElementById('MIG_ItemSubCat').selectedIndex].text // For display
        };

        if (!newItem.name || !newItem.mainId || !newItem.subCatId) {
            return showAlert("Item Name, Main Category, and Sub Category are required.", "error");
        }

        if (this.config.action === 'create') {
            window.inventoryState.items.push(newItem);
        } else {
            const index = window.inventoryState.items.findIndex(item => String(item.id) === String(this.config.editingItemId));
            if (index !== -1) window.inventoryState.items[index] = newItem;
        }
        showAlert("Inventory item saved successfully", "success");
        this.closeModal();
        
        // Refresh based on active screen
        if (document.getElementById('inventory-items-tbody')) renderInventoryItems();
        if (document.getElementById('STK_MASTER_TBODY')) renderStockMasterItems();
    },

    handleDelete() {
        const selectedId = window.inventoryState.selectedItemId;
        if (!selectedId || selectedId === "null") return showAlert("Please select an item to delete.", "error");

        showConfirmModal({
            title: "Confirm Deletion",
            message: "Are you sure you want to delete this inventory item?",
            onOk: () => {
                window.inventoryState.items = window.inventoryState.items.filter(item => String(item.id) !== String(selectedId));
                window.inventoryState.selectedItemId = null;
                showAlert("Item deleted successfully", "success");
                if (document.getElementById('inventory-items-tbody')) renderInventoryItems();
                if (document.getElementById('STK_MASTER_TBODY')) renderStockMasterItems();
            }
        });
    }
};

/**
 * Inventory Modal Manager
 * Handles category management consistent with Asset Master.
 */
window.InventoryModalManager = {
    config: { mode: 'main-category', action: 'create', editingId: null },

    async handleNewCategory(modeOverride) {
        const activeTab = document.querySelector('.inv-left-panel .panel-tab.active');
        const mode = modeOverride || (activeTab ? (activeTab.dataset.tabName || 'main-category') : 'main-category');
        await this.openModal(mode, 'create');
    },

    async openModal(mode, action = 'create', initialValue = "") {
        await ensureCategoryModalLoaded();
        this.config.mode = mode;
        this.config.action = action;

        const title = (action === 'create' ? 'New ' : 'Modify ') + (mode === 'main-category' ? 'Main Category' : 'Sub Category');
        document.getElementById('MIG_Title').textContent = title;
        const nameInput = document.getElementById('MIG_InputName');
        nameInput.value = initialValue;

        // Auto-focus and setup keyboard shortcuts
        const modalOverlay = document.getElementById('MODAL_InvGeneric');
        if (!modalOverlay.dataset.shortcutsInitialized) {
            modalOverlay.dataset.shortcutsInitialized = "true";
            modalOverlay.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleSave();
                } else if (e.key === 'Escape') {
                    this.closeModal();
                }
            });
        }
        
        modalOverlay.style.display = 'flex';
        setTimeout(() => nameInput.focus(), 50);

        // Handle Parent Selection for Sub-Categories
        const parentGroup = document.getElementById('MIG_ParentGroup');
        const parentSelect = document.getElementById('MIG_ParentSelect');
        if (mode === 'sub-category') {
            parentGroup.style.display = 'block';
            parentSelect.innerHTML = window.inventoryState.mainCategories.map(c => 
                `<option value="${c.id}">${c.name}</option>`).join('');
            if (window.inventoryState.selectedMainCatId) parentSelect.value = window.inventoryState.selectedMainCatId;
        } else {
            parentGroup.style.display = 'none';
        }

        const saveBtn = document.getElementById('MIG_SaveBtn');
        saveBtn.innerHTML = action === 'create' ? '<i class="fa-solid fa-plus"></i> Create' : '<i class="fa-solid fa-save"></i> Update';
    },

    // Ensure category modal buttons are styled
    // The buttons in MODAL_InvGeneric already have wd-btn primary/danger classes.
    // The global CSS for wd-btn and wd-action-btn should handle their styling.

    async openModifyModal() {
        const mode = document.querySelector('.inv-left-panel .panel-tab.active').dataset.tabName;
        const selectedId = (mode === 'main-category') ? window.inventoryState.selectedMainCatId : window.inventoryState.selectedSubCatId;

        if (!selectedId) {
            showAlert(`Please select a ${mode.replace('-', ' ')} to modify.`, "error");
            return;
        }

        const list = (mode === 'main-category') ? window.inventoryState.mainCategories : window.inventoryState.subCategories;
        const item = list.find(x => String(x.id) === String(selectedId));
        
        this.config.editingId = selectedId;
        await this.openModal(mode, 'modify', item ? item.name : "");
    },

    closeModal() {
        document.getElementById('MODAL_InvGeneric').style.display = 'none';
        this.config.editingId = null;
    },

    handleSave() {
        const name = document.getElementById('MIG_InputName').value.trim();
        if (!name) return showAlert("Name is required", "error");

        // Mock Logic: In real app, call API
        const mode = this.config.mode;
        if (this.config.action === 'create') {
            const newObj = { id: Date.now(), name };
            if (mode === 'main-category') window.inventoryState.mainCategories.push(newObj);
            else window.inventoryState.subCategories.push({ ...newObj, mainId: document.getElementById('MIG_ParentSelect').value });
        } else {
            const list = (mode === 'main-category') ? window.inventoryState.mainCategories : window.inventoryState.subCategories;
            const item = list.find(x => String(x.id) === String(this.config.editingId));
            if (item) item.name = name;
        }

        showAlert("Category saved successfully", "success");
        this.closeModal();
        renderCategories();
    },

    handleDelete() {
        const mode = document.querySelector('.inv-left-panel .panel-tab.active').dataset.tabName;
        const selectedId = (mode === 'main-category') ? window.inventoryState.selectedMainCatId : window.inventoryState.selectedSubCatId;

        if (!selectedId) return showAlert("Please select an item to delete.", "error");

        showConfirmModal({
            title: "Confirm Deletion",
            message: "Are you sure you want to delete this category?",
            onOk: () => {
                if (mode === 'main-category') {
                    window.inventoryState.mainCategories = window.inventoryState.mainCategories.filter(c => String(c.id) !== String(selectedId));
                    window.inventoryState.selectedMainCatId = null;
                } else {
                    window.inventoryState.subCategories = window.inventoryState.subCategories.filter(c => String(c.id) !== String(selectedId));
                    window.inventoryState.selectedSubCatId = null;
                }
                showAlert("Deleted successfully", "success");
                renderCategories();
                renderInventoryItems();
            }
        });
    },

    handleRefresh() {
        window.inventoryState.selectedMainCatId = null;
        window.inventoryState.selectedSubCatId = null;
        document.querySelectorAll('.inv-left-panel tr.selected-grey').forEach(r => r.classList.remove('selected-grey'));
        renderInventoryItems();
        // Also clear item selection
        window.inventoryState.selectedItemId = null;
        document.querySelectorAll('#inventory-items-tbody tr.selected').forEach(r => r.classList.remove('selected'));

    }
};

/**
 * Initializes the Inventory List screen.
 */
window.initInventoryList = async function(forceRefresh = false) {
    console.log("initInventoryList: Initializing...");

    // 1. Initial Data Load (Mock for now)
    if (window.inventoryState.items.length === 0 || forceRefresh) {
        await fetchInventoryMetadata(); 
        await fetchInventoryItems();
    } else {
        renderCategories();
        renderInventoryItems();
    }

    // Attach event listeners for item management buttons
    document.getElementById('btn-new-item')?.addEventListener('click', () => InventoryItemModalManager.openModal('create'));

    const btnEditItem = document.getElementById('btn-edit-item');
    btnEditItem?.addEventListener('click', async () => {
        const selId = window.inventoryState.selectedItemId;
        if (!selId || selId === "null") {
            showAlert("Please select an inventory item to modify.", "error");
            return;
        }
        await ensureInventoryItemModalLoaded(); // Ensure modal HTML is in DOM
        InventoryItemModalManager.openModal('modify', selId);
    });
    
    document.getElementById('btn-delete-item')?.addEventListener('click', () => InventoryItemModalManager.handleDelete());

    // Attach event listeners for category management buttons
    const btnNewCategory = document.querySelector('.inv-left-panel .panel-toolbar .wd-btn.primary');
    if (btnNewCategory) btnNewCategory.addEventListener('click', () => InventoryModalManager.handleNewCategory());

    const btnModifyCategory = document.querySelector('.inv-left-panel .panel-toolbar .wd-btn.primary:nth-of-type(2)');
    if (btnModifyCategory) btnModifyCategory.addEventListener('click', () => InventoryModalManager.openModifyModal());

    const btnDeleteCategory = document.querySelector('.inv-left-panel .panel-toolbar .wd-btn.danger');
    if (btnDeleteCategory) btnDeleteCategory.addEventListener('click', () => InventoryModalManager.handleDelete());

    // 2. Setup Interactions
    setupInvRowSelection();

    document.getElementById('INV_GlobalSearch')?.addEventListener('input', (e) => {
        window.inventoryState.query = e.target.value.toLowerCase();
        renderInventoryItems();
    });

    // Make Modal Draggable
    if (typeof makeElementDraggable === 'function') {
        makeElementDraggable(document.querySelector('#MODAL_InvGeneric .coa-modal'), document.getElementById('MIG_Header'));
        // Make Item Modal Draggable
        if (document.getElementById('MODAL_InventoryItem')) { // Updated ID
            makeElementDraggable(document.querySelector('#MODAL_InventoryItem .coa-modal'), document.getElementById('MIG_ItemHeader'));
        }
    }
};

/**
 * Initializes the Stock Master Data screen.
 */
window.initStockMaster = async function() {
    console.log("initStockMaster: Initializing...");
    
    // 1. Ensure Data is loaded
    if (window.inventoryState.items.length === 0) {
        await fetchInventoryMetadata();
        await fetchInventoryItems();
    }

    renderStockMasterItems();

    // 2. Setup Interactions
    const searchInput = document.getElementById('STK_MASTER_SEARCH');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            window.inventoryState.query = e.target.value.toLowerCase();
            renderStockMasterItems();
        });
    }

    // Row selection logic for Master table
    const tbody = document.getElementById('STK_MASTER_TBODY');
    if (tbody) {
        tbody.addEventListener('click', (e) => {
            const tr = e.target.closest('tr');
            if (!tr || tr.cells[0].textContent.trim() === "") return;
            tbody.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
            tr.classList.add('selected');
            window.inventoryState.selectedItemId = String(tr.dataset.id);
        });
    }

    // Actions
    document.getElementById('BTN_STK_Modify')?.addEventListener('click', () => {
        const selId = window.inventoryState.selectedItemId;
        if (!selId || selId === "null") return showAlert("Please select an item to modify.", "error"); // Ensure modal HTML is in DOM
        InventoryItemModalManager.openModal('modify', selId);
    });

    document.getElementById('BTN_STK_Delete')?.addEventListener('click', () => InventoryItemModalManager.handleDelete());
};

/**
 * Tab switching logic for Stock Master.
 */
window.switchStockMasterTab = function(tabName, element) {
    // UI Update
    element.parentElement.querySelectorAll('.main-tab').forEach(t => t.classList.remove('active'));
    element.classList.add('active');

    // Panels Toggle
    document.querySelectorAll('.stk-tab-panel').forEach(p => p.style.display = 'none');
    const target = document.getElementById(tabName + '-content');
    if (target) target.style.display = (tabName === 'item-list') ? 'flex' : 'block';

    // Reset selection when switching tabs
    window.inventoryState.selectedItemId = null;
    if (tabName === 'item-list') {
        window.inventoryState.query = "";
        if (document.getElementById('STK_MASTER_SEARCH')) document.getElementById('STK_MASTER_SEARCH').value = "";
        renderStockMasterItems();
    }
};

/**
 * Switches between Main and Sub category tabs in the left panel.
 */
window.switchInventoryTab = function(panel, tabName, element) {
    if (panel === 'left') {
        // Update Tabs UI
        const tabs = element.parentElement.querySelectorAll('.panel-tab');
        tabs.forEach(t => t.classList.remove('active'));
        element.classList.add('active');

        // Toggle Content
        document.getElementById('main-category-content').style.display = (tabName === 'main-category') ? 'block' : 'none';
        document.getElementById('sub-category-content').style.display = (tabName === 'sub-category') ? 'block' : 'none';
        
        // Reset Selections when switching tabs
        window.inventoryState.selectedMainCatId = null;
        window.inventoryState.selectedSubCatId = null;
        renderInventoryItems();
    }
};

/**
 * Setup row selection for all inventory tables.
 */
function setupInvRowSelection() {
    const tables = document.querySelectorAll('.inv-master-wrapper table tbody');
    tables.forEach(tbody => {
        tbody.addEventListener('click', (e) => {
            const tr = e.target.closest('tr');
            if (!tr || tr.cells[0].textContent.trim() === "") return;

            tbody.querySelectorAll('tr').forEach(r => r.classList.remove('selected', 'selected-grey'));
            
            if (tbody.id === 'inventory-items-tbody') {
                tr.classList.add('selected');
                window.inventoryState.selectedItemId = String(tr.dataset.id);
            } else {
                tr.classList.add('selected-grey');
                if (tbody.id === 'TBODY_InvMainCategories') {
                    window.inventoryState.selectedMainCatId = String(tr.dataset.id);
                    window.inventoryState.selectedSubCatId = null; // Clear sub when picking main
                } else {
                    window.inventoryState.selectedSubCatId = String(tr.dataset.id);
                }
                renderInventoryItems(); // Trigger filtering
            }
        });
    });
}

/**
 * Renders the Stock Master Data table based on filters.
 */
function renderStockMasterItems() {
    const tbody = document.getElementById('STK_MASTER_TBODY');
    if (!tbody) return;

    const q = window.inventoryState.query;
    const filtered = window.inventoryState.items.filter(it => 
        it.name.toLowerCase().includes(q) || it.barcode.toLowerCase().includes(q)
    );

    tbody.innerHTML = filtered.map((it, idx) => `
        <tr data-id="${it.id}">
            <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
            <td>${it.name}</td>
            <td><i class="fa-solid fa-barcode" style="color:#777; margin-right:5px;"></i> ${it.barcode || 'N/A'}</td>
            <td>${it.mainCat || 'STATIONERIES'}</td>
            <td>${it.subCat || 'N/A'}</td>
            <td style="text-align: right;">${it.qty.toLocaleString()}</td>
            <td style="text-align: center;">Pcs</td>
        </tr>
    `).join('');

    for(let i=filtered.length; i<18; i++) tbody.insertAdjacentHTML('beforeend', '<tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>');
}

/**
 * Dynamically injects the Inventory Item Modal HTML into the DOM if it's not already present.
 * This allows the modal to be defined in stock-new.html but used across different screens.
 */
async function ensureInventoryItemModalLoaded() {
    if (document.getElementById('MODAL_InventoryItem')) {
        return; // Already loaded
    }

    try {
        const response = await fetch(resolveScreenPath('stock-new.html')); // stock-new.html now contains the modal HTML
        if (response.ok) {
            const html = await response.text();
            document.body.insertAdjacentHTML('beforeend', html);
            // Re-attach draggable after injection
            const modalOverlay = document.getElementById('MODAL_InventoryItem');
            if (modalOverlay && typeof makeElementDraggable === 'function' && !modalOverlay.dataset.draggableInitialized) {
                makeElementDraggable(modalOverlay.querySelector('.coa-modal'), document.getElementById('MIG_ItemHeader'));
                modalOverlay.dataset.draggableInitialized = "true";
            }
        } else {
            console.error("Failed to load stock-new.html for modal injection.");
        }
    } catch (error) {
        console.error("Error injecting Inventory Item Modal:", error);
    }
}

async function ensureCategoryModalLoaded() {
    if (document.getElementById('MODAL_InvGeneric')) {
        return; // Already loaded
    }

    try {
        const response = await fetch('screens/setup/inventory-category-modal.html');
        if (response.ok) {
            const html = await response.text();
            document.body.insertAdjacentHTML('beforeend', html);
            // Re-attach draggable after injection
            const modalOverlay = document.getElementById('MODAL_InvGeneric');
            if (modalOverlay && typeof makeElementDraggable === 'function' && !modalOverlay.dataset.draggableInitialized) {
                makeElementDraggable(modalOverlay.querySelector('.coa-modal'), document.getElementById('MIG_Header'));
                modalOverlay.dataset.draggableInitialized = "true";
            }
        } else {
            console.error("Failed to load inventory-category-modal.html for modal injection.");
        }
    } catch (error) {
        console.error("Error injecting Category Modal:", error);
    }
}

/**
 * Initializes the Register New Stock Item screen.
 */
window.initStockNew = async function() {
    console.log("initStockNew: Initializing...");
    await ensureInventoryItemModalLoaded(); // Ensure the modal HTML is in the DOM
    await fetchInventoryMetadata(); // Ensure categories are loaded for dropdowns
    InventoryItemModalManager.openModal('create'); // Open the modal in creation mode
};

async function fetchInventoryMetadata() {
    // Placeholder for API call
    await new Promise(r => setTimeout(r, 10)); // Simulate delay
    window.inventoryState.mainCategories = [
        { id: "1", name: "STATIONERIES" },
        { id: "2", name: "MEDICAL SUPPLIES" },
        { id: "3", name: "ELECTRONICS" },
        { id: "4", name: "FURNITURE" }
    ];
    window.inventoryState.subCategories = [
        { id: "1", name: "ALL STATIONERIES.", mainId: "1" },
        { id: "2", name: "SURGICAL TOOLS", mainId: "2" },
        { id: "3", name: "DIAGNOSTIC EQUIPMENT", mainId: "2" },
        { id: "4", name: "COMPUTERS", mainId: "3" },
        { id: "5", name: "PRINTERS", mainId: "3" },
        { id: "6", name: "OFFICE CHAIRS", mainId: "4" },
        { id: "7", name: "DESKS", mainId: "4" }
    ];
    renderCategories();
}

async function fetchInventoryItems() {
    // Placeholder for API call
    await new Promise(r => setTimeout(r, 10)); // Simulate delay
    window.inventoryState.items = [
        { id: 101, name: "05A HP Toner Cartridge", barcode: "BC-001", mainId: "1", subCatId: "1", subCat: "ALL STATIONERIES.", qty: 15, sell: 15000, buy: 12000, minStock: 5, minq: 10, minp1: 14500, minq2: 20, minp2: 14000, op: 10 },
        { id: 102, name: "17A HP Toner Cartridge", barcode: "BC-002", mainId: "1", subCatId: "1", subCat: "ALL STATIONERIES.", qty: 20, sell: 18000, buy: 14500, minStock: 8, minq: 15, minp1: 17500, minq2: 25, minp2: 17000, op: 15 },
        { id: 103, name: "19A HP Toner Cartridge", barcode: "BC-003", mainId: "1", subCatId: "1", subCat: "ALL STATIONERIES.", qty: 10, sell: 22000, buy: 18000, minStock: 4, minq: 8, minp1: 21500, minq2: 15, minp2: 21000, op: 8 },
        { id: 124, name: "Whiteboard Markers (Assorted)", barcode: "BC-006", mainId: "1", subCatId: "1", subCat: "ALL STATIONERIES.", qty: 50, sell: 2500, buy: 1800, minStock: 10, minq: 20, minp1: 2300, minq2: 40, minp2: 2000, op: 30 },
        { id: 116, name: "Stethoscope - 3M Littmann", barcode: "MD-004", mainId: "2", subCatId: "2", subCat: "SURGICAL TOOLS", qty: 25, sell: 85000, buy: 72000, minStock: 5, minq: 10, minp1: 82000, minq2: 20, minp2: 80000, op: 10 },
        { id: 117, name: "Monitor - Dell 24-inch 4K", barcode: "EL-004", mainId: "3", subCatId: "4", subCat: "COMPUTERS", qty: 15, sell: 145000, buy: 120000, minStock: 3, minq: 5, minp1: 140000, minq2: 10, minp2: 135000, op: 5 },
        { id: 118, name: "Pen - Bic Cristal Blue (Box 50)", barcode: "BC-005", mainId: "1", subCatId: "1", subCat: "ALL STATIONERIES.", qty: 60, sell: 5000, buy: 3500, minStock: 20, minq: 40, minp1: 4800, minq2: 100, minp2: 4500, op: 40 },
        { id: 119, name: "Nebulizer Machine", barcode: "DG-003", mainId: "2", subCatId: "3", subCat: "DIAGNOSTIC EQUIPMENT", qty: 8, sell: 32000, buy: 25000, minStock: 2, minq: 5, minp1: 30000, minq2: 10, minp2: 28000, op: 4 },
        { id: 120, name: "Office Desk Lamp - LED", barcode: "EL-005", mainId: "3", subCatId: "5", subCat: "PRINTERS", qty: 12, sell: 15000, buy: 9000, minStock: 5, minq: 10, minp1: 14000, minq2: 20, minp2: 13000, op: 8 },
        { id: 121, name: "Meeting Table - 8 Seater", barcode: "FU-004", mainId: "4", subCatId: "7", subCat: "DESKS", qty: 2, sell: 450000, buy: 380000, minStock: 1, minq: 2, minp1: 430000, minq2: 5, minp2: 410000, op: 1 },
        { id: 122, name: "Pulse Oximeter - Fingertip", barcode: "MD-005", mainId: "2", subCatId: "3", subCat: "DIAGNOSTIC EQUIPMENT", qty: 45, sell: 12500, buy: 8500, minStock: 15, minq: 20, minp1: 12000, minq2: 50, minp2: 11000, op: 30 },
        { id: 123, name: "HDMI Cable 5m", barcode: "EL-006", mainId: "3", subCatId: "4", subCat: "COMPUTERS", qty: 25, sell: 4500, buy: 2500, minStock: 10, minq: 15, minp1: 4200, minq2: 30, minp2: 4000, op: 20 },
        { id: 104, name: "Surgical Scalpel (Sterile)", barcode: "MD-001", mainId: "2", subCatId: "2", subCat: "SURGICAL TOOLS", qty: 50, sell: 500, buy: 300, minStock: 20, minq: 40, minp1: 450, minq2: 100, minp2: 400, op: 30 },
        { id: 125, name: "Defibrillator", barcode: "MD-006", mainId: "2", subCatId: "3", subCat: "DIAGNOSTIC EQUIPMENT", qty: 2, sell: 500000, buy: 450000, minStock: 1, minq: 1, minp1: 480000, minq2: 3, minp2: 460000, op: 1 },
        { id: 126, name: "Projector - Epson", barcode: "EL-007", mainId: "3", subCatId: "5", subCat: "PRINTERS", qty: 7, sell: 90000, buy: 75000, minStock: 2, minq: 5, minp1: 85000, minq2: 10, minp2: 80000, op: 4 },
        { id: 127, name: "Filing Cabinet - 4 Drawer", barcode: "FU-005", mainId: "4", subCatId: "7", subCat: "DESKS", qty: 10, sell: 60000, buy: 45000, minStock: 3, minq: 5, minp1: 58000, minq2: 12, minp2: 55000, op: 8 },
        { id: 128, name: "Microscope - Lab Grade", barcode: "MD-007", mainId: "2", subCatId: "2", subCat: "SURGICAL TOOLS", qty: 3, sell: 250000, buy: 200000, minStock: 1, minq: 2, minp1: 240000, minq2: 5, minp2: 230000, op: 2 },
        { id: 129, name: "Server Rack - 42U", barcode: "EL-008", mainId: "3", subCatId: "4", subCat: "COMPUTERS", qty: 1, sell: 180000, buy: 150000, minStock: 0, minq: 1, minp1: 170000, minq2: 2, minp2: 160000, op: 1 },
        { id: 130, name: "Visitor Chair - Fabric", barcode: "FU-006", mainId: "4", subCatId: "6", subCat: "OFFICE CHAIRS", qty: 20, sell: 18000, buy: 12000, minStock: 5, minq: 10, minp1: 17000, minq2: 25, minp2: 16000, op: 15 },
        { id: 105, name: "Disposable Syringes 5ml", barcode: "MD-002", mainId: "2", subCatId: "2", subCat: "SURGICAL TOOLS", qty: 200, sell: 100, buy: 60, minStock: 100, minq: 150, minp1: 90, minq2: 300, minp2: 80, op: 150 },
        { id: 106, name: "Blood Pressure Monitor (Digital)", barcode: "DG-001", mainId: "2", subCatId: "3", subCat: "DIAGNOSTIC EQUIPMENT", qty: 5, sell: 45000, buy: 38000, minStock: 2, minq: 3, minp1: 43000, minq2: 7, minp2: 40000, op: 3 },
        { id: 107, name: "Dell Latitude Laptop", barcode: "EL-001", mainId: "3", subCatId: "4", subCat: "COMPUTERS", qty: 8, sell: 350000, buy: 300000, minStock: 3, minq: 5, minp1: 340000, minq2: 10, minp2: 330000, op: 5 },
        { id: 108, name: "HP LaserJet Printer", barcode: "EL-002", mainId: "3", subCatId: "5", subCat: "PRINTERS", qty: 3, sell: 120000, buy: 100000, minStock: 1, minq: 2, minp1: 115000, minq2: 5, minp2: 110000, op: 2 },
        { id: 109, name: "Ergonomic Office Chair", barcode: "FU-001", mainId: "4", subCatId: "6", subCat: "OFFICE CHAIRS", qty: 12, sell: 75000, buy: 60000, minStock: 5, minq: 8, minp1: 72000, minq2: 15, minp2: 70000, op: 10 },
        { id: 110, name: "Executive Desk (Large)", barcode: "FU-002", mainId: "4", subCatId: "7", subCat: "DESKS", qty: 4, sell: 180000, buy: 150000, minStock: 1, minq: 2, minp1: 175000, minq2: 5, minp2: 170000, op: 3 },
        { id: 111, name: "A4 Copy Paper (Ream)", barcode: "BC-004", mainId: "1", subCatId: "1", subCat: "ALL STATIONERIES.", qty: 100, sell: 3000, buy: 2500, minStock: 50, minq: 80, minp1: 2900, minq2: 150, minp2: 2800, op: 70 },
        { id: 112, name: "Surgical Gloves (Box of 100)", barcode: "MD-003", mainId: "2", subCatId: "2", subCat: "SURGICAL TOOLS", qty: 75, sell: 8000, buy: 6500, minStock: 30, minq: 60, minp1: 7800, minq2: 100, minp2: 7500, op: 50 },
        { id: 113, name: "Digital Thermometer", barcode: "DG-002", mainId: "2", subCatId: "3", subCat: "DIAGNOSTIC EQUIPMENT", qty: 20, sell: 12000, buy: 9500, minStock: 10, minq: 15, minp1: 11500, minq2: 25, minp2: 11000, op: 18 },
        { id: 114, name: "Wireless Mouse", barcode: "EL-003", mainId: "3", subCatId: "4", subCat: "COMPUTERS", qty: 30, sell: 8000, buy: 5000, minStock: 10, minq: 20, minp1: 7500, minq2: 40, minp2: 7000, op: 25 },
        { id: 115, name: "Office Filing Cabinet", barcode: "FU-003", mainId: "4", subCatId: "7", subCat: "DESKS", qty: 6, sell: 90000, buy: 75000, minStock: 2, minq: 4, minp1: 88000, minq2: 8, minp2: 85000, op: 5 }
    ];
    renderInventoryItems();
}

function renderCategories() {
    const mainTbody = document.getElementById('TBODY_InvMainCategories');
    const subTbody = document.getElementById('TBODY_InvSubCategories');
    
    const renderRows = (tbody, list) => {
        if (!tbody) return;
        tbody.innerHTML = list.map((c, i) => `<tr data-id="${c.id}"><td>${i+1}</td><td>${c.name}</td></tr>`).join('');
        for(let i=list.length; i<5; i++) tbody.insertAdjacentHTML('beforeend', '<tr><td>&nbsp;</td><td></td></tr>');
    };

    renderRows(mainTbody, window.inventoryState.mainCategories);
    renderRows(subTbody, window.inventoryState.subCategories);
}

function renderInventoryItems() {
    const tbody = document.getElementById('inventory-items-tbody');
    if (!tbody) return;

    const q = window.inventoryState.query;
    const { selectedMainCatId, selectedSubCatId } = window.inventoryState;

    const filtered = window.inventoryState.items.filter(it => {
        const matchesSearch = it.name.toLowerCase().includes(q) || it.barcode.toLowerCase().includes(q);
        const matchesMain = !selectedMainCatId || String(it.mainId) === String(selectedMainCatId);
        // If a subcategory is picked, it also filters by that subcategory
        const matchesSub = !selectedSubCatId || String(it.subCatId) === String(selectedSubCatId);

        return matchesSearch && matchesMain && matchesSub;
    });

    tbody.innerHTML = filtered.map(it => `
        <tr data-id="${it.id}">
            <td>${it.name}</td><td><i class="fa-solid fa-barcode"></i> ${it.barcode}</td><td>${it.subCat}</td>
            <td class="text-right">${it.qty}</td><td class="text-right">${it.sell.toLocaleString()}</td><td class="text-right">${it.buy.toLocaleString()}</td>
            <td class="text-right">${it.minq}</td><td class="text-right">${it.minp1.toLocaleString()}</td><td class="text-right">${it.minq2}</td>
            <td class="text-right">${it.minp2.toLocaleString()}</td><td class="text-right">${it.op.toLocaleString()}</td>
        </tr>
    `).join('');

    for(let i=filtered.length; i<15; i++) tbody.insertAdjacentHTML('beforeend', '<tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>');
}