// USER-DATA VALIDATION
const userData = JSON.parse(localStorage.getItem('loggedUser'));
if (!userData) {
    window.location.href = 'login.html';
}

const API_URL = "/api/v1/task";

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

// LOAD-TASK
async function loadTasks() {
    try {
        const res = await fetch(API_URL, {
            method: "GET",
            credentials: 'include'
        });

        if (!res.ok) throw new Error("ERR. during task loading.");

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
        alert(error.message);
    }
}

// EDIT
async function startEditTask(id) {
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: "GET",
            credentials: 'include'
        });

        if (!res.ok) throw new Error("ERR. fetching task.");

        const task = await res.json();

        document.getElementById("formTitle").textContent = "Edit Task";
        document.getElementById("submitBtn").textContent = "Save Changes";
        document.getElementById("cancelEditBtn").classList.remove("d-none");

        document.getElementById("taskId").value = task.id || "";
        document.getElementById("title").value = task.title || "";
        document.getElementById("description").value = task.description || "";
        document.getElementById("creationDate").value = task.creationDate || "";
        document.getElementById("dueDate").value = task.dueDate || "";
        document.getElementById("priority").value = task.priority || "LOW";

    } catch (error) {
        alert(error.message);
    }
}

document.getElementById("taskForm").addEventListener("submit", async e => {
    e.preventDefault();

    const taskId = document.getElementById("taskId").value;

    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;

    if (!title || title.trim().length === 0) {
        alert("Title is required.");
        return;
    }

    if (!isValidText(title)) {
        alert("Invalid title.");
        return;
    }

    if (description && !isValidText(description)) {
        alert("Invalid description.");
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

        if (!res.ok) throw new Error("ERR. saving task.");

        clearForm();
        loadTasks();

    } catch (error) {
        alert(error.message);
    }
});

// DELETE
async function deleteTask(id) {
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            credentials: 'include'
        });

        if (!res.ok) throw new Error("ERR. deleting task.");

        loadTasks();

    } catch (error) {
        alert(error.message);
    }
}

// COMPLETE
async function completeTask(id) {
    try {
        const res = await fetch(`${API_URL}/${id}/check`, {
            method: "PUT",
            credentials: 'include'
        });

        if (!res.ok) throw new Error("ERR. updating task state.");

        loadTasks();

    } catch (error) {
        alert(error.message);
    }
}

function clearForm() {
    document.getElementById("formTitle").textContent = "Create New Task";
    document.getElementById("submitBtn").textContent = "Add Task";
    document.getElementById("cancelEditBtn").classList.add("d-none");

    ["taskId", "title", "description", "creationDate", "dueDate", "priority"]
        .forEach(id => document.getElementById(id).value = "");
}

function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

loadTasks();