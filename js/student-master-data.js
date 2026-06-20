// js/student-master-data.js

window.sampleStudentMasterData = [
    { id: 1, name: "ANKHNHMDM ANEURIN NGO", matricule: "2000023", level: "0", phone: "", balance: "0", specialty: "REGULAR TRAINEES", schoolLevel: "TRAINEES", schoolType: "TRAINEES" },
    { id: 2, name: "Atabonga-wung nguryi AS", matricule: "2000017", level: "", phone: "", balance: "0", specialty: "INTERNAL TRAINEES", schoolLevel: "TRAINEES", schoolType: "TRAINEES" },
    { id: 3, name: "ATABONGASARYEH HILARY N", matricule: "2000007", level: "", phone: "", balance: "57,000", specialty: "REGULAR TRAINEES", schoolLevel: "TRAINEES", schoolType: "TRAINEES" },
    { id: 4, name: "AYAH DECOVAEE NCHINE", matricule: "2000020", level: "", phone: "", balance: "57,000", specialty: "REGULAR TRAINEES", schoolLevel: "TRAINEES", schoolType: "TRAINEES" },
    { id: 5, name: "Bechani Martin B", matricule: "2000016", level: "", phone: "", balance: "0", specialty: "REGULAR TRAINEES", schoolLevel: "TRAINEES", schoolType: "TRAINEES" },
    { id: 6, name: "Edibe Home Nsangh", matricule: "2000021", level: "", phone: "", balance: "0", specialty: "REGULAR TRAINEES", schoolLevel: "TRAINEES", schoolType: "TRAINEES" },
    { id: 7, name: "Karikam", matricule: "5/002", level: "", phone: "", balance: "0", specialty: "REGULAR TRAINEES", schoolLevel: "TRAINEES", schoolType: "TRAINEES" },
    { id: 8, name: "Komolassenbbe", matricule: "2000020", level: "", phone: "", balance: "57,000", specialty: "REGULAR TRAINEES", schoolLevel: "TRAINEES", schoolType: "TRAINEES" },
    { id: 9, name: "Metague John", matricule: "2000022", level: "", phone: "", balance: "157,000", specialty: "REGULAR TRAINEES", schoolLevel: "TRAINEES", schoolType: "TRAINEES" },
    { id: 10, name: "Muma Jean Ikons", matricule: "2000051", level: "", phone: "", balance: "57,000", specialty: "REGULAR TRAINEES", schoolLevel: "TRAINEES", schoolType: "TRAINEES" },
    { id: 11, name: "Hanalisimba Clovert Diso", matricule: "2000028", level: "", phone: "", balance: "0", specialty: "REGULAR TRAINEES", schoolLevel: "TRAINEES", schoolType: "TRAINEES" },
    { id: 12, name: "HDEM FAKHM TSEKAMPA", matricule: "2000032", level: "", phone: "", balance: "0", specialty: "INTERNAL TRAINEES", schoolLevel: "TRAINEES", schoolType: "TRAINEES" },
    { id: 13, name: "Nganchar Dorcas Bongwee", matricule: "2000032", level: "", phone: "", balance: "0", specialty: "REGULAR TRAINEES", schoolLevel: "TRAINEES", schoolType: "TRAINEES" },
    { id: 14, name: "NGENEKEM BRIDGET", matricule: "2000027", level: "", phone: "", balance: "57,000", specialty: "REGULAR TRAINEES", schoolLevel: "TRAINEES", schoolType: "TRAINEES" },
    { id: 15, name: "Nkemgbeja Cedric Lokea", matricule: "2000032", level: "", phone: "", balance: "0", specialty: "REGULAR TRAINEES", schoolLevel: "TRAINEES", schoolType: "TRAINEES" },
    { id: 16, name: "Randolf Funghene Wefu", matricule: "2000027", level: "", phone: "", balance: "0", specialty: "REGULAR TRAINEES", schoolLevel: "TRAINEES", schoolType: "TRAINEES" },
    { id: 17, name: "Sadorni", matricule: "212321", level: "", phone: "", balance: "10", specialty: "REGULAR TRAINEES", schoolLevel: "TRAINEES", schoolType: "TRAINEES" },
    { id: 18, name: "SONAROHALDO NANFE", matricule: "2000026", level: "", phone: "", balance: "57,000", specialty: "REGULAR TRAINEES", schoolLevel: "TRAINEES", schoolType: "TRAINEES" },
    { id: 19, name: "Tchoffe", matricule: "2000004", level: "", phone: "", balance: "0", specialty: "REGULAR TRAINEES", schoolLevel: "TRAINEES", schoolType: "TRAINEES" },
    { id: 20, name: "Vicky Brandon Esona", matricule: "200001", level: "", phone: "", balance: "30,000", specialty: "REGULAR TRAINEES", schoolLevel: "TRAINEES", schoolType: "TRAINEES" }
];

window.selectedStudentMaster = null;

window.renderStudentMasterTable = function() {
    const tbody = document.getElementById('student-master-tbody');
    tbody.innerHTML = '';
    const students = window.sampleStudentMasterData;
    students.forEach((student, index) => {
        const row = document.createElement('tr');
        if (index === 19) row.classList.add('selected');
        row.innerHTML = `
            <td style="text-align: center; cursor: pointer;" onclick="selectStudentMaster(${student.id}, this)">${index + 1}</td>
            <td style="cursor: pointer;" onclick="selectStudentMaster(${student.id}, this)">${student.name.toUpperCase()}</td>
            <td style="text-align: center;">${student.matricule}</td>
            <td style="text-align: center;">${student.level}</td>
            <td>${student.phone}</td>
            <td style="text-align: right;">${student.balance}</td>
            <td style="text-align: center;">${student.specialty}</td>
            <td style="text-align: center;">${student.schoolLevel}</td>
            <td style="text-align: center;">${student.schoolType}</td>
            <td style="text-align: center;">
                <button class="wd-btn primary small-btn" onclick="selectStudentMaster(${student.id}, this); return false;" style="padding: 2px 8px; font-size: 10px;">Details</button>
            </td>
        `;
        tbody.appendChild(row);
    });
};

window.selectStudentMaster = function(studentId, element) {
    const student = window.sampleStudentMasterData.find(s => s.id === studentId);
    if (!student) return;

    window.selectedStudentMaster = student;

    document.querySelectorAll('.student-admission-table tbody tr').forEach(row => row.classList.remove('selected'));
    if (element && element.closest('tr')) {
        element.closest('tr').classList.add('selected');
    }

    document.getElementById('detail-student-name').textContent = student.name;
    document.getElementById('detail-matricule').textContent = student.matricule;
    document.getElementById('detail-class-name').textContent = student.schoolType;
    document.getElementById('detail-fee-balance').textContent = `${student.balance} FCFA`;
};

window.setupStudentMasterNav = function() {
    document.querySelectorAll('.student-sidebar .sidebar-item[data-target]').forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', function() {
            const target = this.dataset.target;
            if (target === 'student-master-data') return;
            if (target === 'student-incomplete-admission-list') {
                loadScreen('student/student-incomplete-admission-list.html', null, 'Incomplete Admission List');
                return;
            }
            if (target === 'adjust-student-matricule') {
                showAlert('Adjust Student Matricule action placeholder.', 'error');
                return;
            }
        });
    });
};

window.initStudentMasterData = function() {
    if (!document.querySelector('.student-master-screen')) return;

    renderStudentMasterTable();
    selectStudentMaster(20);

    window.setupStudentMasterNav();

    document.getElementById('btn-new-student').addEventListener('click', function() {
        loadScreen('student/student-new.html', null, 'New Student Registration');
    });

    document.getElementById('btn-modify-student').addEventListener('click', function() {
        if (!window.selectedStudentMaster) {
            showAlert('Please select a student first.', 'warning');
            return;
        }
        showAlert(`Editing student: ${window.selectedStudentMaster.name}`, 'info');
    });

    document.getElementById('btn-delete-student').addEventListener('click', function() {
        if (!window.selectedStudentMaster) {
            showAlert('Please select a student first.', 'warning');
            return;
        }
        showAlert(`Deleting student: ${window.selectedStudentMaster.name}`, 'warning');
    });

    document.getElementById('print-student-btn').addEventListener('click', function() {
        showAlert('Print functionality placeholder.', 'info');
    });

    document.getElementById('search-student').addEventListener('input', function(e) {
        const query = e.target.value.toLowerCase();
        document.querySelectorAll('.student-admission-table tbody tr').forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query) ? '' : 'none';
        });
    });

    document.getElementById('reset-filters-btn').addEventListener('click', function() {
        document.getElementById('filter-batch-year').value = '-- Display All --';
        document.getElementById('filter-school-level').value = '-- Display All --';
        document.getElementById('filter-school-type').value = '-- Display All --';
        document.getElementById('filter-specialty').value = '-- Display All --';
        document.getElementById('search-student').value = '';
        renderStudentMasterTable();
        showAlert('Filters reset.', 'success');
    });
};
