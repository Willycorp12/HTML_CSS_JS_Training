/**
 * Asset Master Modal Manager
 * Handles dynamic creation of Asset Types and Locations directly on the Asset Master page.
 */
window.AssetMasterModalManager = {
    config: {
        mode: 'type', // 'type' or 'location'
        action: 'create', // 'create' or 'modify'
        endpoint: '',
        editingId: null,
        title: '',
        label: ''
    },

    // Unified state for selection tracking and data lookups
    state: {
        selectedTypeId: null,
        selectedLocationId: null,
        selectedAssetId: null,
        assetTypesMap: new Map(),
        locationsMap: new Map(),
        allAssets: [] // Store all fetched assets
    },

    /**
     * Opens the modal in either 'type' or 'location' mode.
     * @param {string} mode - 'asset-type' or 'location'
     * @param {string} action - 'create' or 'modify'
     * @param {string} initialValue - The name to pre-fill (for modify)
     */
    openModal(mode, action = 'create', initialValue = "") {
        this.config.mode = mode;
        this.config.action = action;

        if (mode === 'asset-type') { // Changed from 'type' to 'asset-type' to match tabName
            this.config.title = (action === 'create') ? "New Asset Type" : "Modify Asset Type";
            this.config.label = "Type Name";
            this.config.endpoint = (action === 'create') 
                ? "/api/v1/fixedAssets/types/addAssetType" 
                : `/api/v1/fixedAssets/types/updateAssetType/${this.config.editingId}`;
        } else if (mode === 'location') {
            this.config.title = (action === 'create') ? "New Asset Location" : "Modify Asset Location";
            this.config.label = "Location Name";
            this.config.endpoint = (action === 'create') 
                ? "/api/v1/fixedAssets/locations/addLocation" 
                : `/api/v1/fixedAssets/locations/updateLocation/${this.config.editingId}`;
        } else {
            console.error("Invalid mode for AssetMasterModalManager.openModal:", mode);
            return;
        }

        document.getElementById('MAG_Title').textContent = this.config.title;
        document.getElementById('MAG_Label').textContent = this.config.label;
        document.getElementById('MAG_InputName').value = initialValue;
        
        // Update Button Icon/Text based on action
        const saveBtn = document.getElementById('MAG_SaveBtn');
        saveBtn.innerHTML = (action === 'create') 
            ? '<i class="fa-solid fa-plus"></i> Create' 
            : '<i class="fa-solid fa-save"></i> Update Record';

        document.getElementById('MODAL_AssetGeneric').style.display = 'flex';
        document.getElementById('MAG_InputName').focus();
    },

    /**
     * Fetches details and opens modal for modification.
     */
    async openModifyModal() {
        const activeTab = document.querySelector('.asset-left-panel .panel-tab.active');
        const mode = activeTab ? (activeTab.dataset.tabName || activeTab.textContent.toLowerCase().replace(' ', '-')) : 'asset-type';
        const selectedId = (mode === 'asset-type') ? this.state.selectedTypeId : this.state.selectedLocationId;

        if (!selectedId) {
            showAlert(`Please select a ${mode === 'asset-type' ? 'type' : 'location'} to modify.`, "error");
            return;
        }

        const detailsEndpoint = (mode === 'asset-type') 
            ? `/api/v1/fixedAssets/types/getAssetTypeDetails/${selectedId}`
            : `/api/v1/fixedAssets/locations/getLocationDetails/${selectedId}`;

        try {
            const resp = await apiFetch(detailsEndpoint, { method: "GET" });
            if (resp && resp.success) {
                const data = resp.data || resp;
                const name = data.name || "";
                this.config.editingId = selectedId;
                this.openModal(mode, 'modify', name);
            } else {
                showAlert(resp.message || "Failed to fetch details.", "error");
            }
        } catch (e) {
            console.error("openModifyModal Error:", e);
        }
    },

    closeModal() {
        const modal = document.getElementById('MODAL_AssetGeneric');
        if (modal) modal.style.display = 'none';
        this.config.editingId = null;
    },

    /**
     * Opens the Audit modal for the selected asset.
     */
    async openAuditModal() {
        const assetId = this.state.selectedAssetId;
        if (!assetId) {
            showAlert("Please select an asset record from the table first.", "error");
            return;
        }

        try {
            const resp = await apiFetch(`/api/v1/fixedAssets/getAssetDetails/${assetId}`, { method: "GET" });
            if (resp && resp.success) {
                const data = resp.data;
                
                // Set Static Text
                document.getElementById('AUDIT_AssetName').textContent = data.assetName;
                
                // Populate Form Fields
                document.getElementById('audit-date').value = new Date().toISOString().split('T')[0];
                
                const locName = this.state.locationsMap.get(Number(data.locationId)) || data.locationName || "";
                const locInput = document.getElementById('audit-location');
                locInput.value = locName;
                locInput.dataset.id = data.locationId || "";

                document.getElementById('audit-status').value = data.assetStatus || "1";
                document.getElementById('audit-comments').value = ""; // Unmapped as requested

                // Populate Approve Status Map in the Select
                const approveSelect = document.getElementById('audit-approve-status');
                approveSelect.innerHTML = Object.entries(APPROVE_STATUS_MAP).map(([id, label]) => 
                    `<option value="${id}">${label}</option>`
                ).join('');
                approveSelect.value = data.approveStatus || "1";

                // Show Modal
                document.getElementById('MODAL_AssetAudit').style.display = 'flex';
            } else {
                showAlert(resp.message || "Failed to load asset details for audit.", "error");
            }
        } catch (e) {
            console.error("openAuditModal Error:", e);
        }
    },

    closeAuditModal() {
        const modal = document.getElementById('MODAL_AssetAudit');
        if (modal) modal.style.display = 'none';
    },

    async handleAuditSave() {
        const assetId = this.state.selectedAssetId;
        const payload = {
            dateAudited: document.getElementById('audit-date').value,
            assetStatus: Number(document.getElementById('audit-status').value),
            locationId: Number(document.getElementById('audit-location').dataset.id || 0),
            notes: document.getElementById('audit-comments').value.trim(),
            approveStatus: Number(document.getElementById('audit-approve-status').value)
        };

        try {
            // Sending to the endpoint requested (passing assetId in URL)
            const resp = await apiFetch(`/api/v1/fixedAssets/auditAsset/${assetId}`, {
                method: "PUT",
                body: payload
            });

            if (resp && resp.success) {
                showAlert(resp.message || "Asset Audit recorded successfully!", "success");
                this.closeAuditModal();
                fetchAndRenderAssets(); // Refresh the table to reflect any status/location updates
            } else {
                showAlert(resp ? resp.message : "Failed to record audit.", "error");
            }
        } catch (e) {
            console.error("handleAuditSave Error:", e);
            showAlert("An error occurred while saving the audit record.", "error");
        }
    },

    /**
     * Handles deletion of selected record.
     */
    async handleDelete() {
        const activeTab = document.querySelector('.asset-left-panel .panel-tab.active');
        const mode = activeTab ? (activeTab.dataset.tabName || activeTab.textContent.toLowerCase().replace(' ', '-')) : 'asset-type';
        const selectedId = (mode === 'asset-type') ? this.state.selectedTypeId : this.state.selectedLocationId;

        if (!selectedId) {
            showAlert(`Please select a ${mode === 'asset-type' ? 'type' : 'location'} to delete.`, "error");
            return;
        }

        showConfirmModal({
            title: "Confirm Deletion",
            message: `Are you sure you want to delete this ${mode === 'asset-type' ? 'asset type' : 'location'}? This cannot be reversed.`,
            okText: "Delete Now",
            onOk: async () => {
                const endpoint = (mode === 'asset-type')
                    ? `/api/v1/fixedAssets/types/deleteAssetType/${selectedId}`
                    : `/api/v1/fixedAssets/locations/deleteLocation/${selectedId}`;
                
                const response = await apiFetch(endpoint, { method: "DELETE" });
                if (response && response.success) {
                    showAlert(response.message || "Record deleted successfully.", "success");
                    if (mode === 'asset-type') {
                        this.state.selectedTypeId = null;
                        fetchAndRenderAssetTypes();
                    } else {
                        this.state.selectedLocationId = null;
                        fetchAndRenderAssetLocations();
                    }
                } else {
                    showAlert(response.message || "Deletion failed.", "error");
                }
            }
        });
    },

    /**
     * Handles the save action via apiFetch.
     */
    async handleSave() {
        const nameValue = document.getElementById('MAG_InputName').value.trim();
        if (!nameValue) {
            showAlert(`${this.config.label} is required.`, "error");
            return;
        }

        const btn = document.getElementById('MAG_SaveBtn');
        const originalContent = btn.innerHTML;
        btn.disabled = true;
        const loadingText = (this.config.action === 'create') ? 'Creating...' : 'Updating...';
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${loadingText}`;

        try {
            const response = await apiFetch(this.config.endpoint, {
                method: (this.config.action === 'modify') ? "PUT" : "POST",
                body: { name: nameValue }
            });

            if (response && response.success) {
                showAlert(response.message, "success");
                this.closeModal();
                
                // Refresh the corresponding table
                if (this.config.mode === 'asset-type') fetchAndRenderAssetTypes();
                else if (this.config.mode === 'location') fetchAndRenderAssetLocations();
            } else {
                showAlert(response.message || "Failed to create record.", "error");
            }
        } catch (error) {
            console.error("AssetMasterModalManager Save Error:", error);
            showAlert("An error occurred during save.", "error");
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalContent;
        }
    }
};

/**
 * Injects global button styles if not already present.
 * This ensures wd-btn styles are available for Asset Master buttons.
 */
function injectGlobalButtonStyles() {
    if (document.getElementById('global-wd-btn-styles')) return;

    const style = document.createElement('style');
    style.id = 'global-wd-btn-styles';
    style.innerHTML = `
        .wd-btn { padding: 6px 12px; border: 1px solid #bbb; background: linear-gradient(#ffffff, #e9e9e9); cursor: pointer; font-size: 12px; display: inline-flex; align-items: center; gap: 6px; justify-content: center; border-radius: 4px; }
            .wd-btn:hover { background: linear-gradient(#f8f8f8, #dcdcdc);opacity: 0.9; }
            .wd-btn.primary { border-color: #2e3192; color: #2e3192; font-weight: bold; }
            .wd-btn.danger { border-color: #cd2027; color: #cd2027; font-weight: bold; }
    `;
    document.head.appendChild(style);
}

// --- Helper Maps for Status and Approval ---
const ASSET_STATUS_MAP = { "1": "IN USE", "2": "UNDER REPAIR", "3": "OUT OF SERVICE", "4": "DAMAGED", "5": "LOST", "6": "TRANSFERRED", "7": "DISPOSED" };
const APPROVE_STATUS_MAP = { "1": "Approved & Received", "2": "NOT Approved/Received" };

/**
 * Formatting Helpers
 */
function formatDate(dateStr) {
    if (!dateStr) return "";
    // Handles YYYYMMDD format from API
    if (dateStr.length === 8 && !dateStr.includes("-")) {
        const y = dateStr.substring(0, 4);
        const m = dateStr.substring(4, 6);
        const d = dateStr.substring(6, 8);
        return `${m}/${d}/${y}`;
    }
    // Handles ISO YYYY-MM-DD
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${month}/${day}/${d.getFullYear()}`;
}

function formatCurrency(val) {
    return Number(val || 0).toLocaleString('en-US');
}

/**
 * Fetches Asset Types from the backend and renders them.
 */
window.fetchAndRenderAssetTypes = async function() {
    const tbody = document.getElementById('TBODY_AssetTypes');
    if (!tbody) return;
    try {
        const resp = await apiFetch("/api/v1/fixedAssets/types/getAssetTypes", { method: "GET" });
        if (resp && resp.success) {
            // Populate global map for lookups
            resp.data.forEach(type => window.AssetMasterModalManager.state.assetTypesMap.set(Number(type.assetTypeId), type.name));
            // Render table
            renderAssetTableData(tbody, resp.data || [], 'assetTypeId', 'name');
        }
    } catch (e) {
        console.error("fetchAndRenderAssetTypes Error:", e);
    }
};

/**
 * Fetches Asset Locations from the backend and renders them.
 */
window.fetchAndRenderAssetLocations = async function() {
    const tbody = document.getElementById('TBODY_Locations');
    if (!tbody) return;
    try {
        const resp = await apiFetch("/api/v1/fixedAssets/locations/getLocations", { method: "GET" });
        if (resp && resp.success) {
            // Populate global map for lookups
            resp.data.forEach(loc => window.AssetMasterModalManager.state.locationsMap.set(loc.locationId, loc.name));
            resp.data.forEach(loc => window.AssetMasterModalManager.state.locationsMap.set(Number(loc.locationId), loc.name));
            // Render table
            renderAssetTableData(tbody, resp.data || [], 'locationId', 'name');
        }
    } catch (e) {
        console.error("fetchAndRenderAssetLocations Error:", e);
    }
};
/**
 * Helper to render rows and add filler grid lines.
 */
function renderAssetTableData(tbody, items, idKey, nameKey) {
    tbody.innerHTML = "";
    items.forEach((item, idx) => {
        const tr = document.createElement("tr");
        tr.dataset.id = item[idKey];
        tr.innerHTML = `<td>${idx + 1}</td><td>${item[nameKey]}</td>`;
        tbody.appendChild(tr);
    });

    // Add filler rows for visual consistency
    for (let i = 0; i < 3; i++) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>&nbsp;</td><td></td>`;
        tbody.appendChild(tr);
    }
}

/**
 * Filters the Approved Assets table based on the selection in the left panel.
 */
function filterApprovedAssets() {
    const state = window.AssetMasterModalManager.state;
    // Start with all approved assets
    const approvedOnly = state.allAssets.filter(asset => asset.approveStatus === "1");
    
    const activeTab = document.querySelector('.asset-left-panel .panel-tab.active');
    const tabName = activeTab ? (activeTab.dataset.tabName || activeTab.textContent.toLowerCase().replace(' ', '-')) : 'asset-type';

    let filteredList = approvedOnly;

    if (tabName === 'asset-type' && state.selectedTypeId) {
        filteredList = approvedOnly.filter(a => Number(a.assetTypesId) === Number(state.selectedTypeId));
    } else if (tabName === 'location' && state.selectedLocationId) {
        filteredList = approvedOnly.filter(a => Number(a.locationId) === Number(state.selectedLocationId));
    }

    renderAssetsTable('approved-assets-tbody', filteredList);
}

/**
 * Fetches Assets from the backend and renders them into the Approved/Unapproved tables.
 */
async function fetchAndRenderAssets() {
    try {
        const resp = await apiFetch("/api/v1/fixedAssets/getAssets", { method: "GET" });
        if (resp && resp.success && Array.isArray(resp.data)) {
            window.AssetMasterModalManager.state.allAssets = resp.data;

            const approvedAssets = resp.data.filter(asset => asset.approveStatus === "1");
            const unapprovedAssets = resp.data.filter(asset => asset.approveStatus === "2");

            renderAssetsTable('approved-assets-tbody', approvedAssets);
            renderAssetsTable('unapproved-assets-tbody', unapprovedAssets);
        } else {
            showAlert(resp ? resp.message : "Failed to load assets.", "error");
            renderAssetsTable('approved-assets-tbody', []); // Clear tables on error
            renderAssetsTable('unapproved-assets-tbody', []);
        }
    } catch (e) {
        console.error("fetchAndRenderAssets Error:", e);
        showAlert("An error occurred while fetching assets.", "error");
        renderAssetsTable('approved-assets-tbody', []); // Clear tables on error
        renderAssetsTable('unapproved-assets-tbody', []);
    }
}

/**
 * Renders the assets into a specific table body.
 * @param {string} tbodyId The ID of the tbody element.
 * @param {Array} assets The array of asset objects to render.
 */
function renderAssetsTable(tbodyId, assets) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    tbody.innerHTML = ''; // Clear existing rows
    const MIN_ROWS = 10; // Maintain visual height

    assets.forEach((asset, idx) => {
        const tr = document.createElement('tr');
        tr.dataset.id = asset.assetId; // Store asset ID for potential future use (edit/delete)

        const assetTypeName = window.AssetMasterModalManager.state.assetTypesMap.get(Number(asset.assetTypesId)) || 'N/A';
        const assetStatusText = ASSET_STATUS_MAP[asset.assetStatus] || 'N/A';
        const approvalStatusText = APPROVE_STATUS_MAP[asset.approveStatus] || 'N/A';


        tr.innerHTML = `
            <td>${idx + 1}</td>
            <td>${asset.assetName}</td>
            <td>${assetTypeName}</td>
            <td style="text-align: right;">${asset.qty}</td>
            <td>${formatDate(asset.acquisitionDate)}</td>
            <td style="text-align: right;">${formatCurrency(asset.totalCost)}</td>
            <td>${assetStatusText}</td>
            <td style="text-align: right;">${formatCurrency(asset.openingBalance)}</td>
            <td>${approvalStatusText}</td>
        `;
        tbody.appendChild(tr);
    });

    // Add filler rows
    for (let i = assets.length; i < MIN_ROWS; i++) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>`;
        tbody.appendChild(tr);
    }
}

function switchAssetMasterTab(panel, tabName, element) {
    if (panel === 'left') {
        // --- LEFT PANEL (Asset Type vs Location) ---
        
        // 1. Update Tab Styles
        document.querySelectorAll('.asset-left-panel .panel-tab').forEach(tab => {
            tab.classList.remove('active');
            tab.dataset.tabName = tab.textContent.toLowerCase().replace(' ', '-'); // Set data-tabName
        });
        element.classList.add('active');
        element.dataset.tabName = tabName; // Ensure the active one has it too

        // 2. Toggle Content Visibility
        const typeContent = document.getElementById('asset-type-content');
        const locContent = document.getElementById('location-content');
        
        if (typeContent && locContent) {
            typeContent.style.display = 'none';
            locContent.style.display = 'none';
            document.getElementById(tabName + '-content').style.display = 'block';
        }

        // 3. Update "New..." Button Text
        const newBtn = document.getElementById('new-type-location-btn');
        if (newBtn) {
            newBtn.innerHTML = (tabName === 'location') 
                ? '<i class="fa-solid fa-file-circle-plus"></i> New Location' 
                : '<i class="fa-solid fa-file-circle-plus"></i> New Type';
        }

        // Reset left selections when switching tabs
        window.AssetMasterModalManager.state.selectedTypeId = null;
        window.AssetMasterModalManager.state.selectedLocationId = null;
        document.querySelectorAll('.asset-left-panel tr.selected').forEach(r => r.classList.remove('selected'));
        
        // Show all approved assets (clearing filters)
        filterApprovedAssets();

    } else if (panel === 'right') {
        // --- RIGHT PANEL (Approved vs Unapproved Assets) ---

        // 1. Update Tab Styles
        document.querySelectorAll('.asset-right-panel .main-tab').forEach(tab => tab.classList.remove('active'));
        element.classList.add('active');

        // Clear selection when switching asset tabs
        window.AssetMasterModalManager.state.selectedAssetId = null;

        // Clear search input when switching tabs
        const searchInput = document.querySelector('.global-search');
        if (searchInput) searchInput.value = '';

        // 2. Toggle Content Visibility
        document.getElementById('approved-assets-content').style.display = 'none';
        document.getElementById('unapproved-assets-content').style.display = 'none';
        document.getElementById(tabName + '-assets-content').style.display = 'block';

        // Reset row displays for the visible table
        const tbody = document.getElementById(tabName + '-assets-tbody');
        if (tbody) {
            tbody.querySelectorAll('tr').forEach(tr => tr.style.display = '');
        }
    }
}

/**
 * Deletes the selected asset after confirmation.
 */
async function deleteAsset() {
    const id = window.AssetMasterModalManager.state.selectedAssetId;
    if (!id) {
        showAlert("Please select an asset to delete.", "error");
        return;
    }

    showConfirmModal({
        title: "Confirm Deletion",
        message: "Are you sure you want to delete this asset? This action cannot be reversed.",
        okText: "Delete Now",
        onOk: async () => {
            try {
                const resp = await apiFetch(`/api/v1/fixedAssets/deleteAsset/${id}`, { method: "DELETE" });
                if (resp && resp.success) {
                    showAlert(resp.message || "Asset deleted successfully.", "success");
                    window.AssetMasterModalManager.state.selectedAssetId = null;
                    fetchAndRenderAssets(); // Refresh the table
                } else {
                    showAlert(resp ? resp.message : "Deletion failed.", "error");
                }
            } catch (e) {
                console.error("deleteAsset Error:", e);
                showAlert("An error occurred during deletion.", "error");
            }
        }
    });
}

function modifyAsset() {
    const id = window.AssetMasterModalManager.state.selectedAssetId;
    if (!id) {
        showAlert("Please select an asset to modify.", "error");
        return;
    }
    sessionStorage.setItem('editingAssetId', id);
    loadScreen('asset-new.html');
}

/**
 * Initializes the Asset Master screen components.
 */
window.initAssetMaster = async function() {
    console.log("Asset Master Loaded: Initializing buttons and modal logic.");

    // Ensure global button styles are injected
    injectGlobalButtonStyles();

    // Perform initial data fetch for left panel and assets, awaiting maps to prevent "N/A" values
    await fetchAndRenderAssetTypes();
    await fetchAndRenderAssetLocations();
    fetchAndRenderAssets(); // Fetch and render assets for the right panel

    // 1. Style all buttons on the master page
    // Target all buttons within the asset-master-wrapper
    const allButtons = document.querySelectorAll('.asset-master-wrapper button');
    allButtons.forEach(btn => {
        if (!btn.classList.contains('wd-btn')) {
            btn.classList.add('wd-btn');
        }
        // Apply primary style by default for action buttons, unless it's a danger, excel, or already primary button
        if (!btn.classList.contains('danger') && 
            !btn.classList.contains('excel-btn') && 
            !btn.classList.contains('primary')) {
            btn.classList.add('primary');
        }
    });

    // Attach listener for the main "New Asset" registration screen
    const newAssetBtn = document.getElementById('btn-new-asset');
    if (newAssetBtn) {
        newAssetBtn.addEventListener('click', () => {
            sessionStorage.removeItem('editingAssetId'); // Ensure clean state for new asset
            loadScreen('asset-new.html'); // Load the new asset creation screen
        });
    }

    // 2. Attach listener for the dynamic "New Type/Location" button
    const newTypeLocationBtn = document.getElementById('new-type-location-btn');
    if (newTypeLocationBtn) {
        newTypeLocationBtn.addEventListener('click', () => {
            const activeTab = document.querySelector('.asset-left-panel .panel-tab.active');
            // Determine mode: check dataset first, then fallback to text content parsing (for immediate load)
            let mode = 'asset-type';
            if (activeTab) {
                mode = activeTab.dataset.tabName || activeTab.textContent.toLowerCase().replace(' ', '-');
            }
            window.AssetMasterModalManager.openModal(mode, 'create');
        });
    }

    // Asset List Toolbar Listeners
    document.getElementById('btn-edit-asset')?.addEventListener('click', modifyAsset);
    document.getElementById('btn-delete-asset')?.addEventListener('click', deleteAsset);
    document.querySelector('.excel-btn')?.addEventListener('click', exportAssetsToExcel);
    document.getElementById('btn-refresh-assets')?.addEventListener('click', () => {
        // Clear all filters and selections
        window.AssetMasterModalManager.state.selectedTypeId = null;
        window.AssetMasterModalManager.state.selectedLocationId = null;
        document.querySelectorAll('.asset-left-panel tr.selected').forEach(r => r.classList.remove('selected'));
        // Clear search input
        const searchInput = document.querySelector('.global-search');
        if (searchInput) searchInput.value = '';
        fetchAndRenderAssets();
        // Reset row displays after re-rendering
        const activeTab = document.querySelector('.main-tabs .main-tab.active');
        const tabName = activeTab ? activeTab.textContent.toLowerCase().includes('approved') ? 'approved' : 'unapproved' : 'approved';
        const tbody = document.getElementById(tabName + '-assets-tbody');
        if (tbody) {
            tbody.querySelectorAll('tr').forEach(tr => tr.style.display = '');
        }
    });

        // Asset Audit Toolbar Listener
    document.getElementById('btn-audit-asset')?.addEventListener('click', () => {
        window.AssetMasterModalManager.openAuditModal();
    });

    // Attach real-time search listener to the search input
    const searchInput = document.querySelector('.global-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterAssetTable(this.value);
        });
    }

    // Audit Location Picker Trigger
    document.getElementById('audit-location')?.addEventListener('click', () => {
        if (window.GenericListPicker) {
            window.GenericListPicker.open({
                title: "Select Audit Location",
                endpoint: "/api/v1/fixedAssets/locations/getLocations",
                responseKey: "data",
                idKey: "locationId",
                nameKey: "name",
                onSelect: (loc) => {
                    const input = document.getElementById('audit-location');
                    input.value = loc.name;
                    input.dataset.id = loc.id;
                }
            });
        }
    });

    // Audit Save Listener
    document.getElementById('AUDIT_SaveBtn')?.addEventListener('click', () => {
        window.AssetMasterModalManager.handleAuditSave();
    });

    // Initialize Draggability
    (function() {
        const modal = document.getElementById('MODAL_NewAsset');
        const header = document.getElementById('MODAL_NewAsset_Header');
        if (modal && header && typeof makeElementDraggable === 'function') {
            makeElementDraggable(modal, header);
        }
    })();

    const modifyTypeLocationBtn = document.getElementById('modify-type-location-btn');
    if (modifyTypeLocationBtn) {
        modifyTypeLocationBtn.addEventListener('click', () => {
            window.AssetMasterModalManager.openModifyModal();
        });
    }

    const deleteTypeLocationBtn = document.getElementById('delete-type-location-btn');
    if (deleteTypeLocationBtn) {
        deleteTypeLocationBtn.addEventListener('click', () => {
            window.AssetMasterModalManager.handleDelete();
        });
    }

    // 3. Initialize row selection for all tables in this view
    const tables = document.querySelectorAll('.asset-master-wrapper table tbody');
    tables.forEach(tbody => {
        tbody.addEventListener('click', (e) => {
            const tr = e.target.closest('tr');
            if (!tr) return;
            
            // Ignore clicks on empty filler rows (SN column is empty or non-numeric)
            const snValue = tr.cells[0] ? tr.cells[0].textContent.trim() : "";
            if (!snValue || snValue === "" || snValue === " ") return; 

            tbody.querySelectorAll('tr.selected').forEach(r => r.classList.remove('selected'));
            tr.classList.add('selected');

            // Capture ID for later use (Modify/Delete)
            const id = tr.dataset.id;
            if (tbody.id === 'TBODY_AssetTypes') {
                AssetMasterModalManager.state.selectedTypeId = id;
            } else if (tbody.id === 'TBODY_Locations') {
                AssetMasterModalManager.state.selectedLocationId = id;
            } else if (tbody.id === 'approved-assets-tbody' || tbody.id === 'unapproved-assets-tbody') {
                AssetMasterModalManager.state.selectedAssetId = id;
            }

            // Automatically apply filter if left panel item is selected
            if (tbody.id === 'TBODY_AssetTypes' || tbody.id === 'TBODY_Locations') {
                filterApprovedAssets();
            }
        });
    });

    // Make the modal draggable once it's in the DOM
    const modal = document.getElementById('MODAL_AssetGeneric');
    if (modal) {
        const modalContent = modal.querySelector('.coa-modal');
        const modalHeader = document.getElementById('MAG_Header');
        if (typeof makeElementDraggable === 'function') {
            makeElementDraggable(modalContent, modalHeader);
        }
    }
};

// Ensure the init function runs when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.asset-master-wrapper')) {
        initAssetMaster();
    }
});

/**
 * Filters the asset table based on the search value.
 * @param {string} val - The search value to filter by.
 */
function filterAssetTable(val) {
    // Determine the currently visible tbody
    const approvedContent = document.getElementById('approved-assets-content');
    const unapprovedContent = document.getElementById('unapproved-assets-content');
    let tbody;
    if (approvedContent && approvedContent.style.display !== 'none') {
        tbody = document.getElementById('approved-assets-tbody');
    } else if (unapprovedContent && unapprovedContent.style.display !== 'none') {
        tbody = document.getElementById('unapproved-assets-tbody');
    } else {
        // Default to approved
        tbody = document.getElementById('approved-assets-tbody');
    }

    if (!tbody) return;

    const rows = tbody.querySelectorAll('tr');
    const filter = val.toLowerCase();

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(filter) ? '' : 'none';
    });
}

/**
 * Print Engine Logic for Fixed Assets Report (Multi-page A4).
 * Generates a PDF-ready window similar to Trial Balance.
 */
function printFixedAssetsReport() {
    const assets = window.AssetMasterModalManager.state.allAssets;
    if (!assets || assets.length === 0) {
        showAlert("No assets to print.", "error");
        return;
    }

    const orientation = 'portrait';
    const ROWS_PER_PAGE = 25; // Adjust for A4 portrait
    const user = document.getElementById('USER_NAME'); // Placeholder for user name, can be dynamic if needed

    const now = new Date();
    const printDate = now.toLocaleDateString('en-GB');
    const printTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    const totalPages = Math.ceil(assets.length / ROWS_PER_PAGE);
    let allPagesHTML = '';

    // Loop through the data in chunks
    for (let i = 0; i < totalPages; i++) {
        const chunk = assets.slice(i * ROWS_PER_PAGE, (i + 1) * ROWS_PER_PAGE);
        let rowsHTML = '';

        chunk.forEach((asset, idx) => {
            const assetTypeName = window.AssetMasterModalManager.state.assetTypesMap.get(Number(asset.assetTypesId)) || 'N/A';
            const assetStatusText = ASSET_STATUS_MAP[asset.assetStatus] || 'N/A';
            const approvalStatusText = APPROVE_STATUS_MAP[asset.approveStatus] || 'N/A';

            rowsHTML += `<tr>
                <td>${i * ROWS_PER_PAGE + idx + 1}</td>
                <td>${asset.assetName}</td>
                <td>${assetTypeName}</td>
                <td class="text-right">${asset.qty}</td>
                <td>${formatDate(asset.acquisitionDate)}</td>
                <td class="text-right">${formatCurrency(asset.totalCost)}</td>
                <td>${assetStatusText}</td>
                <td class="text-right">${formatCurrency(asset.openingBalance)}</td>
                <td>${approvalStatusText}</td>
            </tr>`;
        });

        allPagesHTML += `
            <div class="page ${orientation}">
                <div class="doc-header">
                    <div style="width: 100px;"></div>
                    <div class="header-center">
                        <h2>BIAKA HOSPITAL</h2>
                        <h3>Fixed Assets List</h3>
                        <div class="red-line" ></div>
                        <div class="header-meta">
                            <span>Printed &nbsp; <b>${printDate} &nbsp; @ ${printTime}</b></span>
                            <span style="margin-right: 20px;">By: &nbsp; ${user ? user.textContent : 'N/A'}</span>
                        </div>
                    </div>
                    <div class="header-right">
                        <div>${printDate}</div>
                        <div>${printTime}</div>
                    </div>
                </div>

                <table>
                    <colgroup>
                        <col style="width: 5%;">
                        <col style="width: 25%;">
                        <col style="width: 15%;">
                        <col style="width: 5%;">
                        <col style="width: 12%;">
                        <col style="width: 14%;">
                        <col style="width: 9%;">
                        <col style="width: 15%;">
                        <col style="width: 13%;">
                    </colgroup>
                    <thead>
                        <tr>
                            <th>S/N</th>
                            <th>Asset Name</th>
                            <th>Asset Type</th>
                            <th>Qty</th>
                            <th>Acq. Date</th>
                            <th>Purchase Price</th>
                            <th>Status</th>
                            <th>Opening Balance</th>
                            <th>Approval Status</th>
                        </tr>
                    </thead>
                    <tbody>${rowsHTML}</tbody>
                </table>

                <div class="doc-footer">
                    <span>"Copyright(c)2022. Institute Pro ERP"</span>
                    <span>Page ${i + 1}/${totalPages}</span>
                    <span>Powered by AfricRenov Group Sarl</span>
                </div>
            </div>`;
    }

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <title>Fixed Assets Print</title>
            <style>
                @page { size: A4 ${orientation}; margin: 0; }
                body { margin: 0; padding: 0; background: #525659; font-family: "Segoe UI", Tahoma, sans-serif; }
                .page {
                    background: #fff;
                    width: ${orientation === 'portrait' ? '21cm' : '29.7cm'};
                    min-height: ${orientation === 'portrait' ? '29.7cm' : '21cm'};
                    box-sizing: border-box;
                    padding: 1.5cm;
                    margin: 10px auto;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 0 10px rgba(0,0,0,0.5);
                }
                .doc-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
                .header-center { flex: 1; text-align: center; }
                .header-center h2 { margin: 0; font-size: 20px; color: #2e3192; text-transform: uppercase; }
                .header-center h3 { margin: 5px 0; font-size: 16px; color: #2e3192; font-weight: bold; }
                .red-line { border-top: 2px solid #cd2027; width: 80%; margin: 5px auto; }
                .sub-date { color: #cd2027; font-size: 13px; font-weight: bold; }
                .header-right { text-align: right; font-size: 11px; color: #333; }

                table { width: 100%; border-collapse: collapse; font-size: 11px; table-layout: fixed; margin-top: 15px; }
                th, td { border: 1px solid #000; padding: 4px 3px; vertical-align: middle; word-wrap: break-word; }
                th { background-color: #f0f0f0 !important; font-weight: bold; text-align: center; -webkit-print-color-adjust: exact; }
                .text-right { text-align: right !important; }
                .font-bold { font-weight: bold; background-color: #f9f9f9 !important; }

                .doc-footer {
                    margin-top: auto;
                    display: flex;
                    justify-content: space-between;
                    font-size: 10px;
                    border-top: 1px solid #ccc;
                    padding: 8px 0;
                }

                @media print {
                    body { background: none; }
                    .page { margin: 0; box-shadow: none; page-break-after: always; }
                    .page:last-child { page-break-after: auto; }
                }
            </style>
        </head>
        <body>
            ${allPagesHTML}
            <script>window.onload = function() { window.print(); window.close(); };</script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// Expose the print function
window.printFixedAssetsReport = printFixedAssetsReport;

/**
 * Export Assets to Excel (Supervisor's HTML-to-Excel Method)
 * Uses zero external libraries.
 */
function exportAssetsToExcel() {
    const state = window.AssetMasterModalManager.state;
    
    // 1. Identify which list to export (Approved vs Unapproved) based on the active tab
    const activeTab = document.querySelector('.asset-right-panel .main-tab.active');
    const isApprovedTab = activeTab && activeTab.textContent.includes("Approved Assets");
    
    const assetsToExport = isApprovedTab 
        ? state.allAssets.filter(a => a.approveStatus === "1")
        : state.allAssets.filter(a => a.approveStatus === "2");

    if (assetsToExport.length === 0) {
        showAlert("No data available to export for this category.", "error");
        return;
    }

    const rowsHTML = buildAssetExportRowsHTML(assetsToExport);
    const categoryName = isApprovedTab ? "Approved Fixed Assets" : "Unapproved Fixed Assets";

    // 2. Build the HTML structure with styles matching your boss's GL report
    const html = `
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { background: #ffffff; font-family: Arial, sans-serif; }
                table { border-collapse: collapse; font-size: 11px; width: 1100px; }
                th, td { border: 1px solid #000; padding: 5px; vertical-align: middle; }
                th { 
                    background: #2e3192; /* Biaka Blue */
                    color: #ffffff; 
                    font-weight: bold; 
                    text-align: center; 
                }
                .title { font-weight: bold; color: #2e3192; text-align: center; font-size: 18px; }
                .subtitle { font-weight: bold; color: #cd2027; text-align: center; font-size: 14px; }
                .text-right { text-align: right; }
                .text-center { text-align: center; }
            </style>
        </head>
        <body>
            <table>
                <tr><td colspan="9" class="title">BIAKA HOSPITAL</td></tr>
                <tr><td colspan="9" class="title">${categoryName}</td></tr>
                <tr><td colspan="9" class="subtitle">Generated: ${new Date().toLocaleDateString()}</td></tr>
                <tr><td colspan="9"></td></tr>
                <thead>
                    <tr>
                        <th style="width:40px">SN</th>
                        <th style="width:250px">Asset Name</th>
                        <th style="width:150px">Asset Type</th>
                        <th style="width:60px">Qty</th>
                        <th style="width:100px">Acq. Date</th>
                        <th style="width:100px">Total Cost</th>
                        <th style="width:120px">Status</th>
                        <th style="width:120px">Opening Bal.</th>
                        <th style="width:150px">Approve Status</th>
                    </tr>
                </thead>
                <tbody>${rowsHTML}</tbody>
            </table>
        </body>
        </html>`;

    // 3. Trigger Download
    const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Fixed_Assets_${isApprovedTab ? 'Approved' : 'Unapproved'}_${new Date().getTime()}.xls`;
    link.click();
    URL.revokeObjectURL(link.href);
}

/**
 * Helper to build table rows using your existing state maps
 */
function buildAssetExportRowsHTML(assets) {
    const state = window.AssetMasterModalManager.state;
    return assets.map((asset, idx) => {
        // Look up readable names using the Maps defined in asset-master.js
        const typeName = state.assetTypesMap.get(Number(asset.assetTypesId)) || 'N/A';
        const statusText = ASSET_STATUS_MAP[asset.assetStatus] || 'N/A';
        const approveText = APPROVE_STATUS_MAP[asset.approveStatus] || 'N/A';
        
        return `
            <tr>
                <td class="text-center">${idx + 1}</td>
                <td>${asset.assetName || ''}</td>
                <td>${typeName}</td>
                <td class="text-right">${asset.qty || 0}</td>
                <td class="text-center">${formatDate(asset.acquisitionDate)}</td>
                <td class="text-right">${formatCurrency(asset.totalCost)}</td>
                <td>${statusText}</td>
                <td class="text-right">${formatCurrency(asset.openingBalance)}</td>
                <td>${approveText}</td>
            </tr>`;
    }).join('');
}