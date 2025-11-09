// Check authentication
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'login.html';
}

// Load tasks on page load
document.addEventListener('DOMContentLoaded', () => {
  loadTasks();
});

// Function to load tasks
async function loadTasks() {
  const loading = document.getElementById('loading');
  const taskList = document.getElementById('taskList');
  const noTasks = document.getElementById('noTasks');
  
  loading.style.display = 'block';
  taskList.innerHTML = '';
  noTasks.style.display = 'none';

  try {
    const response = await fetch('/api/tasks', {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'login.html';
      return;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('Error response:', errorData);
      loading.style.display = 'none';
      
      let errorMessage = errorData.message || 'Error loading tasks';
      if (errorData.error) {
        errorMessage += '<br><small>' + errorData.error + '</small>';
      }
      if (errorData.code) {
        errorMessage += '<br><small>Error Code: ' + errorData.code + '</small>';
      }
      if (errorData.code === 'ER_NO_SUCH_TABLE') {
        errorMessage += '<br><small style="color: #dc3545;">The tasks table does not exist. Please restart the server to create it automatically.</small>';
      }
      
      taskList.innerHTML = `<div class="col-12"><div class="alert alert-danger">${errorMessage}</div></div>`;
      return;
    }

    const tasks = await response.json();
    loading.style.display = 'none';

    if (!tasks || tasks.length === 0) {
      noTasks.style.display = 'block';
      return;
    }

    tasks.forEach(task => {
      const col = document.createElement('div');
      col.classList.add('col-md-4', 'col-sm-6');
      
      const statusClass = {
        'pending': 'bg-warning',
        'in-progress': 'bg-info',
        'completed': 'bg-success'
      }[task.status] || 'bg-secondary';
      
      const deadline = task.deadline 
        ? new Date(task.deadline).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : 'No deadline';
      
      col.innerHTML = `
        <div class="card task-card shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h5 class="card-title mb-0">${escapeHtml(task.title)}</h5>
              <span class="badge ${statusClass} status-badge">${task.status || 'pending'}</span>
            </div>
            <p class="card-text text-muted small">${escapeHtml(task.description || 'No description')}</p>
            <div class="mt-3">
              <small class="text-muted">
                <strong>Deadline:</strong> ${deadline}
              </small>
            </div>
            <div class="mt-3 d-flex gap-2">
              <button class="btn btn-sm btn-outline-primary" onclick="editTask(${task.id})">Edit</button>
              <button class="btn btn-sm btn-outline-danger" onclick="deleteTask(${task.id})">Delete</button>
            </div>
          </div>
        </div>
      `;
      taskList.appendChild(col);
    });
  } catch (error) {
    console.error('Error loading tasks:', error);
    loading.style.display = 'none';
    taskList.innerHTML = '<div class="col-12"><div class="alert alert-danger">Error loading tasks. Please try again.</div></div>';
  }
}

// Function to delete task
async function deleteTask(taskId) {
  if (!confirm('Are you sure you want to delete this task?')) {
    return;
  }

  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    });

    const data = await response.json();

    if (response.ok) {
      alert('Task deleted successfully');
      loadTasks();
    } else {
      alert(data.message || 'Failed to delete task');
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    alert('An error occurred. Please try again.');
  }
}

// Function to edit task (redirect to edit page)
function editTask(taskId) {
  window.location.href = `edit_task.html?id=${taskId}`;
}

// Function to logout
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  }
}

// Helper function to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
