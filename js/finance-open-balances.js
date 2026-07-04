/**
 * js/finance-open-balances.js
 * Handles Account Opening Balances setup.
 */

window.openingBalances = [
    { code: "1010000", name: "Share Capital, Calledup and Paid", type: "CLASS 1", balance: 10000000, isDebit: false },
    { code: "106000", name: "Revaluation Surplus", type: "CLASS 1", balance: 1800000, isDebit: false },
    { code: "1210000", name: "Retained Earnings", type: "CLASS 1", balance: 413411259, isDebit: false },
    { code: "1301000", name: "Net Profit/Loss for the Period", type: "CLASS 1", balance: 168821791, isDebit: false },
    { code: "1621000", name: "Long-Term loan SGC 606605", type: "CLASS 1", balance: 183830891, isDebit: false },
    { code: "2110000", name: "Research and Development", type: "CLASS 2", balance: 3102600, isDebit: true },
    { code: "2130000", name: "Management and Accounting Software", type: "CLASS 2", balance: 750000, isDebit: true },
    { code: "2131000", name: "Computer Server", type: "CLASS 2", balance: 6750000, isDebit: true },
    { code: "228", name: "Land", type: "CLASS 2", balance: 32250000, isDebit: true },
    { code: "2310000", name: "Buildings", type: "CLASS 2", balance: 190375741, isDebit: true },
    { code: "2315000", name: "Classroom Block 1", type: "CLASS 2", balance: 18784600, isDebit: true },
    { code: "2325000", name: "Classroom Block 3", type: "CLASS 2", balance: 122303509, isDebit: true },
    { code: "2333000", name: "Construction of Gutter", type: "CLASS 2", balance: 9916000, isDebit: true },
    { code: "2345000", name: "Fixture and Fittings(Fire extinguishers, White boards)", type: "CLASS 2", balance: 17418647, isDebit: true },
    { code: "2358000", name: "Air Conditioner", type: "CLASS 2", balance: 262500, isDebit: true },
    { code: "2391000", name: "New Complex Building in Progress", type: "CLASS 2", balance: 136315925, isDebit: true },
    { code: "2410000", name: "Office Furniture(Tables, shelves, chairs, & cupboards)", type: "CLASS 2", balance: 47399679, isDebit: true },
    { code: "2411000", name: "Equipment (Cameras, telephones,)", type: "CLASS 2", balance: 15024780, isDebit: true },
    { code: "2412000", name: "Computer Equipment( Printers, computers and classroom projectors)", type: "CLASS 2", balance: 2043800, isDebit: true },
    { code: "2412100", name: "Robes", type: "CLASS 2", balance: 8809115, isDebit: true },
    { code: "2412200", name: "Generators", type: "CLASS 2", balance: 2295000, isDebit: true },
    { code: "2451000", name: "Transport Equipment( Service Vehicle)", type: "CLASS 2", balance: 4366146, isDebit: true },
    { code: "2788000", name: "Other Financial Fixed Asset", type: "CLASS 2", balance: 12050000, isDebit: true },
    { code: "4710000", name: "Amount Owed by Students", type: "CLASS 4", balance: 98899703, isDebit: true },
    { code: "4710110", name: "DIPE Due", type: "CLASS 4", balance: 1966554, isDebit: false },
    { code: "4710130", name: "CNPS Due", type: "CLASS 4", balance: 3578121, isDebit: false },
    { code: "4711240", name: "VAT Credit", type: "CLASS 4", balance: 288750, isDebit: true },
    { code: "4711300", name: "Chia Richard", type: "CLASS 4", balance: 667589, isDebit: true },
    { code: "4711400", name: "Eyumojock Project", type: "CLASS 4", balance: 2000000, isDebit: true },
    { code: "4711500", name: "Mungossi Leonard", type: "CLASS 4", balance: 315885, isDebit: true },
    { code: "4712100", name: "Accrued CAMTEL BILLS", type: "CLASS 4", balance: 612459, isDebit: false },
    { code: "4712111", name: "Other Creditors", type: "CLASS 4", balance: 16568914, isDebit: false },
    { code: "4712200", name: "Accrued ELECTRICITY BILLS", type: "CLASS 4", balance: -71278, isDebit: false },
    { code: "4712211", name: "Accrued Salary", type: "CLASS 4", balance: 1260474, isDebit: false },
    { code: "4712300", name: "Accrued SECURITY FEES", type: "CLASS 4", balance: 1602500, isDebit: false },
    { code: "4712400", name: "Accrued Audit Fees", type: "CLASS 4", balance: 3250000, isDebit: false },
    { code: "4712500", name: "Solidarity Account", type: "CLASS 4", balance: 2685099, isDebit: false },
    { code: "5211100", name: "Ecobank Buea", type: "CLASS 5", balance: 5185178, isDebit: true },
    { code: "5211200", name: "SGC Buea", type: "CLASS 5", balance: 40823040, isDebit: true },
    { code: "5211300", name: "P & T CREDIT UNION", type: "CLASS 5", balance: 29410849, isDebit: true },
    { code: "5211310", name: "Salary Account", type: "CLASS 5", balance: 2635626, isDebit: false }
];

// Account Pool for setup dropdowns
window.accountsPool = [
    { code: "1010000", name: "Share Capital, Calledup and Paid", typeGroup: "CLASS 1", typeDetail: "Capital (Investment)", isDebit: false },
    { code: "106000", name: "Revaluation Surplus", typeGroup: "CLASS 1", typeDetail: "Capital (Investment)", isDebit: false },
    { code: "1210000", name: "Retained Earnings", typeGroup: "CLASS 1", typeDetail: "Capital (Investment)", isDebit: false },
    { code: "1301000", name: "Net Profit/Loss for the Period", typeGroup: "CLASS 1", typeDetail: "Capital (Investment)", isDebit: false },
    { code: "1621000", name: "Long-Term loan SGC 606605", typeGroup: "CLASS 1", typeDetail: "Capital (Investment)", isDebit: false },
    { code: "2110000", name: "Research and Development", typeGroup: "CLASS 2", typeDetail: "Fixed Asset / Capital Assets", isDebit: true },
    { code: "2130000", name: "Management and Accounting Software", typeGroup: "CLASS 2", typeDetail: "Fixed Asset / Capital Assets", isDebit: true },
    { code: "2131000", name: "Computer Server", typeGroup: "CLASS 2", typeDetail: "Fixed Asset / Capital Assets", isDebit: true },
    { code: "228", name: "Land", typeGroup: "CLASS 2", typeDetail: "Fixed Asset / Capital Assets", isDebit: true },
    { code: "2310000", name: "Buildings", typeGroup: "CLASS 2", typeDetail: "Fixed Asset / Capital Assets", isDebit: true },
    { code: "4710000", name: "Amount Owed by Students", typeGroup: "CLASS 4", typeDetail: "Third Parties Accounts (A/R)", isDebit: true },
    { code: "4710110", name: "DIPE Due", typeGroup: "CLASS 4", typeDetail: "Third Parties Accounts (A/P)", isDebit: false },
    { code: "4710130", name: "CNPS Due", typeGroup: "CLASS 4", typeDetail: "Third Parties Accounts (A/P)", isDebit: false },
    { code: "5211100", name: "Ecobank Buea", typeGroup: "CLASS 5", typeDetail: "Financial Accounts (Bank)", isDebit: true },
    { code: "5211200", name: "SGC Buea", typeGroup: "CLASS 5", typeDetail: "Financial Accounts (Bank)", isDebit: true },
    { code: "5211300", name: "P & T CREDIT UNION", typeGroup: "CLASS 5", typeDetail: "Financial Accounts (Bank)", isDebit: true },
    { code: "5211310", name: "Salary Account", typeGroup: "CLASS 5", typeDetail: "Financial Accounts (Cash/Bank)", isDebit: false }
];

window.initFinanceOpenBalances = function() {
    console.log("initFinanceOpenBalances: Initializing...");
    
    // Set subtitle dynamically based on default Balances as at and an ending date
    updateOpenBalancesSubtitle();
    
    // Render Table
    renderOpenBalancesTable();
    setupOpenBalancesRowSelection();
    
    // Setup Modal Drag
    if (typeof makeElementDraggable === 'function') {
        const modal = document.querySelector('#MODAL_SetupOpenBalances .coa-modal');
        const header = document.getElementById('SOB_Header');
        if (modal && header) makeElementDraggable(modal, header);
    }
    
    // Event listeners
    const balancesAsAtInput = document.getElementById('FOB_BalancesAsAt');
    if (balancesAsAtInput) {
        balancesAsAtInput.onchange = function() {
            updateOpenBalancesSubtitle();
        };
    }
    
    const batchChangeBtn = document.getElementById('BTN_BatchDateChange');
    if (batchChangeBtn) {
        batchChangeBtn.onclick = function() {
            handleBatchDateChange();
        };
    }
    
    const setupBtn = document.getElementById('BTN_SetupAccountBalances');
    if (setupBtn) {
        setupBtn.onclick = function() {
            OpenBalancesModalManager.openNew();
        };
    }
    
    const saveBtn = document.getElementById('BTN_SaveOpenBalance');
    if (saveBtn) {
        saveBtn.onclick = function() {
            OpenBalancesModalManager.handleSave();
        };
    }
    
    // Modal Select Group Handlers
    const typeGroupSelect = document.getElementById('SOB_AccountTypeGroup');
    if (typeGroupSelect) {
        typeGroupSelect.onchange = function() {
            populateModalAccountsList(this.value);
        };
    }
    
    const accountSelect = document.getElementById('SOB_AccountSelect');
    if (accountSelect) {
        accountSelect.onchange = function() {
            handleModalAccountChange(this.value);
        };
    }
    
    console.log("initFinanceOpenBalances: Done.");
};

function formatOpenBalancesCurrency(val) {
    if (val === undefined || val === null || isNaN(val)) return "";
    const isNegative = val < 0;
    const absVal = Math.abs(val);
    const formatted = absVal.toLocaleString('en-US'); // Using comma separation
    return isNegative ? `(${formatted})` : formatted;
}

function parseOpenBalancesCurrency(str) {
    if (!str) return 0;
    let clean = str.replace(/[^\d.-]/g, '');
    let val = parseFloat(clean);
    return isNaN(val) ? 0 : val;
}

function formatOpenBalancesDateLong(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    const day = date.getDate();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

function updateOpenBalancesSubtitle() {
    const asAt = document.getElementById('FOB_BalancesAsAt');
    const subtitle = document.getElementById('FOB_Subtitle');
    if (!asAt || !subtitle) return;
    
    const formattedAsAt = formatOpenBalancesDateLong(asAt.value);
    // Hardcoded end date as seen in system's image (3 June 2026)
    subtitle.textContent = `${formattedAsAt} To 3 June 2026.`;
}

function renderOpenBalancesTable() {
    const tbody = document.getElementById('TB_OpenBalances');
    if (!tbody) return;
    
    tbody.innerHTML = window.openingBalances.map(item => {
        const drValue = item.isDebit ? formatOpenBalancesCurrency(item.balance) : "";
        const crValue = !item.isDebit ? formatOpenBalancesCurrency(item.balance) : "";
        
        return `
            <tr data-code="${item.code}">
                <td style="width: 150px; font-family: monospace;">${item.code}</td>
                <td>${item.name}</td>
                <td style="width: 200px; text-align: right;" class="amount">${drValue}</td>
                <td style="width: 200px; text-align: right;" class="amount">${crValue}</td>
            </tr>
        `;
    }).join('');
    
    // Pad empty rows
    for (let i = window.openingBalances.length; i < 15; i++) {
        tbody.insertAdjacentHTML('beforeend', '<tr><td>&nbsp;</td><td></td><td></td><td></td></tr>');
    }
}

function setupOpenBalancesRowSelection() {
    const tbody = document.getElementById('TB_OpenBalances');
    if (!tbody) return;
    
    tbody.onclick = function(e) {
        const tr = e.target.closest('tr');
        if (!tr || tr.cells[0].textContent.trim() === "") return;
        
        tbody.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
        tr.classList.add('selected');
        OpenBalancesModalManager.selectedCode = tr.dataset.code;
    };
}

function handleBatchDateChange() {
    const newDateInput = document.getElementById('FOB_NewDate');
    if (!newDateInput || !newDateInput.value) {
        return showAlert("Please select a valid New Date first.", "error");
    }
    
    if (typeof showConfirmModal === 'function') {
        showConfirmModal({
            title: "Opening Account Balances *",
            message: "Are you sure you wish to batch modify all opening balance dates?",
            okText: "Yes",
            cancelText: "No",
            onOk: () => {
                const balancesAsAt = document.getElementById('FOB_BalancesAsAt');
                if (balancesAsAt) {
                    balancesAsAt.value = newDateInput.value;
                    updateOpenBalancesSubtitle();
                }
                showAlert("Opening balance dates batch modified successfully.", "success");
            }
        });
    } else {
        const conf = confirm("Are you sure you wish to batch modify all opening balance dates?");
        if (conf) {
            const balancesAsAt = document.getElementById('FOB_BalancesAsAt');
            if (balancesAsAt) {
                balancesAsAt.value = newDateInput.value;
                updateOpenBalancesSubtitle();
            }
            alert("Opening balance dates batch modified successfully.");
        }
    }
}

window.OpenBalancesModalManager = {
    selectedCode: null,
    
    openNew() {
        document.getElementById('SOB_Form').reset();
        
        // Pre-fill date from toolbar "Balances as at"
        const defaultDate = document.getElementById('FOB_BalancesAsAt').value;
        document.getElementById('SOB_Date').value = defaultDate;
        
        // Pre-fill Academic Start date (one day after defaults as seen on image, or fixed 10/1/2024)
        document.getElementById('SOB_AcadStartDate').textContent = "10/1/2024";
        
        // Populate accounts based on default CLASS 1
        populateModalAccountsList("CLASS 1");
        
        document.getElementById('MODAL_SetupOpenBalances').style.display = 'flex';
    },
    
    closeModal() {
        document.getElementById('MODAL_SetupOpenBalances').style.display = 'none';
    },
    
    handleSave() {
        const codeSelect = document.getElementById('SOB_AccountSelect');
        const amountStr = document.getElementById('SOB_Amount').value.trim();
        const dateVal = document.getElementById('SOB_Date').value;
        
        if (!codeSelect.value) {
            return showAlert("Please select a valid account.", "error");
        }
        
        if (!amountStr) {
            return showAlert("Please enter an opening balance amount.", "error");
        }
        
        const balanceVal = parseOpenBalancesCurrency(amountStr);
        const accPoolItem = window.accountsPool.find(x => x.code === codeSelect.value);
        if (!accPoolItem) return;
        
        // Check if already in opening balances
        const existingIdx = window.openingBalances.findIndex(x => x.code === accPoolItem.code);
        if (existingIdx !== -1) {
            window.openingBalances[existingIdx].balance = balanceVal;
            window.openingBalances[existingIdx].isDebit = accPoolItem.isDebit;
        } else {
            window.openingBalances.push({
                code: accPoolItem.code,
                name: accPoolItem.name,
                type: accPoolItem.typeGroup,
                balance: balanceVal,
                isDebit: accPoolItem.isDebit
            });
        }
        
        showAlert("Account opening balance saved successfully.", "success");
        this.closeModal();
        renderOpenBalancesTable();
    }
};

function populateModalAccountsList(groupValue) {
    const select = document.getElementById('SOB_AccountSelect');
    if (!select) return;
    
    select.innerHTML = '';
    
    const filtered = window.accountsPool.filter(x => x.typeGroup === groupValue);
    filtered.forEach(acc => {
        const opt = document.createElement('option');
        opt.value = acc.code;
        opt.textContent = `${acc.code}-${acc.name}`;
        select.appendChild(opt);
    });
    
    if (filtered.length > 0) {
        handleModalAccountChange(filtered[0].code);
    } else {
        document.getElementById('SOB_AccountTypeDetail').value = '';
        document.getElementById('SOB_Description').value = '';
        document.getElementById('SOB_Amount').value = '';
    }
}

function handleModalAccountChange(codeValue) {
    const acc = window.accountsPool.find(x => x.code === codeValue);
    if (!acc) return;
    
    document.getElementById('SOB_AccountTypeDetail').value = acc.typeDetail;
    document.getElementById('SOB_Description').value = `Opening balance of ${acc.name}`;
    
    // Check if there is an existing balance for this account
    const existing = window.openingBalances.find(x => x.code === codeValue);
    if (existing) {
        // Format it nicely
        document.getElementById('SOB_Amount').value = existing.balance.toLocaleString('en-US');
    } else {
        document.getElementById('SOB_Amount').value = '0';
    }
}
