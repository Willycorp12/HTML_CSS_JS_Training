/**
 * js/security-access-levels.js
 * Handles Payroll Security Access Levels setup.
 */

window.payrollSecurityAccessLevels = [
    { id: 1, controlName: "Approve Transactions", l1: "Default", l2: "Default", l3: "Default", l4: "Default", maxSec: "Default" },
    { id: 2, controlName: "Loan Management", l1: "Default", l2: "Default", l3: "Default", l4: "Default", maxSec: "Default" },
    { id: 3, controlName: "Advance Salary", l1: "Default", l2: "Default", l3: "Default", l4: "Default", maxSec: "Default" },
    { id: 4, controlName: "Salary Additions", l1: "Default", l2: "Default", l3: "Default", l4: "Default", maxSec: "Default" },
    { id: 5, controlName: "Salary List", l1: "Default", l2: "Default", l3: "Default", l4: "Default", maxSec: "Default" },
    { id: 6, controlName: "Generate Salary", l1: "Default", l2: "Default", l3: "Default", l4: "Default", maxSec: "Default" },
    { id: 7, controlName: "Payslips", l1: "Default", l2: "Default", l3: "Default", l4: "Default", maxSec: "Default" },
    { id: 8, controlName: "Advance Salary Approval", l1: "Default", l2: "Default", l3: "Default", l4: "Default", maxSec: "Default" },
    { id: 9, controlName: "Exceptional Advances Approval", l1: "Default", l2: "Default", l3: "Default", l4: "Default", maxSec: "Default" },
    { id: 10, controlName: "Loan Approval", l1: "Default", l2: "Default", l3: "Default", l4: "Default", maxSec: "Default" },
    { id: 11, controlName: "Bonus Approval", l1: "Default", l2: "Default", l3: "Default", l4: "Default", maxSec: "Default" },
    { id: 12, controlName: "Pay Salaries", l1: "Default", l2: "Default", l3: "Default", l4: "Default", maxSec: "Default" },
    { id: 13, controlName: "Letter Templates", l1: "Default", l2: "Default", l3: "Default", l4: "Default", maxSec: "Default" },
    { id: 14, controlName: "Users Security Access", l1: "Default", l2: "Default", l3: "Default", l4: "Default", maxSec: "Default" },
    { id: 15, controlName: "Approve Transactions", l1: "Default", l2: "Default", l3: "Default", l4: "Default", maxSec: "Default" }
];

window.initSecurityAccessLevels = function() {
    console.log("initSecurityAccessLevels: Initializing...");
    
    renderSecurityAccessLevelsTable();
    setupSecurityAccessLevelsRowSelection();
    
    const updateBtn = document.getElementById('BTN_UpdateAccessLevels');
    if (updateBtn) {
        updateBtn.onclick = function() {
            saveSecurityAccessLevels();
        };
    }
    
    console.log("initSecurityAccessLevels: Done.");
};

function renderSecurityAccessLevelsTable() {
    const tbody = document.getElementById('TB_SecurityAccessLevels');
    if (!tbody) return;
    
    const options = ["Default", "Allowed", "Forbidden"];
    
    tbody.innerHTML = window.payrollSecurityAccessLevels.map(item => {
        const getSelectHtml = (fieldName, selectedValue) => `
            <select data-field="${fieldName}" data-id="${item.id}">
                ${options.map(opt => `<option value="${opt}" ${opt === selectedValue ? 'selected' : ''}>${opt}</option>`).join('')}
            </select>
        `;
        
        return `
            <tr data-id="${item.id}">
                <td style="width: 50px; text-align: center;">${item.id}</td>
                <td>${item.controlName}</td>
                <td>${getSelectHtml('l1', item.l1)}</td>
                <td>${getSelectHtml('l2', item.l2)}</td>
                <td>${getSelectHtml('l3', item.l3)}</td>
                <td>${getSelectHtml('l4', item.l4)}</td>
                <td>${getSelectHtml('maxSec', item.maxSec)}</td>
            </tr>
        `;
    }).join('');
    
    // Add empty rows if needed to fill the screen
    for (let i = window.payrollSecurityAccessLevels.length; i < 15; i++) {
        tbody.insertAdjacentHTML('beforeend', '<tr><td style="text-align: center;">&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>');
    }
}

function setupSecurityAccessLevelsRowSelection() {
    const tbody = document.getElementById('TB_SecurityAccessLevels');
    if (!tbody) return;
    
    tbody.onclick = function(e) {
        const tr = e.target.closest('tr');
        if (!tr || tr.cells[0].textContent.trim() === "") return;
        
        tbody.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
        tr.classList.add('selected');
    };
    
    // Sync dropdown changes back to dataset
    tbody.onchange = function(e) {
        const select = e.target;
        if (select.tagName !== 'SELECT') return;
        
        const id = parseInt(select.dataset.id, 10);
        const fieldName = select.dataset.field;
        const value = select.value;
        
        const item = window.payrollSecurityAccessLevels.find(x => x.id === id);
        if (item && fieldName) {
            item[fieldName] = value;
        }
    };
}

function saveSecurityAccessLevels() {
    // Collect all inputs and make sure dataset is in sync
    const tbody = document.getElementById('TB_SecurityAccessLevels');
    if (!tbody) return;
    
    tbody.querySelectorAll('select').forEach(select => {
        const id = parseInt(select.dataset.id, 10);
        const fieldName = select.dataset.field;
        const value = select.value;
        
        const item = window.payrollSecurityAccessLevels.find(x => x.id === id);
        if (item && fieldName) {
            item[fieldName] = value;
        }
    });
    
    if (typeof showAlert === 'function') {
        showAlert("Security access settings updated successfully.", "success");
    } else {
        alert("Security access settings updated successfully.");
    }
}
