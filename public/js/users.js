const API_BASE_URL='https://basecamp-0you.onrender.com'
async function fetchUsers() {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, { credentials: 'include' }); 
      const users = await response.json();
  
      const tableBody = document.getElementById('user-table-body');
      tableBody.innerHTML = ''; 
  
      users.forEach(user => {
        const row = `
          <tr>
            <td>${user.Id}</td>
            <td>${user.Email}</td>
            <td>${user.Firstname}</td>
            <td>${user.Lastname}</td>
            <td>
              <button class="btn btn-warning btn-sm" onclick="editUser(${user.Id})">Edit</button>
              <button class="btn btn-danger btn-sm" onclick="deleteUser(${user.Id})">Delete</button>
            </td>
          </tr>
        `;
        tableBody.innerHTML += row;
      });
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }
  
  // Delete a user
  async function deleteUser(userId) {
    try {
      await fetch(`${API_BASE_URL}/api/users/${userId}`, { method: 'DELETE' });
      fetchUsers(); 
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  }
  
  fetchUsers();