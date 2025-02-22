const API_BASE_URL ="https://basecamp-0you.onrender.com";

function getToken() {
  return localStorage.getItem('token');
}

document.addEventListener("DOMContentLoaded", () => { //fetch projects, attachments and threads on initialization
  fetchProjects();
  fetchThreads();
});

document.getElementById("projectForm").addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent default form submission
  
  const name = document.getElementById("projectName").value;
  const description = document.getElementById("projectDescription").value;
  const fileInput = document.getElementById("fileUpload").files[0];
  const token = getToken(); 

  if (!name || !description) {
    return alert("Project name and description are required!");
  }

  const formData = new FormData();
  formData.append("name", name);
  formData.append("description", description);
  if (fileInput) {
    formData.append("file", fileInput);
  }

  fetch(`${API_BASE_URL}/projects`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
    body: formData,
  })
    .then(res => res.json())
    .then(data => {
      alert("Project created successfully!");
      document.getElementById("projectForm").reset(); // Reset form fields
      fetchProjects(); // Refresh project list
      new bootstrap.Modal(document.getElementById("addProjectModal")).hide(); // Close modal
    })
    .catch(error => console.error("Error creating project:", error));
})

// Fetch and display all projects
async function fetchProjects() {
  fetch(`${API_BASE_URL}/projects`, {
    headers: {
      "Authorization": `Bearer ${getToken()}`,
    },
  })
    .then(res => res.json())
    .then(data => {
      const tableBody = document.getElementById("project-table-body");
      tableBody.innerHTML = ""; 
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

// Delete a project
async function deleteProject(projectId) {
  if (!confirm('Are you sure you want to delete this project?')) return;

  try {
    const token = getToken();

    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`, 
      'Content-Type': 'application/json',
      },  
    });

    if (!response.ok) {
      if (response.status === 401) {
        alert('Unauthorized access. Please log in again.');
        
      }
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    fetchProjects(); 
  } catch (error) {
    console.error('Error deleting project:', error);
    alert('Failed to delete the project. Please try again.');
  }
}

// Add a new project
async function addProject(event) {
  event.preventDefault();

  const name = document.getElementById('project-name').value.trim();
  const description = document.getElementById('project-description').value.trim();

  if (!name || !description) {
    alert('Both project name and description are required.');
    return;
  }

  try {
    const token = getToken();

    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, description }),
    });

   

    if (!response.ok) {
      if (response.status === 401) {
        alert('Unauthorized access. Please log in again.');
        
      }
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }
    fetchProjects(); // Refresh the table
    const modal = bootstrap.Modal.getInstance(document.getElementById('addProjectModal'));
    if (modal) modal.hide();
    document.getElementById('add-project-form').reset();
  } catch (error) {
    console.error('Error adding project:', error);
    alert('Failed to add the project. Please try again.');
  }
}

async function editProject(event) {
  event.preventDefault(); // Prevent default form submission

  const projectId = document.getElementById('edit-project-id').value;
  
  const token = getToken();

  const data = {
    name: document.getElementById('edit-project-name').value,
    description: document.getElementById('edit-project-description').value,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data), 
    });

    if (!response.ok) {
      if (response.status === 401) {
        alert('Unauthorized access. Please log in again.');
      
      }
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    fetchProjects(); 
    const modal = bootstrap.Modal.getInstance(document.getElementById('editProjectModal'));
    if (modal) modal.hide();
  } catch (error) {
    console.error('Error updating project:', error);
    alert('Failed to update the project. Please try again.');
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
      method: 'PUT',  
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



async function populateEditForm() {
  const projectId = document.getElementById("edit-project-select").value;
  if (!projectId) return;

  try {
    const token = getToken();

    const response = await fetch(`${API_BASE_URL}/api/project/${projectId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const project = await response.json();

    document.getElementById('edit-project-id').value = project.id || '';
    document.getElementById('edit-project-name').value = project.name || '';
    document.getElementById('edit-project-description').value = project.description || '';

    // Populate attachment field (if exists)
    const attachmentField = document.getElementById("current-attachment");
    if (project.attachment) {
      attachmentField.innerHTML = `<a href="${API_BASE_URL}/${project.attachment.filepath}" target="_blank">${project.attachment.filename}</a>`;
    } else {
      attachmentField.innerHTML = "No file uploaded.";
    }

    // Close selection modal & open edit modal
    bootstrap.Modal.getInstance(document.getElementById("selectProjectModal")).hide();
    new bootstrap.Modal(document.getElementById("editProjectModal")).show();

  } catch (error) {
    console.error('Error loading project details:', error);
    alert('Failed to load project details.');
  }
}

async function fetchAttachments() {
  const list = document.getElementById("attachmentList");
  list.innerHTML = "<li class='list-group-item'>Loading...</li>"; // Show loading 
  const token = getToken()

  try {
      const response = await fetch(`${API_BASE_URL}/api/attachment`, {
          method: "GET",
          headers: {
              "Authorization": `Bearer ${token}`,
              'Content-Type': 'application/json',
          },
      });

      if (!response.ok) {
          throw new Error("Network response was not ok");
      }

      const data = await response.json();
      list.innerHTML = ""; 

      if (data.length === 0) {
          list.innerHTML = "<li class='list-group-item'>No attachments found</li>";
          return;
      }

      data.forEach(file => {
          const listItem = document.createElement("li");
          listItem.className = "list-group-item";
          listItem.textContent = file.filename;
          list.appendChild(listItem);
      });
  } catch (error) {
      console.error("There has been a problem with your fetch operation:", error);
      list.innerHTML = "<li class='list-group-item text-danger'>Error fetching attachments</li>";
  }
}

document.getElementById('edit-project-form').addEventListener('submit', editProject);


function uploadAttachment() {
  const fileInput = document.getElementById("fileUpload").files[0];
  const token = getToken()
  if (!fileInput) return alert("Select a file first!");

  const formData = new FormData();
  formData.append("file", fileInput);

  fetch(`${API_BASE_URL}/api/attachment`, { 
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`, 
  }, 
    body: formData 
  
  })
      .then(res => res.json())
}


async function fetchThreads() {
  let token = await getToken();
  try {
    const response = await fetch(`${API_BASE_URL}/api/thread`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      }
    });

    if (!response.ok) throw new Error("Failed to fetch threads");

    const threads = await response.json();
    const threadList = document.getElementById("threadList");
    threadList.innerHTML = ""; 

    threads.forEach(thread => {
      const li = document.createElement("li");
      li.className = "list-group-item d-flex justify-content-between align-items-center";

      // Clickable thread title
      li.innerHTML = `
        <a href="thread.html?threadId=${thread.id}" class="text-decoration-none">
          ${thread.title} (Project ID: ${thread.project_id})
        </a>
        <button class="btn btn-danger btn-sm" onclick="deleteThread(${thread.id})">Delete</button>
      `;

      threadList.appendChild(li);
    });
  } catch (error) {
    console.error("Error loading threads:", error);
  }
}

document.getElementById("createThreadBtn").addEventListener("click", createThread);
async function createThread() {
  let token = await getToken();
  const projectId = prompt("Enter Project ID:");
  const title = prompt("Enter Thread Title:");
  if (!projectId || !title) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/thread`, { // Added `await`
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json" // Added `Content-Type`
      },
      body: JSON.stringify({ projectId, title }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      alert(errorData.message);
      return;
    }

    alert("Thread created successfully");
    fetchThreads(); // Refresh list
  } catch (error) {
    console.error("Error creating thread:", error);
  }
}

async function deleteThread(id) {
  let token = await getToken();

  if (!confirm("Are you sure you want to delete this thread?")) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/thread/${id}`, { 
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json" 
      },

     });
    if (!response.ok) {
      const errorData = await response.json();
      alert(errorData.message);
      return;
    }

    alert("Thread deleted");
    fetchThreads(); 
  } catch (error) {
    console.error("Error deleting thread:", error);
  }
}


