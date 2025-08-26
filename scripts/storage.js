/**
 * Storage class for managing habits and logs using localStorage.
 * Provides CRUD operations for habits and their daily completion logs.
 */
export class Storage {
  /**
   * Initializes the Storage instance and checks for localStorage support.
   */
  constructor() {
    /**
     * @type {boolean} Indicates if localStorage is supported.
     */
    this.isSupported = this.checkLocalStorageSupport();
    if (!this.isSupported) {
      console.warn('localStorage is not supported. Data will not persist.');
    }
  }

  /**
   * Checks if localStorage is available and functional.
   * @returns {boolean} True if supported, false otherwise.
   */
  checkLocalStorageSupport() {
    try {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Retrieves all habits from localStorage.
   * @returns {Array<Object>} Array of habit objects.
   */
  getHabits() {
    if (!this.isSupported) return [];

    try {
      const habits = localStorage.getItem('habits');
      // Parse and return habits array, or empty array if not found
      return habits ? JSON.parse(habits) : [];
    } catch (e) {
      console.error('Error loading habits:', e);
      return [];
    }
  }

  /**
   * Saves or updates a habit in localStorage.
   * If the habit exists, it is updated; otherwise, it is added.
   * @param {Object} habit - The habit object to save.
   */
  saveHabit(habit) {
    if (!this.isSupported) return;

    try {
      const habits = this.getHabits();
      const existingIndex = habits.findIndex((h) => h.id === habit.id);

      if (existingIndex >= 0) {
        // Update existing habit
        habits[existingIndex] = habit;
      } else {
        // Add new habit
        habits.push(habit);
      }

      localStorage.setItem('habits', JSON.stringify(habits));
    } catch (e) {
      console.error('Error saving habit:', e);
    }
  }

  /**
   * Updates a habit in localStorage.
   * Alias for saveHabit for API clarity.
   * @param {Object} habit - The habit object to update.
   */
  updateHabit(habit) {
    this.saveHabit(habit);
  }

  /**
   * Deletes a habit from localStorage by its ID.
   * Also removes the habit from the habits array.
   * @param {string} habitId - The ID of the habit to delete.
   */
  deleteHabit(habitId) {
    if (!this.isSupported) return;

    try {
      const habits = this.getHabits();
      // Filter out the habit to be deleted
      const filteredHabits = habits.filter((h) => h.id !== habitId);
      localStorage.setItem('habits', JSON.stringify(filteredHabits));
    } catch (e) {
      console.error('Error deleting habit:', e);
    }
  }

  /**
   * Retrieves the daily completion logs for a habit.
   * @param {string} habitId - The ID of the habit.
   * @returns {Object} Logs object with date keys and boolean values.
   */
  getLogs(habitId) {
    if (!this.isSupported) return {};

    try {
      const logs = localStorage.getItem(`logs:${habitId}`);
      // Parse and return logs object, or empty object if not found
      return logs ? JSON.parse(logs) : {};
    } catch (e) {
      console.error('Error loading logs:', e);
      return {};
    }
  }

  /**
   * Saves the daily completion logs for a habit.
   * @param {string} habitId - The ID of the habit.
   * @param {Object} logs - Logs object with date keys and boolean values.
   */
  saveLogs(habitId, logs) {
    if (!this.isSupported) return;

    try {
      // Store logs as a JSON string under a unique key for the habit
      localStorage.setItem(`logs:${habitId}`, JSON.stringify(logs));
    } catch (e) {
      console.error('Error saving logs:', e);
    }
  }

  /**
   * Deletes all logs for a specific habit.
   * @param {string} habitId - The ID of the habit.
   */
  deleteLogs(habitId) {
    if (!this.isSupported) return;

    try {
      // Remove the logs entry for the given habit
      localStorage.removeItem(`logs:${habitId}`);
    } catch (e) {
      console.error('Error deleting logs:', e);
    }
  }
}
