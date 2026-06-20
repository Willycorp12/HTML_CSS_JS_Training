// js/report-trial-balance.js

/**
 * Mock Data based on the provided images.
 * Note: 'style: bg-red' is used for specific data-driven highlighting (like Sundry Debtors).
 */
const tbData = [
    { code: '4712200', name: 'Sundry debtors', open: {d:0, c:0}, mvt: {d:250100, c:159000}, adj: {d:91100, c:0}, close: {d:91100, c:0} },
    { code: '5710000', name: 'Main Cash in hand', open: {d:0, c:0}, mvt: {d:159000, c:0}, adj: {d:0, c:0}, close: {d:159000, c:0} },
    { code: '7061020', name: 'Pharmacy', open: {d:0, c:0}, mvt: {d:0, c:166100}, adj: {d:0, c:166100}, close: {d:0, c:166100} },
    { code: '7061030', name: 'Laboratory', open: {d:0, c:0}, mvt: {d:0, c:21500}, adj: {d:0, c:21500}, close: {d:0, c:21500} },
    { code: '7061050', name: 'Consultation', open: {d:0, c:0}, mvt: {d:0, c:2500}, adj: {d:0, c:2500}, close: {d:0, c:2500} },
    { code: '7061130', name: 'Artificial Intelligence Laboratory Machine (A.I)', open: {d:0, c:0}, mvt: {d:0, c:60000}, adj: {d:0, c:60000}, close: {d:0, c:60000} },
    { code: '871000', name: 'Stock Adjustment Income (Increase in stock)', open: {d:0, c:0}, mvt: {d:90, c:0}, adj: {d:0, c:0}, close: {d:90, c:0} },
    // Expanded data to force multi-page printing
    { code: '1011000', name: 'Land and Buildings - Main Campus', open: {d:50000000, c:0}, mvt: {d:0, c:0}, adj: {d:0, c:0}, close: {d:50000000, c:0} },
    { code: '2110000', name: 'Medical Equipment - Radiology', open: {d:15000000, c:0}, mvt: {d:2500000, c:0}, adj: {d:0, c:0}, close: {d:17500000, c:0} },
    { code: '2110100', name: 'Medical Equipment - Surgery', open: {d:12000000, c:0}, mvt: {d:0, c:0}, adj: {d:0, c:0}, close: {d:12000000, c:0} },
    { code: '2181000', name: 'Office Furniture & Fittings', open: {d:4500000, c:0}, mvt: {d:150000, c:0}, adj: {d:0, c:0}, close: {d:4650000, c:0} },
    { code: '4011000', name: 'Suppliers - Medical Consumables', open: {d:0, c:1200000}, mvt: {d:800000, c:1500000}, adj: {d:0, c:0}, close: {d:0, c:1900000} },
    { code: '4011050', name: 'Suppliers - Pharmacy Stock', open: {d:0, c:4500000}, mvt: {d:2000000, c:3000000}, adj: {d:0, c:0}, close: {d:0, c:5500000} },
    { code: '4210000', name: 'Personnel - Salaries Payable', open: {d:0, c:0}, mvt: {d:8500000, c:8500000}, adj: {d:0, c:0}, close: {d:0, c:0} },
    { code: '4310000', name: 'Social Security (CNPS) Payable', open: {d:0, c:450000}, mvt: {d:450000, c:510000}, adj: {d:0, c:0}, close: {d:0, c:510000} },
    { code: '4421000', name: 'Taxation - PAYE Payable', open: {d:0, c:210000}, mvt: {d:210000, c:245000}, adj: {d:0, c:0}, close: {d:0, c:245000} },
    { code: '5211000', name: 'Bank - First Trust Main Account', open: {d:12500000, c:0}, mvt: {d:4500000, c:7800000}, adj: {d:0, c:0}, close: {d:9200000, c:0} },
    { code: '5211010', name: 'Bank - Ecobank Project Fund', open: {d:3400000, c:0}, mvt: {d:1200000, c:500000}, adj: {d:0, c:0}, close: {d:4100000, c:0} },
    { code: '6011000', name: 'Purchase of Drugs & Medicines', open: {d:0, c:0}, mvt: {d:5600000, c:0}, adj: {d:0, c:0}, close: {d:5600000, c:0} },
    { code: '6012000', name: 'Purchase of Laboratory Reagents', open: {d:0, c:0}, mvt: {d:1250000, c:0}, adj: {d:0, c:0}, close: {d:1250000, c:0} },
    { code: '6130000', name: 'Water & Electricity Expenses', open: {d:0, c:0}, mvt: {d:450000, c:0}, adj: {d:0, c:0}, close: {d:450000, c:0} },
    { code: '6140000', name: 'Telephone & Internet Charges', open: {d:0, c:0}, mvt: {d:125000, c:0}, adj: {d:0, c:0}, close: {d:125000, c:0} },
    { code: '6220000', name: 'Fuel and Lubricants', open: {d:0, c:0}, mvt: {d:320000, c:0}, adj: {d:0, c:0}, close: {d:320000, c:0} },
    { code: '6240000', name: 'Repairs and Maintenance', open: {d:0, c:0}, mvt: {d:185000, c:0}, adj: {d:0, c:0}, close: {d:185000, c:0} },
    { code: '6410000', name: 'Staff Salaries & Wages', open: {d:0, c:0}, mvt: {d:7200000, c:0}, adj: {d:0, c:0}, close: {d:7200000, c:0} },
    { code: '6410100', name: 'Staff Overtime & Bonuses', open: {d:0, c:0}, mvt: {d:450000, c:0}, adj: {d:0, c:0}, close: {d:450000, c:0} },
    { code: '6450000', name: 'Employer Social Security Contrib.', open: {d:0, c:0}, mvt: {d:850000, c:0}, adj: {d:0, c:0}, close: {d:850000, c:0} },
    { code: '7011000', name: 'Revenue - Inpatient Services', open: {d:0, c:0}, mvt: {d:0, c:12400000}, adj: {d:0, c:0}, close: {d:0, c:12400000} },
    { code: '7012000', name: 'Revenue - Outpatient Consultations', open: {d:0, c:0}, mvt: {d:0, c:3500000}, adj: {d:0, c:0}, close: {d:0, c:3500000} },
    { code: '7013000', name: 'Revenue - Radiology & Imaging', open: {d:0, c:0}, mvt: {d:0, c:4200000}, adj: {d:0, c:0}, close: {d:0, c:4200000} },
    { code: '7014000', name: 'Revenue - Maternity Services', open: {d:0, c:0}, mvt: {d:0, c:5800000}, adj: {d:0, c:0}, close: {d:0, c:5800000} },
    { code: '7015000', name: 'Revenue - Theatre Charges', open: {d:0, c:0}, mvt: {d:0, c:2100000}, adj: {d:0, c:0}, close: {d:0, c:2100000} },
    { code: '7016000', name: 'Revenue - Mortuary Services', open: {d:0, c:0}, mvt: {d:0, c:950000}, adj: {d:0, c:0}, close: {d:0, c:950000} },
    { code: '7017000', name: 'Revenue - Physiotherapy', open: {d:0, c:0}, mvt: {d:0, c:640000}, adj: {d:0, c:0}, close: {d:0, c:640000} },
    { code: '7510000', name: 'Other Income - Cafeteria Sales', open: {d:0, c:0}, mvt: {d:0, c:1200000}, adj: {d:0, c:0}, close: {d:0, c:1200000} },
    { code: '7520000', name: 'Other Income - Training & Fees', open: {d:0, c:0}, mvt: {d:0, c:850000}, adj: {d:0, c:0}, close: {d:0, c:850000} },
];

let currentTbCols = 2; 

/**
 * Initialization function called by index.html loadScreen.
 * This makes the page dynamic as soon as it is loaded.
 */
function initReportTrialBalance() {
    console.log("initReportTrialBalance: Initializing...");
    syncTbDates();
    changeTbFormat(2); // Default to 2 Columns view
    
    // Sync horizontal scrolling between body and footer
    const wrapper = document.querySelector('.table-scroll-wrapper');
    const footer = document.querySelector('.report-footer');
    if (wrapper && footer) {
        wrapper.addEventListener('scroll', () => {
            footer.scrollLeft = wrapper.scrollLeft;
        });
    }

    // Attach real-time search listener to the search input
    const searchInput = document.querySelector('.report-screen-wrapper .global-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterTbTable(this.value);
        });
    }
}

/**
 * Row Selection Logic (Selector): Highlights row in red when clicked.
 */
function handleTbRowClick(event) {
    const row = event.target.closest('tr');
    if (!row || row.parentElement.tagName === 'THEAD' || row.parentElement.tagName === 'TFOOT') return;
    
    // Remove 'row-selected' from all other rows
    row.parentElement.querySelectorAll('tr').forEach(r => r.classList.remove('row-selected'));
    
    // Apply 'row-selected' to the active row
    row.classList.add('row-selected');
}

/**
 * Formats date into "1 October 2025" style for the subtitle.
 */
function formatDateLong(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function syncTbDates() {
    const fromVal = document.getElementById('TB_DateFrom').value;
    const toVal = document.getElementById('TB_DateTo').value;
    const subtitle = document.getElementById('TB_Subtitle');
    if (subtitle) {
        subtitle.textContent = `${formatDateLong(fromVal)} To ${formatDateLong(toVal)}.`;
    }
}

function changeTbFormat(cols) {
    currentTbCols = cols;
    const label = document.getElementById('TB_Label');
    if (label) label.textContent = `(${cols}-Columns)`;

    const thead = document.querySelector('#TB_Table thead');
    const tbody = document.querySelector('#TB_Table tbody');
    const tfoot = document.getElementById('TB_Tfoot');
    const colgroupMain = document.getElementById('TB_Colgroup_Main');
    const colgroupFooter = document.getElementById('TB_Colgroup_Footer');

    if (!thead || !tbody || !tfoot) return;

    let headerHTML = '', colHTML = '', bodyHTML = '';
    const fmt = (n) => n === 0 ? '0' : n.toLocaleString('en-US');

    // Dynamic Header and Colgroup Generation
    if (cols === 8) {
        colHTML = `<col style="width:80px"><col><col style="width:90px"><col style="width:90px"><col style="width:90px"><col style="width:90px"><col style="width:90px"><col style="width:90px"><col style="width:90px"><col style="width:90px">`;
        headerHTML = `<tr><th colspan="2">Account. Information</th><th colspan="2">Opening</th><th colspan="2">Movement</th><th colspan="2">Adjustments</th><th colspan="2">Closing Balance</th></tr>
                    <tr><th>A/c code</th><th>Account Name</th><th>Debit</th><th>Credit</th><th>Debit</th><th>Credit</th><th>Debit</th><th>Credit</th><th>Debit</th><th>Credit</th></tr>`;
    } else if (cols === 6) {
        colHTML = `<col style="width:80px"><col><col style="width:100px"><col style="width:100px"><col style="width:100px"><col style="width:100px"><col style="width:100px"><col style="width:100px">`;
        headerHTML = `<tr><th colspan="2">Account. Information</th><th colspan="2">Opening</th><th colspan="2">Movement</th><th colspan="2">Closing Balance</th></tr>
                    <tr><th>A/c code</th><th>Account Name</th><th>Debit</th><th>Credit</th><th>Debit</th><th>Credit</th><th>Debit</th><th>Credit</th></tr>`;
    } else if (cols === 4) {
        colHTML = `<col style="width:80px"><col><col style="width:100px"><col style="width:100px"><col style="width:100px"><col style="width:100px">`;
        headerHTML = `<tr><th colspan="2">Account. Information</th><th colspan="2">Opening</th><th colspan="2">Closing Balance</th></tr>
                    <tr><th>A/c code</th><th>Account Name</th><th>Debit</th><th>Credit</th><th>Debit</th><th>Credit</th></tr>`;
    } else { // 2 Columns
        colHTML = `<col style="width:100px"><col><col style="width:150px"><col style="width:150px">`;
        headerHTML = `<tr><th colspan="2">Account. Information</th><th colspan="2">Closing Balance</th></tr>
                    <tr><th>A/c code</th><th>Account Name</th><th>Debit</th><th>Credit</th></tr>`;
    }

    let sums = { od:0, oc:0, md:0, mc:0, ad:0, ac:0, cd:0, cc:0 };
    tbData.forEach(row => {
        const rowStyle = row.style || '';
        bodyHTML += `<tr class="${rowStyle}" onclick="handleTbRowClick(event)"><td>${row.code}</td><td>${row.name}</td>`;
        if (cols === 8) {
            bodyHTML += `<td class="text-right">${fmt(row.open.d)}</td><td class="text-right">${fmt(row.open.c)}</td>
                         <td class="text-right bg-yellow">${fmt(row.mvt.d)}</td><td class="text-right bg-yellow">${fmt(row.mvt.c)}</td>
                         <td class="text-right">${fmt(row.adj.d)}</td><td class="text-right">${fmt(row.adj.c)}</td>
                         <td class="text-right">${fmt(row.close.d)}</td><td class="text-right">${fmt(row.close.c)}</td>`;
        } else if (cols === 6) {
            bodyHTML += `<td class="text-right">${fmt(row.open.d)}</td><td class="text-right">${fmt(row.open.c)}</td>
                         <td class="text-right bg-yellow">${fmt(row.mvt.d)}</td><td class="text-right bg-yellow">${fmt(row.mvt.c)}</td>
                         <td class="text-right">${fmt(row.close.d)}</td><td class="text-right">${fmt(row.close.c)}</td>`;
        } else if (cols === 4) {
            bodyHTML += `<td class="text-right">${fmt(row.open.d)}</td><td class="text-right">${fmt(row.open.c)}</td>
                         <td class="text-right">${fmt(row.close.d)}</td><td class="text-right">${fmt(row.close.c)}</td>`;
        } else {
            bodyHTML += `<td class="text-right">${fmt(row.close.d)}</td><td class="text-right">${fmt(row.close.c)}</td>`;
        }
        bodyHTML += `</tr>`;
        sums.od += row.open.d; sums.oc += row.open.c; sums.md += row.mvt.d; sums.mc += row.mvt.c;
        sums.ad += row.adj.d; sums.ac += row.adj.c; sums.cd += row.close.d; sums.cc += row.close.c;
    });

    thead.innerHTML = headerHTML;
    if (colgroupMain) colgroupMain.innerHTML = colHTML;
    if (colgroupFooter) colgroupFooter.innerHTML = colHTML;
    tbody.innerHTML = bodyHTML;

    // Totals Row
    let footHTML = `<tr class="font-bold"><td colspan="2">Total</td>`;
    if (cols === 8) {
        footHTML += `<td class="text-right">${fmt(sums.od)}</td><td class="text-right">${fmt(sums.oc)}</td>
                     <td class="text-right bg-yellow">${fmt(sums.md)}</td><td class="text-right bg-yellow">${fmt(sums.mc)}</td>
                     <td class="text-right">${fmt(sums.ad)}</td><td class="text-right">${fmt(sums.ac)}</td>
                     <td class="text-right">${fmt(sums.cd)}</td><td class="text-right">${fmt(sums.cc)}</td>`;
    } else if (cols === 6) {
        footHTML += `<td class="text-right">${fmt(sums.od)}</td><td class="text-right">${fmt(sums.oc)}</td>
                     <td class="text-right bg-yellow">${fmt(sums.md)}</td><td class="text-right bg-yellow">${fmt(sums.mc)}</td>
                     <td class="text-right">${fmt(sums.cd)}</td><td class="text-right">${fmt(sums.cc)}</td>`;
    } else if (cols === 4) {
        footHTML += `<td class="text-right">${fmt(sums.od)}</td><td class="text-right">${fmt(sums.oc)}</td>
                     <td class="text-right">${fmt(sums.cd)}</td><td class="text-right">${fmt(sums.cc)}</td>`;
    } else {
        footHTML += `<td class="text-right">${fmt(sums.cd)}</td><td class="text-right">${fmt(sums.cc)}</td>`;
    }
    footHTML += `</tr>`;
    tfoot.innerHTML = footHTML;
}

function filterTbTable(val) {
    const rows = document.querySelectorAll('#TB_Table tbody tr');
    const filter = val.toLowerCase();
    rows.forEach(row => {
        const text = row.cells[1].textContent.toLowerCase();
        row.style.display = text.includes(filter) ? '' : 'none';
    });
}

/**
 * Print Engine Logic (Multi-page A4).
 * Inherits current view state and generates a PDF-ready window.
 */
function printTrialBalanceReport() {
    const fromVal = document.getElementById('TB_DateFrom').value;
    const toVal = document.getElementById('TB_DateTo').value;
    const orientation = (currentTbCols <= 4) ? 'portrait' : 'landscape';
    const ROWS_PER_PAGE = (orientation === 'portrait') ? 30 : 19; // Adjust based on testing for A4 print
    
    // Capture table structure from the live screen
    const colgroupHTML = document.getElementById('TB_Colgroup_Main').innerHTML;
    // Get the actual header rows, excluding any dynamic repeating hack rows if they exist
    const theadRows = document.querySelectorAll('#TB_Table thead tr:not(.repeating-header)');
    let theadHTML = '';
    theadRows.forEach(tr => theadHTML += tr.outerHTML);

    const now = new Date();
    const printDate = now.toLocaleDateString('en-GB');
    const printTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const fmt = (n) => n === 0 ? '0' : n.toLocaleString('en-US');

    // 1. Pre-calculate grand totals for the entire report
    let sums = { od:0, oc:0, md:0, mc:0, ad:0, ac:0, cd:0, cc:0 };
    tbData.forEach(row => {
        sums.od += row.open.d; sums.oc += row.open.c; sums.md += row.mvt.d; sums.mc += row.mvt.c;
        sums.ad += row.adj.d; sums.ac += row.adj.c; sums.cd += row.close.d; sums.cc += row.close.c;
    });

    const totalPages = Math.ceil(tbData.length / ROWS_PER_PAGE);
    let allPagesHTML = '';

    // 2. Loop through the data in chunks to create distinct physical pages
    for (let i = 0; i < totalPages; i++) {
        const chunk = tbData.slice(i * ROWS_PER_PAGE, (i + 1) * ROWS_PER_PAGE);
        let rowsHTML = '';

        chunk.forEach(row => {
            rowsHTML += `<tr><td>${row.code}</td><td>${row.name}</td>`;
            if (currentTbCols === 8) {
                rowsHTML += `<td class="text-right">${fmt(row.open.d)}</td><td class="text-right">${fmt(row.open.c)}</td>
                             <td class="text-right bg-yellow">${fmt(row.mvt.d)}</td><td class="text-right bg-yellow">${fmt(row.mvt.c)}</td>
                             <td class="text-right">${fmt(row.adj.d)}</td><td class="text-right">${fmt(row.adj.c)}</td>
                             <td class="text-right">${fmt(row.close.d)}</td><td class="text-right">${fmt(row.close.c)}</td>`;
            } else if (currentTbCols === 6) {
                rowsHTML += `<td class="text-right">${fmt(row.open.d)}</td><td class="text-right">${fmt(row.open.c)}</td>
                             <td class="text-right bg-yellow">${fmt(row.mvt.d)}</td><td class="text-right bg-yellow">${fmt(row.mvt.c)}</td>
                             <td class="text-right">${fmt(row.close.d)}</td><td class="text-right">${fmt(row.close.c)}</td>`;
            } else if (currentTbCols === 4) {
                rowsHTML += `<td class="text-right">${fmt(row.open.d)}</td><td class="text-right">${fmt(row.open.c)}</td>
                             <td class="text-right">${fmt(row.close.d)}</td><td class="text-right">${fmt(row.close.c)}</td>`;
            } else {
                rowsHTML += `<td class="text-right">${fmt(row.close.d)}</td><td class="text-right">${fmt(row.close.c)}</td>`;
            }
            rowsHTML += `</tr>`;
        });

        // 3. Inject summary totals row only on the very last page
        if (i === totalPages - 1) {
            let totalsRow = `<tr class="font-bold"><td colspan="2">Total</td>`;
            if (currentTbCols === 8) {
                totalsRow += `<td class="text-right">${fmt(sums.od)}</td><td class="text-right">${fmt(sums.oc)}</td>
                             <td class="text-right bg-yellow">${fmt(sums.md)}</td><td class="text-right bg-yellow">${fmt(sums.mc)}</td>
                             <td class="text-right">${fmt(sums.ad)}</td><td class="text-right">${fmt(sums.ac)}</td>
                             <td class="text-right">${fmt(sums.cd)}</td><td class="text-right">${fmt(sums.cc)}</td>`;
            } else if (currentTbCols === 6) {
                totalsRow += `<td class="text-right">${fmt(sums.od)}</td><td class="text-right">${fmt(sums.oc)}</td>
                             <td class="text-right bg-yellow">${fmt(sums.md)}</td><td class="text-right bg-yellow">${fmt(sums.mc)}</td>
                             <td class="text-right">${fmt(sums.cd)}</td><td class="text-right">${fmt(sums.cc)}</td>`;
            } else if (currentTbCols === 4) {
                totalsRow += `<td class="text-right">${fmt(sums.od)}</td><td class="text-right">${fmt(sums.oc)}</td>
                             <td class="text-right">${fmt(sums.cd)}</td><td class="text-right">${fmt(sums.cc)}</td>`;
            } else {
                totalsRow += `<td class="text-right">${fmt(sums.cd)}</td><td class="text-right">${fmt(sums.cc)}</td>`;
            }
            totalsRow += `</tr>`;
            rowsHTML += totalsRow;
        }

        allPagesHTML += `
            <div class="page ${orientation}">
                <div class="doc-header">
                    <div style="width: 100px;"></div>
                    <div class="header-center">
                        <h2>BIAKA HOSPITAL</h2>
                        <h3>Adjusted Trial Balance for the Period..</h3>
                        <div class="red-line"></div>
                        <div class="sub-date">${formatDateLong(fromVal)} To ${formatDateLong(toVal)}.</div>
                    </div>
                    <div class="header-right">
                        <div>${printDate}</div>
                        <div>${printTime}</div>
                    </div>
                </div>

                <table>
                    <colgroup>${colgroupHTML}</colgroup>
                    <thead>${theadHTML}</thead>
                    <tbody>${rowsHTML}</tbody>
                </table>

                <div class="doc-footer">
                    <span>"Copyright(c)2022. Institute ERP PRO"</span>
                    <span>Page ${i + 1} of ${totalPages}</span>
                    <span>Powered by Kilimanjaro SYSTEMS Molyko Buea.</span>
                </div>
            </div>`;
    }

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <title>Trial Balance Print</title>
            <style>
                @page { size: A4 ${orientation}; margin: 0; }
                body { margin: 0; padding: 0; background: #525659; font-family: "Segoe UI", Tahoma, sans-serif; }
                .page {
                    background: #fff;
                    width: ${orientation === 'portrait' ? '21cm' : '29.7cm'};
                    min-height: ${orientation === 'portrait' ? '29.7cm' : '21cm'};
                    box-sizing: border-box;
                    padding: 1.5cm;
                    margin: 10px auto;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 0 10px rgba(0,0,0,0.5);
                }
                .doc-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
                .header-center { flex: 1; text-align: center; }
                .header-center h2 { margin: 0; font-size: 20px; color: #2e3192; text-transform: uppercase; }
                .header-center h3 { margin: 5px 0; font-size: 16px; color: #2e3192; font-weight: bold; }
                .red-line { border-top: 2px solid #cd2027; width: 80%; margin: 5px auto; }
                .sub-date { color: #cd2027; font-size: 13px; font-weight: bold; }
                .header-right { text-align: right; font-size: 11px; color: #333; }

                table { width: 100%; border-collapse: collapse; font-size: 11px; table-layout: fixed; margin-top: 15px; }
                th, td { border: 1px solid #000; padding: 4px 6px; vertical-align: middle; word-wrap: break-word; }
                th { background-color: #f0f0f0 !important; font-weight: bold; text-align: center; -webkit-print-color-adjust: exact; }
                .text-right { text-align: right !important; }
                .bg-yellow { background-color: #ffffcc !important; -webkit-print-color-adjust: exact; }
                .font-bold { font-weight: bold; background-color: #f9f9f9 !important; }

                .doc-footer {
                    margin-top: auto;
                    display: flex;
                    justify-content: space-between;
                    font-size: 10px;
                    border-top: 1px solid #ccc;
                    padding: 8px 0;
                }

                @media print {
                    body { background: none; }
                    .page { margin: 0; box-shadow: none; page-break-after: always; }
                    .page:last-child { page-break-after: auto; }
                }
            </style>
        </head>
        <body>
            ${allPagesHTML}
            <script>window.onload = function() { window.print(); window.close(); };</script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// Expose functions to the window object for HTML access
window.initReportTrialBalance = initReportTrialBalance;
window.changeTbFormat = changeTbFormat;
window.syncTbDates = syncTbDates;
window.printTrialBalanceReport = printTrialBalanceReport;
window.handleTbRowClick = handleTbRowClick;