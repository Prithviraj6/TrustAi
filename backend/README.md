# 🛡️ TrustAI Backend

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?logo=fastapi&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?logo=mongodb&logoColor=white)
![Groq](https://img.shields.io/badge/AI-Groq-orange)

**TrustAI Backend** is the high-performance API server powering the TrustAI platform. Built with **FastAPI** and **MongoDB**, it handles secure authentication, complex document analysis, and real-time AI interactions using Groq (LLaMA 3).

---

## ✨ Key Features

-   **🚀 High Performance**: Built on **FastAPI** coupled with `uvicorn` for asynchronous, non-blocking execution.
-   **🔐 Secure Authentication**: Robust **JWT-base Auth** flow for secure signup, login, and session management.
-   **🧠 AI-Powered Analysis**: Integrated **Groq** API (LLaMA 3) for deep trust scoring and document summarization.
-   **💾 Scalable Database**: Asynchronous MongoDB interaction using **Motor**.
-   **🛡️ Rate Limiting**: Built-in API protection using **SlowAPI** to prevent abuse.
-   **📑 Documentation**: Automatic, interactive API documentation via **Swagger UI** and ReDoc.
-   **📂 File Management**: Endpoints for securely uploading and retrieving analysis documents.

---

## 🛠️ Technology Stack

| Category | Technologies |
| :--- | :--- |
| **Framework** | [FastAPI](https://fastapi.tiangolo.com/) |
| **Database** | [MongoDB](https://www.mongodb.com/) (via [Motor](https://motor.readthedocs.io/)) |
| **Validation** | [Pydantic V2](https://docs.pydantic.dev/) |
| **Authentication** | [PyJWT](https://pyjwt.readthedocs.io/), [Passlib](https://passlib.readthedocs.io/) |
| **AI / LLM** | Groq API Client |
| **Rate Limiting** | [SlowAPI](https://github.com/laurentS/slowapi) |
| **Server** | [Uvicorn](https://www.uvicorn.org/) |

---

## 🚀 Getting Started

Follow these steps to set up the backend server locally.

### Prerequisites

-   **Python**: v3.10 or higher
-   **MongoDB**: Local instance or Atlas URI

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Prithviraj6/TrustAi.git
    cd TrustAi/backend
    ```

2.  **Create a Virtual Environment**:
    ```bash
    python -m venv venv
    
    # Windows
    venv\Scripts\activate
    
    # macOS/Linux
    source venv/bin/activate
    ```

3.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Environment Configuration**:
    Create a `.env` file in the `backend/` root (or ensure `backend/app/config.py` can read your env vars).
    
    **Required Variables:**
    ```env
    MONGODB_URL=mongodb://localhost:27017
    DB_NAME=TrustAi
    SECRET_KEY=your_super_secret_key_here
    GROQ_API_KEY=gsk_...
    ```

### Running the Server

Start the application with hot-reloading enabled:

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.

---

## 📖 API Documentation

FastAPI provides automatic interactive documentation. Once the server is running, visit:

-   **Swagger UI**: [`http://localhost:8000/docs`](http://localhost:8000/docs) - Test endpoints directly in your browser.
-   **ReDoc**: [`http://localhost:8000/redoc`](http://localhost:8000/redoc) - Clean, reading-friendly documentation.

---

## 📂 Project Structure

```bash
app/
├── ai/             # AI service integration (Groq)
├── analyses/       # Analysis logic and routes
├── auth/           # Authentication (Login/Signup/JWT)
├── files/          # File upload handling
├── messages/       # Chat/Message routes
├── projects/       # Project management logic
├── utils/          # Shared utilities (Logging, Rate Limit)
├── config.py       # Pydantic Settings/Config
├── db.py           # Database connection logic
└── main.py         # Application entry point
```

---

## 🤝 Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/NewEndpoint`).
3.  Commit your changes.
4.  Push to the branch.
5.  Open a Pull Request.

---

<p align="center">
  Built with ❤️ by the TrustAI 
</p>
