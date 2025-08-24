export class Storage {
  constructor() {
    this.isSupported = this.checkLocalStorageSupport();
    if (!this.isSupported) {
      console.warn('localStorage is not supported. Data will not persist.');
    }
  }

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

  getHabits() {
    if (!this.isSupported) return [];

    try {
      const habits = localStorage.getItem('habits');
      return habits ? JSON.parse(habits) : [];
    } catch (e) {
      console.error('Error loading habits:', e);
      return [];
    }
  }

  saveHabit(habit) {
    if (!this.isSupported) return;

    try {
      const habits = this.getHabits();
      const existingIndex = habits.findIndex((h) => h.id === habit.id);

      if (existingIndex >= 0) {
        habits[existingIndex] = habit;
      } else {
        habits.push(habit);
      }

      localStorage.setItem('habits', JSON.stringify(habits));
    } catch (e) {
      console.error('Error saving habit:', e);
    }
  }

  updateHabit(habit) {
    this.saveHabit(habit);
  }

  deleteHabit(habitId) {
    if (!this.isSupported) return;

    try {
      const habits = this.getHabits();
      const filteredHabits = habits.filter((h) => h.id !== habitId);
      localStorage.setItem('habits', JSON.stringify(filteredHabits));
    } catch (e) {
      console.error('Error deleting habit:', e);
    }
  }

  getLogs(habitId) {
    if (!this.isSupported) return {};

    try {
      const logs = localStorage.getItem(`logs:${habitId}`);
      return logs ? JSON.parse(logs) : {};
    } catch (e) {
      console.error('Error loading logs:', e);
      return {};
    }
  }

  saveLogs(habitId, logs) {
    if (!this.isSupported) return;

    try {
      localStorage.setItem(`logs:${habitId}`, JSON.stringify(logs));
    } catch (e) {
      console.error('Error saving logs:', e);
    }
  }

  deleteLogs(habitId) {
    if (!this.isSupported) return;

    try {
      localStorage.removeItem(`logs:${habitId}`);
    } catch (e) {
      console.error('Error deleting logs:', e);
    }
  }
}
