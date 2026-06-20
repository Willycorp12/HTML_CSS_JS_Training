// js/suppliers.js

/**
 * Global Supplier Manager
 * Handles fetching, caching, and providing a UI modal for managing suppliers.
 * Inspired by the AccountPicker pattern.
 */
window.SupplierManager = {
    data: { items: [], mapById: new Map(), loaded: false },
    config: {
        onSave: null, // Callback function after a new supplier is saved
    },

    async ensureData() {
        if (this.data.loaded) return;
        if (typeof apiFetch === 'undefined') {
            console.error("SupplierManager: apiFetch is not defined.");
            return;
        }

        try {
            const resp = await apiFetch("/api/v1/vendors/getVendors", { method: "GET" });
            if (resp && resp.success) {
                const items = (resp.vendors || []).map(v => ({
                    ...v,
                    id: v.vendorId // Standardize on 'id' for consistency
                }));

                this.data.items = items;
                this.data.mapById.clear();
                items.forEach(it => this.data.mapById.set(it.id, it));
                this.data.loaded = true;
                console.log("SupplierManager: Data loaded and indexed successfully.");
            }else {
                console.error("SupplierManager: API response indicates failure.", resp);
            }
        } catch (e) {
            console.error("SupplierManager: Failed to fetch supplier data.", e);
        }
    },

    openModal(opts) {
        this.config = { ...this.config, ...opts };
        this.ensureData().then(async () => {
            this.renderModal();
            const modal = document.getElementById("GLOBAL_SUPPLIER_MODAL");
            
            // Reset form first
            document.getElementById('GSM_Form').reset();
            document.getElementById('GSM_SupplierID').value = "";
            document.getElementById('GSM_AccountName').value = "";
            document.getElementById('GSM_ChartOfAccountsId').value = "";

            if (opts && opts.mode === 'modify' && opts.supplierId) {
                const supplier = this.data.mapById.get(Number(opts.supplierId));
                if (supplier) {
                    document.getElementById('GSM_Title').textContent = "Modify Supplier Info";
                    document.getElementById('GSM_SupplierID').value = supplier.id;
                    document.getElementById('GSM_CompanyName').value = supplier.name || '';
                    document.getElementById('GSM_ContactPerson').value = supplier.contactPerson || '';
                    document.getElementById('GSM_Phone').value = supplier.phoneNumber || '';
                    document.getElementById('GSM_Website').value = supplier.website || '';
                    document.getElementById('GSM_Email').value = supplier.email || '';
                    document.getElementById('GSM_Date').value = supplier.dateModified ? new Date(supplier.dateModified).toISOString().split('T')[0] : '';
                    document.getElementById('GSM_Address').value = supplier.address1 || '';
                    document.getElementById('GSM_Address2').value = supplier.address2 || '';
                    document.getElementById('GSM_City').value = supplier.city || '';
                    document.getElementById('GSM_Country').value = supplier.country || '';
                    document.getElementById('GSM_VendorNumber').value = supplier.vendorNumber || '';
                    document.getElementById('GSM_Type').value = supplier.vendorType || 1;
                    
                    if (supplier.chartOfAccountsId && window.AccountPicker) {
                        await window.AccountPicker.ensureData();
                        const account = window.AccountPicker.data.mapById.get(Number(supplier.chartOfAccountsId));
                        if(account) {
                            document.getElementById('GSM_AccountName').value = `${account.code} - ${account.name}`;
                            document.getElementById('GSM_ChartOfAccountsId').value = account.id;
                        }
                    }
                } else {
                    showAlert(`Supplier with ID ${opts.supplierId} not found.`, 'error');
                    return;
                }
            } else {
                document.getElementById('GSM_Title').textContent = "New Supplier";
                document.getElementById('GSM_Date').value = new Date().toISOString().split('T')[0];
                document.getElementById('GSM_Type').value = 1;
            }
            modal.style.display = 'flex';
        });
    },

    closeModal() {
        const modal = document.getElementById("GLOBAL_SUPPLIER_MODAL");
        if (modal) modal.style.display = 'none';
    },

    renderModal() {
        let modal = document.getElementById("GLOBAL_SUPPLIER_MODAL");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "GLOBAL_SUPPLIER_MODAL";
            modal.className = "coa-modal-overlay";
            modal.style.cssText = "display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 10001; align-items: center; justify-content: center;";
            
            modal.innerHTML = `
                <div class="coa-modal" style="width: 850px; background: #f0f0f0; border-radius: 6px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); display: flex; flex-direction: column;">
                    <div class="coa-modal-header" style="background: #2e3192; color: white; padding: 10px 15px; font-weight: bold; display: flex; justify-content: space-between; align-items: center; cursor: move;">
                        <div class="coa-modal-title" id="GSM_Title">New Supplier</div>
                        <div class="coa-modal-close" id="GSM_CloseBtn" style="font-size: 22px; color: #fff; opacity: 0.8; cursor: pointer;">&times;</div>
                    </div>
                    <div class="coa-modal-body" style="padding: 20px; background: #fff;">
                        <form id="GSM_Form">
                            <input type="hidden" id="GSM_SupplierID">
                            <div style="display: flex; gap: 20px;">
                                <!-- Left Column -->
                                <div style="flex: 1; display: flex; flex-direction: column; gap: 9px;">
                                    <div class="form-group"><label>Company Name</label><input type="text" id="GSM_CompanyName" required></div>
                                    <fieldset style="border: 1px solid #ccc; padding: 10px; border-radius: 4px;">
                                        <legend>Vendor Number</legend>
                                        <div style="display: flex; align-items: center; gap: 6px;">
                                            <i class="fa-solid fa-barcode" style="font-size: 24px; color: #555;"></i>
                                            <input type="text" id="GSM_VendorNumber" style="flex-grow: 1; padding: 10px 12px; font-size: 14px; border: 1px solid #cfd3dd; border-radius: 6px; box-sizing: border-box;">
                                        </div>
                                    </fieldset>
                                    <div class="form-group"><label>Phone Number</label><input type="text" id="GSM_Phone"></div>
                                    <div class="form-group"><label>Website</label><input type="text" id="GSM_Website"></div>
                                    <div class="form-group"><label>Email</label><input type="email" id="GSM_Email"></div>
                                    <div class="form-group"><label>Date</label><input type="date" id="GSM_Date" style="width: auto;"></div>
                                </div>
                                <!-- Right Column -->
                                <div style="flex: 1; display: flex; flex-direction: column; gap: 6px;">
                                    <div class="form-group"><label>Contact Person</label><input type="text" id="GSM_ContactPerson"></div>
                                    <div class="form-group"><label>Address 1</label><input type="text" id="GSM_Address"></div>
                                    <div class="form-group"><label>Address 2</label><input type="text" id="GSM_Address2"></div>
                                    <div class="form-group"><label>Town</label><input type="text" id="GSM_City"></div>
                                    <div class="form-group"><label>Country</label><input type="text" id="GSM_Country"></div>
                                    <div class="form-group"><label>Supplier Type</label><select id="GSM_Type" style="width: 100%; padding: 10px 12px; font-size: 14px; border: 1px solid #cfd3dd; border-radius: 6px; box-sizing: border-box;">
                                        <option value="1">Inventory Supplier</option>
                                        <option value="2">Fixed Asset Supplier</option>
                                        <option value="3">Other Supplier Type</option>
                                    </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Account Name (Payable)</label>
                                        <input type="text" id="GSM_AccountName" placeholder="Click to select account" readonly style="cursor: pointer; background: #fff;">
                                        <input type="hidden" id="GSM_ChartOfAccountsId">
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="coa-modal-footer" style="padding: 12px 20px; background: #f0f0f0; border-top: 1px solid #ddd; text-align: right;">
                        <button class="wd-action-btn primary" id="GSM_SaveBtn">Validate</button>
                        <button class="wd-action-btn danger" id="GSM_CancelBtn">Close</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // Wire up events once
            document.getElementById('GSM_CloseBtn').onclick = () => this.closeModal();
            document.getElementById('GSM_CancelBtn').onclick = () => this.closeModal();
            document.getElementById('GSM_SaveBtn').onclick = () => this.handleSave();

            // Wire up account picker
            document.getElementById('GSM_AccountName').onclick = () => {
                if (window.AccountPicker) {
                    window.AccountPicker.open({
                        title: "Select Supplier Account",
                        targetClasses: ["CLASS 4"],
                        onSelect: (account) => {
                            if (account) {
                                document.getElementById('GSM_AccountName').value = `${account.code} - ${account.name}`;
                                document.getElementById('GSM_ChartOfAccountsId').value = account.id;
                            }
                        }
                    });
                }
            };
            
            // Make Draggable
            const modalContent = modal.querySelector('.coa-modal');
            const modalHeader = modal.querySelector('.coa-modal-header');
            if (typeof makeElementDraggable === 'function') {
                makeElementDraggable(modalContent, modalHeader);
            }
        }
    },

    async handleSave() {
        const supplierId = document.getElementById('GSM_SupplierID').value;
        const isUpdate = !!supplierId;

        const payload = {
            name: document.getElementById('GSM_CompanyName').value,
            contactPerson: document.getElementById('GSM_ContactPerson').value,
            phoneNumber: document.getElementById('GSM_Phone').value,
            email: document.getElementById('GSM_Email').value,
            address1: document.getElementById('GSM_Address').value,
            address2: document.getElementById('GSM_Address2').value,
            country: document.getElementById('GSM_Country').value,
            city: document.getElementById('GSM_City').value,
            date: document.getElementById('GSM_Date').value,
            website: document.getElementById('GSM_Website').value,
            vendorNumber: document.getElementById('GSM_VendorNumber').value,
            vendorType: document.getElementById('GSM_Type').value,
            chartOfAccountsId: document.getElementById('GSM_ChartOfAccountsId').value
        };

        if (!payload.name) {
            showAlert("Company Name is required.", "error");
            return;
        }

        if (isUpdate) {
            payload.vendorId = supplierId;
        }

        const endpoint = isUpdate ? "/api/v1/vendors/updateVendor" : "/api/v1/vendors/addVendor";
        const method = isUpdate ? "PUT" : "POST";

        const btn = document.getElementById('GSM_SaveBtn');
        btn.disabled = true;
        btn.textContent = "Saving...";

        try {
            const resp = await apiFetch(endpoint, { method: method, body: payload });
            if (resp && resp.success) {
                showAlert(`Supplier ${isUpdate ? 'updated' : 'saved'} successfully!`, "success");
                this.data.loaded = false; // Invalidate cache
                await this.ensureData(); // Refresh data
                this.closeModal();
                if (typeof this.config.onSave === 'function') {
                    this.config.onSave(resp.vendorId || resp.id); // Pass new ID to callback
                }
            } else {
                showAlert((resp && resp.message) ? resp.message : "Failed to save supplier.", "error");
            }
        } catch (e) {
            showAlert("An error occurred during save.", "error");
        } finally {
            btn.disabled = false;
            btn.textContent = "Validate";
        }
    }
};

//Global Supplier Picker for reuse
window.SupplierPicker = {
    data: { items: [], loaded: false },
    config: {
        title: "Select Supplier",
        onSelect: null,
        onOpen: function() {
            const inp = document.getElementById("GSP_SEARCH");
            if (inp) inp.focus();
        }
    },

    async ensureData() {
        // Reuse SupplierManager data if available to avoid double fetching
        if (window.SupplierManager) {
            await window.SupplierManager.ensureData();
            this.data.items = window.SupplierManager.data.items;
            this.data.loaded = true;
        }
    },

    open(opts) {
        this.config = { ...this.config, ...opts };
        this.ensureData().then(() => {
            this.renderModal();
        });
    },

    close() {
        const el = document.getElementById("GLOBAL_SUPPLIER_PICKER");
        if (el) el.style.display = "none";
    },

    renderModal() {
        let el = document.getElementById("GLOBAL_SUPPLIER_PICKER");
        if (!el) {
            el = document.createElement("div");
            el.id = "GLOBAL_SUPPLIER_PICKER";
            el.style.cssText = "position:fixed; inset:0; background:rgba(0,0,0,.35); z-index:10005; display:none;";
            el.innerHTML = `
                <div id="GSP_CONTENT" style="width:500px; max-width:90vw; height:600px; max-height:85vh;
                            background:#fff; margin:8vh auto; border-radius:8px; overflow:hidden;
                            box-shadow:0 10px 30px rgba(0,0,0,.3); display:flex; flex-direction:column; position:relative;">
                    <div id="GSP_HEADER" style="padding:12px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center; background:#2e3192; color:#fff; cursor:move;">
                        <div style="font-weight:bold;" id="GSP_TITLE">Select Supplier</div>
                        <div style="cursor:pointer; font-size:20px;" id="GSP_CLOSE">&times;</div>
                    </div>
                    <div style="padding:10px; border-bottom:1px solid #eee;">
                        <input id="GSP_SEARCH" placeholder="Search supplier..." style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; box-sizing:border-box;">
                    </div>
                    <div id="GSP_LIST" style="padding:10px; overflow-y:auto; flex:1; scrollbar-width: none; -ms-overflow-style: none;">
                        <!-- Items go here -->
                    </div>
                    <style>
                        #GSP_LIST::-webkit-scrollbar { display: none; }
                    </style>
                </div>
            `;
            document.body.appendChild(el);
            
            // Events
            el.addEventListener("click", (e) => { if (e.target === el) this.close(); });
            document.getElementById("GSP_CLOSE").onclick = () => this.close();
            document.getElementById("GSP_SEARCH").addEventListener("input", () => this.renderList());
            
            // Draggable logic
            const content = document.getElementById("GSP_CONTENT");
            const header = document.getElementById("GSP_HEADER");
            let isDragging = false, startX, startY, initialLeft, initialTop;
            
            header.addEventListener('mousedown', (e) => {
                isDragging = true;
                startX = e.clientX; startY = e.clientY;
                const rect = content.getBoundingClientRect();
                content.style.margin = '0'; 
                content.style.position = 'absolute';
                content.style.left = rect.left + 'px';
                content.style.top = rect.top + 'px';
                initialLeft = rect.left; initialTop = rect.top;
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            });
            
            function onMouseMove(e) {
                if (!isDragging) return;
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                content.style.left = (initialLeft + dx) + 'px';
                content.style.top = (initialTop + dy) + 'px';
            }
            
            function onMouseUp() {
                isDragging = false;
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }
        }

        document.getElementById("GSP_TITLE").textContent = this.config.title || "Select Supplier";
        const inp = document.getElementById("GSP_SEARCH");
        if (inp) inp.value = "";
        el.style.display = "block";
        this.renderList();
        if (this.config.onOpen) this.config.onOpen();
    },

    renderList() {
        const list = document.getElementById("GSP_LIST");
        const q = (document.getElementById("GSP_SEARCH").value || "").trim().toLowerCase();
        if (!list) return;
        list.innerHTML = "";

        const filtered = this.data.items.filter(it => (it.name || "").toLowerCase().includes(q));

        filtered.forEach(it => {
            const row = document.createElement("div");
            row.style.cssText = "padding:8px; cursor:pointer; border-bottom:1px solid #f5f5f5; display:flex; align-items:center;";
            row.innerHTML = `<span style="margin-right:8px; font-size:18px; line-height:1;">&bull;</span> <span>${it.name}</span>`;
            row.onmouseenter = () => row.style.background = "#f0f4ff";
            row.onmouseleave = () => row.style.background = "";
            row.onclick = (e) => {
                e.stopPropagation();
                if (typeof this.config.onSelect === 'function') {
                    this.config.onSelect(it);
                }
                this.close();
            };
            list.appendChild(row);
        });

        if (filtered.length === 0) {
            list.innerHTML = `<div style="padding:10px; color:#777;">No suppliers found.</div>`;
        }
    }
};

function initSuppliers() {
    console.log("initSuppliers: Initializing suppliers screen...");
    const state = {
        suppliers: [],
        filteredSuppliers: [],
        selectedId: null,
        searchQuery: ""
    };

    // --- DOM Elements ---
    const tableBody = document.getElementById('TBODY_Suppliers');
    const searchInput = document.getElementById('SUPPLIER_SEARCH'); // This is the search on the suppliers.html page
    const btnNew = document.getElementById('BTN_NewSupplier');
    const btnModify = document.getElementById('BTN_ModifySupplier');
    const btnDelete = document.getElementById('BTN_DeleteSupplier');

    // --- DOM Element Validation ---
    if (!tableBody || !searchInput || !btnNew || !btnModify || !btnDelete) {
        console.error("initSuppliers: One or more required DOM elements are missing. Aborting initialization.");
        return;
    }

    // --- Main Data Fetch ---
    async function fetchSuppliers() {
        // Force a data refresh every time the supplier list screen is loaded.
        // This ensures that balances are always up-to-date after operations on other pages (like Pay Bills).
        window.SupplierManager.data.loaded = false;
        await window.SupplierManager.ensureData();
        state.suppliers = window.SupplierManager.data.items;
        filterAndRender();
    }

    async function apiDeleteSupplier(id) {
        return await apiFetch(`/api/v1/vendors/deleteVendor/${id}`, { method: 'DELETE' });
    }

    async function apiSaveSupplier(payload, isUpdate) {
        // This is now handled by the global SupplierManager
        // We will need a way to open the modal in 'edit' mode.
    }

    // --- Rendering ---
    function render() {
        console.log(`render: Rendering ${state.filteredSuppliers.length} suppliers.`);
        tableBody.innerHTML = "";

        if (state.filteredSuppliers.length === 0) {
            console.log("render: No suppliers to display. Showing 'No suppliers found.' message.");
            tableBody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:20px; color:#777;">No suppliers found.</td></tr>`;
            return;
        }

        state.filteredSuppliers.forEach(supplier => {
            const tr = document.createElement('tr');
            tr.dataset.id = supplier.id; // Use standardized 'id'
            
            // The event delegation listener handles selection, but we still need to apply the class on re-renders (e.g., after filtering).
            if (state.selectedId != null && Number(supplier.id) === state.selectedId) {
                tr.classList.add('selected');
            }

            const balance = Number(supplier.accountBalance || 0).toLocaleString('en-US') + " Frs";

            tr.innerHTML = `
                <td>${supplier.name || ''}</td>
                <td>${supplier.contactPerson || ''}</td>
                <td>${supplier.phoneNumber || ''}</td>
                <td>${supplier.email || ''}</td>
                <td>${supplier.address1 || ''}</td>
                <td>${supplier.address2 || ''}</td>
                <td>${supplier.country || ''}</td>
                <td>${supplier.city || ''}</td>
                <td class="amount" style="text-align: right;">${balance}</td>
            `;

            // The click listener is now handled by event delegation on the table body for better performance.
            tableBody.appendChild(tr);
        });
    }

    function filterAndRender() {
        const q = state.searchQuery.toLowerCase().trim();
        if (!q) {
            state.filteredSuppliers = state.suppliers;
        } else {
            state.filteredSuppliers = state.suppliers.filter(s => 
                (s.name && s.name.toLowerCase().includes(q)) ||
                (s.contactPerson && s.contactPerson.toLowerCase().includes(q))
            );
        }
        render();
    }

    async function handleDelete() {
        if (!state.selectedId) {
            showAlert("Please select a supplier to delete.", "error");
            console.warn("handleDelete: No supplier selected.");
            return;
        }

        // Use Number() for safe comparison
        const supplier = state.suppliers.find(s => Number(s.id) === state.selectedId);
        const supplierName = supplier ? supplier.name : "this supplier";

        showConfirmModal({
            title: "Delete Supplier",
            message: `Are you sure you want to delete "${supplierName}"? This action cannot be undone.`,
            okText: "Delete",
            cancelText: "Cancel",
            onOk: async () => {
                console.log(`handleDelete: Attempting to delete supplier with ID: ${state.selectedId}`);
                try {
                    const resp = await apiDeleteSupplier(state.selectedId);
                    if (resp && resp.success) {
                        showAlert("Supplier deleted successfully.", "success");
                        console.log(`handleDelete: Supplier ${state.selectedId} deleted.`);
                        window.SupplierManager.data.loaded = false; // Invalidate cache
                        state.selectedId = null; // Clear selection
                        fetchSuppliers();
                    } else {
                        const errorMsg = (resp && resp.message) ? resp.message : "Failed to delete supplier.";
                        showAlert(errorMsg, "error");
                        console.error("handleDelete: API returned an error.", errorMsg);
                    }
                } catch (error) {
                    console.error("handleDelete: An error occurred during the API call.", error);
                    showAlert("An error occurred. See console for details.", "error");
                }
            }
        });
    }

    // --- Event Listeners ---
    searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        filterAndRender();
    });

    btnNew.addEventListener('click', () => {
        window.SupplierManager.openModal({
            onSave: () => {
                fetchSuppliers(); // Re-fetch and render the table on this screen
            }
        });
    });
    
    btnModify.addEventListener('click', () => {
        if (!state.selectedId) {
            showAlert("Please select a supplier to modify.", "error");
            return;
        }
        window.SupplierManager.openModal({
            mode: 'modify',
            supplierId: state.selectedId,
            onSave: fetchSuppliers // Refresh table after modification
        });
    });
    btnDelete.addEventListener('click', handleDelete);

    // --- Table Row Selection (Event Delegation) ---
    // This is more efficient than adding a listener to every row.
    tableBody.addEventListener('click', (e) => {
        const tr = e.target.closest('tr');

        // Ensure a valid row with a data-id was clicked within the table body
        if (!tr || !tr.dataset.id || !tableBody.contains(tr)) {
            return;
        }

        // Update state with the clicked row's ID (converted to a number for consistency)
        const clickedId = Number(tr.dataset.id);
        state.selectedId = clickedId;

        // Visually update selection by toggling the 'selected' class on rows
        tableBody.querySelectorAll('tr').forEach(row => row.classList.remove('selected'));
        tr.classList.add('selected');
    });

    // Initial Load
    fetchSuppliers();
}

// Auto-init if loaded dynamically
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    // Adding a small delay to ensure other scripts like chart-of-accounts.js (with AccountPicker) might be loaded.
    // setTimeout(initSuppliers, 100); // This is called by index.html loader
}