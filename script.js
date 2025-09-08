/* 
   We store references to DOM elements in variables for better performance.
   This way we don't have to search for them every time we need them.
*/
const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const clearCompleted = document.getElementById("clearCompleted");

// Statistics display elements
const totalTasksSpan = document.getElementById("totalTasks");
const completedTasksSpan = document.getElementById("completedTasks");
const pendingTasksSpan = document.getElementById("pendingTasks");

// Filter buttons
const filterButtons = document.querySelectorAll(".filter-btn");
let tasks = [];
let currentFilter = "all";

(function initializeApp() {
  console.log("🌸To-Do App Initialising...");

  // Load any previously saved tasks from browser storage
  loadTasksFromStorage();

  // Set up all event listeners
  setupEventListeners();

  // Display the current tasks
  renderTasks();

  // Update statistics display
  updateStatistics();

  console.log("✨ App initialised successfully!");
})();

function setupEventListeners() {
  /* 
       Add Task Button Click
       When user clicks the add button, create a new task
    */
  addBtn.addEventListener("click", handleAddTask);

  /* 
       Enter Key Press in Input Field
       Allow users to add tasks by pressing Enter (common UX pattern)
    */
  taskInput.addEventListener("keypress", function (event) {
    // Check if the pressed key is Enter (keyCode 13 or key 'Enter')
    if (event.key === "Enter") {
      handleAddTask();
    }
  });

  /* 
       Input Field Changes
       We'll add some visual feedback when user is typing
    */
  taskInput.addEventListener("input", function () {
    const inputContainer = this.closest(".input-container");

    // Add visual feedback when there's text in the input
    if (this.value.trim().length > 0) {
      inputContainer.style.borderColor = "var(--primary-pink)";
    } else {
      inputContainer.style.borderColor = "transparent";
    }
  });

  /* 
       Filter Button Clicks
       Set up event listeners for all filter buttons using event delegation
    */
  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Remove active class from all buttons
      filterButtons.forEach((btn) => btn.classList.remove("active"));

      // Add active class to clicked button
      this.classList.add("active");

      // Update current filter and re-render tasks
      currentFilter = this.dataset.filter;
      renderTasks();

      console.log(`Filter changed to: ${currentFilter}`);
    });
  });
  /* 
       Clear Completed Tasks Button
       Remove all completed tasks from the list
    */
  clearCompleted.addEventListener("click", handleClearCompleted);

  /* 
       Task List Event Delegation
       Instead of adding event listeners to each task, we use event delegation.
       This is more efficient and works for dynamically added tasks.
    */
  taskList.addEventListener("click", function (event) {
    const taskItem = event.target.closest(".task-item");
    if (!taskItem) return; // Exit if click wasn't on a task

    const taskId = parseInt(taskItem.dataset.taskId);

    // Handle checkbox clicks (toggle completion)
    if (
      event.target.classList.contains("task-checkbox") ||
      event.target.closest(".task-checkbox")
    ) {
      toggleTaskCompletion(taskId);
    }
    // Handle delete button clicks
    if (
      event.target.classList.contains("delete-btn") ||
      event.target.closest(".delete-btn")
    ) {
      deleteTask(taskId);
    }
  });
}

/* 
   Add New Task Function
   This is called when user wants to add a new task
*/
function handleAddTask() {
  // Get the text from input and remove extra whitespace
  const taskText = taskInput.value.trim();

  // Validation: Don't add empty tasks
  if (taskText === "") {
    // Provide visual feedback for empty input
    taskInput.focus();
    taskInput.style.borderColor = "#ff6b6b";
    setTimeout(() => {
      taskInput.style.borderColor = "";
    }, 2000);
    return;
  }

  // Check for duplicate tasks (optional feature for better UX)
  const isDuplicate = tasks.some(
    (task) => task.text.toLowerCase() === taskText.toLowerCase()
  );

  if (isDuplicate) {
    alert("This task already exists!");
    return;
  }

  // Create new task object
  const newTask = {
    id: Date.now(), // Using timestamp as unique ID
    text: taskText,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  // Add to tasks array
  tasks.push(newTask);

  // Clear the input field
  taskInput.value = "";
  taskInput.style.borderColor = "";

  // Save to browser storage
  saveTasksToStorage();

  // Update the display
  renderTasks();
  updateStatistics();

  // Log for debugging
  console.log("✅ Task added:", newTask);

  // Optional: Focus back on input for better UX
  taskInput.focus();
}

/* 
   Toggle Task Completion
   Mark a task as completed or uncompleted
*/
function toggleTaskCompletion(taskId) {
  // Find the task in our array
  const task = tasks.find((task) => task.id === taskId);

  if (task) {
    // Toggle the completed status
    task.completed = !task.completed;

    // Save changes
    saveTasksToStorage();

    // Update display
    renderTasks();
    updateStatistics();

    console.log(
      `📝 Task ${taskId} ${task.completed ? "completed" : "uncompleted"}`
    );
  }
}

/* 
   Delete Task Function
   Remove a task from the list with animation
*/
function deleteTask(taskId) {
  // Find the task element for animation
  const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);

  if (taskElement) {
    // Add removing animation class
    taskElement.classList.add("removing");

    // Wait for animation to complete before removing from DOM
    setTimeout(() => {
      // Remove from tasks array
      tasks = tasks.filter((task) => task.id !== taskId);

      // Save changes
      saveTasksToStorage();

      // Update display
      renderTasks();
      updateStatistics();

      console.log(`🗑️ Task ${taskId} deleted`);
    }, 300); // Match CSS animation duration
  }
}

/* 
   Clear All Completed Tasks
   Remove all tasks that are marked as completed
*/
function handleClearCompleted() {
  // Count completed tasks for user feedback
  const completedCount = tasks.filter((task) => task.completed).length;

  if (completedCount === 0) {
    alert("No completed tasks to clear!");
    return;
  }

  // Confirm with user (good UX practice for destructive actions)
  const confirmed = confirm(
    `Are you sure you want to delete ${completedCount} completed task(s)?`
  );

  if (confirmed) {
    // Remove completed tasks from array
    tasks = tasks.filter((task) => !task.completed);

    // Save changes
    saveTasksToStorage();

    // Update display
    renderTasks();
    updateStatistics();

    console.log(`🧹 Cleared ${completedCount} completed tasks`);
  }
}

/* 
   Main Render Function
   This function updates the task list display based on current filter
*/
function renderTasks() {
  // Clear the current task list
  taskList.innerHTML = "";

  // Filter tasks based on current filter setting
  let filteredTasks = tasks;

  switch (currentFilter) {
    case "completed":
      filteredTasks = tasks.filter((task) => task.completed);
      break;
    case "pending":
      filteredTasks = tasks.filter((task) => !task.completed);
      break;
    default:
      filteredTasks = tasks; // 'all' or default case
  }

  // Show/hide empty state based on filtered results
  if (filteredTasks.length === 0) {
    emptyState.style.display = "block";
    updateEmptyStateMessage();
  } else {
    emptyState.style.display = "none";
  }

  // Create DOM elements for each filtered task
  filteredTasks.forEach((task, index) => {
    const taskElement = createTaskElement(task);
    taskList.appendChild(taskElement);

    // Add staggered animation delay for smooth entrance
    setTimeout(() => {
      taskElement.classList.add("adding");
    }, index * 50);
  });

  // Update clear completed button visibility
  updateClearButtonVisibility();

  console.log(
    `📋 Rendered ${filteredTasks.length} tasks (filter: ${currentFilter})`
  );
}

/* 
   Create Task Element Function
   Generates the HTML structure for a single task
*/
function createTaskElement(task) {
  // Create the main list item
  const li = document.createElement("li");
  li.className = `task-item ${task.completed ? "completed" : ""}`;
  li.dataset.taskId = task.id; // Store task ID for event handling

  /* 
       Using template literals for cleaner HTML string creation
       This approach is more readable than createElement for complex structures
    */
  li.innerHTML = `
        <div class="task-checkbox ${task.completed ? "checked" : ""}" 
             role="button" 
             aria-label="Toggle task completion"
             tabindex="0">
        </div>
        <span class="task-text">${escapeHtml(task.text)}</span>
        <button class="delete-btn" 
                aria-label="Delete task"
                title="Delete this task">
            <i class="fas fa-trash"></i>
        </button>
    `;

  return li;
}

/* 
   Update Empty State Message
   Changes the message based on current filter
*/
function updateEmptyStateMessage() {
  const emptyStateTitle = emptyState.querySelector("h3");
  const emptyStateText = emptyState.querySelector("p");

  switch (currentFilter) {
    case "completed":
      emptyStateTitle.textContent = "No completed tasks!";
      emptyStateText.textContent = "Complete some tasks to see them here";
      break;
    case "pending":
      emptyStateTitle.textContent = "No pending tasks!";
      emptyStateText.textContent = "Great job! All tasks are completed";
      break;
    default:
      emptyStateTitle.textContent = "No tasks yet!";
      emptyStateText.textContent = "Add your first task above to get started";
  }
}

/* 
   Update Statistics Display
   Calculate and show current task counts
*/
function updateStatistics() {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const pending = total - completed;

  // Update the display with smooth number animation
  animateNumber(totalTasksSpan, total);
  animateNumber(completedTask, completed);
  animateNumber(pendingTasksSpan, pending);

  console.log(
    `📊 Stats updated - Total: ${total}, Completed: ${completed}, Pending: ${pending}`
  );
}

/* 
   Animate Number Changes
   Creates a smooth counting animation when numbers change
*/
function animateNumber(element, targetNumber) {
  const currentNumber = parseInt(element.textContent) || 0;
  const increment = targetNumber > currentNumber ? 1 : -1;
  const duration = 300; // milliseconds
  const steps = Math.abs(targetNumber - currentNumber);
  const stepDuration = steps > 0 ? duration / steps : 0;

  if (steps === 0) return; // No change needed

  let current = currentNumber;
  const timer = setInterval(() => {
    current += increment;
    element.textContent = current;

    if (current === targetNumber) {
      clearInterval(timer);
    }
  }, stepDuration);
}

/* 
   Update Clear Button Visibility
   Show/hide the clear completed tasks button based on completed task count
*/
function updateClearButtonVisibility() {
  const hasCompletedTasks = tasks.some((task) => task.completed);
  clearCompleted.style.display = hasCompletedTasks ? "block" : "none";
}

/* 
   Save Tasks to Browser Storage
   Persists task data so it survives page refreshes
   
   Local Storage stores data as strings, so we use JSON.stringify
   to convert our array of objects to a string format
*/
function saveTasksToStorage() {
  try {
    const tasksJson = JSON.stringify(tasks);
    localStorage.setItem("pinkTodoTasks", tasksJson);
    console.log("💾 Tasks saved to storage");
  } catch (error) {
    console.error("❌ Error saving tasks to storage:", error);
    // In a production app, you might show a user-friendly error message
  }
}

/* 
   Load Tasks from Browser Storage
   Retrieves saved task data when the app starts
   
   We use JSON.parse to convert the string back to JavaScript objects
*/
function loadTasksFromStorage() {
  try {
    const tasksJson = localStorage.getItem("pinkTodoTasks");

    if (tasksJson) {
      tasks = JSON.parse(tasksJson);
      console.log(`📥 Loaded ${tasks.length} tasks from storage`);
    } else {
      console.log("📭 No saved tasks found");
    }
  } catch (error) {
    console.error("❌ Error loading tasks from storage:", error);
    // If there's an error, start with empty tasks array
    tasks = [];
  }
}

/* 
   Clear All Storage Data (utility function)
   This function can be called from browser console for testing/debugging
*/
function clearAllData() {
  const confirmed = confirm(
    "⚠️ This will delete ALL your tasks permanently. Are you sure?"
  );

  if (confirmed) {
    localStorage.removeItem("pinkTodoTasks");
    tasks = [];
    renderTasks();
    updateStatistics();
    console.log("🗑️ All data cleared");
  }
}

/* 
   Escape HTML Function
   Prevents XSS attacks by escaping HTML characters in user input
   
   This is a security best practice - never trust user input!
   We convert characters like <, >, & to their HTML entity equivalents
*/
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/* 
   Get Task by ID Utility
   Helper function to find a task by its ID
*/
function getTaskById(id) {
  return tasks.find((task) => task.id === id);
}

/* 
   Export Tasks as JSON
   Allows users to download their tasks as a backup file
   This is an advanced feature that shows professional development practices
*/
function exportTasks() {
  const dataStr = JSON.stringify(tasks, null, 2); // Pretty formatted JSON
  const dataBlob = new Blob([dataStr], { type: "application/json" });

  // Create download link
  const link = document.createElement("a");
  link.href = URL.createObjectURL(dataBlob);
  link.download = `pink-todo-backup-${
    new Date().toISOString().split("T")[0]
  }.json`;

  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  console.log("📤 Tasks exported successfully");
}

/* 
   Import Tasks from JSON File
   Allows users to restore tasks from a backup file
   This would typically be connected to a file input in the HTML
*/
function importTasks(file) {
  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const importedTasks = JSON.parse(e.target.result);

      // Validate imported data structure
      if (Array.isArray(importedTasks)) {
        const confirmed = confirm(
          `Import ${importedTasks.length} tasks? This will replace your current tasks.`
        );

        if (confirmed) {
          tasks = importedTasks;
          saveTasksToStorage();
          renderTasks();
          updateStatistics();
          console.log(`📥 Successfully imported ${tasks.length} tasks`);
        }
      } else {
        throw new Error("Invalid file format");
      }
    } catch (error) {
      alert("Error importing tasks. Please check the file format.");
      console.error("❌ Import error:", error);
    }
  };

  reader.readAsText(file);
}

/* 
   Enhanced Keyboard Navigation
   Makes the app fully accessible via keyboard
   
   This is important for accessibility and professional web development
*/
document.addEventListener("keydown", function (event) {
  // Escape key clears current input
  if (event.key === "Escape" && document.activeElement === taskInput) {
    taskInput.value = "";
    taskInput.blur();
  }

  // Ctrl/Cmd + Enter adds task from anywhere
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    if (taskInput.value.trim()) {
      handleAddTask();
    } else {
      taskInput.focus();
    }
  }

  // Handle checkbox activation with Space or Enter
  if (
    (event.key === " " || event.key === "Enter") &&
    event.target.classList.contains("task-checkbox")
  ) {
    event.preventDefault();
    event.target.click();
  }
});
