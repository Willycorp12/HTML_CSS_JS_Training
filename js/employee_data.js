// js/employee_data.js

// Global tracking state matching your required backend status filters
window.currentMasterStaffStatus = 0;

// Track the employee currently being modified (null for creation mode)
window.currentEditingEmployeeId = null;

// Local cache to map numeric backend lookup IDs back to clean display strings
window.masterLookupCache = { branches: [], departments: [], positions: [], employeeTypes: [], categories: [], echelons: [] };

// State to hold current list for search/filtering
window.currentEmployeeDataList = [];

// Mock Data for Employee List (Matches fields in printing.html)

/**
 * Renders the employee table based on provided data.
 */
window.renderEmployeeTable = function(data = []) {
    console.log("renderEmployeeTable: Called with data:", data);
    // Find the currently visible table container to render the correct tab's data
    const activeContent = Array.from(document.querySelectorAll('.employee-table-container'))
        .find(el => el.style.display !== 'none');
    
    const tbody = activeContent ? activeContent.querySelector('table tbody') : document.querySelector('.employee-list-table tbody');
    
    if (!tbody) return;
    console.log("renderEmployeeTable: Active content for rendering:", activeContent);
    tbody.innerHTML = '';

    const getName = (list, id) => {
        const item = list.find(x => x.id == id || x.value == id);
        return item ? (item.name || item.label || item.text) : '---';
    };

    data.forEach((d, idx) => {
        const branchName = getName(window.masterLookupCache.branches, d.branchId);
        const deptName = getName(window.masterLookupCache.departments, d.departmentId);
        const posName = getName(window.masterLookupCache.positions, d.positionId);
        const typeName = getName(window.masterLookupCache.employeeTypes, d.payBasis);

        const tr = document.createElement('tr');
        tr.dataset.id = d.employeeId;
        tr.innerHTML = `
            <td class="fixed-col">${idx + 1}</td>
            <td class="fixed-col">${d.matricule}</td>
            <td class="fixed-col">${d.fullName}</td>
            <td class="fixed-col">${d.employmentDate || '---'}</td>
            <td>Taxable</td>
            <td>${d.telephone1 || '---'}</td>
            <td>${d.serialNumber || '0'}</td>
            <td>${d.cnpsNo || '---'}</td>
            <td>${d.staffStatus == 1 ? 'Active' : 'Suspended'}</td>
            <td>${posName}</td>
            <td>${branchName}</td>
            <td>${typeName}</td>
            <td>${deptName}</td>
            <td>${getName(window.masterLookupCache.categories, d.categoryId)}</td>
            <td>${getName(window.masterLookupCache.echelons, d.echelonId)}</td>
            <td>${d.address || '---'}</td>
            <td>${d.email || '---'}</td>
            <td class="amount">${Number(d.basicSalary || 0).toLocaleString()}</td>
            <td class="amount">0</td><td class="amount">0</td><td class="amount">0</td>
            <td class="amount">0</td><td class="amount">0</td><td class="amount">0</td>
            <td class="amount">0</td><td class="amount">0</td><td class="amount">0</td>
            <td class="amount">0</td><td class="amount">0</td>
        `;
        tbody.appendChild(tr);
    });

    // Add filler rows
    for (let i = data.length; i < 15; i++) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td class="fixed-col">&nbsp;</td><td class="fixed-col"></td><td class="fixed-col"></td><td class="fixed-col"></td>${'<td></td>'.repeat(25)}`;
        tbody.appendChild(tr);
    }
};

/**
 * Fetches employee list from backend with current filters
 */
window.fetchEmployeeList = async function() {
    console.log("fetchEmployeeList: Initiating fetch...");
    const branchId = document.getElementById('MASTER_BRANCH_FILTER')?.value || 0;
    const departmentId = document.getElementById('MASTER_DEPT_FILTER')?.value || 0;

    const payload = {
        staffStatus: window.currentMasterStaffStatus,
        branchId: parseInt(branchId),
        departmentId: parseInt(departmentId)
    };

    console.log("fetchEmployeeList: Sending payload:", payload);

    try {
        const response = await apiFetch('/api/v1/payroll/getEmployeeList', {
            method: 'POST',
            body: payload
        });

        if (response && response.success) {
            console.log("fetchEmployeeList: API response successful:", response);
            window.currentEmployeeDataList = response.data || [];
            window.renderEmployeeTable(window.currentEmployeeDataList);
        } else {
            console.error("fetchEmployeeList: API returned failure:", response?.message);
            console.error("Failed to load employee list:", response?.message);
        }
    } catch (error) {
        console.error("Error fetching employee list:", error);
    }
};

/**
 * Loads lookups for the master screen and populates filter dropdowns.
 */
window.loadEmployeeMasterData = async function() {
    console.log("loadEmployeeMasterData: Starting to load filters and initial data...");

    try {
        console.log("loadEmployeeMasterData: Fetching lookup data from /api/v1/payroll/lookups/employeeCreate");
        const response = await apiFetch('/api/v1/payroll/lookups/employeeCreate', { method: 'GET' });
        
        if (response && response.success) {
            console.log("loadEmployeeMasterData: Lookup data fetched successfully:", response.data);
            const d = response.data;
            // Cache everything for table resolution
            window.masterLookupCache = {
                branches: d.branches || [],
                departments: d.departments || [],
                positions: d.positions || [],
                employeeTypes: d.employeeTypes || [],
                categories: d.categories || [],
                echelons: d.echelons || [],
                titles: d.titles || [],
                genders: d.genders || [],
                civilStatus: d.civilStatus || [],
                nationalities: d.nationalities || [],
                denominations: d.denominations || [],
                staffStatuses: d.staffStatuses || []
            };

            // Populate Filters
            const populateFilter = (id, items) => {
                const sel = document.getElementById(id);
                console.log(`populateFilter: Populating ${id} with ${items.length} items.`);
                if (!sel) return;
                // Keep the first "All" option
                const firstOpt = sel.options[0];
                sel.innerHTML = '';
                sel.appendChild(firstOpt);

                items.forEach(it => {
                    const opt = document.createElement('option');
                    opt.value = it.id || it.value;
                    opt.textContent = it.name || it.label || it.text;
                    sel.appendChild(opt);
                });
            };

            populateFilter('MASTER_BRANCH_FILTER', window.masterLookupCache.branches);
            populateFilter('MASTER_DEPT_FILTER', window.masterLookupCache.departments);
        } else {
            console.error("loadEmployeeMasterData: Lookup API returned failure:", response?.message);
        }

        // Initial Data Fetch
        console.log("loadEmployeeMasterData: Triggering initial employee list fetch.");
        await window.fetchEmployeeList();

    } catch (error) {
        console.error("Error initializing employee master lookups:", error);
    }
};

/**
 * Closes the Create Employee Modal.
 */
window.closeCreateEmployeeModal = function() {
    const el = document.getElementById('create-employee-overlay');
    if (el) el.style.display = 'none';
};

/**
 * Opens the Create Employee Modal.
 * dynamically fetches the HTML if not present in the DOM.
 * @param {number|string|null} employeeId If provided, modal opens in Modify mode.
 */
window.openCreateEmployeeModal = async function(employeeId = null) {
    let el = document.getElementById('create-employee-overlay');
    
    // Dynamic injection if missing (e.g. when on employee-master.html)
    if (!el) {
        try {
            const response = await fetch(resolveScreenPath('employee-create.html'));
            if (response.ok) {
                const html = await response.text();
                document.body.insertAdjacentHTML('beforeend', html);
                el = document.getElementById('create-employee-overlay');
                // Initialize the newly injected modal
                if (window.initEmployeeCreate) window.initEmployeeCreate();
            } else {
                console.error("Failed to load employee-create.html");
                return;
            }
        } catch (error) {
            console.error("Error fetching employee-create.html", error);
            return;
        }
    }

    if (el) {
        el.style.display = 'flex';
        injectPayslipSetupModal(); // Pre-inject the payslip modal if not present

        const titleEl = el.querySelector('.asset-header .asset-title');
        const submitBtn = el.querySelector('.po-modal-footer button.primary');

        if (employeeId) {
            window.currentEditingEmployeeId = employeeId;
            if (titleEl) titleEl.textContent = "Modify Employee Details";
            if (submitBtn) submitBtn.innerHTML = 'Update Record <i class="fa-solid fa-save"></i>';
            
            try {
                const response = await apiFetch(`/api/v1/payroll/getEmployeeDetails/${employeeId}`, { method: 'GET' });
                if (response && response.success) {
                    populateEmployeeForm(response.data);
                } else {
                    showAlert(response?.message || "Failed to load details.", "error");
                }
            } catch (e) { console.error(e); }
        } else {
            resetEmployeeCreateForm();
            if (titleEl) titleEl.textContent = "Creating a New Employee";
            if (submitBtn) submitBtn.innerHTML = 'Validate <i class="fa-solid fa-circle-check"></i>';
        }

        // Reset to Basic Info tab
        const firstTab = el.querySelector('.asset-tab');
        if (firstTab) switchEmployeeCreateTab('TAB_BasicInfo', firstTab);
    }
};

/**
 * Populates the creation/modification modal with data from the backend.
 */
function populateEmployeeForm(d) {
    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.value = (val === "0" || val === 0) ? "" : (val || "");
    };

    const setFCFA = (id, val) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.value = Number(val || 0).toLocaleString('en-US') + " FCFA";
    };

    // Basic Info Tab
    setVal('EMP_STATUS', d.staffStatus);
    setVal('EMP_MATRICULE', d.matricule);
    setVal('EMP_TITLE', d.titleId);
    setVal('EMP_FIRST_NAME', d.firstName);
    setVal('EMP_MIDDLE_NAME', d.middleName);
    setVal('EMP_LAST_NAME', d.lastName);
    setVal('EMP_FULL_NAME', d.fullName);
    setVal('EMP_TELEPHONE', d.telephone1);
    setVal('EMP_TEL2', d.telephone2);
    setVal('EMP_EMAIL', d.email);
    setVal('EMP_GENDER', d.genderId);
    setVal('EMP_CIVIL_STATUS', d.civilStatus);
    setVal('EMP_BRANCH', d.branchId);
    setVal('EMP_DEPARTMENT', d.departmentId);
    setVal('EMP_POST', d.positionId);
    setVal('EMP_CATEGORY', d.categoryId);
    setVal('EMP_ECHELON', d.echelonId);
    setVal('EMP_EMPLOYEE_TYPE', d.payBasis);
    setVal('EMP_NATIONALITY', d.nationalityId);
    setVal('EMP_DENOMINATION', d.denominationId);
    setVal('EMP_CHILDREN', d.noOfChildren);
    setVal('EMP_DATE', d.employmentDate ? d.employmentDate.split('T')[0] : "");
    setVal('EMP_ADDRESS', d.address);
    setVal('EMP_POB', d.placeOfBirth);

    // More Info 1 Tab
    setVal('EMP_ICE1_NAME', d.emergencyName1);
    setVal('EMP_ICE1_TEL', d.emergencyNum1);
    setVal('EMP_ICE2_NAME', d.emergencyName2);
    setVal('EMP_ICE2_TEL', d.emergencyNum2);
    setVal('EMP_ID_TYPE', d.identification);
    setVal('EMP_ID_NUM', d.identificationNum);
    setVal('EMP_ID_PLACE', d.identificationPlace);
    setVal('EMP_NID', d.nid);
    setVal('EMP_NIU', d.niu);
    setVal('EMP_CNPS', d.cnpsNo);

    // More Info 2 Tab
    setVal('EMP_PAY_MODE', d.paymentMode || 'Cash');
    setVal('EMP_BANK_NAME', d.bankName);
    setVal('EMP_BANK_ACC', d.bankAccountNo);
    
    // Trigger UI logic for payment modes and employee types
    setTimeout(() => document.getElementById('EMP_PAY_MODE')?.dispatchEvent(new Event('change')), 100);
    document.getElementById('EMP_EMPLOYEE_TYPE')?.dispatchEvent(new Event('change'));

    // Payslip Details Integration
    setFCFA('PS_INPUT_1', d.basicSalary);
    setFCFA('PS_INPUT_2', d.overtime);
    setFCFA('PS_INPUT_3', d.seniorityBonus);
    setFCFA('PS_INPUT_4', d.dutyPostAllowance);
    setFCFA('PS_INPUT_5', d.researchAllowance);
    setFCFA('PS_INPUT_6', d.transportAllowance);
    setFCFA('PS_INPUT_7', d.representationAllowance);
    setFCFA('PS_INPUT_8', d.housingAllowance);
    setFCFA('PS_INPUT_9', d.vehicleAllowance);
    setFCFA('PS_INPUT_10', d.waterAllowance);
    setFCFA('PS_INPUT_11', d.electricityAllowance);
    setFCFA('PS_INPUT_12', d.foodAllowance);
    setFCFA('PS_INPUT_13', d.domesticAllowance);
    setFCFA('PS_INPUT_14', d.basketAllowance);
    setFCFA('PS_INPUT_32', d.medicalDeductions);

    // Update secondary displays
    const nameDisplay = document.getElementById('PAYSLIP_EmpNameDisplay');
    if (nameDisplay) nameDisplay.textContent = d.fullName.toUpperCase();
    const netDisplay = document.getElementById('PAYSLIP_NetTotal');
    if (netDisplay) netDisplay.textContent = Number(d.netPayment || 0).toLocaleString('en-US') + " FCFA";
}

/**
 * Injects necessary styles for buttons and modals if they are missing.
 */
function ensureEmployeeStyles() {
    if (document.getElementById('EMPLOYEE_MASTER_SHARED_STYLES')) return;
    const style = document.createElement('style');
    style.id = 'EMPLOYEE_MASTER_SHARED_STYLES';
    style.innerHTML = `
        .wd-btn { 
            padding: 6px 12px; border: 1px solid #999; background: #f0f0f0; 
            cursor: pointer; font-size: 12px; display: inline-flex; 
            align-items: center; gap: 6px; justify-content: center; border-radius: 4px; 
        }
        .wd-btn:hover { opacity: 0.9; background: #e0e0e0; }
        .wd-btn.primary { border-color: #2e3192; background-color: #2e3192; color: #fff; font-weight: bold; }
        .wd-btn.danger { border-color: #cd2027; background-color: #cd2027; color: #fff; font-weight: bold; }
        .wd-table tr.selected td { background-color: #cd2027 !important; color: #fff !important; }
    `;
    document.head.appendChild(style);
}

/**
 * Resets the employee form and related UI elements to a "New" state.
 */
function resetEmployeeCreateForm() {
    const overlay = document.getElementById('create-employee-overlay');
    if (!overlay) return;

    // 1. Reset standard form fields
    const form = overlay.querySelector('form');
    if (form) form.reset();

    // 2. Explicitly clear input and select values that might persist from modification mode
    const fieldsToClear = [
        'EMP_FIRST_NAME', 'EMP_MIDDLE_NAME', 'EMP_LAST_NAME', 'EMP_FULL_NAME',
        'EMP_TELEPHONE', 'EMP_TEL2', 'EMP_EMAIL', 'EMP_ADDRESS', 'EMP_POB',
        'EMP_MATRICULE', 'EMP_CHILDREN', 'EMP_DATE',
        'EMP_ICE1_NAME', 'EMP_ICE1_TEL', 'EMP_ICE2_NAME', 'EMP_ICE2_TEL',
        'EMP_ID_NUM', 'EMP_ID_PLACE', 'EMP_NID', 'EMP_NIU', 'EMP_CNPS',
        'EMP_BANK_NAME', 'EMP_BANK_ACC', 'EMP_STATUS', 'EMP_TITLE', 'EMP_GENDER', 
        'EMP_CIVIL_STATUS', 'EMP_BRANCH', 'EMP_DEPARTMENT', 'EMP_POST', 
        'EMP_CATEGORY', 'EMP_ECHELON', 'EMP_EMPLOYEE_TYPE', 'EMP_NATIONALITY', 
        'EMP_DENOMINATION', 'EMP_PAY_MODE', 'PS_STAFF_STATUS'
    ];
    fieldsToClear.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (el.tagName === 'SELECT') el.selectedIndex = 0;
        else el.value = '';
    });

    // 3. Clear fields that form.reset() might miss (like custom display spans or dataset ids)
    const nameDisplay = document.getElementById('PAYSLIP_EmpNameDisplay');
    if (nameDisplay) nameDisplay.textContent = 'NEW EMPLOYEE';
    
    const netDisplay = document.getElementById('PAYSLIP_NetTotal');
    if (netDisplay) netDisplay.textContent = '0 FCFA';

    // 3. Reset the Payslip Breakdown Table (Rows 1-49)
    const breakdownCells = document.querySelectorAll('#TABLE_PayslipBreakdown td.editable-amt');
    breakdownCells.forEach(cell => cell.textContent = '0');

    // 4. Reset sidebar amount fields
    const amountInputs = document.querySelectorAll('#MODAL_PayslipSetup .fcfa-field');
    amountInputs.forEach(inp => inp.value = '0 FCFA');

    // 5. Reset internal state
    window.currentEditingEmployeeId = null;
    window.isRecalculated = false;
    
    // 6. Trigger UI updates (like hiding bank info)
    document.getElementById('EMP_PAY_MODE')?.dispatchEvent(new Event('change'));
    document.getElementById('EMP_EMPLOYEE_TYPE')?.dispatchEvent(new Event('change'));
}

/**
 * Switches tabs within the Create Employee Modal.
 * @param {string} tabId The ID of the tab content to show (e.g., 'TAB_BasicInfo').
 * @param {HTMLElement} element The clicked tab element.
 */
window.switchEmployeeCreateTab = function(tabId, element) {
    // Deactivate all tabs
    document.querySelectorAll('#create-employee-modal .asset-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    // Activate the clicked tab
    element.classList.add('active');

    // Hide all tab content
    document.querySelectorAll('#create-employee-modal .asset-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    // Show the selected tab content
    const content = document.getElementById(tabId);
    if (content) content.classList.add('active');
};

/**
 * Switches tabs within the Employee Master Data left or right panel.
 * @param {string} tabName The name of the tab to switch to (e.g., 'department', 'all-employees').
 * @param {HTMLElement} element The clicked tab element.
 */
window.switchEmployeeMasterTab = function(tabName, element) {
    const container = element.closest('.employee-master-container');
    if (!container) return;

    // Deactivate all tabs
    container.querySelectorAll('.main-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    element.classList.add('active');

    // Hide all tab content panels
    container.querySelectorAll('.employee-table-container').forEach(content => {
        content.style.display = 'none';
    });
    
    const target = document.getElementById(tabName + '-content');
    if (target) target.style.display = 'block';
};

/**
 * Augment your workspace tab switcher to update status matrices and refetch from backend.
 * Place this inside js/employee_data.js
 */
const originalTabSwitcher = window.switchEmployeeMasterTab;
window.switchEmployeeMasterTab = function(tabName, element) {
    // Log the tab switch
    console.log("switchEmployeeMasterTab: Switched to tab:", tabName);
    const container = element.closest('.employee-master-container');
    if (!container) return;

    // 2. Map the active tab selection token safely to your required numeric filters
    if (tabName === 'all-employees') {
        window.currentMasterStaffStatus = 0;
    } else if (tabName === 'active-employees') {
        window.currentMasterStaffStatus = 1;
    } else if (tabName === 'inactive-employees') {
        window.currentMasterStaffStatus = 2;
    }

    // UI update logic (moved from previous originalTabSwitcher)
    // Deactivate all tabs
    container.querySelectorAll('.main-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    element.classList.add('active');

    // Hide all tab content panels
    container.querySelectorAll('.employee-table-container').forEach(content => {
        content.style.display = 'none';
    });
    const target = document.getElementById(tabName + '-content');
    if (target) target.style.display = 'block';
    console.log("switchEmployeeMasterTab: Displaying content for:", tabName + '-content');

    console.log("switchEmployeeMasterTab: Setting currentMasterStaffStatus to:", window.currentMasterStaffStatus);
    // 3. Re-trigger database fetch matching selected parameters
    window.fetchEmployeeList();
};

/**
 * Deletes the currently selected employee using the backend endpoint.
 */
window.deleteEmployee = async function() {
    // Find the selected row across the employee master table
    const selectedRow = document.querySelector('.employee-list-table tr.selected');
    if (!selectedRow) {
        showAlert("Please select an employee record to delete.", "error");
        return;
    }

    const employeeId = selectedRow.dataset.id;
    const employeeName = selectedRow.cells[2]?.textContent || "this employee";

    const performDelete = async () => {
        try {
            // Call the delete endpoint with PUT method and an empty body as requested
            const response = await apiFetch(`/api/v1/payroll/deleteEmployee/${employeeId}`, {
                method: 'PUT',
                body: {}
            });

            if (response) {
                // Display the server response message exactly
                showAlert(response.message, response.success ? 'success' : 'error');
                if (response.success) {
                    window.fetchEmployeeList(); // Refresh the list after successful deletion
                }
            }
        } catch (error) {
            console.error("Delete Employee Error:", error);
            showAlert("An error occurred during the deletion process.", "error");
        }
    };

    // Use the system's confirmation modal if available, otherwise browser fallback
    if (typeof showConfirmModal === 'function') {
        showConfirmModal({ title: "Confirm Deletion", message: `Are you sure you want to delete ${employeeName}?`, okText: "Delete Now", onOk: performDelete });
    } else if (confirm(`Are you sure you want to delete ${employeeName}?`)) {
        performDelete();
    }
};

/**
 * Initializes the Employee Master Screen (employee-master.html).
 */
window.initEmployeeMaster = function() {
    console.log("initEmployeeMaster: Initializing Employee Master Screen...");
    ensureEmployeeStyles();

    console.log("initEmployeeMaster: Attaching event listener for Modify button.");
    // Attach event listener for the "Modify" button on employee-master.html
    const btnModifyEmployee = document.getElementById('btn-modify-employee');
    if (btnModifyEmployee && !btnModifyEmployee.dataset.initialized) {
        btnModifyEmployee.dataset.initialized = "true";
        btnModifyEmployee.addEventListener('click', () => {
            const selectedRow = document.querySelector('.employee-list-table tr.selected');
            if (!selectedRow) {
                showAlert("Please select an employee record to modify.", "error");
                return;
            }
            window.openCreateEmployeeModal(selectedRow.dataset.id);
        });
    }

    // Attach event listener for the "Delete" button on employee-master.html
    const btnDeleteEmployee = document.getElementById('btn-delete-employee');
    if (btnDeleteEmployee && !btnDeleteEmployee.dataset.initialized) {
        btnDeleteEmployee.dataset.initialized = "true";
        btnDeleteEmployee.addEventListener('click', () => {
            window.deleteEmployee();
        });
    }

    console.log("initEmployeeMaster: Setting up search input listener.");
    // Initialize Search
    const searchInput = document.getElementById('EMPLOYEE_SEARCH');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = window.currentEmployeeDataList.filter(emp => emp.fullName.toLowerCase().includes(query) || emp.matricule.toLowerCase().includes(query));
            window.renderEmployeeTable(filtered);
        });
    }

    console.log("initEmployeeMaster: Setting up row selection listeners.");
    // Initialize row selection for all tables in this view
    const tables = document.querySelectorAll('.employee-list-table tbody, .asset-table-container tbody');
    tables.forEach(tbody => {
        // Style existing buttons in the wrapper
        const buttons = tbody.closest('.employee-master-container')?.querySelectorAll('button');
        buttons?.forEach(btn => {
            if (!btn.classList.contains('wd-btn')) {
                btn.classList.add('wd-btn');
                if (btn.textContent.includes('New')) btn.classList.add('primary');
            }
        });

        tbody.addEventListener('click', (e) => {
            const tr = e.target.closest('tr');
            if (!tr) return;
            
            // Deselect others in this table
            tbody.querySelectorAll('tr.selected').forEach(r => r.classList.remove('selected'));
            tr.classList.add('selected');
        });
    });

    console.log("initEmployeeMaster: Calling loadEmployeeMasterData for initial data and filters.");
    // Perform initial lookup load and data fetch immediately on screen load
    window.loadEmployeeMasterData();
};

/**
 * Initializes the Employee Create Screen (employee-create.html).
 * Can be called if loaded as a page or after dynamic injection as a modal.
 */
window.initEmployeeCreate = function() {
    console.log("Initializing Employee Create Modal/Screen...");
    ensureEmployeeStyles();

    // Make the create employee modal draggable
    const createEmployeeModal = document.getElementById('create-employee-modal');
    const createEmployeeModalHeader = document.querySelector('#create-employee-modal .asset-header');
    if (createEmployeeModal && createEmployeeModalHeader && typeof makeElementDraggable === 'function') {
        makeElementDraggable(createEmployeeModal, createEmployeeModalHeader);
    }

    // Default to first tab
    const firstTab = document.querySelector('#create-employee-modal .asset-tab');
    if (firstTab) {
        switchEmployeeCreateTab('TAB_BasicInfo', firstTab);
    }

    const paymentModeSelect = document.getElementById('EMP_PAY_MODE');
    const bankDetailsContainer = document.getElementById('EMP_BANK_DETAILS');
    const prepaidDetailsContainer = document.getElementById('EMP_PREPAID_DETAILS');

    const updatePaymentFields = () => {
        if (!paymentModeSelect) return;
        const mode = paymentModeSelect.value;
        if (bankDetailsContainer) bankDetailsContainer.style.display = (mode === '2' || mode === 'Bank') ? 'block' : 'none';
        if (prepaidDetailsContainer) prepaidDetailsContainer.style.display = (mode === '3' || mode === 'Prepaid Card') ? 'block' : 'none';
    };

    if (paymentModeSelect) {
        paymentModeSelect.addEventListener('change', updatePaymentFields);
        updatePaymentFields();
    }

    const fillFullName = () => {
        const firstName = document.getElementById('EMP_FIRST_NAME')?.value.trim() || '';
        const middleName = document.getElementById('EMP_MIDDLE_NAME')?.value.trim() || '';
        const lastName = document.getElementById('EMP_LAST_NAME')?.value.trim() || '';
        const fullNameInput = document.getElementById('EMP_FULL_NAME');
        if (!fullNameInput) return;

        const parts = [firstName, middleName, lastName].filter(part => part.length > 0);
        fullNameInput.value = parts.join(' ');
    };

    ['EMP_FIRST_NAME', 'EMP_MIDDLE_NAME', 'EMP_LAST_NAME'].forEach((inputId) => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', fillFullName);
        }
    });

    fillFullName();

    const handleEmployeeTypeChange = () => {
        const empTypeSelect = document.getElementById('EMP_EMPLOYEE_TYPE');
        if (!empTypeSelect) return;

        const selectedText = empTypeSelect.options[empTypeSelect.selectedIndex]?.text || '';
        const isFixedRate = /fixed\s*rate/i.test(selectedText.trim());
        const payslipBtn = document.getElementById('BTN_SETUP_PAYSLIP');

        if (!isFixedRate) {
            if (payslipBtn) payslipBtn.style.display = 'none';

            const payslipInputs = [
                'PS_INPUT_1', 'PS_INPUT_2', 'PS_INPUT_3', 'PS_INPUT_4', 'PS_INPUT_5',
                'PS_INPUT_6', 'PS_INPUT_7', 'PS_INPUT_8', 'PS_INPUT_10', 'PS_INPUT_11',
                'PS_INPUT_14', 'PS_INPUT_32', 'PS_INPUT_9', 'PS_INPUT_12', 'PS_INPUT_13'
            ];

            payslipInputs.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.value = element.tagName === 'INPUT' ? '0 FCFA' : '0.00 FCFA';
                }
            });

            const staffStatusSelect = document.getElementById('PS_STAFF_STATUS');
            if (staffStatusSelect) staffStatusSelect.value = '1';

            const netDisplay = document.getElementById('PAYSLIP_NetTotal');
            if (netDisplay) netDisplay.textContent = '0 FCFA';
            window.isRecalculated = false;
        } else {
            if (payslipBtn) payslipBtn.style.display = 'inline-flex';
        }
    };

    const employeeTypeSelect = document.getElementById('EMP_EMPLOYEE_TYPE');
    if (employeeTypeSelect) {
        employeeTypeSelect.addEventListener('change', handleEmployeeTypeChange);
    }

    handleEmployeeTypeChange();

    // Load endpoint-driven selects for company info and related fields
    if (typeof window.loadEmployeeCreateOptions === 'function') {
        window.loadEmployeeCreateOptions().then(() => {
            handleEmployeeTypeChange();
        });
    }
};

/**
 * Populates a select element for the create employee modal.
 * @param {string} selectId
 * @param {Array} items
 * @param {string} placeholder
 */
window.populateEmployeeCreateSelect = function(selectId, items = []) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id ?? item.value ?? '';
        option.textContent = item.name ?? item.label ?? item.text ?? '';
        select.appendChild(option);
    });
};

window.employeeCreateLookupEndpoint = window.employeeCreateLookupEndpoint || '/api/v1/payroll/lookups/employeeCreate';

window.loadEmployeeCreateOptions = async function() {
    // 1. Map select tag IDs to the property keys returned in the lookup payload
    const selectMap = {
        EMP_STATUS: 'staffStatuses',
        EMP_TITLE: 'titles',
        EMP_GENDER: 'genders',
        EMP_CIVIL_STATUS: 'civilStatus', // Map missing civil status dropdown
        EMP_CATEGORY: 'categories',
        EMP_ECHELON: 'echelons',
        EMP_BRANCH: 'branches',
        EMP_DEPARTMENT: 'departments',
        EMP_POST: 'positions',
        EMP_NATIONALITY: 'nationalities',
        EMP_DENOMINATION: 'denominations',
        EMP_EMPLOYEE_TYPE: 'employeeTypes'
    };

    const endpoint = window.employeeCreateLookupEndpoint;
    if (!endpoint) {
        console.error('Employee create lookup endpoint is not configured.');
        return;
    }

    // Show dynamic loading indicators
    Object.keys(selectMap).forEach(selectId => {
        const select = document.getElementById(selectId);
    });

    try {
        if (typeof apiFetch === 'undefined') {
            throw new Error('apiFetch utility from auth.js is not loaded.');
        }

        // 2. Perform GET request via global apiFetch wrapper (attaches Auth headers automatically)
        const response = await apiFetch(endpoint, {
            method: 'GET'
        });

        if (!response || response.success === false) {
            throw new Error(response?.message || 'Empty or invalid response from server lookups');
        }

        const data = response.data || {};
        console.log('Employee create lookup response loaded:', response.message || 'Success');

        // 3. Populate each dropdown element with backend response items
        Object.entries(selectMap).forEach(([selectId, responseKey]) => {
            const select = document.getElementById(selectId);
            if (!select) return;

            const items = Array.isArray(data[responseKey]) ? data[responseKey] : [];
            window.populateEmployeeCreateSelect(selectId, items);
        });

    } catch (error) {
        console.error('Error loading employee create lookup options:', error);
        Object.keys(selectMap).forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                select.innerHTML = `<option value="">${error.message || 'Unable to load'}</option>`;
            }
        });
    }
};

/**
 * Generates and prints the Employee List using the layout from printing.html
 */
window.printEmployeeList = function() {
    const companyName = "Institute Name"; // Placeholder or pull from config
    const printDate = new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' });

    // Styles exactly from printing.html
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
        th, td { border: 1px solid #000; padding: 3px 2px; text-align: left; vertical-align: middle; white-space: nowrap; }
        th { background-color: #fff; text-align: center; font-weight: bold; white-space: normal; }
        .text-center { text-align: center !important; }
        .no-border { border: none !important; }

        @page { margin: 0; }
        @media print {
            body { margin: 0; padding: 0; }
            .page { margin: 0; border: none; width: 100vw; height: 100vh; padding: 0.5cm 1cm; page-break-after: always; }
            .landscape { size: landscape; }
        }
    `;

    const getName = (list, id) => {
        const item = list.find(x => x.id == id || x.value == id);
        return item ? (item.name || item.label || item.text) : '---';
    };

    let rows = '';
    window.currentEmployeeDataList.forEach((d, idx) => {
        const branchName = getName(window.masterLookupCache.branches, d.branchId);
        const deptName = getName(window.masterLookupCache.departments, d.departmentId);
        const posName = getName(window.masterLookupCache.positions, d.positionId);
        const typeName = getName(window.masterLookupCache.employeeTypes, d.payBasis);

        rows += `
            <tr>
                <td class="text-center">${idx + 1}</td>
                <td>${d.fullName}</td>
                <td class="text-center">${d.matricule}</td>
                <td class="text-center">${d.employmentDate || '---'}</td>
                <td>${d.telephone1 || '---'}</td>
                <td>${d.cnpsNo || '---'}</td>
                <td>${posName}</td>
                <td>${branchName}</td>
                <td>${deptName}</td>
                <td>${typeName}</td>
                <td>${d.address || '---'}</td>
                <td>${d.email || '---'}</td>
            </tr>`;
    });

    const content = `
        <div class="doc-header">
            <h2>${companyName}</h2>
            <h3>Staff Records / Employee List</h3>
            <div class="doc-meta"><div class="meta-left"></div><div class="meta-right"><span>Printed: ${printDate}</span></div></div>
        </div>
        <table>
            <thead>
                <tr>
                    <th>SN</th>
                    <th>Employee Name</th>
                    <th>Matricule</th>
                    <th>Employment Date</th>
                    <th>Telephone</th>
                    <th>CNPS No</th>
                    <th>Position</th>
                    <th>Branch</th>
                    <th>Dept</th>
                    <th>Type</th>
                    <th>Address</th>
                    <th>Email</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `;

    const win = window.open('', '_blank', 'width=1000,height=800');
    win.document.write(`
        <html>
        <head><title>Print Employee List</title><style>${styles}</style></head>
        <body>
            <div class="page landscape"><div class="doc-content">${content}</div><div class="doc-footer"><span></span><span>Page 1/1</span><span></span></div></div>
            <script>window.onload = function() { setTimeout(function(){ window.print(); window.close(); }, 500); }</script>
        </body></html>
    `);
    win.document.close();
};

/**
 * Injects the Payslip Setup Modal (from images) into the DOM.
 */
function injectPayslipSetupModal() {
    if (document.getElementById('MODAL_PayslipSetup')) return;

    const style = document.createElement('style');
    style.id = 'payslip-setup-styles';
    style.innerHTML = `
        #MODAL_PayslipSetup { z-index: 10100 !important; }
        #MODAL_PayslipSetup .asset-modal { width: 1150px; height: 700px; background: #e6e9ed; }
        .payslip-setup-container { display: flex; gap: 10px; padding: 10px; flex: 1; overflow: hidden; }
        .payslip-left-sidebar { 
            width: 360px; display: flex; flex-direction: column; gap: 6px; 
            overflow: hidden !important; background: #fff; padding: 12px; border: 1px solid #ccc; 
        }
        .payslip-right-content { flex: 1; display: flex; flex-direction: column; background: #fff; border: 1px solid #ccc; overflow: hidden; }
        
        .payslip-table-wrapper { flex: 1; overflow-y: auto; border-bottom: 1px solid #ccc; }
        .payslip-table { width: 100%; border-collapse: collapse; font-size: 11px; }
        .payslip-table th { background: #2e3192; color: #fff; position: sticky; top: 0; padding: 2px; text-align: left; }
        .payslip-table td { border: 1px dotted #999; padding: 4px 8px; }
        .payslip-table tr:nth-child(even) { background: #f9f9f9; }
        .payslip-table .editable-amt { text-align: right; font-weight: bold; background: #fffef0; cursor: [pointer]; }
        .payslip-table .row-header { background: #dcdcdc !important; font-weight: bold; }
        
        .payslip-footer { display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f0f0f0; }
        .net-payment-box { background: #004a99; color: #fff; padding: 10px 20px; font-size: 27px; font-weight: bold; flex: 1; display: flex; justify-content: space-between; align-items: center; }
        .save-record-btn { background: #6bc85a; color: #fff; border: none; padding: 15px 30px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 15px; font-size: 18px; font-weight: bold; margin-left: 20px; }
        .save-record-btn i { font-size: 30px; }
        .save-record-btn:hover { background: #5ab34a; }
    `;
    document.head.appendChild(style);

    const modalHTML = `
        <div class="asset-overlay" id="MODAL_PayslipSetup" style="display: none;">
            <div class="asset-modal">
                <div class="asset-header">
                    <button class="wd-btn" onclick="closePayslipSetupModal()" style="background:#004a99; color:#fff; border:none; padding:4px 15px;"><i class="fa-solid fa-arrow-left"></i> Back</button>
                    <div style="text-align:center; flex:1;">
                        <div id="PAYSLIP_EmpNameDisplay" style="font-size:22px; color:#000; font-weight:bold; text-transform:uppercase; margin-bottom:2px;">EMPLOYEE NAME</div>
                        <div style="font-size:18px; color:#cd2027; font-weight:bold;">Payslip Salary Details Computation</div>
                    </div>
                    <div class="asset-close" onclick="closePayslipSetupModal()">&times;</div>
                </div>
                <div class="payslip-setup-container">
                    <!-- Left Sidebar Inputs -->
                    <div class="payslip-left-sidebar">
                        <fieldset class="asset-num-group">
                            <legend>Salary & Fiscal Deductions</legend>
                            <div class="form-row"><label>Staff Status:</label>
                                <select id="PS_STAFF_STATUS" class="wd-input" onchange="triggerAutoRecalculate()">
                                    <option value="1">Taxable</option>
                                    <option value="2">CNPS Not-Taxable</option>
                                    <option value="3">Non-Taxable</option>
                                </select>
                            </div>
                            <div class="form-row"><label>Basic Salary:</label><input type="text" id="PS_INPUT_1" class="wd-input text-right fcfa-field" value="0 FCFA" onfocus="parseFCFAInput(this)" onblur="formatFCFAInput(this)" oninput="syncPayslipTable(1, this.value)"></div>
                            <div class="form-row"><label>Overtime:</label><input type="text" id="PS_INPUT_2" class="wd-input text-right fcfa-field" value="0 FCFA" onfocus="parseFCFAInput(this)" onblur="formatFCFAInput(this)" oninput="syncPayslipTable(2, this.value)"></div>
                            <div class="form-row"><label>Seniority Bonus:</label><input type="text" id="PS_INPUT_3" class="wd-input text-right fcfa-field" value="0 FCFA" onfocus="parseFCFAInput(this)" onblur="formatFCFAInput(this)" oninput="syncPayslipTable(3, this.value)"></div>
                            <div class="form-row"><label>Duty Post Allowance:</label><input type="text" id="PS_INPUT_4" class="wd-input text-right fcfa-field" value="0 FCFA" onfocus="parseFCFAInput(this)" onblur="formatFCFAInput(this)" oninput="syncPayslipTable(4, this.value)"></div>
                            <div class="form-row"><label>Research Allowance:</label><input type="text" id="PS_INPUT_5" class="wd-input text-right fcfa-field" value="0 FCFA" onfocus="parseFCFAInput(this)" onblur="formatFCFAInput(this)" oninput="syncPayslipTable(5, this.value)"></div>
                            <div class="form-row"><label>Transport Allowance:</label><input type="text" id="PS_INPUT_6" class="wd-input text-right fcfa-field" value="0 FCFA" onfocus="parseFCFAInput(this)" onblur="formatFCFAInput(this)" oninput="syncPayslipTable(6, this.value)"></div>
                            <div class="form-row"><label>Basket Allowance:</label><input type="text" id="PS_INPUT_14" class="wd-input text-right fcfa-field" value="0 FCFA" onfocus="parseFCFAInput(this)" onblur="formatFCFAInput(this)" oninput="syncPayslipTable(14, this.value)"></div>
                            <div class="form-row"><label>Representation Allowance:</label><input type="text" id="PS_INPUT_7" class="wd-input text-right fcfa-field" value="0 FCFA" onfocus="parseFCFAInput(this)" onblur="formatFCFAInput(this)" oninput="syncPayslipTable(7, this.value)"></div>
                            <div class="form-row" style="color:#b3a500;"><label>Housing Allowance:</label><input type="text" id="PS_INPUT_8" class="wd-input text-right fcfa-field" value="0 FCFA" onfocus="parseFCFAInput(this)" onblur="formatFCFAInput(this)" oninput="syncPayslipTable(8, this.value)"></div>
                            <div class="form-row" style="color:#b3a500;"><label>Water Allowance:</label><input type="text" id="PS_INPUT_10" class="wd-input text-right fcfa-field" value="0 FCFA" onfocus="parseFCFAInput(this)" onblur="formatFCFAInput(this)" oninput="syncPayslipTable(10, this.value)"></div>
                            <div class="form-row" style="color:#b3a500;"><label>Electricity Allowance:</label><input type="text" id="PS_INPUT_11" class="wd-input text-right fcfa-field" value="0 FCFA" onfocus="parseFCFAInput(this)" onblur="formatFCFAInput(this)" oninput="syncPayslipTable(11, this.value)"></div>
                            <div class="form-row" style="color:#cd2027;"><label>Medical & Solidarity:</label><input type="text" id="PS_INPUT_32" class="wd-input text-right fcfa-field" value="0 FCFA" onfocus="parseFCFAInput(this)" onblur="formatFCFAInput(this)" oninput="syncPayslipTable(32, this.value)"></div>
                            <div class="form-row" style="color:#b3a500;"><label>Vehicle Allowance:</label><input type="text" id="PS_INPUT_9" class="wd-input text-right fcfa-field" value="0 FCFA" oninput="syncPayslipTable(9, this.value)" disabled></div>
                            <div class="form-row" style="color:#ccc;"><label>Food Allowance:</label><input type="text" id="PS_INPUT_12" class="wd-input text-right fcfa-field" value="0 FCFA" disabled></div>
                            <div class="form-row" style="color:#ccc;"><label>Domestic Allowance:</label><input type="text" id="PS_INPUT_13" class="wd-input text-right fcfa-field" value="0 FCFA" disabled></div>
                        </fieldset>
                        <button class="wd-btn primary" onclick="calculateSalary()" style="width:100%; margin-top:10px;">Get Salary Details <i class="fa-solid fa-calculator"></i></button>
                    </div>
                    <!-- Right Table Section -->
                    <div class="payslip-right-content">
                        <div class="payslip-table-wrapper">
                            <table class="payslip-table" id="TABLE_PayslipBreakdown">
                                <thead>
                                    <tr>
                                        <th style="width:40px;">ID</th>
                                        <th>Description</th>
                                        <th style="width:150px; text-align:right;">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Rows injected by JS -->
                                </tbody>
                            </table>
                        </div>
                        <div class="payslip-footer">
                            <div class="net-payment-box">
                                <span>NET PAYMENT:</span>
                                <span id="PAYSLIP_NetTotal">0 FCFA</span>
                            </div>
                            <button class="save-record-btn" onclick="closePayslipSetupModal()">
                                Save Record <i class="fa-solid fa-circle-check"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    renderPayslipBreakdown();
}

/**
 * Renders the 49 rows for the payslip details table.
 */
function renderPayslipBreakdown() {
    const items = [
        { id: 1, desc: "Basic Salary" }, { id: 2, desc: "Overtime" }, { id: 3, desc: "Seniority Bonus" },
        { id: 4, desc: "Duty Post Allowance" }, { id: 5, desc: "Research Allowance" }, { id: 6, desc: "Transport Allowance" },
        { id: 7, desc: "Representation/Communication" }, { id: 8, desc: "Housing Allowance" }, { id: 9, desc: "Vehicle Allowance" },
        { id: 10, desc: "Water Allowance" }, { id: 11, desc: "Electricity Allowance" }, { id: 12, desc: "Food Allowance" },
        { id: 13, desc: "Domestic Allowance" }, { id: 14, desc: "Basket Allowance" }, { id: 15, desc: "", type: "empty" },
        { id: 16, desc: "Gross Salary (GS)", bold: true }, { id: 17, desc: "Gross Taxable Salary (GTS)", bold: true },
        { id: 18, desc: "CNPS Base" }, { id: 19, desc: "Taxable/Non-Taxable" }, { id: 20, desc: "CNPS Taxable" },
        { id: 21, desc: "Annual Taxable Base" }, { id: 22, desc: "IRPP" }, { id: 23, desc: "CAC (ACT)" },
        { id: 24, desc: "CFC (LBT)" }, { id: 25, desc: "RAV (AVT)" }, { id: 26, desc: "COUNCIL TAX" },
        { id: 27, desc: "CNPS" }, { id: 28, desc: "Council Tax Base" }, { id: 29, desc: "Total Payroll Deductions" },
        { id: 30, desc: "Net Salary", bold: true }, { id: 31, desc: "Advance on Salary" }, { id: 32, desc: "Other Deductions" },
        { id: 33, desc: "TOTAL Deductions", bold: true }, { id: 34, desc: "Net Payment", bold: true }, { id: 35, desc: "", type: "empty" },
        { id: 36, desc: "TAXES WITHHELD ON WAGES FOR PAY LIST", type: "header" },
        { id: 37, desc: "Total Employee Taxes Withheld" }, { id: 38, desc: "CFC (employer's contribution)" },
        { id: 39, desc: "NEF (employer's contribution)" }, { id: 40, desc: "Total Employer's Taxes Withheld" },
        { id: 41, desc: "Total Taxes Withheld" }, { id: 42, desc: "", type: "empty" },
        { id: 43, desc: "CNPS WITHHELD ON WAGES", type: "header" }, { id: 44, desc: "Employee's PV" },
        { id: 45, desc: "Employer's PV" }, { id: 46, desc: "Family Allowance (AF)" }, { id: 47, desc: "Risk Allowance (AT)" },
        { id: 48, desc: "Total Employer CNPS Tax" }, { id: 49, desc: "GROSS TOTAL", bold: true }
    ];

    const tbody = document.querySelector('#TABLE_PayslipBreakdown tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    items.forEach(item => {
        const tr = document.createElement('tr');
        if (item.type === 'header') tr.className = 'row-header';
        
        let amtCell = '';
        if (item.type !== 'empty' && item.type !== 'header') {
            amtCell = `<td class="editable-amt" id="PS_AMT_${item.id}" oninput="updatePayslipTotal()">0</td>`;
        } else {
            amtCell = `<td></td>`;
        }

        tr.innerHTML = `
            <td>${item.id}</td>
            <td style="${item.bold ? 'font-weight:bold;' : ''}">${item.desc}</td>
            ${amtCell}
        `;
        tbody.appendChild(tr);
    });
}

/**
 * Triggers the /api/v1/payroll/calculateEmployeeSalary endpoint with modal parameters.
 */
window.calculateSalary = async function() {
    // Utility helper to extract clean, unformatted numbers from input fields
    const getCleanVal = (id) => {
        const input = document.getElementById(id);
        if (!input) return 0;
        return parseFloat(input.value.replace(/[^0-9.-]/g, '')) || 0;
    };

    // Grab correct payBasis value from employee-create form select dropdown
    const payBasisSelect = document.getElementById('EMP_EMPLOYEE_TYPE');
    const payBasisVal = payBasisSelect ? parseInt(payBasisSelect.value, 10) : 2;

    const payload = {
        basicSalary: getCleanVal('PS_INPUT_1'),
        overtime: getCleanVal('PS_INPUT_2'),
        seniorityBonus: getCleanVal('PS_INPUT_3'),
        dutyPostAllowance: getCleanVal('PS_INPUT_4'),
        researchAllowance: getCleanVal('PS_INPUT_5'),
        transportAllowance: getCleanVal('PS_INPUT_6'),
        representationAllowance: getCleanVal('PS_INPUT_7'),
        housingAllowance: getCleanVal('PS_INPUT_8'),
        waterAllowance: getCleanVal('PS_INPUT_10'),
        electricityAllowance: getCleanVal('PS_INPUT_11'),
        basketAllowance: getCleanVal('PS_INPUT_14'),
        medicalDeductions: getCleanVal('PS_INPUT_32'),
        payBasis: payBasisVal,
        staffStatus: parseInt(document.getElementById('PS_STAFF_STATUS')?.value || '1', 10)
    };

    try {
        if (typeof apiFetch === 'undefined') {
            throw new Error('apiFetch utility from auth.js is not loaded.');
        }

        const response = await apiFetch('/api/v1/payroll/calculateEmployeeSalary', {
            method: 'POST',
            body: payload
        });

        if (!response || response.success === false) {
            throw new Error(response?.message || 'Calculation API returned success=false');
        }

        const data = response.data || {};
        showAlert(response.message || "Payroll calculated successfully.", 'success');
        isRecalculated = true; // Mark as successfully calculated once

        // Map response metrics directly to corresponding target row IDs in the breakdown table
        const mappingTable = {
            1: data.BasicSalary,
            2: data.Overtime,
            3: data.SeniorityBonus,
            4: data.DutyPostAllowance,
            5: data.ResearchAllowance,
            6: data.TransportAllowance,
            7: data.RepresentationAllowance,
            8: data.HousingAllowance,
            9: data.VehicleAllowance,
            10: data.WaterAllowance,
            11: data.ElectricityAllowance,
            12: data.FoodAllowance,
            13: data.DomesticAllowance,
            14: data.BasketAllowance,
            16: data.GrossSalary,
            17: data.GrossTaxableSalary,
            18: data.CNPSBase,
            19: data.TaxableOrNotValue,
            20: data.CNPSTaxable,
            21: data.AnnualTaxableSalary,
            22: data.PIT_IRPP,
            23: data.CAC_IRPP,
            24: data.CCF_LBT_Employee,
            25: data.CRTV_RAV,
            26: data.LDT_TC,
            27: data.CNPSAmount,
            28: data.CouncilTaxBase,
            29: data.TotalPayrollDeductions,
            30: data.NetSalary,
            31: data.AdvanceSalary,
            32: data.OtherDeductions,
            33: data.TotalOtherDeductions,
            34: data.NetPayment,
            37: data.TotalEmployeeTaxes,
            38: data.CCF_LBT_Employer,
            39: data.FNE,
            40: data.TotalEmployerTaxes,
            41: data.TotalTaxAmount,
            44: data.TotalCNPSEmployee,
            45: data.TotalCNPSEmployee,
            46: data.FamilyAllowance,
            47: data.RiskAllowance,
            48: data.TotalCNPSEmployer,
            49: data.TotalCNPS // Default to gross salary or specific total if calculated
        };

        // Render each updated row value with high-quality formatting
        Object.entries(mappingTable).forEach(([id, val]) => {
            const cell = document.getElementById(`PS_AMT_${id}`);
            if (cell) {
                const formattedNum = Number(val || 0).toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2
                });
                cell.textContent = formattedNum + " FCFA";
            }
        });

        // Also update any read-only sidebar inputs (like Vehicle/Food/Domestic Allowances)
        if (document.getElementById('PS_INPUT_9')) {
            document.getElementById('PS_INPUT_9').value = Number(data.VehicleAllowance || 0).toLocaleString('en-US') + " FCFA";
        }
        if (document.getElementById('PS_INPUT_12')) {
            document.getElementById('PS_INPUT_12').value = Number(data.FoodAllowance || 0).toLocaleString('en-US') + " FCFA";
        }
        if (document.getElementById('PS_INPUT_13')) {
            document.getElementById('PS_INPUT_13').value = Number(data.DomesticAllowance || 0).toLocaleString('en-US') + " FCFA";
        }

        // Update NET PAYMENT Display Box
        const netEl = document.getElementById('PAYSLIP_NetTotal');
        if (netEl) {
            netEl.textContent = Number(data.NetPayment || 0).toLocaleString('en-US') + " FCFA";
        }

    } catch (error) {
        console.error("Salary calculation failed:", error);
        showAlert(error.message || "Unable to recalculate salary.", 'error');
    }
};

/**
 * Syncs values from sidebar inputs to the main computation table.
 */
window.syncPayslipTable = function(id, value) {
    const numericVal = value.replace(/[^0-9]/g, '') || 0;
    const target = document.getElementById(`PS_AMT_${id}`);
    if (target) {
        target.textContent = Number(numericVal).toLocaleString();
        updatePayslipTotal();
    }
};

/**
 * Calculates the Net Payment and updates the footer.
 */
window.updatePayslipTotal = function() {
    // Simplified calculation for demo: Net Payment (34) = Gross (16) - Deductions (33)
    // In real app, this would involve complex payroll formulas.
    const getAmt = (id) => parseFloat(document.getElementById(`PS_AMT_${id}`)?.textContent.replace(/,/g, '')) || 0;
    
    const netPayment = getAmt(1) + getAmt(2); // Just for visualization in this context
    
    const netEl = document.getElementById('PAYSLIP_NetTotal');
    if (netEl) netEl.textContent = Number(netPayment).toLocaleString() + " FCFA";
};

window.openPayslipSetupModal = function() {
    const createModal = document.getElementById('create-employee-overlay');
    const firstNameInput = document.getElementById('EMP_FIRST_NAME');
    const mo = document.getElementById('MODAL_ModifyEmployee');
    const modName = mo ? mo.querySelectorAll('.wd-input')[3] : null; // First Name in Modify Modal
    const isCreateVisible = createModal && createModal.style.display !== 'none';
    const isModifyVisible = mo && mo.style.display !== 'none';

    if (isCreateVisible || isModifyVisible) {
        const firstName = isCreateVisible ? firstNameInput?.value.trim() || '' : '';
        const modFirstName = isModifyVisible ? modName?.value.trim() || '' : '';
        if (!firstName && !modFirstName) {
            showAlert('Please enter the employee names', 'error');
            return;
        }
    }

    injectPayslipSetupModal();
    const modal = document.getElementById('MODAL_PayslipSetup');
    
    // Dynamic Name Fetching Logic
    let fullName = 'NEW EMPLOYEE';
    const modModal = document.getElementById('MODAL_ModifyEmployee');

    if (modModal && modModal.style.display !== 'none') {
        const inputs = modModal.querySelectorAll('.wd-input');
        const first = inputs[3]?.value || "";
        const last = inputs[5]?.value || "";
        if (first || last) fullName = (first + ' ' + last).trim();
    } else if (createModal && createModal.style.display !== 'none') {
        const first = firstNameInput?.value.trim() || '';
        const middle = document.getElementById('EMP_MIDDLE_NAME')?.value.trim() || '';
        const last = document.getElementById('EMP_LAST_NAME')?.value.trim() || '';
        if (first || middle || last) fullName = [first, middle, last].filter(Boolean).join(' ');
    }

    const nameDisplay = document.getElementById('PAYSLIP_EmpNameDisplay');
    if (nameDisplay) nameDisplay.textContent = fullName.toUpperCase();

    if (modal) {
        modal.style.display = 'flex';
    }
};

window.closePayslipSetupModal = function() {
    document.getElementById('MODAL_PayslipSetup').style.display = 'none';
};

/**
 * Compiles all tabs data and creates the new employee record using POST method
 */
window.submitCreateEmployeeForm = async function() {
    const getCleanNum = (id) => {
        const el = document.getElementById(id);
        if (!el) return 0;
        return parseFloat(el.value.replace(/[^0-9.-]/g, '')) || 0;
    };

    const getSelectInt = (id) => {
        const el = document.getElementById(id);
        return el && el.value ? parseInt(el.value, 10) : 0;
    };

    // Determine current employee type textual label to enforce submission logic safely
    const empTypeSelect = document.getElementById('EMP_EMPLOYEE_TYPE');
    const isFixedRate = empTypeSelect ? (empTypeSelect.options[empTypeSelect.selectedIndex]?.text?.trim() === 'Fixed Rate') : false;

    const fName = document.getElementById('EMP_FIRST_NAME')?.value.trim() || '';
    const mName = document.getElementById('EMP_MIDDLE_NAME')?.value.trim() || '';
    const lName = document.getElementById('EMP_LAST_NAME')?.value.trim() || '';
    const compiledFullName = [fName, mName, lName].filter(Boolean).join(' ') || 'New Employee';

    const payload = {
        firstName: fName,
        middleName: mName,
        lastName: lName,
        fullName: compiledFullName,
        titleId: getSelectInt('EMP_TITLE'),
        genderId: getSelectInt('EMP_GENDER'),
        civilStatus: getSelectInt('EMP_CIVIL_STATUS'),
        telephone1: document.getElementById('EMP_TELEPHONE')?.value.trim() || '',
        telephone2: document.getElementById('EMP_TEL2')?.value.trim() || '',
        email: document.getElementById('EMP_EMAIL')?.value.trim() || '',
        address: document.getElementById('EMP_ADDRESS')?.value.trim() || '',
        placeOfBirth: document.getElementById('EMP_POB')?.value.trim() || '',
        nationalityId: getSelectInt('EMP_NATIONALITY'),
        denominationId: getSelectInt('EMP_DENOMINATION'),
        noOfChildren: parseInt(document.getElementById('EMP_CHILDREN')?.value || '0', 10),
        employmentDate: document.getElementById('EMP_DATE')?.value || '',
        branchId: getSelectInt('EMP_BRANCH'),
        departmentId: getSelectInt('EMP_DEPARTMENT'),
        positionId: getSelectInt('EMP_POST'),
        categoryId: getSelectInt('EMP_CATEGORY'),
        echelonId: getSelectInt('EMP_ECHELON'),
        payBasis: getSelectInt('EMP_EMPLOYEE_TYPE'),
        staffStatus: getSelectInt('EMP_STATUS'),
        emergencyName1: document.getElementById('EMP_ICE1_NAME')?.value.trim() || '',
        emergencyNum1: document.getElementById('EMP_ICE1_TEL')?.value.trim() || '',
        emergencyName2: document.getElementById('EMP_ICE2_NAME')?.value.trim() || '',
        emergencyNum2: document.getElementById('EMP_ICE2_TEL')?.value.trim() || '',
        identification: document.getElementById('EMP_ID_TYPE')?.value || 'ID Card',
        identificationNum: document.getElementById('EMP_ID_NUM')?.value.trim() || '',
        identificationPlace: document.getElementById('EMP_ID_PLACE')?.value.trim() || '',
        nid: getCleanNum('EMP_NID'),
        niu: document.getElementById('EMP_NIU')?.value.trim() || '',
        cnpsNo: document.getElementById('EMP_CNPS')?.value.trim() || '',
        paymentMode: document.getElementById('EMP_PAY_MODE')?.value || 'Cash',
        bankName: document.getElementById('EMP_BANK_NAME')?.value.trim() || '',
        bankAccountNo: document.getElementById('EMP_BANK_ACC')?.value.trim() || '',

        // If employee profile is not 'Fixed Rate', enforce zeroing parameters out completely
        basicSalary: isFixedRate ? getCleanNum('PS_INPUT_1') : 0,
        overtime: isFixedRate ? getCleanNum('PS_INPUT_2') : 0,
        seniorityBonus: isFixedRate ? getCleanNum('PS_INPUT_3') : 0,
        dutyPostAllowance: isFixedRate ? getCleanNum('PS_INPUT_4') : 0,
        researchAllowance: isFixedRate ? getCleanNum('PS_INPUT_5') : 0,
        transportAllowance: isFixedRate ? getCleanNum('PS_INPUT_6') : 0,
        representationAllowance: isFixedRate ? getCleanNum('PS_INPUT_7') : 0,
        housingAllowance: isFixedRate ? getCleanNum('PS_INPUT_8') : 0,
        waterAllowance: isFixedRate ? getCleanNum('PS_INPUT_10') : 0,
        electricityAllowance: isFixedRate ? getCleanNum('PS_INPUT_11') : 0,
        basketAllowance: isFixedRate ? getCleanNum('PS_INPUT_14') : 0,
        medicalDeductions: isFixedRate ? getCleanNum('PS_INPUT_32') : 0
    };

    const id = window.currentEditingEmployeeId;
    const endpoint = id ? `/api/v1/payroll/updateEmployee/${id}` : '/api/v1/payroll/createEmployee';
    const method = id ? 'PUT' : 'POST';

    try {
        if (typeof apiFetch === 'undefined') {
            throw new Error('Communication utility apiFetch is unavailable.');
        }

        const response = await apiFetch(endpoint, {
            method: method,
            body: payload
        });

        if (!response || response.success === false) {
            throw new Error(response?.message || 'Server failed to save employee details.');
        }

        showAlert(response.message, 'success');

        if (typeof closeCreateEmployeeModal === 'function') closeCreateEmployeeModal();
        if (window.fetchEmployeeList) window.fetchEmployeeList();

    } catch (error) {
        console.error('Employee registration failure:', error);
        showAlert(error.message || 'Network connection transaction fault.', 'error');
    }
};