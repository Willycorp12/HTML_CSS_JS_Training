/**
 * Asset In & Out Manager
 * Handles Check-In and Check-Out workflows with full picker integration.
 */

/**
 * Injects global button styles if not already present.
 */
function injectAssetInOutButtonStyles() {
    if (document.getElementById('global-wd-btn-styles')) return;
    const style = document.createElement('style');
    style.id = 'global-wd-btn-styles';
    style.innerHTML = `
        .wd-btn { padding: 6px 12px; border: 1px solid #bbb; background: linear-gradient(#ffffff, #e9e9e9); cursor: pointer; font-size: 12px; display: inline-flex; align-items: center; gap: 6px; justify-content: center; border-radius: 4px; }
            .wd-btn:hover { background: linear-gradient(#f8f8f8, #dcdcdc);opacity: 0.9; }
            .wd-btn.primary { border-color: #2e3192; color: #2e3192; font-weight: bold; background: #fff; }
            .wd-btn.danger { border-color: #cd2027; color: #cd2027; font-weight: bold; background: #fff; }
            
        /* Row selection style */
        .wd-table tbody tr.selected td { background-color: #cd2027 !important; color: #fff !important; cursor: pointer; }
        .wd-table tbody tr.selected td .black-link { color: #fff !important; }
        .wd-table tbody tr.row-highlight-red td { background-color: #cd2027 !important; color: #fff !important; }
    `;
    document.head.appendChild(style);
}

function applyAssetInOutButtonStyles() {
    const buttons = document.querySelectorAll('.asset-modal-box button:not(.wd-btn)');
    buttons.forEach(btn => {
        btn.classList.add('wd-btn');
        if (!btn.classList.contains('danger') && !btn.classList.contains('primary')) {
            btn.classList.add('primary');
        }
    });
}

window.initAssetIn = async function() {
    console.log("initAssetIn: Initializing Check-In Logic...");
    injectAssetInOutButtonStyles();

    const state = {
        currentAssets: []
    };

    const btnCheckIn = document.getElementById('btn-do-checkin');
    const personSelect = document.getElementById('in-select-person');
    const inComments = document.getElementById('in-comments');
    const tbody = document.querySelector('#TABLE_AssetIn tbody');

    // Cancel button listener
    const btnCancel = document.getElementById('btn-cancel-checkin');
    if (btnCancel) {
        btnCancel.addEventListener('click', () => {
            loadScreen('asset-master.html');
        });
    }

    if (personSelect) {
        personSelect.addEventListener('change', async () => {
            const personnelId = personSelect.value;
            const numericPersonnelId = Number(personnelId);

            if (!personnelId || isNaN(numericPersonnelId) || numericPersonnelId <= 0) { 
                if (tbody) {
                    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 20px; color: #777;">Please select a valid personnel to see checked-out assets.</td></tr>';
                }
                state.currentAssets = []; // Clear current assets if selection is invalid
                return;
            }
            
            if (inComments) inComments.value = '';
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 20px; color: #2e3192;">Refreshing checked-out records...</td></tr>';

            try {
                const resp = await apiFetch("/api/v1/fixedAssets/reports/getCheckOutAssetsByPersonnelId", {
                    method: "POST",
                    body: { personnelId: numericPersonnelId } 
                });

                if (resp && resp.success && Array.isArray(resp.data)) {
                    state.currentAssets = resp.data;
                    showAlert(resp.message, "success");
                    renderCheckInTable(state.currentAssets);
                } else {
                    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px; color: #777;">${resp?.message || 'No assets found for this person.'}</td></tr>`;
                }
            } catch (e) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red; padding: 20px;">Failed to fetch current status: ${e.message || e}.</td></tr>`;
            }
        });

        personSelect.dispatchEvent(new Event('change'));
    }

    function renderCheckInTable(assets) {
        tbody.innerHTML = '';

        assets.forEach((asset, idx) => {
            const tr = document.createElement('tr');
            tr.dataset.id = asset.checkOutId;
            // Store locationName for dynamic footer replacement
            tr.dataset.location = asset.locationName || "N/A";
            tr.dataset.statusNum = asset.status;

            tr.innerHTML = `
                <td style="text-align:center;"><input type="checkbox" class="row-checkbox" value="${asset.checkOutId}"></td>
                <td style="text-align:center;">${idx + 1}</td>
                <td>${asset.assetName || ''}</td>
                <td>${asset.checkoutDate || ''}</td>
                <td>${asset.dueDate || ''}</td>
                <td>${asset.personnelName || ''}</td>
                <td style="text-align:center;">${asset.status}</td>
            `;
            tbody.appendChild(tr);
        });

        // Add filler rows
        for (let i = assets.length; i < 10; i++) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td></td><td></td><td></td><td></td><td></td><td></td><td></td>';
            tbody.appendChild(tr);
        }
    }

    if (tbody) {
        tbody.addEventListener('click', (e) => {
            const tr = e.target.closest('tr');
            if (!tr || !tr.cells[1] || tr.cells[1].textContent.trim() === "") return;

            // Row selection highlighting
            tbody.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
            tr.classList.add('selected');

            // Dynamic Footer Replacement (Location and Status)
            const locLink = document.getElementById('IN_LocationLink');
            const statLink = document.getElementById('IN_StatusLink');
            
            if (locLink) locLink.textContent = tr.dataset.location;
            if (statLink) statLink.textContent = tr.dataset.statusNum;
        });
    }

    if (btnCheckIn) {
        btnCheckIn.onclick = async () => {
            const checkOutIds = Array.from(tbody.querySelectorAll('.row-checkbox:checked')).map(cb => Number(cb.value));
            const comments = inComments?.value.trim() || "";

            if (checkOutIds.length === 0) {
                showAlert("Please select at least one asset to check-in.", "error");
                return;
            }

            try {
                const resp = await apiFetch("/api/v1/fixedAssets/checkInAssets", {
                    method: "PUT", // Endpoint uses PUT
                    body: { checkOutIds, comments }
                });

                if (resp && resp.success) {
                    showAlert(resp.message, "success");
                    personSelect.dispatchEvent(new Event('change')); // Refresh table records
                } else {
                    showAlert(resp ? resp.message : "Check-in failed.", "error");
                }
            } catch (e) {
                console.error("Check-In Error:", e);
                showAlert("An error occurred during check-in.", "error");
            }
        };
    }

    applyAssetInOutButtonStyles();
};

window.initAssetOut = function() {
    console.log("initAssetOut: Initializing Check-Out Logic...");
    injectAssetInOutButtonStyles();

    const state = {
        selectedAssets: []
    };

    const btnCheckOut = document.getElementById('btn-do-checkout');
    const btnCancel = document.getElementById('btn-cancel-checkout');
    const assetSearch = document.getElementById('out-asset-search');
    const outComments = document.getElementById('out-comments');
    const dueDateInput = document.getElementById('out-due-date');
    const tbody = document.querySelector('#TABLE_AssetOut tbody');

    if (dueDateInput) {
        dueDateInput.value = new Date().toISOString().split('T')[0];
    }

    // --- 1. Picker: Add Assets to Table ---
    if (assetSearch) {
        assetSearch.addEventListener('click', () => {
            console.log("initAssetOut: Opening Picker...");
            if (!window.GenericListPicker) return;
            
            window.GenericListPicker.open({
                title: "Choose Asset",
                endpoint: "/api/v1/fixedAssets/getAssets",
                responseKey: "data", // The API returns assets in the 'data' key
                idKey: "assetId",
                nameKey: "assetName",
                onSelect: (item) => {
                    // item.id is mapped from raw.assetId by the picker
                    if (state.selectedAssets.some(a => Number(a.assetId) === Number(item.id))) { 
                        showAlert("Asset is already in the list.", "error"); 
                        return;
                    }
                    state.selectedAssets.push(item.raw);
                    renderCheckoutTable(); 
                }
            });
        });
    }

    function renderCheckoutTable() {
        if (!tbody) return;
        tbody.innerHTML = '';

        state.selectedAssets.forEach((asset, idx) => {
            const tr = document.createElement('tr');
            if (idx === state.selectedAssets.length - 1) tr.className = 'row-highlight-red';

            tr.innerHTML = `
                <td>${asset.assetId}</td>
                <td>${asset.assetName}</td>
                <td style="padding: 0; text-align: center;">
                    <button class="wd-btn danger delete-asset-btn" data-id="${asset.assetId}" style="width: 100%; border: none; border-radius: 0; font-weight: bold; height: 32px;">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Add filler rows
        for (let i = state.selectedAssets.length; i < 3; i++) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td></td><td></td><td></td>';
            tbody.appendChild(tr);
        }

        applyAssetInOutButtonStyles();
    }

    // --- 2. Table Event Delegation (Selection & Delete) ---
    if (tbody) {
        tbody.addEventListener('click', (e) => {
            const delBtn = e.target.closest('.delete-asset-btn');
            if (delBtn) { 
                const id = Number(delBtn.dataset.id);
                state.selectedAssets = state.selectedAssets.filter(a => Number(a.assetId) !== id);
                renderCheckoutTable();
                return;
            }

            const tr = e.target.closest('tr');
            if (!tr || !tr.cells[0] || tr.cells[0].textContent.trim() === "") return;
            
            tbody.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
            tr.classList.add('selected');
        });
    }

    // --- 3. Action: Process Check-Out (POST) ---
    if (btnCheckOut) {
        btnCheckOut.addEventListener('click', async () => {
            const personnelId = Number(document.getElementById('out-select-person')?.value);
            console.log("Peronnel ID for Check-Out:", personnelId);
            const dueDate = dueDateInput ? dueDateInput.value : "";
            const comments = outComments ? outComments.value.trim() : "";
            const assetIds = state.selectedAssets.map(a => Number(a.assetId));

            if (assetIds.length === 0) { showAlert("Please select at least one asset.", "error"); return; }
            if (!dueDate) { showAlert("Please select a due date.", "error"); return; }

            const payload = { personnelId, dueDate, comments, assetIds };
            console.log("Check-Out Payload:", payload);

            btnCheckOut.disabled = true;
            const btnHtml = btnCheckOut.innerHTML;
            btnCheckOut.innerHTML = 'Validating... <i class="fa-solid fa-spinner fa-spin"></i>';

            try {
                const resp = await apiFetch("/api/v1/fixedAssets/checkOutAssets", {
                    method: "POST",
                    body: payload
                });

                if (resp && resp.success) {
                    showAlert(resp.message, "success");
                    state.selectedAssets = []; // Reset locally
                    renderCheckoutTable();
                    if (outComments) outComments.value = '';
                } else { showAlert(resp?.message || "Operation failed", "error"); }
            } catch (e) {
                console.error("Check-Out Error:", e);
                showAlert("An error occurred during check-out.", "error");
            } finally { 
                btnCheckOut.disabled = false; 
                btnCheckOut.innerHTML = btnHtml; 
            }
        });
    }

    if (btnCancel) {
        btnCancel.addEventListener('click', () => loadScreen('asset-master.html'));
    }

    renderCheckoutTable();
    applyAssetInOutButtonStyles();
};
