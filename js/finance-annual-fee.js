/**
 * js/finance-annual-fee.js
 * Handles Annual Fee Composition setup.
 */

window.feeCompositions = [
    { id: 1, className: "HND Accounting and Finance(AF)", description: "Annual Fee Composition for HND Accounting and Finance(AF)" },
    { id: 2, className: "HND BANKING AND FINANCE(HBF)", description: "Annual Fee Composition for HND BANKING AND FINANCE(HBF)" },
    { id: 3, className: "HND in Health Care Management(HC)", description: "Annual Fee Composition for HND in Health Care Management(HC)" },
    { id: 4, className: "HND In Insurance and Risk Management(HIR)", description: "Annual Fee Composition for HND In Insurance and Risk Management(HIR)" },
    { id: 5, className: "HND in Marketing(HMK)", description: "Annual Fee Composition for HND in Marketing(HMK)" },
    { id: 6, className: "BSc. in Accounting and Finance(AC)", description: "Annual Fee Composition for BSc. in Accounting and Finance(AC)" },
    { id: 7, className: "BSc. in Banking and Finance(BF)", description: "Annual Fee Composition for BSc. in Banking and Finance(BF)" },
    { id: 8, className: "BSc. in Events and Conferences Management(ECM)", description: "Annual Fee Composition for BSc. in Events and Conferences Management(ECM)" },
    { id: 9, className: "BSc. in Human Resource Management(HRM)", description: "Annual Fee Composition for BSc. in Human Resource Management(HRM)" },
    { id: 10, className: "BSc. in Management(MG)", description: "Annual Fee Composition for BSc. in Management(MG)" },
    { id: 11, className: "BSc. in Supply Chain Management(SC)", description: "Annual Fee Composition for BSc. in Supply Chain Management(SC)" },
    { id: 12, className: "BSc. in Tourism and Hotel Management(THM)", description: "Annual Fee Composition for BSc. in Tourism and Hotel Management(THM)" },
    { id: 13, className: "Top-Up Msc. in Management(TMG)", description: "Annual Fee Composition for Top-Up Msc. in Management(TMG)" },
    { id: 14, className: "Top-Up Msc. in Accounting & Finance (TAC)", description: "Annual Fee Composition for Top-Up Msc. in Accounting & Finance (TAC)" },
    { id: 15, className: "Top-Up Msc. in Banking and Finance(BF)", description: "Annual Fee Composition for Top-Up Msc. in Banking and Finance(BF)" },
    { id: 16, className: "Top-Up Msc. in Human Resource Management(THR)", description: "Annual Fee Composition for Top-Up Msc. in Human Resource Management(THR)" },
    { id: 17, className: "Top-Up Msc. in Marketing(MK)", description: "Annual Fee Composition for Top-Up Msc. in Marketing(MK)" },
    { id: 18, className: "M.Sc in Accounting and Finance(MAF)", description: "Annual Fee Composition for M.Sc in Accounting and Finance(MAF)" },
    { id: 19, className: "M.Sc in Banking and Finance(FM)", description: "Annual Fee Composition for M.Sc in Banking and Finance(FM)" },
    { id: 20, className: "M.Sc in Human Resource Management(HR)", description: "Annual Fee Composition for M.Sc in Human Resource Management(HR)" },
    { id: 21, className: "M.Sc in Logistics and Supply Chain Management(SC)", description: "Annual Fee Composition for M.Sc in Logistics and Supply Chain Management(SC)" }
];

window.initFinanceAnnualFee = function() {
    console.log("initFinanceAnnualFee: Initializing...");
    
    // Populate batch/year dropdown
    populateFeeBatchDropdown();
    
    // Initial Table Render
    renderFeeCompositionTable();
    setupFeeCompositionSelection();
    
    // Setup Modal Drag
    if (typeof makeElementDraggable === 'function') {
        const modal = document.querySelector('#MODAL_FeeComposition .coa-modal');
        const header = document.getElementById('MFC_Header');
        if (modal && header) makeElementDraggable(modal, header);
    }
    
    // Event listeners
    const modifyBtn = document.getElementById('BTN_ModifyFeeComposition');
    if (modifyBtn) {
        modifyBtn.onclick = function() {
            FeeCompositionModalManager.openModify();
        };
    }
    
    const saveBtn = document.getElementById('BTN_SaveFeeComposition');
    if (saveBtn) {
        saveBtn.onclick = function() {
            FeeCompositionModalManager.handleSave();
        };
    }
    
    const batchSelect = document.getElementById('FEE_SelectBatch');
    const instSelect = document.getElementById('FEE_SelectInstType');
    
    const onFilterChange = function() {
        // Here we can simulate loading data for different batch/years or institution types
        console.log(`Filters changed: Batch=${batchSelect.value}, Institution=${instSelect.value}`);
        // Let's reset selection and re-render
        FeeCompositionModalManager.selectedId = null;
        renderFeeCompositionTable();
    };
    
    if (batchSelect) batchSelect.onchange = onFilterChange;
    if (instSelect) instSelect.onchange = onFilterChange;
    
    console.log("initFinanceAnnualFee: Done.");
};

function populateFeeBatchDropdown() {
    const select = document.getElementById('FEE_SelectBatch');
    if (!select) return;
    
    select.innerHTML = '';
    
    // Use academicYears if available
    const years = window.academicYears || [
        { id: 8, name: "ACADEMIC YEAR 2025 - 2026" },
        { id: 5, name: "ACADEMIC YEAR 2024 - 2025" },
        { id: 4, name: "ACADEMIC YEAR 2023 - 2024" }
    ];
    
    years.forEach(ay => {
        const opt = document.createElement('option');
        opt.value = ay.name;
        opt.textContent = ay.name;
        select.appendChild(opt);
    });
}

function renderFeeCompositionTable() {
    const tbody = document.getElementById('TB_AnnualFeeComposition');
    if (!tbody) return;
    
    tbody.innerHTML = window.feeCompositions.map(item => `
        <tr data-id="${item.id}">
            <td style="width: 60px; text-align: center;">${item.id}</td>
            <td style="width: 350px;">${item.className}</td>
            <td>${item.description}</td>
        </tr>
    `).join('');
    
    // Pad empty rows
    for (let i = window.feeCompositions.length; i < 15; i++) {
        tbody.insertAdjacentHTML('beforeend', '<tr><td style="text-align: center;">&nbsp;</td><td></td><td></td></tr>');
    }
}

function setupFeeCompositionSelection() {
    const tbody = document.getElementById('TB_AnnualFeeComposition');
    if (!tbody) return;
    
    tbody.onclick = function(e) {
        const tr = e.target.closest('tr');
        if (!tr || tr.cells[0].textContent.trim() === "") return;
        
        tbody.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
        tr.classList.add('selected');
        FeeCompositionModalManager.selectedId = tr.dataset.id;
    };
}

window.FeeCompositionModalManager = {
    selectedId: null,
    
    openModify() {
        if (!this.selectedId) {
            return showAlert("Please select a record from the table first.", "error");
        }
        
        const item = window.feeCompositions.find(x => String(x.id) === String(this.selectedId));
        if (!item) return;
        
        document.getElementById('MFC_ClassName').value = item.className;
        document.getElementById('MFC_Description').value = item.description;
        document.getElementById('MODAL_FeeComposition').style.display = 'flex';
    },
    
    closeModal() {
        document.getElementById('MODAL_FeeComposition').style.display = 'none';
    },
    
    handleSave() {
        const desc = document.getElementById('MFC_Description').value.trim();
        if (!desc) {
            return showAlert("Description cannot be empty.", "error");
        }
        
        const item = window.feeCompositions.find(x => String(x.id) === String(this.selectedId));
        if (item) {
            item.description = desc;
            showAlert("Annual Fee Composition updated successfully.", "success");
            this.closeModal();
            renderFeeCompositionTable();
            // Re-select the row
            const tbody = document.getElementById('TB_AnnualFeeComposition');
            if (tbody) {
                const tr = tbody.querySelector(`tr[data-id="${this.selectedId}"]`);
                if (tr) tr.classList.add('selected');
            }
        }
    }
};
