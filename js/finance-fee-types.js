/**
 * js/finance-fee-types.js
 * Handles Fee Types Setup logic.
 */

window.feeTypes = [
    { id: 1, category: "Admission Fees", name: "Admission Fees Post Graduate SHS", description: "Admission Fees Post Graduate SHS", amount: 19500, schoolType: "SCHOOL OF MANAGEMENT SCIENCES", account: "7063000-Admission fees" },
    { id: 2, category: "Admission Fees", name: "Admission Fees Undergraduate", description: "Admission Fees Undergraduate Students", amount: 14500, schoolType: "SCHOOL OF MANAGEMENT SCIENCES", account: "7063000-Admission fees" },
    { id: 3, category: "Registration Fees", name: "Registration Fees Bsc SMS (New)", description: "Registration Fees Bsc SMS (New)", amount: 75000, schoolType: "SCHOOL OF MANAGEMENT SCIENCES", account: "7062000-Registration fees" },
    { id: 4, category: "Registration Fees", name: "Registration Fees Bsc SMS (OLD)", description: "Registration Fees Bsc SMS (OLD)", amount: 65000, schoolType: "SCHOOL OF MANAGEMENT SCIENCES", account: "7062000-Registration fees" },
    { id: 5, category: "Registration Fees", name: "Registration Fees HND SMS (New)", description: "Registration Fees Undrgraduation (New Students)", amount: 25000, schoolType: "SCHOOL OF MANAGEMENT SCIENCES", account: "7062000-Registration fees" },
    { id: 6, category: "Registration Fees", name: "Registration Fees HND SMS(OLD)", description: "Registration Fees Undergraduate (Old Students)", amount: 10000, schoolType: "SCHOOL OF MANAGEMENT SCIENCES", account: "7062000-Registration fees" },
    { id: 7, category: "Registration Fees", name: "Registration Fees MBA", description: "Registration Fees MBA", amount: 125000, schoolType: "SCHOOL OF MANAGEMENT SCIENCES", account: "7062000-Registration fees" },
    { id: 8, category: "Registration Fees", name: "Registration Fees Msc SMS", description: "Registration Fees Msc SMS", amount: 125000, schoolType: "SCHOOL OF MANAGEMENT SCIENCES", account: "7062000-Registration fees" },
    { id: 9, category: "Registration Fees", name: "Registration Fees TopUp Bsc", description: "Registration Fees TopUp Bsc", amount: 75000, schoolType: "SCHOOL OF MANAGEMENT SCIENCES", account: "7062000-Registration fees" },
    { id: 10, category: "Tuition Fees", name: "Tuition Fees Bsc SMS", description: "Tuition Fees Bsc SMS", amount: 350000, schoolType: "SCHOOL OF MANAGEMENT SCIENCES", account: "7061100-Tuition fees" },
    { id: 11, category: "Tuition Fees", name: "Tuition Fees HND SMS", description: "Tuition Fees HND SMS", amount: 300000, schoolType: "SCHOOL OF MANAGEMENT SCIENCES", account: "7061100-Tuition fees" },
    { id: 12, category: "Tuition Fees", name: "Tuition Fees MBA", description: "Tuition Fees MBA", amount: 800000, schoolType: "SCHOOL OF MANAGEMENT SCIENCES", account: "7061100-Tuition fees" },
    { id: 13, category: "Tuition Fees", name: "Tuition Fees Msc SMS", description: "Tuition Fees Msc SMS", amount: 550000, schoolType: "SCHOOL OF MANAGEMENT SCIENCES", account: "7061100-Tuition fees" },
    { id: 14, category: "Tuition Fees", name: "Tuition Fees TopUp Bsc SMS", description: "Tuition Fees TopUp Bsc SMS", amount: 350000, schoolType: "SCHOOL OF MANAGEMENT SCIENCES", account: "7061100-Tuition fees" }
];

window.collapsedFeeCategories = {};

window.initFinanceFeeTypes = function() {
    console.log("initFinanceFeeTypes: Initializing...");
    
    // Populate Modal Categories & Accounts list
    populateFeeTypesModalSelectors();
    
    // Render Table
    renderFeeTypesTable();
    setupFeeTypesSelection();
    
    // Header Checkbox Handler
    const hdrCb = document.getElementById('FT_HeaderCheckbox');
    if (hdrCb) {
        hdrCb.onclick = function() {
            const checked = this.checked;
            document.querySelectorAll('#TB_FeeTypes .row-checkbox').forEach(cb => {
                cb.checked = checked;
            });
        };
    }
    
    // Institution Type filter change handler
    const instSelect = document.getElementById('FT_SelectInstType');
    if (instSelect) {
        instSelect.onchange = function() {
            renderFeeTypesTable();
        };
    }
    
    // Ensure draggable utility works on the modal
    if (typeof makeElementDraggable === 'function') {
        const modal = document.querySelector('#MODAL_FeeType .coa-modal');
        const header = document.getElementById('MFT_Header');
        if (modal && header) makeElementDraggable(modal, header);
    }
    
    console.log("initFinanceFeeTypes: Done.");
};

function populateFeeTypesModalSelectors() {
    // Populate Categories select
    const catSelect = document.getElementById('MFT_Category');
    if (catSelect) {
        catSelect.innerHTML = '';
        const cats = window.feeCategories || [
            { id: 1, name: "Admission Fees" },
            { id: 2, name: "Registration Fees" },
            { id: 3, name: "Tuition Fees" }
        ];
        cats.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.name;
            opt.textContent = c.name;
            catSelect.appendChild(opt);
        });
    }
    
    // Populate Accounts select
    const accSelect = document.getElementById('MFT_AccountSelect');
    if (accSelect) {
        accSelect.innerHTML = '';
        const accs = [
            { code: "7061100", name: "Tuition fees Undergraduate" },
            { code: "7061200", name: "Tuition fees Postgraduate" },
            { code: "7061300", name: "Tuition fees HND" },
            { code: "7062000", name: "Registration fees" },
            { code: "7063000", name: "Admission fees" }
        ];
        accs.forEach(a => {
            const opt = document.createElement('option');
            opt.value = `${a.code}-${a.name}`;
            opt.textContent = `${a.code}-${a.name}`;
            accSelect.appendChild(opt);
        });
    }
}

function toggleFeeCategory(catName) {
    window.collapsedFeeCategories[catName] = !window.collapsedFeeCategories[catName];
    renderFeeTypesTable();
}

function renderFeeTypesTable() {
    const tbody = document.getElementById('TB_FeeTypes');
    if (!tbody) return;
    
    const filterInstType = document.getElementById('FT_SelectInstType').value;
    const cats = window.feeCategories ? window.feeCategories.map(x => x.name) : ["Admission Fees", "Registration Fees", "Tuition Fees"];
    
    let html = '';
    
    cats.forEach(cat => {
        const isCollapsed = !!window.collapsedFeeCategories[cat];
        const items = window.feeTypes.filter(x => x.category === cat && x.schoolType === filterInstType);
        
        // Group Header
        html += `
            <tr class="group-header-row ${isCollapsed ? 'collapsed' : ''}" onclick="toggleFeeCategory('${cat}')">
                <td colspan="4">
                    <i class="fa-solid fa-chevron-down"></i> ${cat}
                </td>
            </tr>
        `;
        
        // Group Items
        if (!isCollapsed) {
            items.forEach(item => {
                html += `
                    <tr class="fee-item-row" data-id="${item.id}">
                        <td style="text-align: center;" onclick="event.stopPropagation()">
                            <input type="checkbox" class="row-checkbox" data-id="${item.id}">
                        </td>
                        <td>${item.name}</td>
                        <td>${item.description}</td>
                        <td style="text-align: right; font-weight: bold;">${item.amount.toLocaleString('en-US')} FCFA</td>
                    </tr>
                `;
            });
            if (items.length === 0) {
                html += `<tr><td></td><td colspan="3" style="color: #888; font-style: italic; font-size: 11px;">No fee types configured for this category</td></tr>`;
            }
        }
    });
    
    tbody.innerHTML = html;
    
    // Pad empty rows
    for (let i = window.feeTypes.length; i < 15; i++) {
        tbody.insertAdjacentHTML('beforeend', '<tr><td>&nbsp;</td><td></td><td></td><td></td></tr>');
    }
}

function setupFeeTypesSelection() {
    const tbody = document.getElementById('TB_FeeTypes');
    if (!tbody) return;
    
    tbody.onclick = function(e) {
        const tr = e.target.closest('tr.fee-item-row');
        if (!tr) return;
        
        tbody.querySelectorAll('tr.fee-item-row').forEach(r => r.classList.remove('selected'));
        tr.classList.add('selected');
        window.FeeTypesManager.selectedId = tr.dataset.id;
    };
}

window.FeeTypesManager = {
    selectedId: null,
    
    openNew() {
        this.selectedId = null;
        document.getElementById('MFT_Title').textContent = "New Fee Type";
        document.getElementById('MFT_BodyHeader').textContent = "Creating a new fee types";
        document.getElementById('MFT_Form').reset();
        
        const filterInst = document.getElementById('FT_SelectInstType').value;
        document.getElementById('MFT_SchoolType').value = filterInst;
        
        document.getElementById('MODAL_FeeType').style.display = 'flex';
    },
    
    openModify() {
        if (!this.selectedId) return showAlert("Please select a record from the table first.", "error");
        const item = window.feeTypes.find(x => String(x.id) === String(this.selectedId));
        if (!item) return;
        
        document.getElementById('MFT_Title').textContent = "Modify Fee Type";
        document.getElementById('MFT_BodyHeader').textContent = "Modifying Fee Type Details";
        
        document.getElementById('MFT_FeeName').value = item.name;
        document.getElementById('MFT_Description').value = item.description;
        document.getElementById('MFT_SchoolType').value = item.schoolType;
        document.getElementById('MFT_Category').value = item.category;
        document.getElementById('MFT_Amount').value = item.amount;
        document.getElementById('MFT_AccountSelect').value = item.account;
        
        document.getElementById('MODAL_FeeType').style.display = 'flex';
    },
    
    closeModal() {
        document.getElementById('MODAL_FeeType').style.display = 'none';
    },
    
    handleSave() {
        const name = document.getElementById('MFT_FeeName').value.trim();
        const desc = document.getElementById('MFT_Description').value.trim();
        const schoolType = document.getElementById('MFT_SchoolType').value;
        const category = document.getElementById('MFT_Category').value;
        const amountStr = document.getElementById('MFT_Amount').value.trim();
        const account = document.getElementById('MFT_AccountSelect').value;
        
        if (!name || !desc || !amountStr) {
            return showAlert("Please fill in all required fields.", "error");
        }
        
        // Strip amount
        const amount = parseFloat(amountStr.replace(/[^\d.-]/g, ''));
        if (isNaN(amount)) return showAlert("Please enter a valid numeric amount.", "error");
        
        if (this.selectedId) {
            const idx = window.feeTypes.findIndex(x => String(x.id) === String(this.selectedId));
            if (idx !== -1) {
                window.feeTypes[idx] = { id: this.selectedId, category, name, description: desc, amount, schoolType, account };
                showAlert("Fee Type updated successfully.", "success");
            }
        } else {
            const nextId = window.feeTypes.length > 0 ? Math.max(...window.feeTypes.map(x => x.id)) + 1 : 1;
            window.feeTypes.push({ id: nextId, category, name, description: desc, amount, schoolType, account });
            showAlert("New Fee Type created successfully.", "success");
        }
        
        this.closeModal();
        renderFeeTypesTable();
    },
    
    handleDelete() {
        if (!this.selectedId) return showAlert("Please select an item to delete.", "error");
        
        if (typeof showConfirmModal === 'function') {
            showConfirmModal({
                title: "School Companion Setup *",
                message: "Are you sure you wish to delete this record? This Operation cannot be reversed.",
                okText: "Yes Delete",
                cancelText: "Cancel",
                onOk: () => {
                    window.feeTypes = window.feeTypes.filter(x => String(x.id) !== String(this.selectedId));
                    this.selectedId = null;
                    renderFeeTypesTable();
                    showAlert("Record deleted successfully.", "success");
                }
            });
        } else {
            const conf = confirm("Are you sure you wish to delete this record? This Operation cannot be reversed.");
            if (conf) {
                window.feeTypes = window.feeTypes.filter(x => String(x.id) !== String(this.selectedId));
                this.selectedId = null;
                renderFeeTypesTable();
                alert("Record deleted successfully.");
            }
        }
    }
};
