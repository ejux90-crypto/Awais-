# 100% Free 24/7 Cloud Deployment Guide

Follow these 3 simple steps to host your Medical MCQ Quiz App **completely free forever** with a permanent 24/7 web link (No credit card required).

---

## Option 1: Render.com (Recommended - 100% Free)

1. **Create a Free GitHub Account** (if you don't have one):
   - Go to [github.com](https://github.com) and click **Sign up**.

2. **Push your quiz project folder (`med_quiz_app`) to GitHub**:
   - Create a new repository named `med-quiz-app` on GitHub.
   - Run these commands in your Mac Terminal inside the project directory:
     ```bash
     cd /Users/awaisbhatti/Documents/antigravity/sharp-curie/med_quiz_app
     git init
     git add .
     git commit -m "Initial Medical Quiz App commit"
     git branch -M main
     git remote add origin https://github.com/YOUR_GITHUB_USERNAME/med-quiz-app.git
     git push -u origin main
     ```

3. **Deploy for Free on Render.com**:
   - Go to [render.com](https://render.com) and click **Sign Up** (Sign in with GitHub).
   - Click **New +** &rarr; **Web Service**.
   - Select your `med-quiz-app` GitHub repository.
   - Fill in:
     - **Name**: `medpulse-quiz`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `python app.py`
     - **Instance Type**: Select **Free ($0/mo)**.
   - Click **Create Web Service**.

🎉 In 2 minutes, Render will build your app and give you a permanent 24/7 link like:
`https://medpulse-quiz.onrender.com`

---

## Option 2: PythonAnywhere.com (100% Free)

1. Go to [pythonanywhere.com](https://www.pythonanywhere.com) and register for a **Free Beginner Account**.
2. Go to **Files** and upload `app.py`, `static/`, and `quiz.db`.
3. Go to **Web** tab &rarr; click **Add a new web app** &rarr; select **Flask** / **Manual Config** (Python 3.10).
4. Point your Web App Source Code to `/home/YOUR_USERNAME/` and WSGI file to `app.py`.
5. Click **Reload**.

🎉 Your app will be live 24/7 at:
`https://YOUR_USERNAME.pythonanywhere.com`
