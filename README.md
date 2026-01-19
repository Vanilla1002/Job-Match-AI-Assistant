# 🚀 Job-Match AI Assistant

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![OpenAI](https://img.shields.io/badge/AI-GPT--4o-orange)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC)

**Job-Match AI** is a full-stack SaaS application designed to help job seekers optimize their career opportunities. It uses advanced AI to analyze resumes against specific job descriptions, identify skill gaps, generate personalized learning paths, and create tailored PDF resumes instantly.

[**View Live Demo**](https://job-match-assistant.vercel.app) ---

## ✨ Key Features

### 🧠 Smart Analysis Engine
* **Resume Parsing:** server-side extraction of text from PDF files using `pdf-parse`.
* **Match Scoring:** Calculates a compatibility score (0-100%) based on skills, experience, and semantic relevance using **GPT-4o**.
* **Gap Analysis:** Identifies critical "Missing Keywords" that might block the resume from passing ATS systems.

### 🎓 Personalized Learning Path
* Generates a custom study plan to bridge skill gaps.
* Suggests concrete **Capstone Projects** to demonstrate new skills.
* Curates learning resources (YouTube, Documentation, Articles) for specific missing technologies.

### 📄 Tailored Resume Generator
* **Dynamic PDF Creation:** Uses `@react-pdf/renderer` to build a brand new, ATS-friendly resume on the fly.
* **Smart Tailoring:** Automatically rewrites the summary and incorporates relevant missing skills (where plausible) to target the specific job description.
* **Caching System:** Stores generated resumes in the database to reduce AI costs and latency on repeated requests.

### 🛡️ Security & Performance
* **Authentication:** Secure email/password login via Supabase Auth with email verification.
* **Row Level Security (RLS):** Strict PostgreSQL policies ensuring users can only access their own data.
* **Rate Limiting:** Custom daily usage limit (3 analyses/day) implemented efficiently via database queries (no external store required).

### 📱 Seamless User Experience
* **Fully Responsive:** A mobile-first interface that runs smoothly on all devices, from desktop monitors to smartphones.
* **Modern UI:** Built with Shadcn/UI for a polished, accessible, and consistent look and feel.
---

## 🛠️ Tech Stack

* **Frontend:** Next.js 15 (App Router), React, TypeScript, Tailwind CSS (Mobile-First), Shadcn/UI, Framer Motion
* **Backend:** Next.js API Routes (Serverless Functions).
* **Database:** Supabase (PostgreSQL) with vector support potential.
* **AI:** OpenAI API (GPT-4o) with structured JSON outputs.
* **PDF Tools:** `pdf-parse` (Read), `@react-pdf/renderer` (Write).
* **Deployment:** Vercel (Production), Docker (Local Development).

---

## 🚀 Getting Started

### Prerequisites
* Node.js 18+ or Docker
* A Supabase account
* An OpenAI API Key

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/job-match-ai.git](https://github.com/your-username/job-match-ai.git)
    cd job-match-ai
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env.local` file in the root directory:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
    OPENAI_API_KEY=your_openai_api_key
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Docker Support
To run the project in a containerized environment:
```bash
docker-compose up --build
```
---

## 🗄️ Database Schema (Supabase)
The application uses two main tables in PostgreSQL:

profiles: Stores user data, raw resume text, and parsed personal details.

job_analyses: Stores analysis history, match scores, learning paths, and cached tailored resumes.

RLS policies are enabled on all tables to ensure data privacy.

