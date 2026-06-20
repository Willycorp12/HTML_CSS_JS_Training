/**
 * js/setup-company-profile.js
 * Handles Company Setup logic.
 */

window.initCompanyProfile = function() {
    console.log("initCompanyProfile: Initializing interface...");
    
    // Populate Academic Year Dropdown from global dataset
    const aySelect = document.getElementById('CP_AcademicYear');
    if (aySelect && window.academicYears) {
        aySelect.innerHTML = '<option value="">-- Select Academic Year --</option>' + 
            window.academicYears.map(ay => `<option value="${ay.id}">${ay.name}</option>`).join('');
    }

    // Tab switching logic for Setup screens
    window.switchCompanyTab = function(tabName, element) {
        // Update Tab UI
        document.querySelectorAll('.setup-tab').forEach(t => t.classList.remove('active'));
        element.classList.add('active');
        
        // Toggle Content Sections
        document.querySelectorAll('.setup-tab-content').forEach(c => c.style.display = 'none');
        const target = document.getElementById(tabName + '-content');
        if (target) target.style.display = 'block';
    };

    // Generic function to preview images
    window.previewSetupImage = function(input, previewId) {
        const file = input.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById(previewId).src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    window.clearSetupImage = function(previewId) {
        document.getElementById(previewId).src = 'user.png';
    };

    console.log("initCompanyProfile: Done.");
};