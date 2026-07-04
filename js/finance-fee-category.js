/**
 * js/finance-fee-category.js
 * Handles Fee Category Setup logic.
 */

window.feeCategories = [
    { id: 1, name: "Admission Fees" },
    { id: 2, name: "Registration Fees" },
    { id: 3, name: "Tuition Fees" }
];

window.initFinanceFeeCategory = function() {
    console.log("initFinanceFeeCategory: Initializing...");
    
    renderFeeCategoryTable();
    setupFeeCategorySelection();
    
    // Ensure draggable utility works on the modal
    if (typeof makeElementDraggable === 'function') {
        const modal = document.querySelector('#MODAL_FeeCategory .coa-modal');
        const header = document.getElementById('MFC_CatHeader');
        if (modal && header) makeElementDraggable(modal, header);
    }
    
    console.log("initFinanceFeeCategory: Done.");
};

window.FeeCategoryManager = {
    selectedId: null,
    
    openNew() {
        this.selectedId = null;
        document.getElementById('MFC_CatTitle').textContent = "New Fees Category";
        document.getElementById('MFC_CatBodyHeader').textContent = "Creating a new Fees Category";
        document.getElementById('MFC_CatForm').reset();
        document.getElementById('MODAL_FeeCategory').style.display = 'flex';
    },
    
    openModify() {
        if (!this.selectedId) return showAlert("Please select a record from the table first.", "error");
        const item = window.feeCategories.find(x => String(x.id) === String(this.selectedId));
        if (!item) return;
        
        document.getElementById('MFC_CatTitle').textContent = "Modify Fees Category";
        document.getElementById('MFC_CatBodyHeader').textContent = "Modifying Fees Category Details";
        document.getElementById('MFC_CatName').value = item.name;
        document.getElementById('MODAL_FeeCategory').style.display = 'flex';
    },
    
    closeModal() {
        document.getElementById('MODAL_FeeCategory').style.display = 'none';
    },
    
    handleSave() {
        const nameInput = document.getElementById('MFC_CatName');
        const name = nameInput.value.trim();
        
        if (!name) return showAlert("Please fill in Category Name.", "error");
        
        if (this.selectedId) {
            const idx = window.feeCategories.findIndex(x => String(x.id) === String(this.selectedId));
            if (idx !== -1) {
                window.feeCategories[idx].name = name;
                showAlert("Fee Category updated successfully.", "success");
            }
        } else {
            const nextId = window.feeCategories.length > 0 ? Math.max(...window.feeCategories.map(x => x.id)) + 1 : 1;
            window.feeCategories.push({ id: nextId, name });
            showAlert("New Fee Category created successfully.", "success");
        }
        
        this.closeModal();
        renderFeeCategoryTable();
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
                    window.feeCategories = window.feeCategories.filter(x => String(x.id) !== String(this.selectedId));
                    this.selectedId = null;
                    renderFeeCategoryTable();
                    showAlert("Record deleted successfully.", "success");
                }
            });
        } else {
            const conf = confirm("Are you sure you wish to delete this record? This Operation cannot be reversed.");
            if (conf) {
                window.feeCategories = window.feeCategories.filter(x => String(x.id) !== String(this.selectedId));
                this.selectedId = null;
                renderFeeCategoryTable();
                alert("Record deleted successfully.");
            }
        }
    }
};

function renderFeeCategoryTable() {
    const tbody = document.getElementById('TB_FeeCategories');
    if (!tbody) return;
    
    tbody.innerHTML = window.feeCategories.map(cat => `
        <tr data-id="${cat.id}">
            <td style="width: 80px; text-align: center;">${cat.id}</td>
            <td>${cat.name}</td>
        </tr>
    `).join('');
    
    for (let i = window.feeCategories.length; i < 15; i++) {
        tbody.insertAdjacentHTML('beforeend', '<tr><td style="text-align: center;">&nbsp;</td><td></td></tr>');
    }
}

function setupFeeCategorySelection() {
    const tbody = document.getElementById('TB_FeeCategories');
    if (!tbody) return;
    
    tbody.onclick = function(e) {
        const tr = e.target.closest('tr');
        if (!tr || tr.cells[0].textContent.trim() === "") return;
        
        tbody.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
        tr.classList.add('selected');
        window.FeeCategoryManager.selectedId = tr.dataset.id;
    };
}
