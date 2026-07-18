/**
 * js/other-hcm.js
 * Controls Other HCM Setup screen logic.
 * Integrates with Payroll Lookup CRUD API endpoints.
 */

// Map tab names to API sType values
const TAB_TO_STYPE = {
    branches:     "branch",
    departments:  "department",
    positions:    "position",
    categories:   "category",
    echelons:     "echelon",
    titles:       "title",
    nationalities:"nationality",
    denominations:"denomination"
};

// In-memory collections for each setup category (populated from API where applicable)
window.otherHcmData = {
    branches:     [],
    departments:  [],
    directions: [
        { id: 1, description: "SEAS" },
        { id: 2, description: "DAAC/AKWA" },
        { id: 3, description: "PISTI" },
        { id: 4, description: "DAAF" }
    ],
    positions:       [],
    categories:      [],
    echelons:        [],
    titles:          [],
    nationalities:   [],
    denominations:   [],
    salaryCategories: [
        { id: 1, name: "Basic Salary Level 1", amount: 150000 },
        { id: 2, name: "Basic Salary Level 2", amount: 250000 }
    ]
};

window.initOtherHcm = function() {
    console.log("initOtherHcm: Initializing...");
    
    // Load data for the default active tab from API, then render
    OtherHcmManager.loadAndRender();
    
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
    
    /**
     * Returns the API sType for the current tab, or null if the tab is local-only.
     */
    getSType(tabName) {
        return TAB_TO_STYPE[tabName || this.activeTab] || null;
    },

    /**
     * Fetches lookup records from the API for the given tab,
     * stores them in otherHcmData, then renders the table.
     */
    async loadAndRender(tabName) {
        const tab = tabName || this.activeTab;
        const sType = this.getSType(tab);

        if (sType) {
            try {
                const res = await apiFetch(`/api/v1/payroll/getLookups/${sType}`);
                if (res && res.success && Array.isArray(res.data)) {
                    window.otherHcmData[tab] = res.data;
                } else {
                    const msg = res?.message || "Failed to load records.";
                    console.warn(`loadAndRender [${sType}]:`, msg);
                    showAlert(msg, "error");
                }
            } catch (err) {
                console.error(`loadAndRender [${sType}]:`, err);
                showAlert("Network error while loading records.", "error");
            }
        }

        this.renderTable();
        this.setupSelection();
    },

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
        
        // Fetch fresh data from API then render
        this.loadAndRender(tabName);
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
            nationalities: "Nationality Name",
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
    
    /**
     * Opens Modify modal. For API-backed tabs, fetches the record details
     * via GET /getLookupDetails/{sType}/{nLookupID} before populating.
     */
    async openModify() {
        if (!this.selectedId) return showAlert("Please select a record from the table first.", "error");

        const sType = this.getSType();
        let item = null;

        if (sType) {
            // Fetch fresh details from the API
            try {
                const res = await apiFetch(`/api/v1/payroll/getLookupDetails/${sType}/${this.selectedId}`);
                if (res && res.success && res.data) {
                    item = res.data;
                } else {
                    return showAlert(res?.message || "Failed to load record details.", "error");
                }
            } catch (err) {
                console.error("openModify fetch error:", err);
                return showAlert("Network error while loading record details.", "error");
            }
        } else {
            // Local-only tabs (directions, salaryCategories)
            const list = window.otherHcmData[this.activeTab] || [];
            item = list.find(x => String(x.id) === String(this.selectedId));
        }

        if (!item) return showAlert("Record not found.", "error");
        
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
    
    /**
     * Saves a record. For API-backed tabs:
     *   - New: POST /api/v1/payroll/addLookup  with { type, name, code }
     *   - Modify: PUT /api/v1/payroll/updateLookup/{sType}/{nLookupID} with { name, code }
     * For local-only tabs (directions, salaryCategories): keeps in-memory logic.
     */
    async handleSave() {
        const val = document.getElementById('INP_MohValue').value.trim();
        if (!val) return showAlert("Please enter a valid value.", "error");

        const sType = this.getSType();

        // ── API-backed tabs ──
        if (sType) {
            const body = { name: val };

            if (this.selectedId) {
                // PUT update
                try {
                    const res = await apiFetch(`/api/v1/payroll/updateLookup/${sType}/${this.selectedId}`, {
                        method: "PUT",
                        body
                    });
                    if (res && res.success) {
                        showAlert(res.message || "Record updated successfully.", "success");
                    } else {
                        return showAlert(res?.message || "Update failed.", "error");
                    }
                } catch (err) {
                    console.error("handleSave PUT error:", err);
                    return showAlert("Network error while updating record.", "error");
                }
            } else {
                // POST create
                try {
                    const res = await apiFetch("/api/v1/payroll/addLookup", {
                        method: "POST",
                        body: { type: sType, ...body }
                    });
                    if (res && res.success) {
                        showAlert(res.message || "New record created successfully.", "success");
                    } else {
                        return showAlert(res?.message || "Creation failed.", "error");
                    }
                } catch (err) {
                    console.error("handleSave POST error:", err);
                    return showAlert("Network error while creating record.", "error");
                }
            }

            this.closeModal();
            // Refresh the table from the API
            await this.loadAndRender();
            return;
        }

        // ── Local-only tabs (directions, salaryCategories) ──
        const list = window.otherHcmData[this.activeTab];

        if (this.selectedId) {
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
    
    /**
     * Deletes a record. For API-backed tabs:
     *   DELETE /api/v1/payroll/deleteLookup/{sType}/{nLookupID}
     * For local-only tabs: removes from in-memory array.
     */
    handleDelete() {
        if (!this.selectedId) return showAlert("Please select a record to delete.", "error");

        const performDelete = async () => {
            const sType = this.getSType();

            if (sType) {
                // API delete
                try {
                    const res = await apiFetch(`/api/v1/payroll/deleteLookup/${sType}/${this.selectedId}`, {
                        method: "DELETE"
                    });
                    if (res && res.success) {
                        showAlert(res.message || "Record deleted successfully.", "success");
                        this.selectedId = null;
                        await this.loadAndRender();
                    } else {
                        showAlert(res?.message || "Delete failed.", "error");
                    }
                } catch (err) {
                    console.error("handleDelete error:", err);
                    showAlert("Network error while deleting record.", "error");
                }
            } else {
                // Local-only delete
                window.otherHcmData[this.activeTab] = window.otherHcmData[this.activeTab].filter(x => String(x.id) !== String(this.selectedId));
                this.selectedId = null;
                this.renderTable();
                showAlert("Record deleted successfully.", "success");
            }
        };
        
        if (typeof showConfirmModal === 'function') {
            showConfirmModal({
                title: "Confirm Deletion",
                message: "Are you sure you wish to delete this record? This Operation cannot be reversed.",
                okText: "Yes, Delete",
                cancelText: "Cancel",
                onOk: () => performDelete()
            });
        } else {
            const conf = confirm("Are you sure you wish to delete this record? This Operation cannot be reversed.");
            if (conf) performDelete();
        }
    }
};
