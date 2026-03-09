/**
 * TaskMaster - To-Do List
 * Learning DOM Manipulation with enhanced features
 */

(function() {
    // ============================================
    // DOM ELEMENTS - Select all elements we'll use
    // ============================================
    const taskInput = document.getElementById('taskInput');
    const addBtn = document.getElementById('addBtn');
    const taskList = document.getElementById('taskList');
    const emptyState = document.getElementById('emptyState');
    const totalCount = document.getElementById('totalCount');
    const doneCount = document.getElementById('doneCount');
    const pendingCount = document.getElementById('pendingCount');
    const filterTabs = document.querySelectorAll('.tab');
    const quickPriorityBtns = document.querySelectorAll('.quick-btn');
    const clearCompletedBtn = document.getElementById('clearCompleted');
    const motivationalText = document.getElementById('motivationalText');
    const currentDateEl = document.getElementById('currentDate');

    // ============================================
    // STATE MANAGEMENT
    // ============================================
    let tasks = [];
    let currentFilter = 'all';
    let selectedPriority = 'medium';

    const motivationalMessages = [
        "Let's crush it today! 💪",
        "You're doing great! 🌟",
        "One step at a time! 🚀",
        "Keep the momentum going! ⚡",
        "You've got this! 🎯",
        "Productivity is key! 🔑",
        "Make today count! ⭐",
        "Every task counts! 📝"
    ];

    // ============================================
    // INITIALIZATION
    // ============================================
    function init() {
        // Set current date
        setCurrentDate();
        
        // Load tasks from localStorage
        loadTasks();
        
        // Set default priority button as active
        setPriority('medium');
        
        // Update UI
        updateStats();
        renderTasks();
        setRandomMotivation();
        
        // Focus input
        taskInput.focus();
    }

    // ============================================
    // DATE & TIME
    // ============================================
    function setCurrentDate() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDateEl.textContent = now.toLocaleDateString('en-US', options);
    }

    function setRandomMotivation() {
        const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
        motivationalText.textContent = motivationalMessages[randomIndex];
    }

    // ============================================
    // LOCAL STORAGE
    // ============================================
    function saveTasks() {
        localStorage.setItem('myTasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const saved = localStorage.getItem('myTasks');
        if (saved) {
            tasks = JSON.parse(saved);
        }
    }

    // ============================================
    // STATISTICS
    // ============================================
    function updateStats() {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;

        // Animate numbers
        animateNumber(totalCount, total);
        animateNumber(doneCount, completed);
        animateNumber(pendingCount, pending);
    }

    function animateNumber(element, target) {
        const current = parseInt(element.textContent);
        const increment = (target - current) / 10;
        
        if (Math.abs(increment) < 1) {
            element.textContent = target;
            return;
        }
        
        element.textContent = Math.round(current + increment);
        setTimeout(() => animateNumber(element, target), 30);
    }

    // ============================================
    // RENDER TASKS - DOM Manipulation Core
    // ============================================
    function renderTasks() {
        // Clear current list
        taskList.innerHTML = '';

        // Filter tasks
        let filteredTasks = tasks;
        if (currentFilter === 'pending') {
            filteredTasks = tasks.filter(t => !t.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(t => t.completed);
        }

        // Show/hide empty state
        if (filteredTasks.length === 0) {
            emptyState.classList.add('show');
            taskList.style.display = 'none';
        } else {
            emptyState.classList.remove('show');
            taskList.style.display = 'block';
        }

        // Create and append each task
        filteredTasks.forEach(task => {
            const li = createTaskElement(task);
            taskList.appendChild(li);
        });

        updateStats();
    }

    // ============================================
    // CREATE TASK ELEMENT - DOM Creation
    // ============================================
    function createTaskElement(task) {
        // Create <li> element using document.createElement
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.dataset.id = task.id;

        // Priority indicator
        const priorityDot = document.createElement('div');
        priorityDot.className = `priority-indicator ${task.priority}`;
        
        // Checkbox
        const checkbox = document.createElement('div');
        checkbox.className = 'task-checkbox';
        checkbox.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleTask(task.id);
        });

        // Task text
        const textSpan = document.createElement('span');
        textSpan.className = 'task-text';
        textSpan.textContent = task.text;

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteTask(task.id);
        });

        // Click on whole item to toggle
        li.addEventListener('click', () => toggleTask(task.id));

        // Append all elements to <li> using appendChild
        li.appendChild(priorityDot);
        li.appendChild(checkbox);
        li.appendChild(textSpan);
        li.appendChild(deleteBtn);

        return li;
    }

    // ============================================
    // ADD TASK - Core DOM Manipulation
    // ============================================
    function addTask() {
        // Get input value
        const text = taskInput.value.trim();
        
        if (text === '') {
            shakeInput();
            return;
        }

        // Create task object
        const task = {
            id: Date.now(),
            text: text,
            completed: false,
            priority: selectedPriority,
            createdAt: new Date().toISOString()
        };

        // Add to beginning of array
        tasks.unshift(task);
        
        // Save and render
        saveTasks();
        renderTasks();
        
        // Clear input
        taskInput.value = '';
        
        // Show feedback
        showToast('Task added successfully! 🎉');
        
        // Update motivation
        setRandomMotivation();
        
        // Focus input
        taskInput.focus();
    }

    // ============================================
    // TOGGLE TASK COMPLETE
    // ============================================
    function toggleTask(id) {
        // Find task in array
        const task = tasks.find(t => t.id === id);
        
        if (task) {
            // Toggle completed status
            task.completed = !task.completed;
            
            // Save and render
            saveTasks();
            renderTasks();
            
            // Feedback
            if (task.completed) {
                showToast('Task completed! ✅');
            }
        }
    }

    // ============================================
    // DELETE TASK - DOM Removal
    // ============================================
    function deleteTask(id) {
        // Filter out the task with given id
        tasks = tasks.filter(t => t.id !== id);
        
        // Save and render
        saveTasks();
        renderTasks();
        
        // Feedback
        showToast('Task deleted');
    }

    // ============================================
    // CLEAR COMPLETED
    // ============================================
    function clearCompleted() {
        const completedCount = tasks.filter(t => t.completed).length;
        
        if (completedCount === 0) {
            showToast('No completed tasks to clear');
            return;
        }

        if (confirm(`Delete ${completedCount} completed task(s)?`)) {
            tasks = tasks.filter(t => !t.completed);
            saveTasks();
            renderTasks();
            showToast('Completed tasks cleared! 🧹');
        }
    }

    // ============================================
    // FILTER TASKS
    // ============================================
    function setFilter(filter) {
        currentFilter = filter;
        
        // Update active tab
        filterTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.filter === filter);
        });
        
        renderTasks();
    }

    // ============================================
    // QUICK PRIORITY
    // ============================================
    function setPriority(priority) {
        selectedPriority = priority;
        
        // Update button states
        quickPriorityBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.priority === priority);
        });
    }

    // ============================================
    // UI EFFECTS
    // ============================================
    function shakeInput() {
        taskInput.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            taskInput.style.animation = '';
            taskInput.focus();
        }, 500);
    }

    // Add shake animation via JavaScript
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-10px); }
            40%, 80% { transform: translateX(10px); }
        }
    `;
    document.head.appendChild(style);

    function showToast(message) {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        // Style it
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%) translateY(100px)',
            background: '#1e293b',
            color: 'white',
            padding: '14px 28px',
            borderRadius: '12px',
            fontSize: '0.95rem',
            fontWeight: '600',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            zIndex: '1000',
            transition: 'transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            opacity: '0'
        });
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(0)';
            toast.style.opacity = '1';
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(100px)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 400);
        }, 2500);
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================
    
    // Add button click
    addBtn.addEventListener('click', addTask);

    // Enter key to add task
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Filter tabs
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => setFilter(tab.dataset.filter));
    });

    // Quick priority buttons
    quickPriorityBtns.forEach(btn => {
        btn.addEventListener('click', () => setPriority(btn.dataset.priority));
    });

    // Clear completed
    clearCompletedBtn.addEventListener('click', clearCompleted);

    // ============================================
    // START THE APP
    // ============================================
    init();

})();
