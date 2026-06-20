// js/report-capital-ledger.js

// Mock data for a specific capital expenditure item's ledger
const capitalLedgerEntries = [
    { date: '12/31/2025', user: '', time: '', ref: '', desc: 'Opening Balance', dr: 0, cr: 0, balance: 0 },
    // Add more mock data here if needed for demonstration
    // { date: '01/15/2026', user: 'Admin', time: '10:30', ref: 'INV001', desc: 'Purchase of cables', dr: 500000, cr: 0, balance: 500000 },
    // { date: '02/01/2026', user: 'Admin', time: '14:00', ref: 'PAY005', desc: 'Payment to installer', dr: 1000000, cr: 0, balance: 1500000 },
    // { date: '03/10/2026', user: 'Admin', time: '09:15', ref: 'ADJ002', desc: 'Adjustment for material cost', dr: 0, cr: 50000, balance: 1450000 },
    // { date: '03/20/2026', user: 'Admin', time: '11:00', ref: 'INV002', desc: 'Additional wiring', dr: 200000, cr: 0, balance: 1650000 },
    // { date: '04/01/2026', user: 'Admin', time: '16:00', ref: 'PAY010', desc: 'Final payment for installation', dr: 850000, cr: 0, balance: 2500000 },
    // { date: '04/05/2026', user: 'Admin', time: '10:00', ref: 'DEP001', desc: 'Depreciation for Q1', dr: 0, cr: 25000, balance: 2475000 },
    // { date: '04/10/2026', user: 'Admin', time: '11:00', ref: 'INV003', desc: 'New TV cable purchase', dr: 1000000, cr: 0, balance: 3475000 },
    // { date: '04/15/2026', user: 'Admin', time: '15:00', ref: 'PAY012', desc: 'Payment for new cable', dr: 1000000, cr: 0, balance: 4475000 },
    // { date: '05/01/2026', user: 'Admin', time: '09:00', ref: 'DEP002', desc: 'Depreciation for Q2', dr: 0, cr: 25000, balance: 4450000 },
    // { date: '05/10/2026', user: 'Admin', time: '13:00', ref: 'INV004', desc: 'Maintenance parts', dr: 150000, cr: 0, balance: 4600000 },
    // { date: '05/15/2026', user: 'Admin', time: '10:00', ref: 'PAY015', desc: 'Payment for maintenance', dr: 150000, cr: 0, balance: 4750000 },
    // { date: '06/01/2026', user: 'Admin', time: '11:00', ref: 'DEP003', desc: 'Depreciation for Q3', dr: 0, cr: 25000, balance: 4725000 },
    // { date: '06/10/2026', user: 'Admin', time: '14:00', ref: 'INV005', desc: 'Upgrade components', dr: 500000, cr: 0, balance: 5225000 },
    // { date: '06/15/2026', user: 'Admin', time: '16:00', ref: 'PAY018', desc: 'Payment for upgrade', dr: 500000, cr: 0, balance: 5725000 },
    // { date: '07/01/2026', user: 'Admin', time: '09:30', ref: 'DEP004', desc: 'Depreciation for Q4', dr: 0, cr: 25000, balance: 5700000 },
    // { date: '07/10/2026', user: 'Admin', time: '10:00', ref: 'INV006', desc: 'Additional network points', dr: 300000, cr: 0, balance: 6000000 },
    // { date: '07/15/2026', user: 'Admin', time: '12:00', ref: 'PAY020', desc: 'Payment for network points', dr: 300000, cr: 0, balance: 6300000 },
    // { date: '08/01/2026', user: 'Admin', time: '14:00', ref: 'DEP005', desc: 'Depreciation for Q5', dr: 0, cr: 25000, balance: 6275000 },
    // { date: '08/10/2026', user: 'Admin', time: '15:00', ref: 'INV007', desc: 'Software license renewal', dr: 100000, cr: 0, balance: 6375000 },
    // { date: '08/15/2026', user: 'Admin', time: '16:00', ref: 'PAY022', desc: 'Payment for license', dr: 100000, cr: 0, balance: 6475000 },
    // { date: '09/01/2026', user: 'Admin', time: '10:00', ref: 'DEP006', desc: 'Depreciation for Q6', dr: 0, cr: 25000, balance: 6450000 },
    // { date: '09/10/2026', user: 'Admin', time: '11:00', ref: 'INV008', desc: 'Minor repairs', dr: 50000, cr: 0, balance: 6500000 },
    // { date: '09/15/2026', user: 'Admin', time: '13:00', ref: 'PAY025', desc: 'Payment for repairs', dr: 50000, cr: 0, balance: 6550000 },
    // { date: '10/01/2026', user: 'Admin', time: '14:00', ref: 'DEP007', desc: 'Depreciation for Q7', dr: 0, cr: 25000, balance: 6525000 },
    // { date: '10/10/2026', user: 'Admin', time: '15:00', ref: 'INV009', desc: 'System upgrade', dr: 700000, cr: 0, balance: 7225000 },
    // { date: '10/15/2026', user: 'Admin', time: '16:00', ref: 'PAY028', desc: 'Payment for upgrade', dr: 700000, cr: 0, balance: 7925000 },
    // { date: '11/01/2026', user: 'Admin', time: '10:00', ref: 'DEP008', desc: 'Depreciation for Q8', dr: 0, cr: 25000, balance: 7900000 },
    // { date: '11/10/2026', user: 'Admin', time: '11:00', ref: 'INV010', desc: 'Network expansion', dr: 400000, cr: 0, balance: 8300000 },
    // { date: '11/15/2026', user: 'Admin', time: '13:00', ref: 'PAY030', desc: 'Payment for expansion', dr: 400000, cr: 0, balance: 8700000 },
    // { date: '12/01/2026', user: 'Admin', time: '14:00', ref: 'DEP009', desc: 'Depreciation for Q9', dr: 0, cr: 25000, balance: 8675000 },
    // { date: '12/10/2026', user: 'Admin', time: '15:00', ref: 'INV011', desc: 'Year-end audit fees', dr: 100000, cr: 0, balance: 8775000 },
    // { date: '12/15/2026', user: 'Admin', time: '16:00', ref: 'PAY033', desc: 'Payment for audit', dr: 100000, cr: 0, balance: 8875000 },
    // { date: '12/31/2026', user: 'Admin', time: '23:59', ref: 'CLO001', desc: 'Closing Balance', dr: 0, cr: 0, balance: 8875000 }
];

let currentCapitalLedgerItemName = '';
let currentCapitalLedgerItemCode = '';

function initReportCapitalLedger() {
    // Retrieve item details from session storage
    currentCapitalLedgerItemCode = sessionStorage.getItem('capitalLedgerItemCode') || 'N/A';
    currentCapitalLedgerItemName = sessionStorage.getItem('capitalLedgerItemName') || 'Selected Item';

    // Update titles
    document.getElementById('CL_MainTitle').textContent = `${currentCapitalLedgerItemName} Ledger`;
    document.getElementById('CL_Subtitle').textContent = `1 January 2026 To 31 December 2026.`; // Default dates

    syncClDates();
    renderCapitalLedgerTable();
    startClClock();

    // Attach event listeners
    document.getElementById('CL_Search').addEventListener('input', function() {
        filterCapitalLedgerTable(this.value);
    });
    document.getElementById('CL_DateFrom').addEventListener('change', syncClDates);
    document.getElementById('CL_DateTo').addEventListener('change', syncClDates);
}

function startClClock() {
    const update = () => {
        const now = new Date();
        const d = document.getElementById('CL_CurrentDate');
        const t = document.getElementById('CL_CurrentTime');
        if (d) d.textContent = now.toLocaleDateString('en-GB');
        if (t) t.textContent = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    };
    update();
    window.clClockInterval = setInterval(update, 1000);
}

function syncClDates() {
    const from = document.getElementById('CL_DateFrom').value;
    const to = document.getElementById('CL_DateTo').value;
    const sub = document.getElementById('CL_Subtitle');
    if (sub) sub.textContent = `${formatDateLong(from)} To ${formatDateLong(to)}.`;
}

function renderCapitalLedgerTable() {
    const tbody = document.getElementById('CL_Tbody');
    const totalDrEl = document.getElementById('CL_TotalDr');
    const totalCrEl = document.getElementById('CL_TotalCr');
    const finalBalanceEl = document.getElementById('CL_FinalBalance');
    const accountBalanceEl = document.getElementById('CL_AccountBalance');

    if (!tbody || !totalDrEl || !totalCrEl || !finalBalanceEl || !accountBalanceEl) return;

    let html = '';
    let currentBalance = 0;
    let totalDr = 0;
    let totalCr = 0;

    const fmtNum = (n) => n === 0 ? '' : n.toLocaleString('en-US');

    capitalLedgerEntries.forEach(entry => {
        currentBalance += entry.dr - entry.cr;
        totalDr += entry.dr;
        totalCr += entry.cr;

        html += `<tr>
            <td>${entry.date}</td>
            <td>${entry.user}</td>
            <td>${entry.time}</td>
            <td>${entry.desc}</td>
            <td>${entry.ref}</td>
            <td class="text-right">${fmtNum(entry.dr)}</td>
            <td class="text-right">${fmtNum(entry.cr)}</td>
            <td class="text-right">${fmtNum(currentBalance)}</td>
        </tr>`;
    });

    tbody.innerHTML = html;
    totalDrEl.textContent = fmtNum(totalDr);
    totalCrEl.textContent = fmtNum(totalCr);
    finalBalanceEl.textContent = fmtNum(currentBalance);
    accountBalanceEl.textContent = `${fmtNum(currentBalance)} FCFA`;
}

function filterCapitalLedgerTable(val) {
    const filter = val.toLowerCase();
    const rows = document.querySelectorAll('#CL_Tbody tr');
    rows.forEach(row => {
        const descriptionText = row.cells[3].textContent.toLowerCase(); // Description column
        row.style.display = descriptionText.includes(filter) ? '' : 'none';
    });
}

function goBackToBudgetDetails() {
    loadScreen('report-budget-details.html', null, 'Budget Details Report');
}

function printCapitalLedger() {
    const from = document.getElementById('CL_DateFrom').value;
    const to = document.getElementById('CL_DateTo').value;
    const fmtNum = (n) => n === 0 ? '' : n.toLocaleString('en-US');

    let currentBalance = 0;
    let totalDr = 0;
    let totalCr = 0;

    capitalLedgerEntries.forEach(entry => {
        currentBalance += entry.dr - entry.cr;
        totalDr += entry.dr;
        totalCr += entry.cr;
    });

    const ROWS_PER_PAGE = 25; // Estimate rows per page for A4 portrait
    const totalPages = Math.ceil(capitalLedgerEntries.length / ROWS_PER_PAGE);
    let allPagesHTML = '';

    for (let i = 0; i < totalPages; i++) {
        const chunk = capitalLedgerEntries.slice(i * ROWS_PER_PAGE, (i + 1) * ROWS_PER_PAGE);
        const isLastPage = (i === totalPages - 1);

        let rowsHTML = chunk.map(entry => `
            <tr>
                <td style="text-align:center;">${entry.date || ''}</td>
                <td style="text-align:center;">${entry.time || '__:__'}</td>
                <td style="text-align:center;">${entry.ref || ''}</td>
                <td>${entry.desc}</td>
                <td style="text-align:right;">${fmtNum(entry.dr)}</td>
                <td style="text-align:right;">${fmtNum(entry.cr)}</td>
                <td style="text-align:right;">${fmtNum(entry.balance || 0)}</td>
            </tr>
        `).join('');

        if (isLastPage) {
            rowsHTML += `<tr style="font-weight:bold; background:#f0f0f0 !important; -webkit-print-color-adjust: exact;">
                <td colspan="4" style="text-align:left;">Sum</td>
                <td style="text-align:right;">${fmtNum(totalDr)}</td>
                <td style="text-align:right;">${fmtNum(totalCr)}</td>
                <td style="text-align:right;">${fmtNum(currentBalance)}</td>
            </tr>`;
        }

        allPagesHTML += `
            <div class="page">
                <div style="text-align: center; margin-bottom: 15px;">
                    <h2 style="color: #2e3192; font-size: 22px; margin: 0; text-transform: uppercase; font-family: Arial;">BIAKA HOSPITAL</h2>
                    <h3 style="color: #2e3192; font-size: 18px; margin: 5px 0;">${currentCapitalLedgerItemName} Ledger</h3>
                    <div style="border-top: 1px solid #cd2027; width: 80%; margin: 5px auto;"></div>
                    <div style="color: #cd2027; font-weight: bold; font-size: 13px; margin-top: 5px;">${formatDateLong(from)} To ${formatDateLong(to)}</div>
                </div>
                
                <table class="print-table">
                    <thead>
                        <tr>
                            <th style="width: 80px;">Date</th>
                            <th style="width: 60px;">Time</th>
                            <th style="width: 70px;">Ref</th>
                            <th>Description</th>
                            <th style="width: 90px; text-align:right;">Dr.Amount</th>
                            <th style="width: 90px; text-align:right;">Cr.Amount</th>
                            <th style="width: 90px; text-align:right;">Balance</th>
                        </tr>
                    </thead>
                    <tbody>${rowsHTML}</tbody>
                </table>
                <div class="doc-footer">
                    <span>"Copyright(c)2022. Institute ERP PRO"</span>
                    <span>Page ${i + 1} of ${totalPages}</span>
                    <span>Powered by AfricRenov Group Sarl</span>
                </div>
            </div>`;
    }

    const win = window.open('', '_blank');
    win.document.write(`
        <html>
        <head>
            <title>${currentCapitalLedgerItemName} Ledger</title>
            <style>
                @page { margin: 0; }
                body { margin: 0; padding: 0; font-family: "Segoe UI", Tahoma, sans-serif; background: #fff; }
                .page { 
                    background: white; width: 21cm; min-height: 29.7cm; 
                    box-sizing: border-box; padding: 1.5cm; margin: 0 auto; 
                    display: flex; flex-direction: column; position: relative; 
                }
                .print-table { width: 100%; border-collapse: collapse; font-size: 11px; table-layout: fixed; margin-top: 10px; }
                .print-table th, .print-table td { border: 1px solid #000; padding: 5px; word-wrap: break-word; }
                .print-table th { background: #f0f0f0 !important; -webkit-print-color-adjust: exact; font-size: 9px; }

                .doc-footer { 
                    margin-top: auto; padding-top: 10px; border-top: 1px solid #ccc;
                    display: flex; justify-content: space-between; font-size: 10px; 
                    font-style: italic;
                }
                @media print { 
                    body { background: none; }
                    .page { margin: 0; border: none; page-break-after: always; } 
                    .page:last-child { page-break-after: auto; }
                }
            </style>
        </head>
        <body>${allPagesHTML}<script>window.onload = function() { window.print(); window.close(); }</script></body>
        </html>
    `);
    win.document.close();
}

function formatDateLong(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

window.initReportCapitalLedger = initReportCapitalLedger;
window.syncClDates = syncClDates;
window.goBackToBudgetDetails = goBackToBudgetDetails;
window.printCapitalLedger = printCapitalLedger;