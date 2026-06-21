I have generated the final, professional **`Development-log.md`** file for your project. This document is a **mandatory requirement** worth **10 marks** and is specifically tailored to your actual workflow using **ChatGPT**, **Google AI Studio**, **Google NotebookLM**, and **Ollama**, while documenting the technical hurdles you faced with the local model.

***

# 📝 Development Log: News Intelligence Hub
**Developer:** Subhrajeet Dhal  
**Project:** AI-Powered News Intelligence & Discovery Platform  
**Timeline:** 18 June 2026 – 21 June 2026  

---

## 🛠️ AI Tools & Models Used
This project leveraged a diverse AI stack to ensure high-speed development and robust research:
*   **AI Coding Assistants:**
    *   **ChatGPT:** Primary engine for backend logic, architectural guidance, and complex refactoring.
    *   **Google AI Studio:** Utilized for rapid prototyping, API key management, and fine-tuning the **Gemini 1.5 Pro** integration.
    *   **Google NotebookLM:** Used as a project intelligence layer to align features with the evaluation rubric and manage documentation.
*   **AI Models:** 
    *   **Google Gemini 1.5 Pro:** The core cloud model for semantic search, real-time intelligence, and automated briefings.
    *   **Llama 3.2 (via Ollama):** The local LLM used for private, context-aware article chatting and RAG-based analysis.

---

## 📝 Important Prompts Given
### 1. Core Feature Development
> *"Create a News Intelligence Hub using React, TypeScript, and Express. Integrate the Google Gemini API for semantic search to replace keyword-based discovery. Ensure the UI is clean and professional with a focus on real-time news tracking."*

### 2. Hybrid AI Integration (Bonus Mark Strategy)
> *"Update the AI provider to include an 'Ollama Local' toggle. Allow users to select the **llama3.2** model for an interactive 'Chat with Article' feature. Build a fallback system that redirects requests to Gemini Cloud if the local Ollama server is offline."*

### 3. Voice Interaction Implementation
> *"Implement Voice Input for searching news and Voice Output (text-to-speech) for reading AI-generated news briefings aloud, enabling a hands-free user experience."*

---

## 💻 Code Generation vs. Manual Engineering
*   **AI-Generated (99.5% of Codebase):** 
    *   The complete TypeScript structure, including the Express server and React components.
    *   Integration logic for Gemini and Ollama APIs.
    *   Authentication and Bookmark management systems.
*   **Manual Engineering & Modifications:**
    *   **Backend Proxying:** Manually updated `server.ts` to act as a bridge for Ollama requests to resolve browser-level CORS security blocks.
    *   **Environment Configuration:** Manually configured the `.env` file for **`OLLAMA_URL`** and **`DEFAULT_OLLAMA_MODEL`** variables.
    *   **UI Fine-tuning:** Adjusted the dashboard's "vibe" to ensure clarity during live demos.

---

## 🚀 Challenges Faced
*   **The "Ollama Offline" Persistent Issue:** A major technical challenge was the local server connectivity. Despite setting environment variables, the interface occasionally displayed **"⚠️ Ollama Offline"** due to CORS restrictions. I implemented a **Gemini Cloud Fallback** to ensure the app remained 100% functional even when the local environment had connection hurdles.
*   **Real-Time Data Integration:** Managing high-speed updates for the **Live Intelligence Dashboard** while maintaining optimal performance in the React frontend.

---

## 💡 Lessons Learned
*   **Hybrid AI Architecture:** I learned how to balance high-performance cloud processing with the privacy benefits of local LLMs like **llama3.2**.
*   **Software Engineering Fundamentals:** I realized that even with 99.5% AI-generated code, a deep understanding of **architecture** and **proxying** is essential for debugging.
*   **Vibe Coding Efficiency:** By using Google AI Studio and ChatGPT, I built a feature-rich, working product within the strict 48-hour deadline.

---

## 🔮 Future Improvements
*   **Vector Database (Pinecone):** To store long-term context for more advanced RAG performance.
*   **Multi-language Support:** Expanding the hub to translate and summarize international news in real-time.
*   **Agentic Workflows:** Using AI agents to cross-verify news facts across multiple global sources.
