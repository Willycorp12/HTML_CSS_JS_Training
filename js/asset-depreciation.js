/**
 * Initializes the Asset Depreciation screen.
 * This function is called when asset-depreciation.html is loaded.
 */
window.initAssetDepreciation = function() {
    console.log("initAssetDepreciation: Initializing Asset Depreciation screen.");

    // --- DOM Elements ---
    const dateInput = document.querySelector('.asset-report-toolbar input[type="date"]');
    const depreciateNowBtn = document.getElementById('btn-depreciate-now');
    const tbody = document.querySelector('.asset-report-table tbody');
    const totalDepreciationExpenseEl = document.getElementById('total-depreciation-expense-value');
    const selectAllCheckbox = document.querySelector('.select-all-depreciation');

    // --- Internal State ---
    let assetMap = new Map();

    /**
     * Injects global button styles if they haven't been loaded yet.
     */
    function injectStyles() {
        if (document.getElementById('global-wd-btn-styles')) return;
        const style = document.createElement('style');
        style.id = 'global-wd-btn-styles';
        style.innerHTML = `
            .wd-btn { padding: 6px 12px; border: 1px solid #bbb; background: linear-gradient(#ffffff, #e9e9e9); cursor: pointer; font-size: 12px; display: inline-flex; align-items: center; gap: 6px; justify-content: center; border-radius: 4px; }
            .wd-btn:hover { background: linear-gradient(#f8f8f8, #dcdcdc);opacity: 0.9; }
            .wd-btn.primary { border-color: #2e3192; color: #2e3192; font-weight: bold; }
            .wd-btn.danger { border-color: #cd2027; color: #cd2027; font-weight: bold; }
            
            /* WinDev-style row selection */
            .wd-table tbody tr.selected td { background-color: #cd2027 !important; color: #fff !important; }
            .wd-table tbody tr.selected td input[type="checkbox"] { outline: 1px solid #fff; }
        `;
        document.head.appendChild(style);
    }

    function formatCurrency(val) {
        return Number(val || 0).toLocaleString('en-US');
    }

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // --- Initialization ---
    injectStyles();

    // Default to today's date as requested
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }

    /**
     * Fetches all assets to build a lookup map for names.
     */
    async function fetchAssets() {
        try {
            const resp = await apiFetch("/api/v1/fixedAssets/getAssets", { method: "GET" });
            if (resp && resp.success && Array.isArray(resp.data)) {
                resp.data.forEach(a => assetMap.set(Number(a.assetId), a.assetName));
            }
        } catch (e) { console.error("fetchAssets Error:", e); }
    }

    /**
     * Fetches depreciation data from API.
     */
    async function fetchMonthlyDepreciation(date) {
        if (!date) return;
        try {
            const resp = await apiFetch(`/api/v1/fixedAssets/depreciation/getMonthlyDepreciations/${date}`, { method: "GET" });
            if (resp && resp.success) {
                showAlert(resp.message, 'success');
                renderDepreciationTable(resp);
            } else {
                showAlert(resp ? resp.message : "Failed to load records.", 'error');
                renderDepreciationTable({ data: [], totalDepreciation: 0 });
            }
        } catch (e) {
            console.error("fetchMonthlyDepreciation Error:", e);
            showAlert("An error occurred while fetching depreciations.", 'error');
        }
    }

    // --- Render Depreciation Table ---
    function renderDepreciationTable(apiResponse) {
        if (!tbody) return;
        const records = apiResponse.data || [];
        const monthStr = monthNames[apiResponse.month - 1] || "";
        const yearStr = apiResponse.year || "";
        const monthFormatted = `${monthStr}, ${yearStr}`;

        tbody.innerHTML = ''; 
        const MIN_ROWS = 10;

        records.forEach((item, idx) => {
            const assetName = assetMap.get(Number(item.assetId)) || `Asset #${item.assetId}`;
            const isApplied = item.status === 'Applied';
            const tr = document.createElement('tr');
            tr.dataset.id = item.depreciationScheduleId;
            
            tr.innerHTML = `
                <td><input type="checkbox" class="depreciation-checkbox" value="${item.depreciationScheduleId}" ${isApplied ? 'disabled' : 'checked'}></td>
                <td>${item.status}</td>
                <td>${item.no}</td>
                <td>${assetName}</td>
                <td>${monthFormatted}</td>
                <td style="text-align: right;">${formatCurrency(item.startBookValue)}</td>
                <td class="dep-expense-value" style="text-align: right;">${formatCurrency(item.depreciation)}</td>
                <td style="text-align: right;">${formatCurrency(item.accumDep)}</td>
                <td style="text-align: right;">${formatCurrency(item.endBookValue)}</td>
            `;
            
            // WinDev-style row selection
            tr.addEventListener('click', (e) => {
                if (e.target.type === 'checkbox') return;
                tbody.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
                tr.classList.add('selected');
            });

            tbody.appendChild(tr);
        });

        // Add filler rows
       for (let i = records.length; i < MIN_ROWS; i++) {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td></td><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>`;
            tbody.appendChild(tr);
        }

        // Update Footer directly from API response
        if (totalDepreciationExpenseEl) {
            totalDepreciationExpenseEl.textContent = formatCurrency(apiResponse.totalDepreciation) + " FCFA";
        }

        // Reset "Select All" state
        if (selectAllCheckbox) {
            const selectable = records.filter(r => r.status !== 'Applied');
            selectAllCheckbox.checked = selectable.length > 0;
            selectAllCheckbox.indeterminate = false;
        }
    }

    // --- Select All Logic ---
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', () => {
            const isChecked = selectAllCheckbox.checked;
            tbody.querySelectorAll('.depreciation-checkbox:not(:disabled)').forEach(cb => cb.checked = isChecked);
        });
    }

    // Monitor row checkboxes to update header checkbox state
    tbody.addEventListener('change', (e) => {
        if (e.target.classList.contains('depreciation-checkbox')) {
            const checkboxes = Array.from(tbody.querySelectorAll('.depreciation-checkbox:not(:disabled)'));
            const checkedCount = checkboxes.filter(cb => cb.checked).length;

            if (selectAllCheckbox) {
                selectAllCheckbox.checked = checkboxes.length > 0 && checkedCount === checkboxes.length;
                selectAllCheckbox.indeterminate = checkedCount > 0 && checkedCount < checkboxes.length;
            }
        }
    });

    // --- Event Listeners ---
    if (dateInput) {
        dateInput.addEventListener('change', () => {
            fetchMonthlyDepreciation(dateInput.value);
        });
    }

    // --- Event Listener for Depreciate Now Button ---
    if (depreciateNowBtn) {
        depreciateNowBtn.addEventListener('click', async () => {
            const date = dateInput.value;
            const checkedBoxes = Array.from(tbody.querySelectorAll('.depreciation-checkbox:checked'));
            
            if (checkedBoxes.length === 0) {
                showAlert("Please select at least one record to depreciate.", "error");
                return;
            }

            // Gather the IDs from the checked rows
            const scheduleIds = checkedBoxes.map(cb => Number(cb.value));
            const payload = {
                depreciationDate: date,
                scheduleIds: scheduleIds
            };

            // UI feedback: loading state
            const originalBtnText = depreciateNowBtn.innerHTML;
            depreciateNowBtn.disabled = true;
            depreciateNowBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';

            try {
                const resp = await apiFetch("/api/v1/fixedAssets/depreciation/processMonthlyDepreciation", {
                    method: "POST",
                    body: payload
                });
                
                if (resp && resp.success) {
                    showAlert(resp.message, 'success');
                    // Refresh the table with updated status
                    await fetchMonthlyDepreciation(date);
                } else {
                    showAlert(resp ? resp.message : "Failed to process depreciation.", 'error');
                }
            } catch (e) {
                console.error("processMonthlyDepreciation Error:", e);
                showAlert("An error occurred while processing depreciation.", 'error');
            } finally {
                // Re-enable button
                depreciateNowBtn.disabled = false;
                depreciateNowBtn.innerHTML = originalBtnText;
            }
        });
    }

    // --- Initial Render ---
    (async () => {
        await fetchAssets();
        if (dateInput && dateInput.value) {
            await fetchMonthlyDepreciation(dateInput.value);
        }
    })();
};

// Ensure initAssetDepreciation is called when the DOM is ready and this script is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if the asset-depreciation.html elements exist, indicating we are on this screen
    if (document.querySelector('.asset-report-shell')) {
        window.initAssetDepreciation();
    }
});