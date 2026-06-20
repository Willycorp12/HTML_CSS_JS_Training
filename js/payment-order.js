// js/payment-order.js

/**
 * A helper function to format dates and amounts consistently.
 */
function formatValue(value, type = 'string') {
    if (value === null || value === undefined) {
        return '';
    }
    switch (type) {
        case 'date':
            const d = new Date(value);
            return isNaN(d.getTime()) ? value : d.toLocaleDateString('en-GB');
        case 'currency':
            return Number(value).toLocaleString('en-US') + ' FCFA';
        default:
            return value;
    }
}

/**
 * Generic handler for workflow actions (Approve, Reject, Pay, Delete)
 */
async function handleWorkflowAction(action, requisitionID, refreshCallback) {
    if (!requisitionID) {
        showAlert("Error: Invalid Requisition ID", 'error');
        return;
    }

    const confirmMsg = {
        'approve': "Are you sure you want to APPROVE this requisition?",
        'reject': "Are you sure you want to REJECT this requisition?",
        'pay': "Are you sure you want to PAY this requisition?",
        'delete': "Are you sure you want to DELETE this requisition?"
    };

    showConfirmModal({
        title: "Workflow Confirmation",
        message: confirmMsg[action] || "Are you sure you wish to proceed?",
        onOk: async () => {
            let endpoint = '';
            let method = 'POST';
            let body = { requisitionID: requisitionID };

            switch (action) {
                case 'approve': 
                    endpoint = `/api/v1/paymentOrders/approvePendingPayment/${requisitionID}`;
                    method = 'PUT';
                    break;
                case 'reject': 
                    endpoint = `/api/v1/paymentOrders/rejectRequisition/${requisitionID}`;
                    method = 'PUT';
                    break;
                case 'pay': endpoint = `/api/v1/paymentOrders/validatePaymentOrder/${requisitionID}`;
                    method = 'PUT';
                    break;
                case 'delete':
                    endpoint = `/api/v1/paymentOrders/deleteRequisition/${requisitionID}`; 
                    method = 'DELETE'; 
                    body = null; 
                    break;
            }

            try {
                if (typeof apiFetch === 'undefined') throw new Error("apiFetch is missing.");
        const resp = await apiFetch(endpoint, { method, body });
        if (resp && resp.success) {
            showAlert(`Action '${action}' completed successfully.`, 'success');
            if (refreshCallback) refreshCallback();
        } else {
            showAlert((resp && resp.message) ? resp.message : `Failed to ${action} item.`, 'error');
        }
    } catch (e) {
        console.error(e);
        showAlert("Error: " + e.message, 'error');
            }
        }
    });
}

/**
 * Deletes a service bill using the transaction reference.
 */
async function handleServiceBillDelete(transactionType, refreshCallback) {
    if (!transactionType) {
        showAlert("Error: Invalid transaction reference.", 'error');
        return;
    }

    showConfirmModal({
        title: "Delete Service Bill",
        message: `Are you sure you want to DELETE this service bill (${transactionType})? This operation CANNOT be reversed.`,
        okText: "Delete Now",
        onOk: async () => {
            try {
                const resp = await apiFetch(`/api/v1/payables/supplierBills/deleteSupplierBills/${encodeURIComponent(transactionType)}`, {
                    method: 'DELETE'
                });
                if (resp && resp.success) {
                    showAlert("Service bill deleted successfully.", 'success');
                    if (refreshCallback) refreshCallback();
                } else {
                    showAlert((resp && resp.message) ? resp.message : "Failed to delete service bill.", 'error');
                }
            } catch (e) {
                console.error(e);
                showAlert("Error: " + e.message, 'error');
            }
        }
    });
}

/**
 * Helper to make an element draggable (reused logic)
 */
function makeElementDraggable(el, handle) {
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    handle.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        
        const rect = el.getBoundingClientRect();
        // Set absolute position to current visual position to prevent jumping
        el.style.position = 'absolute';
        el.style.left = rect.left + 'px';
        el.style.top = rect.top + 'px';
        el.style.margin = '0';
        
        initialLeft = rect.left;
        initialTop = rect.top;
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        e.preventDefault(); // Prevent text selection
    });

    function onMouseMove(e) {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        el.style.left = `${initialLeft + dx}px`;
        el.style.top = `${initialTop + dy}px`;
    }

    function onMouseUp() {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
}

/**
 * Injects shared modal styles into the document head.
 * This is done once to support multiple modals using the same style.
 */
function injectPOModalStyles() {
    if (document.getElementById('po-modal-styles')) return;

    const style = document.createElement('style');
    style.id = 'po-modal-styles';
    style.innerHTML = `
        .po-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: none; align-items: center; justify-content: center; z-index: 10001; }
        .po-modal { width: 850px; max-width: 95vw; background: #f0f0f0; border: 1px solid #888; box-shadow: 0 5px 15px rgba(0,0,0,0.3); display: flex; flex-direction: column; border-radius: 4px; }
        .po-modal-header { background: #2e3192; color: white; padding: 10px 15px; font-weight: bold; font-size: 14px; display: flex; justify-content: space-between; align-items: center; cursor: move; border-top-left-radius: 4px; border-top-right-radius: 4px; }
        .po-modal-close { cursor: pointer; font-size: 20px; color: #fff; opacity: 0.8; }
        .po-modal-close:hover { opacity: 1; }
        .po-modal-body {background: #fff;}
        .side-summary { padding: 0px; gap: 2px; border: none; margin-top: 2px; }
        .net-amount { position: relative; }
        .dynamical { font-weight: bold; align-self: flex-end; }
        .po-modal-footer { padding: 6px 12px; background: #f0f0f0; border-top: 1px solid #ddd; text-align: right; border-bottom-left-radius: 4px; border-bottom-right-radius: 4px; }
        .md-btn { padding: 8px 20px; border: 1px solid transparent; cursor: pointer; font-size: 13px; margin-left: 10px; font-weight: bold; }
        .md-btn-primary { background: #2e3192; color: #fff; }
        .md-btn-danger { background: #cd2027; color: #fff; }
    `;
    document.head.appendChild(style);
}

/**
 * Injects the Modify Modal HTML and CSS into the page if not present.
 */
function injectModifyModal() {
    if (document.getElementById('MODAL_ModifyPaymentOrder')) return;

    // 1. Inject CSS
    const style = document.createElement('style');
    style.innerHTML = `
        .po-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: none; align-items: center; justify-content: center; z-index: 10001; }
        .po-modal { width: 850px; max-width: 95vw; background: #f0f0f0; border: 1px solid #888; box-shadow: 0 5px 15px rgba(0,0,0,0.3); display: flex; flex-direction: column; border-radius: 4px; }
        .po-modal-header { background: #2e3192; color: white; padding: 10px 15px; font-weight: bold; font-size: 14px; display: flex; justify-content: space-between; align-items: center; cursor: move; border-top-left-radius: 4px; border-top-right-radius: 4px; }
        .po-modal-close { cursor: pointer; font-size: 20px; color: #fff; opacity: 0.8; }
        .po-modal-close:hover { opacity: 1; }
        .po-modal-body { padding: 20px; background: #fff; display: flex; gap: 20px; }
        
        /* Layout similar to bank-deposits.html */
        .po-form-main { flex: 2; display: flex; flex-direction: column; gap: 15px; }
        .po-form-side { flex: 1; display: flex; flex-direction: column; gap: 15px; max-width: 280px; background: #f9f9f9; padding: 15px; border: 1px solid #eee; }
        
        .po-group { display: flex; flex-direction: column; gap: 5px; }
        .po-group label { font-size: 12px; font-weight: bold; color: #333; }
        .po-input { padding: 8px; border: 1px solid #ccc; border-radius: 0; font-size: 13px; width: 100%; box-sizing: border-box; }
        .po-textarea { padding: 8px; border: 1px solid #ccc; border-radius: 0; font-size: 13px; width: 100%; box-sizing: border-box; resize: vertical; height: 80px; }
        
        .po-amount-box { display: flex; align-items: center; border: 1px solid #ccc; padding: 5px; background: #fff; }
        .po-amount-input { border: none; outline: none; font-size: 18px; font-weight: bold; flex: 1; text-align: right; padding-right: 5px; color: #2e3192; }
        .po-amount-words { font-size: 13px; color: #2e3192; font-style: italic; margin-top: 4px; font-weight: bold; text-align: right; }
        
        .po-modal-footer { padding: 12px 20px; background: #f0f0f0; border-top: 1px solid #ddd; text-align: right; border-bottom-left-radius: 4px; border-bottom-right-radius: 4px; }
        .po-btn { padding: 8px 20px; border: 1px solid transparent; cursor: pointer; font-size: 13px; margin-left: 10px; font-weight: bold; }
        .po-btn-primary { background: #2e3192; color: #fff; }
        .po-btn-danger { background: #cd2027; color: #fff; }
        .po-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    `;
    document.head.appendChild(style);

    // 2. Inject HTML
    const html = `
        <div class="po-modal" id="PO_MODAL_CONTENT">
            <div class="po-modal-header" id="PO_MODAL_HEADER">
                <span>Modify Payment Order</span>
                <span class="po-modal-close" onclick="closeModifyModal()">&times;</span>
            </div>
            <div class="po-modal-body">
                <!-- Left Main -->
                <div class="po-form-main">
                    <div class="po-group">
                        <label>Account</label>
                        <input type="text" id="mod-account-search" class="po-input" placeholder="Click to select an account" readonly style="cursor:pointer; background:#fff;">
                    </div>
                    <div class="po-group">
                    <div class="amount-section">
                    <label for="po-amount">Amount</label>
                    <div class="amount-editable">
                    <input type="text" id="mod-amount" class="amount-input" inputmode="numeric" autocomplete="off" spellcheck="false" placeholder="0">
                    <span class="fcfa-label">FCFA</span></div>
                    <div class="amount-words" id="mod-amount-words">Amount in words</div>
                    </div>

                    </div>
                    <div class="po-group">
                        <label>Receiver</label>
                        <input type="text" id="mod-receiver" class="po-input" placeholder="Receiver Name">
                    </div>
                    <div class="po-group">
                        <label>Position</label>
                        <input type="text" id="mod-position" class="po-input" placeholder="Position">
                    </div>
                    <div class="po-group">
                        <label>Justification</label>
                        <textarea id="mod-justification" class="po-textarea" placeholder="Reason for payment..."></textarea>
                    </div>
                </div>
                <!-- Right Side -->
                <div class="po-form-side">
                    <div class="po-group">
                        <label>Reference</label>
                        <input type="text" id="mod-ref" class="po-input" disabled style="background:#eee; font-weight:bold;">
                    </div>
                    <div class="po-group">
                        <label>Invoice Date</label>
                        <input type="date" id="mod-invoice-date" class="po-input">
                    </div>
                    <div class="po-group">
                        <label>Payment Date</label>
                        <input type="date" id="mod-payment-date" class="po-input">
                    </div>
                    <div class="po-group" id="mod-payment-mode-group" style="display:none;">
                        <label>Mode of Payment</label>
                        <input type="text" id="mod-payment-mode" class="po-input" placeholder="Click to select payment method" readonly style="cursor:pointer; background:#fff;">
                    </div>
                    <div class="po-group">
                        <div class="side-summary" style="width:100%; display:flex; flex-direction:column; gap:1px; margin-top:6px; border-top:1px solid #eee;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <div class="net-amount" style="color:#008300; font-weight:800;">Bill:</div>
                                <div class="dynamical" id="mod-bill" style="color:#008300; font-weight:700;">0 FCFA</div>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <div class="net-amount" style="color:#ff0d0d; font-weight:800;">
                                    AIT (5.5%): <input id="mod-inc-ait" type="checkbox" style="vertical-align:middle; margin-left:4px;"/>
                                </div>
                                <div class="dynamical" id="mod-ait" style="color:#ff0d0d; font-weight:700;">0 FCFA</div>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center; solid #ccc; padding-top:8px;">
                                <div class="net-amount" style="font-weight:800;">Net:</div>
                                <div class="dynamical" id="mod-net" style="font-weight:800;">0 FCFA</div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <div class="po-modal-footer">
                <button class="po-btn po-btn-primary" id="btn-mod-save" onclick="submitModification()">Save Changes</button>
                <button class="po-btn po-btn-primary" id="btn-mod-pay" onclick="submitPay(false)" style="display:none;">Pay</button>
                <button class="po-btn po-btn-primary" id="btn-mod-pay-print" onclick="submitPay(true)" style="display:none;">Pay & Print</button>
                <button class="po-btn po-btn-danger" onclick="closeModifyModal()">Close</button>
            </div>
        </div>
    `;
    
    const overlay = document.createElement('div');
    overlay.id = 'MODAL_ModifyPaymentOrder';
    overlay.className = 'po-modal-overlay';
    overlay.innerHTML = html;
    document.body.appendChild(overlay);

    // 3. Setup Draggable
    makeElementDraggable(document.getElementById('PO_MODAL_CONTENT'), document.getElementById('PO_MODAL_HEADER'));

    // Setup Account Picker for the new input, ensuring it only runs once
    const accountInput = document.getElementById('mod-account-search');
    if (accountInput && !accountInput.dataset.pickerInitialized) {
        accountInput.dataset.pickerInitialized = "true";
        accountInput.addEventListener('click', () => {
            if (window.AccountPicker) {
                window.AccountPicker.open({
                    title: "Select Account",
                    targetClasses: ["CLASS 6", "CLASS 8"],
                    allowClear: false, // Not clearable in modification
                    onSelect: (acc) => {
                        accountInput.value = acc ? `${acc.code} - ${acc.name}` : "";
                        accountInput.dataset.id = acc ? acc.id : "";
                        const justif = document.getElementById('mod-justification');
                        if (justif) justif.value = acc ? "Payment for " + acc.name : "";
                    }
                });
            }
        });
    }

    const paymentModeInput = document.getElementById('mod-payment-mode');
    if (paymentModeInput && !paymentModeInput.dataset.pickerInitialized) {
        paymentModeInput.dataset.pickerInitialized = "true";
        paymentModeInput.addEventListener('click', () => {
            if (paymentModeInput.disabled) return;

            if (window.AccountPicker) {
                window.AccountPicker.open({
                    title: "Select Mode of Payment (Funding Source)",
                    targetClasses: ["CLASS 5"], // Only show cash/bank accounts
                    allowClear: false,
                    onSelect: (acc) => {
                        if (acc) {
                            paymentModeInput.value = acc.name; // Display only the name
                            paymentModeInput.dataset.id = acc.id; // Store the ID
                        }
                    }
                });
            }
        });
    }

    // 4. Setup Amount Words & Summary Listener
    const amtInput = document.getElementById('mod-amount');
    const incAitCheck = document.getElementById('mod-inc-ait');

    function updateModifyModalSummary() {
        if (!amtInput || !incAitCheck) return;

        const billAmount = parseInt(amtInput.value.replace(/[^0-9]/g, ''), 10) || 0;
        
        const billEl = document.getElementById('mod-bill');
        const aitEl = document.getElementById('mod-ait');
        const netEl = document.getElementById('mod-net');
        const wordsDiv = document.getElementById('mod-amount-words');

        if (billEl) billEl.textContent = billAmount.toLocaleString('en-US') + " FCFA";
        
        const aitValue = incAitCheck.checked ? billAmount * 0.055 : 0;
        if (aitEl) aitEl.textContent = aitValue.toLocaleString('en-US', {maximumFractionDigits: 0}) + " FCFA";
        
        const netValue = Math.round(billAmount - aitValue);
        if (netEl) netEl.textContent = netValue.toLocaleString('en-US', {maximumFractionDigits: 0}) + " FCFA";

        if (wordsDiv) {
            if (typeof numberToWords === 'function') {
                wordsDiv.textContent = netValue > 0 ? numberToWords(netValue) + " FCFA" : "Amount in words";
            } else {
                wordsDiv.textContent = netValue > 0 ? netValue.toLocaleString('en-US') + " FCFA" : "Amount in words";
            }
        }
    }

    if (amtInput) amtInput.addEventListener('input', updateModifyModalSummary);
    if (incAitCheck) incAitCheck.addEventListener('change', updateModifyModalSummary);
}

/**
 * Handles loading a requisition into the modal for modification.
 */
function handleModify(data, refreshCallback) {
    // 1. Validate data
    if (!data || typeof data !== 'object') {
        console.error("handleModify: Expected a record object, got:", data);
        showAlert("Error: Unable to modify. Record data is missing.", 'error');
        return;
    }

    // 2. Normalize/Map data if necessary (handling potential field differences from list endpoints)
    // The modal expects: requisitionID, chartOfAccountsId, amount, proposer, position, subject, invoiceDate, paymentDate, paymentOrderNo, aitStatus
    const mappedData = {
        ...data,
        // Ensure amount is available. List endpoints might return 'netAmount' or 'totalBT' depending on the view.
        // We prefer 'amount' if it exists, otherwise fallback.
        amount: (data.amount !== undefined && data.amount !== null) ? data.amount : (data.grossAmount || 0),
        
        // Ensure ID is accessible
        requisitionID: data.requisitionID || data.id
    };

    // 3. Open the modal
    openModifyModal(mappedData, refreshCallback, 'modify');
}

/**
 * Handles loading a requisition into the modal for payment.
 */
function handlePay(data, refreshCallback) {
    if (!data || typeof data !== 'object') return;

    const mappedData = {
        ...data,
        amount: (data.amount !== undefined) ? data.amount : (data.netAmount || 0),
        requisitionID: data.requisitionID || data.id
    };
    openModifyModal(mappedData, refreshCallback, 'pay');
}



/**
 * Handles loading a service bill into the modification modal.
 * This is called from the 'Modify' button in the pending approvals list.
 */
window.handleServiceBillModify = async function(rawBillData, refreshCallback, modalMode = 'approve') {

    if (!rawBillData || !rawBillData.reference) {
        showAlert('Error: Missing reference for this bill.', 'error');
        return;
    }

    const transactionType = rawBillData.reference;

    try {
        const response = await apiFetch(
            `/api/v1/payables/supplierBills/getSupplierBillDetails/${encodeURIComponent(transactionType)}`,
            { method: 'GET' }
        );

        if (response.success && response.supplierBill) {
            await window.openServiceBillModifyModal(response.supplierBill, refreshCallback, modalMode);
        } else {
            showAlert('Failed to fetch bill details: ' + response.message, 'error');
        }

    } catch (error) {
        console.error(error);
        showAlert('Error fetching bill details.', 'error');
    }
};

// --- Modal Global Functions ---
window.closeModifyModal = function() {
    const el = document.getElementById('MODAL_ModifyPaymentOrder');
    if (el) el.style.display = 'none';
}

/* =========================================================
   MODIFY SERVICE BILL MODAL LOGIC
   (Moved from create_bills.js as per user request for code colocation)
   ========================================================= */

// Global state for the modification modal to keep it separate
let modifyServiceBillState = {
    data: [], // for the lines
    originalBill: null,
    refreshCallback: null,
    viewMode: false,
    buttonMode: 'approve'
};

/**
 * Injects the Modify Service Bill Modal HTML and CSS into the page if not present.
 * The structure is based on create-service-bills.html but adapted for a modal.
 */
window.injectServiceBillModifyModal = function() {
    if (document.getElementById('MODAL_ModifyServiceBill')) return;

    // Inject shared styles to ensure it looks like other modals
    injectPOModalStyles();

    const modalHTML = `
    <div id="MODAL_ModifyServiceBill" class="po-modal-overlay" style="display: none; backdrop-filter: blur(3px);">
        <div id="MSB_ModalContent" class="po-modal" style="width: 95vw; height: 90vh; max-width: 1200px; display: flex; flex-direction: column;">
            <!-- Header -->
            <div id="MSB_ModalHeader" class="po-modal-header" style="background: #2e3192; color: #fff; padding: 10px 15px; cursor: move;">
                <div style="font-weight: bold; font-size: 16px;">Modify Service Bill</div>
                <div class="po-modal-close" onclick="window.closeServiceBillModifyModal()" style="font-size: 24px;">&times;</div>
            </div>

            <!-- Body -->
            <div class="po-modal-body" style="padding: 0; display: flex; flex-direction: column; overflow-y: auto; flex: 1;">
                
                <!-- Top Section (like create-service-bills) -->
                <div class="cb-top-panel" style="padding: 10px; padding-bottom: 0;">
                    <div class="page-toolbar" style="margin-bottom: 5px; display: flex; justify-content: space-between; align-items: start;">
                        <div style="display: flex; align-items: center;">
                            <label style="font-weight: bold">Supplier:</label>
                            <input type="text" id="MSB_Supplier" readonly placeholder="-- Click to Select Supplier --" style="margin-left: 8px; min-width: 250px; cursor: pointer; background: #fff; border: 1px solid #ccc; padding: 6px; border-radius: 4px;">
                            <input type="hidden" id="MSB_SupplierId">
                        </div>
                        <div class="order-date-box">
                            <div class="order-date-title">Order Date</div>
                            <input type="date" class="order-date-input" id="MSB_OrderDate"/>
                        </div>
                    </div>

                    <div class="form-body" style="align-items: space-between; gap: 30%;">
                        <!-- TO SECTION -->
                        <div style="width: 30%">
                            <div class="wd-table-header" style="background: #2e3192; color: #fff; padding: 6px 12px; font-weight: bold; border-radius: 4px 4px 0 0;">TO</div>
                            <div style="border: 1px solid #e0e0e0; border-top: none; padding: 8px; border-radius: 0 0 4px 4px; min-height: 100px;">
                                <div id="MSB_SUPPLIER_Name" style="font-weight: bold; font-size: 14px; text-transform: uppercase"></div>
                                <div id="MSB_SUPPLIER_Address"></div>
                                <div id="MSB_SUPPLIER_Email"></div>
                                <div id="MSB_SUPPLIER_Phone"></div>
                            </div>
                        </div>

                        <!-- BILL DETAILS -->
                        <div style="flex: 1;">
                            <table id="MSB_payment" class="wd-table">
                                <thead><tr><th>Payment Method</th><th>Bill #</th><th>Due Date</th></tr></thead>
                                <tbody><tr>
                                    <td style="padding: 0%; width: 25%;"><input type="text" value="All on credit" style="width: 100%; height: 100%; outline: none; border: none; padding: 6px;" readonly></td>
                                    <td style="padding: 0%; width: 25%;"><input type="text" id="MSB_BillRef" placeholder="Bill Reference" style="width: 100%; height: 100%; outline: none; border: none; padding: 6px;" readonly></td>
                                    <td style="padding: 0%; width: 25%;"><input type="date" id="MSB_DueDate" style="width: 100%; height: 100%; outline: none; border: 1px solid #ccc; padding: 5px;"></td>
                                </tr></tbody>
                            </table>
                            <div style="display: flex; gap: 10px; align-items: center; margin-top: 10px;">
                                <div class="form-side" style="padding: 1%"><label style="font-weight: bold">Account Balance:</label><br /><input id="MSB_SUPPLIER_Balance" type="text" class="amount-input" style="width: 150px; font-weight: bold; text-align: left" readonly /></div>
                                <div class="form-group" style="float: right">
                                    <label style="font-weight: bold">Accounts Payable (A/P)</label>
                                    <input type="text" id="MSB_SUPPLIER_Account" style="width: 220px" readonly />
                                    <input type="hidden" id="MSB_SUPPLIER_AccountId" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <input type="text" id="MSB_GlobalSearch" placeholder="Search by Account name to add line..." style="width: 100%; margin: 5px 0; border: 1px solid #ccc; padding: 10px; border-radius: 4px; background: #fff url('data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 16 16\'><path fill=\'%23ccc\' d=\'M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z\'/></svg>') no-repeat right 10px center; cursor: pointer;" readonly>
                </div>

                <!-- Middle Section (Table) -->
                <div class="cb-middle-panel service-bill-table-wrap" style="flex: 1; border-top: 1px solid #ccc; border-bottom: 1px solid #ccc;">
                    <table id="TABLE_ModifyServiceBills" class="wd-table" style="width: 100%; table-layout: fixed;">
                        <colgroup><col style="width: 3%" /><col style="width: 19%" /><col style="width: 53%" /><col style="width: 15%" /><col style="width: 10%" /></colgroup>
                        <thead><tr><th>No</th><th>Account Name</th><th>Description</th><th>Amount</th><th></th></tr></thead>
                        <tbody></tbody>
                    </table>
                </div>

                <!-- Bottom Section -->
                <div class="cb-bottom-panel" style="padding: 0px 10px 0px 10px;">
                    <table class="wd-table" style="width: 100%; table-layout: fixed; margin-top: 0">
                        <colgroup><col style="width: 5%" /><col style="width: 25%" /><col style="width: 50%" /><col style="width: 15%" /><col style="width: 5%" /></colgroup>
                        <tbody><tr style="background: #f0f0f0; font-weight: bold">
                            <td colspan="3" style="text-align: right">TOTAL</td>
                            <td class="amount" id="CELL_ModifyServiceBill_Total">0</td>
                            <td></td>
                        </tr></tbody>
                    </table>
                    <div style="display: flex; margin-top: 5px; align-items: flex-start; gap: 10%;">
                        <div class="form-group"><label style="font-weight: bold; color: #cd2027;">Comments/Special Instruction</label><textarea id="MSB_bill_description" placeholder="Comments" style="height: 80px; width: 100%;"></textarea></div>
                        <div style=""><label style="font-weight: bold">Amount in Words:</label><span id="MSB_amount-words" style="font-size: 16px; color: #2e3192; display: block;"></span></div>
                        <div class="side-summary">
                            <div>Deduct AIT<input id="MSB_inc-ait" type="checkbox" style="margin-left: 4px" /></div><br />
                            <div class="net-amount">Bill:</div><div class="dynamical" id="MSB_bill">0 FCFA</div><br />
                            <div class="net-amount">AIT (5.5%):</div><div class="dynamical" id="MSB_ait">0 FCFA</div><br />
                            <div class="net-amount">Net:</div><div class="dynamical" id="MSB_net">0 FCFA</div><br />
                        </div>
                    </div>
                </div>

            </div> <!-- End asset-body -->

            <!-- Footer -->
            <div class="po-modal-footer">
                <button class="md-btn md-btn-primary" id="BTN_MSB_SaveChanges">Forward For Approval <i class="fa-solid fa-circle-check"></i></button>
                <button class="md-btn md-btn-danger" onclick="window.closeServiceBillModifyModal()">Close <i class="fa-solid fa-xmark"></i></button>
            </div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Make draggable
    if (typeof makeElementDraggable === 'function') {
        const modalContent = document.getElementById('MSB_ModalContent');
        const modalHeader = document.getElementById('MSB_ModalHeader');
        makeElementDraggable(modalContent, modalHeader);
    }

    // --- Attach Supplier Picker ---
    const supplierInput = document.getElementById('MSB_Supplier');
    if (supplierInput) {
        supplierInput.addEventListener('click', () => {
            if (window.SupplierPicker) {
                window.SupplierPicker.open({
                    onSelect: (s) => window.updateMSBSupplierSelection(s)
                });
            }
        });
    }

    // --- Attach Account Picker (Add Line) ---
    const searchInput = document.getElementById('MSB_GlobalSearch');
    if (searchInput) {
        searchInput.addEventListener('click', () => {
            if (window.AccountPicker) {
                window.AccountPicker.open({
                    title: "Select Expense/Asset Account",
                    targetClasses: ["CLASS 2", "CLASS 6", "CLASS 8"],
                    onSelect: (account) => window.addMSBLine(account)
                });
            }
        });
    }

    // Add event listeners for interactivity inside the modal
    const table = document.getElementById('TABLE_ModifyServiceBills');
    if (table) {
        table.addEventListener('input', (e) => {
            const target = e.target;
            const idx = target.dataset.idx;
            if (idx === undefined) return;

            if (target.classList.contains("desc-cell")) {
                modifyServiceBillState.data[idx].description = target.innerText;
            }
            
            if (target.classList.contains("amt-input")) {
                const sanitizedValue = target.value.replace(/[^0-9.-]/g, '');
                target.value = sanitizedValue;
                modifyServiceBillState.data[idx].amount = parseFloat(sanitizedValue) || 0;
                updateModifyServiceBillTotals();
            }
        });
        
        table.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.target.blur();
            }
        });
    }

    document.getElementById('MSB_inc-ait')?.addEventListener('change', updateModifyServiceBillTotals);
    document.getElementById('BTN_MSB_SaveChanges')?.addEventListener('click', window.saveModifiedServiceBill);
}

window.updateMSBSupplierSelection = async function(supplier) {
    if (!supplier) return;
    
    // Update UI fields
    document.getElementById('MSB_Supplier').value = supplier.name;
    document.getElementById('MSB_SupplierId').value = supplier.id;
    document.getElementById('MSB_SUPPLIER_Name').textContent = supplier.name || "N/A";
    document.getElementById('MSB_SUPPLIER_Address').textContent = supplier.address1 || "N/A";
    document.getElementById('MSB_SUPPLIER_Email').textContent = supplier.email || "N/A";
    document.getElementById('MSB_SUPPLIER_Phone').textContent = supplier.phoneNumber || "N/A";
    
    const balEl = document.getElementById('MSB_SUPPLIER_Balance');
    if (balEl) balEl.value = Number(supplier.accountBalance || 0).toLocaleString("en-US") + " FCFA";

    const accInput = document.getElementById('MSB_SUPPLIER_Account');
    const accIdInput = document.getElementById('MSB_SUPPLIER_AccountId');
    
    if (accInput) {
        accInput.value = "Loading...";
        if (supplier.chartOfAccountsId && window.AccountPicker) {
            await window.AccountPicker.ensureData();
            const account = window.AccountPicker.data.mapById.get(Number(supplier.chartOfAccountsId));
            if (account) {
                accInput.value = `${account.code} - ${account.name}`;
                if (accIdInput) accIdInput.value = account.id;
            } else {
                accInput.value = "Account not found";
                if (accIdInput) accIdInput.value = "";
            }
        } else {
            accInput.value = "Not Linked";
            if (accIdInput) accIdInput.value = "";
        }
    }
}

window.addMSBLine = function(account) {
    if (!account) return;

    if (modifyServiceBillState.data.some(b => b.accountName === account.name)) {
        return;
    }

    modifyServiceBillState.data.push({
        ordLineId: 0,
        coaId: account.id,
        accountName: account.name,
        description: account.name,
        amount: 0
    });

    window.renderModifyServiceBillLines();
}

window.renderModifyServiceBillLines = function() {
    const tbody = document.querySelector('#TABLE_ModifyServiceBills tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    modifyServiceBillState.data.forEach((row, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${(idx + 1)}</td>
            <td>${row.accountName}</td>
            <td contenteditable="${modifyServiceBillState.viewMode ? 'false' : 'true'}" class="desc-cell" data-idx="${idx}">${row.description || ""}</td>
            <td class="amount">
                <input type="text" class="amt-input" value="${row.amount}" data-idx="${idx}" ${modifyServiceBillState.viewMode ? 'disabled' : ''} style="width: 100%; text-align: right; border: none; outline: none; background: transparent; font-weight: bold; font-size: inherit; font-family: inherit; padding: 0; margin: 0;">
            </td>
            ${modifyServiceBillState.viewMode ? '<td></td>' : `<td style="padding: 0%;"><button class="wd-btn reject" onclick="window.deleteModifyServiceBillRow(${idx})" style="width: 100%; height: 100%;">Delete</button></td>`}
        `;
        tbody.appendChild(tr);
    });

    window.updateModifyServiceBillTotals();
}

window.updateModifyServiceBillTotals = function() {
    let total = modifyServiceBillState.data.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);

    document.getElementById('CELL_ModifyServiceBill_Total').textContent = total.toLocaleString('en-US');

    const billEl = document.getElementById('MSB_bill');
    const aitEl = document.getElementById('MSB_ait');
    const netEl = document.getElementById('MSB_net');
    const incAit = document.getElementById('MSB_inc-ait');

    if (billEl) billEl.textContent = total.toLocaleString("en-US") + " FCFA";
    
    const aitValue = incAit && incAit.checked ? Math.round(total * 0.055) : 0;
    if (aitEl) aitEl.textContent = aitValue.toLocaleString("en-US", {maximumFractionDigits: 0}) + " FCFA";
    
    const netValue = total - aitValue;
    if (netEl) netEl.textContent = netValue.toLocaleString("en-US", {maximumFractionDigits: 0}) + " FCFA";

    const wordsEl = document.getElementById('MSB_amount-words');
    if (wordsEl && typeof numberToWords === 'function') {
        wordsEl.textContent = netValue > 0 ? numberToWords(Math.round(netValue)) + " FCFA" : "";
    }
}

window.deleteModifyServiceBillRow = function(idx) {
    modifyServiceBillState.data.splice(idx, 1);
    renderModifyServiceBillLines();
}

window.openServiceBillModifyModal = async function(billDetails, refreshCallback, mode = 'approve') {
    window.injectServiceBillModifyModal();

    modifyServiceBillState.originalBill = billDetails;
    modifyServiceBillState.refreshCallback = refreshCallback;
    modifyServiceBillState.viewMode = mode === 'view';
    modifyServiceBillState.buttonMode = mode === 'update' ? 'update' : 'approve';

    const orderDate = billDetails.orderDate ? billDetails.orderDate.split('T')[0] : '';
    const dueDate = billDetails.dueDate ? billDetails.dueDate.split('T')[0] : '';

    document.getElementById('MSB_OrderDate').value = orderDate;
    document.getElementById('MSB_DueDate').value = dueDate;

    const ref = billDetails.transactionType || billDetails.reference || `Ref-${billDetails.orderNumber}`;
    document.getElementById('MSB_BillRef').value = ref;

    document.getElementById('MSB_bill_description').value = billDetails.description || '';
    document.getElementById('MSB_inc-ait').checked = Number(billDetails.deductAIT || 0) === 1;

    if (window.SupplierManager) {
        await window.SupplierManager.ensureData();
        const supplier = window.SupplierManager.data.mapById.get(Number(billDetails.vendorId));

        if (supplier) {
            await window.updateMSBSupplierSelection(supplier);
        } else {
            document.getElementById('MSB_Supplier').value = `Vendor #${billDetails.vendorId}`;
            document.getElementById('MSB_SupplierId').value = billDetails.vendorId;
        }
    } else {
        document.getElementById('MSB_SupplierId').value = billDetails.vendorId;
    }

    modifyServiceBillState.data = [];

    if (billDetails.lines && Array.isArray(billDetails.lines)) {
        modifyServiceBillState.data = billDetails.lines.map(line => ({
            ordLineId: Number(line.ordLineId || 0),
            coaId: Number(line.coaId || 0),
            accountName: line.accountName || "Unknown Account",
            description: line.lineDescription || "",
            amount: Number(line.amount || 0)
        }));
    }

    window.renderModifyServiceBillLines();

    const saveButton = document.getElementById('BTN_MSB_SaveChanges');
    if (saveButton) {
        if (modifyServiceBillState.viewMode) {
            saveButton.style.display = 'none';
        } else {
            saveButton.style.display = 'inline-block';
            saveButton.disabled = false;
            saveButton.innerHTML = modifyServiceBillState.buttonMode === 'update'
                ? 'UPDATE <i class="fa-solid fa-circle-check"></i>'
                : 'Forward For Approval <i class="fa-solid fa-circle-check"></i>';
        }
    }

    const orderDateInput = document.getElementById('MSB_OrderDate');
    const dueDateInput = document.getElementById('MSB_DueDate');
    const descriptionInput = document.getElementById('MSB_bill_description');
    const incAitCheck = document.getElementById('MSB_inc-ait');
    const searchInput = document.getElementById('MSB_GlobalSearch');

    if (orderDateInput) orderDateInput.disabled = modifyServiceBillState.viewMode;
    if (dueDateInput) dueDateInput.disabled = modifyServiceBillState.viewMode;
    if (descriptionInput) descriptionInput.disabled = modifyServiceBillState.viewMode;
    if (incAitCheck) incAitCheck.disabled = modifyServiceBillState.viewMode;
    if (searchInput) {
        searchInput.disabled = modifyServiceBillState.viewMode;
        searchInput.style.cursor = modifyServiceBillState.viewMode ? 'default' : 'pointer';
    }

    document.getElementById('MODAL_ModifyServiceBill').style.display = 'flex';
}

window.closeServiceBillModifyModal = function() {
    const modal = document.getElementById('MODAL_ModifyServiceBill');
    if (modal) modal.style.display = 'none';
    // Clear state
    modifyServiceBillState.data = [];
    modifyServiceBillState.originalBill = null;
    modifyServiceBillState.refreshCallback = null;
}

window.saveModifiedServiceBill = async function() {
    const refreshFn = modifyServiceBillState.refreshCallback;
    const originalBill = modifyServiceBillState.originalBill;
    if (!originalBill) {
        showAlert('Original bill data not found.', 'error');
        return;
    }

    const orderDateInput = document.getElementById('MSB_OrderDate');
    const dueDateInput = document.getElementById('MSB_DueDate');
    const descriptionInput = document.getElementById('MSB_bill_description');
    const incAitCheck = document.getElementById('MSB_inc-ait');
    const supplierIdInput = document.getElementById('MSB_SupplierId');
    const supplierAccountInput = document.getElementById('MSB_SUPPLIER_AccountId');

    if (!orderDateInput.value || !dueDateInput.value || !descriptionInput.value.trim()) {
        showAlert('Please ensure Order Date, Due Date, and Comments are filled.', 'error');
        return;
    }

    if (modifyServiceBillState.data.length === 0) {
        showAlert('A bill must have at least one expense line.', 'error');
        return;
    }

    if (!supplierIdInput.value) {
        showAlert('Please select a supplier.', 'error');
        return;
    }

    if (!supplierAccountInput.value) {
        showAlert('Supplier Accounts Payable account is missing.', 'error');
        return;
    }

    for (let i = 0; i < modifyServiceBillState.data.length; i++) {
        const line = modifyServiceBillState.data[i];

        if (!line.coaId || Number(line.coaId) <= 0) {
            showAlert(`Line ${i + 1}: Please select a valid account.`, 'error');
            return;
        }

        if (!line.description || !line.description.trim()) {
            showAlert(`Line ${i + 1}: Please enter a description.`, 'error');
            return;
        }

        if (!line.amount || Number(line.amount) <= 0) {
            showAlert(`Line ${i + 1}: Amount must be greater than 0.`, 'error');
            return;
        }

        if (!line.accountName || !line.accountName.trim()) {
            showAlert(`Line ${i + 1}: Account name is missing.`, 'error');
            return;
        }
    }

    const totalBT = modifyServiceBillState.data.reduce((sum, line) => sum + (Number(line.amount) || 0), 0);
    const deductAIT = incAitCheck.checked ? 1 : 0;
    const totalVAT = deductAIT ? Math.round(totalBT * 0.055) : 0;
    const totalIOT = totalBT - totalVAT;

    const payload = {
        transactionType: originalBill.transactionType,
        vendorId: parseInt(supplierIdInput.value, 10),
        orderDate: orderDateInput.value,
        dueDate: dueDateInput.value,
        description: descriptionInput.value.trim(),
        paymentType: 1,
        deductAIT: deductAIT,
        fundingSourceId: Number(originalBill.fundingSourceId || 0),
        accountsPayableCoaId: parseInt(supplierAccountInput.value, 10) || 0,
        aitCoaId: Number(originalBill.aitCoaId || 0),
        totalIOT: totalIOT,
        totalBT: totalBT,
        totalVAT: totalVAT,
        advanceGiven: Number(originalBill.advanceGiven || 0),
        amountLeft: Number(originalBill.amountLeft || 0),
        lines: modifyServiceBillState.data.map(line => ({
            ordLineId: Number(line.ordLineId || 0),
            coaId: Number(line.coaId || 0),
            amount: Number(line.amount || 0),
            lineDescription: line.description || "",
            accountName: line.accountName || ""
        }))
    };

    const saveButton = document.getElementById('BTN_MSB_SaveChanges');
    if (saveButton) {
        saveButton.disabled = true;
        saveButton.innerHTML = 'Saving... <i class="fa-solid fa-spinner fa-spin"></i>';
    }

    try {
        const response = await apiFetch("/api/v1/payables/supplierBills/updateSupplierBills", {
            method: "PUT",
            body: payload
        });

        if (response && response.success) {
            showAlert("Service Bill updated successfully!", 'success');
            window.closeServiceBillModifyModal();
           if (typeof refreshFn === 'function') {
                    refreshFn();
                }
        } else {
            showAlert("Failed to update bill: " + (response ? response.message : "Unknown error."), 'error');
        }
    } catch (error) {
        console.error("Error saving modified service bill:", error);
        showAlert("An error occurred: " + error.message, 'error');
    } finally {
        if (saveButton) {
            saveButton.disabled = false;
            saveButton.innerHTML = modifyServiceBillState.buttonMode === 'update'
                ? 'UPDATE <i class="fa-solid fa-circle-check"></i>'
                : 'Forward For Approval <i class="fa-solid fa-circle-check"></i>';
        }
    }
}

window.openModifyModal = async function(data, refreshCallback, mode = 'modify') {
    injectModifyModal(); // Ensure DOM exists
    const el = document.getElementById('MODAL_ModifyPaymentOrder');
    const headerTitle = document.getElementById('PO_MODAL_HEADER').querySelector('span');
    
    // Populate Account
    const accountInput = document.getElementById('mod-account-search');
    if (window.AccountPicker && accountInput) {
        await window.AccountPicker.ensureData();
        const account = window.AccountPicker.data.mapById.get(data.chartOfAccountsId);
        if (account) {
            accountInput.value = `${account.code} - ${account.name}`;
            accountInput.dataset.id = account.id;
        } else {
            accountInput.value = 'Account not found';
            accountInput.dataset.id = data.chartOfAccountsId || '';
        }
    }
    // Populate Fields
    
    document.getElementById('mod-amount').value = data.grossAmount || '';
    document.getElementById('mod-receiver').value = data.proposer || '';
    document.getElementById('mod-position').value = data.position || '';
    document.getElementById('mod-justification').value = data.subject || '';
    document.getElementById('mod-invoice-date').value = data.invoiceDate ? data.invoiceDate.split('T')[0] : '';
    document.getElementById('mod-payment-date').value = data.paymentDate ? data.paymentDate.split('T')[0] : '';
    document.getElementById('mod-ref').value = data.paymentOrderNo || '';
    document.getElementById('mod-inc-ait').checked = data.aitStatus === 1;
    
    // --- Mode Switching Logic ---
    const isPay = mode === 'pay';
    
    // 1. Header
    headerTitle.textContent = isPay ? "Pay Requisition" : "Modify Payment Order";

    // 2. Inputs Read-only/Disabled state
    const inputs = el.querySelectorAll('.po-input, .po-textarea, .amount-input, #mod-inc-ait');
    inputs.forEach(inp => {
        if (inp.id === 'mod-account-search') {
            inp.style.pointerEvents = isPay ? 'none' : 'auto';
            inp.style.background = isPay ? '#eee' : '#fff';
        } else if (inp.id !== 'mod-payment-mode') { // Skip payment mode select
            inp.disabled = isPay;
            if (inp.type === 'text' || inp.tagName === 'TEXTAREA' || inp.type === 'date') {
                inp.style.background = isPay ? '#eee' : '#fff';
            }
        }
    });

    // 3. Payment Date & Mode
    const dateInput = document.getElementById('mod-payment-date');
    const modeGroup = document.getElementById('mod-payment-mode-group');
    const paymentModeInput = document.getElementById('mod-payment-mode');
    
    if (isPay) {
        dateInput.value = new Date().toISOString().split('T')[0]; // Default to today
        dateInput.disabled = false;
        dateInput.style.background = '#fff';
        if(modeGroup) modeGroup.style.display = 'flex';
        if(paymentModeInput) {
            paymentModeInput.value = '';
            paymentModeInput.dataset.id = '';
        }
    } else {
        if(modeGroup) modeGroup.style.display = 'none';
    }

    // 4. Buttons Visibility
    document.getElementById('btn-mod-save').style.display = isPay ? 'none' : 'inline-block';
    document.getElementById('btn-mod-pay').style.display = isPay ? 'inline-block' : 'none';
    document.getElementById('btn-mod-pay-print').style.display = isPay ? 'inline-block' : 'none';

    // Trigger words update
    document.getElementById('mod-amount').dispatchEvent(new Event('input'));

    // Store ID and Callback
    el.dataset.id = data.requisitionID;
    // We attach the callback to the DOM element property to retrieve it later
    el.refreshCallback = refreshCallback;
    
    if (data.isRejected) {
        el.dataset.isRejected = "true";
    } else {
        delete el.dataset.isRejected;
    }
    
    el.style.display = 'flex';
}

window.submitModification = async function() {
    const el = document.getElementById('MODAL_ModifyPaymentOrder');
    const id = el.dataset.id;
    const btn = document.getElementById('btn-mod-save');
    const isRejected = el.dataset.isRejected === "true";

    const performUpdate = async () => {
        const payload = {
            requisitionID: id,
            aitStatus: document.getElementById('mod-inc-ait').checked ? 1 : 0,
            amount: parseInt(document.getElementById('mod-amount').value.replace(/[^0-9]/g, '')) || 0,
            proposer: document.getElementById('mod-receiver').value,
            position: document.getElementById('mod-position').value,
            subject: document.getElementById('mod-justification').value || '',
            invoiceDate: document.getElementById('mod-invoice-date').value,
            paymentDate: document.getElementById('mod-payment-date').value || '',
            amountInWords: document.getElementById('mod-amount-words').textContent, 
            chartOfAccountsId: Number(document.getElementById('mod-account-search').dataset.id) || 0,
            staffOrNot: 1
        };

    if (isRejected) {
        payload.justificationStatus = 3;
        document.getElementById('btn-mod-save').textContent = "Forward for Approval";
    }

    if(btn) { btn.textContent = "Saving..."; btn.disabled = true; }

    try {
        const resp = await apiFetch('/api/v1/paymentOrders/updateRequisition', {
            method: 'PUT',
            body: payload
        });
        
        if (resp && resp.success) {
            showAlert("Requisition updated successfully!", 'success');
            closeModifyModal();
            // Call the refresh callback if it exists
            if (typeof el.refreshCallback === 'function') {
                el.refreshCallback();
            }
        } else {
            showAlert(resp.message || "Update failed", 'error');
        }
    } catch(e) {
        showAlert("Error: " + e.message, 'error');
    } finally {
            if(btn) { 
                btn.textContent = isRejected ? "Forward for Approval" : "Save Changes"; 
                btn.disabled = false; 
            }
        }
    };

    showConfirmModal({
        title: isRejected ? "Resubmit Requisition" : "Confirm Modification",
        message: isRejected 
            ? "Warning: You are about to resubmit this rejected requisition.\nIt will be moved back to the Pending Approvals list.\n\nDo you want to proceed?"
            : "Are you sure you want to save these changes to the payment order?",
        okText: isRejected ? "Forward for Approval" : "Save Changes",
        onOk: performUpdate
    });
}
window.companyDetails = {}; // Global variable to store company details for the template generator
async function loadCompanyDetails() { 
    console.log("loadCompanyDetails: Function started. Checking for apiFetch...");
    if (typeof apiFetch === 'undefined') {
        console.error("loadCompanyDetails: apiFetch is undefined. Aborting.");
        return;
    }

    try {
        console.log("loadCompanyDetails: Calling API endpoint /api/v1/company/getCompanyDetails with method GET and empty body.");
        // Use apiFetch to handle auth headers automatically
        const response = await apiFetch("/api/v1/company/getCompanyDetails", { method: "GET"});
        //console.log("loadCompanyDetails: API Response received:", response);

        if (response && response.success) {
            // Store in global scope for the template generator to access later
            window.companyDetails = response.companyDetails;
            //console.log("loadCompanyDetails: Company details successfully stored in window.companyDetails:", window.companyDetails);
        } else {
            console.error("loadCompanyDetails: API returned failure or success=false.", response ? response.message : "No response data");
        }
    } catch (error) {
        console.error("loadCompanyDetails: Error occurred during fetch:", error);
    }
}

/**
 * Generates the HTML for the printable payment order receipt.
 * This is designed to look exactly like the provided PDF.
 * @param {object} data - The data to populate the template with.
 * @returns {string} - The HTML string for the receipt.
 */
function generatePaymentOrderTemplate(data, companyDetails) {
    console.log("generatePaymentOrderTemplate: Generating template with payment data:", data);

    // Use the passed parameter, or fallback to the global variable, or an empty object
    const c = companyDetails || window.companyDetails || {};
    console.log("generatePaymentOrderTemplate: Using company details for header:", c);

    // Use placeholders for any missing data
    const amount = data.amount || '0 FCFA';
    const amountInWords = data.amountInWords || '__________________';
    const to = data.to || '__________________';
    const position = data.position || '__________________';
    const justification = data.justification || '__________________';
    const payee = data.payee || '__________________';
    const paidBy = data.paidBy || '__________________';
    const date = data.date || '____/__/__';
    const paymentOrderNo = data.paymentOrderNo || '_________';

    return `
        <div style="
            font-family: 'Arial', sans-serif; 
            font-size: 14px; 
            width: 210mm; 
            height: 210mm; 
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
                        <div style="font-size: 26px; font-weight: bold;" id="companyName">${c.nameOfCompany || 'Company Name'}</div>
                        <div style="font-size: 12px;"><span id="companyAddress">${c.address || 'Address'}</span> TEL: <span id="companyPhone">${c.phoneNumber || 'Phone'}</span></div>
                        <div style="font-size: 12px;">Email: <span id="companyEmail">${c.email1 || 'Email'}</span> &nbsp; Web: <span id="companyWebsite">${c.websiteAddress || 'Website'}</span></div>
                        <div style="font-size: 14px; font-weight: bold; font-style: italic; margin-top: 5px;">Motto: <span id="companySlogan">${c.slogan || 'Slogan'}</span></div>
                    </td>
                </tr>
            </table>

            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 20px;">
                <div style="font-size: 22px; font-weight: bold;">PETTY CASH PAYMENT VOUCHER</div>
                <div style="width: 250px;">
                    <div style="display: flex; align-items: baseline;">
                        <strong style="width: 50px; text-align: right; padding-right: 10px;">No:</strong>
                        <span style="flex-grow: 1; border-bottom: 1px dotted black;">(PMT/${paymentOrderNo})</span>
                    </div>
                    <div style="display: flex; align-items: baseline; margin-top: 5px;">
                        <strong style="width: 50px; text-align: right; padding-right: 10px;">Date:</strong>
                        <span style="flex-grow: 1; border-bottom: 1px dotted black;">${date}</span>
                    </div>
                </div>
            </div>

            <div style="margin-top: 20px; display: flex; align-items: baseline;">
                <span>Pay in cash following this requisition the Amount of :</span>
                <span style="font-weight: bold; flex-grow: 1; font-size: 20px; margin-left: 15px; padding: 0 10px; border-bottom: 1px dotted black;">
                    ${amount}
                </span>
            </div>

            <div style="margin-top: 5px; display: flex; align-items: baseline;">
                <strong style="white-space: nowrap; margin-right: 28px;">(In words):</strong>
                <div style="
                    flex-grow: 1; 
                    text-transform: uppercase; 
                    border-bottom: 1px black dotted;
                ">
                    ${amountInWords}
                </div>
            </div>

            <div style="margin-top: 10px;">
                <div style="display: flex; align-items: baseline; margin-bottom: 10px;">
                    <strong style="width: 100px;">To:</strong>
                    <div style="flex-grow: 1; border-bottom: 1px dotted black;">${to}</div>
                </div>
                <div style="display: flex; align-items: baseline; margin-bottom: 10px;">
                    <strong style="width: 100px;">Position:</strong>
                    <div style="flex-grow: 1; border-bottom: 1px dotted black;">${position}</div>
                </div>
                <div style="display: flex; align-items: baseline;">
                    <strong style="width: 100px;">Justification:</strong>
                    <div style="
                        flex-grow: 1; 
                        border-bottom: 1px dotted black;
                    ">
                        ${justification}
                    </div>
                </div>
            </div>

            <div style="text-align: center; font-weight: bold; margin: 10px 0 10px 0; font-style: italic;">Signatures and Names</div>
            <div style="display: flex; justify-content: space-between;">
                <div style="width: 45%;">
                    <div style="display: flex; align-items: baseline;">
                        <strong style="margin-right: 5px;">Payee:</strong>
                        <div style="flex-grow: 1; border-bottom: 1px dotted black;">${payee}</div>
                    </div>
                    <div style="display: flex; align-items: baseline; margin-top: 40px;">
                        <strong style="margin-right: 5px;">Signature:</strong>
                        <div style="flex-grow: 1; border-bottom: 1px dotted black; height: 15px;"></div>
                    </div>
                </div>
                <div style="width: 45%;">
                    <div style="display: flex; align-items: baseline;">
                        <strong style="margin-right: 5px;">Paid By:</strong>
                        <div style="flex-grow: 1; border-bottom: 1px dotted black;">${paidBy}</div>
                    </div>
                    <div style="display: flex; align-items: baseline; margin-top: 40px;">
                        <strong style="margin-right: 5px;">Signature:</strong>
                        <div style="flex-grow: 1; border-bottom: 1px dotted black; height: 15px;"></div>
                    </div>
                </div>
            </div>

            <div style="position: relative; top: 4px; display: flex; justify-content: space-between; font-size: 10px; padding-top: 5px;">
                <div>Copyright(c)2022. Institute ERP Pro</div>
                <div>Powered by AfricRenov Group Sarl.</div>
            </div>
        </div>
    `;
}


/**
 * Gathers data from the payment modal, generates the receipt, and opens the print dialog.
 */
function generateAndPrintPaymentOrder() {
    const modalEl = document.getElementById('MODAL_ModifyPaymentOrder');
    if (!modalEl) {
        showAlert("Error: Payment modal not found.", 'error');
        return;
    }

    const paymentDateRaw = document.getElementById('mod-payment-date').value;
    const formattedDate = paymentDateRaw ? new Date(paymentDateRaw).toLocaleDateString('en-GB') : '____/__/__';

    const data = {
        amount: document.getElementById('mod-net').textContent || '0 FCFA',
        amountInWords: document.getElementById('mod-amount-words').textContent || '__________________',
        to: document.getElementById('mod-receiver').value || '__________________',
        position: document.getElementById('mod-position').value || '__________________',
        justification: document.getElementById('mod-justification').value || '__________________',
        date: formattedDate,
        paymentOrderNo: document.getElementById('mod-ref').value || '_________',
        payee: document.getElementById('mod-receiver').value || '__________________',
        paidBy: 'Administration' // As per PDF example
    };

    console.log("generateAndPrintPaymentOrder: Calling template generator...");
    // Pass the global companyDetails to the template generator
    const templateHTML = generatePaymentOrderTemplate(data, window.companyDetails);

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(`
        <html>
        <head><title>Payment Order - ${data.paymentOrderNo}</title></head>
        <body>
            ${templateHTML}
            <script>
                window.onload = function() {
                    window.print();
                    window.close();
                }
            <\/script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

window.submitPay = async function(print) {
    const el = document.getElementById('MODAL_ModifyPaymentOrder');
    const id = el.dataset.id;
    const paymentModeInput = document.getElementById('mod-payment-mode');
    const fundingSourceId = paymentModeInput ? paymentModeInput.dataset.id : null;
    
    const btnPay = document.getElementById('btn-mod-pay');
    const btnPayPrint = document.getElementById('btn-mod-pay-print');

    // Validation
    if (!fundingSourceId) {
        showAlert("Please select a Mode of Payment.", 'error');
        return;
    }

    // If printing, generate the visualization first. The user can interact with the
    // print dialog while the payment is processed in the background.
    if (print) {
        generateAndPrintPaymentOrder();
    }
    
    if(btnPay) btnPay.disabled = true;
    if(btnPayPrint) btnPayPrint.disabled = true;

    try {
        const payload = {
            requisitionID: id,
            paymentModeCoaId: Number(fundingSourceId),
            invoiceDate: document.getElementById('mod-invoice-date').value,
            paymentDate: document.getElementById('mod-payment-date').value,
            netAmount: parseInt(document.getElementById('mod-net').textContent.replace(/[^0-9]/g, '')),
            deductAIT: document.getElementById('mod-inc-ait').checked ? 1 : 0
        };

        const resp = await apiFetch(`/api/v1/paymentOrders/payApprovedPaymentOrder`, {
            method: 'PUT',
            body: payload
        });

        if (resp && resp.success) {
            showAlert("Payment processed successfully!", 'success');
            closeModifyModal();
            if (typeof el.refreshCallback === 'function') el.refreshCallback();
        } else {
            showAlert((resp && resp.message) ? resp.message : "Payment failed.", 'error');
        }
    } catch (e) {
        showAlert("Error: " + e.message, 'error');
    } finally {
        if(btnPay) btnPay.disabled = false;
        if(btnPayPrint) btnPayPrint.disabled = false;
    }
}

// Define globally so it can be called by your router/loader (index.html calls paymentOrderInit)
window.paymentOrderInit = function() {
    console.log("paymentOrderInit: Initializing...");

    const form = document.getElementById('po-form');
    if (!form) {
        console.warn("paymentOrderInit: Form 'po-form' not found.");
        return;
    }

    // Prevent attaching listeners multiple times
    if (form.dataset.initialized === "true") {
        console.log("paymentOrderInit: Form already initialized.");
        return;
    }
    form.dataset.initialized = "true";

    function updatePaymentOrderSummary() {
        const amountInput = document.getElementById('amount-input');
        const wordsDiv = document.getElementById('po-amount-words');
        const billEl = document.getElementById('bill');
        const aitEl = document.getElementById('ait');
        const netEl = document.getElementById('net');
        const incAit = document.getElementById('inc-ait');

        if (!amountInput || !wordsDiv || !billEl || !aitEl || !netEl || !incAit) return;

        const raw = amountInput.value.replace(/[^0-9]/g, '');
        const total = parseInt(raw, 10) || 0;

        billEl.textContent = total.toLocaleString('en-US') + " FCFA";

        const aitValue = incAit.checked ? Math.round(total * 0.055) : 0;
        aitEl.textContent = aitValue.toLocaleString("en-US", {maximumFractionDigits: 0}) + " FCFA";

        const netValue = total - aitValue;
        netEl.textContent = netValue.toLocaleString("en-US", {maximumFractionDigits: 0}) + " FCFA";

        if (typeof numberToWords === 'function') {
            // The words should reflect the main amount at the top of the form
            wordsDiv.textContent = netValue > 0 ? numberToWords(netValue) + " FCFA" : "Amount in words";
        } else {
            wordsDiv.textContent = netValue > 0 ? netValue.toLocaleString('en-US') + " FCFA" : "Amount in words";
        }
    }

    function resetPaymentOrderForm() {
        // Fields to clear
        document.getElementById('amount-input').value = '';
        document.getElementById('po-receiver').value = '';
        document.getElementById('po-position').value = '';
        document.getElementById('po-payment-date').value = '';
        document.getElementById('inc-ait').checked = false;
        document.getElementById('EDT_GlobalSearch').value = '';
        document.getElementById('po-justification').value = '';

        // Trigger update for summary and words to reset them to 0/empty
        updatePaymentOrderSummary();
    }

    // --- 0. Setup Global Search (Account Picker) ---
    const searchInput = document.getElementById('EDT_GlobalSearch');
    const justificationTextarea = document.getElementById('po-justification');
    if (searchInput) {
        searchInput.readOnly = true; // Force selection via picker
        searchInput.style.cursor = "pointer";
        searchInput.addEventListener('click', () => {
            if (window.AccountPicker) {
                window.AccountPicker.open({
                    title: "Select Account",
                    targetClasses: ["CLASS 6", "CLASS 8"],
                    allowClear: false,
                    onSelect: (acc) => {
                        searchInput.value = acc ? `${acc.code} - ${acc.name}` : "";
                        searchInput.dataset.id = acc ? acc.id : "";
                        if (justificationTextarea) {
                            justificationTextarea.value = acc ? "Payment for " + acc.name : "";
                        }
                    }
                });
            } else {
                console.warn("AccountPicker not found. Ensure chart-of-accounts.js is loaded.");
            }
        });
    }

    // --- 1. Auto-update Amount in Words ---
    const amountInput = document.getElementById('amount-input');
    const incAitCheck = document.getElementById('inc-ait');

    // Initialize Invoice Date
    const invoiceDateInput = document.getElementById('po-invoice-date');
    if (invoiceDateInput) {
        invoiceDateInput.value = new Date().toISOString().split('T')[0];
    }

    if (amountInput) {
        amountInput.addEventListener('input', updatePaymentOrderSummary);
    }

    if (incAitCheck) {
        incAitCheck.addEventListener('change', updatePaymentOrderSummary);
    }

    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      console.log("paymentOrderInit: Submit detected.");

      // Get values using IDs
      const invoiceDate = document.getElementById('po-invoice-date')?.value || '';
      const paymentDate = document.getElementById('po-payment-date')?.value || '';
      const proposer = document.getElementById('po-receiver')?.value || '';
      const position = document.getElementById('po-position')?.value || '';
      const justification = document.getElementById('po-justification')?.value || '';
      const aitStatus = document.getElementById('inc-ait').checked ? 1 : 0;
      const amountVal = document.getElementById('amount-input')?.value || '';
      const amount = parseInt(amountVal.replace(/[^0-9]/g, ''), 10) || 0;
      const amountInWords = document.getElementById('po-amount-words')?.textContent || '';

      console.log("Form Values:", { proposer, amount, invoiceDate, aitStatus });

      // Hardcoded values as requested
      // Use selected account ID or fallback to 0 (or handle error)
      const chartOfAccountsId = searchInput && searchInput.dataset.id ? Number(searchInput.dataset.id) : 0;
      const departmentId = 51;
      const forwardedUsersId = 50;
      const paymentOrderType = 1;
      const modeofPayment = 1; // Assuming mode of payment is 1 (Cash)

      // Basic validation
      if (!proposer || !amount || !invoiceDate || !chartOfAccountsId) {
        console.warn("Validation failed: Missing required fields.");
        showAlert('Please fill all required fields (Account, Receiver, Amount, Invoice Date).', 'error');
        return;
      }

      const payload = {
        invoiceDate: invoiceDate,
        aitStatus: aitStatus,
        paymentDate: paymentDate,
        chartOfAccountsId: chartOfAccountsId,
        departmentId: departmentId,
        proposer: proposer,
        position: position,
        subject: justification,
        amount: amount,
        amountInWords: amountInWords,
        paymentOrderType: paymentOrderType,
        forwardedUsersId: forwardedUsersId,
        staffOrNot: 1,
        modeofPayment: modeofPayment
      };

      const endpoint = '/api/v1/paymentOrders/addRequisition';
      const method = 'POST';

      const btn = document.getElementById('po-submit');
      const originalText = btn ? btn.textContent : "Forward for Approval";
      if (btn) {
          btn.disabled = true;
          btn.textContent = "Sending...";
      }

      try {
        if (typeof apiFetch === 'undefined') {
            throw new Error("apiFetch is not defined. Please ensure auth.js is loaded.");
        }

        console.log("Sending Payload:", payload);
        const resp = await apiFetch(endpoint, { method, body: payload });
        console.log("API Response:", resp);

        if (!resp || !resp.success) {
          showAlert((resp && resp.message) ? resp.message : 'Failed to submit payment order.', 'error');
        } else {
            showAlert(resp.message || `Requisition ${resp.paymentOrderNo} created.`, 'success');
            resetPaymentOrderForm();
        }
      } catch (e) {
        console.error(e);
        showAlert('Error: ' + e.message, 'error');
      } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = originalText;
        }
      }
    });
};

// Run immediately in case the script is loaded after the HTML
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    paymentOrderInit();
}

/**
 * Generic function to initialize a payment list table.
 * @param {object} config - Configuration for the specific table.
 * @param {string} config.tableId - The ID of the table element.
 * @param {string} config.apiEndpoint - The API endpoint to fetch data from.
 * @param {function} config.renderRow - A function that takes a payment object and returns a TR element.
 * @param {function} config.refreshCallback - The init function to call to refresh data.
 */
async function initializePaymentTable(config) {
    const table = document.getElementById(config.tableId);
    if (!table) return; // Exit if the specific table isn't on the page
 
    const tbody = table.querySelector('tbody');
    const searchInput = document.getElementById('EDT_GlobalSearch');
    if (!tbody || !searchInput) {
        console.error(`Required elements for ${config.tableId} not found.`);
        return;
    }
 
    // State for this table
    const state = {
        allPayments: [],
        filteredPayments: [],
        query: ''
    };
 
    // Render function
    function render() {
        tbody.innerHTML = '';
        state.filteredPayments.forEach((payment, index) => {
            const tr = config.renderRow(payment, index);

            // Add WinDev-style row selection from the old sample file
            tr.addEventListener("click", function (e) {
                if (e.target.closest("button")) return;
                tbody.querySelectorAll("tr").forEach(r => r.classList.remove("selected"));
                tr.classList.add("selected");
            });

            tbody.appendChild(tr);
        });
        
        if (state.filteredPayments.length === 0) {
            tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding: 20px; color: #777;">No records added yet.</td></tr>`;
        }
    }
 
    // Filter function
    function filterAndRender() {
        const q = state.query.toLowerCase();
        if (!q) {
            state.filteredPayments = state.allPayments;
        } else {
            state.filteredPayments = state.allPayments.filter(p => {
                // Search across multiple relevant fields
                return (
                    Object.values(p).some(val => 
                        String(val).toLowerCase().includes(q)
                    )
                );
            });
        }
        render();
    }
 
    // Search event listener
    searchInput.addEventListener('input', (e) => {
        state.query = e.target.value;
        filterAndRender();
    });
 
    // Fetch data from API
    try {
        if (typeof apiFetch === 'undefined') {
            throw new Error("apiFetch is not defined. Ensure auth.js is loaded.");
        }
        const response = await apiFetch(config.apiEndpoint, { method: 'GET' });
 
        // API returns { success: true, paymentOrders: [...] } or { items: [...] }
        const list = response.paymentOrders || response.items;
        if (response && response.success && Array.isArray(list)) {
            state.allPayments = list;
            filterAndRender(); // Initial render
        } else {
            tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding: 20px;">${(response && response.message) || 'Failed to load data.'}</td></tr>`;
        }
    } catch (error) {
        console.error(`Error loading data for ${config.tableId}:`, error);
        tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding: 20px; color: red;">Error: ${error.message}</td></tr>`;
    }
}
 
// ===================================================================
// ==                  INITIALIZATION FUNCTIONS                     ==
// ===================================================================
 
/**
 * Initializes the "Pending Approvals" table.
 * This function is called from index.html when the screen loads.
 */
window.initPendingApproval = function() {
    console.log("Initializing Pending Approvals (Requisitions & Service Bills)...");
    
    const tableId = 'TABLE_PendingApprovals';
    const table = document.getElementById(tableId);
    if (!table) return;

    const tbody = table.querySelector('tbody');
    const searchInput = document.getElementById('EDT_GlobalSearch');
    if (!tbody || !searchInput) {
        console.error(`Required elements for ${tableId} not found.`);
        return;
    }

    const state = { allItems: [], filteredItems: [], query: '' };

    const renderRow = (item, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td data-tooltip="SN\n${index + 1}">${index + 1}</td>
            <td data-tooltip="REF NO\n${formatValue(item.refNo)}">${formatValue(item.refNo)}</td>
            <td data-tooltip="DATE\n${formatValue(item.date, 'date')}">${formatValue(item.date, 'date')}</td>
            <td data-tooltip="SUBJECT\n${formatValue(item.subject)}">${formatValue(item.subject)}</td>
            <td data-tooltip="POSITION\n${formatValue(item.position || '')}">${formatValue(item.position || '')}</td>
            <td data-tooltip="BENEFICIARY\n${formatValue(item.beneficiary)}">${formatValue(item.beneficiary)}</td>
            <td class="amount" data-tooltip="ACTUAL AMOUNT\n${formatValue(item.amount, 'currency')}">${formatValue(item.amount, 'currency')}</td>
            <td data-tooltip="INITIATED BY\n${formatValue(item.initiatedBy)}">${formatValue(item.initiatedBy)}</td>
        `;

        const tdActions = document.createElement('td');
        if (item.type === 'payment-order') {
            const btnApprove = document.createElement('button');
            btnApprove.className = 'wd-btn pay';
            btnApprove.textContent = 'Approve';
            btnApprove.onclick = () => handleWorkflowAction('approve', item.id, window.initPendingApproval);
            

            const btnReject = document.createElement('button');
            btnReject.className = 'wd-btn reject';
            btnReject.textContent = 'Reject';
            btnReject.onclick = () => handleWorkflowAction('reject', item.id, window.initPendingApproval);

            tdActions.appendChild(btnApprove);
            tdActions.appendChild(document.createTextNode(' ')); // spacer
            tdActions.appendChild(btnReject);
        } else if (item.type === 'service-bill') {
            const btnApprove = document.createElement('button');
            btnApprove.className = 'wd-btn pay';
            btnApprove.textContent = 'Approve';
            btnApprove.onclick = async () => {
                showConfirmModal({
                    title: "Approve Service Bill",
                    message: `Are you sure you want to approve Service Bill #${item.refNo}?`,
                    onOk: async () => {
                        try {
                            const resp = await apiFetch(`/api/v1/payables/supplierBills/approveServiceBills/${item.order}`, { method: 'PUT', body: {} });
                            if (resp && resp.success) {
                                showAlert("Service Bill approved successfully!", 'success');
                                window.initPendingApproval();
                            } else {
                                showAlert("Failed to approve: " + (resp ? resp.message : "Unknown error"), 'error');
                            }
                        } catch (e) { console.error(e); showAlert("Error: " + e.message, 'error'); }
                    }
                });
            };

            const btnReject = document.createElement('button');
            btnReject.className = 'wd-btn reject';
            btnReject.textContent = 'Reject';
            btnReject.onclick = async () => {
                showConfirmModal({
                    title: "Reject Service Bill",
                    message: `Are you sure you want to reject Service Bill #${item.refNo}?`,
                    onOk: async () => {
                        try {
                            const resp = await apiFetch(`/api/v1/payables/supplierBills/rejectSupplierBill/${encodeURIComponent(item.refNo)}`, { 
                                method: 'PUT', 
                                body: {} 
                            });
                            if (resp && resp.success) {
                                showAlert("Service Bill rejected successfully!", 'success');
                                window.initPendingApproval();
                            } else {
                                showAlert("Failed to reject: " + (resp ? resp.message : "Unknown error"), 'error');
                            }
                        } catch (e) { console.error(e); showAlert("Error: " + e.message, 'error'); }
                    }
                });
            };

            tdActions.appendChild(btnApprove);
            tdActions.appendChild(document.createTextNode(' '));
            tdActions.appendChild(btnReject);
        }
        tr.appendChild(tdActions);
        return tr;
    };

    const render = () => {
        tbody.innerHTML = '';
        state.filteredItems.forEach((item, index) => {
            const tr = renderRow(item, index);
            tr.addEventListener("click", function (e) {
                if (e.target.closest("button")) return;
                tbody.querySelectorAll("tr").forEach(r => r.classList.remove("selected"));
                tr.classList.add("selected");
            });
            tbody.appendChild(tr);
        });
        if (state.filteredItems.length === 0) {
            tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding: 20px; color: #777;">No records added yet.</td></tr>`;
        }
    };

    const filterAndRender = () => {
        const q = state.query.toLowerCase();
        if (!q) {
            state.filteredItems = state.allItems;
        } else {
            state.filteredItems = state.allItems.filter(p => {
                return Object.values(p).some(val => String(val).toLowerCase().includes(q));
            });
        }
        render();
    };

    searchInput.addEventListener('input', (e) => {
        state.query = e.target.value;
        filterAndRender();
    });

    // Fetch both data sources
    Promise.all([
        apiFetch('/api/v1/paymentOrders/getRequisitionsPendingApproval', { method: 'GET' }),
        apiFetch('/api/v1/payables/supplierBills/getSupplierBillsPendingApproval', { method: 'GET' }),
        window.SupplierManager ? window.SupplierManager.ensureData() : Promise.resolve() // Also load supplier data
    ]).then(([requisitionsResp, serviceBillsResp]) => {
        let combinedItems = [];

        // Process Requisitions
        if (requisitionsResp && requisitionsResp.success && Array.isArray(requisitionsResp.paymentOrders)) {
            const mappedReqs = requisitionsResp.paymentOrders.map(p => ({
                id: p.requisitionID,
                type: 'payment-order',
                refNo: p.paymentOrderNo,
                date: p.paymentDate,
                subject: p.subject,
                aitStatus: p.aitStatus,
                position: p.position,
                beneficiary: p.proposer,
                amount: p.netAmount,
                initiatedBy: p.initiatedBy,
                rawItem: p
            }));
            combinedItems.push(...mappedReqs);
        }

        // Process Service Bills
        if (serviceBillsResp && serviceBillsResp.success && Array.isArray(serviceBillsResp.serviceBills)) {
            const mappedBills = serviceBillsResp.serviceBills.map(b => ({
                id: b.reference,
                type: 'service-bill',
                refNo: b.reference,
                order: b.orderNumber,
                date: b.orderDate,
                subject: b.remarks,
                position: 'N/A',
                beneficiary: (window.SupplierManager && window.SupplierManager.data.mapById.get(b.vendorId))
                    ? window.SupplierManager.data.mapById.get(b.vendorId).name
                    : `Vendor ID: ${b.vendorId}`,
                amount: b.totalBT,
                initiatedBy: 'System',
                rawItem: b
            }));
            combinedItems.push(...mappedBills);
        }

        state.allItems = combinedItems;
        filterAndRender();

    }).catch(error => {
        console.error(`Error loading data for Pending Approvals:`, error);
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding: 20px; color: red;">Error: ${error.message}</td></tr>`;
    });
};
 
/**
 * Initializes the "Pending Payments" table.
 * This function is called from index.html when the screen loads.
 */
window.initPendingPayments = function() {
    console.log("Initializing Pending Payments...");
    initializePaymentTable({
        tableId: 'TABLE_PendingPayments',
        apiEndpoint: '/api/v1/paymentOrders/getApprovedRequisitionsPendingPayment',
        refreshCallback: window.initPendingPayments,
        renderRow: (payment, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td data-tooltip="SN\n${index + 1}">${index + 1}</td>
                <td data-tooltip="REF NO\n${formatValue(payment.paymentOrderNo)}">${formatValue(payment.paymentOrderNo)}</td>
                <td data-tooltip="DATE\n${formatValue(payment.paymentDate, 'date')}">${formatValue(payment.paymentDate, 'date')}</td>
                <td data-tooltip="SUBJECT\n${formatValue(payment.subject)}">${formatValue(payment.subject)}</td>
                <td data-tooltip="POSITION\n${formatValue(payment.position || '')}">${formatValue(payment.position || '')}</td>
                <td data-tooltip="BENEFICIARY\n${formatValue(payment.proposer)}">${formatValue(payment.proposer)}</td>
                <td class="amount" data-tooltip="ACTUAL AMOUNT\n${formatValue(payment.netAmount, 'currency')}">${formatValue(payment.netAmount, 'currency')}</td>
                <td data-tooltip="INITIATED BY\n${formatValue(payment.initiatedBy || 'System')}">${formatValue(payment.initiatedBy || 'System')}</td>
                <td data-tooltip="APPROVED BY\n${formatValue(payment.approverName || payment.approvedBy)}">${formatValue(payment.approverName || payment.approvedBy)}</td>
            `;
 
            // Actions Column
            const tdActions = document.createElement('td');
            
            const btnPay = document.createElement('button');
            btnPay.className = 'wd-btn pay';
            btnPay.textContent = 'Pay';
            btnPay.onclick = () => handlePay(payment, window.initPendingPayments);

            const btnReject = document.createElement('button');
            btnReject.className = 'wd-btn reject';
            btnReject.textContent = 'Reject';
            btnReject.onclick = () => handleWorkflowAction('reject', payment.requisitionID, window.initPendingPayments);
 
            tdActions.appendChild(btnPay);
            tdActions.appendChild(document.createTextNode(' ')); // spacer
            tdActions.appendChild(btnReject);
            tr.appendChild(tdActions);
            return tr;
        }
    });
};
 
/**
 * Initializes the "Rejected Payments" table.
 * This function is called from index.html when the screen loads.
 */
window.initRejectedPayments = function() {
    console.log("Initializing Rejected Payments (Requisitions & Service Bills)...");
    
    const tableId = 'TABLE_RejectedPayments';
    const table = document.getElementById(tableId);
    if (!table) return;

    const tbody = table.querySelector('tbody');
    const searchInput = document.getElementById('EDT_GlobalSearch');
    if (!tbody || !searchInput) {
        console.error(`Required elements for ${tableId} not found.`);
        return;
    }

    const state = { allItems: [], filteredItems: [], query: '' };

    const renderRow = (item, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td data-tooltip="SN\n${index + 1}">${index + 1}</td>
            <td data-tooltip="REF NO\n${formatValue(item.refNo)}">${formatValue(item.refNo)}</td>
            <td data-tooltip="DATE\n${formatValue(item.date, 'date')}">${formatValue(item.date, 'date')}</td>
            <td data-tooltip="SUBJECT\n${formatValue(item.subject)}">${formatValue(item.subject)}</td>
            <td data-tooltip="POSITION\n${formatValue(item.position || '')}">${formatValue(item.position || '')}</td>
            <td data-tooltip="BENEFICIARY\n${formatValue(item.beneficiary)}">${formatValue(item.beneficiary)}</td>
            <td class="amount" data-tooltip="ACTUAL AMOUNT\n${formatValue(item.amount, 'currency')}">${formatValue(item.amount, 'currency')}</td>
            <td data-tooltip="INITIATED BY\n${formatValue(item.initiatedBy)}">${formatValue(item.initiatedBy)}</td>
            <td data-tooltip="REJECTED BY\n${formatValue(item.rejectedBy)}">${formatValue(item.rejectedBy || 'N/A')}</td>
        `;

        const tdActions = document.createElement('td');
        
        const btnModify = document.createElement('button');
        btnModify.className = 'wd-btn pay'; 
        btnModify.textContent = 'Modify';
        
        const btnDelete = document.createElement('button');
        btnDelete.className = 'wd-btn reject';
        btnDelete.textContent = 'Delete';

        if (item.type === 'payment-order') {
            btnModify.onclick = () => handleModify({ ...item.rawItem, isRejected: true }, window.initRejectedPayments);
            btnDelete.onclick = () => handleWorkflowAction('delete', item.id, window.initRejectedPayments);
        } else if (item.type === 'service-bill') {
            btnModify.onclick = () => window.handleServiceBillModify(item.rawItem, window.initRejectedPayments);
            btnDelete.onclick = () => handleServiceBillDelete(item.refNo, window.initRejectedPayments);
        }

        tdActions.appendChild(btnModify);
        tdActions.appendChild(document.createTextNode(' '));
        tdActions.appendChild(btnDelete);
        tr.appendChild(tdActions);
        
        return tr;
    };

    const render = () => {
        tbody.innerHTML = '';
        state.filteredItems.forEach((item, index) => {
            const tr = renderRow(item, index);
            tr.addEventListener("click", function (e) {
                if (e.target.closest("button")) return;
                tbody.querySelectorAll("tr").forEach(r => r.classList.remove("selected"));
                tr.classList.add("selected");
            });
            tbody.appendChild(tr);
        });
        if (state.filteredItems.length === 0) {
            tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding: 20px; color: #777;">No rejected records found.</td></tr>`;
        }
    };

    const filterAndRender = () => {
        const q = state.query.toLowerCase();
        if (!q) {
            state.filteredItems = state.allItems;
        } else {
            state.filteredItems = state.allItems.filter(p => {
                return Object.values(p).some(val => String(val).toLowerCase().includes(q));
            });
        }
        render();
    };

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            state.query = e.target.value;
            filterAndRender();
        });
    }

    Promise.all([
        apiFetch('/api/v1/paymentOrders/getRejectedRequisitions', { method: 'GET' }),
        apiFetch('/api/v1/payables/supplierBills/getRejectedSupplierBills', { method: 'GET' }),
        window.SupplierManager ? window.SupplierManager.ensureData() : Promise.resolve()
    ]).then(([requisitionsResp, serviceBillsResp]) => {
        let combinedItems = [];

        if (requisitionsResp && requisitionsResp.success && Array.isArray(requisitionsResp.paymentOrders)) {
            combinedItems.push(...requisitionsResp.paymentOrders.map(p => ({
                id: p.requisitionID, type: 'payment-order', refNo: p.paymentOrderNo, date: p.paymentDate, subject: p.subject,
                position: p.position, beneficiary: p.proposer, amount: p.netAmount, initiatedBy: p.initiatedBy, rejectedBy: p.rejectedBy, rawItem: p
            })));
        }

        if (serviceBillsResp && serviceBillsResp.success && Array.isArray(serviceBillsResp.serviceBills)) {
            combinedItems.push(...serviceBillsResp.serviceBills.map(b => ({
                id: b.reference, type: 'service-bill', refNo: b.reference, order: b.orderNumber, date: b.orderDate,
                subject: b.remarks || b.description, position: 'N/A',
                beneficiary: (window.SupplierManager && window.SupplierManager.data.mapById.get(b.vendorId)) ? window.SupplierManager.data.mapById.get(b.vendorId).name : `Vendor ID: ${b.vendorId}`,
                amount: b.totalBT, initiatedBy: b.preparedBy || 'System', rejectedBy: b.rejectedBy || 'Approver', rawItem: b
            })));
        }

        state.allItems = combinedItems;
        filterAndRender();
    }).catch(error => {
        console.error(`Error loading rejected items:`, error);
        tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding: 20px; color: red;">Error: ${error.message}</td></tr>`;
    });
};
 
 
/**
 * This is a fallback for a typo in the original index.html context.
 * It ensures that if `initRejectedPayment()` is called, it redirects to the correct function.
 */
window.initRejectedPayment = function() {
    console.warn("initRejectedPayment() is a typo, calling initRejectedPayments() instead.");
    window.initRejectedPayments();
}

// Load company details immediately when the script is loaded.
loadCompanyDetails();