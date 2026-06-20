/**
 * js/setup-academic-year.js
 * Handles Academic Year Setup logic.
 */

// Shared Dataset
window.academicYears = [
    { id: 1, name: "ACADEMIC YEAR 2020 - 2021", start: "2020-10-01", end: "2021-09-30" },
    { id: 2, name: "ACADEMIC YEAR 2021 - 2022", start: "2021-10-01", end: "2022-09-30" },
    { id: 3, name: "ACADEMIC YEAR 2022 - 2023", start: "2022-10-01", end: "2023-09-30" },
    { id: 4, name: "ACADEMIC YEAR 2023 - 2024", start: "2023-10-01", end: "2024-09-30" },
    { id: 5, name: "ACADEMIC YEAR 2024 - 2025", start: "2024-10-01", end: "2025-09-30" },
    { id: 8, name: "ACADEMIC YEAR 2025 - 2026", start: "2025-10-01", end: "2026-09-30" }
];

window.initAcademicYearSetup = function() {
    console.log("initAcademicYearSetup: Initializing interface...");
    
    renderAcademicYearTable();
    setupAcademicYearRowSelection();
    
    // Ensure draggable utility works on the modal
    if (typeof makeElementDraggable === 'function') {
        const modal = document.querySelector('#MODAL_AcademicYear .coa-modal');
        const header = document.getElementById('MAY_Header');
        if (modal && header) makeElementDraggable(modal, header);
    }

    console.log("initAcademicYearSetup: Done.");
};

window.AcademicYearModalManager = {
    selectedId: null,
    
    openNew() {
        this.selectedId = null;
        document.getElementById('MAY_Title').textContent = "New Academic Year";
        document.getElementById('MAY_Form').reset();
        document.getElementById('MODAL_AcademicYear').style.display = 'flex';
    },
    
    openModify() {
        if (!this.selectedId) return showAlert("Please select a record from the table first.", "error");
        const item = window.academicYears.find(x => String(x.id) === String(this.selectedId));
        if (!item) return;
        
        document.getElementById('MAY_Title').textContent = "Modify Academic Year";
        document.getElementById('MAY_Name').value = item.name;
        document.getElementById('MAY_Start').value = item.start;
        document.getElementById('MAY_End').value = item.end;
        
        document.getElementById('MODAL_AcademicYear').style.display = 'flex';
    },
    
    closeModal() {
        document.getElementById('MODAL_AcademicYear').style.display = 'none';
    },
    
    handleSave() {
        const name = document.getElementById('MAY_Name').value.trim();
        const start = document.getElementById('MAY_Start').value;
        const end = document.getElementById('MAY_End').value;
        
        if (!name || !start || !end) return showAlert("Please fill in all obligatory fields.", "error");
        
        if (this.selectedId) {
            const idx = window.academicYears.findIndex(x => String(x.id) === String(this.selectedId));
            window.academicYears[idx] = { id: this.selectedId, name, start, end };
            showAlert("Academic Year record updated successfully.", "success");
        } else {
            const nextId = window.academicYears.length > 0 ? Math.max(...window.academicYears.map(x => x.id)) + 1 : 1;
            window.academicYears.push({ id: nextId, name, start, end });
            showAlert("New Academic Year created successfully.", "success");
        }
        
        this.closeModal();
        renderAcademicYearTable();
    },
    
    handleDelete() {
        if (!this.selectedId) return showAlert("Please select an item to delete.", "error");
        showConfirmModal({
            title: "Confirm Deletion",
            message: "Are you sure you want to delete this Academic Year record? This action cannot be reversed.",
            onOk: () => {
                window.academicYears = window.academicYears.filter(x => String(x.id) !== String(this.selectedId));
                this.selectedId = null;
                renderAcademicYearTable();
                showAlert("Record deleted successfully.", "success");
            }
        });
    }
};

function renderAcademicYearTable() {
    const tbody = document.getElementById('TB_AcademicYears');
    if (!tbody) return;
    
    tbody.innerHTML = window.academicYears.map(ay => `
        <tr data-id="${ay.id}">
            <td style="width: 50px; text-align: center;">${ay.id}</td>
            <td>${ay.name}</td>
            <td style="width: 150px; text-align: center;">${new Date(ay.start).toLocaleDateString('en-GB')}</td>
            <td style="width: 150px; text-align: center;">${new Date(ay.end).toLocaleDateString('en-GB')}</td>
        </tr>
    `).join('');
    
    for(let i=window.academicYears.length; i<15; i++) tbody.insertAdjacentHTML('beforeend', '<tr><td>&nbsp;</td><td></td><td></td><td></td></tr>');
}

function setupAcademicYearRowSelection() {
    const tbody = document.getElementById('TB_AcademicYears');
    tbody.addEventListener('click', (e) => {
        const tr = e.target.closest('tr');
        if (!tr || tr.cells[0].textContent.trim() === "") return;
        tbody.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
        tr.classList.add('selected');
        window.AcademicYearModalManager.selectedId = tr.dataset.id;
    });
}