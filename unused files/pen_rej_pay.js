/* ===== SAMPLE DATA ===== */

function renderPayments(data) {
    const columns = [
        "SN", "Ref No", "Date", "Subject", "Position", "Beneficiary",
        "Actual Amount", "Initiated By", "Approved By", "Take Actions"
    ];
    const tbody = document.querySelector('#TABLE_PendingPayments tbody');
    tbody.innerHTML = '';

    data.forEach((p, index) => {
        const rowData = [
            index + 1,
            p.refNo,
            p.date,
            p.subject,
            p.position,
            p.beneficiary,
            p.amount,
            p.initiatedBy,
            p.approvedBy,
            "" // Actions cell, handled separately
        ];

        const tr = document.createElement('tr');
        rowData.forEach((cell, i) => {
            const td = document.createElement('td');
            td.setAttribute('data-label', columns[i]);
            if (i !== 9) { // Not the actions column
                // Remove native title, use data-tooltip for custom tooltip
                if (cell && columns[i]) {
                    td.setAttribute('data-tooltip', columns[i].toUpperCase() + "\n" + cell);
                }
                td.textContent = cell;
                if (i === 6) td.className = 'amount'; // Add 'amount' class to Actual Amount column
            } else {
                td.innerHTML = `
                    <button class="wd-btn pay">Pay Now</button>
                    <button class="wd-btn reject">Reject</button>
                `;
            }
            tr.appendChild(td);
        });
        // WinDev-style row selection
        tr.addEventListener("click", function (e) {
            if (e.target.tagName === "BUTTON") return;

            document
                .querySelectorAll("#TABLE_PendingPayments tbody tr")
                .forEach(r => r.classList.remove("selected"));

            tr.classList.add("selected");
        });

        tbody.appendChild(tr);
    });
}

function renderRejectedPayments(data) {
    const columns = [
        "SN", "Ref No", "Date", "Subject", "Position", "Beneficiary",
        "Actual Amount", "Initiated By", "Rejected By", "Take Actions"
    ];
    const tbody = document.querySelector('#TABLE_RejectedPayments tbody');
    tbody.innerHTML = '';

    data.forEach((p, index) => {
        const rowData = [
            index + 1,
            p.refNo,
            p.date,
            p.subject,
            p.position,
            p.beneficiary,
            p.amount,
            p.initiatedBy,
            p.rejectedBy,
            "" // Actions cell, handled separately
        ];

        const tr = document.createElement('tr');
        rowData.forEach((cell, i) => {
            const td = document.createElement('td');
            td.setAttribute('data-label', columns[i]);
            if (i !== 9) { // Not the actions column
                if (cell && columns[i]) {
                    td.setAttribute('data-tooltip', columns[i].toUpperCase() + "\n" + cell);
                }
                td.textContent = cell;
                if (i === 6) td.className = 'amount';
            } else {
                td.innerHTML = `<button class="wd-btn pay">Modify</button> <button class="wd-btn reject">Delete</button>`;
            }
            tr.appendChild(td);
        });
        // WinDev-style row selection
        tr.addEventListener("click", function (e) {
            if (e.target.tagName === "BUTTON") return;
            document.querySelectorAll('#TABLE_RejectedPayments tbody tr').forEach(row => row.classList.remove("selected"));
            tr.classList.add("selected");
        });
        tbody.appendChild(tr);
    });
}

function renderPendingApproval(data) {
    const columns = [
        "SN", "Ref No", "Date", "Subject", "Position", "Beneficiary",
        "Actual Amount", "Initiated By", "Take Actions"
    ];
    const tbody = document.querySelector('#TABLE_PendingApprovals tbody');
    tbody.innerHTML = '';

    data.forEach((p, index) => {
        const rowData = [
            index + 1,
            p.refNo,
            p.date,
            p.subject,
            p.position,
            p.beneficiary,
            p.amount,
            p.initiatedBy,
            "" // Actions cell, handled separately
        ];

        const tr = document.createElement('tr');
        rowData.forEach((cell, i) => {
            const td = document.createElement('td');
            td.setAttribute('data-label', columns[i]);
            if (i !== 8) { // Not the actions column
                if (cell && columns[i]) {
                    td.setAttribute('data-tooltip', columns[i].toUpperCase() + "\n" + cell);
                }
                td.textContent = cell;
                if (i === 6) td.className = 'amount';
            } else {
                td.innerHTML = `<button class="wd-btn pay">Approve!</button> <button class="wd-btn reject">Reject</button> <button class="wd-btn modify">Modify</button>`;
            }
            tr.appendChild(td);
        });
        // WinDev-style row selection
        tr.addEventListener("click", function (e) {
            if (e.target.tagName === "BUTTON") return;
            document.querySelectorAll('#TABLE_PendingApprovals tbody tr').forEach(row => row.classList.remove("selected"));
            tr.classList.add("selected");
        });
        tbody.appendChild(tr);
    });
}


/* Called AFTER screen loads */
function initPendingPayments() {

  const payments = [
    {
        refNo: 'PMT/01',
        date: '03-Jul',
        subject: 'Public Relation to FENASU',
        position: 'DAF',
        beneficiary: 'Mr Lawrence',
        amount: '100,000',
        initiatedBy: 'Mrs Enanga',
        approvedBy: 'Chia Richard'
    },
    {
        refNo: 'PMT/15',
        date: '15-Oct',
        subject: 'Security Dog food',
        position: 'DAF',
        beneficiary: 'Mr Lawrence',
        amount: '90,000',
        initiatedBy: 'Mrs Enanga',
        approvedBy: 'Chia Richard'
    },
    {
        refNo: 'PMT/21',
        date: '12-Jan',
        subject: 'Office Stationery Supply',
        position: 'Accountant',
        beneficiary: 'ABC Stationers',
        amount: '45,500',
        initiatedBy: 'Mr Ndzi Emmanuel',
        approvedBy: 'Chia Richard'
    },
    {
        refNo: 'PMT/22',
        date: '28-Feb',
        subject: 'Internet Subscription',
        position: 'IT Officer',
        beneficiary: 'MTN Cameroon',
        amount: '30,000',
        initiatedBy: 'Mrs Enanga',
        approvedBy: 'Chia Richard'
    },
    {
        refNo: 'PMT/33',
        date: '07-Apr',
        subject: 'Vehicle Fuel Refill',
        position: 'Logistics Officer',
        beneficiary: 'Total Energies',
        amount: '60,000',
        initiatedBy: 'Mr Tabe Simon',
        approvedBy: 'Chia Richard'
    },
    {
        refNo: 'PMT/34',
        date: '19-Jun',
        subject: 'Office Cleaning Services',
        position: 'Admin Officer',
        beneficiary: 'CleanPro Services',
        amount: '75,000',
        initiatedBy: 'Mrs Enanga',
        approvedBy: 'Chia Richard'
    },
    {
        refNo: 'PMT/41',
        date: '05-Mar',
        subject: 'Team Building Event',
        position: 'HR Officer',
        beneficiary: 'FunWorks Ltd',
        amount: '150,000',
        initiatedBy: 'Mr Ndzi Emmanuel',
        approvedBy: 'Chia Richard'
    },
    {
        refNo: 'PMT/42',
        date: '18-May',
        subject: 'Printer Maintenance',
        position: 'IT Officer',
        beneficiary: 'PrintCare Services',
        amount: '25,000',
        initiatedBy: 'Mrs Enanga',
        approvedBy: 'Chia Richard'
    },
    {
        refNo: 'PMT/51',
        date: '10-Aug',
        subject: 'Software Subscription Renewal',
        position: 'IT Officer',
        beneficiary: 'Microsoft Cameroon',
        amount: '120,000',
        initiatedBy: 'Mr Tabe Simon',
        approvedBy: 'Chia Richard'
    },
    {
        refNo: 'PMT/52',
        date: '22-Sep',
        subject: 'Office Renovation Materials',
        position: 'Admin Officer',
        beneficiary: 'BuildSmart Ltd',
        amount: '200,000',
        initiatedBy: 'Mrs Enanga',
        approvedBy: 'Chia Richard'
    }
];



    renderPayments(payments);

    const searchInput = document.getElementById('EDT_GlobalSearch');

    searchInput.addEventListener('input', function () {
        const value = this.value.toLowerCase().trim();

        document
            .querySelectorAll('#TABLE_PendingPayments tbody tr')
            .forEach(row => {
                row.style.display = row.textContent.toLowerCase().includes(value)
                    ? ''
                    : 'none';
            });
    });
}


/* Called AFTER screen loads */
function initRejectedPayments() {

  const payments = [
    {
        refNo: 'PMT/01',
        date: '03-Jul',
        subject: 'Public Relation to FENASU',
        position: 'DAF',
        beneficiary: 'Mr Lawrence',
        amount: '100,000',
        initiatedBy: 'Mrs Enanga',
        rejectedBy: 'Chia Richard'
    },
    {
        refNo: 'PMT/15',
        date: '15-Oct',
        subject: 'Security Dog food',
        position: 'DAF',
        beneficiary: 'Mr Lawrence',
        amount: '90,000',
        initiatedBy: 'Mrs Enanga',
        rejectedBy: 'Chia Richard'
    },
    {
        refNo: 'PMT/21',
        date: '12-Jan',
        subject: 'Office Stationery Supply',
        position: 'Accountant',
        beneficiary: 'ABC Stationers',
        amount: '45,500',
        initiatedBy: 'Mr Ndzi Emmanuel',
        rejectedBy: 'Chia Richard'
    },
    {
        refNo: 'PMT/22',
        date: '28-Feb',
        subject: 'Internet Subscription',
        position: 'IT Officer',
        beneficiary: 'MTN Cameroon',
        amount: '30,000',
        initiatedBy: 'Mrs Enanga',
        rejectedBy: 'Chia Richard'
    },
    {
        refNo: 'PMT/33',
        date: '07-Apr',
        subject: 'Vehicle Fuel Refill',
        position: 'Logistics Officer',
        beneficiary: 'Total Energies',
        amount: '60,000',
        initiatedBy: 'Mr Tabe Simon',
        rejectedBy: 'Chia Richard'
    },
    {
        refNo: 'PMT/34',
        date: '19-Jun',
        subject: 'Office Cleaning Services',
        position: 'Admin Officer',
        beneficiary: 'CleanPro Services',
        amount: '75,000',
        initiatedBy: 'Mrs Enanga',
        rejectedBy: 'Chia Richard'
    },
    {
        refNo: 'PMT/41',
        date: '05-Mar',
        subject: 'Team Building Event',
        position: 'HR Officer',
        beneficiary: 'FunWorks Ltd',
        amount: '150,000',
        initiatedBy: 'Mr Ndzi Emmanuel',
        rejectedBy: 'Chia Richard'
    },
    {
        refNo: 'PMT/42',
        date: '18-May',
        subject: 'Printer Maintenance',
        position: 'IT Officer',
        beneficiary: 'PrintCare Services',
        amount: '25,000',
        initiatedBy: 'Mrs Enanga',
        rejectedBy: 'Chia Richard'
    },
    {
        refNo: 'PMT/51',
        date: '10-Aug',
        subject: 'Software Subscription Renewal',
        position: 'IT Officer',
        beneficiary: 'Microsoft Cameroon',
        amount: '120,000',
        initiatedBy: 'Mr Tabe Simon',
        rejectedBy: 'Chia Richard'
    },
    {
        refNo: 'PMT/52',
        date: '22-Sep',
        subject: 'Office Renovation Materials',
        position: 'Admin Officer',
        beneficiary: 'BuildSmart Ltd',
        amount: '200,000',
        initiatedBy: 'Mrs Enanga',
        rejectedBy: 'Chia Richard'
    }
];



    renderRejectedPayments(payments);

    const searchInput = document.getElementById('EDT_GlobalSearch');

    searchInput.addEventListener('input', function () {
        const value = this.value.toLowerCase().trim();

        document
            .querySelectorAll('#TABLE_RejectedPayments tbody tr')
            .forEach(row => {
                row.style.display = row.textContent.toLowerCase().includes(value)
                    ? ''
                    : 'none';
            });
    });
}

/* Called AFTER screen loads */
function initPendingApproval() {

  const payments = [
    {
        refNo: 'PMT/01',
        date: '03-Jul',
        subject: 'Public Relation to FENASU',
        position: 'DAF',
        beneficiary: 'Mr Lawrence',
        amount: '100,000',
        initiatedBy: 'Mrs Enanga'
    },
    {
        refNo: 'PMT/15',
        date: '15-Oct',
        subject: 'Security Dog food',
        position: 'DAF',
        beneficiary: 'Mr Lawrence',
        amount: '90,000',
        initiatedBy: 'Mrs Enanga'
    },
    {
        refNo: 'PMT/21',
        date: '12-Jan',
        subject: 'Office Stationery Supply',
        position: 'Accountant',
        beneficiary: 'ABC Stationers',
        amount: '45,500',
        initiatedBy: 'Mr Ndzi Emmanuel'
    },
    {
        refNo: 'PMT/22',
        date: '28-Feb',
        subject: 'Internet Subscription',
        position: 'IT Officer',
        beneficiary: 'MTN Cameroon',
        amount: '30,000',
        initiatedBy: 'Mrs Enanga'
    },
    {
        refNo: 'PMT/33',
        date: '07-Apr',
        subject: 'Vehicle Fuel Refill',
        position: 'Logistics Officer',
        beneficiary: 'Total Energies',
        amount: '60,000',
        initiatedBy: 'Mr Tabe Simon'
    },
    {
        refNo: 'PMT/34',
        date: '19-Jun',
        subject: 'Office Cleaning Services',
        position: 'Admin Officer',
        beneficiary: 'CleanPro Services',
        amount: '75,000',
        initiatedBy: 'Mrs Enanga'
    },
    {
        refNo: 'PMT/41',
        date: '05-Mar',
        subject: 'Team Building Event',
        position: 'HR Officer',
        beneficiary: 'FunWorks Ltd',
        amount: '150,000',
        initiatedBy: 'Mr Ndzi Emmanuel'
    },
    {
        refNo: 'PMT/42',
        date: '18-May',
        subject: 'Printer Maintenance',
        position: 'IT Officer',
        beneficiary: 'PrintCare Services',
        amount: '25,000',
        initiatedBy: 'Mrs Enanga',
        rejectedBy: 'Chia Richard'
    },
    {
        refNo: 'PMT/51',
        date: '10-Aug',
        subject: 'Software Subscription Renewal',
        position: 'IT Officer',
        beneficiary: 'Microsoft Cameroon',
        amount: '120,000',
        initiatedBy: 'Mr Tabe Simon'
    },
    {
        refNo: 'PMT/52',
        date: '22-Sep',
        subject: 'Office Renovation Materials',
        position: 'Admin Officer',
        beneficiary: 'BuildSmart Ltd',
        amount: '200,000',
        initiatedBy: 'Mrs Enanga'
    }
];



    renderPendingApproval(payments);

    const searchInput = document.getElementById('EDT_GlobalSearch');

    searchInput.addEventListener('input', function () {
        const value = this.value.toLowerCase().trim();

        document
            .querySelectorAll('#TABLE_PendingApprovals tbody tr')
            .forEach(row => {
                row.style.display = row.textContent.toLowerCase().includes(value)
                    ? ''
                    : 'none';
            });
    });
}
