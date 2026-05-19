# FinAI Tester 🤖💰

A proof-of-concept tester for **FinFlow AI** — an AI-powered financial assistant built for Indonesian SMEs (UMKM). This project tests the integration between Google Gemini AI and Supabase to automatically extract and store financial transaction data from natural language messages.

## 📌 Overview

Indonesian SME owners often record transactions informally (e.g., via WhatsApp). This tool uses Gemini AI to parse those messy messages and extract structured financial data.

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| AI Engine | Google Gemini 2.5 Flash |
| Database | Supabase (PostgreSQL) |
| Runtime | Node.js |
| Config | dotenv |

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- A [Google AI Studio](https://aistudio.google.com/) API key
- A [Supabase](https://supabase.com/) project

### Installation

```bash
git clone https://github.com/aerioade/FinFlow-AI.git
cd finai-tester
npm install
```

### Environment Setup

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Running Tests

```bash
# Test AI extraction
node index.js

# Test Supabase connection
node test-db.js
```

## 📂 Project Structure

```
finai-tester/
├── index.js        # Gemini AI extraction test
├── test-db.js      # Supabase connection test
├── .env            # Environment variables (gitignored)
└── package.json    # Project dependencies
```

## 📄 License

ISC
