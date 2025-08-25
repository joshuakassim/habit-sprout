## 🌱 Habit‑Sprout

> **Grow your daily wins with a simple, offline, and visual habit tracker.**

---

### 📸 Demo & Screenshots
- **Live Demo:** *(link here — GitHub Pages, Netlify, etc.)*
- **3-Minute Video Walkthrough:** [YOUR_VIDEO_LINK_HERE]
- **Screenshots / GIFs:** Show the dashboard, “Add Habit” modal, and the heatmap in action.

---

### ✨ Features
- **Full Habit Management (CRUD):** Easily create, read, update, and delete habits. Each habit can be customized with a unique title and a selectable icon to make it your own.
- **Instant Daily Check-In:** A satisfying toggle switch allows you to mark today's progress for each habit with a single click.
- **Visual Progress Heatmap:** A beautiful 30-day calendar heatmap for each habit provides an at-a-glance overview of your consistency and commitment.
- **Insightful Statistics:** The app automatically calculates and displays key metrics to keep you motivated:
   - **Completion Percentage:** See your success rate over the last 30 days.
   - **Current Streak:** Watch your current chain of consecutive completions grow.
   - **Longest Streak:** A personal record of your best performance over the last 30 days.
- **Fully Offline & Private:** All data is stored securely in your browser's `localStorage`. The app works perfectly without an internet connection, and your data never leaves your device.
- **Responsive & Accessible:** A clean, mobile-first design ensures a seamless experience on any device. The interface is built with semantic HTML and is fully navigable via keyboard.

---

### 🛠 Tech Stack
- **HTML5:** Structured with semantic elements for clarity and accessibility.
- **CSS3:** Styled with modern CSS, including custom properties (variables) and a responsive, mobile-first grid layout.
- **JavaScript (ES Modules):** All application logic is handled with clean, modular vanilla JavaScript.
- **`localStorage` API:** Used for all client-side data persistence, enabling the offline-first experience.

---

### 🚀 Getting Started
1. **Clone the repository**  
   ```bash
   git clone https://github.com/joshuakassim/habit-sprout.git
   cd habit-sprout
   ```
2. **Open `index.html` in Visual Studio Code**
3. **Run using [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension**  

---

### 📖 Usage
- **Add a Habit:** Click the "+ Add Habit" button in the header.
- **Fill in the Details:** In the modal, provide a name for your habit (e.g., "Read for 30 minutes") and select an icon.
- **Track Your Progress:** Use the "Today" toggle on any habit card to mark it as complete for the current day.
- **View Your History:** The 30-day heatmap below each habit will automatically update to reflect your check-ins.
- **Edit or Delete:** Use the pencil (✏️) and trash (🗑️) icons on a habit card to modify or remove it.

---

### 📂 Project Structure
```
habit-sprout/
│
├── index.html       # main UI
├── styles.css       # responsive styling
└── scripts/
    ├── app.js       # main JS logic
    ├── storage.js   # localStorage helpers
    └── heatmap.js   # rendering the calendar
```

---

💾 Data Model
All application data is persisted in `localStorage` using two key structures:

- `habits`: A single JSON array that stores all habit objects.
   - Structure: `[{ id, title, icon, createdAt }]`
- `logs:{habitId}`: A separate key for each habit stores its completion history.
   - Structure: `{ "YYYY-MM-DD": true, "YYYY-MM-DD": false, ... }`
This separation ensures efficient reads/writes and keeps the data organized.

---

### 🏆 Hackathon Submission Checklist
- [ ] Live demo link in README  
- [ ] Public GitHub repository link  
- [ ] Screenshots / GIFs of key flows  
- [ ] 3‑minute demo video link  
- [ ] Clear setup & usage instructions  

---

### 📜 License
Specify your license here (e.g., MIT) so others know how they can use your code.

---
