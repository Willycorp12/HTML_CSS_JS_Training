function toggleNotif(e) {
    e.stopPropagation();
    document.getElementById('NOTIF_DROPDOWN').style.display =
        document.getElementById('NOTIF_DROPDOWN').style.display === 'block'
            ? 'none'
            : 'block';

    document.getElementById('USER_DROPDOWN').style.display = 'none';
}

function toggleUser(e) {
    e.stopPropagation();
    document.getElementById('USER_DROPDOWN').style.display =
        document.getElementById('USER_DROPDOWN').style.display === 'block'
            ? 'none'
            : 'block';

    document.getElementById('NOTIF_DROPDOWN').style.display = 'none';
}

document.addEventListener('click', () => {
    document.getElementById('NOTIF_DROPDOWN').style.display = 'none';
    document.getElementById('USER_DROPDOWN').style.display = 'none';
});



const topMenus = [
    {
        title: "HR & Payroll",
        dir: "hr-payroll/",
        children: [
            {
                title: "Employee Details",
                children: [
                    { title: "Create an Employee", file: "employee-create.html" },
                    { title: "Employee Master Data", file: "employee-master.html" },
                    { title: "Batch Edit", file: "employee-batch-edit.html" },
                    { title: "Longevity Bonus", file: "employee-longevity-bonus.html" }
                ]
            },
            {
                title: "Advance Salary",
                children: [
                    { title: "New Advance Salary", file: "advance-new.html" },
                    { title: "Approve Adv. Salary", file: "advance-approve.html" },
                    { title: "Pay Adv. Salary", file: "advance-pay.html" },
                    { title: "Adv. Salary Details", file: "advance-details.html" }
                ]
            },
            {
                title: "Loan Management",
                children: [
                    { title: "New Loan Request", file: "loan-new.html" },
                    { title: "Approve Loans", file: "loan-approve.html" },
                    { title: "Pay Loans", file: "loan-pay.html" },
                    { title: "Loan Details", file: "loan-details.html" },
                    { title: "Loan Repayments", file: "loan-repayments.html" }
                ]
            },
            {
                title: "HCM Reports",
                children: [
                    { title: "Permission Reports", file: "hcm-permission.html" },
                    { title: "Change of Status Report", file: "hcm-status-change.html" }
                ]
            },
            {
                title: "Pay Master Center",
                children: [
                    { title: "Generate Pay List", file: "paylist-generate.html" },
                    { title: "Generate CNPS Offline", file: "paylist-cnps.html" },
                    { title: "Generate Tax Sheet", file: "paylist-tax.html" },
                    { title: "Post PayRoll Journal Entries", file: "paylist-journal.html" },
                    { title: "Approve or Reject Paylist", file: "salary-approvals.html" }
                ]
            },
            {
                title: "Letter Templates",
                children: [
                    { title: "Holiday Request", file: "letter-holiday.html" },
                    { title: "Permission Request", file: "letter-permission.html" },
                    { title: "Mission Request", file: "letter-mission.html" },
                    { title: "Suspension/Mise a Pied", file: "letter-suspension.html" },
                    { title: "Rent Deductions", file: "letter-rent.html" }
                ]
            },
            {
                title: "La Quinzaine",
                children: [
                    { title: "New Quinzaine", file: "quinzaine-new.html" },
                    { title: "Approve Quinzaine", file: "quinzaine-approve.html" },
                    { title: "Pay Quinzaine", file: "quinzaine-pay.html" },
                    { title: "Quinzaine Details", file: "quinzaine-details.html" },
                    { title: "Quinzaine Reports", file: "quinzaine-reports.html" }
                ]
            },
            {
                title: "Overtime Hours",
                children: [
                    { title: "New OT", file: "ot-new.html" },
                    { title: "OT List", file: "ot-list.html" }
                ]
            },
            {
                title: "Biometric System",
                children: [
                    { title: "Permanent/Full-Time Staff", file: "bio-permanent.html" },
                    { title: "Temporal Staff/Part-Timers", file: "bio-temporal.html" }
                ]
            },
            {
                title: "Biometric System Reports",
                children: [
                    { title: "Attendance Details Report", file: "bio-report-details.html" },
                    { title: "Attendance Summary Report", file: "bio-report-summary.html" },
                    { title: "Attendance PayRoll", file: "bio-report-payroll.html" }
                ]
            },
            {
                title: "Need Help?",
                children: [
                    { title: "How to Use this App", file: "help-how-to.html" },
                    { title: "Guiding Principles (CMR Payroll Basics)", file: "help-guiding-principles.html" }
                ]
            }
        ]
    },
    {
        title: "Student",
        dir: "student/",
        children: [
            {
                title: "Student Registration",
                children: [
                    { title: "New Student", file: "student-new.html" },
                    { title: "Old Student", file: "student-old.html" }
                ]
            },
            { title: "Write Off Student Debts", file: "student-write-off-debts.html" },
            {
                title: "List",
                children: [
                    { title: "Incomplete Admission List", file: "student-incomplete-admission-list.html" },
                    { title: "Student Master Data", file: "student-master-data.html" }
                ]
            }
        ]
    },

    //  FIRST MAIN MENU
    {
        title: "Accounting & Finance",
        dir: "accounting-finance/",
        children: [
            { title: "Chart of Accounts", file: "chart-of-accounts.html" },
            { title: "Collect Fees", file: "collect-fees.html" },
            { title: "Recover Old Student Debts", file: "recover-old-debts.html" },
            { title: "Refund Fees", file: "refund-fees.html" },
            { title: "Give Discount", file: "give-discount.html" },
            {
                title: "Payment Order",
                children: [
                    { title: "Create a Requisition", file: "payment-order-form.html" },
                    { title: "List of Payments Pending Approvals", file: "payments-pending-approvals.html" },
                    { title: "List of Pending Payments", file: "pending-payments.html" },
                    { title: "Rejected Requisitions", file: "rejected-payments.html" }
                ]
            },
            {
                title: "Other Revenue",
                children: [
                    { title: "Transcripts", file: "transcripts.html" },
                    { title: "Attestation/Certificate", file: "attestation.html" },
                    { title: "Other Income", file: "other-income.html" }
                ]
            },
            {
                title: "Banking",
                children: [
                    { title: "Make Bank Deposits", file: "bank-deposits.html" },
                    { title: "Make Bank Withdrawals", file: "bank-withdrawals.html" },
                    { title: "Record Bank Interest", file: "bank-interest.html" },
                    { title: "Record Bank Charges", file: "bank-charges.html" },
                    { title: "Internal Funds Transfer", file: "internal-transfer.html" },
                    { title: "List of Transfers Pending Approvals", file: "transfers-pending.html" },
                    { title: "Rejected Transfers", file: "rejected-transfers.html" },
                    { title: "Internal Transfers Dashboard", file: "internal-transfers-dashboard.html" }
                ]
            },
            { title: "Create Bills", file: "create-service-bills.html" },
            { title: "Pay Bills", file: "pay-bills.html" },
            { title: "Approved Supplier Bills", file: "approved-supplier-bills.html" },
            { title: "Cash Journal", file: "cash-journal.html" },
            { title: "Bank Journal", file: "bank-journal.html" },
            { title: "Make Journal Entries", file: "journal-entries.html" },
            { title: "Suppliers", file: "" },
            {
                title: "Create Estimates",
                children: [
                    { title: "Inventory/Stock Estimate", file: "inventory-estimate.html" },
                    { title: "Fixed Asset Estimate", file: "fixed-asset-estimate.html" }
                ]
            },
            {
                title: "Purchase Order (PO)",
                children: [
                    { title: "Inventory/Stock PO", file: "inventory-po.html" },
                    { title: "Fixed Asset Estimate PO", file: "fixed-asset-po.html" }
                ]
            },
            {
                title: "Goods Received Note (GRN)",
                children: [
                    { title: "Inventory/Stock GRN", file: "inventory-grn.html" },
                    { title: "Fixed Asset GRN", file: "fixed-asset-grn.html" }
                ]
            }
        ]
    },

    //2ND MENU
    {
        title: "Stock Management",
        dir: "stock-management/",
        children: [
            { title: "Create a New Stock", file: "stock-new.html" },
            { title: "Stock Master Data", file: "stock-master.html" },
            //{ title: "POS (Sales of Stock)", file: "stock-pos.html" },
            {
                title: "Purchase of Stock",
                children: [
                    //{ title: "Create Estimates", file: "stock-purchase-estimates.html" },
                    //{ title: "Create Purchase Order (P.O)", file: "stock-purchase-po.html" },
                    { title: "Create Goods Received Note (GRN)", file: "stock-purchase-grn.html" }
                ]
            },
            /*{ 
                title: "Inventory Suppliers",
                children: [
                    { title: "Add a New Supplier", file: "inventory-supplier-new.html" },
                    { title: "Supplier Master Data", file: "inventory-supplier-master.html" }
                ]
            },*/
            {
                title: "Inventory Activities",
                children: [
                    { title: "Adjust Qty/Value on Hand", file: "inventory-adjust.html" },
                    { title: "Track Stock Movement", file: "inventory-track.html" }
                ]
            },
            { title: "Verify Student Submission", file: "verify-student-submission.html" }
        ]
    },
    //3RD MENU

    {
        title: "Fixed Asset Management",
        dir: "fixed-asset-management/",
        children: [
            { title: "Create a New Asset", file: "asset-new.html" },
            { title: "Fixed Asset Master Data", file: "asset-master.html" },
            { title: "Personnel Master Data", file: "personnel-master.html" },
            {
                title: "Asset Suppliers",
                children: [
                    { title: "Add a New Supplier", file: "supplier-new.html" },
                    { title: "Supplier Master Data", file: "supplier-master.html" }
                ]
            },
            { title: "Asset Out", file: "asset-out.html" },
            { title: "Asset In", file: "asset-in.html" },
            {
                title: "Purchase Assets",
                children: [
                    { title: "Create Estimates", file: "purchase-estimates.html" },
                    { title: "Create Purchase Order (P.O)", file: "purchase-po.html" },
                    { title: "Create Goods Received Note (GRN)", file: "purchase-grn.html" }
                ]
            },
            { title: "Asset Depreciation", file: "asset-depreciation.html" },
            { title: "Asset Reports", file: "asset-reports.html" }
        ]
    },

    //4TH MENU
    {
        title: "Report Center",
        dir: "report-center/",
        children: [
            {
                title: "Student Reports",
                children: [
                    { title: "Statement of Accounts", file: "report-statement-of-accounts.html" },
                    { title: "Fee Summary Report", file: "report-fee-summary.html" },
                    { title: "Fee Rubic Report Per Program", file: "report-fee-rubic-program.html" },
                    { title: "Class List", file: "report-class-list.html" },
                    { title: "Admission List", file: "report-admission-list.html" },
                    { title: "List of New Students", file: "report-new-students.html" },
                    { title: "List of Old Students", file: "report-old-students.html" }
                ]
            },
            {
                title: "Stock Reports",
                children: [
                    { title: "Stock Movements/Tracking", file: "report-stock-movements.html" },
                    { title: "Wastage Reports", file: "report-stock-wastage.html" }
                ]
            },
            {
                title: "Fixed Asset Report",
                children: [
                    { title: "Asset List", file: "report-asset-list.html" },
                    { title: "Asset Checked Out", file: "report-asset-checked-out.html" },
                    { title: "Asset Checked In", file: "report-asset-checked-in.html" },
                    { title: "Due Dates for Assets Checked Out", file: "report-asset-due-dates.html" },
                    { title: "Assets Received", file: "report-assets-received.html" },
                    { title: "Asset Depreciation", file: "report-asset-depreciation.html" }
                ]
            },
            {
                title: "List",
                children: [
                    { title: "Stock List", file: "report-stock-list.html" },
                    { title: "Fixed Asset List", file: "report-fixed-asset-list.html" },
                    { title: "Supplier List", file: "report-supplier-list.html" }
                ]
            },
            {
                title: "Financial Statements",
                children: [
                    { title: "Trial Balance", file: "report-trial-balance.html" },
                    { title: "Income Statement Accrual Basis", file: "report-income-statement.html" },
                    { title: "Income Statement Cash Basis", file: "report-income-statement.html" },
                    { title: "Balance Sheet", file: "report-balance-sheet.html" },
                    { title: "General Ledger", file: "report-general-ledger.html" },
                    {
                        title: "Budget Reports",
                        children: [
                            { title: "Budget Details Report", file: "report-budget-details.html" },
                            { title: "Budget Summary Report", file: "report-budget-summary.html" }
                        ]
                    }
                ]
            },
            {
                title: "Other Reports",
                children: [
                    { title: "Supplier Bills Summary", file: "report-supplier-bills.html" }
                ]
            }
        ]
    },

    //5TH MENU
    {
        title: "Setup",
        dir: "setup/",
        children: [
            {
                title: "Administration",
                children: [
                    { title: "Company Profile", file: "setup-company-profile.html" },
                    { title: "System Users", file: "setup-system-users.html", icon: "fa-solid fa-users" },
                    { title: "Academic Year Setup", file: "setup-academic-year.html" },
                    { title: "SMS Setting", file: "setup-sms.html" },
                    { title: "Change Academic Year", file: "setup-change-year.html" },
                    { title: "Print Requisition Form(s)", file: "setup-requisition.html" }
                ]
            },
            {
                title: "Inventory Options",
                children: [
                    { title: "Inventory Main Category", file: "inventory-main-category.html" },
                    { title: "Inventory Sub Category", file: "inventory-sub-category.html" },
                    { title: "Suppliers", file: "suppliers.html" },
                    { title: "Inventory List", file: "inventory-list.html" },
                    { title: "Import from Excel", file: "inventory-import-excel.html" },
                    { title: "Import Fixed Assets", file: "inventory-import-assets.html" }
                ]
            },
            {
                title: "Accounting & Finance",
                children: [
                    { title: "Chart of Accounts", file: "finance-chart-accounts.html" },
                    { title: "Configure Accounts", file: "finance-configure-accounts.html" },
                    { title: "Fee Category", file: "finance-fee-category.html" },
                    { title: "Fee Types", file: "finance-fee-types.html" },
                    { title: "Fee Installment Schedule", file: "finance-fee-schedule.html" },
                    { title: "Annual Fee Composition", file: "finance-annual-fee.html" },
                    { title: "Setup Open Balances", file: "finance-open-balances.html" },
                    { title: "Other Income Setup", file: "finance-other-income.html" },
                    { title: "API Consumption", file: "finance-api-consumption.html" },
                    { title: "Income & Expenditure", file: "finance-income-exp.html" },
                    { title: "Budget Titles", file: "finance-budget-titles.html" },
                    { title: "Budget Setup Customized", file: "finance-budget-setup.html" }
                ]
            },
            {
                title: "Security & Import Wizard",
                children: [
                    { title: "Payroll Access Levels", file: "security-access-levels.html" },
                    { title: "Importation Center", file: "security-import-center.html" },
                    { title: "Global Import", file: "security-global-import.html" }
                ]
            },
            {
                title: "Admission Options",
                children: [

                    {
                        title: "Security",
                        children: [
                            { title: "Payroll User Rights", file: "hcm-user-rights.html" }
                        ]
                    },
                    {
                        title: "Biometric System",
                        children: [
                            { title: "Employee Time Table", file: "bio-time-table.html" },
                            { title: "PayRate Category Setup", file: "bio-payrate-category.html" },
                            { title: "Course Setup", file: "bio-course-setup.html" },
                            { title: "School Types", file: "bio-school-types.html" },
                            { title: "School Programs", file: "bio-school-programs.html" },
                            { title: "Assign Courses to Departments", file: "bio-assign-courses.html" }
                        ]
                    }
                ]
            }
        ]
    }



];

normalizeMenuFilePaths(topMenus);

function normalizeMenuFilePaths(menuItems, parentDir = '') {
    menuItems.forEach(item => {
        const currentDir = item.dir || parentDir;
        if (item.file && typeof item.file === 'string' && !item.file.includes('/')) {
            item.file = `${currentDir}${item.file}`;
        }
        if (item.children) {
            normalizeMenuFilePaths(item.children, currentDir);
        }
    });
}

function renderTopMenu(menuData, container) {
    menuData.forEach(menu => {
        const li = document.createElement('li');
        li.className = 'top-menu-item';
        li.textContent = menu.title;

        //  Insert icon + title dynamically
        //li.innerHTML = `<i class="${menu.icon || ''}"></i> ${menu.title}`;

        // If the menu has a file, attach click
        if (menu.file) {
            li.addEventListener('click', e => {
                e.stopPropagation();
                loadScreen(menu.file, null, menu.title);
            });
        }

        // If it has children, create a sub-ul and recurse
        if (menu.children) {
            const subUl = document.createElement('ul');
            subUl.className = 'top-submenu';
            li.appendChild(subUl);

            // Recursive call
            renderTopMenu(menu.children, subUl);
        }

        container.appendChild(li);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('TOP_MENU_CONTAINER');
    renderTopMenu(topMenus, container);
});
