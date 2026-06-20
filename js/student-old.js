// js/student-old.js

window.sampleOldStudents = [
    {
        id: 1,
        name: "Ahmadou Beye",
        reg: "STD-2024-012",
        program: "Computer Science",
        level: "Level 2",
        intake: "Sept 2024",
        contact: "+221 77 123 4567 / ahmadou.beye@example.com",
        gender: "Male",
        dob: "15/03/2000",
        nationality: "Senegalese",
        address: "123 Main Street, Dakar",
        balance: 3200,
        paymentMethod: "Bank Transfer",
        notes: "Student must provide last transcript."
    },
    {
        id: 2,
        name: "Fatou Tounkara",
        reg: "STD-2023-045",
        program: "Business Administration",
        level: "Level 3",
        intake: "Jan 2023",
        contact: "+221 77 234 5678 / fatou.tounkara@example.com",
        gender: "Female",
        dob: "22/07/1999",
        nationality: "Senegalese",
        address: "456 Avenue, Dakar",
        balance: 9200,
        paymentMethod: "Cash",
        notes: "Student has a pending registration fee."
    },
    {
        id: 3,
        name: "Aicha Ndiaye",
        reg: "STD-2022-098",
        program: "Hospitality Management",
        level: "Level 4",
        intake: "Feb 2022",
        contact: "+221 77 345 6789 / aicha.ndiaye@example.com",
        gender: "Female",
        dob: "10/11/1998",
        nationality: "Senegalese",
        address: "789 Boulevard, Dakar",
        balance: 7500,
        paymentMethod: "Mobile Money",
        notes: "Needs updated ID card."
    }
];

window.switchStudentOldTab = function(tabId, tabElement) {
    document.querySelectorAll('#student-old-detail-modal .asset-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('#student-old-detail-modal .asset-tab-content').forEach(p => p.classList.remove('active'));
    if (tabElement) tabElement.classList.add('active');
    const panel = document.getElementById(tabId);
    if (panel) panel.classList.add('active');
};

window.renderStudentOldTable = function(data = window.sampleOldStudents) {
    const tbody = document.querySelector('.student-records tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    data.forEach((row, idx) => {
        const tr = document.createElement('tr');
        tr.dataset.searchText = `${row.name} ${row.reg} ${row.program} ${row.level}`.toLowerCase();
        tr.innerHTML = `
            <td>${row.name}</td>
            <td>${row.reg}</td>
            <td>${row.program}</td>
            <td>${row.level}</td>
            <td style="text-align: center;"><button type="button" class="wd-btn reject select-student-btn" data-index="${idx}" style="padding: 6px 12px; font-size: 11px;">Select</button></td>
        `;
        tbody.appendChild(tr);
    });
};

window.populateOldStudentDetails = function(student) {
    if (!student) return;
    document.getElementById('student-old-selected-name').textContent = student.name;
    document.getElementById('old-student-reg').textContent = student.reg;
    document.getElementById('old-student-program').textContent = student.program;
    document.getElementById('old-student-level').textContent = student.level;
    document.getElementById('old-student-intake').textContent = student.intake;
    document.getElementById('old-student-contact').textContent = student.contact;
    document.getElementById('old-student-gender').textContent = student.gender;
    document.getElementById('old-student-dob').textContent = student.dob;
    document.getElementById('old-student-nationality').textContent = student.nationality;
    document.getElementById('old-student-address').textContent = student.address;
    document.getElementById('old-student-notes').textContent = student.notes;

    // Fee Details tab
    document.getElementById('old-student-balance').value = student.balance;
    document.getElementById('old-student-payment-method').value = student.paymentMethod;

    // Update summary
    document.getElementById('old-student-summary-name').textContent = student.name;
    document.getElementById('old-student-summary-program').textContent = student.program;
    document.getElementById('old-student-summary-balance').textContent = `${student.balance} FCFA`;

    document.getElementById('student-old-detail-overlay').classList.remove('hidden');
};

window.selectOldStudent = function(index) {
    const student = window.sampleOldStudents[index];
    window.currentOldStudent = student;
    window.populateOldStudentDetails(student);
};

window.filterOldStudentTable = function(query) {
    const text = (query || '').toLowerCase();
    document.querySelectorAll('.student-records tbody tr').forEach(row => {
        row.style.display = row.dataset.searchText.includes(text) ? '' : 'none';
    });
};

window.handleOldStudentPayEnroll = function() {
    if (!window.currentOldStudent) {
        showAlert('Please select a student first.', 'error');
        return;
    }
    window.pendingStudentForFee = {
        name: window.currentOldStudent.name,
        program: window.currentOldStudent.program,
        fee: parseInt(document.getElementById('old-student-balance').value, 10) || window.currentOldStudent.balance,
        paymentMethod: document.getElementById('old-student-payment-method').value || window.currentOldStudent.paymentMethod,
        reference: window.currentOldStudent.reg,
        dueDate: window.currentOldStudent.intake,
        description: 'OUTSTANDING STUDENT FEES'
    };
    window.pendingStudentForFeeSource = 'student-old';
    loadScreen('collect-fees.html', null, 'Collect Fees');
};

window.handleOldStudentEnrollOnly = function() {
    if (!window.currentOldStudent) {
        showAlert('Please select a student first.', 'error');
        return;
    }
    showAlert(`${window.currentOldStudent.name} has been enrolled without payment.`, 'success');
    document.getElementById('student-old-detail-overlay').classList.add('hidden');
};

window.initStudentOld = function() {
    if (!document.querySelector('.student-old-page')) return;

    renderStudentOldTable();
    filterOldStudentTable('');

    const searchInput = document.getElementById('student-old-search');
    searchInput.addEventListener('input', () => filterOldStudentTable(searchInput.value));

    const searchButton = document.getElementById('student-old-search-btn');
    if (searchButton) {
        searchButton.addEventListener('click', () => filterOldStudentTable(searchInput.value));
    }

    document.querySelector('.student-records tbody').addEventListener('click', event => {
        const button = event.target.closest('.select-student-btn');
        if (!button) return;
        selectOldStudent(parseInt(button.dataset.index, 10));
    });

    document.querySelectorAll('.student-old-pay-enroll-btn').forEach(button => {
        button.addEventListener('click', window.handleOldStudentPayEnroll);
    });
    document.querySelectorAll('.student-old-enroll-only-btn').forEach(button => {
        button.addEventListener('click', window.handleOldStudentEnrollOnly);
    });
};
