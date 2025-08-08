document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.admin-sidebar nav ul li a');
    const sections = document.querySelectorAll('.admin-section');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            // Remove active class from all links
            navLinks.forEach(nav => nav.classList.remove('active'));
            // Add active class to the clicked link
            this.classList.add('active');

            // Remove active class from all sections
            sections.forEach(section => section.classList.remove('active'));

            // Add active class to the target section
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            targetSection.classList.add('active');

            // If the user management section is active, display users
            if (targetId === 'user-management') {
                displayUsers();
            }
         });
    });

    // Initially show the first section or a default one
    if (navLinks.length > 0) {
        navLinks[0].click();
    }

    // Handle logout button click
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            // In a real application, you would clear session data here
            // For this example, we'll just redirect to the login page
            window.location.href = 'index.html';
        });
    }

    const templateForm = document.getElementById('template-form');
    const descriptionTextarea = document.getElementById('template-description');
    const descriptionCharCount = document.getElementById('description-char-count');

    if (descriptionTextarea && descriptionCharCount) {
        descriptionTextarea.addEventListener('input', () => {
            const currentLength = descriptionTextarea.value.length;
            descriptionCharCount.textContent = `${currentLength}/1000`;
        });
    }
    const addTemplateBtn = document.getElementById('add-template-btn');

    if (addTemplateBtn) {
        addTemplateBtn.addEventListener('click', () => {
            if (templateForm.style.display === 'none') {
                templateForm.style.display = 'block';
            } else {
                templateForm.style.display = 'none';
            }
        });
    }

    // Global array to store templates
    window.templates = [];

    // Function to load templates from files (called once on initial load)
    async function loadInitialTemplates() {
        // Load templates from the 'templates' directory
        const templateFiles = [];
        for (let i = 1; i <= 10; i++) { // Assuming templates are named template1.json to template10.json
            templateFiles.push(`template${i}.json`);
        }

        for (const file of templateFiles) {
            const templatePath = `../templates/${file}`;
            console.log(`Attempting to fetch: ${templatePath}`);
            try {
                const response = await fetch(templatePath);
                console.log(`Response for ${templatePath}:`, response);
                if (!response.ok) {
                    console.warn(`Template file not found or error loading: ${file}, Status: ${response.status}`);
                    continue;
                }
                const data = await response.json();
                console.log(`Successfully loaded template ${file}:`, data);
                // If the data is an array and contains at least one object, use the first object as the template
                if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
                    window.templates.push(data[0]);
                } else if (typeof data === 'object') {
                    window.templates.push(data);
                } else {
                    console.warn(`Unexpected template data format for ${file}:`, data);
                }
            } catch (error) {
                console.error(`Error loading template file ${file}:`, error);
            }
        }
        displayTemplates(); // Display templates after initial load
    }

    // Function to display templates
    function displayTemplates() {
        const templateTableBody = document.querySelector('#template-list tbody');
        if (!templateTableBody) return;

        templateTableBody.innerHTML = ''; // Clear existing templates

        if (window.templates.length === 0) {
            templateTableBody.innerHTML = '<tr><td colspan="5">No templates found in the templates directory.</td></tr>';
            return;
        }

        window.templates.forEach((template, index) => {

            const row = templateTableBody.insertRow();
            row.innerHTML = `

                <td>${template.title ? (Array.isArray(template.title) ? template.title[0] : template.title) : 'Untitled Template'}</td>
                <td>
                    <button class="update-template-btn" data-index="${index}">Update</button>
                    <button class="delete-template-btn" data-index="${index}">Delete</button>
                </td>
            `;
        });

        // Add event listeners for delete buttons
        document.querySelectorAll('.delete-template-btn').forEach(button => {
            button.addEventListener('click', function() {
                const indexToDelete = this.dataset.index;
                deleteTemplate(indexToDelete);
            });
        });

        document.querySelectorAll('.update-template-btn').forEach(button => {
            button.addEventListener('click', function() {
                const indexToUpdate = this.dataset.index;
                editTemplate(indexToUpdate);
            });
        });
    }

    // Function to edit a template
    function editTemplate(index) {
        const template = window.templates[index];
        if (!template) {
            console.error('Template not found for index:', index);
            return;
        }

        document.getElementById('template-title').value = Array.isArray(template.title) ? template.title[0] : template.title;
        document.getElementById('template-description').value = Array.isArray(template.description) ? template.description[0] : template.description;
        if (descriptionTextarea && descriptionCharCount) {
            descriptionCharCount.textContent = `${(Array.isArray(template.description) ? template.description[0] : template.description).length}/1000`;
        }
        currentKeywords = Array.isArray(template.keywords) ? template.keywords : (template.keywords ? [template.keywords] : []);
        renderKeywords();
        updateHiddenKeywords();
        currentQuestions = Array.isArray(template.questions) ? template.questions : (template.questions ? [template.questions] : []);
        renderQuestions();
        updateHiddenQuestions();

        templateForm.style.display = 'block';
        // Store the index of the template being edited for later saving
        templateForm.dataset.editingIndex = index;
    }

    // Function to delete a template
    function deleteTemplate(index) {
        alert('Deleting templates is not supported in this client-side admin panel. Please remove the .json files directly from the /templates directory.');
    }

    // Initial display of templates when the page loads
    loadInitialTemplates();

    const keywordsContainer = document.getElementById('keywords-container');
    const keywordInput = document.getElementById('keyword-input');
    const hiddenKeywordsInput = document.getElementById('template-keywords');

    let currentKeywords = [];

    function renderKeywords() {
        keywordsContainer.querySelectorAll('.keyword-tag').forEach(tag => tag.remove());
        currentKeywords.forEach(keyword => {
            const tag = document.createElement('span');
            tag.classList.add('keyword-tag');
            tag.textContent = keyword;
            const removeBtn = document.createElement('span');
            removeBtn.classList.add('remove-keyword');
            removeBtn.textContent = 'x';
            removeBtn.addEventListener('click', () => {
                currentKeywords = currentKeywords.filter(k => k !== keyword);
                updateHiddenKeywords();
                renderKeywords();
            });
            tag.appendChild(removeBtn);
            keywordsContainer.insertBefore(tag, keywordInput);
        });
    }

    function updateHiddenKeywords() {
        hiddenKeywordsInput.value = currentKeywords.join(',');
    }

    if (keywordInput) {
        keywordInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && keywordInput.value.trim() !== '') {
                e.preventDefault();
                const newKeyword = keywordInput.value.trim();
                if (!currentKeywords.includes(newKeyword)) {
                    if (currentKeywords.length < 5) {
                        currentKeywords.push(newKeyword);
                        updateHiddenKeywords();
                        renderKeywords();
                        keywordInput.value = '';
                    } else {
                        alert('You can add a maximum of 5 keywords.');
                    }
                } else {
                    alert('This keyword already exists.');
                }
            }
        });
    }

    const questionsContainer = document.getElementById('questions-container');
    const questionInput = document.getElementById('question-input');
    const hiddenQuestionsInput = document.getElementById('template-questions');

    let currentQuestions = [];

    function renderQuestions() {
        questionsContainer.querySelectorAll('.question-tag').forEach(tag => tag.remove());
        currentQuestions.forEach(question => {
            const tag = document.createElement('span');
            tag.classList.add('question-tag');
            tag.textContent = question;
            const removeBtn = document.createElement('span');
            removeBtn.classList.add('remove-question');
            removeBtn.textContent = 'x';
            removeBtn.addEventListener('click', () => {
                currentQuestions = currentQuestions.filter(q => q !== question);
                updateHiddenQuestions();
                renderQuestions();
            });
            tag.appendChild(removeBtn);
            questionsContainer.insertBefore(tag, questionInput);
        });
    }

    function updateHiddenQuestions() {
        hiddenQuestionsInput.value = currentQuestions.join('\n');
    }

    if (questionInput) {
        questionInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && questionInput.value.trim() !== '') {
                e.preventDefault();
                const newQuestion = questionInput.value.trim();
                if (!currentQuestions.includes(newQuestion)) {
                    if (currentQuestions.length < 5) {
                        currentQuestions.push(newQuestion);
                        updateHiddenQuestions();
                        renderQuestions();
                        questionInput.value = '';
                    } else {
                        alert('You can add a maximum of 5 questions.');
                    }
                } else {
                    alert('This question already exists.');
                }
            }
        });
    }

    // Handle template form submission
    if (templateForm) {
        templateForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const title = document.getElementById('template-title').value;
            const description = document.getElementById('template-description').value;
            const keywords = document.getElementById('template-keywords').value.split(',').map(k => k.trim()).filter(k => k.length > 0);
            const questions = currentQuestions;

             const newTemplate = {
                 title,
                 description,
                 keywords,
                 questions
             };

             const editingIndex = templateForm.dataset.editingIndex;

             if (editingIndex !== undefined && editingIndex !== null && window.templates[editingIndex]) {
                 // Update existing template
                 window.templates[editingIndex] = newTemplate;
                 alert('Template updated successfully (client-side only)!');
             } else {
                 // Add new template
                 window.templates.push(newTemplate);
                 alert('Template added successfully (client-side only)!');
             }

             displayTemplates(); // Refresh the displayed list
             templateForm.reset();
             templateForm.style.display = 'none';
             delete templateForm.dataset.editingIndex; // Clear editing state
        });
    }


    // Function to display users
    function displayUsers() {
        const userTableBody = document.querySelector('#user-list tbody');
        if (!userTableBody) return;

        userTableBody.innerHTML = ''; // Clear existing users
        let users = JSON.parse(localStorage.getItem('users')) || [];

        if (users.length === 0) {
            userTableBody.innerHTML = '<tr><td colspan="4">No users found.</td></tr>';
            return;
        }

        users.forEach((user, index) => {
            const row = userTableBody.insertRow();
            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>
                    <button class="update-user-btn" data-index="${index}">Update</button>
                    <button class="delete-user-btn" data-index="${index}">Delete</button>
                </td>
            `;
        });

        // Add event listeners for delete buttons
        document.querySelectorAll('.delete-user-btn').forEach(button => {
            button.addEventListener('click', function() {
                const indexToDelete = this.dataset.index;
                deleteUser(indexToDelete);
            });
        });

        document.querySelectorAll('.update-user-btn').forEach(button => {
            button.addEventListener('click', function() {
                const indexToUpdate = this.dataset.index;
                editUser(indexToUpdate);
            });
        });
    }

    // Function to edit a user
    function editUser(index) {
        let users = JSON.parse(localStorage.getItem('users')) || [];
        const userToEdit = users[index];

        if (userToEdit) {
            document.getElementById('username').value = userToEdit.username;
            document.getElementById('email').value = userToEdit.email;
            document.getElementById('role').value = userToEdit.role;

            // Store the index of the user being edited
            userForm.dataset.editIndex = index;
            document.getElementById('user-form-submit-btn').textContent = 'Update User';
            document.getElementById('user-form-heading').textContent = 'Update User';
        }
    }

    // Function to delete a user
    function deleteUser(index) {
        let users = JSON.parse(localStorage.getItem('users')) || [];
        users.splice(index, 1);
        localStorage.setItem('users', JSON.stringify(users));
        displayUsers(); // Refresh the list
    }

    // Function to reset the user form
    function resetUserForm() {
        userForm.reset();
        userForm.dataset.editIndex = ''; // Clear edit index
        document.getElementById('user-form-submit-btn').textContent = 'Add User';
        document.getElementById('user-form-heading').textContent = 'Add New User';
    }

    // Initial display of users when the page loads
    displayUsers();

    const userForm = document.getElementById('user-form');
    if (userForm) {
        // Ensure the form is reset when the user management section is displayed
        resetUserForm();
        userForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const role = document.getElementById('role').value;

            let users = JSON.parse(localStorage.getItem('users')) || [];
            const editIndex = userForm.dataset.editIndex;

            if (editIndex !== undefined && editIndex !== '') {
                // Update existing user
                users[editIndex] = { username, email, role };
                alert('User updated successfully!');
            } else {
                // Add new user
                users.push({ username, email, role });
                alert('User added successfully!');
            }

            localStorage.setItem('users', JSON.stringify(users));
            displayUsers(); // Refresh the user list
            resetUserForm(); // Call the new reset function
        });
    }


});