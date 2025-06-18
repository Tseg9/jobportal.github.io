document.addEventListener('DOMContentLoaded', () => {
    const jobApplicationForm = document.getElementById('jobApplicationForm');
    const formMessage = document.getElementById('formMessage');
    const submitBtn = document.getElementById('submitBtn');
    const applicationFormSection = document.getElementById('application-form-section');
    const applyingForJobTitleSpan = document.getElementById('applying-for-job-title');
    const jobTitleHiddenInput = document.getElementById('jobTitleHidden');

    // --- IMPORTANT: PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE ---
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwBS-wERwsLl4eE-RSlFsg4sAqcTG1MRtP9jhoQfGsx7KgDnnvPvsm-nKGqT9oYsPzA/exec"; 
    // --- ---

    // Handle "Apply Now" button clicks
    document.querySelectorAll('.apply-btn').forEach(button => {
        button.addEventListener('click', function() {
            const jobTitle = this.dataset.jobTitle;
            applyingForJobTitleSpan.textContent = jobTitle;
            jobTitleHiddenInput.value = jobTitle;
            applicationFormSection.style.display = 'block';
            applicationFormSection.scrollIntoView({ behavior: 'smooth' });
            jobApplicationForm.reset(); // Clear previous entries
            formMessage.textContent = '';
            formMessage.className = '';
        });
    });


    if (jobApplicationForm) {
        jobApplicationForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            formMessage.textContent = 'Submitting... Please wait.';
            formMessage.className = '';
            submitBtn.disabled = true;

            const formData = {
                applicantName: document.getElementById('applicantName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                jobTitle: document.getElementById('jobTitleHidden').value,
                notes: document.getElementById('notes').value,
                cvFile: null,
                cvFileName: null,
                cvMimeType: null,
                credentialsFile: null,
                credentialsFileName: null,
                credentialsMimeType: null
            };

            // --- File Handling ---
            const cvFileInput = document.getElementById('cvFile');
            if (cvFileInput.files.length > 0) {
                const file = cvFileInput.files[0];
                formData.cvFileName = file.name;
                formData.cvMimeType = file.type;
                formData.cvFile = await readFileAsBase64(file);
            } else {
                // CV is required, but HTML `required` attribute handles client-side.
                // If for some reason it's bypassed, GAS will simply store an empty link.
            }

            const credentialsFileInput = document.getElementById('credentialsFile');
            if (credentialsFileInput.files.length > 0) {
                const file = credentialsFileInput.files[0];
                formData.credentialsFileName = file.name;
                formData.credentialsMimeType = file.type;
                formData.credentialsFile = await readFileAsBase64(file);
            }
            // --- End File Handling ---
            
            try {
                const response = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    mode: 'cors', // Important for cross-origin requests
                    cache: 'no-cache',
                    headers: {
                        'Content-Type': 'application/json', // Sending JSON to Apps Script
                    },
                    body: JSON.stringify(formData) // Body data type must match "Content-Type" header
                });

                const result = await response.json();

                if (result.status === "success") {
                    formMessage.textContent = result.message + " CV Link: " + (result.cv || 'N/A') + ", Credentials Link: " + (result.cred || 'N/A');
                    formMessage.className = 'success';
                    jobApplicationForm.reset();
                    applicationFormSection.style.display = 'none'; // Optionally hide form after success
                } else {
                    formMessage.textContent = 'Error: ' + result.message;
                    formMessage.className = 'error';
                }

            } catch (error) {
                console.error('Error submitting form:', error);
                formMessage.textContent = 'An unexpected error occurred. Please try again. Check console for details.';
                formMessage.className = 'error';
            } finally {
                submitBtn.disabled = false;
            }
        });
    }

    // Helper function to read file as Base64
    function readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result); // result is base64 data URL
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }
});
