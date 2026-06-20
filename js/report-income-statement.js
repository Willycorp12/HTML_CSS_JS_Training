// js/report-income-statement.js

const cashData = [
    { code: '7061020', name: 'Pharmacy', expenses: 0, income: 166100 },
    { code: '7061030', name: 'Laboratory', expenses: 0, income: 21500 },
    { code: '7061050', name: 'Consultation', expenses: 0, income: 2500 },
    { code: '7061130', name: 'Artificial Intelligence Laboratory Machine (A.I)', expenses: 0, income: 60000 },
    { code: '6011000', name: 'Purchase of Medical Supplies', expenses: 45000, income: 0 },
    { code: '6130000', name: 'Electricity and Water', expenses: 12500, income: 0 },
    { code: '6410000', name: 'Staff Salaries', expenses: 85000, income: 0 },
];

const accrualData = [
    ...cashData,
    { code: '4111000', name: 'Accounts Receivable (Unpaid Bills)', expenses: 0, income: 45000 },
    { code: '6811000', name: 'Depreciation of Medical Equipment', expenses: 15000, income: 0 },
    { code: '4011000', name: 'Accounts Payable (Unpaid Suppliers)', expenses: 22000, income: 0 }
];

let activeIsData = [];
let currentIsBasis = 'cash'; // 'cash' or 'accrual'
let isChartInstance = null;
let isMainFooterChartInstance = null;
let currentChartType = 'doughnut';
let isLegendVisible = true;
let legendPosition = 'right';

/**
 * Initialization function called by index.html loadScreen.
 * @param {string} basis - Either 'cash' or 'accrual'
 */
function initReportIncomeStatement(basis = 'cash') {
    currentIsBasis = basis;
    activeIsData = (basis === 'cash') ? [...cashData] : [...accrualData];

    console.log(`initReportIncomeStatement: Initializing in ${basis} mode...`);

    // Update UI Titles based on basis
    const mainTitle = document.querySelector('.report-main-title');
    if (mainTitle) {
        mainTitle.textContent = (basis === 'cash') 
            ? 'Profit and Loss Account (CASH BASIS)' 
            : 'Statement of Comprehensive Income for the Period..';
    }

    syncIsDates();
    renderIsTable();
    startIsClock();

    // Sync horizontal scrolling between body and footer
    const wrapper = document.querySelector('.table-scroll-wrapper');
    const footer = document.getElementById('IS_ReportFooter');
    if (wrapper && footer) {
        wrapper.addEventListener('scroll', () => {
            footer.scrollLeft = wrapper.scrollLeft;
        });
    }

    // Attach search listener
    const searchInput = document.querySelector('.report-screen-wrapper .global-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterIsTable(this.value);
        });
    }
}

/**
 * Highlights row in red when clicked.
 */
function handleIsRowClick(event) {
    const row = event.target.closest('tr');
    if (!row || row.parentElement.tagName === 'THEAD' || row.parentElement.tagName === 'TFOOT') return;
    
    // Remove 'row-selected' from all other rows
    row.parentElement.querySelectorAll('tr').forEach(r => r.classList.remove('row-selected'));
    
    // Apply 'row-selected' to the active row
    row.classList.add('row-selected');
}

function startIsClock() {
    const update = () => {
        const now = new Date();
        const dateEl = document.getElementById('IS_CurrentDate');
        const timeEl = document.getElementById('IS_CurrentTime');
        if (dateEl) dateEl.textContent = now.toLocaleDateString('en-GB');
        if (timeEl) timeEl.textContent = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };
    update();
    window.isClockInterval = setInterval(update, 1000);
}

function syncIsDates() {
    const fromVal = document.getElementById('IS_DateFrom').value;
    const toVal = document.getElementById('IS_DateTo').value;
    const subtitle = document.getElementById('IS_Subtitle');
    if (subtitle) {
        subtitle.textContent = `${formatDateLong(fromVal)} To ${formatDateLong(toVal)}.`;
    }
}

function renderIsTable() {
    const tbody = document.querySelector('#IS_Table tbody');
    const tfoot = document.getElementById('IS_Tfoot');
    const cgMain = document.getElementById('IS_Colgroup_Main');
    const cgFoot = document.getElementById('IS_Colgroup_Footer');

    if (!tbody || !tfoot) return;

    if (cgMain && cgFoot) cgFoot.innerHTML = cgMain.innerHTML;

    let bodyHTML = '';
    let totalExp = 0;
    let totalInc = 0;
    const fmt = (n) => n === 0 ? '0' : n.toLocaleString('en-US');

    activeIsData.forEach(row => {
        bodyHTML += `<tr onclick="handleIsRowClick(event)">
            <td>${row.code}</td>
            <td>${row.name}</td>
            <td class="text-right">${fmt(row.expenses)}</td>
            <td class="text-right">${fmt(row.income)}</td>
        </tr>`;
        totalExp += row.expenses;
        totalInc += row.income;
    });

    tbody.innerHTML = bodyHTML;

    tfoot.innerHTML = `<tr class="font-bold" style="background:#f0f0f0;">
        <td colspan="2" class="text-center">Somme</td>
        <td class="text-right">${fmt(totalExp)}</td>
        <td class="text-right">${fmt(totalInc)}</td>
    </tr>`;

    updateIsSummary(totalInc, totalExp);
}

function updateIsSummary(revenue, expenses) {
    const setVal = (id, val, suffix = ' Frs') => {
        const el = document.getElementById(id);
        if (el) el.textContent = val.toLocaleString('en-US') + suffix;
    };

    const ebitda = revenue - expenses;
    // For this mock, we'll keep other fields at 0 as per the image
    setVal('IS_TotalRevenue', revenue);
    setVal('IS_TotalExpenses', expenses);
    setVal('IS_EBITDA', ebitda);
    setVal('IS_NetProfit', ebitda);
}

function filterIsTable(val) {
    const filter = val.toLowerCase();
    const rows = document.querySelectorAll('#IS_Table tbody tr');
    rows.forEach(row => {
        const text = row.cells[1].textContent.toLowerCase();
        row.style.display = text.includes(filter) ? '' : 'none';
    });
}

/* ================= CHART MANAGER LOGIC ================= */

async function openIsChartManager() {
    const modal = document.getElementById('MODAL_IsChartManager');
    if (modal) {
        modal.style.display = 'flex';
    }
    
    // Load Chart.js if not present
    if (typeof Chart === 'undefined') {
        await new Promise(resolve => {
            const script = document.createElement('script');
            script.src = "https://cdn.jsdelivr.net/npm/chart.js";
            script.onload = resolve;
            document.head.appendChild(script);
        });
    }
    
    renderIsChart();
    if (typeof makeElementDraggable === 'function') {
        makeElementDraggable(modal.querySelector('.coa-modal'), document.getElementById('CHART_MODAL_HEADER'));
    }
}

function closeIsChartManager() {
    document.getElementById('MODAL_IsChartManager').style.display = 'none';
    renderMainPageFooterChart();
}

function updateIsChartType(type) {
    currentChartType = type;
    renderIsChart();
}

function toggleIsChartLegend() {
    isLegendVisible = !isLegendVisible;
    const icon = document.getElementById('BTN_ToggleLegend');
    if (icon) {
        icon.className = isLegendVisible ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash';
    }
    renderIsChart();
}

function updateIsChartLegendPos(pos) {
    legendPosition = pos;
    renderIsChart();
}

function renderIsChart() {
    const canvas = document.getElementById('IS_ChartCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const revenueItems = activeIsData.filter(d => d.income > 0);
    
    const labels = revenueItems.map(d => d.name);
    const values = revenueItems.map(d => d.income);
    const total = values.reduce((a, b) => a + b, 0);
    const baseColors = ['#d8b4fe', '#818cf8', '#bef264', '#fb923c', '#f472b6'];

    // Get UI States
    const useSmoothing = document.getElementById('CHART_Smoothing')?.checked;
    const useGradient = document.getElementById('CHART_Gradient')?.checked;
    const useAnimation = document.getElementById('CHART_Animation')?.checked;

    // Create Gradients if enabled
    const chartColors = baseColors.map((color, i) => {
        if (!useGradient) return color;
        const gradient = ctx.createRadialGradient(250, 250, 10, 250, 250, 250);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(1, color);
        return gradient;
    });

    if (isChartInstance) isChartInstance.destroy();

    let config = {
        type: currentChartType === 'semi' ? 'doughnut' : currentChartType,
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: chartColors,
                borderWidth: 2,
                borderColor: '#fff',
                borderRadius: useSmoothing ? 6 : 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: useAnimation ? { duration: 1000 } : false,
            plugins: { 
                legend: { 
                    display: isLegendVisible,
                    position: legendPosition
                } 
            }
        }
    };

    if (currentChartType === 'semi') {
        config.options.rotation = -90;
        config.options.circumference = 180;
    }

    isChartInstance = new Chart(ctx, config);

}

/**
 * Renders the chart configuration into the main page footer area
 */
function renderMainPageFooterChart() {
    const canvas = document.getElementById('IS_MainFooterCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const revenueItems = activeIsData.filter(d => d.income > 0);
    
    if (isMainFooterChartInstance) isMainFooterChartInstance.destroy();

    const baseColors = ['#d8b4fe', '#818cf8', '#bef264', '#fb923c', '#f472b6'];

    isMainFooterChartInstance = new Chart(ctx, {
        type: currentChartType === 'semi' ? 'doughnut' : currentChartType,
        data: {
            labels: revenueItems.map(d => d.name),
            datasets: [{
                data: revenueItems.map(d => d.income),
                backgroundColor: baseColors,
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            rotation: currentChartType === 'semi' ? -90 : 0,
            circumference: currentChartType === 'semi' ? 180 : 360,
            plugins: { legend: { position: 'right', labels: { boxWidth: 12, font: { size: 10 } } } }
        }
    });
}

function saveIsChartAsBmp() {
    const canvas = document.getElementById('IS_ChartCanvas');
    if (!canvas) return;
    
    // Create a temporary canvas to draw the legend + chart for saving
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 800;
    tempCanvas.height = 600;
    const tCtx = tempCanvas.getContext('2d');
    
    // Fill white background
    tCtx.fillStyle = '#fff';
    tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Draw the chart image onto the temp canvas
    tCtx.drawImage(canvas, 50, 50, 500, 500);
    
    // Manually trigger download
    const link = document.createElement('a');
    link.download = 'Income_Statement_Analysis.png';
    link.href = tempCanvas.toDataURL("image/png");
    link.click();
}

function printIsChart() {
    const chartImg = document.getElementById('IS_ChartCanvas').toDataURL("image/png");
    const win = window.open('', '_blank');
    win.document.write(`
        <html>
        <body style="display:flex; flex-direction:column; align-items:center; padding:50px;">
            <div style="width:500px; height:500px;"><img src="${chartImg}" style="width:100%;"></div>
            <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
        </html>
    `);
    win.document.close();
}

/* ================= UPDATED PRINT ENGINE ================= */

function printIncomeStatement() {
    const fromVal = document.getElementById('IS_DateFrom').value;
    const toVal = document.getElementById('IS_DateTo').value;
    const reportTitle = (currentIsBasis === 'cash') 
        ? 'Statement of Comprehensive Income for the Period (CASH BASIS)..' 
        : 'Statement of Comprehensive Income for the Period..';

    const now = new Date();
    const printDate = now.toLocaleDateString('en-GB');
    const printTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const fmt = (n) => n === 0 ? '0' : n.toLocaleString('en-US');

    const revenueItems = activeIsData.filter(d => d.income > 0);
    const expenseItems = activeIsData.filter(d => d.expenses > 0);
    
    let totalRevenue = revenueItems.reduce((s, i) => s + i.income, 0);
    let totalExpenses = expenseItems.reduce((s, i) => s + i.expenses, 0);
    let netProfit = totalRevenue - totalExpenses;

    let revenueRows = revenueItems.map(row => `
        <tr>
            <td style="padding-left: 40px;">${row.code} &nbsp;&nbsp; ${row.name}</td>
            <td style="text-align:right;">${fmt(row.income)}</td>
        </tr>
    `).join('');

    let expenseRows = expenseItems.map(row => `
        <tr>
            <td style="padding-left: 40px;">${row.code} &nbsp;&nbsp; ${row.name}</td>
            <td style="text-align:right;">${fmt(row.expenses)}</td>
        </tr>
    `).join('');

    const contentHTML = `
        <div class="page portrait">
            <div class="doc-container">
                <div class="doc-header">
                    <div style="width: 100px;"></div>
                    <div class="header-center">
                        <h2 style="font-family: Arial; font-weight: bold; font-size: 22px;">BIAKA HOSPITAL</h2>
                        <h3 style="font-size: 18px;">${reportTitle}</h3>
                        <div class="red-line"></div>
                        <div class="sub-date">${formatDateLong(fromVal)} To ${formatDateLong(toVal)}.</div>
                    </div>
                    <div class="header-right">
                        <div style="font-weight: bold;">${printDate}</div>
                        <div style="font-weight: bold;">${printTime}</div>
                    </div>
                </div>

                <div class="section-title revenue-bg">REVENUE:</div>
                <table class="is-print-table">
                    <tbody>
                        <tr><td colspan="2" style="font-weight: bold;">7060000 &nbsp;&nbsp; INCOME FROM MEDICAL SERVICES</td></tr>
                        ${revenueRows}
                        <tr class="subtotal-row">
                            <td style="text-align: right; padding-right: 50px;">Total INCOME FROM MEDICAL SERVICES</td>
                            <td style="text-align: right; border-top: 1px solid #000;">${fmt(totalRevenue)}</td>
                        </tr>
                        <tr class="grand-total-row">
                            <td style="text-align: right; color: #2e3192;">TOTAL REVENUE:</td>
                            <td style="text-align: right; color: #2e3192; border-top: 2px solid #2e3192;">${fmt(totalRevenue)} Frs</td>
                        </tr>
                    </tbody>
                </table>

                <div class="section-title expense-bg" style="margin-top: 20px;">EXPENSES:</div>
                <table class="is-print-table">
                    <tbody>
                        ${expenseRows}
                        <tr class="grand-total-row">
                            <td style="text-align: right; color: #cd2027;">TOTAL EXPENSES:</td>
                            <td style="text-align: right; color: #cd2027; border-top: 2px solid #cd2027;">${fmt(totalExpenses)} Frs</td>
                        </tr>
                    </tbody>
                </table>

                <div class="final-metrics">
                    <div class="metric-line">
                        <span class="metric-label" style="color: #2e3192;">Earnings B4 Interest & Taxes, Dep. & Amort. (EBIT/DA)</span>
                        <span class="metric-value" style="color: #2e3192; border-bottom: 2px solid #2e3192;">${fmt(netProfit)} Frs</span>
                    </div>
                    <div class="metric-line small"><span>Interest</span><span>0 Frs</span></div>
                    <div class="metric-line small"><span>Taxes</span><span>0 Frs</span></div>
                    <div class="metric-line small"><span>Depreciation / Amortisation</span><span>0 Frs</span></div>
                    <div class="metric-line large">
                        <span class="metric-label" style="color: #2e3192;">TOTAL PROFIT / LOSS</span>
                        <span class="metric-value" style="color: #2e3192; border-bottom: 2px solid #2e3192;">${fmt(netProfit)} Frs</span>
                    </div>
                </div>

                <div class="doc-footer">
                    <span>"Copyright(c)2025. Institute ERP Pro.</span>
                    <span>Powered by AfricRenov Group Sarl.</span>
                </div>
            </div>
        </div>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Income Statement Print</title>
            <style>
                @page { size: A4 portrait; margin: 0; }
                body { margin: 0; padding: 0; font-family: "Segoe UI", Tahoma, sans-serif; background: #525659; }
                .page { 
                    background: white; 
                    width: 21cm; 
                    min-height: 27.7cm; /* Ensures the container fills the printable area */
                    box-sizing: border-box; 
                    padding: 1cm 1.5cm; 
                    margin: 10px auto; 
                    display: flex; 
                    flex-direction: column; 
                }
                .doc-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
                .header-center { flex: 1; text-align: center; }
                .header-center h2 { margin: 0; color: #2e3192; }
                .red-line { border-top: 2px solid #cd2027; width: 80%; margin: 5px auto; }
                .sub-date { color: #cd2027; font-weight: bold; font-size: 13px; }
                .header-right { text-align: right; font-size: 11px; }
                
                .section-title { padding: 4px 10px; color: white; font-weight: bold; font-size: 14px; margin-top: 10px; -webkit-print-color-adjust: exact; }
                .revenue-bg { background-color: #2e3192 !important; }
                .expense-bg { background-color: #cd2027 !important; }

                .is-print-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 5px; }
                .is-print-table td { padding: 4px 0; }
                .subtotal-row td { font-weight: bold; padding-top: 10px; }
                .grand-total-row td { font-weight: bold; font-size: 14px; padding-top: 5px; }
                
                .final-metrics { margin-top: 30px; display: flex; flex-direction: column; gap: 8px; }
                .metric-line { display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; }
                .metric-line.small { font-size: 12px; font-weight: normal; border-bottom: 1px solid #eee; padding-bottom: 2px; }
                .metric-line.large { font-size: 16px; margin-top: 10px; }
                .metric-value { min-width: 150px; text-align: right; }
                
                .doc-footer {
                    position: fixed;
                    bottom: 1cm;
                    left: 1.5cm;
                    right: 1.5cm;
                    display: flex; 
                    justify-content: space-between; 
                    font-style: italic;
                    font-size: 10px; 
                    border-top: 1px solid #ccc; 
                    padding-top: 5px;
                }
                @media print {
                    body { background: none; }
                    .page { margin: 0; page-break-after: always; }
                }
            </style>
        </head>
        <body>
            ${contentHTML}
            <script>window.onload = function() { window.print(); window.close(); };</script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

/** Helper for date display */
function formatDateLong(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Expose to window for index.html access
window.initReportIncomeStatement = initReportIncomeStatement;
window.syncIsDates = syncIsDates;
window.printIncomeStatement = printIncomeStatement;

// Cleanup clock when switching screens
window.addEventListener('beforeunload', () => {
    if (window.isClockInterval) clearInterval(window.isClockInterval);
});