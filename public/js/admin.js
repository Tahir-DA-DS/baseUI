// Fetch all users (Admins only)
let API_BASE_URL = 'https://basecamp-0you.onrender.com'
function getToken() {
    return localStorage.getItem('token');
  }

document.addEventListener("DOMContentLoaded", function () {
  const authToken = localStorage.getItem("token"); // Assuming user token is stored
  if (!authToken) {
      alert("Unauthorized access. Please log in.");
      window.location.href = "index.html";
      return;
  }

  fetch(`${API_BASE_URL}/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${authToken}` },
  })
  .then(response => response.json())  
  .then(user => {
      if (!user.isAdmin) {
          alert("Access Denied. Admins only.");
          window.location.href = "index.html";
      } else {
          loadUsers();
          loadProjects();
      }
  })
  .catch((error) => {
      alert(error)
      alert("Session expired. Please log in again.");
      window.location.href = "index.html";
  });
});


function loadUsers() {
  fetch(`${API_BASE_URL}/users`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
      .then(response => response.json())
      .then(users => {
          const userTableBody = document.getElementById("user-table-body");
          userTableBody.innerHTML = "";

          users.forEach(user => {
              const row = document.createElement("tr");

              row.innerHTML = `
                  <td>${user.id}</td>
                  <td>${user.email}</td>
                  <td>${user.isAdmin ? "Admin" : "User"}</td>
                  <td>
                      ${!user.isAdmin ? 
                          `<button class="btn btn-success btn-sm" onclick="promoteToAdmin(${user.id})">Make Admin</button>` : 
                          `<button class="btn btn-warning btn-sm" onclick="demoteAdmin(${user.id})">Remove Admin</button>`
                      }
                      <button class="btn btn-danger btn-sm" onclick="deleteUser(${user.id})">Delete</button>
                  </td>
              `;

              userTableBody.appendChild(row);
          });
      })
      .catch(error => console.error("Error loading users:", error));
}

// Fetch all projects (Admins only)
async function loadProjects() {
    try {
        const response = await fetch(`${API_BASE_URL}/projects/all`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        const projects = await response.json();
        const projectTable = document.getElementById('project-table-body');
        projectTable.innerHTML = '';

        projects.forEach(project => {
          const fileUrl = new URL(project.filepath, API_BASE_URL).href;
          const attachmentLink = project.attachments && project.attachments.length > 0
    ? project.attachments.map(att => 
        `<a href="${API_BASE_URL}/${att.filepath}" target="_blank">${att.filename}</a>`
      ).join(", ")
    : "No Attachment";
            const row = `
                <tr>
                     <td>${project.id}</td>
                    <td>${project.name}</td>
                    <td>${project.description}</td>
                    <td>${project.userId}</td>
                    <td>${attachmentLink}</td>
                    <td>
                      <button class="btn btn-warning btn-sm" onclick="loadProjectDetails(${project.id})">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteProject(${project.id})">Delete</button>
                    </td>
                </tr>
            `;
            projectTable.innerHTML += row;
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
    }
}


function deleteUser(userId) {
  if (!confirm("Are you sure you want to delete this user?")) return; // Confirmation prompt

  fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "DELETE",
      headers: { 
          "Content-Type": "application/json", // Ensure JSON request format
          Authorization: `Bearer ${localStorage.getItem("token")}` 
      },
  })
  .then(response => {
      if (!response.ok) {
          return response.json().then(err => { throw new Error(err.message || "Failed to delete user"); });
      }
      return response.json();
  })
  .then(data => {
      alert(data.message || "User deleted successfully.");
      loadUsers(); // Refresh user list
  })
  .catch(error => {
      console.error("Error deleting user:", error.message);
      alert(`Error: ${error.message}`);
  });
}
// Delete a project (Admins only)
async function deleteProject(projectId) {
    try {
        await fetch(`${API_BASE_URL}/projects/${projectId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        loadProjects();
    } catch (error) {
        console.error('Error deleting project:', error);
    }
}

async function promoteToAdmin(userId) {
    if (!confirm('Are you sure you want to make this user an admin?')) return;
  
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/setAdmin`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include token if needed
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        alert('User successfully promoted to admin.');
        loadUsers(); // Refresh the users list
      } else {
        const errorMsg = await response.json();
        alert(`Failed to promote user: ${errorMsg.message}`);
      }
    } catch (error) {
      console.error('Error promoting user:', error);
      alert('An error occurred while promoting the user.');
    }
  }



  async function demoteAdmin(userId) {
    if (!confirm('Are you sure you want to remove this user as an admin?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/removeAdmin`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include token if needed
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ role: 'user' }) // Send role as 'user' to demote
        });

        const data = await response.json();

        if (!response.ok) {
            alert(`Failed to remove admin: ${data.message}`);
            return;
        }

        alert(`User ${userId} successfully demoted.`);
        loadUsers(); // Refresh the users list
    } catch (error) {
        console.error('Error removing admin:', error);
        alert('An error occurred while demoting the user.');
    }
}

async function loadProjectDetails() {
    try {
      const token = getToken();
  
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data) || data.length === 0) {
        console.error("No projects found");
        return;
      }
      
      // Assuming you want to edit the first project in the list
      const project = data[0]; 
      
      document.getElementById('edit-project-id').value = project.id || '';
      document.getElementById('edit-project-name').value = project.name || '';
      document.getElementById('edit-project-description').value = project.description || '';
  
      // Open the modal
      const modal = new bootstrap.Modal(document.getElementById('editProjectModal'));
      modal.show();
  
    } catch (error) {
      console.error('Error loading project details:', error);
      alert('Failed to load project details.');
    }
  }


  async function saveProjectChanges() {
    const projectId = document.getElementById('edit-project-id').value;
    const name = document.getElementById('edit-project-name').value.trim();
    const description = document.getElementById('edit-project-description').value.trim();
  
    if (!name || !description) {
      alert('Both project name and description are required.');
      return;
    }
  
    try {
      const token = getToken();
  
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: 'PUT',  // Use PUT for updating data
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description }), // Send updated data
      });
  
      if (!response.ok) {
        if (response.status === 401) {
          alert('Unauthorized access. Please log in again.');
        }
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
  
      // Refresh the project list
      fetchProjects();
  
      // Close the modal after update
      const modal = bootstrap.Modal.getInstance(document.getElementById('editProjectModal'));
      if (modal) modal.hide();
  
      // Reset form
      document.getElementById('edit-project-form').reset();
  
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update the project. Please try again.');
    }
}

async function fetchProjects() {
    fetch(`${API_BASE_URL}/projects`, {
      headers: {
        "Authorization": `Bearer ${getToken()}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        const tableBody = document.getElementById("project-table-body");
        tableBody.innerHTML = ""; // Clear previous rows
        data.forEach(project => {
          const attachmentLink = project.filename
            ? `<a href="${API_BASE_URL}/${project.filepath}" target="_blank">${project.filename}</a>`
            : "No Attachment";
  
          tableBody.innerHTML += `
            <tr>
              <td>${project.id}</td>
              <td>${project.name}</td>
              <td>${project.description}</td>
              <td>${project.userId}</td>
              <td>${attachmentLink}</td>
              <td>
                <button class="btn btn-warning btn-sm" onclick="loadProjectDetails(${project.id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteProject(${project.id})">Delete</button>
              </td>
            </tr>
          `;
        });
      })
      .catch(error => console.error("Error fetching projects:", error));
  }

// fetchUsers();
// fetchProjects();