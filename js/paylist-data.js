/* js/paylist-data.js */

// Global cache for statuses
window.salaryStatusCache = [];
window.salaryLookupCache = null; // Memory cache for lookup data

// Global state to persist filter selection across SPA screen transitions until hard reload (F5)
window.payrollFilterState = window.payrollFilterState || {
    year: new Date().getFullYear(),
    month: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][new Date().getMonth()],
    branchId: "0",
    departmentId: "0",
    salaryType: "1"
};

// Global state for Payroll Report Data
window.payrollReportCache = {
    data: [],
    header: {},
    lastFilters: null
};

// Helper to format numbers
const fmt = (num) => (num || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

/**
 * Internal helper to resolve lookup names from IDs
 */
function resolveLookupName(type, id) {
    if (!window.salaryLookupCache || !window.salaryLookupCache[type]) return id;
    // Find item matching ID (handling potential string/number mismatch)
    const item = window.salaryLookupCache[type].find(x => String(x.id) === String(id));
    return item ? item.name : id;
}

/**
 * Loads lookups for salary generation screens and populates dropdowns.
 */
window.loadSalaryGenerationLookups = async function () {
    try {
        let data;
        if (window.salaryLookupCache) {
            data = window.salaryLookupCache;
        } else {
            console.log("loadSalaryGenerationLookups: Fetching dropdown data from API...");
            const response = await apiFetch('/api/v1/payroll/lookups/salaryGeneration', {
                method: 'POST',
                body: {}
            });
            if (response && response.success) {
                window.salaryLookupCache = response.data;
                data = window.salaryLookupCache;
            }
        }

        if (data) {
            window.salaryStatusCache = data.statuses || [];

            // Populate Year Dropdown (2025 - 2035)
            const yearSelect = document.getElementById('PB_Filter_Year');
            if (yearSelect) {
                yearSelect.innerHTML = '';
                for (let y = 2025; y <= 2035; y++) {
                    yearSelect.insertAdjacentHTML('beforeend', `<option value="${y}">${y}</option>`);
                }
                yearSelect.value = window.payrollFilterState.year;
            }

            // Populate Month Dropdown
            const monthSelect = document.getElementById('PB_Filter_Month');
            if (monthSelect) {
                const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                monthSelect.innerHTML = months.map(m => `<option value="${m}">${m}</option>`).join('');
                monthSelect.value = window.payrollFilterState.month;
            }

            // Populate Branches
            const branchSelect = document.getElementById('PB_Filter_Branch');
            if (branchSelect) {
                branchSelect.innerHTML = '<option value="0">---All Branches---</option>';
                data.branches.forEach(b => {
                    branchSelect.insertAdjacentHTML('beforeend', `<option value="${b.id}">${b.name}</option>`);
                });
                branchSelect.value = window.payrollFilterState.branchId;
            }

            // Populate Departments
            const deptSelect = document.getElementById('PB_Filter_Dept');
            if (deptSelect) {
                deptSelect.innerHTML = '<option value="0">---Display All---</option>';
                data.departments.forEach(d => {
                    deptSelect.insertAdjacentHTML('beforeend', `<option value="${d.id}">${d.name}</option>`);
                });
                deptSelect.value = window.payrollFilterState.departmentId;
            }

            // Populate Salary Types
            const salaryTypeSelect = document.getElementById('PB_Filter_SalaryType');
            if (salaryTypeSelect) {
                salaryTypeSelect.innerHTML = '';
                data.salaryTypes.forEach(s => {
                    salaryTypeSelect.insertAdjacentHTML('beforeend', `<option value="${s.id}">${s.name}</option>`);
                });
                salaryTypeSelect.value = window.payrollFilterState.salaryType;
            }
        }

        // Attach listeners to filters to trigger data refresh on change
        const filters = ['PB_Filter_Year', 'PB_Filter_Month', 'PB_Filter_Branch', 'PB_Filter_Dept', 'PB_Filter_SalaryType'];
        filters.forEach(id => {
            const el = document.getElementById(id);
            if (el && !el.dataset.filterListener) {
                el.dataset.filterListener = "true";
                el.addEventListener('change', () => {
                    // Sync DOM selection to the global persistent state
                    if (id === 'PB_Filter_Year') window.payrollFilterState.year = el.value;
                    else if (id === 'PB_Filter_Month') window.payrollFilterState.month = el.value;
                    else if (id === 'PB_Filter_Branch') window.payrollFilterState.branchId = el.value;
                    else if (id === 'PB_Filter_Dept') window.payrollFilterState.departmentId = el.value;
                    else if (id === 'PB_Filter_SalaryType') window.payrollFilterState.salaryType = el.value;

                    // Identify which report is currently active and refresh it
                    if (document.querySelector('.paylist-table-container')) {
                        // If we are on generate, cnps, or tax screens
                        if (document.querySelector('.btn-paylist')) { // CNPS or Tax screen
                            if (document.querySelector('.pm-page-title').textContent.includes('CNPS')) initPaylistCNPS(true);
                            else initPaylistTax(true);
                        } else {
                            initPaylistGenerate("", true);
                        }
                    }
                });
            }
        });

    } catch (error) {
        console.error("Error loading salary generation lookups:", error);
    }
};

/**
 * Fetches data from the /api/v1/payroll/getPayrollReportData endpoint if filters changed.
 */
window.fetchPayrollReportData = async function (force = false) {
    // Source filters from persistent state to ensure consistency during SPA navigation
    const filters = {
        month: window.payrollFilterState.month,
        year: parseInt(window.payrollFilterState.year),
        branchId: parseInt(window.payrollFilterState.branchId),
        departmentId: parseInt(window.payrollFilterState.departmentId)
    };

    // Check if filters match cache
    const filterStr = JSON.stringify(filters);
    if (!force && window.payrollReportCache.lastFilters === filterStr) {
        console.log("fetchPayrollReportData: Using cached data.");
        return window.payrollReportCache;
    }

    console.log("fetchPayrollReportData: Fetching new report data for filters:", filters);

    try {
        const response = await apiFetch('/api/v1/payroll/getPayrollReportData', {
            method: 'POST',
            body: filters
        });

        if (response && response.success) {
            showAlert(response.message, 'success');
            window.payrollReportCache = {
                data: response.data || [],
                header: response.header || {},
                lastFilters: filterStr
            };
            return window.payrollReportCache;
        } else {
            showAlert(response ? response.message : "Failed to load report data.", "error");
            window.payrollReportCache = { data: [], header: {}, lastFilters: filterStr };
            return window.payrollReportCache;
        }
    } catch (error) {
        console.error("fetchPayrollReportData Error:", error);
        return { data: [], header: {}, lastFilters: null };
    }
};

/**
 * Generates the salary batch and forwards it for approval via the API.
 */
window.generateSalaryBatch = async function () {
    const month = document.getElementById('PB_Filter_Month')?.value;
    const year = parseInt(document.getElementById('PB_Filter_Year')?.value) || 0;
    const branchId = parseInt(document.getElementById('PB_Filter_Branch')?.value) || 0;
    const departmentId = parseInt(document.getElementById('PB_Filter_Dept')?.value) || 0;
    const salaryType = parseInt(document.getElementById('PB_Filter_SalaryType')?.value) || 1;

    const payload = { month, year, branchId, departmentId, salaryType };
    console.log("generateSalaryBatch: Initiating batch creation...", payload);

    try {
        const response = await apiFetch('/api/v1/payroll/generateSalary', {
            method: 'POST',
            body: payload
        });

        if (response) {
            showAlert(response.message, response.success ? 'success' : 'error');
        }
    } catch (error) {
        console.error("Error generating salary batch:", error);
        showAlert("Network fault during salary batch generation.", "error");
    }
};

/**
 * Render function for 'Generate Pay List' (paylist-generate.html)
 */
window.initPaylistGenerate = async function (query = "", forceRefresh = false) {
    await window.loadSalaryGenerationLookups();
    const report = await window.fetchPayrollReportData(forceRefresh);

    const tbody = document.querySelector('.paylist-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    // Search Listener Attachment
    const searchInput = document.getElementById('PAYLIST_SEARCH');
    if (searchInput && !searchInput.dataset.listener) {
        searchInput.dataset.listener = "true";
        searchInput.addEventListener('input', (e) => initPaylistGenerate(e.target.value));
    }

    // Forward for Approval Button Listener
    const forwardBtn = document.getElementById('BTN_ForwardForApproval');
    if (forwardBtn && !forwardBtn.dataset.listener) {
        forwardBtn.dataset.listener = "true";
        forwardBtn.addEventListener('click', window.generateSalaryBatch);
    }

    // Update No: field in header
    const noInput = document.getElementById('PB_Header_No');
    if (noInput) noInput.value = report.data[0]?.salarySummaryId || '';

    const filtered = report.data.filter(d => d.fullName.toLowerCase().includes(query.toLowerCase()));
    filtered.forEach((d, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="sticky-col col-chk"><input type="checkbox" checked></td>
            <td class="sticky-col col-sn">${idx + 1}</td>
            <td class="sticky-col col-month text-left">${d.month}</td>
            <td class="sticky-col col-name text-left">${d.fullName}</td>
            <td class="sticky-col col-branch text-left">${resolveLookupName('branches', d.branchId)}</td>
            <td class="sticky-col text-left">${resolveLookupName('departments', d.departmentId)}</td>
            <td class="sticky-col text-right">${fmt(d.grossSalary)}</td>
            
            <td>${fmt(d.basicSalary)}</td>
            <td>${fmt(d.overtime)}</td>
            <td>${fmt(d.housingAllowance)}</td>
            <td>${fmt(d.seniorityBonus)}</td>
            <td>${fmt(d.waterAllowance)}</td>
            <td>${fmt(d.electricityAllowance)}</td>
            <td>${fmt(d.dutyPostAllowance)}</td>
            <td>${fmt(d.researchAllowance)}</td>
            <td>${fmt(d.transportAllowance)}</td>
            <td>${fmt(d.representationAllowance)}</td>
            <td style="font-weight:bold;">${fmt(d.grossTaxableSalary)}</td>
            <td>${fmt(d.pitIrpp)}</td>
            <td>${fmt(d.cacIrpp)}</td>
            <td>${fmt(d.ccfEmployee)}</td>
            <td>${fmt(d.councilTax)}</td>
            <td>${fmt(d.rav)}</td>
            <td>${fmt(d.cnpsAmount)}</td>
            <td class="col-grey" style="font-weight:bold;">${fmt(d.totalPayrollDeductions)}</td>
            <td class="col-orange">${fmt(d.netSalary)}</td>
            <td>${fmt(d.loanDeductions)}</td>
            <td>${fmt(d.advanceSalary)}</td>
            <td>${fmt(d.medicalDeductions)}</td>
            <td>${fmt(d.unjustifiedAbsences)}</td>
            <td>${fmt(d.otherDeductions)}</td>
            <td class="col-grey">${fmt(d.totalOtherDeductions)}</td>
            <td class="col-green">${fmt(d.netPayment)}</td>
        `;
        tbody.appendChild(tr);
    });

    // Update Footer
    const footerVal = document.querySelector('.pm-summary-value');
    if (footerVal) footerVal.textContent = fmt(report.header.totalNetPayment) + " FCFA";

    // Recalculate sticky columns
    if (typeof updateStickyColumns === 'function') updateStickyColumns();
}

/**
 * Render function for 'CNPS Monthly Return' (paylist-cnps.html)
 */
window.initPaylistCNPS = async function (forceRefresh = false) {
    await window.loadSalaryGenerationLookups();
    const report = await window.fetchPayrollReportData(forceRefresh);

    const tbody = document.querySelector('.paylist-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const noInput = document.getElementById('PB_Header_No');
    if (noInput) noInput.value = report.data[0]?.salarySummaryId || '';

    report.data.forEach((d, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="sticky-col col-chk"><input type="checkbox" checked></td>
            <td class="sticky-col col-sn">${idx + 1}</td>
            <td class="sticky-col col-month text-left">${d.month}</td>
            <td class="sticky-col col-name text-left">${d.fullName}</td>
            <td class="sticky-col col-branch text-left">${resolveLookupName('branches', d.branchId)}</td>
            <td class="sticky-col text-left">${resolveLookupName('departments', d.departmentId)}</td>
            <td class="sticky-col text-right">${fmt(d.grossSalary)}</td>
            
            <td>${fmt(d.basicSalary)}</td>
            <td>${fmt(d.overtime)}</td>
            <td>${fmt(d.housingAllowance)}</td>
            <td>${fmt(d.seniorityBonus)}</td>
            <td>${fmt(d.waterAllowance)}</td>
            <td>${fmt(d.electricityAllowance)}</td>
            <td>${fmt(d.dutyPostAllowance)}</td>
            <td>${fmt(d.researchAllowance)}</td>
            <td>${fmt(d.transportAllowance)}</td>
            <td>${fmt(d.representationAllowance)}</td>
            <td>${fmt(d.medicalDeductions)}</td>
            <td>${fmt(d.unjustifiedAbsences)}</td>
            <td>${fmt(d.pvEmployee)}</td>
            <td>${fmt(d.pvEmployer)}</td>
            <td>${fmt(d.familyAllowanceAF)}</td>
            <td>${fmt(d.riskAllowanceAT)}</td>
            <td style="font-weight:bold;">${fmt(d.totalEmployerCNPS)}</td>
            <td class="col-orange">${fmt(d.grossCNPS)}</td>
        `;
        tbody.appendChild(tr);
    });

    const footerVal = document.querySelector('.pm-summary-value');
    if (footerVal) footerVal.textContent = fmt(report.header.totalCNPS) + " FCFA";

    if (typeof updateStickyColumns === 'function') updateStickyColumns();
}

/**
 * Render function for 'Tax Declaration Sheet' (paylist-tax.html)
 */
window.initPaylistTax = async function (forceRefresh = false) {
    await window.loadSalaryGenerationLookups();
    const report = await window.fetchPayrollReportData(forceRefresh);

    const tbody = document.querySelector('.paylist-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    report.data.forEach((d, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="sticky-col col-chk"><input type="checkbox" checked></td>
            <td class="sticky-col col-sn">${idx + 1}</td>
            <td class="sticky-col col-month text-left">${d.month}</td>
            <td class="sticky-col col-name text-left">${d.fullName}</td>
            <td class="sticky-col col-branch text-left">${resolveLookupName('branches', d.branchId)}</td>
            <td class="sticky-col text-left">${resolveLookupName('departments', d.departmentId)}</td>
            <td class="sticky-col text-right">${fmt(d.grossSalary)}</td>
            
            <td>${fmt(d.basicSalary)}</td>
            <td>${fmt(d.overtime)}</td>
            <td>${fmt(d.housingAllowance)}</td>
            <td>${fmt(d.seniorityBonus)}</td>
            <td>${fmt(d.waterAllowance)}</td>
            <td>${fmt(d.electricityAllowance)}</td>
            <td>${fmt(d.dutyPostAllowance)}</td>
            <td>${fmt(d.researchAllowance)}</td>
            <td>${fmt(d.transportAllowance)}</td>
            <td>${fmt(d.representationAllowance)}</td>
            <td style="font-weight:bold;">${fmt(d.grossTaxableSalary)}</td>
            <td>${fmt(d.pitIrpp)}</td>
            <td>${fmt(d.cacIrpp)}</td>
            <td>${fmt(d.ccfEmployee)}</td>
            <td>${fmt(d.councilTax)}</td>
            <td>${fmt(d.rav)}</td>
            <td>${fmt(d.cnpsAmount)}</td>
            <td>${fmt(d.medicalDeductions)}</td>
            <td>${fmt(d.unjustifiedAbsences)}</td>
            <td style="font-weight:bold;">${fmt(d.totalEmployeeTaxes)}</td>
            <td>${fmt(d.ccfEmployer)}</td>
            <td style="font-weight:bold;">${fmt(d.totalEmployerTaxes)}</td>
            <td class="sticky-right col-orange">${fmt(d.totalTaxes)}</td>
        `;
        tbody.appendChild(tr);
    });

    const footerVal = document.querySelector('.pm-summary-value');
    if (footerVal) footerVal.textContent = fmt(report.header.totalTaxes) + " FCFA";

    if (typeof updateStickyColumns === 'function') updateStickyColumns();
}

/**
 * Render function for 'Payroll Journal Posting' (paylist-journal.html)
 * Mirrors Tax Sheet logic as per request.
 */
window.initPaylistJournal = async function (forceRefresh = false) {
    // Re-use Tax logic as the columns were requested to be the same
    await initPaylistTax(forceRefresh);

    // Open the Journal Posting Modal automatically when this screen loads
    setTimeout(() => {
        if (window.payrollReportCache.data.length > 0) {
            openJournalPostingModal();
        }
    }, 300);
}

/**
 * Injects and opens the Payroll Journal Recordings modal.
 * Based on 3 Button Journal Entries.jpg
 */
function openJournalPostingModal() {
    // Avoid duplicate modals
    if (document.getElementById('MODAL_JournalPosting')) {
        document.getElementById('MODAL_JournalPosting').style.display = 'flex'; // Show existing modal
        return;
    }

    // Calculate Totals for the Journal based on samplePayrollData
    const data = window.payrollReportCache.data;
    let totalGross = 0, totalEmpTaxes = 0, totalCNPS = 0, totalNet = 0, totalLoans = 0;

    data.forEach(d => {
        totalGross += d.grossSalary;
        totalEmpTaxes += d.totalEmployeeTaxes;
        totalCNPS += d.totalEmployerCNPS;

        totalNet += d.netSalary;
        totalLoans += (d.loanDeductions + d.advanceSalary);
    });

    const grandTotal = totalGross + totalEmpTaxes + totalCNPS;

    const modalHtml = `
        <div id="MODAL_JournalPosting" class="coa-modal-overlay" style="display: flex; align-items: center; justify-content: center; position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 10001;"> 
            <div class="coa-modal" style="width: 750px; background: #fff; border-radius: 4px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                <div class="coa-modal-header" style="background: #f8f9fa; border-bottom: 1px solid #dee2e6; padding: 10px 15px; display: flex; justify-content: space-between; align-items: center;">
                    <div style="flex: 1; text-align: center; font-weight: bold; font-size: 18px; color: #005a9e;">Institute Name</div> 
                    <div style="cursor: pointer; font-size: 20px;" onclick="document.getElementById('MODAL_JournalPosting').style.display='none'">&times;</div>
                </div>
                <div style="padding: 15px; background: #fff;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <div style="color: #cd2027; font-weight: bold; font-size: 14px;">PayRoll Journal Recordings for the Period</div>
                        <div style="font-size: 12px;">Date <input type="text" value="3/16/2026" style="width: 80px; padding: 2px; border: 1px solid #ccc;"></div>
                    </div>
                    
                    <table class="wd-table" style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 15px;">
                        <thead>
                            <tr style="background: #333; color: #fff;">
                                <th style="text-align: left; padding: 8px;">ACCOUNT No AND ACCOUNT NAME</th>
                                <th style="width: 100px; text-align: right; padding: 8px;">DR</th>
                                <th style="width: 100px; text-align: right; padding: 8px;">CR</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>6611000 Gross salaries and wages expense</td><td style="text-align: right;">${fmt(totalGross)}</td><td></td></tr>
                            <tr><td>6414000 Employer payroll Taxes</td><td style="text-align: right;">${fmt(totalEmpTaxes)}</td><td></td></tr>
                            <tr><td>6415000 Employer's CNPS expenses</td><td style="text-align: right;">${fmt(totalCNPS)}</td><td></td></tr>
                            <tr><td>4010500 STAFF ACCRUED SALARIES (MAY, JUNE, JL)</td><td></td><td style="text-align: right;">${fmt(totalNet)}</td></tr>
                            <tr><td>4010500 STAFF ACCRUED SALARIES (MAY, JUNE, JL)</td><td></td><td style="text-align: right;">${fmt(totalEmpTaxes)}</td></tr>
                            <tr><td>4010400 P&T LOAN REPAYMENT (PRINCIPAL + INTE)</td><td></td><td style="text-align: right;">${fmt(totalLoans)}</td></tr>
                        </tbody>
                        <tfoot>
                            <tr style="font-weight: bold; border-top: 2px solid #333;">
                                <td>TOTAL <span style="display: block; font-size: 10px; font-weight: normal;">To Record Accrued PayRoll Expenses for December 2025</span></td>
                                <td style="text-align: right;">${fmt(grandTotal)}</td>
                                <td style="text-align: right;">${fmt(grandTotal)}</td>
                            </tr>
                        </tfoot>
                    </table>

                    <table class="wd-table" style="width: 100%; border-collapse: collapse; font-size: 12px;">
                        <thead>
                            <tr style="background: #005a9e; color: #fff;">
                                <th style="text-align: left; padding: 8px;">ACCOUNT NO AND ACCOUNT NAME</th>
                                <th style="width: 100px; text-align: right; padding: 8px;">DR</th>
                                <th style="width: 100px; text-align: right; padding: 8px;">CR</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>52/57 Cash/Bank</td><td style="text-align: right;">${fmt(grandTotal)}</td><td></td></tr>
                            <tr><td>4010500 STAFF ACCRUED SALARIES (MAY, JUNE, JL)</td><td></td><td style="text-align: right;">${fmt(totalNet)}</td></tr>
                            <tr><td>4010500 STAFF ACCRUED SALARIES (MAY, JUNE, JL)</td><td></td><td style="text-align: right;">${fmt(totalEmpTaxes)}</td></tr>
                            <tr><td>4010400 P&T LOAN REPAYMENT (PRINCIPAL + INTE)</td><td></td><td style="text-align: right;">${fmt(totalLoans)}</td></tr>
                        </tbody>
                        <tfoot>
                            <tr style="font-weight: bold; border-top: 2px solid #005a9e;">
                                <td>TOTAL <span style="display: block; font-size: 10px; font-weight: normal;">To Record Payment of Salaries and Taxes for December 2025</span></td>
                                <td style="text-align: right;">${fmt(grandTotal)}</td>
                                <td style="text-align: right;">${fmt(grandTotal)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <div style="background: #f0f0f0; padding: 12px; display: flex; justify-content: center; gap: 15px;">
                    <button class="wd-action-btn primary" onclick="handleJournalPosting()">Post Transaction <i class="fa-solid fa-circle-check"></i></button>
                    <button class="wd-action-btn danger" onclick="document.getElementById('MODAL_JournalPosting').style.display='none'">Close <i class="fa-solid fa-circle-xmark"></i></button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

/**
 * Workflow for posting the journal with double confirmation popups.
 */
function handleJournalPosting() {
    // First confirmation popup
    showConfirmModal({
        title: "Journal Entries for Payroll",
        message: "Please confirm that the selected date corresponds to the PayRoll Date before posting. This Operation CANNOT be reversed.",
        okText: "Proceed",
        cancelText: "Cancel",
        onOk: () => {
            // Second confirmation popup (Final Warning)
            showConfirmModal({
                title: "Journal Entries for Payroll",
                message: "Please Confirm again one last time.",
                okText: "Its Ok Post Now",
                cancelText: "No Abort",
                onOk: () => {
                    // Close the main modal
                    const modal = document.getElementById('MODAL_JournalPosting');
                    if (modal) modal.style.display = 'none';

                    // Success Alert
                    if (typeof showAlert === 'function') {
                        showAlert("Posting was successful", "success");
                    } else {
                        alert("Posting was successful");
                    }
                }
            });
        }
    });
}

/**
 * Generates and prints reports based on the provided printing.html template.
 * @param {string} type - 'paylist', 'cnps', 'tax', 'journal', 'payslip'
 */
window.printReport = function (type) {
    // Styles extracted from printing.html
    const styles = `
        body { font-family: Arial, sans-serif; background-color: #fff; margin: 0; padding: 0; display: block; }
        .page { background: white; width: 100%; height: 100%; display: flex; box-sizing: border-box; flex-direction: column; padding: 1cm; margin: 0; }
        .doc-content { flex: 1 1 auto; }
        .doc-header { margin-bottom: 12px; }
        .doc-header h2 { margin: 0; font-size: 16px; text-transform: uppercase; font-weight: bold; text-align: center;}
        .doc-header h3 { margin: 4px 0 0 0; font-size: 13px; text-transform: uppercase; font-weight: normal; text-align: center;}
        .doc-meta { display: flex; justify-content: space-between; font-size: 10px; margin-top: 8px; font-weight: bold; }
        .meta-left, .meta-right { display: flex; flex-direction: column; }
        .meta-right { text-align: right; }
        .doc-footer { margin-top: auto; display: flex; justify-content: space-between; font-size: 9px; border-top: 1px solid #ccc; padding-top: 4px; padding-bottom: 4px; width: 100%; }
        
        table { width: 100%; border-collapse: collapse; font-size: 8.5px; margin-bottom: 10px; table-layout: auto; }
        th, td { border: 1px solid #000; padding: 3px 2px; text-align: right; vertical-align: middle; white-space: nowrap; }
        th { background-color: #fff; text-align: center; font-weight: bold; white-space: normal; }
        .text-left { text-align: left !important; }
        .text-center { text-align: center !important; }
        .no-border { border: none !important; }

        .payslip-details-grid { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 12px; border: 1px solid #000; padding: 8px; }
        .payslip-details-grid div { line-height: 1.5; }
        .summary-box { width: 45%; border: 1px solid #000; padding: 5px; margin-top: 5px; font-size: 10px; }
        .summary-box table { margin: 0; border: none; font-size: 10px; }
        .summary-box th, .summary-box td { border: none; padding: 2px 0; }
        .signatures { display: flex; justify-content: space-between; margin-top: 30px; font-weight: bold; font-size: 11px; }
        .legend { font-size: 9px; margin-top: auto; line-height: 1.3; border-top: 1px solid #ccc; padding-top: 5px; }

        @page { margin: 0; }
        @media print {
            body { margin: 0; padding: 0; }
            .page { margin: 0; border: none; width: 100vw; height: 100vh; padding: 0.5cm 1cm; page-break-after: always; }
            .landscape { size: landscape; }
            .portrait { size: portrait; }
        }
    `;

    let content = '';
    const orientation = (type === 'payslip') ? 'portrait' : 'landscape';
    const companyName = "Institute Name"; // Placeholder
    const data = window.payrollReportCache.data;
    const printDate = new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' });

    if (type === 'paylist') {
        let rows = '', sums = { gross: 0, basic: 0, taxable: 0, irpp: 0, cac: 0, ccf: 0, rav: 0, council: 0, cnps: 0, net: 0, netPay: 0 };
        data.forEach((d, idx) => {
            const totalPayrollDed = d.totalPayrollDeductions;
            const netSalary = d.netSalary;

            sums.gross += d.grossSalary; sums.basic += d.basicSalary; sums.taxable += d.grossTaxableSalary;
            sums.irpp += d.pitIrpp; sums.cac += d.cacIrpp; sums.ccf += d.ccfEmployee; sums.rav += d.rav; sums.council += d.councilTax;
            sums.cnps += d.cnpsAmount; sums.net += netSalary; sums.netPay += d.netPayment;

            rows += `<tr>
                <td class="text-center">${idx + 1}</td><td class="text-left">${d.fullName}</td>
                <td>${fmt(d.grossSalary)}</td><td>${fmt(d.basicSalary)}</td><td>0</td><td>0</td><td>0</td>
                <td>0</td><td>0</td><td>0</td><td>0</td><td>${fmt(d.grossTaxableSalary)}</td>
                <td>${fmt(d.pitIrpp)}</td><td>${fmt(d.cacIrpp)}</td><td>${fmt(d.ccfEmployee)}</td><td>${fmt(d.rav)}</td>
                <td>${fmt(d.councilTax)}</td><td>${fmt(d.cnpsAmount)}</td>
                <td>${fmt(netSalary)}</td><td>0</td><td>${fmt(d.netPayment)}</td>
            </tr>`;
        });

        content = `
            <div class="doc-header">
                <h2>${companyName}</h2>
                <h3>PAYLIST REPORT FOR THE PERIOD</h3>
                <div class="doc-meta">
                    <div class="meta-left"><span>${window.payrollFilterState.month.toUpperCase()} ${window.payrollFilterState.year}</span><span>${(document.getElementById('PB_Filter_Dept')?.selectedOptions[0]?.text) || '---Display All---'}</span><span>${(document.getElementById('PB_Filter_Branch')?.selectedOptions[0]?.text) || '---All Branches---'}</span></div>
                    <div class="meta-right"><span>Printed</span><span>${printDate}</span></div>
                </div>
            </div>
            <table>
                <thead>
                    <tr><th>SN</th><th>Staff Names</th><th>Gross<br>Salary</th><th>Basic<br>Salary</th><th>Over<br>Time</th><th>Housing<br>Allow</th><th>Senority<br>Bonus</th><th>Duty<br>Allow</th><th>Resch<br>Allow</th><th>Transp<br>Allow</th><th>Rep<br>Allow</th><th>Gross<br>Taxable</th><th>IRPP<br>(PIT)</th><th>CAC<br>(ACT)</th><th>CCF<br>(LBT)</th><th>RAV<br>(AVT)</th><th>COUNCI<br>L TAX</th><th>CNPS</th><th>NET<br>SALARY</th><th>Others</th><th>NET<br>PAYMENT</th></tr>
                </thead>
                <tbody>${rows}</tbody>
                <tfoot>
                    <tr style="font-weight: bold; background-color: #f9f9f9;">
                        <td colspan="2" class="text-center">TOTAL</td>
                        <td>${fmt(sums.gross)}</td><td>${fmt(sums.basic)}</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td>
                        <td>${fmt(sums.taxable)}</td><td>${fmt(sums.irpp)}</td><td>${fmt(sums.cac)}</td><td>${fmt(sums.ccf)}</td>
                        <td>${fmt(sums.rav)}</td><td>${fmt(sums.council)}</td><td>${fmt(sums.cnps)}</td><td>${fmt(sums.net)}</td>
                        <td>0</td><td>${fmt(sums.netPay)}</td>
                    </tr>
                </tfoot>
            </table>`;
    }
    else if (type === 'cnps') {
        let rows = '', sums = { gross: 0, basic: 0, pvEmp: 0, pvEmpr: 0, atAf: 0, total: 0, grossTot: 0 };
        data.forEach((d, idx) => {
            const atAf = d.riskAllowanceAT + d.familyAllowanceAF;
            const totalEmpr = d.pvEmployer + atAf;
            const grossTot = d.pvEmployee + totalEmpr;

            sums.gross += d.grossSalary; sums.basic += d.basicSalary;
            sums.pvEmp += d.pvEmployee; sums.pvEmpr += d.pvEmployer; sums.atAf += atAf;
            sums.total += totalEmpr; sums.grossTot += grossTot;

            rows += `<tr>
                <td class="text-center">${idx + 1}</td><td class="text-left">${d.fullName}</td>
                <td>${fmt(d.grossSalary)}</td><td>${fmt(d.basicSalary)}</td>
                <td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td>
                <td>${fmt(d.pvEmployee)}</td><td>${fmt(d.pvEmployer)}</td><td>${fmt(d.riskAllowanceAT)}<br><br>${fmt(d.familyAllowanceAF)}</td>
                <td>${fmt(totalEmpr)}</td><td>${fmt(grossTot)}</td>
            </tr>`;
        });

        content = `
            <div class="doc-header">
                <h2>${companyName}</h2>
                <h3>CNPS WITHHELD ON TAX REPORT<br>DECEMBER 2025</h3>
                <div class="doc-meta"><div class="meta-left"></div><div class="meta-right"><span>Printed</span><span>${printDate}</span></div></div>
            </div>
            <table>
                <thead>
                    <tr><th colspan="13" class="no-border"></th><th colspan="1">EE</th><th colspan="3">EMPLOYER</th><th class="no-border"></th></tr>
                    <tr><th>SN</th><th>Staff Names</th><th>Gross<br>Salary</th><th>Basic<br>Salary</th><th>Over<br>Time</th><th>Housing<br>Allow</th><th>Senority<br>Bonus</th><th>Water<br>Allow</th><th>Electricity<br>Allow</th><th>Duty<br>Allow</th><th>Research<br>Allow</th><th>Transport<br>Allow</th><th>Rep<br>Allow</th><th>PV</th><th>PV</th><th>AT<br><br>AF</th><th>Total</th><th>GROSS<br>TOTAL</th></tr>
                </thead>
                <tbody>${rows}</tbody>
                <tfoot>
                    <tr style="font-weight: bold; background-color: #f9f9f9;">
                        <td colspan="2" class="text-center">TOTAL</td>
                        <td>${fmt(sums.gross)}</td><td>${fmt(sums.basic)}</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td>
                        <td>${fmt(sums.pvEmp)}</td><td>${fmt(sums.pvEmpr)}</td><td>${fmt(samplePayrollData.reduce((a, b) => a + b.at, 0))}<br><br>${fmt(samplePayrollData.reduce((a, b) => a + b.af, 0))}</td>
                        <td>${fmt(sums.total)}</td><td>${fmt(sums.grossTot)}</td>
                    </tr>
                </tfoot>
            </table>`;
    }
    else if (type === 'tax' || type === 'journal') {
        const title = (type === 'journal') ? "PAYROLL JOURNAL POSTING" : "TAX REPORT | TAXES WITHHELD ON WAGES";
        let rows = '', sums = { gross: 0, basic: 0, taxable: 0, irpp: 0, cac: 0, ccf: 0, rav: 0, council: 0, totEmp: 0, ccfEmpr: 0, nef: 0, totEmpr: 0, grandTot: 0 };

        data.forEach((d, idx) => {
            const totEmp = d.totalEmployeeTaxes;
            const totEmpr = d.totalEmployerTaxes;
            const grandTot = d.totalTaxes;

            sums.gross += d.grossSalary; sums.basic += d.basicSalary; sums.taxable += d.grossTaxableSalary;
            sums.irpp += d.pitIrpp; sums.cac += d.cacIrpp; sums.ccf += d.ccfEmployee; sums.rav += d.rav; sums.council += d.councilTax;
            sums.totEmp += totEmp; sums.ccfEmpr += d.ccfEmployer; sums.nef += (d.fneEmployerCharge || 0); sums.totEmpr += totEmpr; sums.grandTot += grandTot;

            rows += `<tr>
                <td class="text-left">${idx + 1} ${d.fullName}</td>
                <td>${fmt(d.grossSalary)}</td><td>${fmt(d.basicSalary)}</td>
                <td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td>
                <td>${fmt(d.grossTaxableSalary)}</td>
                <td>${fmt(d.pitIrpp)}</td><td>${fmt(d.cacIrpp)}</td><td>${fmt(d.ccfEmployee)}</td><td>${fmt(d.rav)}</td><td>${fmt(d.councilTax)}</td>
                <td>${fmt(totEmp)}</td><td>${fmt(d.ccfEmployer)}</td><td>${fmt(d.fneEmployerCharge)}</td><td>${fmt(totEmpr)}</td>
                <td>${fmt(grandTot)}</td>
            </tr>`;
        });

        content = `
            <div class="doc-header">
                <h2>${companyName}</h2>
                <h3>${title}<br>DECEMBER 2025</h3>
                <div class="doc-meta"><div class="meta-left"></div><div class="meta-right"><span>Printed</span><span>${printDate}</span></div></div>
            </div>
            <table>
                <thead>
                    <tr><th colspan="11" class="no-border"></th><th colspan="6">EMPLOYEES</th><th colspan="3">EMPLOYER</th><th class="no-border"></th></tr>
                    <tr><th>Staff Names<br><br>SN</th><th>Gross<br>Salary</th><th>Basic<br>Salary</th><th>Over<br>Time</th><th>Housing<br>Allow</th><th>Senrty<br>Bonus</th><th>Duty<br>Allow</th><th>Resch<br>Allow</th><th>Transp<br>Allow</th><th>Rep<br>Allow</th><th>Gross<br>Taxable</th><th>IRPP<br>(PIT)</th><th>CAC<br>(ACT)</th><th>CCF<br>(LBT)</th><th>RAV<br>(AVT)</th><th>COUNCIL<br>TAX</th><th>Total</th><th>CCF<br>(LBT)</th><th>NEF</th><th>Total</th><th>TOTAL<br>TAXES</th></tr>
                </thead>
                <tbody>${rows}</tbody>
                <tfoot>
                    <tr style="font-weight: bold; background-color: #f9f9f9;">
                        <td class="text-left">TOTAL</td>
                        <td>${fmt(sums.gross)}</td><td>${fmt(sums.basic)}</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td>
                        <td>${fmt(sums.taxable)}</td>
                        <td>${fmt(sums.irpp)}</td><td>${fmt(sums.cac)}</td><td>${fmt(sums.ccf)}</td><td>${fmt(sums.rav)}</td><td>${fmt(sums.council)}</td>
                        <td>${fmt(sums.totEmp)}</td><td>${fmt(sums.ccfEmpr)}</td><td>${fmt(sums.nef)}</td><td>${fmt(sums.totEmpr)}</td>
                        <td>${fmt(sums.grandTot)}</td>
                    </tr>
                </tfoot>
            </table>`;
    }
    else if (type === 'payslip') {
        const emp = data[0]; // Printing first employee for demo
        const totalPayDed = emp.totalPayrollDeductions;
        const netPay = emp.netPayment;

        content = `
            <div class="doc-header" style="margin-bottom: 5px;">
                <h2>${companyName}</h2>
                <div style="font-size: 11px;">Email: Tel: (+237)<br>Authorization No:</div>
            </div>
            
            <div class="payslip-details-grid">
                <div>
                    <strong>Names:</strong> ${emp.fullName}<br><strong>Category:</strong> A<br><strong>Echelon:</strong> 1<br><strong>Emplym't Date:</strong> ${emp.salaryDate}<br>
                    <strong>Matricule:</strong> ${emp.matricule}<br><strong>Post:</strong> Dev<br><strong>Family Status:</strong> Single
                </div>
                <div>
                    <strong style="font-size: 14px; text-decoration: underline;">Payslip</strong><br>
                    <strong>Month:</strong> December<br><strong>Year:</strong> 2025<br>
                    <strong>Employer CNPS No:</strong> <br><strong>Payment Mode:</strong> Bank Transfer
                </div>
                <div style="text-align: right;"><br><br><strong>S/N:</strong> ${emp.id}<br><strong>Conges Cumule: 0</strong></div>
            </div>
            
            <table style="font-size: 10px;">
                <thead>
                    <tr><th colspan="2" class="no-border"></th><th colspan="2" style="border-bottom:none;">Salary</th><th colspan="2" style="border-bottom:none;">Elements</th><th colspan="2" style="border-bottom:none;">Elements</th><th class="no-border"></th></tr>
                    <tr><th>S/N</th><th class="text-left">DESCRIPTION</th><th>BASE</th><th>Rate<br>(%)</th><th>BENEFITS<br>TAXABLE</th><th>NON-TAX<br>ABLE</th><th>Deductions<br>BASE</th><th>Rate</th><th>AMOUNT</th></tr>
                </thead>
                <tbody>
                    <tr><td>1</td><td class="text-left">Basic Salary:</td><td>${fmt(emp.basicSalary)}</td><td></td><td>${fmt(emp.basicSalary)}</td><td>${fmt(emp.basicSalary)}</td><td></td><td></td><td></td></tr>
                    <tr><td>ab</td><td class="text-left">Personal Income Tax (IRPP)<br>CAC IRPP</td><td>${fmt(emp.grossTaxableSalary)}<br>${fmt(emp.pitIrpp)}</td><td>10</td><td></td><td></td><td>${fmt(emp.pitIrpp)}<br>${fmt(emp.cacIrpp)}</td><td></td><td></td></tr>
                    <tr><td>C</td><td class="text-left">Council Tax (TC)</td><td>${fmt(emp.grossTaxableSalary)}</td><td></td><td></td><td></td><td>${fmt(emp.councilTax)}</td><td></td><td></td></tr>
                    <tr><td>d</td><td class="text-left">Land Tax (CFC)</td><td>${fmt(emp.grossTaxableSalary)}</td><td>1</td><td></td><td></td><td>${fmt(emp.ccfEmployee)}</td><td>(A)</td><td>${fmt(totalPayDed)}<br>CFAF</td></tr>
                    <tr><td>e</td><td class="text-left">Audio visual tax (RAV)</td><td>${fmt(emp.grossTaxableSalary)}</td><td></td><td></td><td></td><td>${fmt(emp.rav)}</td><td></td><td></td></tr>
                    <tr><td>f</td><td class="text-left">Social Ins. (CNPS)</td><td>${fmt(emp.grossTaxableSalary)}</td><td>4.2</td><td></td><td></td><td>${fmt(emp.cnpsAmount)}</td><td></td><td></td></tr>
                    <tr><td>g</td><td class="text-left">CFC (Employer's Charge)</td><td>${fmt(emp.grossTaxableSalary)}</td><td>1.5</td><td></td><td></td><td>${fmt(emp.ccfEmployer)}</td><td></td><td></td></tr>
                    <tr><td>h</td><td class="text-left">FNE (Employer's charge)</td><td>${fmt(emp.grossTaxableSalary)}</td><td>1.0</td><td></td><td></td><td>${fmt(emp.fneEmployerCharge || 0)}</td><td>B</td><td></td></tr>
                    <tr><td colspan="9" class="text-left"><strong>Other Deductions</strong></td></tr>
                    <tr><td colspan="9" class="text-left"><strong>Social Contributions</strong></td></tr>
                    <tr><td>!</td><td class="text-left">CNPS (Employee's charge)</td><td></td><td></td><td></td><td></td><td>${fmt(emp.grossTaxableSalary)}</td><td>4.2</td><td>${fmt(emp.pvEmployee)}</td></tr>
                    <tr><td>!!</td><td class="text-left">CNPS (Employer's charge)</td><td></td><td></td><td></td><td></td><td>${fmt(emp.grossTaxableSalary)}</td><td>8.4</td><td>${fmt(emp.pvEmployer)}</td></tr>
                    <tr style="font-weight:bold;"><td>TOTAL</td><td></td><td></td><td>(X) ${fmt(emp.grossSalary)}</td><td>(Y) ${fmt(emp.grossTaxableSalary)}</td><td></td><td></td><td></td><td></td></tr>
                </tbody>
            </table>

            <div style="font-weight: bold; margin-bottom: 5px; font-size: 11px;">Social Contribution</div>
            <div class="summary-box">
                <table>
                    <tr><td class="text-left">Gross Salary</td><td class="text-right">${fmt(emp.grossSalary)} CFAF</td></tr>
                    <tr><td class="text-left">Payroll Deductions (a to f)</td><td class="text-right">(${fmt(totalPayDed)}) CFAF</td></tr>
                    <tr><td class="text-left">Other Deductions</td><td class="text-right">0 CFAF</td></tr>
                    <tr><th class="text-left">Net Pay</th><th class="text-right">${fmt(netPay)} CFAF</th></tr>
                </table>
            </div>

            <div class="signatures">
                <div>Sign Employer & Date</div>
                <div>Sign Employee & Date</div>
            </div>
            <div class="legend">
                Copyright. (2024). MyHCM PRO. All Rights Reserved.<br>
                <div style="float: right; margin-top: -12px;">Powered by AfricReNov</div>
            </div>`;
    }

    const win = window.open('', '_blank', 'width=1000,height=800');
    win.document.write(`
        <html>
        <head><title>Print Report</title><style>${styles}</style></head>
        <body>
            <div class="page ${orientation}">
                <div class="doc-content">${content}</div>
                <div class="doc-footer">
                    <span>Copyright(c)2025. MyHCM PRO</span>
                    <span>Page 1/1</span>
                    <span>Powered by AfricReNov Group Sarl.</span>
                </div>
            </div>
            <script>window.onload = function() { setTimeout(function(){ window.print(); window.close(); }, 500); }</script>
        </body>
        </html>
    `);
    win.document.close();
};