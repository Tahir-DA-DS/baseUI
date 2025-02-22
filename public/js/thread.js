let API_BASE_URL = 'https://basecamp-0you.onrender.com'

function getToken() {
    return localStorage.getItem('token');
  }
document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const threadId = urlParams.get("threadId");

    if (!threadId) {
        alert("Invalid thread ID");
        return;
    }

    await fetchThreadDetails(threadId);
    await fetchMessages(threadId);
});

async function fetchThreadDetails(threadId) {
    let token = await getToken()
    try {
        const res = await fetch(`${API_BASE_URL}/api/thread/${threadId}`,{
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${token}`
                },
              }
        );
        if (!res.ok) throw new Error("Failed to fetch thread");

        const thread = await res.json();
        document.getElementById("threadTitle").textContent = thread.title;
    } catch (error) {
        console.error("Error fetching thread details:", error);
    }
}

async function fetchMessages(threadId) {
    const token = await getToken();
    
    try {
        const res = await fetch(`${API_BASE_URL}/api/messages/${threadId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error("Failed to fetch messages");

        const messages = await res.json();
        const list = document.getElementById("messageList");
        list.innerHTML = ""; 

        if (messages.length === 0) {
            list.innerHTML = `<li class="list-group-item text-muted">No messages yet.</li>`;
            return;
        }

        messages.forEach(msg => {
            const li = document.createElement("li");
            li.className = "list-group-item d-flex justify-content-between align-items-center";
            li.innerHTML = `
                <span><strong>${msg.firstname}:</strong> <span id="msg-content-${msg.id}">${msg.content}</span></span>
                <div>
                    <button class="btn btn-sm btn-warning me-2" onclick="editMessage(${msg.id}, '${msg.content}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteMessage(${msg.id})">Delete</button>
                </div>
            `;
            list.appendChild(li);
        });
    } catch (error) {
        console.error("Error fetching messages:", error);
        document.getElementById("messageList").innerHTML = 
            `<li class="list-group-item text-danger">Error loading messages.</li>`;
    }
}

async function editMessage(messageId, oldContent) {
    const newContent = prompt("Edit your message:", oldContent);
    if (!newContent || newContent === oldContent) return;

    const token = await getToken();
    
    try {
        const res = await fetch(`${API_BASE_URL}/api/messages/${messageId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ content: newContent })
        });

        if (!res.ok) throw new Error("Failed to update message");

        document.getElementById(`msg-content-${messageId}`).innerText = newContent;
    } catch (error) {
        console.error("Error updating message:", error);
        alert("Failed to update message.");
    }
}

async function deleteMessage(messageId) {
    if (!confirm("Are you sure you want to delete this message?")) return;
    const urlParams = new URLSearchParams(window.location.search);
    const token = await getToken();
    const threadId = urlParams.get("threadId");

    try {
        const res = await fetch(`${API_BASE_URL}/api/messages/${messageId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error("Failed to delete message(might not be a message sen by you)");
        fetchMessages(threadId);
    } catch (error) {
        console.error("Error deleting message:", error);
        alert(error.message);
    }
}

async function sendMessage() {
    const urlParams = new URLSearchParams(window.location.search);
    const threadId = urlParams.get("threadId");
    const messageInput = document.getElementById("newMessage");
    const message = messageInput.value.trim();

    if (!message) {
        alert("Message cannot be empty!");
        return;
    }

    try {
        const token = await getToken(); 

        const res = await fetch(`${API_BASE_URL}/api/messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json", 
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ threadId, content: message })
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Failed to send message");
        }

        messageInput.value = ""; 
        fetchMessages(threadId); 
    } catch (error) {
        console.error("Error sending message:", error);
        alert("Failed to send message. Please try again.");
    }
}