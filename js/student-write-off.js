// js/student-write-off.js

const swoMockStudents = [
    { id: 2000004, name: "Tchoffo", enrollment: "2000004", program: "REGULAR TRAINEES", balance: 130000 },
    { id: 2000005, name: "Kankam", enrollment: "2000005", program: "DEGREE PROGRAM", balance: 450000 },
    { id: 2000006, name: "Aminata", enrollment: "2000006", program: "COMPUTER SCIENCE", balance: 75000 }
];

const swoMockDebts = {
    2000004: [
        { id: 1, dueDate: "April 24, 2025", paid: 27000, desc: "TUITION FOR REGULAR TRAINEES", orig: 157000, left: 130000 }
    ],
    2000005: [
        { id: 2, dueDate: "May 12, 2025", paid: 50000, desc: "SEMESTER 1 FEES", orig: 500000, left: 450000 }
    ]
};

let swoActiveDebts = [];

/**
 * Main initialization function for the screen.
 */
window.initStudentWriteOff = function() {
    console.log("initStudentWriteOff: Initializing...");

    // Set default operation date to today
    const dateInput = document.getElementById('SWO_Date');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

    // Register Open Picker Event
    const pickerInput = document.getElementById('SWO_ReceivedFrom');
    if (pickerInput) {
        pickerInput.addEventListener('click', window.openStudentPicker);
    }

    // Search in picker
    const searchInp = document.getElementById('SWO_SearchStudent');
    if (searchInp) {
        searchInp.addEventListener('input', (e) => {
            renderStudentPickerList(e.target.value);
        });
    }

    // Amount Input Interaction
    const amtInput = document.getElementById('SWO_AmountInput');
    if (amtInput) {
        amtInput.addEventListener('input', updateSwoSummary);
    }

    // Reset totals
    updateSwoSummary();
};

window.openStudentPicker = function() {
    const modal = document.getElementById('MODAL_StudentPicker');
    if (modal) {
        modal.style.display = 'flex';
        renderStudentPickerList();
        
        // Make draggable if utility exists
        if (typeof makeElementDraggable === 'function') {
            makeElementDraggable(modal.querySelector('.po-modal'), document.getElementById('MODAL_StudentPicker_Header'));
        }
    }
};

window.closeStudentPicker = function() {
    const modal = document.getElementById('MODAL_StudentPicker');
    if (modal) modal.style.display = 'none';
};

function renderStudentPickerList(query = "") {
    const tbody = document.querySelector('#TABLE_StudentPicker tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const filtered = swoMockStudents.filter(s => 
        s.name.toLowerCase().includes(query.toLowerCase()) || 
        s.enrollment.includes(query)
    );

    filtered.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${s.enrollment}</td>
            <td style="font-weight: bold;">${s.name}</td>
            <td>${s.program}</td>
            <td><button class="wd-btn primary" onclick="selectSwoStudent(${s.id})" style="padding: 4px 8px;">Select Student</button></td>
        `;
        tbody.appendChild(tr);
    });
}

window.selectSwoStudent = function(studentId) {
    const student = swoMockStudents.find(s => s.id === studentId);
    if (!student) return;

    // Update UI
    document.getElementById('SWO_ReceivedFrom').value = student.name;
    document.getElementById('SWO_StudentId').value = student.id;
    document.getElementById('SWO_BalanceDisplay').textContent = student.balance.toLocaleString() + " Frs";
    document.getElementById('SWO_Description').value = `Bad Debt Written OFF for ${student.name} by Administrator`;

    // Load Debts
    swoActiveDebts = swoMockDebts[studentId] || [];
    renderSwoDebtTable();
    closeStudentPicker();
};

function renderSwoDebtTable() {
    const tbody = document.querySelector('#TABLE_StudentWriteOff tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    swoActiveDebts.forEach((d, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="checkbox" checked class="swo-row-check"></td>
            <td>${idx + 1}</td>
            <td>${d.dueDate}</td>
            <td>${d.paid.toLocaleString()} Fcfa</td>
            <td>${d.desc}</td>
            <td>${d.orig.toLocaleString()} Fcfa</td>
            <td style="font-weight: bold;">${d.left.toLocaleString()} Fcfa</td>
            <td class="amount" style="color: #cd2027;">0 Fcfa</td>
            <td><button class="wd-btn reject" style="padding: 2px 6px; font-size: 10px;">Delete</button></td>
        `;
        tbody.appendChild(tr);
    });

    updateSwoSummary();
}

function updateSwoSummary() {
    const amtInput = document.getElementById('SWO_AmountInput');
    const amount = parseFloat(amtInput.value.replace(/[^0-9]/g, '')) || 0;

    // Update Table Column (Visual only for now)
    const debtCells = document.querySelectorAll('#TABLE_StudentWriteOff tbody .amount');
    debtCells.forEach(cell => {
        cell.textContent = amount.toLocaleString() + " Fcfa";
    });

    // Update Footer/Summary
    document.getElementById('SWO_TotalBadDebt').textContent = amount.toLocaleString() + " Fcfa";
    document.getElementById('SWO_SummaryApply').textContent = amount.toLocaleString() + " Frs";

    // Update words
    const wordsDiv = document.getElementById('SWO_AmountWords');
    if (wordsDiv) {
        if (typeof numberToWords === 'function') wordsDiv.textContent = amount > 0 ? numberToWords(amount) + " FCFA" : "Amount in Words";
        else wordsDiv.textContent = amount > 0 ? amount.toLocaleString() + " FCFA" : "Amount in Words";
    }
}