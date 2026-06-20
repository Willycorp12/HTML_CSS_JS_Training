// js/collect-fees.js

window.sampleCollectFees = {
    batch: "2025/2026",
    academicYear: "Academic Year 2025",
    name: "Aminata Dione",
    program: "Computer Science",
    fee: 6300,
    reference: "0/633",
    paymentDate: "2026-04-27",
    dueDate: "Apr 27, 2026",
    description: "TUITION FOR REGULAR TRAINEES",
    paymentMethod: "Cash on Hand"
};

window.updateCollectFeeWords = function(amount) {
    const target = document.getElementById('cf-amount-words');
    const targetBottom = document.getElementById('cf-amount-words-bottom');
    if (!target && !targetBottom) return;
    const value = parseInt(amount, 10) || 0;
    const words = value > 0 && typeof numberToWords === 'function'
        ? `${numberToWords(value)} FCFA`
        : 'Amount in words will appear here.';
    if (target) target.textContent = words;
    if (targetBottom) targetBottom.textContent = words;
};

window.formatCurrency = function(amount) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " Frs";
};

window.initCollectFees = function() {
    if (!document.querySelector('.collect-fees-wrapper')) return;

    const data = {
        ...window.sampleCollectFees,
        ...(window.pendingStudentForFee || {})
    };
    data.fee = parseInt(data.fee, 10) || 0;

    const amountInput = document.getElementById('cf-amount-input');
    if (amountInput) {
        amountInput.value = window.formatCurrency(data.fee);
    }
    window.updateCollectFeeWords(data.fee);

    // Center panel - Student name and balance
  /*  document.getElementById('cf-student-name').textContent = data.name;
    document.getElementById('cf-balance').textContent = window.formatCurrency(data.fee);
    document.getElementById('cf-student-balance').value = window.formatCurrency(data.fee);

    // Right panel - Payment details
    document.getElementById('cf-payment-method').value = data.paymentMethod;
    document.getElementById('cf-reference').value = data.reference || window.sampleCollectFees.reference;
    document.getElementById('cf-payment-date').value = data.paymentDate || window.sampleCollectFees.paymentDate;*/

    // Table - Fee details
    document.getElementById('cf-due-date').textContent = data.dueDate || window.sampleCollectFees.dueDate;
    document.getElementById('cf-description').textContent = data.description || window.sampleCollectFees.description;

    const updateFeeTotals = () => {
        // Table updates
        document.getElementById('cf-orig-amt').textContent = window.formatCurrency(data.fee);
        const totalOrigEl = document.getElementById('cf-total-orig');
        if (totalOrigEl) totalOrigEl.textContent = window.formatCurrency(data.fee);
        
        // Footer
        document.getElementById('cf-amount-due').textContent = window.formatCurrency(data.fee);
        document.getElementById('cf-payments-to-apply').textContent = window.formatCurrency(data.fee);
    };

    updateFeeTotals();

    // Event listeners
    document.getElementById('cf-preview-receipt').addEventListener('click', () => {
        showAlert('Receipt preview would open here.', 'info');
    });

    document.getElementById('cf-validate-only').addEventListener('click', () => {
        showAlert('Fee validated successfully. No print job created.', 'success');
    });

    document.getElementById('cf-validate-print').addEventListener('click', () => {
        showAlert('Fee validated and ready to print.', 'success');
    });

    document.getElementById('cf-cancel').addEventListener('click', () => {
        if (window.pendingStudentForFeeSource === 'student-new') {
            loadScreen('student-new.html', null, 'New Student');
        } else {
            loadScreen('student-old.html', null, 'Existing Students');
        }
    });

    document.getElementById('cf-reference').addEventListener('input', function() {
        // Could add validation or format adjustment later.
    });

    const amountInputEl = document.getElementById('cf-amount-input');
    if (amountInputEl) {
        amountInputEl.addEventListener('input', function() {
            const value = this.value.replace(/[^0-9]/g, '');
            if (value) window.updateCollectFeeWords(value);
        });
    }
    // Add listener for payment method picker
    const cfPaymentMethodInput = document.getElementById('cf-payment-method');
    if (cfPaymentMethodInput) {
        cfPaymentMethodInput.addEventListener('click', () => {
            if (window.AccountPicker) {
                window.AccountPicker.open({
                    title: "Select Payment Method",
                    targetClasses: ["CLASS 5"], // Cash & Bank accounts
                    onSelect: (account) => {
                        const cfPaymentMethodCoaIdInput = document.getElementById('cf_PaymentMethod_coaId');
                        if (account) {
                            cfPaymentMethodInput.value = account.name;
                            if (cfPaymentMethodCoaIdInput) {
                                cfPaymentMethodCoaIdInput.value = account.id;
                                // As requested, just store it for now.
                                console.log("Pay Bills - Selected Payment Method CoaId:", account.id);
                            }
                        } else {
                            cfPaymentMethodInput.value = '';
                            if (cfPaymentMethodCoaIdInput) cfPaymentMethodCoaIdInput.value = '';
                        }
                    }
                });
            }
        });
    }
};
