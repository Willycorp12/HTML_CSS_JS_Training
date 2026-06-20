// js/student-incomplete-admission-list.js

window.sampleIncompleteStudents = [
    {
        id: 1,
        name: "Merece Mmesepte IRENE",
        matricule: "2000023",
        regDate: "8/1/2025",
        phone: "69874510",
        className: "REGULAR TRAINEES",
        status: "incomplete",
        gender: "Female",
        dob: "2003-05-12",
        nationality: "Cameroon",
        city: "Douala",
        residence: "Bepanda",
        feeType: "Annual Fee",
        intake: "September Intake",
        academicYear: "Academic Year 2025",
        schoolLevel: "TRAINEES",
        schoolType: "TRAINEES",
        specialty: "REGULAR TRAINEES",
        feeAmount: 157000,
        discount: "10%",
        paymentMethod: "Cash"
    },
    {
        id: 2,
        name: "Tchoffe",
        matricule: "2000004",
        regDate: "4/27/2026",
        phone: "690614834",
        className: "REGULAR TRAINEES",
        status: "incomplete",
        gender: "Male",
        dob: "2004-01-17",
        nationality: "Cameroon",
        city: "Douala",
        residence: "Bepanda",
        feeType: "One-Off Payment",
        intake: "January Intake",
        academicYear: "Academic Year 2025",
        schoolLevel: "TRAINEES",
        schoolType: "TRAINEES",
        specialty: "REGULAR TRAINEES",
        feeAmount: 157000,
        discount: "0%",
        paymentMethod: "Mobile Money"
    }
];

window.selectedIncompleteStudents = [];

window.renderIncompleteAdmissionTable = function() {
    const tbody = document.getElementById('incomplete-admission-tbody');
    tbody.innerHTML = '';
    window.sampleIncompleteStudents.forEach((student, index) => {
        const row = document.createElement('tr');
        if (index === 0) row.classList.add('error-highlight');
        row.innerHTML = `
            <td style="text-align: center;">
                <input type="checkbox" class="student-checkbox" data-student-id="${student.id}" />
            </td>
            <td>${student.name}</td>
            <td style="text-align: center;">${student.regDate}</td>
            <td>${student.phone}</td>
            <td style="text-align: center;">${student.className}</td>
            <td style="text-align: center;">
                <button class="wd-btn primary small-btn modify-btn" onclick="modifyIncompleteStudent(${student.id})">Modify/Enroll Student</button>
            </td>
        `;
        tbody.appendChild(row);
    });
};

window.modifyIncompleteStudent = function(studentId) {
    const student = window.sampleIncompleteStudents.find(s => s.id === studentId);
    if (!student) return;
    window.pendingStudentForRegistration = {
        name: student.name,
        matricule: student.matricule,
        reg: student.regDate,
        phone: student.phone,
        gender: student.gender,
        dob: student.dob,
        nationality: student.nationality,
        city: student.city,
        residence: student.residence,
        feeType: student.feeType,
        intake: student.intake,
        academicYear: student.academicYear,
        schoolLevel: student.schoolLevel,
        schoolType: student.schoolType,
        specialty: student.specialty,
        feeAmount: student.feeAmount,
        discount: student.discount,
        paymentMethod: student.paymentMethod
    };
    loadScreen('student/student-new.html', null, 'Register New Student');
};

window.setupIncompleteNav = function() {
    document.querySelectorAll('.incomplete-sidebar .sidebar-item[data-target]').forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', function() {
            const target = this.dataset.target;
            if (target === 'student-incomplete-admission-list') return;
            if (target === 'student-master-data') {
                loadScreen('student/student-master-data.html', null, 'Student Admission List');
            }
        });
    });
};

window.deleteSelectedIncompleteStudents = function() {
    const checkboxes = document.querySelectorAll('.student-checkbox:checked');
    if (checkboxes.length === 0) {
        showAlert('Please select at least one student to delete.', 'warning');
        return;
    }
    const count = checkboxes.length;
    showAlert(`Deleted ${count} student(s).`, 'success');
    checkboxes.forEach(cb => {
        const studentId = parseInt(cb.getAttribute('data-student-id'));
        window.sampleIncompleteStudents = window.sampleIncompleteStudents.filter(s => s.id !== studentId);
    });
    renderIncompleteAdmissionTable();
};

window.initIncompleteAdmissionList = function() {
    if (!document.querySelector('.incomplete-admission-screen')) return;

    renderIncompleteAdmissionTable();
    window.setupIncompleteNav();

    document.getElementById('delete-incomplete-btn').addEventListener('click', window.deleteSelectedIncompleteStudents);

    document.getElementById('print-incomplete-btn').addEventListener('click', function() {
        showAlert('Print functionality placeholder.', 'info');
    });

    document.getElementById('search-incomplete-student').addEventListener('input', function(e) {
        const query = e.target.value.toLowerCase();
        document.querySelectorAll('.incomplete-admission-table tbody tr').forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query) ? '' : 'none';
        });
    });

    document.getElementById('reset-filters-inc-btn').addEventListener('click', function() {
        document.getElementById('filter-batch-year-inc').value = 'Academic Year 2025';
        document.getElementById('filter-school-level-inc').value = '-- Display All --';
        document.getElementById('filter-school-type-inc').value = '-- Display All --';
        document.getElementById('search-incomplete-student').value = '';
        document.getElementById('filter-student-name-inc').checked = false;
        document.getElementById('filter-registration-date').checked = false;
        renderIncompleteAdmissionTable();
        showAlert('Filters reset.', 'success');
    });
};
