<div align="center">
  <img src="https://img.icons8.com/color/96/000000/study.png" alt="StudyFlow Logo" width="80" />
  <h1>StudyFlow — Smart Study Planner</h1>
  <p>A personalized, premium, and feature-rich academic dashboard built for students of all levels (Grade 5 to PhD).</p>
</div>

---

## 🌟 Overview

**StudyFlow** is an intelligent, single-page application (SPA) designed to supercharge your academic life. Whether you're a high school student tracking daily homework or a PhD candidate managing thesis research, StudyFlow adapts its interface to fit your exact educational needs. 

Built with a robust Flask backend and a modern vanilla JavaScript frontend, StudyFlow avoids heavy frameworks while delivering a stunning, responsive, and blazing-fast user experience.

---

## ✨ Key Features

- **🎓 Personalized Dynamic Subjects:** Upon registration, users select their education level (Grade 5 through PhD). The dashboard dynamically generates subjects, courses, and progress trackers tailored to that specific level.
- **🌓 Premium Theme Engine:** A gorgeous user interface featuring glassmorphism, animated particles, and a seamless toggle between a luxurious Dark Mode and a crisp Light Mode.
- **⏱️ Pomodoro Timer:** Built-in focus session tracker that syncs with your analytics to visualize how much time you spend studying.
- **✅ Advanced Task Planner:** Track tasks by priority (High, Med, Low), categorize them by dynamic subjects, and watch your daily progress bar fill up.
- **🎵 Realistic Ambient Mixer:** Built-in high-quality ambient audio generator (Rain, Waves, Fireplace, Forest, Café) with volume controls to help you find your perfect focus zone.
- **🃏 Flashcards & Notes:** An interactive 3D-flipping flashcard module for active recall, alongside a fast-capture Notes system.
- **🎯 Goals System:** Create custom goals and track them with beautiful animated SVG circular progress rings.
- **⌨️ Command Palette:** Press `Ctrl+K` to instantly search and navigate anywhere within the app, or trigger quick actions.
- **📤 Data Portability:** Securely export all your tasks, notes, goals, and flashcards into a local JSON backup with one click.

---

## 🛠️ Technology Stack

**Frontend:**
- **HTML5 & CSS3:** Semantic markup with deep use of CSS Variables (`:root`) for the dynamic theme engine.
- **Vanilla JavaScript (ES6+):** Complete SPA routing and state management without external dependencies like React or Vue.

**Backend:**
- **Python & Flask:** A lightweight RESTful API server handling authentication and data persistence.
- **SQLite3:** A zero-configuration SQL database storing user credentials, preferences, and session data.

---

## 🚀 Installation & Setup

1. **Prerequisites:**
   - Ensure you have **Python 3.8+** installed on your system.
   
2. **Clone the Repository:**
   ```bash
   git clone https://github.com/yourusername/studyflow.git
   cd studyflow
   ```

3. **Install Dependencies:**
   StudyFlow uses the lightweight Flask framework. Install it via pip:
   ```bash
   pip install flask flask-cors
   ```

4. **Initialize & Run the Server:**
   The database (`studyflow.db`) will automatically initialize itself upon first run.
   ```bash
   python server.py
   ```

5. **Access the App:**
   Open your browser and navigate to:
   ```text
   http://localhost:5000
   ```

---

## 📂 Project Structure

```text
📁 smart-study-planner/
│
├── server.py        # Flask Backend: Handles API endpoints, Auth, & SQLite
├── studyflow.db     # SQLite Database (Auto-generated)
├── index.html       # Main Frontend Application (SPA layout)
├── style.css        # Core styling, animations, and Light/Dark themes
├── features.js      # App Logic: Goals, Notes, Flashcards, Ambient Audio
├── auth.js          # Authentication, Education Level mapping & API calls
└── particles.js     # Canvas-based dynamic background animation
```

---

## 💡 Future Roadmap

- [ ] **Data Persistence via API:** Transition frontend `localStorage` (Tasks, Notes, Flashcards) fully to the SQLite backend for cross-device sync.
- [ ] **GPA / Academic Analytics:** Implement grading scales and performance graphs based on the user's selected education level.
- [ ] **Collaborative Study Rooms:** Real-time socket connections for studying alongside peers.

---

<div align="center">
  <i>"The secret of getting ahead is getting started." — Mark Twain</i>
</div>
