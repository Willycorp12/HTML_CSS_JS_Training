/**
 * Asset Reports Manager
 * Handles tab switching, toolbar toggling, and mock data rendering for Fixed Asset Reports.
 */

const REPORT_STATE = {
    currentTab: 'checked-out',
    data: [],
    assetMap: new Map() // For depreciation names
};

/**
 * Switches between the report tabs and updates the toolbar/table content.
 * @param {string} tabName - 'checked-out', 'checked-in', 'due-dates', or 'depreciation'
 * @param {HTMLElement} element - The clicked tab element.
 */
window.switchAssetReportTab = function(tabName, element) {
    // 1. Update Tab Active State
    REPORT_STATE.currentTab = tabName;
    document.querySelectorAll('.asset-report-shell .main-tab').forEach(tab => tab.classList.remove('active'));
    element.classList.add('active');

    // 2. Toggle Toolbar Groups based on tab
    const filterStd = document.getElementById('filter-standard');
    const filterDue = document.getElementById('filter-due');
    const filterDep = document.getElementById('filter-dep');

    if (filterStd) filterStd.style.display = (tabName === 'checked-out' || tabName === 'checked-in') ? 'flex' : 'none';
    if (filterDue) filterDue.style.display = (tabName === 'due-dates') ? 'flex' : 'none';
    if (filterDep) filterDep.style.display = (tabName === 'depreciation') ? 'flex' : 'none';

    // 3. Update Labels
    const titleLabel = document.getElementById('report-title-label');
    const subLabel = document.getElementById('report-subtitle-label');
    const depFooter = document.getElementById('depreciation-footer');

    if (depFooter) depFooter.style.display = 'none';
    if (subLabel) subLabel.style.display = 'none';

    if (titleLabel) {
        switch(tabName) {
            case 'checked-out': titleLabel.textContent = "List of Assets Checked-Out"; break;
            case 'checked-in': titleLabel.textContent = "List of Assets Checked-In"; break;
            case 'due-dates': titleLabel.textContent = "Approaching Due Dates of Assets"; break;
            case 'depreciation': 
                titleLabel.textContent = "Depreciation of Fixed Assets"; 
                if (subLabel) subLabel.style.display = 'block';
                if (depFooter) depFooter.style.display = 'flex';
                break;
        }
    }

    // 4. Render Table with Sample Data
    fetchReportData(tabName);
};

function renderReportTableData(tabName, data = []) {
    const thead = document.getElementById('report-thead'), tbody = document.getElementById('report-tbody');
    if (!thead || !tbody) return;

    let headHTML = '';
    let bodyHTML = '';
    const MIN_ROWS = 10;

    if (tabName === 'depreciation') {
        // Column structure for Depreciation.jpg
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const monthStr = data.month ? monthNames[data.month - 1] : "";
        const monthFormatted = data.year ? `${monthStr}, ${data.year}` : "";
        const records = data.data || [];

        headHTML = `
            <tr>
                <th style="width: 110px;"><input type="checkbox" id="select-all-report-dep"> Status</th>
                <th style="width: 40px;">No</th>
                <th style="width: 30%;">Asset Name</th>
                <th>Month</th>
                <th style="text-align: right;">Orig.Cost</th>
                <th style="text-align: right;">Dep.Expense</th>
                <th style="text-align: right;">Accum.Dep</th>
                <th style="text-align: right;">Book Value</th>
            </tr>
        `;

        records.forEach(item => {
            const assetName = REPORT_STATE.assetMap.get(Number(item.assetId)) || `Asset #${item.assetId}`;
            const isApplied = item.status === 'Applied';
            bodyHTML += `
                <tr>
                    <td><input type="checkbox" class="report-dep-row-cb" ${isApplied ? 'disabled' : 'checked'}> ${item.status}</td>
                    <td>${item.no}</td>
                    <td>${assetName}</td>
                    <td>${monthFormatted}</td>
                    <td style="text-align: right;">${Number(item.startBookValue || 0).toLocaleString()}</td>
                    <td class="dep-expense-cell">${Number(item.depreciation || 0).toLocaleString()}</td>
                    <td style="text-align: right;">${Number(item.accumDep || 0).toLocaleString()}</td>
                    <td style="text-align: right;">${Number(item.endBookValue || 0).toLocaleString()}</td>
                </tr>
            `;
        });

        // Update Footer
        const totalEl = document.querySelector('.dep-footer .total-val');
        if (totalEl) totalEl.textContent = Number(data.totalDepreciation || 0).toLocaleString() + " FCFA";
        
        // Fill remaining
        for (let i = records.length; i < MIN_ROWS; i++) {
            bodyHTML += `<tr>${'<td>&nbsp;</td>'.repeat(8)}</tr>`;
        }

        // Populate Asset Filter once
        if (records.length > 0 && !REPORT_STATE.isFiltering) {
            populateAssetFilter(records);
        }

    } else {
        // Column structure for Checked-Out/In/Due Dates JPGs
        const dateLabel = tabName === 'checked-in' ? 'Checked-In Date' : 'Checked-Out Date';
        const locLabel = tabName === 'checked-in' ? 'Asset Location' : 'Location Name';

        headHTML = `
            <tr>
                <th style="width: 50px;">ID</th>
                <th style="width: 30%;">Asset Name</th>
                <th>${dateLabel}</th>
                <th>Due Date</th>
                <th>Comments</th>
                <th style="width: 100px;">Status</th>
                <th>${locLabel}</th>
                <th>Personnel Name</th>
            </tr>
        `;

        if (data.length > 0) {
            data.forEach(item => {
                const dateVal = tabName === 'checked-in' ? (item.checkInDate || '') : (item.checkoutDate || item.checkOutDate || '');
                bodyHTML += `
                    <tr>
                        <td>${item.checkOutId || item.checkInId || ''}</td>
                        <td>${item.assetName || ''}</td>
                        <td>${dateVal}</td>
                        <td>${item.dueDate || ''}</td>
                        <td>${item.comments || ''}</td>
                        <td></td>
                        <td>${item.locationName || ''}</td>
                        <td>${item.personnelName || ''}</td>
                    </tr>
                `;
            });
        }

        for (let i = (Array.isArray(data) ? data.length : 0); i < MIN_ROWS; i++) {
            bodyHTML += `<tr>${'<td>&nbsp;</td>'.repeat(8)}</tr>`;
        }
    }
    thead.innerHTML = headHTML;
    tbody.innerHTML = bodyHTML;

    // Setup Select All for Depreciation
    const selectAll = document.getElementById('select-all-report-dep');
    if (selectAll) {
        selectAll.addEventListener('change', () => {
            const isChecked = selectAll.checked;
            tbody.querySelectorAll('.report-dep-row-cb:not(:disabled)').forEach(cb => cb.checked = isChecked);
        });
    }
}

/**
 * Populates the Asset Name filter dropdown with unique names from data.
 */
function populateAssetFilter(records) {
    const select = document.getElementById('report-dep-asset-filter');
    if (!select) return;
    
    const uniqueNames = new Set();
    records.forEach(r => {
        const name = REPORT_STATE.assetMap.get(Number(r.assetId)) || `Asset #${r.assetId}`;
        uniqueNames.add(name);
    });

    select.innerHTML = '<option value="">-- All Assets --</option>';
    [...uniqueNames].sort().forEach(name => {
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        select.appendChild(opt);
    });
}

/**
 * Filters the depreciation table by asset name (Front-end)
 */
function filterDepreciationByAssetName() {
    const filterVal = document.getElementById('report-dep-asset-filter').value;
    const rows = document.querySelectorAll('#report-tbody tr');

    REPORT_STATE.isFiltering = true; // Block filter repopulation
    rows.forEach(row => {
        const assetNameCell = row.cells[2];
        if (!assetNameCell || assetNameCell.textContent.trim() === "") return;
        const matches = !filterVal || assetNameCell.textContent === filterVal;
        row.style.display = matches ? '' : 'none';
    });
}

/**
 * Fetches data from the report endpoints.
 */
async function fetchReportData(tabName) {
    const fromDate = document.getElementById('report-from-date').value;
    const toDate = document.getElementById('report-to-date').value;
    
    let endpoint = "";
    let payload = {};

    if (tabName === 'due-dates') {
        endpoint = "/api/v1/fixedAssets/reports/dueDates";
        payload = { reportType: 1 };
    } else if (tabName === 'depreciation') {
        endpoint = `/api/v1/fixedAssets/depreciation/getMonthlyDepreciations/${document.getElementById('report-dep-date').value}`;
        // GET method, no payload
    } else {
        endpoint = tabName === 'checked-in' 
            ? "/api/v1/fixedAssets/reports/checkedInAssets" 
            : "/api/v1/fixedAssets/reports/checkedOutAssets";
        payload = { fromDate, toDate };
    }

    try {
        const fetchOptions = { method: tabName === 'depreciation' ? "GET" : "POST" };
        if (tabName !== 'depreciation') fetchOptions.body = payload;

        const resp = await apiFetch(endpoint, fetchOptions);

        if (resp && resp.success) {
            showAlert(resp.message, "success");
            REPORT_STATE.data = (tabName === 'depreciation') ? resp : (resp.data || []);
            
            if (tabName === 'due-dates') {
                filterDueDates();
            } else if (tabName === 'depreciation') {
                REPORT_STATE.isFiltering = false;
                renderReportTableData(tabName, REPORT_STATE.data);
            } else {
                renderReportTableData(tabName, REPORT_STATE.data);
            }
        } else {
            showAlert(resp ? resp.message : "Failed to load report data.", "error");
            renderReportTableData(tabName, []);
        }
    } catch (e) {
        console.error("fetchReportData Error:", e);
        showAlert("An error occurred while fetching report data.", "error");
    }
}

/**
 * Filters the due date data based on radio selection (Front-end only)
 */
function filterDueDates() {
    if (REPORT_STATE.currentTab !== 'due-dates') return;

    const filterType = document.querySelector('input[name="due-filter"]:checked').value;
    const todayStr = new Date().toISOString().split('T')[0];

    const filtered = REPORT_STATE.data.filter(item => {
        if (!item.dueDate) return false;
        const isOverdue = item.dueDate < todayStr;
        return filterType === 'overdue' ? isOverdue : !isOverdue;
    });

    renderReportTableData('due-dates', filtered);
}

/**
 * Syncs the To Date to the end of the month based on the From Date selection.
 * Selection no longer triggers the request.
 */
function syncReportDates(fromDateVal) {
    if (!fromDateVal) return;
    
    const selectedDate = new Date(fromDateVal);
    const y = selectedDate.getFullYear();
    const m = selectedDate.getMonth();
    
    // Get first and last day of that specific month
    const firstDay = new Date(y, m, 2).toISOString().split('T')[0]; // Offset for UTC
    const lastDay = new Date(y, m + 1, 1).toISOString().split('T')[0];

    const fromInput = document.getElementById('report-from-date');
    const toInput = document.getElementById('report-to-date');

    // Update To Date first, then adjust From Date to the 1st
    toInput.value = lastDay;
    fromInput.value = firstDay;
}

/**
 * Initialization function called by loadScreen in index.html
 */
window.initAssetReports = function() {
    console.log("Asset Reports Screen Initializing...");

    // Default to Current Month
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth();
    const firstDay = new Date(y, m, 2).toISOString().split('T')[0];
    const lastDay = new Date(y, m + 1, 1).toISOString().split('T')[0];

    document.getElementById('report-from-date').value = firstDay;
    document.getElementById('report-to-date').value = lastDay;
    document.getElementById('report-dep-date').value = firstDay;

    // Setup Date listeners
    const fromDateInput = document.getElementById('report-from-date');
    if (fromDateInput) fromDateInput.addEventListener('change', (e) => syncReportDates(e.target.value));

    const searchBtn = document.getElementById('btn-report-search');
    if (searchBtn) searchBtn.addEventListener('click', () => fetchReportData(REPORT_STATE.currentTab));

    // Due Date Radio Listeners
    const dueRadios = document.querySelectorAll('input[name="due-filter"]');
    dueRadios.forEach(radio => radio.addEventListener('change', filterDueDates));

    // Depreciation Listeners
    const depDateInput = document.getElementById('report-dep-date');
    if (depDateInput) depDateInput.addEventListener('change', () => fetchReportData('depreciation'));
    
    const depAssetFilter = document.getElementById('report-dep-asset-filter');
    if (depAssetFilter) depAssetFilter.addEventListener('change', filterDepreciationByAssetName);

    // Row Selection for all tables
    const tbody = document.getElementById('report-tbody');
    if (tbody) {
        tbody.addEventListener('click', (e) => {
            const tr = e.target.closest('tr');
            if (!tr || e.target.type === 'checkbox' || tr.cells[0].textContent.trim() === "") return;
            tbody.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
            tr.classList.add('selected');
        });
    }

    // Load Asset Map (similar to asset-depreciation.js)
    (async () => {
        try {
            const resp = await apiFetch("/api/v1/fixedAssets/getAssets", { method: "GET" });
            if (resp && resp.success && Array.isArray(resp.data)) {
                resp.data.forEach(a => REPORT_STATE.assetMap.set(Number(a.assetId), a.assetName));
            }
        } catch (e) { console.error("fetchAssets Error:", e); }
    })();

    // Initial Load
    fetchReportData('checked-out');
};