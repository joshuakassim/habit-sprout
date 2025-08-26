import { Storage } from './storage.js';
import { HeatmapRenderer } from './heatmap.js';

/**
 * HabitTracker is the main controller for the Habit Sprout app.
 * Handles UI events, habit CRUD, modal management, and rendering.
 */
class HabitTracker {
  constructor() {
    /**
     * @type {Storage} Handles localStorage persistence.
     */
    this.storage = new Storage();

    /**
     * @type {HeatmapRenderer} Renders heatmaps and calculates streaks/stats.
     */
    this.heatmapRenderer = new HeatmapRenderer();

    /**
     * @type {Array<Object>} List of habit objects.
     */
    this.habits = [];

    /**
     * @type {Object|null} The habit currently being edited.
     */
    this.currentEditingHabit = null;

    /**
     * @type {string|null} The ID of the habit pending deletion.
     */
    this.habitToDelete = null;

    this.init();
  }

  /**
   * Initialize the app: load habits, bind UI events, and render.
   */
  init() {
    this.loadHabits();
    this.bindEvents();
    this.render();
  }

  /**
   * Bind all relevant DOM events for UI interaction.
   */
  bindEvents() {
    // Add habit buttons
    document.querySelector('.add-habit-btn').addEventListener('click', () => {
      this.openHabitModal();
    });

    document.querySelector('.add-habit-empty').addEventListener('click', () => {
      this.openHabitModal();
    });

    // Modal events
    document.querySelector('.modal-close').addEventListener('click', () => {
      this.closeHabitModal();
    });

    document.querySelector('.cancel-btn').addEventListener('click', () => {
      this.closeHabitModal();
    });

    // Form submission
    document.getElementById('habitForm').addEventListener('submit', (e) => {
      this.handleFormSubmit(e);
    });

    // Icon selection
    document.getElementById('iconGrid').addEventListener('click', (e) => {
      if (e.target.classList.contains('icon-option')) {
        this.selectIcon(e.target);
      }
    });

    // Modal overlay click to close
    document.getElementById('habitModal').addEventListener('click', (e) => {
      if (e.target === document.getElementById('habitModal')) {
        this.closeHabitModal();
      }
    });

    // Confirmation modal events
    document.querySelector('.cancel-confirm').addEventListener('click', () => {
      this.closeConfirmModal();
    });

    document.querySelector('.confirm-delete').addEventListener('click', () => {
      this.confirmDelete();
    });

    document.getElementById('confirmModal').addEventListener('click', (e) => {
      if (e.target === document.getElementById('confirmModal')) {
        this.closeConfirmModal();
      }
    });

    // Keyboard events for modal closing (Escape key)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModals();
      }
    });
  }

  /**
   * Load all habits from storage.
   */
  loadHabits() {
    this.habits = this.storage.getHabits();
  }

  /**
   * Generate a unique ID for a new habit.
   * @returns {string} Unique habit ID.
   */
  generateId() {
    return (
      'habit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    );
  }

  /**
   * Open the modal for creating or editing a habit.
   * @param {Object|null} habit - The habit to edit, or null to create new.
   */
  openHabitModal(habit = null) {
    this.currentEditingHabit = habit;
    const modal = document.getElementById('habitModal');
    const form = document.getElementById('habitForm');
    const title = document.getElementById('modalTitle');
    const submitText = document.getElementById('submitText');

    // Reset form and errors
    form.reset();
    this.clearErrors();
    // Select default icon
    this.selectIcon(document.querySelector('.icon-option[data-icon="📚"]'));

    if (habit) {
      // Edit mode: fill form with habit data
      title.textContent = 'Edit Habit';
      submitText.textContent = 'Update Habit';
      document.getElementById('habitTitle').value = habit.title;
      this.selectIcon(document.querySelector(`[data-icon="${habit.icon}"]`));
    } else {
      // Create mode: reset form
      title.textContent = 'Add New Habit';
      submitText.textContent = 'Create Habit';
    }

    modal.classList.add('visible');
    document.getElementById('habitTitle').focus();
    document.body.style.overflow = 'hidden';
  }

  /**
   * Close the habit modal and reset editing state.
   */
  closeHabitModal() {
    const modal = document.getElementById('habitModal');
    modal.classList.remove('visible');
    this.currentEditingHabit = null;
    document.body.style.overflow = '';
  }

  /**
   * Close the confirmation modal and reset deletion state.
   */
  closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    modal.classList.remove('visible');
    this.habitToDelete = null;
    document.body.style.overflow = '';
  }

  /**
   * Close all open modals.
   */
  closeModals() {
    this.closeHabitModal();
    this.closeConfirmModal();
  }

  /**
   * Select an icon in the icon grid.
   * @param {HTMLElement} iconElement - The icon element to select.
   */
  selectIcon(iconElement) {
    if (!iconElement) return;

    // Remove previous selection
    document.querySelectorAll('.icon-option').forEach((el) => {
      el.classList.remove('selected');
    });

    // Add selection to clicked icon
    iconElement.classList.add('selected');
    document.getElementById('habitIcon').value = iconElement.dataset.icon;
  }

  /**
   * Handle form submission for creating or editing a habit.
   * @param {Event} e - The form submit event.
   */
  handleFormSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('habitTitle').value.trim();
    const icon = document.getElementById('habitIcon').value;

    // Validate form input
    if (!this.validateForm(title)) {
      return;
    }

    if (this.currentEditingHabit) {
      // Update existing habit
      this.currentEditingHabit.title = title;
      this.currentEditingHabit.icon = icon;
      this.storage.updateHabit(this.currentEditingHabit);
    } else {
      // Create new habit
      const habit = {
        id: this.generateId(),
        title: title,
        icon: icon,
        createdAt: new Date().toISOString(),
      };

      this.habits.push(habit);
      this.storage.saveHabit(habit);
    }

    this.closeHabitModal();
    this.loadHabits();
    this.render();
  }

  /**
   * Validate the habit form.
   * @param {string} title - The habit title.
   * @returns {boolean} True if valid, false otherwise.
   */
  validateForm(title) {
    this.clearErrors();
    let isValid = true;

    if (!title) {
      this.showError('titleError', 'Habit name is required');
      isValid = false;
    } else if (title.length < 2) {
      this.showError('titleError', 'Habit name must be at least 2 characters');
      isValid = false;
    } else if (title.length > 50) {
      this.showError(
        'titleError',
        'Habit name must be less than 50 characters'
      );
      isValid = false;
    }

    return isValid;
  }

  /**
   * Show a form error message.
   * @param {string} elementId - The error element's ID.
   * @param {string} message - The error message.
   */
  showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;

    // Highlight the input field with error
    const input = errorElement.previousElementSibling;
    if (input) {
      input.classList.add('error');
    }
  }

  /**
   * Clear all form error messages and error styles.
   */
  clearErrors() {
    document.querySelectorAll('.form-error').forEach((el) => {
      el.textContent = '';
    });

    document.querySelectorAll('.form-input').forEach((el) => {
      el.classList.remove('error');
    });
  }

  /**
   * Open the edit modal for a specific habit.
   * @param {string} habitId - The ID of the habit to edit.
   */
  editHabit(habitId) {
    const habit = this.habits.find((h) => h.id === habitId);
    if (habit) {
      this.openHabitModal(habit);
    }
  }

  /**
   * Open the confirmation modal to delete a habit.
   * @param {string} habitId - The ID of the habit to delete.
   */
  deleteHabit(habitId) {
    this.habitToDelete = habitId;
    const modal = document.getElementById('confirmModal');
    modal.classList.add('visible');
    document.body.style.overflow = 'hidden';

    // Focus the confirm button for accessibility
    setTimeout(() => {
      document.querySelector('.confirm-delete').focus();
    }, 100);
  }

  /**
   * Confirm and perform deletion of a habit and its logs.
   */
  confirmDelete() {
    if (this.habitToDelete) {
      // Remove habit from local list and storage
      this.habits = this.habits.filter((h) => h.id !== this.habitToDelete);
      this.storage.deleteHabit(this.habitToDelete);
      this.storage.deleteLogs(this.habitToDelete);

      this.closeConfirmModal();
      this.render();
    }
  }

  /**
   * Toggle today's completion status for a habit.
   * @param {string} habitId - The ID of the habit.
   */
  toggleHabitToday(habitId) {
    const today = new Date().toISOString().split('T')[0];
    const logs = this.storage.getLogs(habitId);
    const isCompleted = logs[today] || false;

    // Toggle completion for today
    logs[today] = !isCompleted;
    this.storage.saveLogs(habitId, logs);

    // Re-render just this habit card
    this.renderHabitCard(habitId);
  }

  /**
   * Re-render a single habit card after update.
   * @param {string} habitId - The ID of the habit.
   */
  renderHabitCard(habitId) {
    const habit = this.habits.find((h) => h.id === habitId);
    if (!habit) return;

    const cardElement = document.querySelector(`[data-habit-id="${habitId}"]`);
    if (cardElement) {
      const newCardHTML = this.createHabitCardHTML(habit);
      cardElement.outerHTML = newCardHTML;

      // Re-bind events for the new card
      this.bindHabitCardEvents(habitId);
    }
  }

  /**
   * Bind events for a single habit card.
   * @param {string} habitId - The ID of the habit.
   */
  bindHabitCardEvents(habitId) {
    const cardElement = document.querySelector(`[data-habit-id="${habitId}"]`);
    if (!cardElement) return;

    // Bind toggle event for today's completion
    const toggleButton = cardElement.querySelector('.today-toggle');
    if (toggleButton) {
      toggleButton.addEventListener('click', () => {
        this.toggleHabitToday(habitId);
      });
    }

    // Bind edit button
    const editButton = cardElement.querySelector('.edit-habit');
    if (editButton) {
      editButton.addEventListener('click', () => {
        this.editHabit(habitId);
      });
    }

    // Bind delete button
    const deleteButton = cardElement.querySelector('.delete-habit');
    if (deleteButton) {
      deleteButton.addEventListener('click', () => {
        this.deleteHabit(habitId);
      });
    }
  }

  /**
   * Generate the HTML for a single habit card.
   * @param {Object} habit - The habit object.
   * @returns {string} HTML string for the habit card.
   */
  createHabitCardHTML(habit) {
    const today = new Date().toISOString().split('T')[0];
    const logs = this.storage.getLogs(habit.id);
    const isCompletedToday = logs[today] || false;
    const heatmapHTML = this.heatmapRenderer.renderHeatmap(habit.id, logs);
    const longestStreak = this.heatmapRenderer.getLongestStreak(logs);

    // Get completion stats
    const stats = this.heatmapRenderer.getCompletionStats(logs);
    const currentStreak = this.heatmapRenderer.getCurrentStreak(logs);

    return `
            <div class="habit-card" data-habit-id="${habit.id}">
                <div class="habit-header">
                    <div class="habit-info">
                        <div class="habit-icon">${habit.icon}</div>
                        <div class="habit-details">
                            <h3 class="habit-title">${this.escapeHtml(
                              habit.title
                            )}</h3>
                            <div class="habit-stats">
                                <span class="stat">${stats.completedDays}/${
      stats.totalDays
    } days</span>
                                <span class="stat">${stats.percentage}%</span>
                                <span class="stat">🏆 ${longestStreak} day best</span>
                                <span class="stat">${currentStreak} day streak</span>
                            </div>
                        </div>
                    </div>
                    <div class="habit-actions">
                        <button class="btn btn-secondary edit-habit" aria-label="Edit habit">
                            ✏️
                        </button>
                        <button class="btn btn-danger delete-habit" aria-label="Delete habit">
                            🗑️
                        </button>
                    </div>
                </div>
                
                <div class="habit-today">
                    <span class="today-label">Today</span>
                    <button class="today-toggle ${
                      isCompletedToday ? 'completed' : ''
                    }" 
                            aria-label="Toggle today's completion">
                        <div class="toggle-slider"></div>
                    </button>
                </div>
                
                <div class="habit-heatmap">
                    <div class="heatmap-header">
                        <h4 class="heatmap-title">Last 30 Days</h4>
                    </div>
                    ${heatmapHTML}
                </div>
            </div>
        `;
  }

  /**
   * Escape HTML to prevent XSS in habit titles.
   * @param {string} text - The text to escape.
   * @returns {string} Escaped HTML.
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Render all habits or show the empty state.
   */
  render() {
    const habitsGrid = document.getElementById('habitsGrid');
    const emptyState = document.getElementById('emptyState');

    if (this.habits.length === 0) {
      // Show empty state if no habits
      habitsGrid.style.display = 'none';
      emptyState.classList.add('visible');
    } else {
      habitsGrid.style.display = 'grid';
      emptyState.classList.remove('visible');

      // Render all habit cards
      habitsGrid.innerHTML = this.habits
        .map((habit) => this.createHabitCardHTML(habit))
        .join('');

      // Bind events for all habit cards
      this.habits.forEach((habit) => {
        this.bindHabitCardEvents(habit.id);
      });
    }
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.habitTracker = new HabitTracker();
});
