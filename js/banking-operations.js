/* ===== BANKING OPERATIONS JS ===== */

/**
 * Banking Operations Module
 * Handles all banking transactions: Deposits, Withdrawals, Interest, Charges, Internal Transfers
 * Also manages approval workflows and print functionality
 */

// ===== BANKING TRANSACTION STATE =====
const bankingState = {
    transactions: [],
    currentTransactionType: null,
    filters: {},
    isFiltering: false
};

/**
 * Global store for company details for printing
 */
window.companyDetails = {};

/**
 * Fetches company details for use in print templates
 */
async function loadCompanyDetails() {
    if (typeof apiFetch === 'undefined') {
        console.warn("loadCompanyDetails: apiFetch is undefined. Using defaults.");
        return;
    }
    
    try {
        const response = await apiFetch("/api/v1/company/getCompanyDetails", { method: "GET" });
        if (response && response.success && response.data) {
            window.companyDetails = response.data;
            console.log("Company details loaded successfully");
        } else {
            console.warn("loadCompanyDetails: Failed to load company details");
        }
    } catch (error) {
        console.warn("loadCompanyDetails: Error occurred during fetch:", error);
    }
}

/**
 * Initialize Amount in Words Listener for Banking Screens
 * Converts numeric input to words format
 */
function attachBankingAmountWordsListener() {
    const input = document.getElementsByClassName('amount-input');
    const words = document.getElementsByClassName('amount-words');
    if (input && words) {
        for (let i = 0; i < input.length; i++) {
            input[i].addEventListener('input', function() {
                let val = parseInt(this.value.replace(/[^0-9]/g, '')) || 0;
                words[i].textContent = val ? numberToWords(val) + " FCFA" : "Amount in words";
                
                // Also update the input width for better UX
                this.style.width = '60px'; // reset to min
                this.style.width = (this.value.length * 24 + 40) + 'px';
            });
        }
    }
}

/**
 * Helper to transform a select element into a CoA Account Picker trigger.
 * @param {HTMLSelectElement|HTMLInputElement} el The element to transform
 * @param {string} label The label for the picker title (Source/Destination)
 */
function setupBankingAccountPicker(el, label) {
    if (!el) return null;
    
    let trigger = el;
    // If it's a select, replace it with an input for better UI consistency with pickers
    if (el.tagName === 'SELECT') {
        trigger = document.createElement('input');
        trigger.type = 'text';
        trigger.id = el.id;
        trigger.className = el.className;
        trigger.style.cssText = el.style.cssText;
        el.parentNode.replaceChild(trigger, el);
    }

    trigger.readOnly = true;
    trigger.style.cursor = 'pointer';
    trigger.style.background = '#fff';
    trigger.placeholder = `-- Click to select ${label} account --`;
    trigger.classList.add('banking-account-picker');

    trigger.addEventListener('click', () => {
        if (window.AccountPicker) {
            window.AccountPicker.open({
                title: `Select ${label} Account (Bank/Cash)`,
                targetClasses: ["CLASS 5"],
                onSelect: (acc) => { if (acc) { trigger.value = acc.name; trigger.dataset.coaId = acc.id; trigger.dispatchEvent(new Event('change', { bubbles: true })); } }
            });
        }
    });
    return trigger;
}

/**
 * Number to Words Conversion
 * Converts numeric amount to written words
 */
function numberToWords(n) {
    if (n === 0) return "Zero";
    const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n/10)] + (n%10 ? " " + a[n%10] : "");
    if (n < 1000) return a[Math.floor(n/100)] + " Hundred" + (n%100 ? " " + numberToWords(n%100) : "");
    if (n < 1000000) return numberToWords(Math.floor(n/1000)) + " Thousand" + (n%1000 ? " " + numberToWords(n%1000) : "");
    if (n < 1000000000) return numberToWords(Math.floor(n/1000000)) + " Million" + (n%1000000 ? " " + numberToWords(n%1000000) : "");
    return "";
}

function generateBankingDescription(type, sourceAccount, destinationAccount) {
    const source = sourceAccount && sourceAccount !== 'N/A' ? sourceAccount : '';
    const destination = destinationAccount && destinationAccount !== 'N/A' ? destinationAccount : '';

    switch (type) {
        case 'Bank Deposit':
            return `Bank Deposit${destination ? ` into ${destination}` : ''}.`;
        case 'Bank Withdrawal':
            return `Bank Withdrawal${source ? ` from ${source}` : ''}.`;
        case 'Bank Interest':
            return `Bank Interest received${destination ? ` into ${destination}` : ''}.`;
        case 'Bank Charges':
            return `Bank Charges paid${source ? ` from ${source}` : ''}.`;
        case 'Internal Funds Transfer':
            return `Internal Funds Transfer${source ? ` from ${source}` : ''}${source && destination ? ' ' : ''}${destination ? `to ${destination}` : ''}.`;
        default:
            const accountDetails = [source, destination].filter(Boolean).join(' to ');
            return `${type} transaction${accountDetails ? ` ${accountDetails}` : ''}.`;
    }
}

function initializeBankingDescription(type) {
    const descTextarea = document.querySelector('.form-body textarea');
    if (!descTextarea) return;

    const selectElements = document.querySelectorAll('select, .banking-account-picker');
    const getSourceAccount = () => selectElements[0] ? selectElements[0].value : 'N/A';
    const getDestinationAccount = () => {
        if (selectElements.length >= 2) return selectElements[1].value;
        if (selectElements.length === 1 && type !== 'Bank Deposit' && type !== 'Bank Withdrawal') return selectElements[0].value;
        return 'N/A';
    };

    const updateDescription = () => {
        if (descTextarea.dataset.customized === 'true') return;
        descTextarea.value = generateBankingDescription(type, getSourceAccount(), getDestinationAccount());
    };

    const defaultDescription = generateBankingDescription(type, getSourceAccount(), getDestinationAccount());
    if (!descTextarea.value.trim()) {
        descTextarea.value = defaultDescription;
    }

    selectElements.forEach(select => {
        select.addEventListener('change', updateDescription);
    });

    descTextarea.addEventListener('input', () => {
        descTextarea.dataset.customized = 'true';
    });
}

/**
 * Generate Banking Transaction Voucher Template for Printing
 * Matches the professional voucher format from pay_bills
 */
function generateBankingVoucherTemplate(data, companyDetails) {
    const c = companyDetails || window.companyDetails || {};

    // Use placeholders for any missing data
    const amount = data.amount ? Number(data.amount).toLocaleString('en-US') + ' FCFA' : '0 FCFA';
    const amountInWords = data.amountInWords || '__________________';
    const referenceNumber = data.referenceNumber || 'Banking_____';
    const transactionDate = data.transactionDate || '____/__/__';
    const description = data.description || '__________________';
    const sentBy = localStorage.getItem('username') || 'Staff Name';

    return `
        <div style="
            font-family: 'Arial', sans-serif; 
            font-size: 14px; 
            width: 210mm; 
            height: 297mm; 
            padding: 10px 5mm; 
            margin: auto; 
            box-sizing: border-box;
            background: white;
            color: black;
            position: relative;
            line-height: 1.6;
        ">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="width: 120px; vertical-align: top;">
                        <img src="${c.logoUrl || ''}" alt="Logo" style="width: 100px; height: 100px; object-fit: contain; border: 1px solid #eee;">
                    </td>
                    <td style="text-align: center;">
                        <div style="font-size: 26px; font-weight: bold;" id="companyName">${c.nameOfCompany || 'BIAKA HOSPITAL'}</div>
                        <div style="font-size: 12px;"><span id="companyAddress">${c.address || 'Address'}</span> TEL: <span id="companyPhone">${c.phoneNumber || 'Phone'}</span></div>
                        <div style="font-size: 12px;">Email: <span id="companyEmail">${c.email1 || 'Email'}</span> &nbsp; Web: <span id="companyWebsite">${c.websiteAddress || 'Website'}</span></div>
                        <div style="font-size: 14px; font-weight: bold; font-style: italic; margin-top: 5px;">Motto: <span id="companySlogan">${c.slogan || 'Slogan'}</span></div>
                    </td>
                </tr>
            </table>

            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 20px;">
                <div style="font-size: 22px; font-weight: bold;">${data.transactionType || 'BANKING TRANSACTION'}</div>
                <div style="width: 250px;">
                    <div style="display: flex; align-items: baseline;">
                        <strong style="width: 80px; text-align: right; padding-right: 10px;">Ref No:</strong>
                        <span style="flex-grow: 1; border-bottom: 1px dotted black;">${referenceNumber}</span>
                    </div>
                    <div style="display: flex; align-items: baseline; margin-top: 5px;">
                        <strong style="width: 80px; text-align: right; padding-right: 10px;">Date:</strong>
                        <span style="flex-grow: 1; border-bottom: 1px dotted black;">${transactionDate}</span>
                    </div>
                </div>
            </div>

            <div style="margin-top: 20px; display: flex; align-items: baseline;">
                <span style="white-space: nowrap;">Amount:</span>
                <span style="font-weight: bold; flex-grow: 1; font-size: 28px; margin-left: 15px; padding: 0 7px; border-bottom: 1px dotted black; text-align: left;">
                    ${amount}
                </span>
            </div>

            <div style="margin-top: 5px; display: flex; align-items: baseline;">
                <strong style="white-space: nowrap; margin-right: 10px;">(In words):</strong>
                <div style="
                    flex-grow: 1; 
                    text-transform: uppercase; 
                    border-bottom: 1px black dotted;
                    font-size: 20px;
                    padding-left: 6px;
                ">
                    ${amountInWords}
                </div>
            </div>

            <div style="margin-top: 12px; display: flex; align-items: baseline;">
                <strong style="width: 100px;">Description:</strong>
                <div style="flex-grow: 1; border-bottom: 1px dotted black; font-size: 18px; padding-left: 6px; word-break: break-word;">
                    ${description}
                </div>
            </div>

            <div style="text-align: center; font-weight: bold; margin: 20px 0 10px 0; font-style: italic;">Signatures and Names</div>
            <div style="display: flex; justify-content: space-between; gap: 10px;">
                <div style="width: 48%;">
                    <div style="display: flex; align-items: baseline; margin-bottom: 40px;">
                        <strong style="margin-right: 5px;">Sent By:</strong>
                        <div style="flex: 1; border-bottom: 1px dotted black;">${sentBy}</div>
                    </div>
                    <div style="display: flex; align-items: baseline;">
                        <strong style="margin-right: 5px;">Signature:</strong>
                        <div style="flex: 1; border-bottom: 1px dotted black; height: 16px;"></div>
                    </div>
                </div>
                <div style="width: 48%;">
                    <div style="display: flex; align-items: baseline; margin-bottom: 40px;">
                        <strong style="margin-right: 5px;">Received By:</strong>
                        <div style="flex: 1; border-bottom: 1px dotted black;">Receiver's Name</div>
                    </div>
                    <div style="display: flex; align-items: baseline;">
                        <strong style="margin-right: 5px;">Signature:</strong>
                        <div style="flex: 1; border-bottom: 1px dotted black; height: 16px;"></div>
                    </div>
                </div>
            </div>

            <div style="position: relative; top: 4px; display: flex; justify-content: space-between; font-size: 10px; padding-top: 5px; color: #333;">
                <div>Copyright(c)2022. Institute ERP Pro</div>
                <div>Powered by AfricRenov Group Sarl.</div>
            </div>
        </div>
    `;
}

/**
 * Generate and Print Banking Voucher
 */
function generateAndPrintBankingVoucher(data) {
    const templateHTML = generateBankingVoucherTemplate(data, window.companyDetails);

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Banking Transaction - ${data.transactionType}</title>
            <meta charset="utf-8">
        </head>
        <body>
            ${templateHTML}
            <script>
                window.onload = function() {
                    window.focus();
                    window.print();
                    window.close();
                };
            <\/script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

/**
 * Get Transaction Data from Form
 */
function getBankingTransactionData(type) {
    const amountInput = document.getElementById('amount-input');
    const amountWordsEl = document.getElementById('amount-words');
    const descTextarea = document.querySelector('.form-body textarea');
    const dateInputs = document.querySelectorAll('[type="date"]');
    const selectElements = document.querySelectorAll('select');
    const pickerElements = document.querySelectorAll('.banking-account-picker');
    
    const amount = amountInput ? amountInput.value : '0';
    const dateInput = dateInputs.length > 0 ? dateInputs[0] : null;
    const refInput = document.querySelector('input[value*="Banking"]');
    
    // Prioritize picker elements over standard selects
    const inputs = pickerElements.length > 0 ? pickerElements : selectElements;
    
    let sourceAccount = inputs[0] ? inputs[0].value : 'N/A';
    let destinationAccount = inputs[1] ? inputs[1].value : 'N/A';

    if (inputs.length === 1) {
        if (type === 'Bank Deposit' || type === 'Bank Interest') {
            destinationAccount = inputs[0].value;
            sourceAccount = 'N/A';
        } else {
            sourceAccount = inputs[0].value;
            destinationAccount = 'N/A';
        }
    }

    const customDescription = descTextarea ? descTextarea.value.trim() : '';
    const autoDescription = generateBankingDescription(type, sourceAccount, destinationAccount);
    const description = customDescription || autoDescription;

    return {
        transactionType: type.toUpperCase(),
        amount: amount,
        amountInWords: amountWordsEl ? amountWordsEl.textContent : 'Amount in words',
        description: description,
        transactionDate: dateInput ? dateInput.value : new Date().toISOString().split('T')[0],
        referenceNumber: refInput ? refInput.value : 'REF_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        sourceAccount: sourceAccount,
        sourceAccountId: inputs[0] ? inputs[0].dataset.coaId : null,
        destinationAccount: destinationAccount,
        destinationAccountId: inputs[1] ? inputs[1].dataset.coaId : (inputs.length === 1 ? inputs[0].dataset.coaId : null),
        preparedBy: localStorage.getItem('username') || 'System',
        status: 'Pending'
    };
}

/**
 * Validate Banking Transaction Form
 */
function validateBankingTransactionForm() {
    const amountInput = document.getElementById('amount-input');
    const descTextarea = document.querySelector('.form-body textarea');
    const dateInput = document.querySelector('[type="date"]');
    
    if (!amountInput || !amountInput.value || parseInt(amountInput.value.replace(/[^0-9]/g, '')) <= 0) {
        showAlert('Please enter a valid amount.', 'error');
        return false;
    }
    
    if (!dateInput || !dateInput.value) {
        showAlert('Please select a transaction date.', 'error');
        return false;
    }
    
    if (!descTextarea || !descTextarea.value.trim()) {
        showAlert('Please enter a description for this transaction.', 'error');
        return false;
    }
    
    return true;
}

/**
 * Handle Banking Transaction Validation and Print
 */
async function validateBankingTransaction(type, printMode = false) {
    if (!validateBankingTransactionForm()) {
        return;
    }
    
    try {
        const transactionData = getBankingTransactionData(type);
        
        showAlert(`${type} transaction validated successfully!`, 'success');
        
        if (printMode) {
            // Generate and open the print template
            await loadCompanyDetails();
            generateAndPrintBankingVoucher(transactionData);
        }
        
        // Store the transaction in state
        bankingState.transactions.push({
            ...transactionData,
            timestamp: new Date().toISOString()
        });
        
        console.log('Transaction saved:', transactionData);
    } catch (error) {
        console.error('Error validating transaction:', error);
        showAlert('An error occurred: ' + error.message, 'error');
    }
}

/**
 * Initialize Bank Deposit Screen
 */
window.initBankDeposit = function() {
    console.log("initBankDeposit: Initializing...");
    attachBankingAmountWordsListener();
    
    const selects = document.querySelectorAll('select');
    if (selects[0]) setupBankingAccountPicker(selects[0], 'Source');
    if (selects[1]) setupBankingAccountPicker(selects[1], 'Destination');

    initializeBankingDescription('Bank Deposit');
    
    // Set default date
    const dateInput = document.querySelector('[type="date"]');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
    
    // Load company details for printing
    if (typeof loadCompanyDetails === 'function') {
        loadCompanyDetails();
    }
    
    // Attach button listeners with proper cleanup (clone approach)
    const validateOnlyBtn = document.getElementById('BTN_BankDeposit_ValidateOnly') || 
                           document.querySelectorAll('button')[0];
    const validatePrintBtn = document.getElementById('BTN_BankDeposit_ValidatePrint') || 
                            document.querySelectorAll('button')[1];
    
    if (validateOnlyBtn) {
        const newValidateBtn = validateOnlyBtn.cloneNode(true);
        validateOnlyBtn.parentNode.replaceChild(newValidateBtn, validateOnlyBtn);
        newValidateBtn.addEventListener('click', () => validateBankingTransaction('Bank Deposit', false));
    }
    
    if (validatePrintBtn) {
        const newPrintBtn = validatePrintBtn.cloneNode(true);
        validatePrintBtn.parentNode.replaceChild(newPrintBtn, validatePrintBtn);
        newPrintBtn.addEventListener('click', () => validateBankingTransaction('Bank Deposit', true));
    }
};

/**
 * Initialize Bank Withdrawal Screen
 */
window.initBankWithdrawal = function() {
    console.log("initBankWithdrawal: Initializing...");
    attachBankingAmountWordsListener();
    
    const selects = document.querySelectorAll('select');
    if (selects[0]) setupBankingAccountPicker(selects[0], 'Source');
    if (selects[1]) setupBankingAccountPicker(selects[1], 'Destination');

    initializeBankingDescription('Bank Withdrawal');
    
    const dateInput = document.querySelector('[type="date"]');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
    
    if (typeof loadCompanyDetails === 'function') {
        loadCompanyDetails();
    }
    
    const validateOnlyBtn = document.getElementById('BTN_BankWithdrawal_ValidateOnly') || 
                           document.querySelectorAll('button')[0];
    const validatePrintBtn = document.getElementById('BTN_BankWithdrawal_ValidatePrint') || 
                            document.querySelectorAll('button')[1];
    
    if (validateOnlyBtn) {
        const newValidateBtn = validateOnlyBtn.cloneNode(true);
        validateOnlyBtn.parentNode.replaceChild(newValidateBtn, validateOnlyBtn);
        newValidateBtn.addEventListener('click', () => validateBankingTransaction('Bank Withdrawal', false));
    }
    
    if (validatePrintBtn) {
        const newPrintBtn = validatePrintBtn.cloneNode(true);
        validatePrintBtn.parentNode.replaceChild(newPrintBtn, validatePrintBtn);
        newPrintBtn.addEventListener('click', () => validateBankingTransaction('Bank Withdrawal', true));
    }
};

/**
 * Initialize Bank Interest Screen
 */
window.initBankInterest = function() {
    console.log("initBankInterest: Initializing...");
    attachBankingAmountWordsListener();
    
    const select = document.querySelector('select');
    if (select) setupBankingAccountPicker(select, 'Destination');

    initializeBankingDescription('Bank Interest');
    
    const dateInput = document.querySelector('[type="date"]');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
    
    if (typeof loadCompanyDetails === 'function') {
        loadCompanyDetails();
    }
    
    const validateOnlyBtn = document.getElementById('BTN_BankInterest_ValidateOnly') || 
                           document.querySelectorAll('button')[0];
    const validatePrintBtn = document.getElementById('BTN_BankInterest_ValidatePrint') || 
                            document.querySelectorAll('button')[1];
    
    if (validateOnlyBtn) {
        const newValidateBtn = validateOnlyBtn.cloneNode(true);
        validateOnlyBtn.parentNode.replaceChild(newValidateBtn, validateOnlyBtn);
        newValidateBtn.addEventListener('click', () => validateBankingTransaction('Bank Interest', false));
    }
    
    if (validatePrintBtn) {
        const newPrintBtn = validatePrintBtn.cloneNode(true);
        validatePrintBtn.parentNode.replaceChild(newPrintBtn, validatePrintBtn);
        newPrintBtn.addEventListener('click', () => validateBankingTransaction('Bank Interest', true));
    }
};

/**
 * Initialize Bank Charges Screen
 */
window.initBankCharges = function() {
    console.log("initBankCharges: Initializing...");
    attachBankingAmountWordsListener();
    
    const select = document.querySelector('select');
    if (select) setupBankingAccountPicker(select, 'Source');

    initializeBankingDescription('Bank Charges');
    
    const dateInput = document.querySelector('[type="date"]');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
    
    if (typeof loadCompanyDetails === 'function') {
        loadCompanyDetails();
    }
    
    const validateOnlyBtn = document.getElementById('BTN_BankCharges_ValidateOnly') || 
                           document.querySelectorAll('button')[0];
    const validatePrintBtn = document.getElementById('BTN_BankCharges_ValidatePrint') || 
                            document.querySelectorAll('button')[1];
    
    if (validateOnlyBtn) {
        const newValidateBtn = validateOnlyBtn.cloneNode(true);
        validateOnlyBtn.parentNode.replaceChild(newValidateBtn, validateOnlyBtn);
        newValidateBtn.addEventListener('click', () => validateBankingTransaction('Bank Charges', false));
    }
    
    if (validatePrintBtn) {
        const newPrintBtn = validatePrintBtn.cloneNode(true);
        validatePrintBtn.parentNode.replaceChild(newPrintBtn, validatePrintBtn);
        newPrintBtn.addEventListener('click', () => validateBankingTransaction('Bank Charges', true));
    }
};

/**
 * Initialize Internal Transfer Screen
 */
window.initInternalTransfer = function() {
    console.log("initInternalTransfer: Initializing...");
    attachBankingAmountWordsListener();
    
    const selects = document.querySelectorAll('select');
    if (selects[0]) setupBankingAccountPicker(selects[0], 'Source');
    if (selects[1]) setupBankingAccountPicker(selects[1], 'Destination');

    initializeBankingDescription('Internal Funds Transfer');
    
    const dateInput = document.querySelector('[type="date"]');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
    
    if (typeof loadCompanyDetails === 'function') {
        loadCompanyDetails();
    }
    
    const forwardOnlyBtn = document.getElementById('BTN_InternalTransfer_ForwardOnly') || 
                          document.querySelectorAll('button')[0];
    const forwardPrintBtn = document.getElementById('BTN_InternalTransfer_ForwardPrint') || 
                           document.querySelectorAll('button')[1];
    
    if (forwardOnlyBtn) {
        const newForwardBtn = forwardOnlyBtn.cloneNode(true);
        forwardOnlyBtn.parentNode.replaceChild(newForwardBtn, forwardOnlyBtn);
        newForwardBtn.addEventListener('click', () => validateBankingTransaction('Internal Funds Transfer', false));
    }
    
    if (forwardPrintBtn) {
        const newPrintBtn = forwardPrintBtn.cloneNode(true);
        forwardPrintBtn.parentNode.replaceChild(newPrintBtn, forwardPrintBtn);
        newPrintBtn.addEventListener('click', () => validateBankingTransaction('Internal Funds Transfer', true));
    }
};

/**
 * Render Transfers Pending Table
 */
function renderTransfersPendingTable(data = []) {
    const tbody = document.querySelector('#TABLE_TransfersPending tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const sampleData = [
        {
            sn: 1,
            refNo: '675',
            date: '02/04/2026',
            description: 'Internal Funds Transfer from Buea Police Credit Union',
            transferFrom: 'Buea Police Credit Union',
            transferTo: 'Ecobank Buea',
            amount: '1,000',
            sendBy: '', 
            receivedBy: '',
            status: 'Unapproved'
        }
    ];
    
    const displayData = data.length > 0 ? data : sampleData;
    
    displayData.forEach((row, idx) => {
        const tr = document.createElement('tr');
        tr.style.background = (idx % 2 === 0) ? '#f7f7f7' : 'inherit';
        
        const statusClass = row.status === 'Approved' ? 'status-approved' : row.status === 'Rejected' ? 'status-rejected' : 'status-unapproved';
        
        tr.innerHTML = `
            <td>${row.sn}</td>
            <td>${row.refNo}</td>
            <td>${row.date}</td>
            <td>${row.description}</td>
            <td>${row.transferFrom}</td>
            <td>${row.transferTo}</td>
            <td style="text-align: right; font-weight: bold;">${row.amount}</td>
            <td>${row.sendBy}</td>
            <td>${row.receivedBy}</td>
            <td><span class="status-badge ${statusClass}">${row.status}</span></td>
            <td style="text-align: center;">
                <button class="wd-btn approve" onclick="approvePendingTransfer(${row.sn})" style="width: 60px; padding: 4px; margin: 2px; background: #28a745; color: white;">Approve</button>
                <button class="wd-btn reject" onclick="rejectPendingTransfer(${row.sn})" style="width: 60px; padding: 4px; margin: 2px; background: #dc3545; color: white;">Reject</button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

/**
 * Approve Pending Transfer
 */
function approvePendingTransfer(refNo) {
    showConfirmModal({
        title: "Approve Transfer",
        message: "Are you sure you wish to Approve this transaction?",
        onOk: () => {
            showAlert('Transfer #' + refNo + ' approved successfully!', 'success');
            // Reload data
            initTransfersPending();
        }
    });
}

/**
 * Reject Pending Transfer
 */
function rejectPendingTransfer(refNo) {
    showConfirmModal({
        title: "Reject Transfer",
        message: "Are you sure you wish to Reject this transaction?",
        onOk: () => {
            showAlert('Transfer #' + refNo + ' rejected successfully!', 'error');
            // Reload data
            initTransfersPending();
        }
    });
}

/**
 * Initialize Transfers Pending Approval Screen
 */
window.initTransfersPending = function() {
    console.log("initTransfersPending: Initializing...");
    
    renderTransfersPendingTable();
    
    // Add filter listener
    const filterSelect = document.getElementById('FILTER_TransferStatus');
    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            // Filter logic here
            console.log('Filter by status:', e.target.value);
        });
    }
    
    // Add search listener
    const searchInput = document.getElementById('EDT_GlobalSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            console.log('Search:', e.target.value);
        });
    }
};

/**
 * Render Rejected Transfers Table
 */
function renderRejectedTransfersTable(data = []) {
    const tbody = document.querySelector('#TABLE_RejectedTransfers tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const sampleData = [
        {
            sn: 1,
            refNo: '6',
            date: '14/07/2023',
            description: 'Internal Funds Transfer from Main cash account to Internal Safe',
            transferFrom: 'Personnel Recruitment Exp.',
            transferTo: '###',
            amount: '5,059,000',
            sendBy: 'Chia Richard',
            receivedBy: 'Claudette Manka',
            rejectionReason: '',
            rejectedBy: 'Rejected',
            status: 'Rejected'
        }
    ];
    
    const displayData = data.length > 0 ? data : sampleData;
    
    displayData.forEach((row, idx) => {
        const tr = document.createElement('tr');
        tr.style.background = '#f5e6e6'; // Rejected status background
        
        tr.innerHTML = `
            <td>${row.sn}</td>
            <td>${row.refNo}</td>
            <td>${row.date}</td>
            <td>${row.description}</td>
            <td>${row.transferFrom}</td>
            <td>${row.transferTo}</td>
            <td style="text-align: right; font-weight: bold;">${row.amount}</td>
            <td>${row.sendBy}</td>
            <td>${row.receivedBy}</td>
            <td>${row.rejectionReason}</td>
            <td>${row.rejectedBy}</td>
            <td style="text-align: center;">
                <button class="wd-btn primary" onclick="modifyRejectedTransfer(${row.sn})" style="width: 60px; padding: 4px; margin: 2px;">Modify</button>
                <button class="wd-btn reject" onclick="deleteRejectedTransfer(${row.sn})" style="width: 60px; padding: 4px; margin: 2px; background: #dc3545; color: white;">Delete</button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

/**
 * Modify Rejected Transfer
 */
function modifyRejectedTransfer(refNo) {
    showAlert('Opening transfer #' + refNo + ' for modification...', 'success');
    // Load transfer form with data
}

/**
 * Delete Rejected Transfer
 */
function deleteRejectedTransfer(refNo) {
    showConfirmModal({
        title: "Delete Record",
        message: "Are you sure you wish to delete this record? This Operation CANNOT be Reversed.",
        okText: "Delete Forever",
        onOk: () => {
            showAlert('Transfer #' + refNo + ' deleted successfully!', 'success');
            // Reload data
            initRejectedTransfers();
        }
    });
}

/**
 * Initialize Rejected Transfers Screen
 */
window.initRejectedTransfers = function() {
    console.log("initRejectedTransfers: Initializing...");
    
    renderRejectedTransfersTable();
    
    // Add search listener
    const searchInput = document.getElementById('EDT_GlobalSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            console.log('Search:', e.target.value);
        });
    }
};

/**
 * Render Internal Transfers Dashboard Table
 */
function renderInternalTransfersDashboard(data = []) {
    const tbody = document.querySelector('#TABLE_InternalTransfersDashboard tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const sampleData = [
        {
            sn: 1,
            ref: '6',
            date: '14/07/2023',
            description: 'Internal Funds Transfer from Main cash account to Internal Safe',
            transferFrom: 'Main cash account',
            transferTo: 'Internal Safe',
            amount: '5,059,000',
            sendBy: 'Chia Richard',
            receivedBy: 'Claudette Manka',
            status: 'Unapproved'
        }
    ];
    
    const displayData = data.length > 0 ? data : sampleData;
    
    displayData.forEach((row, idx) => {
        const tr = document.createElement('tr');
        tr.style.background = (idx % 2 === 0) ? '#f7f7f7' : 'inherit';
        
        const statusClass = row.status === 'Approved' ? 'status-approved' : row.status === 'Rejected' ? 'status-rejected' : 'status-unapproved';
        
        tr.innerHTML = `
            <td>${row.sn}</td>
            <td>${row.ref}</td>
            <td>${row.date}</td>
            <td>${row.description}</td>
            <td>${row.transferFrom}</td>
            <td>${row.transferTo}</td>
            <td style="text-align: right; font-weight: bold;">${row.amount}</td>
            <td>${row.sendBy}</td>
            <td>${row.receivedBy}</td>
            <td><span class="status-badge ${statusClass}">${row.status}</span></td>
            <td style="text-align: center;">
                <button class="wd-btn approve" onclick="actionDashboardTransfer(${row.sn}, 'approve')" style="width: 60px; padding: 4px; margin: 2px; background: #28a745; color: white;">Approve</button>
                <button class="wd-btn reject" onclick="actionDashboardTransfer(${row.sn}, 'reject')" style="width: 60px; padding: 4px; margin: 2px; background: #dc3545; color: white;">Reject</button>
                <button class="wd-btn modify" onclick="actionDashboardTransfer(${row.sn}, 'modify')" style="width: 60px; padding: 4px; margin: 2px;">Modify</button>
                <button class="wd-btn delete" onclick="actionDashboardTransfer(${row.sn}, 'delete')" style="width: 60px; padding: 4px; margin: 2px; background: #999; color: white;">Delete</button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

/**
 * Handle Dashboard Transfer Actions
 */
function actionDashboardTransfer(refNo, action) {
    switch(action) {
        case 'approve':
            showConfirmModal({
                title: "Approve Transfer",
                message: "Are you sure you wish to Approve this transaction?",
                onOk: () => {
                    showAlert('Transfer #' + refNo + ' approved successfully!', 'success');
                }
            });
            break;
        case 'reject':
            showConfirmModal({
                title: "Reject Transfer",
                message: "Are you sure you wish to Reject this transaction?",
                okText: "Reject",
                onOk: () => {
                    showAlert('Transfer #' + refNo + ' rejected successfully!', 'error');
                }
            });
            break;
        case 'modify':
            showAlert('Opening transfer #' + refNo + ' for modification...', 'success');
            break;
        case 'delete':
            showConfirmModal({
                title: "Delete Record",
                message: "Are you sure you wish to delete this record? This Operation CANNOT be Reversed.",
                okText: "Delete Forever",
                onOk: () => {
                    showAlert('Transfer #' + refNo + ' deleted successfully!', 'success');
                }
            });
            break;
    }
}

/**
 * Initialize Internal Transfers Dashboard Screen
 */
window.initInternalTransfersDashboard = function() {
    console.log("initInternalTransfersDashboard: Initializing...");
    
    renderInternalTransfersDashboard();
    
    // Add filter listeners
    const searchBtn = document.getElementById('BTN_Search');
    const refreshBtn = document.getElementById('BTN_Refresh');
    const statusRadios = document.querySelectorAll('input[name="status-filter"]');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const fromDate = document.getElementById('FILTER_DateFrom').value;
            const toDate = document.getElementById('FILTER_DateTo').value;
            const status = document.getElementById('FILTER_DashboardStatus').value;
            console.log('Search filters - From:', fromDate, 'To:', toDate, 'Status:', status);
        });
    }
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            renderInternalTransfersDashboard();
            showAlert('Data refreshed!', 'success');
        });
    }
    
    statusRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            console.log('Status filter changed to:', e.target.value);
        });
    });
};

/**
 * Add styles for status badges
 */
function addBankingStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            margin: 2px;
        }
        .status-unapproved {
            background: #ffc107;
            color: #333;
        }
        .status-approved {
            background: #28a745;
            color: white;
        }
        .status-rejected {
            background: #dc3545;
            color: white;
        }
        .status-deleted {
            background: #6c757d;
            color: white;
        }
        .wd-btn {
            cursor: pointer;
            border: none;
            border-radius: 3px;
            font-size: 12px;
            font-weight: bold;
            transition: all 0.3s ease;
        }
        .wd-btn:hover {
            opacity: 0.8;
            transform: scale(1.05);
        }
    `;
    document.head.appendChild(style);
}

// Initialize styles when module loads
addBankingStyles();

console.log('Banking Operations Module Loaded Successfully');
