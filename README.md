# PRISMATIC 🛡️
**Privacy Regulation, Intelligence System for Multimodal Auditing, Tracing & Integrated Compliance**

---

🌟 **[Try PRISMATIC Live!](https://prismatic-lemon.vercel.app/)** 🌟

## 🎥 Product Walkthrough

🚀 See how PRISMATIC automates compliance workflows, from scanning to auditing.

[![Prismatic Demo](https://res.cloudinary.com/dpuqctqfl/image/upload/v1776843032/Prismatic_Thumbnail_tykdsl.png)](https://drive.google.com/file/d/179EBYnxdViY-ZpSGOaYdVcfkOhKZLEUH/view?usp=sharing)

---

## 📖 Overview

**PRISMATIC** is an advanced, AI-powered compliance and privacy platform designed to automate the discovery, transformation, and auditing of sensitive data across your ecosystem. Built to address the complex requirements of modern data privacy laws (GDPR, CCPA, HIPAA, DPDP, PCI-DSS), PRISMATIC acts as an intelligent intermediary between your data stores and regulatory obligations.

By leveraging advanced agentic AI orchestrations and the Model Context Protocol (MCP), PRISMATIC allows organizations to interact with their compliance posture using natural language, fully automating Data Subject Access Requests (DSARs), PII/PHI scanning, and policy enforcement.

---

## ✨ Key Features

### 🧠 Agentic AI Orchestration
PRISMATIC is built around a highly constrained, intelligent agent framework using **LangGraph** and a **LLaMA 3.1** model. 
* **Natural Language Interface**: Users interact with the compliance system conversationally.
* **Autonomous Tool Execution**: The AI dynamically invokes specialized backend tools (scanners, transformers, auditors) via the **Model Context Protocol (MCP)** based on the context of the conversation.
* **Safe Output Synthesis**: The LLM synthesizes complex, raw JSON outputs from data scans into easily understandable, human-readable summaries without ever exposing the underlying sensitive PII/PHI in the chat interface.
* **Zero-Shot NLP**: Utilizes `distilbert-base-uncased-mnli` for zero-shot classification to detect, categorize, and extract Data Subject Access Requests (DSARs) directly from unstructured text (e.g., customer emails).

### 🔍 Intelligent Multimodal Scanning
* **MongoDB Integration**: Deeply scans MongoDB collections for sensitive data using regex patterns, heuristic field-name matching, and contextual keyword analysis.
* **Gmail Integration (OAuth)**: Scans connected inboxes to automatically identify incoming DSARs and sensitive health/personal information shared via email.
* **Confidence Scoring**: Assigns a confidence score to findings based on the detection method (regex, keyword, NLP, or a combination).

### 🛡️ Dynamic Policy & Transformation Engine
* **Context-Aware Policies**: Automatically maps discovered data to relevant compliance laws (GDPR, HIPAA, etc.). If multiple laws apply, the engine uses a "law tightening" mechanism to enforce the strictest requirement.
* **Comprehensive Transformations**: Supports 15+ data transformation techniques including Dynamic/Static Masking, Deterministic/Randomized Encryption, Hashing, Pseudonymization, Anonymization, Tokenization, and Perturbation.
* **Enforcement Engine**: Can apply transformations directly back to the source database (e.g., executing a hard delete in MongoDB upon a verified DSAR Delete request).

### 📋 Automated DSAR Management
* End-to-end automation of Data Subject Access Requests.
* Automatically parses emails to identify the requester, the subject, and the request type (Access, Delete, Rectify, etc.).
* Performs targeted scans across connected databases for the subject's data.
* Applies appropriate transformations and automatically emails the results (e.g., a structured JSON data export for an 'Access' request) back to the user.

### 📜 Cryptographic Auditing
* Every automated decision and data transformation is logged.
* Audit entries are hashed (SHA-256) to ensure immutability and track exactly what action was taken, under which law, and with what confidence.

---

## 📸 Product Screens

### 🔐 Authentication & Landing Experience
Clean, minimal entry into the Prismatic ecosystem with light/dark mode support.

![Authentication](https://github.com/AyushMayekar/Privacy_Regulation_Intelligence_System_for_Multimodal_Auditing_Tracing_Integrated_Compliance/blob/main/SS6.png)

---

### 🏠 Landing Page (AI Compliance Overview)
Your first impression — showcasing Prismatic’s vision and capabilities.

![Landing Page](https://github.com/AyushMayekar/Privacy_Regulation_Intelligence_System_for_Multimodal_Auditing_Tracing_Integrated_Compliance/blob/main/SS5.png)

---

### 🤖 AI Workspace
Interact with the compliance assistant to scan, transform, and audit data.

![AI Workspace](https://github.com/AyushMayekar/Privacy_Regulation_Intelligence_System_for_Multimodal_Auditing_Tracing_Integrated_Compliance/blob/main/SS2.png)

---

### 📊 Audit Logs Dashboard
Deep insights into compliance actions with analytics and breakdowns.

![Audit Logs](https://github.com/AyushMayekar/Privacy_Regulation_Intelligence_System_for_Multimodal_Auditing_Tracing_Integrated_Compliance/blob/main/SS3.png)

---

### 🔌 Integrations Hub
Connect data sources like MongoDB and Gmail to enable compliance workflows.

![Integrations](https://github.com/AyushMayekar/Privacy_Regulation_Intelligence_System_for_Multimodal_Auditing_Tracing_Integrated_Compliance/blob/main/SS4.png)

---

### ⚙️ Settings & Account Management
Manage profile, organization details, and security preferences.

![Settings](https://github.com/AyushMayekar/Privacy_Regulation_Intelligence_System_for_Multimodal_Auditing_Tracing_Integrated_Compliance/blob/main/SS1.png)

---

## 🛠️ Technology Stack

### Frontend
* **Framework**: React.js with Vite
* **Language**: TypeScript
* **Routing**: React Router
* **Styling**: Custom CSS / Bootstrap

### Backend
* **API Framework**: FastAPI (Python)
* **AI & Orchestration**: LangGraph, LangChain, Groq API (LLaMA-3.1), HuggingFace Transformers
* **Tool Interface**: FastMCP (Model Context Protocol)
* **Databases**: 
  * MongoDB (Persistent storage for Users, Audits, Integration Configurations)
  * SQLite (Temporary, sanitized state storage for LLM sessions)
* **Security**: JWT Authentication, Cryptography (Fernet) for secure credential storage.

---

## 🚀 Getting Started

### Prerequisites
* **Python 3.10+**
* **Node.js & npm**
* **MongoDB Instance** (Local or Atlas)
* **Groq API Key** (for the LLaMA 3.1 model)
* **Google Cloud Console Credentials** (for Gmail OAuth Integration)

### Local Setup Instructions

#### 1. Clone the Repository
```bash
git clone https://github.com/AyushMayekar/Privacy_Regulation_Intelligence_System_for_Multimodal_Auditing_Tracing_Integrated_Compliance
cd PRISMATIC
```

#### 2. Backend Setup
Navigate to the backend directory, create a virtual environment, and install dependencies:
```bash
cd backend
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory with the required environment variables:
```env
Secret_key=your_fastapi_secret_key
Fernet_Key=your_fernet_encryption_key
MONGODB=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5173/settings
SMTP_GMAIL_APP_PASSWORD=your_gmail_app_password
SENDER_EMAIL=your_sender_email@gmail.com
Groq_API_Key=your_groq_api_key
```

Start the backend server:
```bash
cd backend
uvicorn main:app --reload
# The API will be available at http://localhost:8000
```

#### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies:
```bash
cd Prismatic
npm install
```

Create a `.env` file in the `Prismatic` directory (if needed):
```env
VITE_API_URL=http://localhost:8000
```

Start the frontend development server:
```bash
cd prismatic
npm run dev
# The application will be available at http://localhost:5173
```

---

## 📬 Contact
Feel free to connect via [LinkedIn](https://linkedin.com/in/ayush-mayekar-b9b883284) or check out the [GitHub profile](https://github.com/AyushMayekar) for updates.