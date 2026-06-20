// js/student-new.js

window.sampleStudentNew = {
    name: "Aminata Dione",
    matricule: "2000004",
    reg: "STD-2026-001",
    level: "1",
    dob: "2003-04-05",
    placeOfBirth: "Douala",
    gender: "Male",
    nationality: "Cameroon",
    category: "Normal Trainees",
    city: "Douala, Bepanda",
    residence: "Bepanda, fin goudron defosso",
    phone: "690614834",
    regDate: "2026-04-27",
    feeType: "One-Off Payment",
    intake: "September Intake",
    // contact: "+221 77 123 4567 / aminata.dione@example.com", // No direct input for this in HTML
    // notes: "Student has completed the admission checklist.", // No direct input for this in HTML
    feeAmount: 6300,
    discount: "10%",
    paymentMethod: "Cash",
    academicYear: "Academic Year 2025",
    schoolLevel: "TRAINEES",
    schoolType: "TRAINEES",
    specialty: "REGULAR TRAINEES",
    annualFee: 157000,
    feeDiscount: 0,
    netAnnualFee: 157000
};

window.switchStudentNewTab = function(tabId, tabElement) {
    document.querySelectorAll('#student-new-modal .asset-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('#student-new-modal .asset-tab-content').forEach(p => p.classList.remove('active'));

    if (!tabElement) {
        tabElement = Array.from(document.querySelectorAll('#student-new-modal .asset-tab')).find(tab => {
            const text = tab.textContent || '';
            return (tabId === 'TAB_BasicInfo' && text.includes('Basic Info')) ||
                (tabId === 'TAB_FeesInfo' && text.includes('Fees Info')) ||
                (tabId === 'TAB_Attachments' && text.includes('Attachments'));
        });
    }

    if (tabElement) tabElement.classList.add('active');
    const panel = document.getElementById(tabId);
    if (panel) panel.classList.add('active');
};

// This function seems to be designed for a summary panel that doesn't exist in student-new.html.
// The fee summary is handled by renderStudentFeeTotals. This function is now removed from calls.
window.updateStudentNewSummary = function() {
    // This function is no longer used as its target elements do not exist in student-new.html.
    // The fee summary is handled by renderStudentFeeTotals.
    console.warn("updateStudentNewSummary is deprecated for student-new.html and should not be called.");
};

window.resetStudentNewForm = function() {
    const data = window.sampleStudentNew;
    const setValue = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.value = value;
    };

    setValue('student-new-name', data.name);
    setValue('student-new-matricule', data.matricule);
    setValue('student-new-reg-date', data.regDate);
    // 'student-new-program' input does not exist in student-new.html
    document.getElementById('student-new-level').value = data.level;
    document.getElementById('student-new-dob').value = data.dob;
    document.getElementById('student-new-place-of-birth').value = data.placeOfBirth;
    document.getElementById('student-new-gender').value = data.gender;
    document.getElementById('student-new-nationality').value = data.nationality;
    document.getElementById('student-new-category').value = data.category;
    document.getElementById('student-new-city').value = data.city;
    document.getElementById('student-new-residence').value = data.residence;
    document.getElementById('student-new-phone').value = data.phone;
    document.getElementById('student-new-reg-date').value = data.regDate;
    document.getElementById('student-new-fee-type').value = data.feeType;
    setValue('student-new-intake', data.intake);
    // 'student-new-contact' input does not exist in student-new.html
    // 'student-new-notes' input does not exist in student-new.html
    setValue('student-new-academic-year', data.academicYear);
    setValue('student-new-school-level', data.schoolLevel);
    setValue('student-new-school-type', data.schoolType);
    setValue('student-new-specialty', data.specialty);
    // 'student-new-fee-amount' input does not exist in student-new.html, it's part of the fee table
    // 'student-new-discount' input does not exist in student-new.html, it's part of the fee table
    setValue('student-new-payment-method', data.paymentMethod);
    
    // Update fee summary elements directly
    const totalAnnualFeeEl = document.getElementById('student-new-total-annual-fee');
    if (totalAnnualFeeEl) totalAnnualFeeEl.textContent = `${data.annualFee.toLocaleString()} FCFA`;
    const feeDiscountEl = document.getElementById('student-new-fee-discount');
    if (feeDiscountEl) feeDiscountEl.textContent = `${data.feeDiscount.toLocaleString()} Frs`;
    const netAnnualFeeEl = document.getElementById('student-new-net-annual-fee');
    if (netAnnualFeeEl) netAnnualFeeEl.textContent = `${data.netAnnualFee.toLocaleString()} FCFA`;

    const attachmentTab = document.getElementById('student-new-attachments-tab');
    if (attachmentTab) attachmentTab.classList.add('hidden');
    const photoPreview = document.getElementById('student-new-photo-preview');
    if (photoPreview) photoPreview.textContent = 'Student Photo';
    window.switchStudentNewTab('TAB_BasicInfo');
    window.updateStudentNewSummary();
};

window.prefillStudentNewForm = function(prefillData) {
    if (!prefillData) return;
    const normalizeDateValue = (value) => {
        if (typeof value !== 'string') return value;
        const parsed = new Date(value);
        if (isNaN(parsed.getTime())) return value;
        return parsed.toISOString().split('T')[0];
    };
    const setValue = (id, value) => {
        const el = document.getElementById(id);
        if (!el || value === undefined || value === null) return;
        el.value = value;
    };

    setValue('student-new-name', prefillData.name);
    setValue('student-new-matricule', prefillData.matricule);
    setValue('student-new-reg-date', normalizeDateValue(prefillData.reg));
    setValue('student-new-phone', prefillData.phone);
    setValue('student-new-gender', prefillData.gender);
    setValue('student-new-dob', prefillData.dob);
    setValue('student-new-nationality', prefillData.nationality);
    setValue('student-new-city', prefillData.city);
    setValue('student-new-residence', prefillData.residence);
    setValue('student-new-fee-type', prefillData.feeType);
    setValue('student-new-intake', prefillData.intake);
    setValue('student-new-academic-year', prefillData.academicYear);
    setValue('student-new-school-level', prefillData.schoolLevel);
    setValue('student-new-school-type', prefillData.schoolType);
    setValue('student-new-specialty', prefillData.specialty);
    setValue('student-new-fee-amount', prefillData.feeAmount);
    setValue('student-new-discount', prefillData.discount);
    setValue('student-new-payment-method', prefillData.paymentMethod);
    window.pendingStudentForRegistration = null;
    window.updateStudentNewSummary();
};

window.handleStudentNewPayEnroll = function() {
    console.log('✅ handleStudentNewPayEnroll called');
    // 'student-new-program' input does not exist in student-new.html, use specialty or a derived program name
    const student = {
        name: document.getElementById('student-new-name').value.trim() || window.sampleStudentNew.name,
        fee: parseInt(document.getElementById('student-new-net-annual-fee').textContent.replace(/[^0-9]/g, ''), 10) || window.sampleStudentNew.annualFee, // Use the calculated net annual fee
        academicYear: document.getElementById('student-new-academic-year').value || window.sampleStudentNew.academicYear,
        schoolLevel: document.getElementById('student-new-school-level').value || window.sampleStudentNew.schoolLevel,
        schoolType: document.getElementById('student-new-school-type').value || window.sampleStudentNew.schoolType,
        specialty: document.getElementById('student-new-specialty').value || window.sampleStudentNew.specialty,
        paymentMethod: document.getElementById('student-new-payment-method').value || window.sampleStudentNew.paymentMethod,
        reference: document.getElementById('student-new-matricule').value.trim() || window.sampleStudentNew.matricule,
        dueDate: document.getElementById('student-new-reg-date').value || window.sampleStudentNew.regDate,
        description: `${document.getElementById('student-new-specialty').value || window.sampleStudentNew.specialty}`
    };
    console.log('📤 Student data:', student);
    window.pendingStudentForFee = student;
    window.pendingStudentForFeeSource = 'student-new';
    console.log('🔄 Navigating to collect-fees...');
    loadScreen('collect-fees.html', null, 'Collect Fees');
};

window.handleStudentNewEnrollOnly = function() {
    console.log('✅ handleStudentNewEnrollOnly called');
    const attachmentTab = document.getElementById('student-new-attachments-tab');
    console.log('📌 Attachments tab element:', attachmentTab);
    if (attachmentTab) {
        // Ensure only this tab is active
        document.querySelectorAll('#student-new-modal .asset-tab').forEach(t => t.classList.remove('active'));
        attachmentTab.classList.add('active');
        attachmentTab.classList.remove('hidden');
        attachmentTab.classList.add('active');
        console.log('🔍 Current classes after:', attachmentTab.className);
    } else {
        console.error('❌ Attachments tab element not found!');
    }
    console.log('🔄 Switching to TAB_Attachments tab...');
    window.switchStudentNewTab('TAB_Attachments');
};

window.handleStudentNewSaveContinue = function() {
    showAlert('Student registration has been saved. You can continue later.', 'success');
};

window.initStudentNew = function() {
    if (!document.querySelector('#student-new-overlay')) return;

    resetStudentNewForm();
    if (window.pendingStudentForRegistration) {
        window.prefillStudentNewForm(window.pendingStudentForRegistration);
        window.pendingStudentForRegistration = null;
    }

    // Tab switching is handled by onclick in HTML, but we can add event listeners for consistency
    document.querySelectorAll('#student-new-modal .asset-tab').forEach(button => {
        if (button.onclick) return; // Skip if onclick is already set in HTML
        button.addEventListener('click', function() {
            const tabText = this.textContent.trim();
            let panelId = 'TAB_BasicInfo';
            if (tabText.includes('Fees Info')) panelId = 'TAB_FeesInfo';
            else if (tabText.includes('Attachments')) panelId = 'TAB_Attachments';
            window.switchStudentNewTab(panelId, this);
        });
    });

    // Remove event listeners that target non-existent elements or redundant calls
    const studentNameEl = document.getElementById('student-new-name');
    if (studentNameEl) studentNameEl.addEventListener('input', window.renderStudentFeeTotals); // Name change doesn't affect fee totals directly, but if it did, this would be the place.
    
    // 'student-new-program' does not exist, so remove its event listener
    // const studentProgramEl = document.getElementById('student-new-program');
    // if (studentProgramEl) studentProgramEl.addEventListener('input', window.updateStudentNewSummary);

    // The feeAmount and discount inputs are not direct inputs in the Basic Info tab,
    // they are part of the fee table in the Fees Info tab.
    // The fee calculation is driven by the select elements in the Fees Info tab.
    document.getElementById('student-new-school-level').addEventListener('change', window.renderStudentFeeTotals);
    document.getElementById('student-new-school-type').addEventListener('change', window.renderStudentFeeTotals);
    document.getElementById('student-new-specialty').addEventListener('change', window.renderStudentFeeTotals);

    document.querySelectorAll('.student-new-pay-enroll-btn').forEach(button => {
        button.addEventListener('click', window.handleStudentNewPayEnroll);
    });
    document.querySelectorAll('.student-new-enroll-only-btn').forEach(button => {
        button.addEventListener('click', window.handleStudentNewEnrollOnly);
    });
    document.getElementById('student-new-save-continue').addEventListener('click', window.handleStudentNewSaveContinue);
    document.getElementById('student-new-photo-upload').addEventListener('click', function() {
        showAlert('Photo upload dialog placeholder.', 'info');
    });
    document.getElementById('student-new-photo-delete').addEventListener('click', function() {
        const preview = document.getElementById('student-new-photo-preview');
        if (preview) preview.textContent = 'Student Photo';
        showAlert('Student photo removed.', 'success');
    });
};

window.renderStudentFeeTotals = function() {
    // The fee amount is currently hardcoded in the HTML table.
    // In a real application, this would fetch the fee based on academicYear, schoolLevel, etc.
    // For now, we'll use the sample data's annualFee.
    const annualFee = window.sampleStudentNew.annualFee; // This should come from a lookup based on selections
    const discount = 0; // This would also come from a lookup or input
    const net = annualFee - discount;

    const totalAnnualFeeEl = document.getElementById('student-new-total-annual-fee');
    if (totalAnnualFeeEl) totalAnnualFeeEl.textContent = `${annualFee.toLocaleString()} FCFA`;
    
    const feeDiscountEl = document.getElementById('student-new-fee-discount');
    if (feeDiscountEl) feeDiscountEl.textContent = `${discount.toLocaleString()} Frs`;
    
    const netAnnualFeeEl = document.getElementById('student-new-net-annual-fee');
    if (netAnnualFeeEl) netAnnualFeeEl.textContent = `${net.toLocaleString()} FCFA`;
};
