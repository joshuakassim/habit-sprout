export class HeatmapRenderer {
  constructor() {
    this.today = new Date();
  }

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

  renderHeatmap(habitId, logs) {
    const days = this.generateLast30Days();
    const todayString = this.today.toISOString().split('T')[0];

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
   * Get completion statistics for a habit
   * @param {Object} logs - The logs object for a habit
   * @returns {Object} Stats including total days, completed days, and percentage
   */
  getCompletionStats(logs) {
    const days = this.generateLast30Days();
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
   * Get the current streak for a habit (consecutive days from today backwards)
   * @param {Object} logs - The logs object for a habit
   * @returns {number} Current streak count
   */
  getCurrentStreak(logs) {
    const days = this.generateLast30Days().reverse(); // Start from today
    let streak = 0;

    for (const day of days) {
      if (logs[day.date]) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Get the longest streak for a habit within the 30-day period
   * @param {Object} logs - The logs object for a habit
   * @returns {number} Longest streak count
   */
  getLongestStreak(logs) {
    const days = this.generateLast30Days();
    let currentStreak = 0;
    let longestStreak = 0;

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
