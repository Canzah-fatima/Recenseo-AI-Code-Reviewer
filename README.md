
<div align="center">

# RECENSEO

### *AI Code Reviewer*

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<p align="center">
  <strong>Recenseo</strong> is an autonomous, AST-driven code review platform and AI telemetry studio that detects security vulnerabilities, memory retention issues, algorithmic bottlenecks, and generates production-ready code patches with line-level intelligence.
</p>

</div>

---

# 🌟 Overview

Modern code reviews often miss subtle runtime vulnerabilities, asynchronous memory leaks, and hidden algorithmic inefficiencies.

**Recenseo** bridges the gap between static code analysis and generative AI by parsing source code into structured **Abstract Syntax Tree (AST)** telemetry.

Powered by **Google Gemini** and real-time AST heuristics, Recenseo analyzes complexity, detects security risks, identifies memory retention issues, and produces production-ready unified patches with a single click.

---

# ✨ Key Features

## 🔍 Deep Diagnostic Telemetry

- 🚨 CRITICAL / WARNING / INFO severity classification
- 📍 Line-level diagnostics with jump-to-line support
- 💡 AI-generated remediation suggestions
- 🔒 Security-focused code recommendations

---

## 📈 Complexity & Performance Analysis

- Time Complexity estimation
- Space Complexity estimation
- Static loop-bound analysis
- Algorithm bottleneck detection
- Overall Health Score (0–100)

---

## 🔄 AI Patch Generation

- Git-style unified diff generation
- One-click patch application
- Clipboard export
- Copilot-style patch workflow

---

## 🖥 Responsive Workspace

- Dual-pane code editor
- Drag-to-resize layout
- Multi-file explorer
- File upload support
- Rename/Delete files

---

## 📑 Markdown Reports

Generate complete code review reports with one click.

---

# 🛠 Supported Languages & Frameworks

| Category | Technologies |
|----------|--------------|
| Frontend | React, Next.js, Vue, Svelte, Astro, HTML |
| Backend | FastAPI, Flask, Django, Express, NestJS, Node.js |
| Languages | TypeScript, JavaScript, Python, Java, Go, Rust, C#, PHP |
| Styling | Tailwind CSS, CSS3, SCSS |
| Databases | PostgreSQL, MySQL, SQLite, Prisma ORM, GraphQL |
| Config | Docker, YAML, JSON, TOML, Bash, Markdown |

---

# 🏗 System Architecture

```text
┌─────────────────────────────────────────────────────┐
│                RECENSEO FRONTEND                    │
│ React • Next.js • TypeScript • Tailwind CSS         │
└───────────────────────┬─────────────────────────────┘
                        │
                Source Code Buffer
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│             AST + GEMINI ANALYSIS ENGINE            │
│                                                     │
│ • Static Syntax Analysis                            │
│ • Security Scanning                                 │
│ • Memory Leak Detection                             │
│ • Complexity Analysis                               │
│ • AI Refactoring                                    │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│             DIAGNOSTIC ENGINE                       │
│                                                     │
│ • Health Score                                      │
│ • Unified Diff                                      │
│ • AI Recommendations                                │
└─────────────────────────────────────────────────────┘
```

---

# 🚀 Quick Start

## Prerequisites

- Node.js 18+
- npm / pnpm / yarn
- Google Gemini API Key

---

## 1. Clone Repository

```bash
git clone https://github.com/Canzah-fatima/recenseo.git
cd recenseo
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment

Create a file named:

```text
.env.local
```

Add:

```env
# Vite
VITE_GEMINI_API_KEY=your_gemini_api_key

# Next.js (optional)
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

---

## 4. Run Development Server

```bash
npm run dev
```

Open:

```
http://localhost:5173
```

or

```
http://localhost:3000
```

---

## 5. Production Build

```bash
npm run build
```

## 📂 Project Structure

```text
recenseo/
├── public/
│   ├── favicon.ico
│   └── assets/
│
├── src/
│   ├── components/
│   │   ├── 3d/
│   │   ├── hud/
│   │   ├── ui/
│   │   ├── AnalysisPanel.tsx
│   │   ├── CodeEditor.tsx
│   │   ├── CircularTypewriter.tsx
│   │   ├── DiffViewer.tsx
│   │   ├── FileExplorer.tsx
│   │   └── Navbar.tsx
│   │
│   ├── views/
│   │   ├── LandingView.tsx
│   │   └── WorkspaceView.tsx
│   │
│   ├── lib/
│   │   ├── gemini.ts
│   │   ├── ast.ts
│   │   ├── storage.ts
│   │   ├── presets.ts
│   │   └── utils.ts
│   │
│   ├── hooks/
│   ├── types/
│   ├── styles/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── .env.local
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── README.md
└── LICENSE
```

---

# 🔒 Security

- Stateless client-side analysis
- Secure environment variable support
- No API keys are stored in the repository
- Memory-safe isolated analysis buffers

---

# 📄 License

This project is licensed under the **MIT License**.

See the **LICENSE** file for more information.

---

<div align="center">

Made with ❤️ using **React**, **TypeScript**, **Tailwind CSS**, and **Google Gemini**

</div>

