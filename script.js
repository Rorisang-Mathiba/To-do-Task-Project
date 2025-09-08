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
