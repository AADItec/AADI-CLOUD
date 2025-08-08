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
    // Function to display templates
    function displayTemplates() {
        const templateTableBody = document.querySelector('#template-list tbody');
        if (!templateTableBody) return;

        templateTableBody.innerHTML = ''; // Clear existing templates
        let templates = JSON.parse(localStorage.getItem('templates')) || [];

        if (templates.length === 0) {
            templateTableBody.innerHTML = '<tr><td colspan="5">No templates saved yet.</td></tr>';
            return;
        }

        templates.forEach((template, index) => {
            const row = templateTableBody.insertRow();
            row.innerHTML = `
                <td>${template.title}</td>
                <td>${template.description}</td>
                <td>${template.keywords.join(', ')}</td>
                <td>
                    <ul>
                        ${template.questions.map(q => `<li>${q}</li>`).join('')}
                    </ul>
                </td>
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
        let templates = JSON.parse(localStorage.getItem('templates')) || [];
        const templateToEdit = templates[index];

        if (templateToEdit) {
            document.getElementById('template-title').value = templateToEdit.title;
            document.getElementById('template-description').value = templateToEdit.description;
            document.getElementById('template-keywords').value = templateToEdit.keywords.join(', ');
            document.getElementById('template-questions').value = templateToEdit.questions.join('\n');

            // Store the index of the template being edited
            templateForm.dataset.editIndex = index;
            document.getElementById('template-form-submit-btn').textContent = 'Update Template';
        }
    }

    // Function to delete a template
    function deleteTemplate(index) {
        let templates = JSON.parse(localStorage.getItem('templates')) || [];
        templates.splice(index, 1);
        localStorage.setItem('templates', JSON.stringify(templates));
        displayTemplates(); // Refresh the list
    }

    // Initial display of templates when the page loads
    displayTemplates();

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

    if (templateForm) {
        templateForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const keywordsInput = document.getElementById('template-keywords');
            const questionsTextarea = document.getElementById('template-questions');

            const keywords = keywordsInput.value.split(',').map(keyword => keyword.trim()).filter(keyword => keyword !== '');
            if (keywords.length > 5) {
                alert('Please enter a maximum of 5 keywords.');
                return;
            }

            const questions = questionsTextarea.value.split('\n').map(question => question.trim()).filter(question => question !== '');
            if (questions.length > 5) {
                alert('Please enter a maximum of 5 questions.');
                return;
            }

            const newTemplate = {
                title: document.getElementById('template-title').value,
                description: document.getElementById('template-description').value,
                keywords: keywords,
                questions: questions
            };

            let templates = JSON.parse(localStorage.getItem('templates')) || [];

            const editIndex = templateForm.dataset.editIndex;

            if (editIndex !== undefined) {
                // Update existing template
                templates[editIndex] = newTemplate;
                delete templateForm.dataset.editIndex; // Clear edit index
                document.getElementById('template-form-submit-btn').textContent = 'Save Template';
            } else {
                // Add new template
                templates.push(newTemplate);
            }

            localStorage.setItem('templates', JSON.stringify(templates));

            alert('Template saved successfully!');
            displayTemplates(); // Call function to display updated templates
            templateForm.reset();
        });
    }
});