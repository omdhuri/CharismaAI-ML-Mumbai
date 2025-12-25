// Add to agent2.js - insert this at the end of displayFeedback function before showing container

// Similar roles
if (feedback.similar_roles && feedback.similar_roles.length > 0) {
    const rolesSection = document.getElementById('similar-roles');
    const rolesList = document.getElementById('roles-list');
    rolesList.innerHTML = '';

    feedback.similar_roles.forEach((role, index) => {
        const roleCard = document.createElement('div');
        roleCard.className = 'role-card';
        roleCard.innerHTML = `
                <div class="role-number">${index + 1}</div>
                <div class="role-content">
                    <h5>${role.title}</h5>
                    <p>${role.reason}</p>
                </div>
            `;
        rolesList.appendChild(roleCard);
    });

    rolesSection.classList.remove('hidden');
}
