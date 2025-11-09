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
      
      // Format deadline - parse manually to avoid timezone issues
      let deadline = 'No deadline';
      if (task.deadline) {
        try {
          // Parse the deadline string manually (MySQL returns "YYYY-MM-DD HH:mm:ss")
          let year, monthNum, day, hours, minutes;
          
          if (task.deadline.includes('T')) {
            // ISO format: "YYYY-MM-DDTHH:mm:ss" or "YYYY-MM-DDTHH:mm:ssZ"
            const dateStr = task.deadline.split('T')[0];
            const timeStr = task.deadline.split('T')[1] || '';
            const dateParts = dateStr.split('-');
            const timeParts = (timeStr.split('.')[0] || timeStr.split('Z')[0] || timeStr).split(':');
            
            year = dateParts[0];
            monthNum = parseInt(dateParts[1]) || 1;
            day = dateParts[2];
            hours = timeParts[0] || '00';
            minutes = timeParts[1] || '00';
          } else {
            // MySQL DATETIME format: "YYYY-MM-DD HH:mm:ss"
            const parts = task.deadline.split(/[- :]/);
            year = parts[0];
            monthNum = parseInt(parts[1]) || 1;
            day = parts[2];
            hours = parts[3] || '00';
            minutes = parts[4] || '00';
          }
          
          // Validate parsed values
          if (year && monthNum >= 1 && monthNum <= 12 && day) {
            // Use the raw values directly for display (no Date object conversion)
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const displayMonth = monthNames[monthNum - 1] || 'Jan';
            const displayDay = parseInt(day) || 1;
            const displayYear = parseInt(year) || new Date().getFullYear();
            const displayHours = String(parseInt(hours) || 0).padStart(2, '0');
            const displayMinutes = String(parseInt(minutes) || 0).padStart(2, '0');
            
            deadline = `${displayMonth} ${displayDay}, ${displayYear} ${displayHours}:${displayMinutes}`;
          } else {
            deadline = task.deadline; // Fallback to raw value if parsing failed
          }
        } catch (error) {
          console.error('Error formatting deadline:', error, task.deadline);
          deadline = task.deadline; // Fallback to raw value
        }
      }
      
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
