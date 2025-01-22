// Get DOM elements
const addTaskBtn = document.querySelector('.supertasks-add-button');
const addTaskModal = document.querySelector('.supertasks-add-input').parentElement.parentElement;
const editTaskModal = document.querySelectorAll('.opacity-0')[2];
const deleteTaskModal = document.querySelectorAll('.opacity-0')[1];
const taskInput = document.querySelector('.supertasks-add-input input');
const submitTaskBtn = document.querySelector('.supertasks-add-input button');
const closeButtons = document.querySelectorAll('[class*="text-eliminate"]');
const quadrants = ['Do first', 'Do later', 'Delegate', 'Eliminate'];

// State management
let tasks = {
    'Do first': [],
    'Do later': [],
    'Delegate': [],
    'Eliminate': []
};

let currentEditingTask = null;
let dontShowDeleteConfirm = false;

// Utility functions
function showModal(modal) {
    modal.classList.remove('opacity-0', 'pointer-events-none');
}

function hideModal(modal) {
    modal.classList.add('opacity-0', 'pointer-events-none');
}

function createTaskElement(taskText, id) {
    const taskDiv = document.createElement('div');
    taskDiv.className = 'bg-white dark:bg-dark p-3 rounded-md shadow-md mb-2 flex justify-between items-center';
    taskDiv.setAttribute('draggable', 'true');
    taskDiv.setAttribute('data-task-id', id);
    
    taskDiv.innerHTML = `
        <span class="font-poppins-regular">${taskText}</span>
        <div class="flex gap-2">
            <svg onclick="editTask('${id}')" class="w-4 h-4 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <svg onclick="deleteTask('${id}')" class="w-4 h-4 cursor-pointer text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        </div>
    `;

    setupDragAndDrop(taskDiv);
    return taskDiv;
}

function setupDragAndDrop(element) {
    element.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', e.target.getAttribute('data-task-id'));
        e.target.classList.add('opacity-50');
    });

    element.addEventListener('dragend', (e) => {
        e.target.classList.remove('opacity-50');
    });
}

// Task management functions
function addTask() {
    const taskText = taskInput.value.trim();
    if (!taskText) return;

    const taskId = Date.now().toString();
    const taskElement = createTaskElement(taskText, taskId);
    
    tasks['Do first'].push({ id: taskId, text: taskText });
    document.querySelector('[data-rbd-droppable-id="Do first"] > div').appendChild(taskElement);
    
    taskInput.value = '';
    hideModal(addTaskModal);
}

function editTask(taskId) {
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    const taskText = taskElement.querySelector('span').textContent;
    
    currentEditingTask = { id: taskId, element: taskElement };
    const editInput = editTaskModal.querySelector('input');
    editInput.value = taskText;
    
    showModal(editTaskModal);
}

function updateTask() {
    if (!currentEditingTask) return;
    
    const newText = editTaskModal.querySelector('input').value.trim();
    if (!newText) return;
    
    currentEditingTask.element.querySelector('span').textContent = newText;
    hideModal(editTaskModal);
    currentEditingTask = null;
}

function deleteTask(taskId) {
    if (!dontShowDeleteConfirm) {
        showModal(deleteTaskModal);
        deleteTaskModal.setAttribute('data-deleting-task', taskId);
    } else {
        confirmDeleteTask(taskId);
    }
}

function confirmDeleteTask(taskId) {
    const taskElement = document.querySelector(`[data-task-id="${taskId || deleteTaskModal.getAttribute('data-deleting-task')}"]`);
    if (taskElement) {
        taskElement.remove();
    }
    hideModal(deleteTaskModal);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Add task button
    addTaskBtn.addEventListener('click', () => showModal(addTaskModal));

    // Submit task button
    submitTaskBtn.addEventListener('click', addTask);

    // Close buttons
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            hideModal(button.closest('.opacity-0'));
        });
    });

    // Delete confirmation checkbox
    const dontShowAgainCheckbox = deleteTaskModal.querySelector('input[type="checkbox"]');
    dontShowAgainCheckbox.addEventListener('change', (e) => {
        dontShowDeleteConfirm = e.target.checked;
    });

    // Delete confirmation buttons
    const confirmDeleteBtn = deleteTaskModal.querySelector('.bg-red-600');
    const cancelDeleteBtn = deleteTaskModal.querySelector('.border-gray-500');
    
    confirmDeleteBtn.addEventListener('click', () => confirmDeleteTask());
    cancelDeleteBtn.addEventListener('click', () => hideModal(deleteTaskModal));

    // Setup dropzones
    quadrants.forEach(quadrant => {
        const dropzone = document.querySelector(`[data-rbd-droppable-id="${quadrant}"]`);
        
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            const taskId = e.dataTransfer.getData('text/plain');
            const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
            
            if (taskElement && dropzone.querySelector('div')) {
                dropzone.querySelector('div').appendChild(taskElement);
            }
        });
    });

    // Enter key in input fields
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    editTaskModal.querySelector('input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') updateTask();
    });
});