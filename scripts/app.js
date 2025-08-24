import { Storage } from './storage.js';
import { HeatmapRenderer } from './heatmap.js';

class HabitTracker {
  constructor() {
    this.storage = new Storage();
    this.heatmapRenderer = new HeatmapRenderer();
    this.habits = [];
    this.currentEditingHabit = null;
    this.habitToDelete = null;

    this.init();
  }

  init() {
    this.loadHabits();
    this.bindEvents();
    this.render();
  }

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

    // Keyboard events
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModals();
      }
    });
  }

  loadHabits() {
    this.habits = this.storage.getHabits();
  }

  generateId() {
    return (
      'habit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    );
  }

  openHabitModal(habit = null) {
    this.currentEditingHabit = habit;
    const modal = document.getElementById('habitModal');
    const form = document.getElementById('habitForm');
    const title = document.getElementById('modalTitle');
    const submitText = document.getElementById('submitText');

    // Reset form
    form.reset();
    this.clearErrors();
    this.selectIcon(document.querySelector('.icon-option[data-icon="📚"]'));

    if (habit) {
      // Edit mode
      title.textContent = 'Edit Habit';
      submitText.textContent = 'Update Habit';
      document.getElementById('habitTitle').value = habit.title;
      this.selectIcon(document.querySelector(`[data-icon="${habit.icon}"]`));
    } else {
      // Create mode
      title.textContent = 'Add New Habit';
      submitText.textContent = 'Create Habit';
    }

    modal.classList.add('visible');
    document.getElementById('habitTitle').focus();
    document.body.style.overflow = 'hidden';
  }

  closeHabitModal() {
    const modal = document.getElementById('habitModal');
    modal.classList.remove('visible');
    this.currentEditingHabit = null;
    document.body.style.overflow = '';
  }

  closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    modal.classList.remove('visible');
    this.habitToDelete = null;
    document.body.style.overflow = '';
  }

  closeModals() {
    this.closeHabitModal();
    this.closeConfirmModal();
  }

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

  handleFormSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('habitTitle').value.trim();
    const icon = document.getElementById('habitIcon').value;

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

  showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;

    const input = errorElement.previousElementSibling;
    if (input) {
      input.classList.add('error');
    }
  }

  clearErrors() {
    document.querySelectorAll('.form-error').forEach((el) => {
      el.textContent = '';
    });

    document.querySelectorAll('.form-input').forEach((el) => {
      el.classList.remove('error');
    });
  }

  editHabit(habitId) {
    const habit = this.habits.find((h) => h.id === habitId);
    if (habit) {
      this.openHabitModal(habit);
    }
  }

  deleteHabit(habitId) {
    this.habitToDelete = habitId;
    const modal = document.getElementById('confirmModal');
    modal.classList.add('visible');
    document.body.style.overflow = 'hidden';

    // Focus the confirm button
    setTimeout(() => {
      document.querySelector('.confirm-delete').focus();
    }, 100);
  }

  confirmDelete() {
    if (this.habitToDelete) {
      this.habits = this.habits.filter((h) => h.id !== this.habitToDelete);
      this.storage.deleteHabit(this.habitToDelete);
      this.storage.deleteLogs(this.habitToDelete);

      this.closeConfirmModal();
      this.render();
    }
  }

  toggleHabitToday(habitId) {
    const today = new Date().toISOString().split('T')[0];
    const logs = this.storage.getLogs(habitId);
    const isCompleted = logs[today] || false;

    logs[today] = !isCompleted;
    this.storage.saveLogs(habitId, logs);

    // Re-render just this habit card
    this.renderHabitCard(habitId);
  }

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

  bindHabitCardEvents(habitId) {
    const cardElement = document.querySelector(`[data-habit-id="${habitId}"]`);
    if (!cardElement) return;

    // Bind toggle event
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

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  render() {
    const habitsGrid = document.getElementById('habitsGrid');
    const emptyState = document.getElementById('emptyState');

    if (this.habits.length === 0) {
      habitsGrid.style.display = 'none';
      emptyState.classList.add('visible');
    } else {
      habitsGrid.style.display = 'grid';
      emptyState.classList.remove('visible');

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
