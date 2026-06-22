# 📰 News Intelligence Hub
### *Your Personal AI-Powered News Intelligence & Discovery Platform*

**News Intelligence Hub** is a comprehensive, AI-driven productivity tool developed for the **AI Vibe Coding Challenge 2026**. It addresses the problem of modern information overload by transforming how users consume, analyze, and interact with global news developments.

---

## 🚀 Deployment & Demo
*   **Live Application:** https://news-intelligence-hub-389907065421.asia-southeast1.run.app
*   **Demonstration Video:** https://drive.google.com/file/d/15K0juiHpIXj_BOlBC9BHWGgC486PoOOg/view?usp=drive_link

---

## ✨ Key Features

### 🎙️ Advanced Voice Integration (Bonus Features)
*   **Voice Input:** Full **Interactive Voice Search** and command capability, allowing for hands-free navigation and querying.
*   **Voice Output:** Integrated **AI News Briefings with voice assistance**, providing an eyes-free way to stay updated on the go.

### 🧠 Hybrid AI Intelligence (Bonus Features)
*   **Cloud Intelligence:** Powered by **Google Gemini AI** for high-performance semantic search and article analysis.
*   **Local LLM Integration (Ollama):** Support for local processing using **llama3.2**, ensuring privacy and offline functionality.
*   **Intelligent Fallback:** Robust architecture that automatically switches to **Gemini Cloud Fallback** if the local Ollama service is unavailable.
*   **Chat with Article (RAG):** A dedicated AI Chat interface where users can "drop" articles and ask context-aware questions using **Retrieval-Augmented Generation** logic.

### 🔍 Discovery & Analysis
*   **Semantic News Search:** Natural language search capabilities that understand user intent beyond simple keywords.
*   **Live Intelligence Dashboard:** Real-time monitoring of breaking news and trending topics with dynamic updates.
*   **Article Intelligence:** Automated summarization and topic classification to help you consume complex information 5x faster.

### 👤 Personalized Experience
*   **Authentication & Profiles:** Secure user login to maintain personalized settings.
*   **Smart Bookmarks:** Save important stories to your personal library for later reading or AI chatting.
*   **Interest-Based Recommendations:** AI-driven discovery tailored to your specific reading habits.

---

## 🛠 Technology Stack
*   **Frontend:** React, TypeScript (99.5%), Vite, CSS.
*   **Backend:** Node.js, Express.js.
*   **AI Engines:** Google Gemini API & Ollama (llama3.2).
*   **Deployment:** Google Cloud Run (GCP).

---


🎯 Use Cases

* Efficient Information Consumption: Leverage AI-generated briefings and automated summaries to quickly understand complex events and key takeaways
.
* Interactive Article Analysis: Utilize a RAG-based AI chat to ask context-aware questions about specific news stories
.
* Hands-Free Productivity: Use voice input for searching and voice output to listen to news briefings while multitasking
.
* Privacy and Offline Support: Process news summaries locally using Ollama and the llama3.2 model for increased data privacy
.
* Real-Time Monitoring: Track breaking news and trending topics through a dynamic, live intelligence dashboard
.
* Reliable Performance: Ensure a functional experience with a Gemini Cloud Fallback that activates if local LLM services are offline
.
* Advanced Discovery: Explore news using natural language semantic search that understands user intent beyond simple keywords
.
* Personalised Research: Save important developments with smart bookmarks and receive interest-based content recommendations
.

## 📸 Screenshots



* Homepage

<img width="1815" height="860" alt="Screenshot 2026-06-21 190517" src="https://github.com/user-attachments/assets/48275b0a-c941-441e-9962-30e49ef7a480" />

* AI Briefing Section

<img width="1792" height="866" alt="Screenshot 2026-06-21 190132" src="https://github.com/user-attachments/assets/45e619ac-6ba1-4a44-b237-d332b1101557" />

* Live News Intelligence Dashboard

<img width="1825" height="852" alt="Screenshot 2026-06-21 190155" src="https://github.com/user-attachments/assets/cd16ef62-3abd-4672-9f01-a87b0a65131f" />

* Ai RAG chat

<img width="1798" height="851" alt="Screenshot 2026-06-21 190224" src="https://github.com/user-attachments/assets/cb6e8a1a-d9a9-4a8b-996e-fdf8c134de98" />
  
* Categorywise search

<img width="1767" height="855" alt="Screenshot 2026-06-21 190241" src="https://github.com/user-attachments/assets/38f7e38c-1421-441e-a4e4-2196faea45b8" />

* Trending News

<img width="1825" height="845" alt="Screenshot 2026-06-21 190251" src="https://github.com/user-attachments/assets/ffd0f3d8-f35f-4c41-a14e-4fa8ce5ece13" />

## ⚙ Getting Started

### Prerequisites
*   Node.js (v18 or later).
*   A Google Gemini API Key.
*   (Optional) Ollama installed locally for Local LLM features.

### Installation
1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/subhrajeet-45/News_intelligence_hub.git
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    ```

### Environment Variables
Create a `.env` file in the root directory with the following variables:
| Variable | Description |
| :--- | :--- |
| `GEMINI_API_KEY` | Your secret Google Gemini API key. |
| `OLLAMA_URL` | Local endpoint (default: `http://localhost:11434`). |
| `DEFAULT_OLLAMA_MODEL` | Set to `llama3.2`. |

### Execution
```bash
npm run dev
```

---

## 📂 Project Structure
*   **`/server`**: Express backend handling AI routing and API proxying.
*   **`/src`**: React frontend components and state management.
*   **`Development-log.md`**: **Mandatory** file documenting the AI-assisted development journey, prompts, and challenges.

---

## 🚧 Future Roadmap
*   Advanced news impact prediction and sentiment analysis.
*   Full multi-language support for global news sources.
*   Enhanced AI-powered research mode for deep-dive investigations.

---

## 👨‍💻 Developer
**Subhrajeet Dhal**
*   GitHub: (https://github.com/subhrajeet-45)

---

## 📜 License
This project is part of the **AI Vibe Coding Challenge 2026** and is intended for educational and portfolio purposes.
