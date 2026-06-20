
/* ===== SERVICE BILLS DATA & FUNCTIONS ===== */

// Global data for service bills, so it can be modified by event handlers
let serviceBillsData = [];

function renderServiceBills() {
    const tbody = document.querySelector('#TABLE_ServiceBills tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    const MIN_ROWS = 3; // Minimum number of rows to display

    serviceBillsData.forEach((row, idx) => {
        const tr = document.createElement('tr');
        tr.style.background = (idx % 2 === 0) ? '#f7e6e6' : 'inherit';

        tr.innerHTML = `
            <td>${(idx + 1).toFixed(0)}</td>
            <td>${row.accountName}</td>
            <td contenteditable="true" class="desc-cell" data-idx="${idx}">${row.description}</td>
            <td class="amount">
                <input type="text" class="amt-input" value="${row.amount}" data-idx="${idx}" style="width: 100%; text-align: right; border: none; outline: none; background: transparent; font-weight: bold; font-size: inherit; font-family: inherit; padding: 0; margin: 0;">
            </td>
            <td style="padding: 0%;"><button class="wd-btn reject" onclick="deleteServiceBillRow(${idx})" style="width: 100%; height: 100%;">Delete</button></td>
        `;
        tbody.appendChild(tr);
    });

    // Add empty rows to reach MIN_ROWS
    for (let i = serviceBillsData.length; i < MIN_ROWS; i++) {
        const tr = document.createElement('tr');
        // Height matches a normal row's padding and line-height
        tr.innerHTML = `<td colspan="5" style="height: 31px;">&nbsp;</td>`;
        tbody.appendChild(tr);
    }
    
    // Calculate totals
    updateServiceBillsTotals();
}

function updateServiceBillsTotals() {
    let total = 0;
    serviceBillsData.forEach(row => {
        total += Number(row.amount) || 0;
    });

    // Update the Total Cell in the table footer
    const totalCell = document.getElementById('CELL_ServiceBill_Total');
    if (totalCell) {
        totalCell.textContent = total.toLocaleString('en-US');
    }

    // Update summary panel
    const billEl = document.getElementById('bill');
    const aitEl = document.getElementById('ait');
    const netEl = document.getElementById('net');
    const incAit = document.getElementById('inc-ait');

    if (billEl) billEl.textContent = total.toLocaleString("en-US") + " FCFA";
    
    const aitValue = incAit && incAit.checked ? Math.round(total * 0.055) : 0;
    if (aitEl) aitEl.textContent = aitValue.toLocaleString("en-US", {maximumFractionDigits: 0}) + " FCFA";
    
    const netValue = total - aitValue;
    if (netEl) netEl.textContent = netValue.toLocaleString("en-US", {maximumFractionDigits: 0}) + " FCFA";

    // Update amount in words with NET value
    const wordsEl = document.getElementById('amount-words');
    if (wordsEl) {
        wordsEl.textContent = netValue > 0 ? numberToWords(Math.round(netValue)) + " FCFA" : "";
    }
}

function deleteServiceBillRow(idx) {
    serviceBillsData.splice(idx, 1);
    renderServiceBills(); // Re-render to update rows and totals
}

/* Called AFTER screen loads */
async function initCreateServiceBills() {
    console.log("initCreateServiceBills: Initializing...");

    // Ensure chart of accounts data is loaded before we do anything that depends on it.
    if (window.AccountPicker) {
        await window.AccountPicker.ensureData();
    }
    
    const orderDateInput = document.getElementById('billorderdate');
    if (orderDateInput) {
        orderDateInput.value = new Date().toISOString().split('T')[0];
    }

    // Reset data on each load
    serviceBillsData = [];
    let loadedSuppliers = []; // Local state for suppliers
    
    // --- 1. Supplier Dropdown Logic ---
    const supplierSelect = document.getElementById('SELECT_Supplier');
    
    async function loadSuppliersForDropdown(selectedId = null) {
        if (!supplierSelect) return;
        
        if (!window.SupplierManager) {
            console.error("SupplierManager is not available.");
            return;
        }

        try {
            await window.SupplierManager.ensureData();
            loadedSuppliers = window.SupplierManager.data.items;
            
            // Populate Dropdown
            supplierSelect.innerHTML = '<option value="">-- Select Supplier --</option>' + 
                loadedSuppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
                
            if (selectedId) {
                supplierSelect.value = selectedId;
                // Trigger change to update UI
                supplierSelect.dispatchEvent(new Event('change'));
            }
        } catch (e) {
            console.error("Error loading suppliers:", e);
        }
    }

    if (supplierSelect) {
        supplierSelect.addEventListener('change', async () => {
            const selectedId = parseInt(supplierSelect.value, 10);
            const supplier = loadedSuppliers.find(s => s.id === selectedId);
            if (supplier) {
                // Populate "TO" Section
                document.getElementById('SUPPLIER_Name').textContent = supplier.name || "N/A";
                document.getElementById('SUPPLIER_Address').textContent = supplier.address1 || "N/A";
                document.getElementById('SUPPLIER_Email').textContent = supplier.email || "N/A";
                document.getElementById('SUPPLIER_Phone').textContent = supplier.phoneNumber || "N/A";
                
                // Populate Balance
                const balance = Number(supplier.accountBalance || 0).toLocaleString("en-US") + " FCFA";
                document.getElementById('SUPPLIER_Balance').value = balance;
                
                // Populate Accounts Payable
                const accInput = document.getElementById('SUPPLIER_Account');
                accInput.value = "Loading...";
                
                if (supplier.chartOfAccountsId && window.AccountPicker) {
                    await window.AccountPicker.ensureData();
                    const account = window.AccountPicker.data.mapById.get(Number(supplier.chartOfAccountsId));
                    if (account) {
                        accInput.value = `${account.code} - ${account.name}`;
                        accInput.dataset.coaId = account.id;
                    } else {
                        accInput.value = "Account not found";
                        accInput.dataset.coaId = "";
                    }
                } else {
                    accInput.value = "Not Linked";
                    accInput.dataset.coaId = "";
                }
            } else {
                // Clear fields if no supplier selected
                document.getElementById('SUPPLIER_Name').textContent = "not set";
                document.getElementById('SUPPLIER_Address').textContent = "not set";
                document.getElementById('SUPPLIER_Email').textContent = "not set";
                document.getElementById('SUPPLIER_Phone').textContent = "not set";
                document.getElementById('SUPPLIER_Balance').value = "0 Frs";
                document.getElementById('SUPPLIER_Account').value = "";
            }
        });
        // Initial Load
        loadSuppliersForDropdown();
    }

    /*const paymentMethodInput = document.getElementById('CB_PaymentMethod');
    if (paymentMethodInput) {
        paymentMethodInput.addEventListener('click', () => {
            if (window.AccountPicker) {
                window.AccountPicker.open({
                    title: "Select Payment Method",
                    targetClasses: ["CLASS 5"], // Cash & Bank accounts
                    onSelect: (account) => {
                        if (account) {
                            paymentMethodInput.value = account.name;
                            document.getElementById('CB_PaymentMethod_coaId').value = account.id;
                        } else {
                            paymentMethodInput.value = '';
                            document.getElementById('CB_PaymentMethod_coaId').value = '';
                        }
                    }
                });
            }
        });
    }*/
    // --- 1.5 Supplier Modal Logic (Embedded) ---
    // This function will be called from the '+' button's onclick attribute
    window.openServiceBillSupplierModal = function() {
        if (window.SupplierManager) {
            window.SupplierManager.openModal({
                onSave: (newSupplierId) => {
                    // This callback runs after a new supplier is successfully saved.
                    // We refresh the dropdown and select the new entry.
                    loadSuppliersForDropdown(newSupplierId);
                }
            });
        }
    };

    // --- 2. Account Search Logic ---
    const searchInput = document.getElementById('EDT_GlobalSearch');

    const addAccountToBill = (account) => {
        // Prevent adding duplicates
        if (account && !serviceBillsData.some(b => b.accountName === account.name)) {
            const newIndex = serviceBillsData.length;
            serviceBillsData.push({
                accountName: account.name,
                description: account.name, // User can fill this in
                amount: 0,
                coaId: account.id // Store coaId for payload generation
            });
            renderServiceBills();

            // Focus the new amount cell for quick editing
            const newInput = document.querySelector(`#TABLE_ServiceBills .amt-input[data-idx="${newIndex}"]`);
            if (newInput) {
                newInput.focus();
                newInput.select();
            }
        }
    };

    if (searchInput) {
        searchInput.readOnly = true;
        searchInput.style.cursor = 'pointer';
        searchInput.placeholder = 'Click to select an account';

        searchInput.addEventListener('click', () => {
            if (window.AccountPicker) {
                window.AccountPicker.open({
                    title: "Select Expense/Asset Account",
                    targetClasses: ["CLASS 2", "CLASS 6", "CLASS 8"],
                    onSelect: (account) => {
                        if (account) {
                            addAccountToBill(account);
                        }
                    }
                });
            } else {
                showAlert("Account Picker is not available. Please ensure chart-of-accounts.js is loaded.", 'error');
            }
        });
    }

    // --- 3. Initial Table Render ---
    renderServiceBills();

    // --- 4. Table Interactivity (ContentEditable, Delete) ---
    const table = document.getElementById('TABLE_ServiceBills');
    if (table) {
        table.addEventListener('input', (e) => {
            const target = e.target;
            const idx = target.dataset.idx;
            if (idx === undefined) return;

            if (target.classList.contains("desc-cell")) {
                serviceBillsData[idx].description = target.innerText;
            }
            
            if (target.classList.contains("amt-input")) {
                const originalValue = target.value;
                const cursorPosition = target.selectionStart;

                // Sanitize the value to allow only numbers and a leading negative sign.
                let sanitizedValue = originalValue.replace(/[^0-9-]/g, ''); // Remove illegal characters.
                
                // Ensure '-' is only at the beginning and there's only one.
                if (sanitizedValue.includes('-')) {
                    const firstChar = sanitizedValue.startsWith('-') ? '-' : '';
                    const rest = sanitizedValue.replace(/-/g, '');
                    sanitizedValue = firstChar + rest;
                }

                // If the value was changed by sanitization, update the input and restore the cursor.
                if (sanitizedValue !== originalValue) {
                    const diff = originalValue.length - sanitizedValue.length;
                    target.value = sanitizedValue;
                    target.setSelectionRange(cursorPosition - diff, cursorPosition - diff);
                }

                // Update the data model and recalculate totals.
                serviceBillsData[idx].amount = parseFloat(sanitizedValue) || 0;
                updateServiceBillsTotals();
            }
        });
        
        // Prevent "Enter" from creating a new line in editable cells
        table.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.target.blur();
            }
        });
    }

    // --- 5. AIT Checkbox ---
    const incAit = document.getElementById('inc-ait');
    if (incAit) incAit.addEventListener('change', updateServiceBillsTotals);

    // --- 6. Save Button ---
    const saveButton = document.getElementById('BTN_SaveBill'); // Assuming this ID exists on the page
    if (saveButton) {
        saveButton.addEventListener('click', saveServiceBill);
    }
}

async function saveServiceBill() {
    // 1. Get all form elements
    const supplierSelect = document.getElementById('SELECT_Supplier');
    const orderDateInput = document.getElementById('billorderdate');
    const dueDateInput = document.getElementById('billduedate'); // Assuming this ID exists
    const descriptionInput = document.getElementById('bill_description'); // Assuming this ID for the comment area
    const supplierAccountInput = document.getElementById('SUPPLIER_Account');
    const incAitCheck = document.getElementById('inc-ait');
    //const paymentMethodCoaId = document.getElementById('CB_PaymentMethod_coaId').value;

    // 2. Validation for obligatory fields
    const vendorId = parseInt(supplierSelect.value, 10);
    if (!vendorId) {
        showAlert('Please select a supplier.', 'error');
        return;
    }

    /*if (!paymentMethodCoaId) {
        showAlert('Please select a payment method.', 'error');
        return;
    }*/

    if (!orderDateInput.value) {
        showAlert('Please enter an order date.', 'error');
        orderDateInput.focus();
        return;
    }

    if (!dueDateInput || !dueDateInput.value) { // Assuming this field exists and is required
        showAlert('Please enter a due date.', 'error');
        dueDateInput?.focus();
        return;
    }
    
    if (!descriptionInput || !descriptionInput.value.trim()) { // Obligatory as requested
        showAlert('Please enter a description or comment for the bill.', 'error');
        descriptionInput?.focus();
        return;
    }

    if (serviceBillsData.length === 0) {
        showAlert('Please add at least one expense line to the bill.', 'error');
        return;
    }

    // 3. Calculate totals from rendered data
    const totalBT = serviceBillsData.reduce((sum, line) => sum + (Number(line.amount) || 0), 0);
    const deductAIT = incAitCheck.checked ? 1 : 0;
    const totalVAT = deductAIT ? Math.round(totalBT * 0.055) : 0;
    const totalIOT = totalBT - totalVAT;
    //const aitAmount = deductAIT ? Math.round(totalIOT * 0.055) : 0;
    const amountLeft = totalIOT;

    // 4. Construct payload based on the provided structure
    const payload = {
        vendorId: vendorId,
        orderDate: orderDateInput.value,
        dueDate: dueDateInput.value,
        description: descriptionInput.value.trim(),
        paymentType: 1, // Assuming "1" represents the payment type for this context, as source is not specified
        deductAIT: deductAIT,
        accountsPayableCoaId: supplierAccountInput.dataset.coaId, // Get coaId from dataset set during supplier selection
        aitCoaId: 7, // Hardcoded from example, as source is not specified
        fundingSourceId: 0, // Hardcoded from example
        totalIOT: totalIOT,
        totalBT: totalBT,
        totalVAT: totalVAT, // Backend seems to use this field for AIT amount
        advanceGiven: 0, // Hardcoded from example
        amountLeft: amountLeft,
        lines: serviceBillsData.map(line => ({
            coaId: line.coaId,
            amount: line.amount,
            accountName: line.accountName,
            lineDescription: line.description
        }))
    };

    // 5. API Call
    const saveButton = document.getElementById('BTN_SaveBill');
    if (saveButton) { saveButton.disabled = true; saveButton.textContent = 'Saving...'; }

    try {
        const response = await apiFetch("/api/v1/payables/supplierBills/addSupplierBills", { method: "POST", body: payload });
        if (response && response.success) {
            showAlert("Bill saved successfully!", 'success');

            // --- Reset Form (Keep Supplier & Order Date) ---
            serviceBillsData = [];
            renderServiceBills(); // Clears table and updates totals

            if (dueDateInput) dueDateInput.value = '';
            if (descriptionInput) descriptionInput.value = '';
            if (incAitCheck) incAitCheck.checked = false;

            // Clear Payment Method fields
            const pmInput = document.getElementById('CB_PaymentMethod');
            const pmIdInput = document.getElementById('CB_PaymentMethod_coaId');
            if (pmInput) pmInput.value = '';
            if (pmIdInput) pmIdInput.value = '';
            
            updateServiceBillsTotals();
        } else {
            showAlert("Failed to save bill: " + (response ? response.message : "Unknown error from server."), 'error');
        }
    } catch (error) {
        console.error("Error saving service bill:", error);
        showAlert("An error occurred while saving the bill: " + error.message, 'error');
    } finally {
        if (saveButton) { saveButton.disabled = false; saveButton.textContent = 'Save Bill'; }
    }
}

/* =========================================================
   PAY BILLS SCREEN LOGIC
   ========================================================= */

// A state object to hold data for the pay bills screen, separating it from other screen data.
const payBillsState = {
    bills: [],
    suppliersMap: new Map(),
    isRedistributing: false
};

/**
 * Initializes the Pay Bills screen. Fetches unpaid bills and renders the table.
 * This function is intended to be called when the pay-bills.html screen is loaded.
 */
window.initPayBills = async function() {
    console.log("initPayBills: Initializing...");
    // Guard to ensure this logic only runs on the "Pay Bills" screen.
    const payBillsWrapper = document.querySelector('.pay-bills-wrapper');
    if (!payBillsWrapper) {
        return; // Silently exit if not on the correct screen.
    }
    
    // 1. Populate Supplier Dropdown
    const supplierFilterSelect = document.getElementById('PB_SelectSupplier');
    if (supplierFilterSelect) {
        await window.SupplierManager.ensureData();
        const suppliers = window.SupplierManager.data.items;
        supplierFilterSelect.innerHTML = '<option value="">----All Suppliers----</option>' +
            suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    }

    // Add listener for payment method picker
    const pbPaymentMethodInput = document.getElementById('PB_PaymentMethod');
    if (pbPaymentMethodInput) {
        pbPaymentMethodInput.addEventListener('click', () => {
            if (window.AccountPicker) {
                window.AccountPicker.open({
                    title: "Select Payment Method",
                    targetClasses: ["CLASS 5"], // Cash & Bank accounts
                    onSelect: (account) => {
                        const pbPaymentMethodCoaIdInput = document.getElementById('PB_PaymentMethod_coaId');
                        if (account) {
                            pbPaymentMethodInput.value = account.name;
                            if (pbPaymentMethodCoaIdInput) {
                                pbPaymentMethodCoaIdInput.value = account.id;
                                // As requested, just store it for now.
                                console.log("Pay Bills - Selected Payment Method CoaId:", account.id);
                            }
                        } else {
                            pbPaymentMethodInput.value = '';
                            if (pbPaymentMethodCoaIdInput) pbPaymentMethodCoaIdInput.value = '';
                        }
                    }
                });
            }
        });
    }

    // Set default payment date to today
    const paymentDateInput = document.getElementById('PB_PaymentDate');
    if (paymentDateInput) {
        paymentDateInput.value = new Date().toISOString().split('T')[0];
    }

    // 2. Add filter event listeners
    // Scope the date input selector to the filter box to avoid triggering on the main payment date
    payBillsWrapper.querySelectorAll('input[name="show_bills"], .filter-box input[type="date"]').forEach(el => el.addEventListener('change', filterAndRenderPayBills));
    if (supplierFilterSelect) {
        supplierFilterSelect.addEventListener('change', async () => {
            // 1. Filter the table
            filterAndRenderPayBills();

            // 2. Populate Account Balance and AP Account (Validation Requirement)
            const selectedId = parseInt(supplierFilterSelect.value, 10);
            const balanceInput = document.getElementById('PB_SupplierBalance');
            const accountInput = document.getElementById('PB_SupplierAccount');

            if (selectedId && window.SupplierManager) {
                const supplier = window.SupplierManager.data.mapById.get(selectedId);
                if (supplier) {
                    // Populate Balance
                    if (balanceInput) {
                        balanceInput.value = Number(supplier.accountBalance || 0).toLocaleString("en-US") + " Frs";
                        balanceInput.style.color = (supplier.accountBalance < 0) ? 'red' : 'green';
                    }
                    // Populate Account
                    if (accountInput) {
                        if (supplier.chartOfAccountsId && window.AccountPicker) {
                            await window.AccountPicker.ensureData();
                            const account = window.AccountPicker.data.mapById.get(Number(supplier.chartOfAccountsId));
                            if (account) {
                                accountInput.value = `${account.code} - ${account.name}`;
                                accountInput.dataset.coaId = account.id;
                            } else {
                                accountInput.value = "Account not found";
                                accountInput.dataset.coaId = "";
                            }
                        } else {
                            accountInput.value = "Not Linked";
                            accountInput.dataset.coaId = "";
                        }
                    }
                }
            } else {
                // Reset fields if no supplier selected
                if (balanceInput) balanceInput.value = "0 Frs";
                if (accountInput) {
                    accountInput.value = "";
                    accountInput.dataset.coaId = "";
                }
            }
        });
    }

    // 3. Add listeners for new interactive elements
    const checkAll = document.getElementById('PB_CheckAll');
    if (checkAll) {
        checkAll.addEventListener('change', () => {
            const shouldBeChecked = checkAll.checked; // Capture the state right after the user click.
            const tbody = document.querySelector('#TABLE_PayBills tbody');
            if (!tbody) return;
            const checkboxes = tbody.querySelectorAll('.bill-checkbox');
            checkboxes.forEach(cb => {
                if (cb.checked !== shouldBeChecked) { // Use the captured state for the loop.
                    cb.checked = shouldBeChecked;
                    // Dispatch a change event to trigger the row logic (fill amount, etc.)
                    cb.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
        });
    }

    const totalToPayInput = document.getElementById('PB_TotalToPayInput');
    if (totalToPayInput) {
        totalToPayInput.addEventListener('input', handleTotalToPayInput);

        // Add focus and blur events for currency formatting
        totalToPayInput.addEventListener('focus', (e) => {
            const value = e.target.value;
            if (value.includes('FCFA')) {
                // Remove formatting for editing, keeping only the number
                const num = parseFloat(value.replace(/[^0-9]/g, '')) || '';
                e.target.value = num;
            }
        });

        totalToPayInput.addEventListener('blur', (e) => {
            const value = e.target.value;
            // Only format if it's not already formatted and has a value
            if (value && !value.includes('FCFA')) {
                const num = parseFloat(value.replace(/[^0-9]/g, '')) || 0;
                e.target.value = num > 0 ? num.toLocaleString('en-US') + ' FCFA' : '';
            }
        });
    }

    // 4. Validation Buttons
    const btnValidate = document.getElementById('BTN_PayBills_Validate');
    const btnValidatePrint = document.getElementById('BTN_PayBills_ValidatePrint');

    if (btnValidate) btnValidate.addEventListener('click', () => validatePayBills(false));
    if (btnValidatePrint) btnValidatePrint.addEventListener('click', () => validatePayBills(true));

    // Fetch and render the data
    await loadUnpaidBills();
};

/**
 * Validates the selected bills before processing payment.
 * Checks for:
 * 1. At least one bill selected.
 * 2. All selected bills belong to the same supplier.
 * 3. Payment amount for each bill does not exceed the amount left.
 */
async function validatePayBills(printMode) {
    const tbody = document.querySelector('#TABLE_PayBills tbody');
    const checkedBoxes = tbody.querySelectorAll('.bill-checkbox:checked');

    if (checkedBoxes.length === 0) {
        showAlert("Please select at least one bill to pay.", "error");
        return;
    }

    // 1. Group selected bills by Vendor ID
    const vendorGroups = {}; 
    
    for (const checkbox of checkedBoxes) {
        const row = checkbox.closest('tr');
        const orderNumber = parseInt(row.dataset.orderNumber, 10);
        const hiddenInput = row.querySelector('.increment-id-hidden');
        const incrementIdValue = hiddenInput ? hiddenInput.value : null;
        const incrementId = parseInt(incrementIdValue, 10);
        const billData = payBillsState.bills.find(b => b.orderNumber === orderNumber);

        if (!billData) continue;

        // --- Check 2: Amount Limits ---
        const amtCell = row.querySelector('.amount');
        const amountToPay = parseFloat(amtCell.innerText.replace(/[^0-9.-]/g, '')) || 0;

        if (amountToPay <= 0) {
            showAlert(`Validation Error: Payment amount for bill ${billData.reference} must be greater than 0.`, "error");
            return;
        }

        if (amountToPay > billData.amountLeft) {
            showAlert(`Validation Error: The amount entered for bill ${billData.reference} (${amountToPay.toLocaleString()}) exceeds the amount left (${billData.amountLeft.toLocaleString()}).`, "error");
            return;
        }

        if (isNaN(incrementId)) {
            showAlert(`Validation Error: Missing Increment ID for bill ${billData.reference}. Cannot process payment.`, "error");
            return;
        }

        const vendorId = billData.vendorId;
        if (!vendorGroups[vendorId]) {
            vendorGroups[vendorId] = {
                lines: [],
                totalAmount: 0,
                vendorId: vendorId
            };
        }

        vendorGroups[vendorId].lines.push({
            orderNumber: billData.orderNumber,
            incrementId: incrementId,
            vendorId: billData.vendorId,
            payment: amountToPay
        });
        vendorGroups[vendorId].totalAmount += amountToPay;
    }

    // 2. Validate Common Fields
    const paymentDate = document.getElementById('PB_PaymentDate').value;
    if (!paymentDate) {
        showAlert("Please select a Payment Date.", "error");
        return;
    }

    const paymentModeCoaIdInput = document.getElementById('PB_PaymentMethod_coaId');
    const paymentModeCoaId = paymentModeCoaIdInput ? paymentModeCoaIdInput.value : null;
    if (!paymentModeCoaId) {
        showAlert("Please select a Payment Method.", "error");
        return;
    }

    const descriptionInput = document.querySelector('.pb-bottom-panel textarea');
    const description = descriptionInput ? descriptionInput.value.trim() : "";
    if (!description) {
        showAlert("Please enter a description/comment.", "error");
        return;
    }

    // 3. Prepare API Requests (One per vendor)
    const requests = [];
    const vendorIds = Object.keys(vendorGroups);

    if (window.SupplierManager) {
        await window.SupplierManager.ensureData();
    }

    for (const vId of vendorIds) {
        const group = vendorGroups[vId];
        let accountsPayableCoaId = null;
        let vendorName = "Unknown";

        if (window.SupplierManager) {
            const supplier = window.SupplierManager.data.mapById.get(parseInt(vId));
            if (supplier) {
                vendorName = supplier.name;
                accountsPayableCoaId = supplier.chartOfAccountsId;
            }
        }
        
        if (!accountsPayableCoaId) {
             showAlert(`Error: Could not determine a valid Accounts Payable account for supplier "${vendorName}".`, "error");
             return; 
        }

        let groupAmountInWords = "";
        if (typeof numberToWords === 'function') {
            groupAmountInWords = numberToWords(group.totalAmount) + " FCFA";
        } else {
            groupAmountInWords = document.getElementById('amount-words').textContent;
        }

        const payload = {
            paymentDate: paymentDate,
            amount: group.totalAmount,
            amountInWords: groupAmountInWords,
            description: description,
            paymentModeCoaId: parseInt(paymentModeCoaId, 10),
            accountsPayableCoaId: parseInt(accountsPayableCoaId, 10),
            lines: group.lines
        };

        requests.push(apiFetch("/api/v1/payBills/addPayBills", {
            method: "POST",
            body: payload
        }));
    }

    // 4. Send Requests
    const btnValidate = document.getElementById('BTN_PayBills_Validate');
    const btnValidatePrint = document.getElementById('BTN_PayBills_ValidatePrint');
    
    if (btnValidate) btnValidate.disabled = true;
    if (btnValidatePrint) btnValidatePrint.disabled = true;

    try {
        const responses = await Promise.all(requests);
        const failures = responses.filter(r => !r || !r.success);
        
        if (failures.length === 0) {
            showAlert("All bills paid successfully!", "success");
            
            // Refresh the table
            await loadUnpaidBills();
            
            // Clear inputs
            if (descriptionInput) descriptionInput.value = "";
            document.getElementById('PB_PaymentMethod').value = "";
            if (paymentModeCoaIdInput) paymentModeCoaIdInput.value = "";
            document.getElementById('PB_TotalToPayInput').value = "";
            document.getElementById('amount-words').textContent = "";
            document.getElementById('bill').textContent = "0 FCFA";
            document.getElementById('net').textContent = "0 FCFA";
            document.getElementById('orig-amt').textContent = "0";
            document.getElementById('paid-amt').textContent = "0";
            document.getElementById('left-amt').textContent = "0";
            document.getElementById('amt-to-pay').textContent = "0";

            if (printMode) {
                // Placeholder for print logic
                // window.print(); 
            }
        } else {
            const errorMessages = failures.map(f => f ? f.message : "Unknown error").join("; ");
            showAlert(`Some payments failed: ${errorMessages}`, "error");
            await loadUnpaidBills(); 
        }
    } catch (error) {
        console.error("Error paying bills:", error);
        showAlert("An error occurred: " + error.message, "error");
    } finally {
        if (btnValidate) btnValidate.disabled = false;
        if (btnValidatePrint) btnValidatePrint.disabled = false;
    }
}

/**
 * Fetches data from the API, maps it to a clean format, and triggers a render.
 * This robust pattern is inspired by chart-of-accounts.js (loadAccountsFromApi).
 */
async function loadUnpaidBills() {
    const tbody = document.querySelector('#TABLE_PayBills tbody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:20px; color:#2e3192;">Loading unpaid bills...</td></tr>';

    if (typeof apiFetch === 'undefined') {
        console.error("apiFetch is not defined. Ensure auth.js is loaded.");
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:20px; color:red;">Error: Core API function not available.</td></tr>';
        return;
    }

    try {
        const response = await apiFetch("/api/v1/payables/supplierBills/getUnPaidSupplierBills?page=1&limit=200");

        if (response && response.success && Array.isArray(response.supplierBills)) {
            // Map the raw API data to our internal state object for consistency
            payBillsState.bills = response.supplierBills.map(bill => ({
                orderNumber: bill.orderNumber,
                increment: bill.increment,
                reference: bill.reference || `ServiceBills_${bill.orderNumber}`,
                vendorId: bill.vendorId,
                dueDate: bill.dueDate ? bill.dueDate.split('T')[0] : null,
                description: bill.description,
                totalIOT: Number(bill.totalIOT) || 0,
                amountLeft: Number(bill.amountLeft) || 0,
                amountPaid: Number(bill.advanceGivens) || 0
            }));
            
            // Sort bills by due date, oldest first, to prepare for redistribution logic
            payBillsState.bills.sort((a, b) => {
                const dateA = a.dueDate ? new Date(a.dueDate) : new Date(0); // Treat null as old
                const dateB = b.dueDate ? new Date(b.dueDate) : new Date(0);
                return dateA - dateB;
            });

            filterAndRenderPayBills();
        } else {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:20px;">${(response && response.message) || 'Failed to load data.'}</td></tr>`;
            payBillsState.bills = [];
            filterAndRenderPayBills();
        }
    } catch (error) {
        console.error("Error fetching unpaid bills:", error);
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:20px; color:red;">Error loading bills: ${error.message}</td></tr>`;
        payBillsState.bills = [];
    }
}

/**
 * Renders the bills from the payBillsState into the table. It only renders, it does not fetch.
 */
function renderPayBillsTable(billsToRender) {
    const tbody = document.querySelector('#TABLE_PayBills tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    // If no specific bills are passed, render from the full state (should be filtered before calling)
    const bills = billsToRender || payBillsState.bills;

    if (bills.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:20px; color:#777;">No unpaid bills found.</td></tr>';
        calculatePayBillsTotals(); // Still calculate to reset totals to 0
        return;
    }

    bills.forEach((bill) => {
        const tr = document.createElement('tr');
        const origAmt = bill.totalIOT;
        const amtLeft = bill.amountLeft;
        const paidAmt = bill.amountPaid;
        
        // Correctly look up supplier name from the global manager
        const supplier = window.SupplierManager.data.mapById.get(bill.vendorId);
        const supplierName = supplier ? supplier.name : `Vendor ID ${bill.vendorId}`;

        // Add a unique key for each row for easier data binding and updates.
        tr.dataset.orderNumber = bill.orderNumber;

        tr.innerHTML = `
            <td>
                <input type="checkbox" class="bill-checkbox">
                <input type="hidden" class="increment-id-hidden" value="${bill.increment || ''}">
            </td>
            <td>${bill.reference}</td>
            <td>${bill.dueDate || 'N/A'}</td>
            <td>${supplierName}</td>
            <td>${bill.description || ''}</td>
            <td class="to-grey" style="text-align:right;">${origAmt.toLocaleString()}</td>
            <td class="to-grey" style="text-align:right;">${paidAmt.toLocaleString()}</td>
            <td class="to-grey" style="text-align:right;">${amtLeft.toLocaleString()}</td>
            <td class="amount" contenteditable="true" style="text-align:right;">0</td>
        `;
        
        tbody.appendChild(tr);
    });

    // Re-attach event listeners to the table body to handle dynamic content
    tbody.removeEventListener('input', handlePayBillsTableInput);
    tbody.removeEventListener('change', handlePayBillsTableChange);
    tbody.addEventListener('input', handlePayBillsTableInput);
    tbody.addEventListener('change', handlePayBillsTableChange);
    
    calculatePayBillsTotals();
    updateHeaderCheckboxState(); // Update header checkbox state after render
}

/**
 * Applies filters based on UI controls and re-renders the pay bills table.
 */
function filterAndRenderPayBills() {
    const payBillsWrapper = document.querySelector('.pay-bills-wrapper');
    if (!payBillsWrapper) return;

    const supplierFilterSelect = document.getElementById('PB_SelectSupplier');
    const dateFilterRadio = payBillsWrapper.querySelector('input[name="show_bills"]:checked');
    const dateInput = payBillsWrapper.querySelector('input[type="date"]');

    let filtered = [...payBillsState.bills];

    // Apply supplier filter
    const selectedSupplierId = supplierFilterSelect.value;
    if (selectedSupplierId) {
        filtered = filtered.filter(bill => bill.vendorId == selectedSupplierId);
    }

    // Apply date filter
    if (dateFilterRadio && dateFilterRadio.value === 'due_on_or_before' && dateInput.value) {
        // Create a date object that represents the end of the selected day for comparison
        const filterDate = new Date(dateInput.value);
        filterDate.setHours(23, 59, 59, 999);

        filtered = filtered.filter(bill => {
            if (!bill.dueDate) return false;
            // Create a date object from the bill's due date string
            const billDate = new Date(bill.dueDate);
            return billDate <= filterDate;
        });
    }

    // Pass the filtered list to the render function
    renderPayBillsTable(filtered);
}

/**
 * Calculates all totals on the Pay Bills screen based on checked rows and editable amounts.
 */
function calculatePayBillsTotals() {
    const tbody = document.querySelector('#TABLE_PayBills tbody');
    if (!tbody) return;
    const rows = tbody.querySelectorAll('tr[data-order-number]'); // Only select actual data rows
    
    let totalOrig = 0, totalPaid = 0, totalLeft = 0, totalToPay = 0;

    rows.forEach(row => {
        // Find the corresponding bill data from state to get the original, non-DOM values
        const orderNumber = parseInt(row.dataset.orderNumber, 10);
        const billData = payBillsState.bills.find(b => b.orderNumber === orderNumber);
        if (!billData) return;

        const checkbox = row.querySelector('.bill-checkbox');
        
        totalOrig += billData.totalIOT;
        totalLeft += billData.amountLeft;
        totalPaid += (billData.totalIOT - billData.amountLeft);

        if (checkbox && checkbox.checked) {
            const amtCell = row.querySelector('.amount');
            const currentPayVal = parseFloat(amtCell.innerText.replace(/[^0-9.-]/g, '')) || 0;
            totalToPay += currentPayVal;
        }
    });

    // Update Footer Totals
    document.getElementById('orig-amt').textContent = totalOrig.toLocaleString();
    document.getElementById('paid-amt').textContent = totalPaid.toLocaleString();
    document.getElementById('left-amt').textContent = totalLeft.toLocaleString();
    document.getElementById('amt-to-pay').textContent = totalToPay.toLocaleString();

    // Update Side Summary & Top Amount
    document.getElementById('bill').textContent = totalOrig.toLocaleString() + " FCFA";
    document.getElementById('net').textContent = totalToPay.toLocaleString() + " FCFA";
    const topAmountInput = document.getElementById('PB_TotalToPayInput');
    if (topAmountInput) {
        // Only update if the input is not focused to avoid disrupting user typing
        if (document.activeElement !== topAmountInput) {
            topAmountInput.value = totalToPay > 0 ? totalToPay.toLocaleString('en-US') + ' FCFA' : '';
        }
    }

    // Update Amount in Words
    const wordsEl = document.getElementById('amount-words');
    if (wordsEl && typeof numberToWords === 'function') {
        wordsEl.textContent = totalToPay > 0 ? numberToWords(Math.round(totalToPay)) + " FCFA" : "";
    }
}

/**
 * Handles input events on the pay bills table, specifically for the editable "Amt. To Pay" cell.
 * @param {Event} e The input event.
 */
function handlePayBillsTableInput(e) {
    if (payBillsState.isRedistributing) return; // Prevent loops during redistribution

    const target = e.target;
    // Handle input on the "Amt. To Pay" cell
    if (target.isContentEditable && target.classList.contains('amount')) {
        const row = target.closest('tr');
        if (!row) return;

        const checkbox = row.querySelector('.bill-checkbox');
        const value = parseFloat(target.innerText.replace(/[^0-9.-]/g, '')) || 0;

        if (checkbox) {
            checkbox.checked = value > 0;
        }
        
        calculatePayBillsTotals();
        updateHeaderCheckboxState();
    }
}

/**
 * Handles change events on the pay bills table, specifically for row checkboxes.
 * @param {Event} e The change event.
 */
function handlePayBillsTableChange(e) {
    const target = e.target;
    // Handle change on a row checkbox
    if (target.type === 'checkbox' && target.classList.contains('bill-checkbox')) {
        const row = target.closest('tr');
        if (!row) return;

        const amtToPayCell = row.querySelector('.amount');
        const orderNumber = parseInt(row.dataset.orderNumber, 10);
        const billData = payBillsState.bills.find(b => b.orderNumber === orderNumber);

        if (amtToPayCell && billData) {
            if (target.checked) {
                // If checked, fill with amount left
                amtToPayCell.innerText = billData.amountLeft.toLocaleString();
            } else {
                // If unchecked, set to 0
                amtToPayCell.innerText = '0';
            }
        }
        
        calculatePayBillsTotals();
        updateHeaderCheckboxState();
    }
}

/**
 * Updates the state of the main header checkbox based on the state of row checkboxes.
 */
function updateHeaderCheckboxState() {
    const checkAll = document.getElementById('PB_CheckAll');
    if (!checkAll) return;

    const tbody = document.querySelector('#TABLE_PayBills tbody');
    if (!tbody) return;

    const allCheckboxes = tbody.querySelectorAll('.bill-checkbox');
    const checkedCheckboxes = tbody.querySelectorAll('.bill-checkbox:checked');

    if (allCheckboxes.length === 0) {
        checkAll.checked = false;
        checkAll.indeterminate = false;
        return;
    }

    if (checkedCheckboxes.length === allCheckboxes.length) {
        checkAll.checked = true;
        checkAll.indeterminate = false;
    } else if (checkedCheckboxes.length > 0) {
        checkAll.checked = false;
        checkAll.indeterminate = true;
    } else {
        checkAll.checked = false;
        checkAll.indeterminate = false;
    }
}

/**
 * This observer detects when the 'pay-bills' screen is loaded into the DOM
 * and calls its initialization function. This is a robust way to handle screen-specific
 * logic in a shared script for a Single Page Application (SPA) where content is loaded dynamically.
 */
const payBillsScreenObserver = new MutationObserver((mutationsList, observer) => {
    for (const mutation of mutationsList) {
        // We are only interested in nodes being added
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            const payBillsWrapper = document.querySelector('.pay-bills-wrapper');
            
            // If the wrapper is found and hasn't been initialized yet
            if (payBillsWrapper && !payBillsWrapper.dataset.initialized) {
                payBillsWrapper.dataset.initialized = 'true'; // Mark as initialized to prevent multiple calls
                
                window.initPayBills();
            }
        }
    }
});

// Start observing the document body for the addition of new screen elements.
payBillsScreenObserver.observe(document.body, { childList: true, subtree: true });

/**
 * Handles user input on the main "Amount" field to redistribute it across bills.
 * @param {Event} e The input event.
 */
function handleTotalToPayInput(e) {
    if (payBillsState.isRedistributing) return;
    payBillsState.isRedistributing = true;

    const totalAmount = parseFloat(e.target.value.replace(/[^0-9]/g, '')) || 0;
    const tbody = document.querySelector('#TABLE_PayBills tbody');
    const rows = tbody.querySelectorAll('tr[data-order-number]');

    let remainingAmount = totalAmount;

    // Clear all 'Amt. To Pay' and uncheck boxes before redistributing.
    rows.forEach(row => {
        const amtToPayCell = row.querySelector('.amount');
        const checkbox = row.querySelector('.bill-checkbox');
        if (amtToPayCell) amtToPayCell.innerText = '0';
        if (checkbox) checkbox.checked = false;
    });

    // Redistribute the total amount starting from the first visible row (which are sorted by date)
    for (const row of rows) {
        if (remainingAmount <= 0) break;

        const orderNumber = parseInt(row.dataset.orderNumber, 10);
        const billData = payBillsState.bills.find(b => b.orderNumber === orderNumber);
        if (!billData) continue;

        const amtLeft = billData.amountLeft;
        const amtToPayCell = row.querySelector('.amount');
        const checkbox = row.querySelector('.bill-checkbox');

        if (amtLeft > 0) {
            const amountToApply = Math.min(remainingAmount, amtLeft);
            
            if (amtToPayCell) amtToPayCell.innerText = amountToApply.toLocaleString();
            if (checkbox) checkbox.checked = true;
            
            remainingAmount -= amountToApply;
        }
    }

    calculatePayBillsTotals();
    updateHeaderCheckboxState();

    payBillsState.isRedistributing = false;
}
