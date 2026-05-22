# PolicyConnect - Python + SQLite Setup Instructions

Follow these steps to run this project on your Windows machine:

## 1. Prerequisites
- Download and install **Python** from https://www.python.org/ (Download the latest version for Windows).
- **IMPORTANT**: During installation, make sure to check the box: **"Add Python to PATH"**.

## 2. Get the Code
- Click on the **Settings** (Gear icon) in AI Studio.
- Select **Export as ZIP**.
- Extract the ZIP file to a folder (e.g., C:\PolicyConnect_Python).

## 3. Installation
- Open the folder where you extracted the code.
- Click the address bar, type `cmd` and press Enter.
- Install the required Python libraries by typing:
  ```
  pip install -r requirements.txt
  ```

## 4. Run the Project
- In the same Command Prompt window, type:
  ```
  python app.py
  ```
- You should see: `Running on http://0.0.0.0:3000` (or similar).

## 5. View the App
- Open your browser and go to:
  ```
  http://localhost:3000
  ```

## 6. Project Details
- **Frontend**: HTML5, CSS3, JavaScript (located in `public/` folder).
- **Backend**: Python (Flask) in `app.py`.
- **Database**: SQLite (created automatically as `database.db`).
- **Admin**: user: `admin` | pass: `admin123`

---
**Why use SQLite?**
SQLite is a professional database that stores data in a single file (`database.db`). Unlike JSON, it uses real SQL queries (`INSERT`, `SELECT`, `UPDATE`), which is what examiners expect for database-driven projects.
