# 🤖 TrustAI

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/Frontend-React_19-61DAFB?logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)
![Groq](https://img.shields.io/badge/AI-Groq_LLM-orange)

**TrustAI** is an advanced **Trust & Verification Platform** capable of automating document reviews, assessing contract risks, and generating real-time trust scores. By combining a modern, reactive frontend with a high-performance Python backend and specialized AI agents, TrustAI transforms how you interact with legal and financial documents.

---

## 🏗️ Architecture

This repository is structured as a **Monorepo** containing both the client and server applications:

-   **🖥️ [Frontend](./frontend/README.md)**: A responsive, dark-mode web application built with **React**, **TypeScript**, and **Vite**. Features interactive dashboards, detailed reports, and a seamless user experience.
-   **⚙️ [Backend](./backend/README.md)**: A robust REST API built with **FastAPI** and **MongoDB**. It handles authentication, file processing, and orchestrates AI analysis using Groq (LLaMA 3).

---

## 🚀 Quick Start Guide

Run the full stack locally in minutes.

### Prerequisites

-   **Node.js** (v18+)
-   **Python** (v3.10+)
-   **MongoDB** (Local or Atlas)

### 1. Clone the Repository

```bash
git clone https://github.com/Prithviraj6/TrustAi.git
cd TrustAi
```

### 2. Setup Backend (Terminal 1)

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
# Ensure your .env file is configured (see backend/README.md)
uvicorn app.main:app --reload
```

### 3. Setup Frontend (Terminal 2)

```bash
cd frontend
npm install
npm run dev
```

🚀 **Open your browser:**
-   **App**: [`http://localhost:5173`](http://localhost:5173)
-   **API Docs**: [`http://localhost:8000/docs`](http://localhost:8000/docs)

---

## ✨ Core Capabilities

-   **📄 Smart Document Analysis**: Upload PDFs/Images and let AI extract key clauses, detect risks, and summarize content.
-   **🛡️ Trust Scoring**: Automated algorithm that assigns a "Trust Score" (0-100) to documents based on credibility and completeness.
-   **💬 Interactive AI Agent**: Chat directly with your documents to ask questions ("Is this NDA valid for 5 years?", "What are the termination clauses?").
-   **📊 Visual Insights**: Beautifully rendered charts and reports to visualize verification data.

---

## 📚 Documentation

For detailed installation instructions, API references, and component breakdowns, please refer to the specific documentation:

| Use Case | Documentation Link |
| :--- | :--- |
| **I want to work on the UI** | [Frontend Documentation](./frontend/README.md) |
| **I want to work on the API** | [Backend Documentation](./backend/README.md) |

---

## 📸 Screenshots

*(Add screenshots of your Dashboard, Analysis Page, and Landing Page here)*

---

<p align="center">
  Built with ❤️ by the TrustAI 
</p>
