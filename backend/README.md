# TrustAI Backend

This is the FastAPI backend for the TrustAI application.

## Setup

1.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

2.  **Environment Variables**:
    - Open `.env` and fill in your MongoDB URL, Secret Key, and Groq API Key.

3.  **Run the Server**:
    ```bash
    uvicorn app.main:app --reload
    ```
    The server will start at `http://localhost:8000`.

## Features

- **Authentication**: JWT-based Signup/Login.
- **Projects**: Create, list, and manage projects.
- **Chat**: AI-powered trust analysis using Groq (LLaMA 3).
- **Files**: Upload and manage files (PDF, Images).

## API Documentation

Once the server is running, visit `http://localhost:8000/docs` for the interactive Swagger UI.
