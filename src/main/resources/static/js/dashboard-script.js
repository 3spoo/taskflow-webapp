const API_URL = "/api/v1/task";

const errorDiv = document.getElementById("errorMsg");

function showError(message) {
    if (!errorDiv) return;

    errorDiv.textContent = message;
    errorDiv.style.display = "block";
}

function clearError() {
    if (!errorDiv) return;

    errorDiv.textContent = "";
    errorDiv.style.display = "none";
}

// USER-DATA VALIDATION
const userData = JSON.parse(localStorage.getItem('loggedUser'));
if (!userData) {
    window.location.href = 'login.html';
}

function getPriorityClass(priority) {
    switch (priority) {
        case "DEFAULT": return "alert alert-primary";
        case "EXPIRED": return "alert alert-secondary alert-expired";
        case "HIGH": return "alert alert-danger";
        case "MEDIUM": return "alert alert-warning";
        case "LOW": return "alert alert-success";
        default: return "alert alert-secondary";
    }
}

// LOAD TASKS
async function loadTasks() {
    try {
        clearError();

        const res = await fetch(API_URL, {
            method: "GET",
            credentials: 'include'
        });

        if (!res.ok) {
            showError("ERR. during task loading.");
            return;
        }

        const tasks = await res.json();
        const tasksList = document.getElementById("tasksList");

        tasksList.innerHTML = "";

        if (!tasks || tasks.length === 0) {
            tasksList.innerHTML = `
                <div class="no-tasks-message">
                    <p class="text-center">No tasks for you yet. Create one →</p>
                </div>`;
            return;
        }

        tasks.forEach(task => {
            const card = document.createElement("div");

            const baseClass = task.completed
                ? "alert alert-secondary alert-completed"
                : getPriorityClass(task.priority);

            card.className = `mb-3 ${baseClass}`;

            card.innerHTML = `
                <h5 class="task-title"><b>${escapeHtml(task.title)}</b></h5>
                <p class="task-description">${escapeHtml(task.description || "")}</p>

                <p>
                    <small><b>Created:</b> ${task.creationDate || ""}</small><br/>
                    <small><b>Due:</b> ${task.dueDate || ""}</small>
                </p>

                <div style="font-weight: bold;">
                    ${task.priority}${task.completed ? " (COMPLETED)" : ""}
                </div>

                <div class="mt-3">
                    <button class="btn btn-sm btn-${task.completed ? "secondary" : "success"} me-2"
                        onclick="completeTask(${task.id})">
                        ${task.completed ? "Undo" : "Complete"}
                    </button>

                    <button class="btn btn-sm btn-warning me-2"
                        onclick="startEditTask(${task.id})">Edit</button>

                    <button class="btn btn-sm btn-danger"
                        onclick="deleteTask(${task.id})">Delete</button>
                </div>
            `;

            tasksList.appendChild(card);
        });

    } catch (error) {
        showError("NET. ERR.: " + error.message);
    }
}

// EDIT
async function startEditTask(id) {
    try {
        clearError();

        const res = await fetch(`${API_URL}/${id}`, {
            method: "GET",
            credentials: 'include'
        });

        if (!res.ok) {
            showError("ERR. fetching task.");
            return;
        }

        const task = await res.json();

        document.getElementById("formTitle").textContent = "Edit Task";
        document.getElementById("submitBtn").textContent = "Save Changes";
        document.getElementById("cancelEditBtn").classList.remove("d-none");

        document.getElementById("taskId").value = task.id || "";
        document.getElementById("title").value = task.title || "";
        document.getElementById("description").value = task.description || "";
        document.getElementById("dueDate").value = task.dueDate || "";
        document.getElementById("priority").value = task.priority || "LOW";

    } catch (error) {
        showError("NET. ERR.: " + error.message);
    }
}

// SUBMIT (CREATE / UPDATE)
document.getElementById("taskForm").addEventListener("submit", async e => {
    e.preventDefault();

    clearError();

    const taskId = document.getElementById("taskId").value;
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;

    if (!title || title.trim().length === 0) {
        showError("ERR. title is required.");
        return;
    }

    if (!isValidText(title)) {
        showError("ERR. invalid title.");
        return;
    }

    if (description && !isValidText(description)) {
        showError("ERR. invalid description.");
        return;
    }

    const payload = {
        title,
        description,
        dueDate: document.getElementById("dueDate").value,
        priority: document.getElementById("priority").value
    };

    try {
        const method = taskId ? "PUT" : "POST";
        const endpoint = taskId ? `${API_URL}/${taskId}` : API_URL;

        const res = await fetch(endpoint, {
            method,
            headers: { "Content-Type": "application/json" },
            credentials: 'include',
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            showError("ERR. saving task.");
            return;
        }

        clearForm();
        loadTasks();

    } catch (error) {
        showError("NET. ERR.: " + error.message);
    }
});

// DELETE
async function deleteTask(id) {
    try {
        clearError();

        const res = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            credentials: 'include'
        });

        if (!res.ok) {
            showError("ERR. deleting task.");
            return;
        }

        loadTasks();

    } catch (error) {
        showError("NET. ERR.: " + error.message);
    }
}

// COMPLETE
async function completeTask(id) {
    try {
        clearError();

        const res = await fetch(`${API_URL}/${id}/check`, {
            method: "PUT",
            credentials: 'include'
        });

        if (!res.ok) {
            showError("ERR. updating task state.");
            return;
        }

        loadTasks();

    } catch (error) {
        showError("NET. ERR.: " + error.message);
    }
}

// CLEAR FORM
function clearForm() {
    document.getElementById("formTitle").textContent = "Create New Task";
    document.getElementById("submitBtn").textContent = "Add Task";
    document.getElementById("cancelEditBtn").classList.add("d-none");

    ["taskId", "title", "description", "dueDate", "priority"]
        .forEach(id => document.getElementById(id).value = "");
}

// ESCAPE HTML
function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

loadTasks();