/**
 * HeatmapRenderer class for generating and rendering a 30-day heatmap
 * and calculating habit completion statistics and streaks.
 */
export class HeatmapRenderer {
  /**
   * Initializes the HeatmapRenderer with today's date.
   */
  constructor() {
    /**
     * @type {Date} The current date.
     */
    this.today = new Date();
  }

  /**
   * Generates an array of the last 30 days (including today).
   * Each element contains the ISO date string and Date object.
   * @returns {Array<{date: string, dateObj: Date}>} Array of day objects.
   */
  generateLast30Days() {
    const days = [];
    const currentDate = new Date(this.today);

    // Start from 29 days ago to include today (30 days total)
    for (let i = 29; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() - i);
      days.push({
        date: date.toISOString().split('T')[0],
        dateObj: new Date(date),
      });
    }

    return days;
  }

  /**
   * Renders the 30-day heatmap grid as HTML for a given habit.
   * @param {string} habitId - The ID of the habit.
   * @param {Object} logs - The logs object for the habit (date keys, boolean values).
   * @returns {string} HTML string for the heatmap grid.
   */
  renderHeatmap(habitId, logs) {
    const days = this.generateLast30Days();
    const todayString = this.today.toISOString().split('T')[0];

    // Build each day's heatmap cell
    const heatmapHTML = days
      .map((day) => {
        const isCompleted = logs[day.date] || false;
        const isToday = day.date === todayString;
        const isFuture = day.dateObj > this.today;

        let classes = ['heatmap-day'];
        if (isCompleted) classes.push('completed');
        if (isToday) classes.push('today');
        if (isFuture) classes.push('future');

        const dayOfMonth = day.dateObj.getDate();
        const monthNames = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ];
        const month = monthNames[day.dateObj.getMonth()];

        // Each cell has a tooltip with date and completion info
        return `
                <div class="${classes.join(' ')}" 
                     title="${month} ${dayOfMonth}${
          isCompleted ? ' - Completed' : ''
        }${isToday ? ' (Today)' : ''}"
                     data-date="${day.date}">
                </div>
            `;
      })
      .join('');

    return `<div class="heatmap-grid">${heatmapHTML}</div>`;
  }

  /**
   * Calculates completion statistics for a habit over the last 30 days.
   * @param {Object} logs - The logs object for a habit.
   * @returns {Object} Stats including total days, completed days, and percentage.
   */
  getCompletionStats(logs) {
    const days = this.generateLast30Days();
    // Count days marked as completed
    const completedDays = days.filter((day) => logs[day.date]).length;
    const totalDays = days.length;
    const percentage =
      totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

    return {
      completedDays,
      totalDays,
      percentage,
    };
  }

  /**
   * Calculates the current streak (consecutive completed days up to today).
   * @param {Object} logs - The logs object for a habit.
   * @returns {number} Current streak count.
   */
  getCurrentStreak(logs) {
    // Reverse so we start from today and go backwards
    const days = this.generateLast30Days().reverse();
    let streak = 0;

    for (const day of days) {
      if (logs[day.date]) {
        streak++;
      } else {
        break; // Streak ends at first missed day
      }
    }

    return streak;
  }

  /**
   * Calculates the longest streak of consecutive completed days in the last 30 days.
   * @param {Object} logs - The logs object for a habit.
   * @returns {number} Longest streak count.
   */
  getLongestStreak(logs) {
    const days = this.generateLast30Days();
    let currentStreak = 0;
    let longestStreak = 0;

    // Walk through all days, tracking streaks
    for (const day of days) {
      if (logs[day.date]) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    return longestStreak;
  }
}
