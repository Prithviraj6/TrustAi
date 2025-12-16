# 🌐 TrustAI Frontend

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.0-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)

**TrustAI Frontend** is the modern, responsive user interface for the TrustAI platform. Built with performance and user experience in mind, it leverages the latest React 19 ecosystem to provide real-time trust analysis, document verification, and a seamless dashboard experience.

---

## ✨ Key Features

-   **🎨 Modern UI/UX**: Crafted with **Tailwind CSS** and **Shadcn/UI** principles for a sleek, dark-mode-first aesthetic.
-   **⚡ Blazing Fast**: Powered by **Vite** for instant HMR and optimized production builds.
-   **🔧 Type-Safe**: Fully typed with **TypeScript** for robust and maintainable code.
-   **📊 Interactive Dashboards**: Visual data representation using **Recharts**.
-   **📽️ Rich Animations**: Smooth transitions and effects powered by **Framer Motion** and **GSAP**.
-   **🤖 AI Integration**: dedicated interfaces for interacting with LLM-based analysis tools.
-   **📄 Document Handling**: Built-in support for PDF rendering/generation (`jspdf`, `pdfjs-dist`) and OCR (`tesseract.js`).

---

## 🛠️ Technology Stack

| Category | Technologies |
| :--- | :--- |
| **Core** | [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **State & Routing** | [React Router v7](https://reactrouter.com/), Context API |
| **Animations** | [Framer Motion](https://www.framer.com/motion/), [GSAP](https://gsap.com/) |
| **3D & Graphics** | [Three.js](https://threejs.org/) |
| **Utilities** | [Axios](https://axios-http.com/), [clsx](https://github.com/lukeed/clsx), [tailwind-merge](https://github.com/dcastil/tailwind-merge) |

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

-   **Node.js**: v18.0.0 or higher
-   **npm** or **yarn**

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Prithviraj6/TrustAi.git
    cd TrustAi/frontend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env` file in the root of the `frontend` directory (if needed for custom API URLs):
    ```env
    VITE_API_BASE_URL=http://localhost:8000
    ```

### Running Locally

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port shown in your terminal).

---

## 📜 Available Scripts

| Script | Description |
| :--- | :--- |
| `npm run dev` | Starts the development server with HMR. |
| `npm run build` | Compiles the application for production using TypeScript and Vite. |
| `npm run preview` | Locally preview the production build. |
| `npm run lint` | Runs ESLint to check for code quality issues. |

---

## 📂 Project Structure

```bash
src/
├── assets/         # Static assets (images, icons)
├── components/     # Reusable UI components
│   └── ui/         # Generic UI elements (Buttons, Cards, etc.)
├── context/        # React Context providers (User, Theme, etc.)
├── layouts/        # Page layout wrappers
├── pages/          # Application views/routes
├── services/       # API integration modules
├── types/          # TypeScript interface definitions
├── utils/          # Helper functions and utilities
├── App.tsx         # Main application component
└── main.tsx        # Entry point
```

---

## 🤝 Contributing

1.  Fork the repository.
2.  Create a new feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

<p align="center">
  Built with ❤️ by the TrustAI 
</p>
