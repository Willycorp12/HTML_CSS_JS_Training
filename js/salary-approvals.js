/**
 * js/salary-approvals.js
 * Controller for Salary Approval and Rejection workflows.
 */

const SalaryApprovalState = {
    currentTab: 'approval',
    currentStatus: 0, // 0=Pending, 1=Approved, 2=Rejected
    dataList: [],
    query: ''
};

/**
 * Initialization function called from index.html
 */
window.initSalaryApprovals = async function() {
    console.log("initSalaryApprovals: Initializing interface...");
    
    injectSalaryViewModal();

    // Populate dropdowns using lookups from paylist-data.js
    if (typeof window.loadSalaryGenerationLookups === 'function') {
        await window.loadSalaryGenerationLookups();
    }

    const searchInput = document.getElementById('EDT_SalaryGlobalSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            SalaryApprovalState.query = e.target.value.toLowerCase();
            renderSalaryTables();
        });
    }

    // Add event listeners for dropdown filters to refresh the view
    const filters = ['PB_Filter_Year', 'PB_Filter_Month', 'PB_Filter_Branch', 'PB_Filter_Dept'];
    filters.forEach(id => {
        document.getElementById(id)?.addEventListener('change', window.fetchSalarySummaryList);
    });

    window.fetchSalarySummaryList();
};

/**
 * Fetches data from the POST /api/v1/payroll/getSalarySummaryList endpoint
 */
window.fetchSalarySummaryList = async function() {
    // Source filters from global state to maintain selection across module switches
    const status = SalaryApprovalState.currentStatus;
    const month = window.payrollFilterState.month;
    const year = parseInt(window.payrollFilterState.year);
    const branchId = parseInt(window.payrollFilterState.branchId);
    const departmentId = parseInt(window.payrollFilterState.departmentId);

    const payload = { status, month, year, branchId, departmentId };
    console.log("fetchSalarySummaryList: Fetching summaries for payload:", payload);

    try {
        if (typeof apiFetch === 'undefined') throw new Error("apiFetch utility not found.");

        const response = await apiFetch("/api/v1/payroll/getSalarySummaryList", {
            method: "POST",
            body: payload
        });

        if (response && response.success) {
            SalaryApprovalState.dataList = response.data || [];
            renderSalaryTables();
        } else {
            showAlert(response ? response.message : "Failed to load summaries.", "error");
            SalaryApprovalState.dataList = [];
            renderSalaryTables();
        }
    } catch (e) {
        console.error("fetchSalarySummaryList Error:", e);
        renderSalaryTables();
    }
};

/**
 * Switches between Approval and Rejected tabs
 */
window.switchSalaryTab = function(tab, element) {
    SalaryApprovalState.currentTab = tab;

    // Update Status Filter (for backend implementation)
    if (tab === 'approval') SalaryApprovalState.currentStatus = 0;
    else if (tab === 'approved') SalaryApprovalState.currentStatus = 1;
    else if (tab === 'rejected') SalaryApprovalState.currentStatus = 2;
    
    // Update UI Tabs
    document.querySelectorAll('.main-tab').forEach(t => t.classList.remove('active'));
    element.classList.add('active');

    // Update Header
    const titles = {
        'approval': 'Salary Paylist Approval',
        'approved': 'Approved Salaries History',
        'rejected': 'Rejected Salaries List'
    };
    const titleLabel = document.getElementById('SALARY_PAGE_TITLE');
    if (titleLabel) titleLabel.textContent = titles[tab] || 'Salary Paylist Approval';

    // Toggle Table Visibility
    document.getElementById('TABLE_SalaryApproval').style.display = tab === 'approval' ? 'table' : 'none';
    document.getElementById('TABLE_SalaryApproved').style.display = tab === 'approved' ? 'table' : 'none';
    document.getElementById('TABLE_SalaryRejected').style.display = tab === 'rejected' ? 'table' : 'none';

    window.fetchSalarySummaryList();
};

/**
 * Injects the detailed view modal shell into the DOM
 */
function injectSalaryViewModal() {
    if (document.getElementById('MODAL_SalaryDetailView')) return;
    
    // Reuse logic from payment-order.js for style injection
    if (typeof injectPOModalStyles === 'function') injectPOModalStyles();

    // Add specific styles for the large detailed breakdown modal
    if (!document.getElementById('STYLE_SalaryDetailOverrides')) {
        const style = document.createElement('style');
        style.id = 'STYLE_SalaryDetailOverrides';
        style.innerHTML = `
            /* Module-wide Button Styles */
            .wd-btn { 
                padding: 6px 12px; border: 1px solid #999; background: #f0f0f0; 
                cursor: pointer; font-size: 12px; display: inline-flex; 
                align-items: center; gap: 6px; justify-content: center; border-radius: 4px; 
                transition: all 0.2s;
            }
            .wd-btn.primary { border-color: #2e3192 !important; background-color: #2e3192 !important; color: #fff !important; font-weight: bold; }
            .wd-btn.danger { border-color: #cd2027 !important; background-color: #cd2027 !important; color: #fff !important; font-weight: bold; }

            #MODAL_SalaryDetailView .po-modal { 
                display: flex; 
                flex-direction: column; 
                background: #f4f6f9;
                border: 1px solid #888;
                border-radius: 4px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            }
            #MODAL_SalaryDetailView .po-modal-body { 
                flex: 1; 
                display: flex; 
                flex-direction: column; 
                overflow: hidden; 
                background: #fff;
            }
            #MODAL_SalaryDetailView .paylist-table-container {
                flex: 1;
                overflow: auto;
                position: relative;
                background: #fff;
                border-bottom: 1px solid #ddd;
            }
            /* Replicating pay-master.css table styles */
            #MODAL_SalaryDetailView .paylist-table {
                border-collapse: collapse;
                width: max-content;
                font-size: 11px;
            }
            #MODAL_SalaryDetailView .paylist-table th {
                background: #005a9e;
                color: white;
                padding: 4px 3px;
                border: 1px solid #004a80;
                text-align: center;
                white-space: normal;
                vertical-align: middle;
                position: sticky;
                top: 0;
                z-index: 20;
                max-width: 85px;
                line-height: 1.2;
            }
            #MODAL_SalaryDetailView .paylist-table td {
                padding: 4px;
                border: 1px solid #ccc;
                text-align: right;
                max-width: 170px;
                white-space: normal;
                word-wrap: break-word;
                background: #fff; /* Opaque background for sticky columns */
            }
            #MODAL_SalaryDetailView .paylist-table tr:nth-child(even) td {
                background-color: #f9f9f9;
            }
            #MODAL_SalaryDetailView .paylist-table tr:hover td {
                background-color: #e6f7ff;
            }
            #MODAL_SalaryDetailView .sticky-col {
                white-space: nowrap !important;
                position: sticky;
                z-index: 10;
            }
            #MODAL_SalaryDetailView thead th.sticky-col {
                z-index: 30;
                background-color: #005a9e;
            }
            #MODAL_SalaryDetailView .col-sn { width: 30px; text-align: center !important; }
            #MODAL_SalaryDetailView .col-month { width: 80px; }
            #MODAL_SalaryDetailView .col-name { width: 180px; }
            #MODAL_SalaryDetailView .col-orange { background-color: #ff9800 !important; color: white !important; font-weight: bold; }
            #MODAL_SalaryDetailView .col-green { background-color: #008000 !important; color: white !important; font-weight: bold; }
            #MODAL_SalaryDetailView .text-left { text-align: left !important; }
            #MODAL_SalaryDetailView .text-right { text-align: right !important; }
        `;
        document.head.appendChild(style);
    }

    const modalHtml = `
        <div id="MODAL_SalaryDetailView" class="po-modal-overlay" style="display:none; z-index:10005;">
            <!-- Content will be built in openSalaryViewModal to ensure it matches current ref -->
        </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}
/**
 * Renders the data based on active tab and search query
 */
function renderSalaryTables() {
    const tab = SalaryApprovalState.currentTab;
    const tableId = {
        'approval': 'TABLE_SalaryApproval',
        'approved': 'TABLE_SalaryApproved',
        'rejected': 'TABLE_SalaryRejected'
    }[tab];
    
    const tbody = document.querySelector(`#${tableId} tbody`);
    if (!tbody) return;

    tbody.innerHTML = '';
    const data = SalaryApprovalState.dataList;
    
    const q = SalaryApprovalState.query;

    const filtered = data.filter(d => 
        String(d.reference).toLowerCase().includes(q) || 
        (d.month && d.month.toLowerCase().includes(q)) || 
        String(d.year).includes(q)
    );

    filtered.forEach((d, idx) => {
        const tr = document.createElement('tr');
        const amountStr = Number(d.netPayment || 0).toLocaleString() + ' FCFA';
        
        let actions = '';
        let extra = '';

        if (tab === 'approval') {
            actions = `
                <button class="wd-btn primary" onclick="openSalaryViewModal('${d.Salary_SummaryID}', '${d.reference}')">View</button>
                <button class="wd-btn pay" onclick="handleSalaryWorkflow('approve', '${d.Salary_SummaryID}', '${d.reference}')">Approve</button>
                <button class="wd-btn reject" onclick="handleSalaryWorkflow('reject', '${d.Salary_SummaryID}', '${d.reference}')">Reject</button>
            `;
        } else if (tab === 'approved') {
            extra = `<td>${d.approvedBy || 'System'}</td>`;
            actions = `<button class="wd-btn primary" onclick="openSalaryViewModal('${d.Salary_SummaryID}', '${d.reference}')">View Details</button>`;
        } else {
            extra = `<td>${d.rejectedBy || '---'}</td>`;
            const reasonEscaped = (d.rejectionReason || "").replace(/'/g, "\\'");
            actions = `
                <button class="wd-btn primary" onclick="openSalaryViewModal('${d.Salary_SummaryID}', '${d.reference}', '${reasonEscaped}')">View</button>
                <button class="wd-btn reject" onclick="handleSalaryWorkflow('delete', '${d.Salary_SummaryID}', '${d.reference}')">Delete</button>
            `;
        }

        tr.innerHTML = `
            <td>${idx + 1}</td>
            <td><b>${d.reference}</b></td>
            <td>${d.dateCreated || '---'}</td>
            <td>---</td>
            <td>${d.month}</td>
            <td>${d.year}</td>
            <td class="text-right" style="font-weight:bold; color:#2e3192;">${amountStr}</td>
            <td>${d.InitiatedBy || '---'}</td>
            ${extra}
            <td class="text-center">${actions}</td>
        `;

        // Row selection style
        tr.onclick = () => {
            tbody.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
            tr.classList.add('selected');
        };

        tbody.appendChild(tr);
    });

    if (filtered.length === 0) {
        const cols = (tab === 'approval') ? 9 : 10;
        tbody.innerHTML = `<tr><td colspan="${cols}" style="text-align:center; padding:20px; color:#999;">No records found matching filters.</td></tr>`;
    }
}

/**
 * Handles workflow actions with confirmation
 */
window.handleSalaryWorkflow = function(action, id, ref) {
    const msgs = {
        approve: `Are you sure you want to APPROVE paylist ${ref}?`,
        reject: `Are you sure you want to REJECT paylist ${ref}?`,
        delete: `Are you sure you want to DELETE paylist record ${ref}? This cannot be undone.`
    };

    showConfirmModal({
        title: "Salary Workflow",
        message: msgs[action],
        onOk: async () => {
            let endpoint = '';
            let method = '';
            let body = {};

            if (action === 'approve') {
                endpoint = `/api/v1/payroll/approveSalaryBatch/${id}`;
                method = 'PUT';
            } else if (action === 'reject') {
                endpoint = `/api/v1/payroll/rejectSalaryBatch/${id}`;
                method = 'PUT';
            } else if (action === 'delete') {
                endpoint = `/api/v1/payroll/deleteSalaryBatch/${id}`;
                method = 'DELETE';
                body = null; // No body needed for DELETE
            }

            try {
                const response = await apiFetch(endpoint, { method, body });

                if (response && response.success) {
                    showAlert(response.message || `Paylist ${ref} ${action}ed successfully.`, 'success');
                    window.fetchSalarySummaryList(); // Refresh the table
                } else {
                    showAlert(response ? response.message : `Failed to ${action} paylist.`, 'error');
                }
            } catch (e) {
                console.error(`handleSalaryWorkflow (${action}) Error:`, e);
                showAlert(`An error occurred while processing the ${action} request.`, 'error');
            }
        }
    });
};

/**
 * Opens the detailed view modal (matches generation page style)
 */
window.openSalaryViewModal = async function(id, ref, reason = '') {
    const overlay = document.getElementById('MODAL_SalaryDetailView');
    if (!overlay) return;

    // Helper to format numbers locally
    const f = (num) => (num || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

    let details = [];
    let batchHeader = {};

    try {
        const response = await apiFetch(`/api/v1/payroll/getSalaryBatchDetails/${id}`, { method: 'GET' });
        if (response && response.success) {
            details = response.data || [];
            batchHeader = response.header || {};
        } else {
            showAlert(response ? response.message : "Could not load batch details.", "error");
            return;
        }
    } catch (error) {
        console.error("openSalaryViewModal Error:", error);
        return;
    }

    overlay.innerHTML = `
    <div class="po-modal" style="width: 98vw; height: 95vh; max-width: 1600px;">
        <div class="po-modal-header" id="SDV_Header">
            <span>Detailed Salary Breakdown - Paylist Ref: ${ref}${reason ? ' - REASON: ' + reason : ''}</span>
            <span class="po-modal-close" onclick="closeSalaryViewModal()">&times;</span>
        </div>
        <div class="po-modal-body" style="padding:0;">
            <div class="pm-toolbar" style="padding:8px 15px; background:#f8f9fa; border-bottom:1px solid #ccc; display:flex; justify-content:space-between; align-items:center; flex-shrink:0;">
                <div style="font-weight:bold; color:#2e3192; font-size:16px;">
                    <i class="fa-solid fa-list-check"></i> Monthly Paylist Breakdown (All Staff)
                </div>
                <div style="display: flex; gap: 20px; align-items: center;">
                    <span class="pm-summary-label">Total Employees: <b style="color:#333; font-size:13px;">${batchHeader.employeeCount || details.length}</b></span>
                    <span class="pm-summary-label">Net Batch Total: <b class="pm-summary-value" style="font-size:16px;">${f(batchHeader.netPayment)} FCFA</b></span>
                    <button class="wd-btn primary" style="padding: 5px 12px;" onclick="printReport('paylist')"><i class="fa-solid fa-print"></i> Print Full Paylist</button>
                </div>
            </div>
            
            <div class="paylist-table-container" style="flex:1;">
                <table class="paylist-table">
                    <thead>
                        <tr>
                            <th class="sticky-col col-sn">SN</th>
                            <th class="sticky-col col-month">Month</th>
                            <th class="sticky-col col-name">Staff Names</th>
                            <th>Gross Salary</th>
                            <th>Basic Salary</th>
                            <th>Overtime</th>
                            <th>Housing Allowance</th>
                            <th>Seniority Bonus</th>
                            <th>Vehicle Allowance</th>
                            <th>Water Allowance</th>
                            <th>Electricity Allowance</th>
                            <th>Food Allowance</th>
                            <th>Domestic Allowance</th>
                            <th>Basket Allowance</th>
                            <th>Duty Allowance</th>
                            <th>Research Allowance</th>
                            <th>Transport Allowance</th>
                            <th>Representation Allowance</th>
                            <th style="font-weight:bold;">Gross Taxable</th>
                            <th>IRPP (PIT)</th>
                            <th>CAC (ACT)</th>
                            <th>CNPS</th>
                            <th class="col-orange">Net Salary</th>
                            <th class="col-green">Net Payment</th>
                        </tr>
                    </thead>
                    <tbody id="SDV_Tbody">
                        ${details.map((d, idx) => `
                            <tr>
                                <td class="sticky-col col-sn text-center">${idx + 1}</td>
                                <td class="sticky-col col-month text-left">${batchHeader.month || '---'}</td>
                                <td class="sticky-col col-name text-left"><b>${d.fullName}</b></td>
                                <td class="text-right">${f(d.grossSalary)}</td>
                                <td class="text-right">${f(d.basicSalary)}</td>
                                <td class="text-right">${f(d.overtime)}</td>
                                <td class="text-right">${f(d.housingAllowance)}</td>
                                <td class="text-right">${f(d.seniorityBonus)}</td>
                                <td class="text-right">${f(d.vehicleAllowance)}</td>
                                <td class="text-right">${f(d.waterAllowance)}</td>
                                <td class="text-right">${f(d.electricityAllowance)}</td>
                                <td class="text-right">${f(d.foodAllowance)}</td>
                                <td class="text-right">${f(d.domesticAllowance)}</td>
                                <td class="text-right">${f(d.basketAllowance)}</td>
                                <td class="text-right">${f(d.dutyPostAllowance)}</td>
                                <td class="text-right">${f(d.researchAllowance)}</td>
                                <td class="text-right">${f(d.transportAllowance)}</td>
                                <td class="text-right">${f(d.representationAllowance)}</td>
                                <td class="text-right" style="font-weight:bold;">${f(d.grossTaxableSalary)}</td>
                                <td class="text-right">${f(d.pitIrpp)}</td>
                                <td class="text-right">${f(d.cacIrpp)}</td>
                                <td class="text-right">${f(d.cnpsAmount)}</td>
                                <td class="col-orange text-right">${f(d.netSalary)}</td>
                                <td class="col-green text-right">${f(d.netPayment)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        <!-- <div class="po-modal-footer" style="padding: 12px 20px; background: #f0f0f0;">
            <button class="wd-btn danger" onclick="closeSalaryViewModal()" style="padding: 10px 40px; font-size: 14px;">Close Detailed View <i class="fa-solid fa-circle-xmark"></i></button>
        </div> -->
    </div>`;
    
    if (typeof makeElementDraggable === 'function') {
        makeElementDraggable(overlay.querySelector('.po-modal'), document.getElementById('SDV_Header'));
    }

    // Trigger sticky column calculation now that DOM is built
    if (typeof updateStickyColumns === 'function') {
        setTimeout(updateStickyColumns, 50);
    }

    overlay.style.display = 'flex';
};

window.closeSalaryViewModal = function() {
    const modal = document.getElementById('MODAL_SalaryDetailView');
    if (modal) modal.style.display = 'none';
};

/**
 * Number to Words helper (local fallback if main is missing)
 */
function fmtCurr(n) {
    return Number(n).toLocaleString('en-US') + ' FCFA';
}

console.log("Salary Approvals Logic Loaded Successfully");