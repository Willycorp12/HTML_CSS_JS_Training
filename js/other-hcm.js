/**
 * js/other-hcm.js
 * Controls Other HCM Setup screen logic.
 */

// In-memory collections for each setup category
window.otherHcmData = {
    branches: [
        { id: 1, name: "Main Branch Douala" },
        { id: 2, name: "Yaounde Agency" },
        { id: 3, name: "Buea Center" }
    ],
    departments: [
        { id: 1, name: "Administration & HR" },
        { id: 2, name: "Accounting & Finance" },
        { id: 3, name: "Operations & Logistics" }
    ],
    directions: [
        { id: 1, description: "SEAS" },
        { id: 2, description: "DAAC/AKWA" },
        { id: 3, description: "PISTI" },
        { id: 4, description: "DAAF" }
    ],
    positions: [
        { id: 1, name: "Accountant" },
        { id: 2, name: "Accounting Officer" },
        { id: 3, name: "Driver" }
    ],
    categories: [
        { id: 1, name: "Category 1", lowerLimit: 0, upperLimit: 0 },
        { id: 2, name: "Category 2", lowerLimit: 0, upperLimit: 0 },
        { id: 3, name: "Category 3", lowerLimit: 0, upperLimit: 0 }
    ],
    echelons: [
        { id: 1, name: "Echelon A" },
        { id: 2, name: "Echelon B" },
        { id: 3, name: "Echelon C" }
    ],
    titles: [
        { id: 1, name: "Mr." },
        { id: 2, name: "Mrs." },
        { id: 3, name: "Dr." }
    ],
    denominations: [
        { id: 1, name: "Catholic" },
        { id: 2, name: "Pentecostal" },
        { id: 3, name: "Muslim" }
    ],
    salaryCategories: [
        { id: 1, name: "Basic Salary Level 1", amount: 150000 },
        { id: 2, name: "Basic Salary Level 2", amount: 250000 }
    ]
};

window.initOtherHcm = function() {
    console.log("initOtherHcm: Initializing...");
    
    // Render initial active tab (branches)
    OtherHcmManager.renderTable();
    OtherHcmManager.setupSelection();
    
    // Ensure draggable utility works on the modal
    if (typeof makeElementDraggable === 'function') {
        const modal = document.querySelector('#MODAL_OtherHcm .coa-modal');
        const header = document.getElementById('MOH_Header');
        if (modal && header) makeElementDraggable(modal, header);
    }
    
    console.log("initOtherHcm: Ready.");
};

window.OtherHcmManager = {
    activeTab: 'branches',
    selectedId: null,
    
    switchTab(tabName, element) {
        // Toggle tab classes
        document.querySelectorAll('.hcm-tab').forEach(t => t.classList.remove('active'));
        element.classList.add('active');
        
        // Toggle panel display
        document.querySelectorAll('.hcm-panel').forEach(p => p.style.display = 'none');
        const activePanel = document.getElementById(`PANEL_${tabName}`);
        if (activePanel) activePanel.style.display = 'block';
        
        this.activeTab = tabName;
        this.selectedId = null;
        
        this.renderTable();
        this.setupSelection();
    },
    
    renderTable() {
        const list = window.otherHcmData[this.activeTab] || [];
        const tbody = document.getElementById(`TB_hcm_${this.activeTab}`);
        if (!tbody) return;
        
        let html = '';
        list.forEach(item => {
            if (this.activeTab === 'categories') {
                html += `
                    <tr data-id="${item.id}">
                        <td style="width: 120px; text-align: center;">${item.id}</td>
                        <td>${item.name}</td>
                        <td style="width: 150px; text-align: right; font-weight: bold;">${Number(item.lowerLimit || 0).toLocaleString()}</td>
                        <td style="width: 150px; text-align: right; font-weight: bold;">${Number(item.upperLimit || 0).toLocaleString()}</td>
                    </tr>
                `;
            } else if (this.activeTab === 'directions') {
                html += `
                    <tr data-id="${item.id}">
                        <td style="width: 120px; text-align: center;">${item.id}</td>
                        <td>${item.description}</td>
                    </tr>
                `;
            } else if (this.activeTab === 'salaryCategories') {
                html += `
                    <tr data-id="${item.id}">
                        <td style="width: 150px; text-align: center;">${item.id}</td>
                        <td>${item.name}</td>
                        <td style="width: 150px; text-align: right; font-weight: bold;">${Number(item.amount || 0).toLocaleString()} FCFA</td>
                    </tr>
                `;
            } else {
                html += `
                    <tr data-id="${item.id}">
                        <td style="width: 120px; text-align: center;">${item.id}</td>
                        <td>${item.name}</td>
                    </tr>
                `;
            }
        });
        
        tbody.innerHTML = html;
        
        // Append empty rows for design consistency
        const colsCount = this.activeTab === 'categories' ? 4 : (this.activeTab === 'salaryCategories' ? 3 : 2);
        for (let i = list.length; i < 15; i++) {
            tbody.insertAdjacentHTML('beforeend', `<tr><td style="text-align: center;">&nbsp;</td>${'<td></td>'.repeat(colsCount - 1)}</tr>`);
        }
    },
    
    setupSelection() {
        const tbody = document.getElementById(`TB_hcm_${this.activeTab}`);
        if (!tbody) return;
        
        tbody.onclick = (e) => {
            const tr = e.target.closest('tr');
            if (!tr || tr.cells[0].textContent.trim() === "") return;
            
            tbody.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
            tr.classList.add('selected');
            this.selectedId = tr.dataset.id;
        };
    },
    
    getLabelName() {
        const labelMap = {
            branches: "Branch Name",
            departments: "Department Name",
            directions: "Direction Description",
            positions: "Position Name",
            categories: "Category Name",
            echelons: "Echelon Name",
            titles: "Title Name",
            denominations: "Denomination Name",
            salaryCategories: "Salary Category Name"
        };
        return labelMap[this.activeTab] || "Name";
    },
    
    openNew() {
        this.selectedId = null;
        
        const label = this.getLabelName();
        document.getElementById('LBL_MohValue').textContent = label;
        document.getElementById('MOH_Form').reset();
        
        // Configure Title & Subtitle Headers
        const titleText = this.activeTab.charAt(0).toUpperCase() + this.activeTab.slice(1).replace(/([A-Z])/g, ' $1');
        document.getElementById('MOH_Title').textContent = `New ${titleText} Setup`;
        document.getElementById('MOH_BodyHeader').textContent = `Creating a new ${titleText.slice(0, -5)}`;
        
        // Show/Hide specific category or salary fields
        document.querySelectorAll('.field-cat-only').forEach(el => el.style.display = this.activeTab === 'categories' ? 'flex' : 'none');
        document.querySelectorAll('.field-sal-only').forEach(el => el.style.display = this.activeTab === 'salaryCategories' ? 'flex' : 'none');
        
        document.getElementById('MODAL_OtherHcm').style.display = 'flex';
    },
    
    openModify() {
        if (!this.selectedId) return showAlert("Please select a record from the table first.", "error");
        
        const list = window.otherHcmData[this.activeTab] || [];
        const item = list.find(x => String(x.id) === String(this.selectedId));
        if (!item) return;
        
        const label = this.getLabelName();
        document.getElementById('LBL_MohValue').textContent = label;
        
        // Configure Title & Subtitle Headers
        const titleText = this.activeTab.charAt(0).toUpperCase() + this.activeTab.slice(1).replace(/([A-Z])/g, ' $1');
        document.getElementById('MOH_Title').textContent = `Modify ${titleText} Setup`;
        document.getElementById('MOH_BodyHeader').textContent = `Modifying ${titleText.slice(0, -5)} Details`;
        
        // Show/Hide specific fields
        document.querySelectorAll('.field-cat-only').forEach(el => el.style.display = this.activeTab === 'categories' ? 'flex' : 'none');
        document.querySelectorAll('.field-sal-only').forEach(el => el.style.display = this.activeTab === 'salaryCategories' ? 'flex' : 'none');
        
        // Populate inputs
        document.getElementById('INP_MohValue').value = this.activeTab === 'directions' ? item.description : item.name;
        if (this.activeTab === 'categories') {
            document.getElementById('INP_MohLowerLimit').value = item.lowerLimit || 0;
            document.getElementById('INP_MohUpperLimit').value = item.upperLimit || 0;
        }
        if (this.activeTab === 'salaryCategories') {
            document.getElementById('INP_MohAmount').value = item.amount || 0;
        }
        
        document.getElementById('MODAL_OtherHcm').style.display = 'flex';
    },
    
    closeModal() {
        document.getElementById('MODAL_OtherHcm').style.display = 'none';
    },
    
    handleSave() {
        const val = document.getElementById('INP_MohValue').value.trim();
        if (!val) return showAlert("Please enter a valid value.", "error");
        
        const list = window.otherHcmData[this.activeTab];
        
        if (this.selectedId) {
            // Modify mode
            const idx = list.findIndex(x => String(x.id) === String(this.selectedId));
            if (idx !== -1) {
                if (this.activeTab === 'directions') {
                    list[idx].description = val;
                } else {
                    list[idx].name = val;
                }
                
                if (this.activeTab === 'categories') {
                    list[idx].lowerLimit = parseFloat(document.getElementById('INP_MohLowerLimit').value) || 0;
                    list[idx].upperLimit = parseFloat(document.getElementById('INP_MohUpperLimit').value) || 0;
                }
                if (this.activeTab === 'salaryCategories') {
                    list[idx].amount = parseFloat(document.getElementById('INP_MohAmount').value) || 0;
                }
                showAlert("Record updated successfully.", "success");
            }
        } else {
            // Create mode
            const nextId = list.length > 0 ? Math.max(...list.map(x => x.id)) + 1 : 1;
            const newItem = { id: nextId };
            
            if (this.activeTab === 'directions') {
                newItem.description = val;
            } else {
                newItem.name = val;
            }
            
            if (this.activeTab === 'categories') {
                newItem.lowerLimit = parseFloat(document.getElementById('INP_MohLowerLimit').value) || 0;
                newItem.upperLimit = parseFloat(document.getElementById('INP_MohUpperLimit').value) || 0;
            }
            if (this.activeTab === 'salaryCategories') {
                newItem.amount = parseFloat(document.getElementById('INP_MohAmount').value) || 0;
            }
            
            list.push(newItem);
            showAlert("New record created successfully.", "success");
        }
        
        this.closeModal();
        this.renderTable();
    },
    
    handleDelete() {
        if (!this.selectedId) return showAlert("Please select a record to delete.", "error");
        
        if (typeof showConfirmModal === 'function') {
            showConfirmModal({
                title: "Confirm Deletion",
                message: "Are you sure you wish to delete this record? This Operation cannot be reversed.",
                okText: "Yes, Delete",
                cancelText: "Cancel",
                onOk: () => {
                    window.otherHcmData[this.activeTab] = window.otherHcmData[this.activeTab].filter(x => String(x.id) !== String(this.selectedId));
                    this.selectedId = null;
                    this.renderTable();
                    showAlert("Record deleted successfully.", "success");
                }
            });
        } else {
            const conf = confirm("Are you sure you wish to delete this record? This Operation cannot be reversed.");
            if (conf) {
                window.otherHcmData[this.activeTab] = window.otherHcmData[this.activeTab].filter(x => String(x.id) !== String(this.selectedId));
                this.selectedId = null;
                this.renderTable();
                alert("Record deleted successfully.");
            }
        }
    }
};
