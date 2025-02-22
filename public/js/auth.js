document.getElementById('sign-out-btn').addEventListener('click', function () {
    
    fetch(`${API_BASE_URL}/sessions/sign_out`, {
      method: 'POST',
      credentials: 'include', // Include credentials for cookie-based authentication
    })
      .then((response) => {
        if (response.ok) {
          // Clear client-side authentication data
          localStorage.removeItem('authToken'); // or sessionStorage if that's used
          document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          
          // Redirect the user to the login page
          window.location.href = 'index.html';
        } else {
          console.error('Logout failed:', response.statusText);
        }
      })
      .catch((error) => console.error('Error logging out:', error));
  });