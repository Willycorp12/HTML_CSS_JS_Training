/**
 * JS for Approved Supplier Bills Screen
 */

// Local Sample Data extracted from Approved Supplier Bills.jpg
// Moved to file scope so handlers can access it
let approvedBillsData = [];

// Global store for payments of the currently selected bill
let currentBillPayments = [];

/**
 * Inject comprehensive button styles with hover effects
 */
function injectApprovedBillsButtonStyles() {
    if (document.getElementById('STYLE_ApprovedBillsButtons')) return;
    const style = document.createElement('style');
    style.id = 'STYLE_ApprovedBillsButtons';
    style.textContent = `
        /* Main Action Buttons */
        .wd-btn {
            padding: 6px 12px;
            border: none;
            border-radius: 3px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 12px;
        }

        .btn-act-modify {
            background-color: #2e7d32;
            color: white;
            border: 1px solid #1b5e20;
        }

        .btn-act-modify:hover {
            background-color: #ffffff;
            color: #1976d2;
            border-color: #1976d2;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .btn-act-view {
            background-color: #1976d2;
            color: white;
            border: 1px solid #1565c0;
        }

        .btn-act-view:hover {
            background-color: #ffffff;
            color: #2e7d32;
            border-color: #2e7d32;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .btn-act-payments {
            background-color: #f57c00;
            color: white;
            border: 1px solid #e65100;
        }

        .btn-act-payments:hover {
            background-color: #ffffff;
            color: #f57c00;
            border-color: #f57c00;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .btn-act-reverse {
            background-color: transparent;
            color: #cd2027;
            border: 1px solid #a01020;"
        }

        .btn-act-reverse:hover {
            background-color: #cd2027;
            color: white;
            border-color: #cd2027;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        /* Modal Action Buttons */
        .po-btn {
            padding: 8px 16px;
            border: 1px solid #999;
            border-radius: 3px;
            background-color: #f5f5f5;
            color: #333;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 13px;
        }

        .po-btn:hover {
            background-color: #ffffff;
            border-color: #666;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .po-btn-danger {
            background-color: #cd2027;
            color: white;
            border: 1px solid #a01020;
        }

        .po-btn-danger:hover {
            background-color: #ffffff;
            color: #cd2027;
            border-color: #cd2027;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
    `;
    document.head.appendChild(style);
}

window.initApprovedSupplierBills = async function() {
    // Inject button styles on initialization
    injectApprovedBillsButtonStyles();

    const table = document.getElementById('TABLE_ApprovedSupplierBills');
    const footerContainer = document.querySelector('.approved-bills-screen .report-footer');
    if (!table || !footerContainer) return;

    const tbody = table.querySelector('tbody');
    const motiveInput = document.getElementById('EDT_FilterMotive');
    const dateFrom = document.getElementById('DATE_ApprovedFrom');
    const dateTo = document.getElementById('DATE_ApprovedTo');
    const refreshBtn = document.getElementById('BTN_RefreshApproved');

    // Sync horizontal scrolling like Trial Balance
    const wrapper = table.closest('.table-scroll-wrapper');
    if (wrapper) {
        wrapper.addEventListener('scroll', () => {
            footerContainer.scrollLeft = wrapper.scrollLeft;
        });
    }

    // Set default dates for the filter
    const today = new Date();
    dateTo.value = today.toISOString().split('T')[0];
    const lastYear = new Date();
    lastYear.setFullYear(today.getFullYear() - 1);
    dateFrom.value = lastYear.toISOString().split('T')[0];

    async function loadData() {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align:center; padding:30px; font-style:italic;">Fetching approved records...</td></tr>';
        try {
            // Ensure Supplier data is loaded for ID -> Name resolution
            if (window.SupplierManager) await window.SupplierManager.ensureData();

            const resp = await apiFetch('/api/v1/payables/supplierBills/getApprovedSupplierBills?page=1&limit=50', { method: 'GET' });
            if (resp && resp.success && Array.isArray(resp.serviceBills)) {
                approvedBillsData = resp.serviceBills;
                filterAndRender();
            } else {
                tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:30px;">${resp.message || 'No approved records found.'}</td></tr>`;
                updateTotal(0);
            }
        } catch (e) {
            console.error(e);
            tbody.innerHTML = '<tr><td colspan="10" style="text-align:center; padding:30px; color:red;">Connection error.</td></tr>';
        }
    }

    function filterAndRender() {
        const q = motiveInput.value.toLowerCase();
        const from = dateFrom.value ? new Date(dateFrom.value) : null;
        const to = dateTo.value ? new Date(dateTo.value) : null;
        if (to) to.setHours(23, 59, 59, 999);

        const filtered = approvedBillsData.filter(item => {
            const matchesMotive = !q || 
                (item.remarks || item.description || "").toLowerCase().includes(q) || 
                (item.reference || "").toLowerCase().includes(q);
            const itemDate = new Date(item.orderDate);
            const matchesDate = (!from || itemDate >= from) && (!to || itemDate <= to);
            return matchesMotive && matchesDate;
        });
        render(filtered);
    }

    function render(data) {
        tbody.innerHTML = '';
        let runningTotal = 0;
        const fmt = (n) => Number(n).toLocaleString('en-US');

        data.forEach((item, idx) => {
            const tr = document.createElement('tr');
            const amount = Number(item.initialAmount || 0);
            runningTotal += amount;
            const paid = Number(item.amountPaid || 0);
            const balance = Number(item.amountLeft || 0);

            const d = new Date(item.orderDate);
            const dateStr = isNaN(d.getTime()) ? item.orderDate : d.toLocaleDateString('en-GB'); 

            // Resolve Vendor Name
            const vendorName = (window.SupplierManager && window.SupplierManager.data.mapById.get(Number(item.vendorId))) 
                               ? window.SupplierManager.data.mapById.get(Number(item.vendorId)).name 
                               : `Vendor #${item.vendorId}`;

            // Resolve User (Generated By)
            const generatedBy = item.userName || item.initiatedBy || (Number(item.usersId) === 1 ? 'Admin' : `User #${item.usersId}`);

            tr.innerHTML = `
                <td>${idx + 1}</td>
                <td>${dateStr}</td>
                <td>${item.reference || 'N/A'}</td>
                <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.remarks || item.description || 'N/A'}</td>
                <td>${vendorName}</td>
                <td class="text-right font-bold">${fmt(amount)}</td>
                <td class="text-right font-bold">${fmt(paid)}</td>
                <td class="text-right font-bold">${fmt(balance)}</td>
                <td>${generatedBy}</td>
                <td class="actions-cell" style="padding: 0 4px;">
                    <button class="wd-btn btn-act-modify" onclick="handleApprovedModify('${item.reference}')">Modify</button>
                    <button class="wd-btn btn-act-view" onclick="handleApprovedView('${item.reference}')">View</button>
                    <button class="wd-btn btn-act-payments" onclick="handleApprovedPayments('${item.reference}')">View Payments</button>
                </td>
            `;

            tr.addEventListener('click', (e) => {
                if (e.target.closest('button')) return;
                tbody.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
                tr.classList.add('selected');
            });
            tbody.appendChild(tr);
        });

        updateTotal(runningTotal);
    }

    function updateTotal(val) {
        document.getElementById('CELL_ApprovedTotal').textContent = Number(val).toLocaleString('en-US')+" FCFA";
    }

    motiveInput.addEventListener('input', filterAndRender);
    dateFrom.addEventListener('change', filterAndRender);
    dateTo.addEventListener('change', filterAndRender);
    refreshBtn.addEventListener('click', loadData);

    loadData();
};

/**
 * View Payments Modal Logic (View Payments.jpg)
 */
window.handleApprovedPayments = async function(ref) {
    const bill = approvedBillsData.find(b => b.reference === ref);
    if (!bill) return;

    let modal = document.getElementById('MODAL_SupplierPaymentDetails');
    if (!modal) {
        if (typeof injectPOModalStyles === 'function') injectPOModalStyles(); // Ensure base modal styles are present
        const html = `
        <div id="MODAL_SupplierPaymentDetails" class="po-modal-overlay" style="display:none; z-index: 10001; position: fixed;">
            <div class="po-modal" style="width: 1000px; max-width: 95vw;">
                <div class="po-modal-header" id="SPD_Header">
                    <span id="SPD_ModalTitle">Supplier Payment Details</span>
                    <span class="po-modal-close" onclick="closeSPDModal()">&times;</span>
                </div>
                <div class="po-modal-body" style="display:block; padding: 0;">
                    <div style="background: #f0f0f0; padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">
                        <h3 style="margin:0; color: #2e3192;">Supplier Bills Payment Details</h3>
                    </div>
                    <div style="max-height: 400px; overflow-y: auto;">
                        <table class="wd-table" style="width:100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #2e3192; color: white;">
                                    <th>SN</th><th>Ref</th><th>Date</th><th>Time</th><th>Description</th><th>Beneficiary</th><th class="text-right">Amount</th><th>Paid By</th><th>Take Actions</th>
                                </tr>
                            </thead>
                            <tbody id="SPD_Tbody"></tbody>
                        </table>
                    </div>
                    <div style="background: #fff; border-top: 2px solid #2e3192; padding: 8px 15px; font-weight: bold; display: flex; justify-content: space-between;">
                        <span>TOTAL</span>
                        <span id="SPD_Total" style="color: #2e3192; margin-right: 120px;">0</span>
                    </div>
                </div>
                <div class="po-modal-footer">
                    <button class="po-btn po-btn-danger" style="margin-left: auto;" onclick="closeSPDModal()">Close</button>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', html);
        modal = document.getElementById('MODAL_SupplierPaymentDetails');
        makeElementDraggable(modal.querySelector('.po-modal'), document.getElementById('SPD_Header'));
    }

    const tbody = document.getElementById('SPD_Tbody');
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:20px;">Fetching payment history...</td></tr>';
    document.getElementById('SPD_Total').textContent = '0 FCFA';
    modal.dataset.billRef = ref;
    modal.style.display = 'flex';

    try {
        const resp = await apiFetch(`/api/v1/payBills/getBillsPaidByID/${encodeURIComponent(ref)}`, { method: 'GET' });
        
        if (resp && resp.success && Array.isArray(resp.payments)) {
            currentBillPayments = resp.payments;
            tbody.innerHTML = '';
            let runningTotal = 0;

            currentBillPayments.forEach((p, idx) => {
                const amt = Number(p.amountPaid) || 0;
                runningTotal += amt;
                
                const tr = document.createElement('tr');
                tr.innerHTML = ` 
                    <td>${idx + 1}</td>
                    <td>${p.Reference || 'N/A'}</td>
                    <td>${p.paymentDate}</td>
                    <td>${p.time || p.date}</td>
                    <td>${p.description || 'N/A'}</td>
                    <td>${p.proposer || 'N/A'}</td>
                    <td class="text-right font-bold">${amt.toLocaleString()}</td>
                    <td>${p.generatedBy || 'N/A'}</td>
                    <td style="width: 10%;">
                    <button class="wd-btn btn-act-view" onclick="openBillVoucherViewModal(${p.id}, 'view')">View</button>
                    <button class="wd-btn btn-act-modify" onclick="openBillVoucherViewModal(${p.id}, 'modify')">Modify</button>
                    <button class="wd-btn btn-act-reverse" onclick="openBillVoucherViewModal(${p.id}, 'reverse')">
                        <i class="fa-solid fa-rotate-left" style="font-size: 12px; color: #cd2027;"></i>
                    </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            document.getElementById('SPD_Total').textContent = runningTotal.toLocaleString()+" FCFA";
        } else {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:20px;">${resp.message || 'No payment records found.'}</td></tr>`;
        }
    } catch (e) {
        console.error(e);
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:20px; color:red;">Error connecting to payment service.</td></tr>';
    }
};

window.closeSPDModal = () => {
    const modal = document.getElementById('MODAL_SupplierPaymentDetails');
    if (modal) modal.style.display = 'none';
};

window.refreshSupplierPaymentsModal = async function() {
    const modal = document.getElementById('MODAL_SupplierPaymentDetails');
    if (!modal || modal.style.display !== 'flex') return;
    const ref = modal.dataset.billRef;
    if (!ref) return;

    if (typeof window.handleApprovedPayments === 'function') {
        await window.handleApprovedPayments(ref);
    }
};

/**
 * Voucher View Modal Logic extracted from View button.jpg
 */
window.openBillVoucherViewModal = async function(paymentId, mode = 'view') {
    let displayAmt, date, vendorName, description, voucherRef, paidBy, paymentMethodCoaId, transType;

    if (paymentId) { // If opened from a specific payment record
        // Scoped to payment record from history table
        const p = currentBillPayments.find(pay => pay.id === paymentId);
        if (!p) return;
        displayAmt = Number(p.amountPaid) || 0;
        date = p.paymentDate;
        vendorName = p.proposer || 'N/A';
        description = p.description || 'N/A';
        voucherRef = p.Reference;
        paidBy = p.generatedBy || 'Admin';
        paymentMethodCoaId = p.paymentModeCoaId;
        transType = p.transactionType || 'N/A';
    }

    let modal = document.getElementById('MODAL_BillVoucherView');
    if (!modal) {
        const html = `
        <div id="MODAL_BillVoucherView" class="po-modal-overlay" style="display:none; z-index: 10002; position: fixed;">
            <div class="po-modal" style="width: 750px; background: #fff;">
                <div class="po-modal-header" id="BVV_Header">
                    <span>Supplier Bills Payment Details</span>
                    <span class="po-modal-close" onclick="closeBVVModal()">&times;</span>
                </div>
                <div class="po-modal-body" style="display:block; padding: 25px; position: relative;">
                    <div style="text-align: center; border-bottom: 2px solid #2e3192; padding-bottom: 10px; margin-bottom: 20px;">
                        <h1 id="BVV_BodyHeader" style="margin: 0; color: #2e3192; font-size: 28px; letter-spacing: 2px;">VIEW PAYMENT DETAILS</h1>
                    </div>
                    
                    <div style="display: flex; gap: 30px;">
                        <div id="BVV_BillTransType" style="display:none;"></div> <!-- Empty space -->
                        <div style="flex: 1;">
                            <div class="amount-section" style="margin-top: 0%;">
                                <label>Amount</label>
                                <div class="amount-editable">
                                <input type="text" id="BVV_Amount" class="amount-input" inputmode="numeric" autocomplete="off" style="max-width: 100%; min-width: 60px; transition: width 0.1s;" spellcheck="false" placeholder="0" />
                                <span class="fcfa-label">FCFA</span>
                                </div>
                            <div class="amount-words" style="font-size: large; margin-top: 20px;" id="BVV_Words">Amount in words</div>
                            </div>
                            <div class="form-group">
                                <label>Description</label>
                                <textarea id="BVV_Justif" class="po-textarea" placeholder="Description of the payment..."></textarea>
                            </div>
                        </div>

                        <div style="width: 220px; display: flex; flex-direction: column; gap: 10px; align-items: end;">
                            <div class="order-date-box" style="width: 220px;"><div class="order-date-title">Reference #</div><input type="text" id="BVV_Ref" class="order-date-input" readonly></div>
                            <div class="order-date-box" style="width: 220px;"><div class="order-date-title">Payment Date</div><input type="date" id="BVV_PayDate" class="order-date-input"></div>
                            <div class="order-date-box" style="width: 220px;"><div class="order-date-title">Paid By</div><input type="text" id="BVV_PaidBy" class="order-date-input"></div>
                            <div class="order-date-box" style="width: 220px;"><div class="order-date-title">To</div><input type="text" id="BVV_To" class="order-date-input" readonly style="pointer: default;"></div>
                            <div class="order-date-box" style="width: 220px;"><div class="order-date-title">Payment Method</div><input type="text" id="BVV_PaymentMethod" class="order-date-input" readonly></div>
                        </div>
                    </div>
                </div>
                <div class="po-modal-footer" style="background: #f9f9f9;">
                    <button class="po-btn" id="BVV_BtnRePrint" onclick="printBillVoucher()" title="Print this payment order"><i class="fa-solid fa-print"></i> Re-Print</button>
                    <button class="po-btn po-btn-primary" id="BVV_BtnUpdate" style="display:none;" onclick="submitBillVoucherUpdate()">Update</button>
                    <button class="po-btn po-btn-primary" id="BVV_BtnUpdatePrint" style="display:none;" onclick="submitBillVoucherUpdate(true)">Update & Print</button>
                    <button class="po-btn po-btn-danger" id="BVV_BtnRevert" style="display:none;" onclick="submitBillVoucherRevert()">Revert</button>
                    <button class="po-btn po-btn-danger" id="BVV_BtnClose" onclick="closeBVVModal()" style="margin-left: auto;"><i class="fa-solid fa-xmark"></i> Close</button>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', html);
        modal = document.getElementById('MODAL_BillVoucherView');
        makeElementDraggable(modal.querySelector('.po-modal'), document.getElementById('BVV_Header'));

        // Setup Amount Words Listener
        const amountInput = document.getElementById('BVV_Amount');
        const wordsDiv = document.getElementById('BVV_Words');
        amountInput.addEventListener('input', () => {
            // Auto-adjust width based on content length
            amountInput.style.width = '60px'; 
            amountInput.style.width = (amountInput.value.length * 30 + 20) + 'px';

            const val = parseInt(amountInput.value.replace(/[^0-9]/g, '')) || 0;
            wordsDiv.textContent = val > 0 ? window.numberToWords(val) + " FCFA" : "Amount in words";
        });

        // Setup Payment Method Account Picker
        const paymentMethodInput = document.getElementById('BVV_PaymentMethod');
        if (paymentMethodInput) {
            paymentMethodInput.addEventListener('click', () => {
                if (paymentMethodInput.readOnly) return; // Only open if editable
                if (window.AccountPicker) {
                    window.AccountPicker.open({
                        title: "Select Payment Method (Funding Source)",
                        targetClasses: ["CLASS 5"], // Only show cash/bank accounts
                        allowClear: false,
                        onSelect: (acc) => {
                            if (acc) {
                                paymentMethodInput.value = acc.name; // Display only the name
                                paymentMethodInput.dataset.id = acc.id; // Store the ID
                            }
                        }
                    });
                }
            });
        }
    }

    // Store paymentId and mode in dataset for later use
    modal.dataset.paymentId = paymentId;
    modal.dataset.mode = mode;

    // Get elements
    const bodyHeader = document.getElementById('BVV_BodyHeader');
    const transTypeDiv = document.getElementById('BVV_BillTransType');
    const amountInput = document.getElementById('BVV_Amount');
    const wordsDiv = document.getElementById('BVV_Words');
    const descriptionTextarea = document.getElementById('BVV_Justif');
    const paymentDateInput = document.getElementById('BVV_PayDate');
    const paidByInput = document.getElementById('BVV_PaidBy');
    const toInput = document.getElementById('BVV_To');
    const refInput = document.getElementById('BVV_Ref');
    const paymentMethodInput = document.getElementById('BVV_PaymentMethod');

    const btnRePrint = document.getElementById('BVV_BtnRePrint');
    const btnUpdate = document.getElementById('BVV_BtnUpdate');
    const btnUpdatePrint = document.getElementById('BVV_BtnUpdatePrint');
    const btnRevert = document.getElementById('BVV_BtnRevert');
    const btnClose = document.getElementById('BVV_BtnClose');

    // Set initial values
    amountInput.value = displayAmt.toLocaleString();
    // Initial width trigger
    amountInput.style.width = '60px'; 
    amountInput.style.width = (amountInput.value.length * 30 + 20) + 'px';

    wordsDiv.textContent = window.numberToWords ? window.numberToWords(displayAmt) + " FCFA" : "Amount in words";
    toInput.value = vendorName;
    descriptionTextarea.value = description;
    paymentDateInput.value = date ? date.split('T')[0] : '';
    paidByInput.value = paidBy;
    refInput.value = voucherRef;
    transTypeDiv.textContent = transType || 'N/A';
    // Set payment method display and ID
    if (paymentMethodCoaId && window.AccountPicker) {
        await window.AccountPicker.ensureData();
        const account = window.AccountPicker.data.mapById.get(Number(paymentMethodCoaId));
        if (account) {
            paymentMethodInput.value = account.name;
            paymentMethodInput.dataset.id = account.id;
        } else {
            paymentMethodInput.value = 'N/A';
            paymentMethodInput.dataset.id = '';
        }
    } else {
        paymentMethodInput.value = 'N/A';
        paymentMethodInput.dataset.id = '';
    }

    // Apply mode-specific changes
    let isEditable = false;
    if (mode === 'view') {
        bodyHeader.textContent = "VIEW PAYMENT DETAILS";
        btnRePrint.style.display = 'inline-block';
        btnUpdate.style.display = 'none';
        btnUpdatePrint.style.display = 'none';
        btnRevert.style.display = 'none';
    } else if (mode === 'modify') {
        bodyHeader.textContent = "MODIFY PAYMENT DETAILS";
        isEditable = true;
        btnRePrint.style.display = 'none';
        btnUpdate.style.display = 'inline-block';
        btnUpdatePrint.style.display = 'inline-block';
        btnRevert.style.display = 'none';
    } else if (mode === 'reverse') {
        bodyHeader.textContent = "REVERSE PAYMENT";
        btnRePrint.style.display = 'inline-block';
        btnUpdate.style.display = 'none';
        btnUpdatePrint.style.display = 'none';
        btnRevert.style.display = 'inline-block';
    }

    // Set editability of fields
    amountInput.readOnly = !isEditable;
    amountInput.style.background = isEditable ? '#fff' : '#eee';
    descriptionTextarea.readOnly = !isEditable;
    descriptionTextarea.style.background = isEditable ? '#fff' : '#eee';
    paymentDateInput.readOnly = !isEditable;
    paymentDateInput.style.background = isEditable ? '#fff' : '#eee';
    paidByInput.readOnly = !isEditable;
    paidByInput.style.background = isEditable ? '#fff' : '#eee';
    
    toInput.style.background = isEditable ? '#fff' : '#eee';
    toInput.style.cursor = isEditable ? 'pointer' : 'default';

    paymentMethodInput.readOnly = !isEditable;
    paymentMethodInput.style.background = isEditable ? '#fff' : '#eee';
    paymentMethodInput.style.cursor = isEditable ? 'pointer' : 'default';

    // Ensure the modal is explicitly displayed
    modal.style.display = 'flex';
};

window.closeBVVModal = () => {
    const modal = document.getElementById('MODAL_BillVoucherView');
    if (modal) modal.style.display = 'none';
};

window.printBillVoucher = function() {
    const modal = document.getElementById('MODAL_BillVoucherView');
    const paymentId = modal.dataset.paymentId;

    let dataToPrint;
    if (paymentId) {
        const p = currentBillPayments.find(pay => pay.id === parseInt(paymentId));
        if (!p) return;
        dataToPrint = {
            date: p.paymentDate,
            amount: Number(p.amountPaid) || 0,
            amountInWords: window.numberToWords ? window.numberToWords(Number(p.amountPaid) || 0) + " FCFA" : "Amount in words",
            to: p.proposer || 'N/A',
            justification: p.description || 'N/A',
            paymentOrderNo: p.Reference,
            paidBy: p.generatedBy || 'Admin'
        };
    }
    if (dataToPrint) {
        generateAndPrintPayBillVoucher(dataToPrint);
    } else {
        showAlert("No data available to print.", "error");
    }
};

window.submitBillVoucherUpdate = async function(print = false) {
    const modal = document.getElementById('MODAL_BillVoucherView');

    const transType = document.getElementById('BVV_BillTransType').textContent;
    const amount = parseInt(document.getElementById('BVV_Amount').value.replace(/[^0-9]/g, '')) || 0;
    const description = document.getElementById('BVV_Justif').value;
    const paymentDate = document.getElementById('BVV_PayDate').value;
    const paymentMethodCoaId = document.getElementById('BVV_PaymentMethod').dataset.id;

    if (amount <= 0 || !description || !paymentDate || !paymentMethodCoaId) {
        showAlert("Please fill all required fields (Amount, Description, Payment Date, Payment Method).", "error");
        return;
    }

    const payload = {
        paymentDate: paymentDate,
        amountPaid: amount,
        description: description,
        paymentModeCoaId: parseInt(paymentMethodCoaId)
    };

    showConfirmModal({
        title: "Confirm Update",
        message: "Are you sure you want to update this payment record?",
        onOk: async () => {
            try {
                // Placeholder API call
                const resp = await apiFetch(`/api/v1/payBills/modifyPayBills/${encodeURIComponent(transType)}`, { method: 'PUT', body: payload });
                if (resp && resp.success) {
                    showAlert("Payment updated successfully!", "success");
                    if (print) printBillVoucher();
                    closeBVVModal();
                    if (typeof window.refreshSupplierPaymentsModal === 'function') {
                        await window.refreshSupplierPaymentsModal();
                    }
                    window.initApprovedSupplierBills(); // Refresh main table
                } else {
                    showAlert(resp.message || "Failed to update payment.", "error");
                }
            } catch (e) {
                showAlert("Error updating payment: " + e.message, "error");
            }
        }
    });
};

window.submitBillVoucherRevert = function() {
    showConfirmModal({
        title: "Confirm Revert Transaction",
        message: "Are you sure you want to REVERT this payment? This action cannot be undone.",
        okText: "Revert Now",
        onOk: async () => {
            const transType = document.getElementById('BVV_BillTransType')?.textContent;
            if (!transType || transType === 'N/A') {
                showAlert('Revert failed: missing transaction type.', 'error');
                return;
            }

            try {
                const resp = await apiFetch(`/api/v1/payBills/reversePayBills/${encodeURIComponent(transType)}`, {
                    method: 'PUT',body: {}
                });

                if (resp && resp.success) {
                    showAlert(resp.message || 'Payment reversed successfully!', 'success');
                    closeBVVModal();
                    if (typeof window.refreshSupplierPaymentsModal === 'function') {
                        await window.refreshSupplierPaymentsModal();
                    }
                    window.initApprovedSupplierBills(); // Refresh main table
                } else {
                    showAlert(resp.message || 'Failed to reverse payment.', 'error');
                }
            } catch (e) {
                showAlert('Error reversing payment: ' + e.message, 'error');
            }
        }
    });
};

window.handleApprovedModify = function(ref) {
    if (!ref) return;
    if (typeof window.handleServiceBillModify === 'function') {
        window.handleServiceBillModify({ reference: ref }, window.initApprovedSupplierBills, 'update');
    }
};

window.handleApprovedView = function(ref) {
    if (!ref) return;
    if (typeof window.handleServiceBillModify === 'function') {
        window.handleServiceBillModify({ reference: ref }, null, 'view');
    }
};

if (document.readyState === 'complete') {
    window.initApprovedSupplierBills();
}