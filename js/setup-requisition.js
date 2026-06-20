/**
 * js/setup-requisition.js
 * Handles Requisition Template management and A4 Printing.
 */

window.requisitionState = {
    lines: [],
    selectedIdx: 0
};

window.initSetupRequisition = function() {
    console.log("initSetupRequisition: Initializing...");

    // Populate Academic Year dropdown from global dataset
    const aySelect = document.getElementById('REQ_AcademicYear');
    if (aySelect && window.academicYears) {
        aySelect.innerHTML = window.academicYears.map(ay => 
            `<option value="${ay.name}" ${ay.id === 8 ? 'selected' : ''}>${ay.name}</option>`).join('');
    }

    // Set default date
    const dateInput = document.getElementById('PR_Date');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

    // Start with 8 empty rows (matching the image)
    window.requisitionState.lines = [];
    for(let i=0; i<8; i++) {
        window.requisitionState.lines.push({ desc: "", qty: "", price: "", total: 0 });
    }

    renderRequisitionTable();
};

window.addRequisitionRow = function() {
    window.requisitionState.lines.push({ desc: "", qty: "", price: "", total: 0 });
    renderRequisitionTable();
    // Scroll to bottom
    const container = document.querySelector('.req-table').parentElement;
    container.scrollTop = container.scrollHeight;
};

window.deleteRequisitionRow = function(idx) {
    if (window.requisitionState.lines.length <= 1) {
        // Just clear the line instead of deleting the last one
        window.requisitionState.lines[0] = { desc: "", qty: "", price: "", total: 0 };
    } else {
        window.requisitionState.lines.splice(idx, 1);
    }
    renderRequisitionTable();
};

window.updateReqLine = function(idx, field, value) {
    const line = window.requisitionState.lines[idx];
    if (field === 'qty') line.qty = value;
    if (field === 'price') line.price = value;
    if (field === 'desc') line.desc = value;

    // Recalculate Total
    const q = parseFloat(line.qty) || 0;
    const p = parseFloat(line.price) || 0;
    line.total = q * p;

    // Update display in total cell without full re-render for performance
    const totalCell = document.getElementById(`REQ_TOTAL_${idx}`);
    if (totalCell) totalCell.textContent = line.total > 0 ? line.total.toLocaleString() : "";
};

function renderRequisitionTable() {
    const tbody = document.getElementById('TB_RequisitionLines');
    if (!tbody) return;

    tbody.innerHTML = window.requisitionState.lines.map((l, i) => `
        <tr>
            <td style="text-align: center; font-weight: bold; background: #f0f0f0;">${i + 1}</td>
            <td><input type="text" class="req-input" value="${l.desc}" oninput="window.updateReqLine(${i}, 'desc', this.value)"></td>
            <td><input type="number" class="req-input text-center" value="${l.qty}" oninput="window.updateReqLine(${i}, 'qty', this.value)"></td>
            <td><input type="number" class="req-input text-right" value="${l.price}" oninput="window.updateReqLine(${i}, 'price', this.value)"></td>
            <td id="REQ_TOTAL_${i}" class="text-right" style="padding-right: 8px; font-weight: bold;">${l.total > 0 ? l.total.toLocaleString() : ''}</td>
            <td style="padding: 4px; text-align: center;"><button class="wd-btn danger" onclick="window.deleteRequisitionRow(${i}); event.stopPropagation();" style="padding: 2px 8px; font-size: 11px;"><i class="fa-solid fa-trash"></i> Delete</button></td>
        </tr>
    `).join('');
}

/**
 * Print Engine for Requisition Form (A4 Portrait)
 * Based on Print PDF.pdf
 */
window.printRequisitionForm = function() {
    const company = window.companyDetails || {};
    const academicYear = document.getElementById('REQ_AcademicYear').value;
    const date = new Date(document.getElementById('PR_Date').value).toLocaleDateString('en-GB');
    const data = window.requisitionState.lines.filter(l => l.desc.trim() !== "");

    if (data.length === 0) return showAlert("Please add at least one item to the requisition.", "error");

    const totalFigures = data.reduce((sum, l) => sum + l.total, 0);
    const totalWords = (typeof numberToWords === 'function' ? numberToWords(totalFigures) : totalFigures.toLocaleString()) + " FCFA";

    const rowsHTML = data.map((l, i) => `
        <tr>
            <td style="text-align: center;">${i + 1}</td>
            <td style="text-align: left; padding-left: 8px;">${l.desc}</td>
            <td style="text-align: center;">${l.qty}</td>
            <td style="text-align: right; padding-right: 5px;">${Number(l.price).toLocaleString()}</td>
            <td style="text-align: right; padding-right: 5px;">${l.total.toLocaleString()}</td>
        </tr>
    `).join('');

    // Pad with empty rows to fill space as seen in PDF
    const emptyRows = Array(Math.max(0, 15 - data.length)).fill('<tr><td>&nbsp;</td><td></td><td></td><td></td><td></td></tr>').join('');

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Print Requisition</title>
        <style>
            @page { margin: 1cm; }
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #eee; }
            .page { background: white; width: 21cm; min-height: 29.7cm; padding: 1cm 1.5cm; margin: 10px auto; box-sizing: border-box; display: flex; flex-direction: column; position: relative; }
            
            .doc-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2e3192; padding-bottom: 10px; margin-bottom: 10px; }
            .header-info { text-align: center; color: #333; }
            .header-info h2 { color: #2e3192; margin: 2px 0; font-size: 20px; }
            .logo { width: 80px; height: 80px; object-fit: contain; }

            .title-block { text-align: center; margin: 20px 0; }
            .title-block h1 { color: #2e3192; font-size: 24px; border-bottom: 2px solid #2e3192; display: inline-block; padding: 0 40px; margin-bottom: 15px; }

            .metadata-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 13px; margin-bottom: 15px; }
            .meta-item { border-bottom: 1px solid #333; display: flex; justify-content: space-between; padding: 4px 0; }
            .meta-item b { color: #333; }

            table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px; }
            th, td { border: 1px solid #000; padding: 6px 4px; }
            th { background: #f0f0f0; font-weight: bold; text-align: center; }

            .totals-section { margin-top: 10px; font-size: 13px; }
            .total-row { display: flex; align-items: baseline; margin-bottom: 5px; }
            .total-row label { font-weight: bold; width: 120px; }

            .signatures { margin-top: 30px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; text-align: center; font-size: 10px; }
            .sig-box { border-top: 1px solid #000; padding-top: 5px; min-height: 10px; display: flex; flex-direction: column; justify-content: space-between; }

            .footer { margin-top: auto; display: flex; justify-content: space-between; font-size: 9px; color: #666; border-top: 1px solid #ccc; padding-top: 5px; }
            
            .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 120px; color: rgba(0,0,0,0.03); font-weight: bold; pointer-events: none; z-index: 0; }

            @media print { body { background: none; } .page { margin: 0; box-shadow: none; } }
        </style>
    </head>
    <body>
        <div class="page">
            <div class="watermark">${company.abbreviation || 'BUIB'}</div>
            
            <div class="doc-header">
                <div style="text-align: left; font-size: 9px; width: 180px;">
                    REPUBLIC OF CAMEROON<br>Peace-Work-Fatherland Paix-Travail-Patrie<br>South West Region Region du Sud-Quest
                </div>
                <img src="${company.logoUrl || 'user.png'}" class="logo">
                <div style="text-align: right; font-size: 9px; width: 180px;">
                    EPUBIQUE DU CAMEROUN<br>P.O Box 77, Buea, Cameroon<br>Tel: ${company.phoneNumber || ''}
                </div>
            </div>

            <div class="header-info">
                <h2>${company.nameOfCompany || 'BIAKA UNIVERSITY INSTITUTE OF BUEA'}</h2>
                <div style="font-style: italic; font-weight: bold;">${company.slogan || ''}</div>
                <div style="font-size: 9px;">Email: ${company.email1 || ''} &nbsp; Website: ${company.websiteAddress || ''}</div>
            </div>

            <div class="title-block">
                <h1>NEW REQUISITION</h1>
            </div>

            <div class="metadata-grid">
                <div>
                    <div class="meta-item"><b>Requisition No:</b> <span>NEW</span></div>
                    <div class="meta-item"><b>Main Budget Head:</b> <span>____________________</span></div>
                    <div class="meta-item"><b>Sub Budget Head:</b> <span>____________________</span></div>
                    <div class="meta-item"><b>Department:</b> <span>ADMINISTRATION</span></div>
                </div>
                <div>
                    <div class="meta-item"><b>ACADEMIC YEAR:</b> <span>${academicYear}</span></div>
                    <div class="meta-item"><b>CODE:</b> <span> </span></div>
                    <div class="meta-item"><b>CODE:</b> <span> </span></div>
                    <div class="meta-item"><b>Date Requested:</b> <span>${date}</span></div>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th style="width: 40px;">S/N</th>
                        <th>DESCRIPTION</th>
                        <th style="width: 60px;">QTY</th>
                        <th style="width: 100px;">UNIT PRICE</th>
                        <th style="width: 120px;">TOTAL COST</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHTML}
                    ${emptyRows}
                </tbody>
            </table>

            <div class="totals-section">
                <div class="total-row"><label>Total in Figures:</label> <span style="font-weight: bold;">${totalFigures.toLocaleString()} FCFA</span></div>
                <div class="total-row"><label>Total in Word:</label> <span style="text-transform: uppercase;">${totalWords}</span></div>
                <div class="total-row" style="margin-top: 15px;"><label>Deliver to :</label> <span>__________________________________________________</span> <b style="margin-left: 20px;">Required Date of Delivery:</b> <span>__________</span></div>
            </div>

            <div class="signatures">
                <div class="sig-box"><div>Requested by:</div><div>(Procurement Manager)</div></div>
                <div class="sig-box"><div>Checked by:</div><div>(Accountant/Bursar)</div></div>
                <div class="sig-box"><div>Approved by:</div><div>(Financial Manager)</div></div>
                <div class="sig-box"><div>Authorized by:</div><div>(VC/DVD. Fin/Admin)</div></div>
            </div>

            <div class="footer">
                <span>Copyright(c)2022. Institute ERP PRO</span>
                <span>Powered by AfricRenov Group Sarl, Molyko Buea.</span>
            </div>
        </div>
        <script>
            window.onload = function() {
                setTimeout(() => { window.print(); window.close(); }, 500);
            }
        </script>
    </body>
    </html>
    `;

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
};