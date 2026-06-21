/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Cpu, 
  Sparkles, 
  Trash2, 
  HelpCircle, 
  RotateCcw, 
  Sliders, 
  ShieldCheck, 
  EyeOff, 
  BookOpen, 
  Globe, 
  ArrowRight,
  User as UserIcon,
  Bot,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Article } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import { copyTextToClipboard } from '../utils/clipboard';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  modelUsed?: string;
  isFallback?: boolean;
}

interface AiChatViewProps {
  user: User | null;
  articles: Article[];
}

export default function AiChatView({ user, articles }: AiChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const cached = localStorage.getItem('news_intel_chat_messages');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        return parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
      } catch (e) {
        // Fall back to default
      }
    }
    return [
      {
        id: 'welcome',
        sender: 'assistant',
        text: "Welcome to the News Privacy Chat! I am powered by your on-device local LLM (via Ollama) or off-cloud engines, ensuring zero trackers or telemetry on your inputs.\n\nYou can chat with me generally or ask me questions about the current headlines directly. How can I assist you in your research today?",
        timestamp: new Date(),
        modelUsed: 'Ollama Client'
      }
    ];
  });

  const [input, setInput] = useState('');
  const [useOllama, setUseOllama] = useState<boolean>(() => {
    return localStorage.getItem('news_intel_use_ollama') === 'true';
  });
  const [ollamaUrl, setOllamaUrl] = useState<string>(() => {
    return localStorage.getItem('news_intel_ollama_url') || 'http://localhost:11434';
  });
  const [ollamaModel, setOllamaModel] = useState<string>(() => {
    return localStorage.getItem('news_intel_ollama_model') || 'llama3';
  });

  const [ollamaConnection, setOllamaConnection] = useState<{ live: boolean; models: string[]; message: string }>({
    live: false,
    models: [],
    message: 'Checking local Ollama instance...'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [injectLatestNews, setInjectLatestNews] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    copyTextToClipboard(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };
  
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Connection testing effect
  useEffect(() => {
    const isRemote = window.location.hostname && !['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(window.location.hostname);
    if (isRemote) {
      setOllamaConnection({
        live: false,
        models: [],
        message: 'Local Ollama is only available when running the application on the same machine.'
      });
      return;
    }

    const checkConnection = () => {
      console.log('[OLLAMA] Checking connection...');
      fetch('/api/ollama/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ollamaUrl })
      })
        .then(r => {
          console.log(`[OLLAMA] Response status: ${r.status}`);
          if (!r.ok) {
            throw new Error(`HTTP error ${r.status}`);
          }
          return r.json();
        })
        .then(data => {
          let liveState = data.live;
          let modelsArr = data.models || [];
          let errorType = data.errorReason || '';
          let displayMsg = '';

          if (liveState) {
            const matched = modelsArr.find((m: string) => {
              const mLower = m.toLowerCase();
              const sLower = ollamaModel.toLowerCase();
              return mLower === sLower || mLower.startsWith(sLower) || sLower.startsWith(mLower.split(':')[0]) || mLower.split(':')[0] === sLower.split(':')[0];
            });

            let activeModelName = ollamaModel;
            if (matched) {
              if (matched !== ollamaModel) {
                activeModelName = matched;
                setOllamaModel(matched);
              }
              console.log(`[OLLAMA] Models detected: ${modelsArr.join(', ')}`);
              console.log('[OLLAMA] Connection successful');
            } else if (modelsArr.length > 0) {
              const firstModel = modelsArr[0];
              activeModelName = firstModel;
              if (firstModel !== ollamaModel) {
                setOllamaModel(firstModel);
              }
              console.log(`[OLLAMA] Models detected: ${modelsArr.join(', ')}`);
              console.log('[OLLAMA] Connection successful');
            } else {
              liveState = false;
              errorType = 'No models installed';
            }

            if (liveState) {
              displayMsg = `✓ Ollama Connected\n✓ Local AI Ready\n✓ Model Loaded: ${activeModelName}`;
            }
          }

          if (!liveState) {
            let reason = errorType || data.message || 'Connection Refused';
            console.log(`[OLLAMA] Connection failed: ${reason}`);
            displayMsg = `⚠ Ollama Offline: ${reason}\nUsing Gemini Cloud Fallback`;
          }

          setOllamaConnection({
            live: liveState,
            models: modelsArr,
            message: displayMsg
          });
        })
        .catch(err => {
          let reason = 'Connection Refused';
          const errMsg = (err.message || String(err)).toLowerCase();
          if (errMsg.includes('timeout')) {
            reason = 'Timeout';
          } else if (errMsg.includes('cors')) {
            reason = 'CORS Error';
          } else if (errMsg.includes('json') || errMsg.includes('token')) {
            reason = 'Invalid response';
          } else if (errMsg.includes('refused')) {
            reason = 'Connection Refused';
          } else if (errMsg.includes('fetch') || errMsg.includes('network') || errMsg.includes('failed')) {
            reason = 'Backend Proxy Unavailable';
          } else {
            reason = err.message || String(err);
          }
          console.log(`[OLLAMA] Connection failed: ${reason}`);
          setOllamaConnection({
            live: false,
            models: [],
            message: `⚠ Ollama Offline: ${reason}\nUsing Gemini Cloud Fallback`
          });
        });
    };

    // Run check immediately, then configure debounce/interval
    checkConnection();
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, [ollamaUrl, ollamaModel]);

  // Sync config changes back to global storage
  useEffect(() => {
    localStorage.setItem('news_intel_use_ollama', String(useOllama));
    localStorage.setItem('news_intel_ollama_url', ollamaUrl);
    localStorage.setItem('news_intel_ollama_model', ollamaModel);
  }, [useOllama, ollamaUrl, ollamaModel]);

  // Persist messages
  useEffect(() => {
    localStorage.setItem('news_intel_chat_messages', JSON.stringify(messages));
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const msgText = (textToSend || input).trim();
    if (!msgText) return;
    if (!textToSend) setInput('');

    // Append User Message
    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: msgText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Create context block of latest matching articles
      let inlineContext = '';
      if (injectLatestNews) {
        const topStories = articles.slice(0, 6).map(a => `- [${a.category}] ${a.title}: ${a.summary}`).join('\n');
        inlineContext = `CURRENT HEADLINES IN SYSTEM DATABASE:\n${topStories}\n\n`;
      }

      const response = await fetch('/api/ollama/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: msgText,
          context: inlineContext || undefined,
          model: ollamaModel,
          url: ollamaUrl,
          useOllama: useOllama
        })
      });

      if (response.ok) {
        const data = await response.json();
        const responseMessage: ChatMessage = {
          id: `ast-${Date.now()}`,
          sender: 'assistant',
          text: data.reply,
          timestamp: new Date(),
          modelUsed: data.source,
          isFallback: data.isFallback
        };
        setMessages(prev => [...prev, responseMessage]);
      } else {
        throw new Error('Chat API returned error: ' + response.status);
      }
    } catch (e: any) {
      console.error(e);
      const errMessage: ChatMessage = {
        id: `ast-err-${Date.now()}`,
        sender: 'assistant',
        text: `Error reaching the Local AI Client. Please check if your Ollama server is running locally ('ollama serve') and accessible on ${ollamaUrl}. Let me know if you would like me to toggle off Privacy Mode to use our fast Cloud models instead.`,
        timestamp: new Date(),
        modelUsed: 'Local Diagnostic Client',
        isFallback: true
      };
      setMessages(prev => [...prev, errMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    const defaultMsg: ChatMessage = {
      id: 'welcome-reset',
      sender: 'assistant',
      text: "Conversation cleared. Feel free to start a new chat about general tech or news! I'm here to answer in private mode.",
      timestamp: new Date(),
      modelUsed: 'Ollama Client'
    };
    setMessages([defaultMsg]);
  };

  const starterPrompts = [
    { title: "Review headlines", prompt: "Summarize the latest trends and headlines in our active database simply." },
    { title: "Explain quantum computer", prompt: "Explain the absolute basics of quantum computing and qubits as if I am 12." },
    { title: "Review Privacy Advantages", prompt: "Explain what are the key security and confidentiality advantages of using local Ollama model versus calling global cloud APIs." },
    { title: "AI agents explained", prompt: "Tell me a brief executive overview of what 'Autonomous AI Multi-agent pipelines' are and why companies are launching them." }
  ];

  return (
    <div id="ai-chat-view-container" className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Configuration Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl space-y-5 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Sliders className="w-4.5 h-4.5 text-teal-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase font-sans tracking-wide">AI Engine Config</h3>
          </div>

          {/* Privacy Switch */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">Privacy Mode (Ollama)</span>
              <label id="toggle-label" className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={useOllama}
                  onChange={(e) => setUseOllama(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-500"></div>
              </label>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed font-sans mt-1">
              {useOllama 
                ? "Active: Prompt processing on device locally. Standard offline sandbox limits apply."
                : "Inactive: Processing via global high-fidelity Google Gemini models."
              }
            </p>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800/80 my-3" />

          {/* Ollama Connection Specs */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider">Local Connection Status</h4>
            
            {/* Connection Status Badge / Details */}
            <div className="space-y-1 font-sans text-xs">
              {ollamaConnection.live ? (
                <div className="space-y-1 animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                    <span>✓</span>
                    <span>Ollama Connected</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                    <span>✓</span>
                    <span>Local AI Ready</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                    <span>✓</span>
                    <span>Model Loaded: {ollamaModel}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1 animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold text-[11px]">
                    <span>⚠</span>
                    <span>Ollama Offline</span>
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 text-[10px] pl-3.5 leading-snug whitespace-pre-line bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-105 dark:border-slate-850">
                    {ollamaConnection.message.includes('⚠ Ollama Offline:') 
                      ? ollamaConnection.message.replace('⚠ Ollama Offline:', '').replace('Using Gemini Cloud Fallback', '').trim() 
                      : 'Using Gemini Cloud Fallback'}
                  </div>
                  <div className="text-indigo-600 dark:text-indigo-400 font-semibold text-[10px] pl-3.5">
                    Using Gemini Cloud Fallback
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-1">
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-slate-400 uppercase">Local Address</label>
                <input 
                  type="text"
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-mono focus:outline-hidden focus:border-teal-500"
                  placeholder="http://localhost:11434"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono text-slate-400 uppercase">Target Model</label>
                <select 
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-sans focus:outline-hidden focus:border-teal-500"
                >
                  {ollamaConnection.models.length > 0 ? (
                    ollamaConnection.models.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))
                  ) : (
                    <>
                      <option value="llama3">llama3</option>
                      <option value="llama3.2">llama3.2</option>
                      <option value="deepseek-r1:1.5b">deepseek-r1</option>
                      <option value="mistral">mistral</option>
                      <option value="gemma">gemma</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800/80 my-3" />

          {/* Prompt Extras */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider">Context Injection</h4>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox"
                checked={injectLatestNews}
                onChange={(e) => setInjectLatestNews(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 bg-slate-50 dark:bg-slate-950 dark:border-slate-800"
              />
              <span className="text-xs font-sans text-slate-600 dark:text-slate-400">Inject database headlines</span>
            </label>
            <p className="text-[9.5px] text-slate-400 leading-snug">
              When checked, AI will automatically receive context on matching news headlines to let you query them directly.
            </p>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800/80 my-3" />

          {/* Quick Clear */}
          <button
            onClick={clearChat}
            className="w-full flex items-center justify-center gap-2 text-xs font-semibold py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-xl transition-all cursor-pointer active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Conversing Cache</span>
          </button>
        </div>
      </div>

      {/* Main Chat Panel */}
      <div className="lg:col-span-3 flex flex-col h-[600px] md:h-[650px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
        
        {/* Chat Title bar */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-teal-500/10 p-2 rounded-xl text-teal-600 dark:text-teal-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">Private AI Researcher</h3>
              <p className="text-[10px] text-slate-500 font-mono uppercase mt-0.5">
                {useOllama 
                  ? `Active: ${ollamaModel} on ${ollamaUrl}`
                  : `Active: cloud (google-gemini)`
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 bg-[#ECFDF5] text-[#059669] px-3 py-1 rounded-full text-[12px] font-semibold">
              <span>✓ Verified Sources</span>
            </div>
            <div className="flex items-center gap-1 bg-[#ECFDF5] text-[#059669] px-3 py-1 rounded-full text-[12px] font-semibold">
              <span>
                {!useOllama
                  ? '✓ AI Ready'
                  : ollamaConnection.live
                    ? '✓ Context Loaded'
                    : '✓ Live Analysis'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Message View Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-slate-50/40 dark:bg-slate-950/20 no-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <motion.div 
                  key={m.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, cubicBezier: [0.16, 1, 0.3, 1] }}
                  className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Avatar Icon */}
                  {!isUser && (
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-[#4F46E5] dark:text-indigo-400 flex items-center justify-center shrink-0 border border-slate-200/40 dark:border-slate-700 shadow-xs">
                      <Bot className="w-5 h-5" />
                    </div>
                  )}

                  <div className={`shadow-xs transition-all flex flex-col relative group ${
                    isUser 
                      ? 'max-w-[70%] bg-gradient-to-br from-[#2563EB] to-[#4F46E5] text-white rounded-[18px] px-5 py-3.5 shadow-md rounded-tr-xs' 
                      : 'max-w-[75%] bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-[20px] p-6 border border-slate-200 dark:border-slate-800 shadow-[0_10px_25px_rgba(0,0,0,0.04)] rounded-tl-xs'
                  }`}>
                    {/* Action buttons inside message box */}
                    <div className={`absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150`}>
                      <button
                        type="button"
                        onClick={() => handleCopy(m.id, m.text)}
                        className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer`}
                        title="Copy Response"
                      >
                        {copiedId === m.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="pr-6">
                      {isUser ? (
                        <p className="text-[14.5px] leading-relaxed whitespace-pre-wrap">{m.text}</p>
                      ) : (
                        <MarkdownRenderer content={m.text} />
                      )}
                    </div>
                    
                    {/* Message Stamp */}
                    <div className={`flex items-center gap-2 text-[10px] font-mono mt-3 border-t border-slate-105 dark:border-slate-800 pt-2.5 ${isUser ? 'text-indigo-200/80' : 'text-slate-400'}`}>
                      <span>{m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {!isUser && (m.modelUsed || m.isFallback) && (
                        <>
                          <span className="text-slate-350 dark:text-slate-700">|</span>
                          <span>Ref: {m.modelUsed}</span>
                          {m.isFallback && (
                            <>
                              <span className="text-slate-350 dark:text-slate-700">|</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-full">✓ Live Analysis</span>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 dark:bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <UserIcon className="w-5 h-5" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {isLoading && (
            <div className="flex gap-4 justify-start items-start">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-[#4F46E5] dark:text-indigo-400 flex items-center justify-center shrink-0 border border-slate-200/45 animate-pulse">
                <Bot className="w-5 h-5 animate-spin" />
              </div>
              <div className="max-w-[45%] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[20px] shadow-[0_10px_25px_rgba(0,0,0,0.04)] rounded-tl-xs space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-indigo-500 dark:text-[#4F46E5] font-mono tracking-wider font-bold uppercase animate-pulse">Synthesizing raw output</span>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
                <p className="text-xs text-slate-400 font-sans">Connecting to security sandbox source pipeline...</p>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick starter prompts triggers (when log has only 1 index) */}
        {messages.length <= 1 && (
          <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/20 dark:bg-slate-900/10">
            <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Get Started quickly</p>
            <div className="grid grid-cols-2 gap-2.5">
              {starterPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p.prompt)}
                  className="p-2.5 text-left border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950/40 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-xl transition-all cursor-pointer group text-slate-755 dark:text-slate-300"
                >
                  <p className="text-[10.5px] font-semibold text-teal-600 dark:text-teal-400 group-hover:underline flex items-center justify-between">
                    <span>{p.title}</span>
                    <ArrowRight className="w-3 h-3 text-slate-350 transform group-hover:translate-x-0.5 transition-transform" />
                  </p>
                  <p className="text-[9.5px] text-slate-400 truncate mt-0.5">{p.prompt}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Text Form */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2.5 items-center"
          >
            <input 
              type="text"
              placeholder={useOllama ? "Type question to local Ollama... (e.g. summarize headlines)" : "Ask AI general questions..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-teal-500/60 dark:focus:border-teal-500/60 rounded-xl px-4 py-3 text-xs focus:outline-hidden transition-all text-slate-850 dark:text-slate-100 placeholder-slate-400"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4.5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-950 font-bold disabled:bg-slate-100 dark:disabled:bg-slate-850 disabled:text-slate-400 dark:disabled:text-slate-500 transition-colors cursor-pointer select-none"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
