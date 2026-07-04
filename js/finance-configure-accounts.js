/**
 * js/finance-configure-accounts.js
 * Handles Default Transaction Accounts Configuration.
 */

window.configuredAccounts = {
    "mod-default-cash": "5712400 - Main cash account",
    "mod-default-bank": "5211500 - NFC BANK BUEA",
    "mod-momo-acc": "5712600 - Mobile Money Account",
    "mod-equity-acc": "1010000 - Share Capital",
    "mod-bank-interest": "7784000 - Interest on Savings",
    "mod-bank-charges": "6310000 - Bank charges",
    "mod-prepayments": "4711700 - Prepayments",
    "mod-bad-debt": "6243300 - Maintenance of...",
    "mod-cnps": "6413100 - Employer's Contribution",
    "mod-taxes": "",
    "mod-default-receivables": "4710000 - Amount Owed by Students",
    "mod-default-payables": "4712112 - Service Suppliers",
    "mod-deprec-exp": "",
    "mod-accruals": "4710000 - Amount Owed by Students",
    "mod-student-discount": "6241000 - Maintenance Building",
    
    // Other accounts tab
    "mod-transcript-income": "7061800 - Income Official Transcript",
    "mod-attest-income": "7070000 - Attestations and Certificates",
    "mod-stock-adj-plus": "7061100 - Tuition fees Undergraduate",
    "mod-stock-adj-minus": "6047000 - Office Stationeries",
    "mod-bank-recon": "845000 - Grant",
    "mod-suspense-exp": "845000 - Grant",
    "mod-suspense-inc": "845000 - Grant",
    "mod-recovery-income": "7061100 - Tuition fees Undergraduate",
    "mod-receivables-old": "4710000 - Amount Owed by Students",
    "mod-pandl-acc": "1301000 - Net Profit/Loss for Period",
    "mod-ait-acc": "4710200 - AIT Deducted at Source",
    "mod-ait-rate": "5.5%"
};

window.initFinanceConfigureAccounts = function() {
    console.log("initFinanceConfigureAccounts: Initializing...");
    
    // Load config values into inputs
    ConfigureAccountsManager.loadInputs();
    
    // Bind Account Picker triggers
    ConfigureAccountsManager.bindPickers();
    
    console.log("initFinanceConfigureAccounts: Done.");
};

window.ConfigureAccountsManager = {
    switchTab(tabName) {
        const tabDefault = document.getElementById('TAB_DefaultAccounts');
        const tabOther = document.getElementById('TAB_OtherAccounts');
        const panelDefault = document.getElementById('PANEL_DefaultAccounts');
        const panelOther = document.getElementById('PANEL_OtherAccounts');
        
        if (tabName === 'default') {
            tabDefault.style.background = '#2e3192';
            tabDefault.style.color = 'white';
            tabDefault.style.borderColor = '#2e3192';
            
            tabOther.style.background = '#e0e0e0';
            tabOther.style.color = '#333';
            tabOther.style.borderColor = '#ccc';
            
            panelDefault.style.display = 'block';
            panelOther.style.display = 'none';
        } else {
            tabOther.style.background = '#2e3192';
            tabOther.style.color = 'white';
            tabOther.style.borderColor = '#2e3192';
            
            tabDefault.style.background = '#e0e0e0';
            tabDefault.style.color = '#333';
            tabDefault.style.borderColor = '#ccc';
            
            panelOther.style.display = 'block';
            panelDefault.style.display = 'none';
        }
    },
    
    loadInputs() {
        for (const [id, val] of Object.entries(window.configuredAccounts)) {
            const input = document.getElementById(id);
            if (input) {
                input.value = val;
            }
        }
    },
    
    bindPickers() {
        const triggers = document.querySelectorAll('.config-container .picker-trigger');
        triggers.forEach(trigger => {
            trigger.onclick = function() {
                const targetId = this.id;
                
                // Fine-tuned target classes for Account Picker depending on the field type
                let targetClasses = [];
                if (['mod-default-cash', 'mod-default-bank', 'mod-momo-acc'].includes(targetId)) {
                    targetClasses = ["CLASS 5"];
                } else if (['mod-equity-acc', 'mod-pandl-acc'].includes(targetId)) {
                    targetClasses = ["CLASS 1"];
                } else if (['mod-transcript-income', 'mod-attest-income', 'mod-stock-adj-plus', 'mod-recovery-income'].includes(targetId)) {
                    targetClasses = ["CLASS 7"];
                } else if (['mod-bad-debt', 'mod-deprec-exp', 'mod-stock-adj-minus', 'mod-bank-charges'].includes(targetId)) {
                    targetClasses = ["CLASS 6"];
                }
                
                if (window.AccountPicker) {
                    window.AccountPicker.open({
                        title: `Select Account for: ${this.previousElementSibling ? this.previousElementSibling.textContent : "Configure Account"}`,
                        targetClasses: targetClasses,
                        allowClear: true,
                        onSelect: (acc) => {
                            if (acc) {
                                this.value = `${acc.code} - ${acc.name}`;
                                window.configuredAccounts[targetId] = this.value;
                            } else {
                                this.value = "";
                                window.configuredAccounts[targetId] = "";
                            }
                        }
                    });
                } else {
                    showAlert("Account Picker is currently unavailable. Please load Chart of Accounts first.", "error");
                }
            };
        });
    },
    
    refreshData() {
        this.loadInputs();
        showAlert("Configuration inputs reloaded successfully.", "success");
    },
    
    saveSettings() {
        // Fetch current rates
        const rateInput = document.getElementById('mod-ait-rate');
        if (rateInput) {
            window.configuredAccounts['mod-ait-rate'] = rateInput.value;
        }
        
        showAlert("Transaction accounts configured and saved successfully.", "success");
    }
};
