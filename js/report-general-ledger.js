// js/report-general-ledger.js

const glData = [
    { sn: 1, name: 'Artificial Intelligence Laboratory Machine (A.I)', desc: 'All Artificial Intelligence Laboratory Machine (A.I) (CREDIT_SALES) Transactions from POS', date: '3/20/2026', time: '16:11', ref: '(Ref: 23/3/2', dr: 0, cr: 60000, user: 'Afuge Rosemary', class: 'CLASS 7 - Revenue of Ordinary' },
    { sn: 2, name: 'Consultation', desc: 'CREDIT_SALES | SUNDRY DEBTORS | Consultation', date: '3/20/2026', time: '16:11', ref: '(Ref: 23/3/2', dr: 0, cr: 2500, user: 'Afuge Rosemary', class: 'CLASS 7 - Revenue of Ordinary' },
    { sn: 3, name: 'Laboratory', desc: 'All Laboratory (CREDIT_SALES) Transactions from POS', date: '3/20/2026', time: '16:11', ref: '(Ref: 23/3/2', dr: 0, cr: 21500, user: 'Afuge Rosemary', class: 'CLASS 7 - Revenue of Ordinary' },
    { sn: 4, name: 'Pharmacy', desc: 'All Pharmacy (CREDIT_SALES) Transactions from POS', date: '3/20/2026', time: '16:11', ref: '(Ref: 23/3/2', dr: 0, cr: 166100, user: 'Afuge Rosemary', class: 'CLASS 7 - Revenue of Ordinary' },
    { sn: 5, name: 'Main Cash in hand', desc: 'All Main Cash in hand (PATIENT_DEPOSITS) Transactions from POS', date: '3/20/2026', time: '16:11', ref: '(Ref: 23/3/2', dr: 7000, cr: 0, user: 'Afuge Rosemary', class: 'CLASS 5 - Treasury (Cash & Ban' },
    { sn: 6, name: 'Sundry debtors', desc: 'All Sundry debtors (DEPT_REPAYMENT_CASH) Transactions from POS', date: '3/20/2026', time: '16:11', ref: '(Ref: 23/3/2', dr: 0, cr: 152000, user: 'Afuge Rosemary', class: 'CLASS 4 - Third Parties (Debtor' },
    { sn: 7, name: 'Sundry debtors', desc: 'All Sundry debtors (PATIENT_DEPOSITS) Transactions from POS', date: '3/20/2026', time: '16:11', ref: '(Ref: 23/3/2', dr: 0, cr: 7000, user: 'Afuge Rosemary', class: 'CLASS 4 - Third Parties (Debtor' },
    { sn: 8, name: 'Stock', desc: 'STOCK_ADJUSTMENTS |Pharmacy', date: '3/20/2026', time: '16:11', ref: '(Ref: 23/3/2', dr: 90, cr: 0, user: 'Afuge Rosemary', class: 'CLASS 3 - Inventory' },
    { sn: 9, name: 'Stock Adjustment Income (Increase in stock)', desc: 'STOCK_ADJUSTMENTS |Pharmacy', date: '3/20/2026', time: '16:11', ref: '(Ref: 23/3/2', dr: 90, cr: 0, user: 'Afuge Rosemary', class: 'CLASS 8 - Other Revenue OR Ex' },
    { sn: 10, name: 'Main Cash in hand', desc: 'All Main Cash in hand (DEPT_REPAYMENT_CASH) Transactions from POS', date: '3/20/2026', time: '16:11', ref: '(Ref: 23/3/2', dr: 152000, cr: 0, user: 'Afuge Rosemary', class: 'CLASS 5 - Treasury (Cash & Ban' },
    { sn: 11, name: 'Sundry debtors', desc: 'All Sundry debtors (CREDIT_SALES) Transactions from POS', date: '3/20/2026', time: '16:11', ref: '(Ref: 23/3/2', dr: 250100, cr: 0, user: 'Afuge Rosemary', class: 'CLASS 4 - Third Parties (Debtor' }
];

let currentGlFmt = 'advance';

function initReportGeneralLedger() {
    syncGlDates();
    changeGlFormat('advance');
    startGlClock();

    // Sync horizontal scrolling between body and footer
    const wrapper = document.querySelector('.table-scroll-wrapper');
    const footer = document.getElementById('GL_ReportFooter');
    if (wrapper && footer) {
        wrapper.addEventListener('scroll', () => {
            footer.scrollLeft = wrapper.scrollLeft;
        });
    }

    const searchInput = document.querySelector('.report-screen-wrapper .global-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterGlTable(this.value);
        });
    }
}

function startGlClock() {
    const update = () => {
        const now = new Date();
        const d = document.getElementById('GL_CurrentDate');
        const t = document.getElementById('GL_CurrentTime');
        if (d) d.textContent = now.toLocaleDateString('en-GB');
        if (t) t.textContent = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    };
    update();
    window.glClockInterval = setInterval(update, 1000);
}

function syncGlDates() {
    const from = document.getElementById('GL_DateFrom').value;
    const to = document.getElementById('GL_DateTo').value;
    const sub = document.getElementById('GL_Subtitle');
    if (sub) sub.textContent = `${formatDateLong(from)} To ${formatDateLong(to)}.`;
}

function changeGlFormat(fmt) {
    currentGlFmt = fmt;
    renderGlTable();
}

function renderGlTable() {
    const thead = document.getElementById('GL_Thead');
    const tbody = document.getElementById('GL_Tbody');
    const tfoot = document.getElementById('GL_Tfoot');
    const cgMain = document.getElementById('GL_Colgroup_Main');
    const cgFoot = document.getElementById('GL_Colgroup_Footer');

    if (!thead || !tbody || !tfoot) return;

    const fmtNum = (n) => n === 0 ? '0' : n.toLocaleString('en-US');

    // Define Colgroup widths to ensure sync
    const cols = [
        { w: '50px' },  // SN
        { w: '180px' }, // Name
        { w: '' },      // Desc
        { w: '100px' }, // Date
        { w: '80px' },  // Time
        { w: '100px' }, // Ref
        { w: '110px' }, // Dr
        { w: '110px' }, // Cr
        ...(currentGlFmt === 'simple' ? [{ w: '120px' }] : []), // User
        { w: '180px' }  // Class
    ];

    const colHTML = cols.map(c => `<col style="width:${c.w}">`).join('');
    if (cgMain) cgMain.innerHTML = colHTML;
    if (cgFoot) cgFoot.innerHTML = colHTML;

    // Define columns
    let headHTML = `<tr>
        <th>SN</th><th>Account Name</th><th>Description</th><th>Date</th><th>Time</th><th>Reference</th>
        <th class="text-right">Dr Amount</th><th class="text-right">Cr Amount</th>
        ${currentGlFmt === 'simple' ? '<th>System User</th>' : ''}
        <th>Account Class</th>
    </tr>`;

    let bodyHTML = '';
    let totalDr = 0, totalCr = 0;

    glData.forEach(row => {
        bodyHTML += `<tr onclick="handleGlRowClick(event)">
            <td class="text-center">${row.sn}</td>
            <td style="min-width:150px;">${row.name}</td>
            <td style="font-size:10px; max-width:300px;">${row.desc}</td>
            <td>${row.date}</td>
            <td>${row.time}</td>
            <td>${row.ref}</td>
            <td class="text-right">${fmtNum(row.dr)}</td>
            <td class="text-right">${fmtNum(row.cr)}</td>
            ${currentGlFmt === 'simple' ? `<td>${row.user}</td>` : ''}
            <td>${row.class}</td>
        </tr>`;
        totalDr += row.dr;
        totalCr += row.cr;
    });

    thead.innerHTML = headHTML;
    tbody.innerHTML = bodyHTML;
    tfoot.innerHTML = `<tr class="font-bold" style="background:#f0f0f0;">
        <td colspan="6">TOTALS</td>
        <td class="text-right">${fmtNum(totalDr)}</td>
        <td class="text-right">${fmtNum(totalCr)}</td>
        ${currentGlFmt === 'simple' ? '<td></td>' : ''}
        <td></td>
    </tr>`;
}

function handleGlRowClick(e) {
    const tr = e.target.closest('tr');
    if (!tr) return;
    tr.parentElement.querySelectorAll('tr').forEach(r => r.classList.remove('row-selected'));
    tr.classList.add('row-selected');
}

function filterGlTable(val) {
    const filter = val.toLowerCase();
    const rows = document.querySelectorAll('#GL_Tbody tr');
    rows.forEach(row => {
        const text = row.cells[1].textContent.toLowerCase();
        row.style.display = text.includes(filter) ? '' : 'none';
    });
}

/**
 * Print Engine Logic (Matches the 2 PDF samples)
 */
function printGeneralLedger() {
    const from = document.getElementById('GL_DateFrom').value;
    const to = document.getElementById('GL_DateTo').value;
    const fmtNum = (n) => n === 0 ? '0' : n.toLocaleString('en-US');
    
    const rowsPerPage = 22;
    const totalPages = Math.ceil(glData.length / rowsPerPage);
    let allPagesHTML = '';

    const totalDr = glData.reduce((s, i) => s + i.dr, 0);
    const totalCr = glData.reduce((s, i) => s + i.cr, 0);

    for (let i = 0; i < totalPages; i++) {
        const chunk = glData.slice(i * rowsPerPage, (i + 1) * rowsPerPage);
        const isLastPage = (i === totalPages - 1);

        let rowsHTML = chunk.map(row => `
            <tr>
                <td style="text-align:center;">${row.sn}</td>
                <td>${row.name}</td>
                <td style="font-size:10px;">${row.desc}</td>
                <td>${row.date}</td>
                <td>${row.time}</td>
                <td>${row.ref}</td>
                <td style="text-align:right;">${fmtNum(row.dr)}</td>
                <td style="text-align:right;">${fmtNum(row.cr)}</td>
                ${currentGlFmt === 'simple' ? `<td>${row.user}</td>` : ''}
                <td>${row.class}</td>
            </tr>
        `).join('');

        if (isLastPage) {
            rowsHTML += `<tr style="font-weight:bold; background:#f9f9f9;">
                <td colspan="6">TOTALS</td>
                <td style="text-align:right;">${fmtNum(totalDr)}</td>
                <td style="text-align:right;">${fmtNum(totalCr)}</td>
                ${currentGlFmt === 'simple' ? '<td></td>' : ''}
                <td></td>
            </tr>`;
        }

        allPagesHTML += `
            <div class="page landscape">
                <div class="doc-header">
                    <div style="width: 100px;"></div>
                    <div class="header-center">
                        <h2>BIAKA HOSPITAL</h2>
                        <h3 style="font-size: 18px; color: #333;">General Ledger for the Period..</h3>
                        <div class="red-line"></div>
                        <div class="sub-date">${formatDateLong(from)} To ${formatDateLong(to)}.</div>
                    </div>
                    <div class="header-right">
                        <div>${new Date().toLocaleDateString('en-GB')}</div>
                        <div>${new Date().toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'})}</div>
                    </div>
                </div>

                <table class="print-table">
                    <thead>
                        <tr>
                            <th>SN</th><th>Account Name</th><th>Description</th><th>Date</th><th>Time</th><th>Reference</th>
                            <th style="text-align:right;">Dr Amount</th><th style="text-align:right;">Cr Amount</th>
                            ${currentGlFmt === 'simple' ? '<th>User</th>' : ''}
                            <th>Account Class</th>
                        </tr>
                    </thead>
                    <tbody>${rowsHTML}</tbody>
                </table>

                <div class="doc-footer">
                    <span>"Copyright(c)2025. Institute ERP PRO"</span>
                    <span>${i + 1}/${totalPages}</span>
                    <span>Powered by AfricRenov Group Sarl</span>
                </div>
            </div>`;
    }

    const win = window.open('', '_blank');
    win.document.write(`
        <html>
        <head>
            <title>General Ledger - ${currentGlFmt.toUpperCase()}</title>
            <style>
                @page { size: A4 landscape; margin: 0; }
                body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: #525659; }
                .page { background: white; width: 29.7cm; height: 21cm; box-sizing: border-box; padding: 1cm; margin: 10px auto; display: flex; flex-direction: column; position: relative; }
                .doc-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
                .header-center { flex: 1; text-align: center; }
                .header-center h2 { margin: 0; color: #2e3192; font-size: 26px; }
                .red-line { border-top: 2px solid #cd2027; width: 80%; margin: 5px auto; }
                .sub-date { color: #cd2027; font-weight: bold; font-size: 13px; }
                .header-right { text-align: right; font-size: 11px; font-weight: bold; }
                
                .print-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 10px; }
                .print-table th, .print-table td { border: 1px solid #000; padding: 4px; }
                .print-table th { background: #f0f0f0 !important; -webkit-print-color-adjust: exact; }

                .doc-footer { position: fixed; bottom: 1cm; left: 1cm; right: 1cm; display: flex; justify-content: space-between; font-size: 10px; border-top: 1px solid #ccc; padding-top: 5px; }
                @media print { body { background: none; } .page { margin: 0; } }
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

window.initReportGeneralLedger = initReportGeneralLedger;
window.changeGlFormat = changeGlFormat;
window.syncGlDates = syncGlDates;
window.printGeneralLedger = printGeneralLedger;