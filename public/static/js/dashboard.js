document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  const response = await fetch('http://localhost:5000/api/tasks', {
    headers: { 'Authorization': 'Bearer ' + token }
  });

  const tasks = await response.json();
  const taskList = document.getElementById('taskList');
  taskList.innerHTML = '';

  tasks.forEach(task => {
    const div = document.createElement('div');
    div.classList = 'col-md-4';
    div.innerHTML = `
      <div class="card mb-3 shadow-sm">
        <div class="card-body">
          <h5>${task.title}</h5>
          <p>${task.description}</p>
          <p>Status: ${task.status}</p>
          <p>Deadline: ${task.deadline || 'N/A'}</p>
        </div>
      </div>`;
    taskList.appendChild(div);
  });
});

function logout() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}