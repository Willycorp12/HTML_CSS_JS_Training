/* js/verify-student-submission.js */

/**
 * Sample JSON data for the Verify Student Submission table.
 * This serves as a starting point for endpoint integration.
 */
const VSS_SAMPLE_DATA = [
    { id: 1, status: "Submitted", studentName: "Nkeng Wilfred Asongafac", matricule: "FE21A001", phone: "677123456", specialty: "Software Eng.", schoolLevel: "HND", schoolType: "Professional", items: 5 },
    { id: 2, status: "Pending", studentName: "Mbah Grace Ebot", matricule: "FE21A002", phone: "655234567", specialty: "Networking", schoolLevel: "BTS", schoolType: "Professional", items: 3 },
    { id: 3, status: "Submitted", studentName: "Tabi Emmanuel Njoh", matricule: "FE21A003", phone: "670345678", specialty: "Software Eng.", schoolLevel: "HND", schoolType: "Professional", items: 4 },
    { id: 4, status: "Pending", studentName: "Achu Brenda Fon", matricule: "FE22B010", phone: "690456789", specialty: "Banking & Finance", schoolLevel: "BTS", schoolType: "General", items: 2 },
    { id: 5, status: "Submitted", studentName: "Tanyi Boris Ndip", matricule: "FE22B011", phone: "678567890", specialty: "Accounting", schoolLevel: "HND", schoolType: "Professional", items: 6 },
    { id: 6, status: "Pending", studentName: "Muki Loveline Ashu", matricule: "FE22B012", phone: "651678901", specialty: "Marketing", schoolLevel: "BTS", schoolType: "General", items: 1 },
    { id: 7, status: "Submitted", studentName: "Ngwa Patrick Eyong", matricule: "FE23C020", phone: "699789012", specialty: "Software Eng.", schoolLevel: "Licence", schoolType: "Professional", items: 5 },
    { id: 8, status: "Pending", studentName: "Enow Priscilla Agbor", matricule: "FE23C021", phone: "672890123", specialty: "Networking", schoolLevel: "Licence", schoolType: "Professional", items: 3 },
    { id: 9, status: "Submitted", studentName: "Besong Roland Arrey", matricule: "FE23C022", phone: "656901234", specialty: "Accounting", schoolLevel: "Licence", schoolType: "General", items: 4 },
    { id: 10, status: "Pending", studentName: "Njie Mary Ayuk", matricule: "FE21A004", phone: "680012345", specialty: "Banking & Finance", schoolLevel: "HND", schoolType: "General", items: 2 },
    { id: 11, status: "Submitted", studentName: "Agbor Elvis Orock", matricule: "FE21A005", phone: "674123789", specialty: "Marketing", schoolLevel: "HND", schoolType: "Professional", items: 7 },
    { id: 12, status: "Pending", studentName: "Fomuso Sandra Lyonga", matricule: "FE22B013", phone: "692234890", specialty: "Software Eng.", schoolLevel: "BTS", schoolType: "Professional", items: 3 },
    { id: 13, status: "Submitted", studentName: "Ayuk Daniel Etchu", matricule: "FE22B014", phone: "658345901", specialty: "Networking", schoolLevel: "BTS", schoolType: "Professional", items: 5 },
    { id: 14, status: "Pending", studentName: "Ebai Comfort Nnane", matricule: "FE23C023", phone: "681456012", specialty: "Accounting", schoolLevel: "Licence", schoolType: "General", items: 1 },
    { id: 15, status: "Submitted", studentName: "Mofor Kingsley Takang", matricule: "FE23C024", phone: "673567123", specialty: "Banking & Finance", schoolLevel: "Licence", schoolType: "Professional", items: 4 },
    { id: 16, status: "Pending", studentName: "Oben Helen Mbella", matricule: "FE21A006", phone: "695678234", specialty: "Marketing", schoolLevel: "HND", schoolType: "General", items: 2 },
    { id: 17, status: "Submitted", studentName: "Eteki Joshua Ndumbe", matricule: "FE21A007", phone: "657789345", specialty: "Software Eng.", schoolLevel: "HND", schoolType: "Professional", items: 6 },
    { id: 18, status: "Pending", studentName: "Luma Irene Mosenge", matricule: "FE22B015", phone: "679890456", specialty: "Networking", schoolLevel: "BTS", schoolType: "Professional", items: 3 },
    { id: 19, status: "Submitted", studentName: "Ashu Gilbert Eko", matricule: "FE22B016", phone: "691901567", specialty: "Accounting", schoolLevel: "BTS", schoolType: "General", items: 5 },
    { id: 20, status: "Pending", studentName: "Moliki Quinta Manga", matricule: "FE23C025", phone: "654012678", specialty: "Banking & Finance", schoolLevel: "Licence", schoolType: "General", items: 2 }
];

/**
 * Lookup data for filter dropdowns.
 * Used to populate filter options from sample data.
 */
const VSS_FILTER_OPTIONS = {
    batchYears: ["2021/2022", "2022/2023", "2023/2024", "2024/2025", "2025/2026"],
    schoolLevels: ["BTS", "HND", "Licence", "Master"],
    schoolTypes: ["Professional", "General"],
    specialties: ["Software Eng.", "Networking", "Accounting", "Banking & Finance", "Marketing"]
};

/**
 * Initializes the Verify Student Submission screen.
 * Sets up filters, search, select-all checkbox, and populates the table.
 */
window.initVerifyStudentSubmission = function () {
    // Set today's date in the date filter
    const dateInput = document.getElementById('VSS_Filter_Date');
    if (dateInput) {
        const today = new Date();
        dateInput.value = today.toISOString().split('T')[0];
    }

    // Populate filter dropdowns
    populateVSSFilter('VSS_Filter_BatchYear', VSS_FILTER_OPTIONS.batchYears);
    populateVSSFilter('VSS_Filter_SchoolLevel', VSS_FILTER_OPTIONS.schoolLevels);
    populateVSSFilter('VSS_Filter_SchoolType', VSS_FILTER_OPTIONS.schoolTypes);
    populateVSSFilter('VSS_Filter_Specialty', VSS_FILTER_OPTIONS.specialties);

    // Select All checkbox handler
    const selectAll = document.getElementById('VSS_SelectAll');
    if (selectAll) {
        selectAll.addEventListener('change', function () {
            const checkboxes = document.querySelectorAll('#VSS_TBODY input[type="checkbox"]');
            checkboxes.forEach(cb => { cb.checked = selectAll.checked; });
        });
    }

    // Search filter
    const searchInput = document.getElementById('VSS_GLOBAL_SEARCH');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            filterVSSTable();
        });
    }

    // Refresh button
    const refreshBtn = document.getElementById('BTN_VSS_Refresh');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function () {
            renderVSSTable(VSS_SAMPLE_DATA);
        });
    }

    // Filter change listeners
    ['VSS_Filter_BatchYear', 'VSS_Filter_SchoolLevel', 'VSS_Filter_SchoolType', 'VSS_Filter_Specialty'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', filterVSSTable);
    });

    // Render the table with sample data
    renderVSSTable(VSS_SAMPLE_DATA);
};

/**
 * Populates a filter dropdown with options.
 * @param {string} selectId - The ID of the select element.
 * @param {string[]} options - Array of option values.
 */
function populateVSSFilter(selectId, options) {
    const select = document.getElementById(selectId);
    if (!select) return;
    // Keep the default "---All---" option
    options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        select.appendChild(option);
    });
}

/**
 * Renders the submission table from the provided data array.
 * @param {Array} data - Array of student submission objects.
 */
function renderVSSTable(data) {
    const tbody = document.getElementById('VSS_TBODY');
    if (!tbody) return;
    tbody.innerHTML = '';

    data.forEach(student => {
        const tr = document.createElement('tr');
        tr.dataset.id = student.id;
        tr.dataset.specialty = student.specialty;
        tr.dataset.schoolLevel = student.schoolLevel;
        tr.dataset.schoolType = student.schoolType;

        tr.innerHTML = `
            <td style="text-align: center;"><input type="checkbox" data-id="${student.id}"></td>
            <td>${student.status}</td>
            <td>${student.studentName}</td>
            <td>${student.matricule}</td>
            <td>${student.phone}</td>
            <td>${student.specialty}</td>
            <td>${student.schoolLevel}</td>
            <td>${student.schoolType}</td>
            <td style="text-align: center;">${student.items}</td>
        `;

        // Row click selection (skip checkbox cell)
        tr.addEventListener('click', function (e) {
            if (e.target.type === 'checkbox') return;
            document.querySelectorAll('#VSS_TBODY tr.selected').forEach(r => r.classList.remove('selected'));
            tr.classList.add('selected');
        });

        tbody.appendChild(tr);
    });
}

/**
 * Filters table rows based on search input and dropdown filters.
 */
function filterVSSTable() {
    const search = (document.getElementById('VSS_GLOBAL_SEARCH')?.value || '').toLowerCase();
    const filterLevel = document.getElementById('VSS_Filter_SchoolLevel')?.value || '';
    const filterType = document.getElementById('VSS_Filter_SchoolType')?.value || '';
    const filterSpecialty = document.getElementById('VSS_Filter_Specialty')?.value || '';

    const rows = document.querySelectorAll('#VSS_TBODY tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const matchSearch = !search || text.includes(search);
        const matchLevel = !filterLevel || row.dataset.schoolLevel === filterLevel;
        const matchType = !filterType || row.dataset.schoolType === filterType;
        const matchSpecialty = !filterSpecialty || row.dataset.specialty === filterSpecialty;

        row.style.display = (matchSearch && matchLevel && matchType && matchSpecialty) ? '' : 'none';
    });
}
