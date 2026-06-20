/**
 * Dedicated Picker for flat lists (Asset Types, Locations, etc.)
 * This prevents hijacking the global AccountPicker.
 * Defined globally so it can be accessed from other screens like Asset Master's Audit Modal.
 */
window.GenericListPicker = {
    data: { items: [], loaded: false },
    config: { title: "Select Item", onSelect: null },

    async ensureData(opts) {
        try {
            const resp = await apiFetch(opts.endpoint, { method: "GET" });
            const dataArray = resp[opts.responseKey] || resp.data || resp.items || [];
            if (resp && resp.success) {
                this.data.items = dataArray.map(item => ({
                    id: item[opts.idKey] || item.id,
                    name: item[opts.nameKey] || item.name || "N/A",
                    raw: item // Preserve original object for detailed updates
                }));
                this.data.loaded = true;
            }
        } catch (e) {
            console.error(`GenericListPicker Error:`, e);
            showAlert(`Failed to load ${opts.title} data.`, 'error');
        }
    },

    open(opts) {
        this.config = { ...this.config, ...opts };
        this.data.loaded = false; // Always refresh to ensure latest data
        this.ensureData(opts).then(() => this.renderModal());
    },

    close() {
        const el = document.getElementById("GLOBAL_GENERIC_LIST_PICKER");
        if (el) el.style.display = "none";
    },

    renderModal() {
        let el = document.getElementById("GLOBAL_GENERIC_LIST_PICKER");
        if (!el) {
            el = document.createElement("div");
            el.id = "GLOBAL_GENERIC_LIST_PICKER";
            el.style.cssText = "position:fixed; inset:0; background:rgba(0,0,0,.35); z-index:10006; display:none; align-items:center; justify-content:center;";
            el.innerHTML = `
                <div style="width:450px; max-width:90vw; height:500px; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,.3); display:flex; flex-direction:column;">
                    <div style="padding:12px; background:#2e3192; color:#fff; display:flex; justify-content:space-between; align-items:center;">
                        <b id="GLP_TITLE">Select</b>
                        <span style="cursor:pointer; font-size:20px;" onclick="GenericListPicker.close()">&times;</span>
                    </div>
                    <div style="padding:10px; border-bottom:1px solid #eee;">
                        <input id="GLP_SEARCH" placeholder="Search..." style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;">
                    </div>
                    <div id="GLP_LIST" style="flex:1; overflow:auto; padding:10px;"></div>
                </div>`;
            document.body.appendChild(el);
            document.getElementById("GLP_SEARCH").oninput = () => this.renderList();
        }
        document.getElementById("GLP_TITLE").textContent = this.config.title;
        document.getElementById("GLP_SEARCH").value = "";
        el.style.display = "flex";
        this.renderList();
        document.getElementById("GLP_SEARCH").focus();
    },

    renderList() {
        const list = document.getElementById("GLP_LIST");
        const inp = document.getElementById("GLP_SEARCH");
        const q = (inp ? inp.value : "").trim().toLowerCase();
        list.innerHTML = "";

        this.data.items.filter(it => it.name.toLowerCase().includes(q)).forEach(it => {
            const row = document.createElement("div");
            row.style.cssText = "padding:10px; border-bottom:1px solid #f5f5f5; cursor:pointer; font-size:13px;";
            row.innerHTML = `<b>${it.name}</b>`;
            row.onmouseenter = () => row.style.background = "rgba(0,0,0,0.04)";
            row.onmouseleave = () => row.style.background = "";
            row.onclick = () => {
                this.config.onSelect(it);
                this.close();
            };
            list.appendChild(row);
        });
    }
};

/**
 * Initializes the New Asset Modal (asset-new.html).
 * This function is called when asset-new.html is loaded.
 */
window.initAssetNew = function() {
    console.log("initAssetNew: Initializing New Asset Modal.");
    let currentEditingAssetId = null;

    // Initialize Draggability for the modal
    const modal = document.getElementById('MODAL_NewAsset');
    const header = document.getElementById('MODAL_NewAsset_Header');
    if (modal && header && typeof makeElementDraggable === 'function') {
        makeElementDraggable(modal, header);
    }

    // Navigation logic
    document.getElementById('BTN_CloseAssetModal')?.addEventListener('click', () => loadScreen('asset-master.html'));
    document.getElementById('BTN_CancelAssetModal')?.addEventListener('click', () => loadScreen('asset-master.html'));

    // Tab switching for main tabs
    document.querySelectorAll('#MODAL_NewAsset .asset-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const targetId = this.dataset.tabTarget;
            document.querySelectorAll('#MODAL_NewAsset .asset-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('#MODAL_NewAsset .asset-tab-content').forEach(c => c.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(targetId).classList.add('active');

            // Show/hide "Enter Asset Opening Balance" button based on active tab
            //const openBalanceBtn = document.getElementById('btn-open-balance');
            /*if (openBalanceBtn) {
                if (targetId === 'TAB_Financial') {
                    openBalanceBtn.style.display = 'inline-flex'; // Show button
                } else {
                    openBalanceBtn.style.display = 'none'; // Hide button
                }
            }*/
        });
    });

    // Sub-tab switching for Financial Schedule (Yearly/Monthly)
    document.querySelectorAll('#MODAL_NewAsset .fin-tab-schedule').forEach(tab => {
        tab.addEventListener('click', function() {
            const targetId = this.dataset.tabTarget; // Changed from 'target' to 'tab-target' for consistency
            document.querySelectorAll('#MODAL_NewAsset .fin-tab-schedule').forEach(t => t.classList.remove('active'));
            // Ensure all schedule content wraps are hidden first
            document.querySelectorAll('#MODAL_NewAsset .fin-schedule-content .fin-table-wrap').forEach(w => w.classList.remove('active'));
            
            this.classList.add('active');
            const targetEl = document.getElementById(targetId);
            if(targetEl) targetEl.classList.add('active');
        });
    });

    // Automatic current date setting for date inputs
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('new-asset-acquisition-date').value = today;
    document.getElementById('new-asset-depreciation-start-date').value = today;

    // --- Modification Mode Logic ---
    // This must be called after initial form setup and before event listeners are attached
    // to ensure fields are ready to be populated.
    const editingId = sessionStorage.getItem('editingAssetId');
    if (editingId) {
        currentEditingAssetId = editingId;
        sessionStorage.removeItem('editingAssetId'); // Use it once

        // Update UI for Modify mode
        const titleEl = document.querySelector('#MODAL_NewAsset_Header .asset-title');
        if (titleEl) titleEl.textContent = "Modify Asset Details";
        
        // Show the regenerate schedule checkbox only in modify mode
        const regenContainer = document.getElementById('regen-sch-container');
        if (regenContainer) regenContainer.style.display = 'flex';

        const validateBtn = document.getElementById('new-asset-validate-btn');
        if (validateBtn) validateBtn.innerHTML = 'Update Asset <i class="fa-solid fa-save"></i>';

        loadAssetDetails(currentEditingAssetId);
    }

    /**
     * Fetches asset details and populates the form.
     */
    async function loadAssetDetails(assetId) {
        try {
            const resp = await apiFetch(`/api/v1/fixedAssets/getAssetDetails/${assetId}`, { method: "GET" });
            if (resp && resp.success) {
                const data = resp.data;
                
                const toInputDate = (d) => {
                    if (!d) return "";
                    if (d.length === 8 && !d.includes("-")) return `${d.substring(0, 4)}-${d.substring(4, 6)}-${d.substring(6, 8)}`;
                    return d.split('T')[0];
                };

                // Ensure picker data is loaded before attempting lookups
                await Promise.all([
                    window.AssetMasterModalManager.state.assetTypesMap.size === 0 ? fetchAndRenderAssetTypes() : Promise.resolve(),
                    window.AssetMasterModalManager.state.locationsMap.size === 0 ? fetchAndRenderAssetLocations() : Promise.resolve(),
                    window.SupplierManager.data.loaded === false ? window.SupplierManager.ensureData() : Promise.resolve(),
                    window.AccountPicker.data.loaded === false ? window.AccountPicker.ensureData() : Promise.resolve()
                ]);

                // Set top form fields
                document.getElementById('new-asset-name').value = data.assetName || "";
                
                // Helper to populate pickers
                const setPicker = (id, coaId, name) => {
                    const el = document.getElementById(id);
                    if (el) { el.dataset.id = coaId ? String(coaId) : ""; el.value = name || ""; }
                };

                // Populate Asset Type
                const assetTypeName = window.AssetMasterModalManager.state.assetTypesMap.get(Number(data.assetTypesId));
                setPicker('new-asset-type', data.assetTypesId, assetTypeName || data.assetTypeName || "");
                // Populate Location
                const locationName = window.AssetMasterModalManager.state.locationsMap.get(Number(data.locationId));
                setPicker('new-asset-location', data.locationId, locationName || data.locationName || "");
                // Populate Supplier
                const supplier = window.SupplierManager.data.mapById.get(Number(data.vendorId));
                setPicker('new-asset-supplier', data.vendorId, supplier ? supplier.name : "");
                // Populate COA Accum Dep
                const accumDepAccount = window.AccountPicker.data.mapById.get(Number(data.coaIdAccumDep));
                setPicker('new-asset-accum-dep', data.coaIdAccumDep, accumDepAccount ? `${accumDepAccount.code} - ${accumDepAccount.name}` : "");
                // Populate COA Account Name
                const expenseAccount = window.AccountPicker.data.mapById.get(Number(data.chartOfAccountsId));
                setPicker('new-asset-account-name', data.chartOfAccountsId, expenseAccount ? `${expenseAccount.code} - ${expenseAccount.name}` : "");

                document.getElementById('new-asset-manufacturer').value = data.manufacturer || "";
                document.getElementById('new-asset-number').value = data.barcode || "";
                
                // Checkboxes
                document.getElementById('new-asset-single-entry').checked = data.singleEntry === 1;
                document.getElementById('new-asset-no-depreciate').checked = data.depreciableOrNot === 0;

                // General Info
                document.getElementById('new-asset-status').value = data.assetStatus || "1";
                document.getElementById('new-asset-model').value = data.modelNumber || "";
                document.getElementById('new-asset-serial').value = data.serialNumber || "";
                document.getElementById('new-asset-brand').value = data.brand || "";
                document.getElementById('new-asset-description').value = data.description || "";
                document.getElementById('new-asset-po-number').value = data.poNumber || "";
                document.getElementById('new-asset-warranty-end').value = toInputDate(data.warrantyDate);
                
                // Financial Info
                document.getElementById('new-asset-qty').value = data.qty;
                // Calculate originalCost if not directly provided but totalCost and qty are
                let originalCostToDisplay = data.originalCost;
                if ((!originalCostToDisplay || originalCostToDisplay === 0) && data.totalCost && data.qty && data.qty > 0) {
                    originalCostToDisplay = data.totalCost / data.qty;
                }
                document.getElementById('new-asset-original-cost').value = originalCostToDisplay || 0;
                // Total estimate will be recalculated by updateFinancialCalculations

                document.getElementById('new-asset-acquisition-date').value = toInputDate(data.acquisitionDate);
                document.getElementById('new-asset-depreciation-percent').value = data.depreciationRate || 0;
                // Handle depreciationMethod "0" from API to "Straight Line"
                document.getElementById('new-asset-depreciation-method').value = (data.depreciationMethod === "0" || !data.depreciationMethod) 
                    ? "Straight Line" : data.depreciationMethod;
                document.getElementById('new-asset-depreciation-start-date').value = toInputDate(data.depreciationStartDate);

                // Notes
                document.getElementById('new-asset-notes').value = data.additionalInfo || "";

                // Trigger visibility and calculations
                toggleDepreciationVisibility();
                updateFinancialCalculations();
            } else {
                showAlert(resp ? resp.message : "Failed to load asset details.", "error");
            }
        } catch (error) {
            console.error("loadAssetDetails Error:", error);
        }
    }

    // --- Depreciation Fields Visibility Toggle ---
    function toggleDepreciationVisibility() {
        const noDepreciateCheck = document.getElementById('new-asset-no-depreciate');
        if (!noDepreciateCheck) return;

        const isNotDepreciable = noDepreciateCheck.checked;
        const displayStyle = isNotDepreciable ? 'none' : 'block';

        // Target the schedule section and specific form rows
        const scheduleSection = document.querySelector('.asset-fin-bottom');
        const methodRow = document.getElementById('new-asset-depreciation-method')?.closest('.form-row');
        const percentRow = document.getElementById('new-asset-depreciation-percent')?.closest('.form-row');
        const startRow = document.getElementById('new-asset-depreciation-start-date')?.closest('.form-row');
        const cycleRow = document.getElementById('new-asset-life-cycle')?.closest('.form-row');

        if (scheduleSection) scheduleSection.style.display = displayStyle;
        if (methodRow) methodRow.style.display = displayStyle;
        if (percentRow) percentRow.style.display = displayStyle;
        if (startRow) startRow.style.display = displayStyle;
        if (cycleRow) cycleRow.style.display = displayStyle;
    }

    document.getElementById('new-asset-no-depreciate')?.addEventListener('change', toggleDepreciationVisibility);
    toggleDepreciationVisibility(); // Initialize on load

    // Picker Event Listeners
    document.getElementById('new-asset-type').addEventListener('click', () => {
        GenericListPicker.open({
            title: "Select Asset Type",
            endpoint: "/api/v1/fixedAssets/types/getAssetTypes",
            responseKey: "data", 
            idKey: "assetTypeId",
            nameKey: "name", 
            onSelect: (type) => {
                document.getElementById('new-asset-type').value = type.name;
                document.getElementById('new-asset-type').dataset.id = type.id;
            }
        });
    });

    document.getElementById('new-asset-location').addEventListener('click', () => {
        GenericListPicker.open({
            title: "Select Asset Location",
            endpoint: "/api/v1/fixedAssets/locations/getLocations",
            responseKey: "data", 
            idKey: "locationId",
            nameKey: "name", 
            onSelect: (location) => {
                document.getElementById('new-asset-location').value = location.name;
                document.getElementById('new-asset-location').dataset.id = location.id;
            }
        });
    });

    document.getElementById('new-asset-supplier').addEventListener('click', () => {
        if (window.SupplierPicker) {
            window.SupplierPicker.open({
                onSelect: (supplier) => {
                    document.getElementById('new-asset-supplier').value = supplier.name;
                    document.getElementById('new-asset-supplier').dataset.id = supplier.id;
                }
            });
        }
    });

    // --- Financial Tab Account Pickers ---
    // Acc. Code field in General Info is now a raw input, no picker.

    document.getElementById('new-asset-accum-dep').addEventListener('click', () => {
        if (window.AccountPicker) {
            window.AccountPicker.open({
                title: "Select Accumulated Depreciation Account",
                targetClasses: ["CLASS 2"],
                onSelect: (account) => {
                    document.getElementById('new-asset-accum-dep').value = `${account.code} - ${account.name}`;
                    document.getElementById('new-asset-accum-dep').dataset.id = account.id;
                }
            });
        }
    });

    document.getElementById('new-asset-account-name').addEventListener('click', () => {
        if (window.AccountPicker) {
            window.AccountPicker.open({
                title: "Select Expense Account",
                targetClasses: ["CLASS 6"],
                onSelect: (account) => {
                    document.getElementById('new-asset-account-name').value = `${account.code} - ${account.name}`;
                    document.getElementById('new-asset-account-name').dataset.id = account.id;
                }
            });
        }
    });

    // --- Real-time Financial Calculations ---

    function updateFinancialCalculations() {
        const qty = parseFloat(document.getElementById('new-asset-qty').value) || 0;
        const cost = parseFloat(document.getElementById('new-asset-original-cost').value) || 0;
        const depRate = parseFloat(document.getElementById('new-asset-depreciation-percent').value) || 0;

        // 1. Calculate Total Estimate
        const total = qty * cost; // Total Estimate = Qty * Original Cost
        document.getElementById('new-asset-total-estimate').value = total.toLocaleString('en-US') + " FCFA";

        // 2. Calculate Life Cycle (100 / Depreciation %)
        const lifeCycle = depRate > 0 ? (100 / depRate) : 0;
        document.getElementById('new-asset-life-cycle').value = Number.isInteger(lifeCycle) ? lifeCycle : lifeCycle.toFixed(2);
    }

    // Attach listeners for calculations
    const calcInputs = ['new-asset-qty', 'new-asset-original-cost', 'new-asset-depreciation-percent'];
    calcInputs.forEach(id => {
        document.getElementById(id)?.addEventListener('input', updateFinancialCalculations);
    });

    // Initial calculation check
    updateFinancialCalculations();

    // --- Asset Creation (Validate Button) ---
    document.getElementById('new-asset-validate-btn')?.addEventListener('click', handleValidateAsset);

    async function handleValidateAsset() {
        // 1. Gather all form data
        const assetName = document.getElementById('new-asset-name').value.trim();
        const assetTypesId = document.getElementById('new-asset-type').dataset.id; // From picker
        const locationId = document.getElementById('new-asset-location').dataset.id;
        const vendorId = document.getElementById('new-asset-supplier').dataset.id;
        const chartOfAccountsId = document.getElementById('new-asset-account-name').dataset.id;
        const coaIdAccumDep = document.getElementById('new-asset-accum-dep').dataset.id;
        const brand = document.getElementById('new-asset-brand').value.trim();
        const manufacturer = document.getElementById('new-asset-manufacturer').value.trim();
        const modelNumber = document.getElementById('new-asset-model').value.trim();
        const serialNumber = document.getElementById('new-asset-serial').value.trim();
        const description = document.getElementById('new-asset-description').value.trim();
        const poNumber = document.getElementById('new-asset-po-number').value.trim();
        const additionalInfo = document.getElementById('new-asset-notes').value.trim();
        const qty = parseFloat(document.getElementById('new-asset-qty').value) || 0;
        const originalCost = parseFloat(document.getElementById('new-asset-original-cost').value) || 0;
        const totalCostRaw = document.getElementById('new-asset-total-estimate').value || "0";
        const totalCost = parseFloat(totalCostRaw.replace(/[^0-9.-]+/g, '')) || 0; 
        const barcode = document.getElementById('new-asset-number').value.trim();
        const depreciationRate = parseFloat(document.getElementById('new-asset-depreciation-percent').value) || 0;
        const depreciationMethod = document.getElementById('new-asset-depreciation-method').value;
        const depreciationStartDate = document.getElementById('new-asset-depreciation-start-date').value;
        const acquisitionDate = document.getElementById('new-asset-acquisition-date').value;
        const warrantyDate = document.getElementById('new-asset-warranty-end').value;
        const assetStatus = parseInt(document.getElementById('new-asset-status').value) || 0;
        const depreciableOrNot = document.getElementById('new-asset-no-depreciate').checked ? 0 : 1; // Per user: checked sends 0
        const singleEntry = document.getElementById('new-asset-single-entry').checked ? 1 : 0; // Checked sends 1
        const openingBalance = totalCost; // As per requirement
        const openingBalanceDate = acquisitionDate; // As per requirement

        // 2. Basic Validation
        if (!assetName) { showAlert("Asset Name is required.", "error"); return; }
        if (!assetTypesId) { showAlert("Asset Type is required.", "error"); return; }
        if (!locationId) { showAlert("Location is required. Please select from the picker.", "error"); return; }
        if (qty <= 0) { showAlert("Quantity must be greater than 0.", "error"); return; }
        if (totalCost <= 0) { showAlert("Total Cost must be greater than 0.", "error"); return; }
        if (!acquisitionDate) { showAlert("Acquisition Date is required.", "error"); return; }
        // 3. Construct Payload
        const payload = {
            assetName,
            assetTypesId: parseInt(assetTypesId),
            locationId: parseInt(locationId),
            vendorId: vendorId ? parseInt(vendorId) : null,
            chartOfAccountsId: chartOfAccountsId ? parseInt(chartOfAccountsId) : null,
            coaIdAccumDep: coaIdAccumDep ? parseInt(coaIdAccumDep) : null,
            brand,
            barcode,
            manufacturer,
            modelNumber, // Raw input
            serialNumber,
            description,
            poNumber,
            additionalInfo,
            qty,
            originalCost,
            totalCost,
            openingBalance,
            depreciationRate,
            depreciationMethod,
            depreciationStartDate,
            acquisitionDate, // Raw input
            warrantyDate,
            assetStatus,
            depreciableOrNot,
            singleEntry,
            openingBalanceDate
        };

        // Completely remove depreciation keys from payload if asset is not depreciable
        if (depreciableOrNot === 0) {
            delete payload.depreciationRate;
            delete payload.depreciationMethod;
            delete payload.depreciationStartDate;
            delete payload.coaIdAccumDep; // Also remove these if not depreciable
        }

        // 4. Send to API
        const validateBtn = document.getElementById('new-asset-validate-btn');
        const originalBtnText = validateBtn.innerHTML;

                // Map the regenerateSchedule value from the UI checkbox if in edit mode
        if (currentEditingAssetId) {
            const regenCheck = document.getElementById('new-asset-regenerate-sch');
            payload.regenerateSchedule = regenCheck && regenCheck.checked ? 1 : 0;
        }

        sendAssetRequest(payload, currentEditingAssetId, validateBtn, originalBtnText);
    }

    async function sendAssetRequest(payload, assetId, btn, originalBtnText) {
        const endpoint = assetId ? `/api/v1/fixedAssets/updateAsset/${assetId}` : "/api/v1/fixedAssets/addAsset";
        const method = assetId ? "PUT" : "POST";

        // Log the final payload as requested to verify the sent data
        console.log(`[API Request] Method: ${method}, Endpoint: ${endpoint}, Payload:`, payload);

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${assetId ? 'Updating...' : 'Creating...'}`;
        }

        try {
            const resp = await apiFetch(endpoint, { method, body: payload });

            if (resp && resp.success) {
                showAlert(resp.message || `Asset ${assetId ? 'updated' : 'created'} successfully!`, "success");
                resetNewAssetModal(); // Clear form and reset view without closing
                // Refresh the asset master list if it's open behind this modal
                if (window.initAssetMaster) window.initAssetMaster();
            } else {
                showAlert(resp ? resp.message : `Failed to ${assetId ? 'update' : 'create'} asset.`, "error");
            }

        } catch (error) {
            console.error("sendAssetRequest Error:", error);
            showAlert("An error occurred.", "error");
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = originalBtnText;
            }
        }
    }

    function resetNewAssetModal() {
        // Clear all input fields
        document.getElementById('new-asset-name').value = '';
        document.getElementById('new-asset-type').value = '';
        document.getElementById('new-asset-type').dataset.id = '';
        document.getElementById('new-asset-location').value = '';
        document.getElementById('new-asset-location').dataset.id = '';
        document.getElementById('new-asset-manufacturer').value = '';
        document.getElementById('new-asset-number').value = 'ASS00 /29'; // Default value
        document.querySelector('input[name="num_mode"][value="automatic"]').checked = true;
        document.getElementById('new-asset-single-entry').checked = false;
        document.getElementById('new-asset-no-depreciate').checked = false;
        document.getElementById('new-asset-status').value = '1'; // Default to In Use
        document.getElementById('new-asset-brand').value = '';
        document.getElementById('new-asset-model').value = '';
        document.getElementById('new-asset-serial').value = '';
        document.getElementById('new-asset-description').value = '';
        document.getElementById('new-asset-po-number').value = '';
        document.getElementById('new-asset-supplier').value = '';
        document.getElementById('new-asset-supplier').dataset.id = '';
        document.getElementById('new-asset-warranty-end').value = '';
        document.getElementById('new-asset-qty').value = '1';
        document.getElementById('new-asset-original-cost').value = '0';
        document.getElementById('new-asset-total-estimate').value = '0 FCFA';
        document.getElementById('new-asset-acquisition-date').value = today;
        document.getElementById('new-asset-depreciation-percent').value = '0.0';
        document.getElementById('new-asset-life-cycle').value = '0';
        document.getElementById('new-asset-accum-dep').value = '';
        document.getElementById('new-asset-accum-dep').dataset.id = '';
        document.getElementById('new-asset-account-name').value = '';
        document.getElementById('new-asset-account-name').dataset.id = '';
        document.getElementById('new-asset-depreciation-method').value = 'Straight Line';
        document.getElementById('new-asset-depreciation-start-date').value = today;
        document.getElementById('new-asset-notes').value = '';

        // Revert UI to 'New' mode
        currentEditingAssetId = null;
        const titleEl = document.querySelector('#MODAL_NewAsset_Header .asset-title');
        if (titleEl) titleEl.textContent = "Creating a New Asset";
        
        // Hide and reset the regenerate checkbox
        const regenContainer = document.getElementById('regen-sch-container');
        if (regenContainer) regenContainer.style.display = 'none';
        const regenCheck = document.getElementById('new-asset-regenerate-sch');
        if (regenCheck) regenCheck.checked = false;

        document.getElementById('new-asset-validate-btn').innerHTML = 'Validate <i class="fa-solid fa-circle-check"></i>';

        // Ensure fields are visible again
        toggleDepreciationVisibility();

        // Reset financial calculations display
        updateFinancialCalculations();
        // Clear depreciation tables
        document.querySelector('#schedule-yearly tbody').innerHTML = '<tr><td></td><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>';
        document.querySelector('#schedule-monthly tbody').innerHTML = '<tr><td></td><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>';

        // Switch back to General Info tab
        const generalTabBtn = document.querySelector('#MODAL_NewAsset .asset-tab[data-tab-target="TAB_General"]');
        if (generalTabBtn) {
            generalTabBtn.click(); // Simulate click to activate tab
        }
    }

    // --- Depreciation Schedule Generation ---

    const getScheduleLink = document.querySelector('#MODAL_NewAsset .fin-link');
    if (getScheduleLink) {
        getScheduleLink.addEventListener('click', async (e) => {
            e.preventDefault();

            // 1. Fetch values for payload
            const totalRaw = document.getElementById('new-asset-total-estimate').value || "0";
            const assetAmount = parseFloat(totalRaw.replace(/[^0-9.]/g, '')) || 0;
            const depreciationStartDate = document.getElementById('new-asset-depreciation-start-date').value;
            const depreciationRate = parseFloat(document.getElementById('new-asset-depreciation-percent').value) || 0;

            // 2. Validation
            if (assetAmount <= 0) { showAlert("Total Estimate is required to generate schedule.", "error"); return; }
            if (!depreciationStartDate) { showAlert("Depreciation Start Date is required.", "error"); return; }
            if (depreciationRate <= 0) { showAlert("Depreciation Rate is required.", "error"); return; }

            const payload = { assetAmount, depreciationStartDate, depreciationRate };

            try {
                const resp = await apiFetch("/api/v1/fixedAssets/depreciation/generateDepreciationSchedule", {
                    method: "POST",
                    body: payload
                });

                if (resp && resp.success) {
                    showAlert(resp.message, "success");
                    renderDepreciationTables(resp.data);
                } else {
                    showAlert(resp ? resp.message : "Failed to generate schedule.", "error");
                }
            } catch (error) {
                console.error("generateDepreciationSchedule Error:", error);
                showAlert("An error occurred while generating the schedule.", "error");
            }
        });
    }

    function renderDepreciationTables(data) {
        const yearlyTbody = document.querySelector('#schedule-yearly tbody');
        const monthlyTbody = document.querySelector('#schedule-monthly tbody');

        if (yearlyTbody && data.yearlySchedule) {
            yearlyTbody.innerHTML = data.yearlySchedule.map(row => {
                const d = new Date(row.year);
                const yearDisplay = isNaN(d.getTime()) ? row.year : d.getFullYear();
                return `
                <tr>
                    <td>${row.no}</td>
                    <td>${yearDisplay}</td>
                    <td style="text-align:right">${Number(row.startBookValue).toLocaleString()}</td>
                    <td style="text-align:right">${Number(row.depreciation).toLocaleString()}</td>
                    <td style="text-align:right">${Number(row.accDepreciation).toLocaleString()}</td>
                    <td style="text-align:right">${Number(row.endBookValue).toLocaleString()}</td>
                </tr>
            `}).join('');
        }

        if (monthlyTbody && data.monthlySchedule) {
            monthlyTbody.innerHTML = data.monthlySchedule.map(row => {
                const d = new Date(row.monthDate);
                let monthYearDisplay = row.monthDate;
                if (!isNaN(d.getTime())) {
                    const monthName = d.toLocaleString('en-US', { month: 'long' });
                    monthYearDisplay = `${monthName}, ${d.getFullYear()}`;
                }
                return `
                <tr>
                    <td>${row.no}</td>
                    <td>${monthYearDisplay}</td>
                    <td style="text-align:right">${Number(row.startBookValue).toLocaleString()}</td>
                    <td style="text-align:right">${Number(row.depreciation).toLocaleString()}</td>
                    <td style="text-align:right">${Number(row.accDepreciation).toLocaleString()}</td>
                    <td style="text-align:right">${Number(row.endBookValue).toLocaleString()}</td>
                </tr>
            `}).join('');
        }
    }
};

// Ensure initAssetNew is called when the DOM is ready and this script is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if the modal element exists, indicating we are on the asset-new screen
    if (document.getElementById('MODAL_NewAsset')) {
        window.initAssetNew();
    }
});
