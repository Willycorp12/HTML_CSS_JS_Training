// js/report-balance-sheet.js

/**
 * Sample data matching Balance Sheet.jpg
 */
const bsData = [
    { code: '5710000', name: 'CASH AT HAND', isGroup: true, type: 'asset' },
    { code: '5710000', name: 'Main Cash in hand', amount: 159000, type: 'asset', parentCode: '5710000' },
    { code: '4110000', name: 'ACCOUNT RECEIVABLES', isGroup: true, type: 'asset' },
    { code: '4712200', name: 'Sundry debtors', amount: 91100, type: 'asset', parentCode: '4110000' },
    { code: '1000000', name: 'OWNERS EQUITY', isGroup: true, type: 'equity' },
    { code: '1400000', name: 'Net profit/Loss for the period', amount: 250010, type: 'equity', parentCode: '1000000' },
    { code: '1300000', name: 'Retained pofit brought forward', amount: 90, type: 'equity', parentCode: '1000000' }
];

/**
 * Initializer called by loadScreen
 */
function initReportBalanceSheet() {
    console.log("initReportBalanceSheet: Initializing...");
    syncBsDates();
    renderBsTable();
    startBsClock();

    // Sync horizontal scrolling between body and footer
    const wrapper = document.querySelector('.table-scroll-wrapper');
    const footer = document.getElementById('BS_ReportFooter');
    if (wrapper && footer) {
        wrapper.addEventListener('scroll', () => {
            footer.scrollLeft = wrapper.scrollLeft;
        });
    }

    const searchInput = document.querySelector('.report-screen-wrapper .global-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterBsTable(this.value);
        });
    }
}

function startBsClock() {
    const update = () => {
        const now = new Date();
        const dateEl = document.getElementById('BS_CurrentDate');
        const timeEl = document.getElementById('BS_CurrentTime');
        if (dateEl) dateEl.textContent = now.toLocaleDateString('en-GB');
        if (timeEl) timeEl.textContent = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    };
    update();
    window.bsClockInterval = setInterval(update, 1000);
}

function syncBsDates() {
    const fromVal = document.getElementById('BS_DateFrom').value;
    const toVal = document.getElementById('BS_DateTo').value;
    const subtitle = document.getElementById('BS_Subtitle');
    if (subtitle) {
        subtitle.textContent = `${formatDateLong(fromVal)} To ${formatDateLong(toVal)}.`;
    }
}

function renderBsTable() {
    const tbody = document.querySelector('#BS_Table tbody');
    const tfoot = document.getElementById('BS_Tfoot');
    const cgMain = document.getElementById('BS_Colgroup_Main');
    const cgFoot = document.getElementById('BS_Colgroup_Footer');

    if (!tbody || !tfoot) return;

    if (cgMain && cgFoot) cgFoot.innerHTML = cgMain.innerHTML;

    let bodyHTML = '';
    let totalAssets = 0;
    let totalEquity = 0;
    const fmt = (n) => n === 0 ? '0' : n.toLocaleString('en-US');

    // Simplified rendering for screen table
    bsData.forEach(row => {
        const isGroup = row.isGroup;
        const dr = row.type === 'asset' ? (row.amount || 0) : 0;
        const cr = row.type === 'equity' ? (row.amount || 0) : 0;
        
        if (isGroup) {
            bodyHTML += `<tr style="font-weight:bold; color:#2e3192;"><td>${row.code}</td><td>${row.name}</td><td></td><td></td></tr>`;
        } else {
            bodyHTML += `<tr><td>${row.code}</td><td style="padding-left:25px;">${row.name}</td><td class="text-right">${dr > 0 ? fmt(dr) : ''}</td><td class="text-right">${cr > 0 ? fmt(cr) : ''}</td></tr>`;
        }
        totalAssets += dr;
        totalEquity += cr;
    });

    tbody.innerHTML = bodyHTML;
    tfoot.innerHTML = `<tr class="font-bold" style="background:#f0f0f0;">
        <td colspan="2">TOTAL</td>
        <td class="text-right">${fmt(totalAssets)}</td>
        <td class="text-right">${fmt(totalEquity)}</td>
    </tr>`;
}

function filterBsTable(val) {
    const filter = val.toLowerCase();
    const rows = document.querySelectorAll('#BS_Table tbody tr');
    rows.forEach(row => {
        const text = row.cells[1].textContent.toLowerCase();
        row.style.display = text.includes(filter) ? '' : 'none';
    });
}

/**
 * Unified Printing Function
 */
function printBalanceSheet(format) {
    const fromVal = document.getElementById('BS_DateFrom').value;
    const toVal = document.getElementById('BS_DateTo').value;
    const now = new Date();
    const printDate = now.toLocaleDateString('en-GB');
    const printTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const fmt = (n) => n === 0 ? '0' : n.toLocaleString('en-US');

    const assetItems = bsData.filter(d => d.type === 'asset');
    const equityItems = bsData.filter(d => d.type === 'equity');
    const grandTotalAssets = assetItems.reduce((s, i) => s + (i.amount || 0), 0);
    const grandTotalEquity = equityItems.reduce((s, i) => s + (i.amount || 0), 0);

    const ROWS_PER_PAGE = 28;
    const totalPages = Math.max(
        Math.ceil(assetItems.length / ROWS_PER_PAGE),
        Math.ceil(equityItems.length / ROWS_PER_PAGE)
    );

    let allPagesHTML = '';

    for (let i = 0; i < totalPages; i++) {
        const assetChunk = assetItems.slice(i * ROWS_PER_PAGE, (i + 1) * ROWS_PER_PAGE);
        const equityChunk = equityItems.slice(i * ROWS_PER_PAGE, (i + 1) * ROWS_PER_PAGE);
        const isLastPage = (i === totalPages - 1);

        let pageContent = '';
        if (format === 'intl') {
            pageContent = `
                <div class="section-title-intl">ASSETS</div>
                ${generateIntlSection(assetChunk, 'ASSETS', grandTotalAssets, isLastPage)}
                <div class="section-title-intl" style="margin-top:30px;">EQUITY AND LIABILITY</div>
                ${generateIntlSection(equityChunk, 'EQUITY AND LIABILITY', grandTotalEquity, isLastPage)}
            `;
        } else {
            pageContent = `
                <div class="ohada-grid">
                    <div class="ohada-col">
                        <div class="ohada-header">ASSETS</div>
                        <div class="ohada-content">${generateOhadaLines(assetChunk)}</div>
                        ${isLastPage ? `<div class="ohada-total-bar"><span>TOTAL ASSETS</span><span>${fmt(grandTotalAssets)} FCFA</span></div>` : ''}
                    </div>
                    <div class="ohada-col">
                        <div class="ohada-header">EQUITY</div>
                        <div class="ohada-content">${generateOhadaLines(equityChunk)}</div>
                        ${isLastPage ? `<div class="ohada-total-bar"><span>TOTAL EQUITY</span><span>${fmt(grandTotalEquity)} FCFA</span></div>` : ''}
                    </div>
                </div>
            `;
        }

        allPagesHTML += `
            <div class="page">
                <div class="doc-header">
                    <div style="width: 100px;"></div>
                    <div class="header-center">
                        <h2>BIAKA HOSPITAL</h2>
                        <h3 style="font-size: 16px;">Statement of Financial Position for the Period Ended...</h3>
                        <div class="red-line"></div>
                        <div class="sub-date">${formatDateLong(fromVal)} To ${formatDateLong(toVal)}.</div>
                    </div>
                    <div style="text-align: right; font-size: 11px;"><b>${printDate}</b><br><b>${printTime}</b></div>
                </div>
                <div class="printable-data-wrap">${pageContent}</div>
                <div class="doc-footer">
                    <span>Copyright(c)2025. Institute Pro ERP</span>
                    <span>Page ${i + 1} of ${totalPages}</span>
                    <span>Powered by AfricRenov Group Sarl</span>
                </div>
            </div>`;
    }

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Balance Sheet - ${format.toUpperCase()}</title>
            <style>
                @page { size: A4 portrait; margin: 0; }
                body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: #525659; }
                .page { background: white; width: 21cm; height: 29.7cm; box-sizing: border-box; padding: 1.5cm; margin: 10px auto; display: flex; flex-direction: column; position: relative; }
                .doc-header { display: flex; justify-content: space-between; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
                .header-center { flex: 1; text-align: center; }
                .header-center h2 { margin: 0; color: #2e3192; font-size: 24px; }
                .red-line { border-top: 2px solid #cd2027; width: 80%; margin: 5px auto; }
                .sub-date { color: #cd2027; font-weight: bold; font-size: 13px; }
                
                /* Intl Styles */
                .section-title-intl { font-weight: bold; font-size: 18px; text-decoration: underline; margin-bottom: 10px; }
                .intl-table { width: 100%; border-collapse: collapse; font-size: 13px; }
                .intl-table td { padding: 4px 0; }
                .group-row { font-weight: bold; padding-top: 10px; }
                .subtotal-row { font-weight: bold; border-top: 1px solid #ccc; margin-top: 5px; }
                .printable-data-wrap { flex: 1; }

                /* Ohada Styles */
                .ohada-grid { display: flex; gap: 20px; flex: 1; }
                .ohada-col { flex: 1; display: flex; flex-direction: column; border: 1px solid #2e3192; }
                .ohada-header { background: #2e3192; color: white; padding: 8px; text-align: center; font-weight: bold; -webkit-print-color-adjust: exact; }
                .ohada-content { flex: 1; padding: 10px; font-size: 12px; }
                .ohada-total-bar { background: #2e3192; color: white; padding: 10px; display: flex; justify-content: space-between; font-weight: bold; -webkit-print-color-adjust: exact; }

                .doc-footer {
                    position: fixed; bottom: 1cm; left: 1.5cm; right: 1.5cm;
                    display: flex; justify-content: space-between; font-style: italic;
                    font-size: 10px; border-top: 1px solid #ccc; padding-top: 5px;
                }
                @media print { body { background: none; } .page { margin: 0; } }
            </style>
        </head>
        <body>
            ${allPagesHTML}
            <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

/** Helper for Intl Format HTML */
function generateIntlSection(items, title, grandTotal, showFinal) {
    if (items.length === 0) return '';
    const fmt = (n) => n.toLocaleString('en-US');
    const groups = [...new Set(items.filter(i => i.parentCode).map(i => i.parentCode))];
    let html = '<table class="intl-table"><tbody>';
    
    groups.forEach(gCode => {
        const groupInfo = bsData.find(d => d.code === gCode);
        const groupItems = items.filter(i => i.parentCode === gCode);
        const groupTotal = groupItems.reduce((s, i) => s + (i.amount || 0), 0);
        
        html += `<tr class="group-row"><td colspan="2">${gCode} &nbsp; ${groupInfo.name}</td></tr>`;
        groupItems.forEach(item => {
            html += `<tr><td style="padding-left:40px;">${item.code} &nbsp; ${item.name}</td><td style="text-align:right;">${fmt(item.amount)}</td></tr>`;
        });
        html += `<tr class="subtotal-row"><td style="text-align:right; padding-right:20px;">Total &nbsp; ${groupInfo.name}</td><td style="text-align:right;">${fmt(groupTotal)}</td></tr>`;
    });
    
    if (showFinal) {
        html += `<tr style="font-weight:bold; font-size:15px;"><td style="text-align:right; padding-right:20px;">TOTAL ${title}</td><td style="text-align:right; border-bottom:3px double #000;">${fmt(grandTotal)}</td></tr>`;
    }
    html += '</tbody></table>';
    return html;
}

/** Helper for OHADA Lines */
function generateOhadaLines(items) {
    const fmt = (n) => n.toLocaleString('en-US');
    const groups = [...new Set(items.filter(i => i.parentCode).map(i => i.parentCode))];
    let html = '';
    
    groups.forEach(gCode => {
        const groupInfo = bsData.find(d => d.code === gCode);
        const groupItems = items.filter(i => i.parentCode === gCode);
        const groupTotal = groupItems.reduce((s, i) => s + (i.amount || 0), 0);
        
        html += `<div style="font-weight:bold; margin-top:10px;">${gCode} &nbsp; ${groupInfo.name}</div>`;
        groupItems.forEach(item => {
            html += `<div style="display:flex; justify-content:space-between; padding-left:15px; border-bottom:1px dotted #eee;">
                <span>${item.code} &nbsp; ${item.name}</span>
                <span>${fmt(item.amount)}</span>
            </div>`;
        });
        html += `<div style="display:flex; justify-content:space-between; font-weight:bold; border-top:1px solid #000; margin-top:5px;">
            <span>TOTAL ${groupInfo.name}</span>
            <span>${fmt(groupTotal)}</span>
        </div>`;
    });
    return html;
}

/** Helper for date display */
function formatDateLong(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Expose to window
window.initReportBalanceSheet = initReportBalanceSheet;
window.printBalanceSheet = printBalanceSheet;
window.syncBsDates = syncBsDates;
