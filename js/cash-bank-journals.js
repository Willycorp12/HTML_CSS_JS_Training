// js/cash-bank-journals.js

/**
 * Shared state for Journals
 */
const JournalState = {
    cash: { items: [], filtered: [], accountId: null, balanceBF: 0 },
    bank: { items: [], filtered: [], accountId: null, balanceBF: 0 }
};

/**
 * Initialize Cash Journal Screen
 */
window.initCashJournal = function() {
    console.log("initCashJournal: Initializing...");
    setupJournal('cash', 'CJ_TableBody', 'cashAccount');
};

/**
 * Initialize Bank Journal Screen
 */
window.initBankJournal = function() {
    console.log("initBankJournal: Initializing...");
    setupJournal('bank', 'BJ_TableBody', 'bankAccount');
};

/**
 * Generic setup for both journals
 */
async function setupJournal(type, tbodyId, selectId) {
    const tbody = document.getElementById(tbodyId);
    const searchInput = document.getElementById('EDT_GlobalSearch');
    const accountSelect = document.getElementById(selectId);
    const printBtn = document.querySelector(`.${type}-journal-screen .cj-footer .wd-btn`);

    if (!tbody || !accountSelect) return;

    // 1. Setup Search
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterAndRenderJournal(type, e.target.value, tbodyId);
        });
    }

    // 2. Setup Print Button
    if (printBtn) {
        printBtn.onclick = () => printJournalReport(type);
    }

    // 3. Fetch Initial Data
    // In a real app, you'd fetch based on accountSelect.value
    await fetchJournalData(type, accountSelect.value, tbodyId);

    // 4. Handle Account Change
    accountSelect.onchange = (e) => fetchJournalData(type, e.target.value, tbodyId);
}

/**
 * Fetch data from API
 */
async function fetchJournalData(type, accountId, tbodyId) {
    try {
        // Placeholder endpoint - replace with actual API path
        // const resp = await apiFetch(`/api/v1/finance/getJournal?type=${type}&accountId=${accountId}`);
        
        let mockData = [];
        let balanceBF = 0;

        if (type === 'cash') {
            balanceBF = 43207; // Sample value for cash
            mockData = [
                { date: '2026-03-26', time: '06:57 PM', ref: 'Ref: 26/3/2026/3', description: 'All Main Cash in hand (CASH_SALES) Transactions from', inflow: 61500, outflow: 0, balance: balanceBF + 61500 },
                { date: '2026-03-27', time: '10:15 AM', ref: 'PMT/104', description: 'Office Stationery Purchase', inflow: 0, outflow: 5000, balance: balanceBF + 61500 - 5000 },
                { date: '2026-03-28', time: '09:00 AM', ref: 'UTL/001', description: 'Electricity Bill Payment', inflow: 0, outflow: 2500, balance: balanceBF + 61500 - 5000 - 2500 },
                { date: '2026-03-29', time: '02:30 PM', ref: 'INV/005', description: 'Customer Payment for Services', inflow: 15000, outflow: 0, balance: balanceBF + 61500 - 5000 - 2500 + 15000 },
                { date: '2026-03-30', time: '04:00 PM', ref: 'DEP/001', description: 'Cash Deposit to Bank', inflow: 0, outflow: 20000, balance: balanceBF + 61500 - 5000 - 2500 + 15000 - 20000 }
            ];
        } else if (type === 'bank') {
            balanceBF = 1000000; // Sample value for bank
            mockData = [
                { date: '2026-03-26', time: '09:30 AM', ref: 'DEP/CUST/001', description: 'Customer Deposit - Invoice #123', inflow: 150000, outflow: 0, balance: balanceBF + 150000 },
                { date: '2026-03-27', time: '11:00 AM', ref: 'PMT/SUP/005', description: 'Payment to Supplier - ABC Ltd.', inflow: 0, outflow: 75000, balance: balanceBF + 150000 - 75000 },
                { date: '2026-03-28', time: '03:45 PM', ref: 'CHG/BANK/001', description: 'Monthly Bank Charges', inflow: 0, outflow: 1500, balance: balanceBF + 150000 - 75000 - 1500 },
                { date: '2026-03-29', time: '01:00 PM', ref: 'LOAN/DISB/002', description: 'Loan Disbursement Received', inflow: 500000, outflow: 0, balance: balanceBF + 150000 - 75000 - 1500 + 500000 },
                { date: '2026-03-30', time: '08:00 AM', ref: 'WDL/ATM/003', description: 'ATM Withdrawal', inflow: 0, outflow: 10000, balance: balanceBF + 150000 - 75000 - 1500 + 500000 - 10000 }
            ];
        }

        JournalState[type].items = mockData; 
        JournalState[type].balanceBF = balanceBF; // Set the sample balance B/F
        
        filterAndRenderJournal(type, '', tbodyId);

    } catch (e) {
        console.error(`Failed to fetch ${type} journal data`, e);
    }
}

/**
 * Filter and Render
 */
function filterAndRenderJournal(type, query, tbodyId) {
    const q = query.toLowerCase().trim();
    const state = JournalState[type];
    
    state.filtered = state.items.filter(it => 
        it.description.toLowerCase().includes(q) || 
        it.ref.toLowerCase().includes(q)
    );

    renderJournalTable(type, tbodyId);
}

/**
 * DOM Rendering
 */
function renderJournalTable(type, tbodyId) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    const state = JournalState[type];
    tbody.innerHTML = '';

    let totalIn = 0;
    let totalOut = 0;
    let currentBalance = state.balanceBF;

    state.filtered.forEach(it => {
        const tr = document.createElement('tr');
        const inflow = Number(it.inflow || it.deposits || 0);
        const outflow = Number(it.outflow || it.withdrawals || 0);
        
        totalIn += inflow;
        totalOut += outflow;
        currentBalance = it.balance; // Assuming the balance provided in data is cumulative

        tr.innerHTML = `
            <td>${it.date}</td>
            <td>${it.time}</td>
            <td>${it.ref}</td>
            <td>${it.description}</td>
            <td class="amount">${inflow.toLocaleString()}</td>
            <td class="amount">${outflow.toLocaleString()}</td>
            <td class="amount">${it.balance.toLocaleString()}</td>
        `;
        tbody.appendChild(tr);
    });

    // Update UI Totals
    const footer = tbody.closest('table').querySelector('tfoot');
    if (footer) {
        const cells = footer.querySelectorAll('.amount');
        if (cells.length >= 3) {
            cells[0].textContent = totalIn.toLocaleString();
            cells[1].textContent = totalOut.toLocaleString();
            cells[2].textContent = currentBalance.toLocaleString();
        }
    }

    // Update Screen Balances
    const bfDisplay = document.querySelector(`.${type}-journal-screen .cj-balance-bf .amount-display`);
    const currDisplay = document.querySelector(`.${type}-journal-screen .cj-current-balance .amount-display`);
    
    if (bfDisplay) bfDisplay.textContent = state.balanceBF.toLocaleString() + " FCFA";
    if (currDisplay) currDisplay.textContent = currentBalance.toLocaleString() + " FCFA";
}

/**
 * Printing Logic
 */
function printJournalReport(type) {
    const state = JournalState[type];
    const company = window.companyDetails || {};
    const title = type === 'cash' ? 'MAIN CASH IN HAND JOURNAL FOR THE PERIOD' : 'BANK JOURNAL FOR THE PERIOD';
    const dateRange = "1 January 2026 To 31 December 2026"; // Hardcoded as per PDF example
    
    let totalIn = 0;
    let totalOut = 0;
    let lastBalance = state.balanceBF;

    const rows = state.filtered.map(it => {
        const inflow = Number(it.inflow || it.deposits || 0);
        const outflow = Number(it.outflow || it.withdrawals || 0);
        totalIn += inflow;
        totalOut += outflow;
        lastBalance = it.balance;

        return `
            <tr>
                <td>${it.date}</td>
                <td>${it.time}</td>
                <td>${it.ref}</td>
                <td>${it.description}</td>
                <td style="text-align:right;">${inflow > 0 ? inflow.toLocaleString() : ''}</td>
                <td style="text-align:right;">${outflow > 0 ? outflow.toLocaleString() : ''}</td>
                <td style="text-align:right;">${it.balance.toLocaleString()}</td>
            </tr>
        `;
    }).join('');

    const amountInWords = typeof numberToWords === 'function' ? numberToWords(lastBalance).toUpperCase() + " FCFA" : "";

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>${title}</title>
        <style>
            @page { size: A4 portrait; margin: 0; }
            body { font-family: "Segoe UI", Tahoma, Arial, sans-serif; font-size: 11px; color: #333; margin: 0; padding: 0; background: #525659; }
            .page { 
                background: white; 
                width: 21cm; 
                min-height: 29.7cm; 
                box-sizing: border-box; 
                padding: 1cm 1.5cm; 
                margin: 10px auto; 
                display: flex; 
                flex-direction: column; 
                box-shadow: 0 0 10px rgba(0,0,0,0.5);
            }

            .doc-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
            .header-center { flex: 1; text-align: center; }
            .header-center h3 { margin: 5px 0; font-size: 18px; color: #2e3192; font-weight: bold; text-transform: uppercase; }
            .red-line { border-top: 2px solid #cd2027; width: 80%; margin: 5px auto; }
            .sub-date { color: #cd2027; font-weight: bold; font-size: 14px; }
            .header-right { text-align: right; font-size: 11px; color: #333; }
            .header-meta { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; font-weight: bold; }
            .balance-bf-box { border: 1px solid #2e3192; padding: 5px 15px; font-size: 16px; color: #2e3192; }

            table.data-table { width: 100%; border-collapse: collapse; margin-top: 5px; }
            table.data-table th { background: #f0f0f0; border: 1px solid #333; padding: 6px; text-transform: uppercase; }
            table.data-table td { border: 1px solid #333; padding: 5px; }
            
            .summary-section { margin-top: 20px; display: flex; justify-content: space-between; }
            .words-box { flex: 1; font-weight: bold; padding-right: 20px; text-transform: uppercase; }
            .totals-box { width: 250px; }
            .summary-row { display: flex; justify-content: space-between; padding: 3px 0; font-size: 13px; font-weight: bold; }
            .final-balance { border-top: 1px solid #333; border-bottom: 3px double #333; margin-top: 5px; padding: 5px 0; font-size: 15px; }

            .doc-footer { margin-top: auto; display: flex; justify-content: space-between; font-size: 10px; border-top: 1px solid #ccc; padding: 8px 0; }
            @media print { body { background: none; } .page { margin: 0; box-shadow: none; page-break-after: always; } }
        </style>
    </head>
    <body>
        <div class="page">
            <div class="doc-header">
                <div style="width: 100px;"></div>
                <div class="header-center">
                    <h3>${title}</h3>
                    <div class="red-line"></div>
                    <div class="sub-date">${dateRange}</div>
                </div>
                <div class="header-right">
                    <div>${new Date().toLocaleDateString('en-GB')}</div>
                    <div>${new Date().toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'})}</div>
                </div>
            </div>

            <div class="header-meta">
                <div>Generated by: Admin</div>
                <div style="display:flex; align-items:center; gap:10px;">
                    <span>Balance B/F:</span>
                    <div class="balance-bf-box">${state.balanceBF.toLocaleString()} FCFA</div>
                </div>
            </div>

            <table class="data-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Ref</th>
                        <th>Description</th>
                        <th>${type === 'cash' ? 'Cash In.flow' : 'Deposits'}</th>
                        <th>${type === 'cash' ? 'Cash Out.flow' : 'Withdrawals'}</th>
                        <th>Balance</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>

            <div class="summary-section">
                <div class="words-box">
                    NET PAYABLE IN WORDS:<br>
                    <span style="color: #2e3192;">${amountInWords}</span>
                </div>
                <div class="totals-box">
                    <div class="summary-row">
                        <span>Total Money-In:</span>
                        <span>${totalIn.toLocaleString()} FCFA</span>
                    </div>
                    <div class="summary-row">
                        <span>Total Money-Out:</span>
                        <span>${totalOut.toLocaleString()} FCFA</span>
                    </div>
                    <div class="summary-row final-balance">
                        <span>Account Balance:</span>
                        <span>${lastBalance.toLocaleString()} FCFA</span>
                    </div>
                </div>
            </div>

            <div class="doc-footer">
                <span>Copyright(c)2022. Institute ERP PRO</span>
                <span>1/1</span>
                <span>Powered by AfricRenov Group Sarl</span>
            </div>
        </div>
        <script>
            window.onload = function() { window.print(); window.close(); }
        </script>
    </body>
    </html>
    `;

    const printWin = window.open('', '_blank');
    printWin.document.write(html);
    printWin.document.close();
}
