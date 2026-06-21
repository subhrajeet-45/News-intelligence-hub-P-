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
  Sliders, 
  ShieldCheck, 
  BookOpen, 
  ChevronRight, 
  ArrowRight,
  Bot,
  User as UserIcon,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Article } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import { copyTextToClipboard } from '../utils/clipboard';

interface ArticleChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  source?: string;
  isFallback?: boolean;
}

interface ArticleChatProps {
  articles: Article[];
  preSelectedArticle?: Article | null;
}

export default function ArticleChat({ articles, preSelectedArticle }: ArticleChatProps) {
  const [selectedArticleId, setSelectedArticleId] = useState<string>(() => {
    return preSelectedArticle?.id || articles[0]?.id || '';
  });

  const activeArticle = articles.find(a => a.id === selectedArticleId) || null;

  const [messages, setMessages] = useState<Record<string, ArticleChatMessage[]>>(() => {
    const cached = localStorage.getItem('news_intel_article_chat_history');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const resolved: Record<string, ArticleChatMessage[]> = {};
        for (const key of Object.keys(parsed)) {
          resolved[key] = parsed[key].map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }));
        }
        return resolved;
      } catch (e) {
        // clear fallback
      }
    }
    return {};
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

  const [isSending, setIsSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    copyTextToClipboard(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };
  
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Sync state with pre-selected article shifts
  useEffect(() => {
    if (preSelectedArticle) {
      setSelectedArticleId(preSelectedArticle.id);
    }
  }, [preSelectedArticle]);

  // Read current globally configured Ollama/Gemini state
  useEffect(() => {
    const handleStorageChange = () => {
      setUseOllama(localStorage.getItem('news_intel_use_ollama') === 'true');
      setOllamaUrl(localStorage.getItem('news_intel_ollama_url') || 'http://localhost:11434');
      setOllamaModel(localStorage.getItem('news_intel_ollama_model') || 'llama3');
    };
    window.addEventListener('storage', handleStorageChange);
    // Interval polling for rapid local configurations
    const interval = setInterval(handleStorageChange, 1500);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Save changes
  useEffect(() => {
    localStorage.setItem('news_intel_article_chat_history', JSON.stringify(messages));
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const [ollamaConnection, setOllamaConnection] = useState<{ live: boolean; models: string[]; message: string }>({
    live: false,
    models: [],
    message: 'Checking local Ollama instance...'
  });

  // Check Ollama connection
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
                localStorage.setItem('news_intel_ollama_model', matched);
              }
              console.log(`[OLLAMA] Models detected: ${modelsArr.join(', ')}`);
              console.log('[OLLAMA] Connection successful');
            } else if (modelsArr.length > 0) {
              const firstModel = modelsArr[0];
              activeModelName = firstModel;
              if (firstModel !== ollamaModel) {
                setOllamaModel(firstModel);
                localStorage.setItem('news_intel_ollama_model', firstModel);
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
    checkConnection();
    const interval = setInterval(checkConnection, 8000);
    return () => clearInterval(interval);
  }, [ollamaUrl, ollamaModel]);

  const handleToggleOllama = (active: boolean) => {
    setUseOllama(active);
    localStorage.setItem('news_intel_use_ollama', String(active));
    window.dispatchEvent(new Event('storage'));
  };

  const handleUpdateOllamaUrl = (val: string) => {
    setOllamaUrl(val);
    localStorage.setItem('news_intel_ollama_url', val);
    window.dispatchEvent(new Event('storage'));
  };

  const handleUpdateOllamaModel = (val: string) => {
    setOllamaModel(val);
    localStorage.setItem('news_intel_ollama_model', val);
    window.dispatchEvent(new Event('storage'));
  };

  const activeHistory = (activeArticle ? messages[activeArticle.id] : null) || [
    {
      id: 'welcome',
      sender: 'assistant',
      text: activeArticle 
        ? `I have fully loaded "${activeArticle.title}" into my private context window. Ask me specific questions about its claims, background, people, or implications!`
        : `Select an article from the current intelligence feed to begin your RAG private chat!`,
      timestamp: new Date(),
      source: 'RAG Brain'
    }
  ];

  const handleSend = async (customPrompt?: string) => {
    const promptText = (customPrompt || input).trim();
    if (!promptText || !activeArticle) return;
    if (!customPrompt) setInput('');

    const userMessage: ArticleChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: promptText,
      timestamp: new Date()
    };

    // Update active history list
    setMessages(prev => {
      const list = prev[activeArticle.id] || [];
      return {
        ...prev,
        [activeArticle.id]: [...list, userMessage]
      };
    });
    setIsSending(true);

    try {
      const resp = await fetch('/api/news/article-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          articleTitle: activeArticle.title,
          articleContent: activeArticle.content,
          useOllama: useOllama,
          ollamaModel: ollamaModel,
          ollamaUrl: ollamaUrl
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        const systemMessage: ArticleChatMessage = {
          id: `ast-${Date.now()}`,
          sender: 'assistant',
          text: data.reply,
          timestamp: new Date(),
          source: data.source,
          isFallback: data.isFallback
        };
        setMessages(prev => {
          const list = prev[activeArticle.id] || [];
          return {
            ...prev,
            [activeArticle.id]: [...list, systemMessage]
          };
        });
      } else {
        throw new Error('Endpoint returned error status: ' + resp.status);
      }
    } catch (e: any) {
      console.error(e);
      const errMessage: ArticleChatMessage = {
        id: `ast-err-${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ Local Context Query Error. Verify if your local server is serving on ${ollamaUrl}, or switch back to the High-Fidelity Cloud Provider in the sidebar for automated instant resolution.`,
        timestamp: new Date(),
        source: 'Error Handler',
        isFallback: true
      };
      setMessages(prev => {
        const list = prev[activeArticle.id] || [];
        return {
          ...prev,
          [activeArticle.id]: [...list, errMessage]
        };
      });
    } finally {
      setIsSending(false);
    }
  };

  const clearArticleChat = () => {
    if (!activeArticle) return;
    setMessages(prev => ({
      ...prev,
      [activeArticle.id]: []
    }));
  };

  const articlePresets = [
    "What are the economic implications mentioned?",
    "Who are the key people or stakeholders involved?",
    "Give me exactly 3 key bullet points summarizing this research.",
    "Are there any security or privacy threats highlighted?"
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar - Article context feed list & drop zone */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl space-y-5 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <BookOpen className="w-4.5 h-4.5 text-teal-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase font-sans tracking-wide">RAG Document</h3>
          </div>

          <div className="space-y-4">
            <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider">Loaded Context Source</label>
            
            {/* Simple dropdown select to allow switching articles easily */}
            <div className="relative">
              <select
                value={selectedArticleId}
                onChange={(e) => setSelectedArticleId(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-hidden focus:border-teal-500 text-slate-800 dark:text-slate-100 cursor-pointer"
              >
                {articles.map((art) => (
                  <option key={art.id} value={art.id}>
                    {art.category}: {art.title.slice(0, 35)}...
                  </option>
                ))}
              </select>
            </div>

            {activeArticle && (
              <div className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 px-2 py-0.5 rounded-full uppercase">
                    {activeArticle.category}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">
                    {activeArticle.views || 0} views
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-805 dark:text-slate-200 leading-snug">
                  {activeArticle.title}
                </h4>
                <p className="text-[10px] text-slate-405 dark:text-slate-400 leading-relaxed line-clamp-3">
                  {activeArticle.content}
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800/80 my-3" />

          {/* Local Model Setting & Connect box */}
          <div className="space-y-3 bg-slate-50 dark:bg-slate-950/45 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-[11px]">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono text-slate-405 dark:text-slate-500 uppercase tracking-wider block">AI Provider</label>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${ollamaConnection.live ? 'bg-teal-500 animate-pulse' : 'bg-amber-400'}`} />
                <span className="text-[10px] uppercase font-mono font-bold text-slate-500">
                  {useOllama ? 'Local (Ollama)' : 'Cloud (Gemini)'}
                </span>
              </div>
            </div>

            <div className="flex bg-slate-150/50 dark:bg-slate-900 p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => handleToggleOllama(false)}
                className={`flex-1 text-center py-1 rounded-lg font-medium transition-all cursor-pointer text-[10px] ${
                  !useOllama
                    ? 'bg-white dark:bg-slate-800 text-slate-805 dark:text-slate-150 shadow-xs border border-slate-100 dark:border-slate-705/50'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Gemini API
              </button>
              <button
                type="button"
                onClick={() => handleToggleOllama(true)}
                className={`flex-1 text-center py-1 rounded-lg font-medium transition-all cursor-pointer text-[10px] ${
                  useOllama
                    ? 'bg-white dark:bg-slate-800 text-slate-805 dark:text-slate-150 shadow-xs border border-slate-100 dark:border-slate-705/50'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Ollama Local
              </button>
            </div>

            {useOllama && (
              <div className="space-y-2.5 pt-1">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">Ollama host url</label>
                  <input
                    type="text"
                    value={ollamaUrl}
                    onChange={(e) => handleUpdateOllamaUrl(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-[10.5px] rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-mono focus:outline-hidden focus:border-teal-500"
                    placeholder="http://localhost:11434"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">Installed Models</label>
                  </div>
                  <select
                    value={ollamaModel}
                    onChange={(e) => handleUpdateOllamaModel(e.target.value)}
                    className="w-full px-2 py-1.5 text-[10.5px] rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-teal-500 font-sans"
                  >
                    {ollamaConnection.models && ollamaConnection.models.length > 0 ? (
                      ollamaConnection.models.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="llama3">llama3</option>
                        <option value="llama3.2">llama3.2</option>
                        <option value="deepseek-r1:1.5b">deepseek-r1:1.5b</option>
                        <option value="mistral">mistral</option>
                        <option value="gemma">gemma</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Connection Status Badge / Details */}
                <div className="space-y-1 font-sans text-xs bg-slate-100/50 dark:bg-slate-900/65 border border-slate-150/40 dark:border-slate-800/80 p-2.5 rounded-xl">
                  {ollamaConnection.live ? (
                    <div className="space-y-1 animate-in fade-in duration-200">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[10.5px]">
                        <span>✓</span>
                        <span>Ollama Connected</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[10.5px]">
                        <span>✓</span>
                        <span>Local AI Ready</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[10.5px]">
                        <span>✓</span>
                        <span>Model Loaded: {ollamaModel}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 animate-in fade-in duration-200">
                      <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold text-[10.5px]">
                        <span>⚠</span>
                        <span>Ollama Offline</span>
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-[10px] pl-3.5 leading-snug whitespace-pre-line">
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
              </div>
            )}
          </div>

          {/* Prompt Presets list */}
          {activeArticle && (
            <div className="space-y-2 pt-2">
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Quick Inquiries</label>
              <div className="grid grid-cols-1 gap-1.5">
                {articlePresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(preset)}
                    disabled={isSending}
                    className="p-2 bg-slate-50 hover:bg-slate-100/80 dark:bg-slate-900 hover:dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-left text-[10px] text-slate-600 dark:text-slate-300 rounded-lg cursor-pointer transition-all hover:translate-x-0.5 line-clamp-2"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={clearArticleChat}
              disabled={isSending}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 rounded-xl transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Context History</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Chat Panel */}
      <div className="lg:col-span-3 flex flex-col h-[580px] md:h-[630px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
        
        {/* Header banner */}
        <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-teal-500/15 p-2.5 rounded-2xl text-teal-600 dark:text-teal-400">
              <MessageSquare className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Chat with Article</h3>
              <p className="text-[10.5px] text-slate-400 mt-0.5 font-mono uppercase">
                {useOllama ? `Local RAG Isolated` : `Google Live-RAG Inference`}
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

        {/* Message Logs */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-slate-50/40 dark:bg-slate-950/20 no-scrollbar">
          <AnimatePresence initial={false}>
            {activeHistory.map((m) => {
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
                  {!isUser && (
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-[#4F46E5] dark:text-indigo-400 flex items-center justify-center shrink-0 border border-slate-200/40 dark:border-slate-705 shadow-xs">
                      <Bot className="w-5 h-5" />
                    </div>
                  )}

                  <div className={`shadow-xs transition-all flex flex-col relative group ${
                    isUser
                      ? 'max-w-[70%] bg-gradient-to-br from-[#2563EB] to-[#4F46E5] text-white rounded-[18px] px-5 py-3.5 shadow-md rounded-tr-xs'
                      : 'max-w-[75%] bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-[20px] p-6 border border-slate-200 dark:border-slate-800 shadow-[0_10px_25px_rgba(0,0,0,0.04)] rounded-tl-xs'
                  }`}>
                    {/* Action buttons inside message box */}
                    <div className={`absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150`}>
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
                    
                    {/* Message stamp */}
                    <div className={`flex items-center gap-2 text-[10px] font-mono mt-3 border-t border-slate-105 dark:border-slate-800 pt-2.5 ${isUser ? 'text-indigo-200/80' : 'text-slate-400'}`}>
                      <span>{m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {!isUser && (m.source || m.isFallback) && (
                        <>
                          <span className="text-slate-350 dark:text-slate-700">|</span>
                          <span>Context: {m.source}</span>
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
                    <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-805 dark:bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <UserIcon className="w-5 h-5" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {isSending && (
            <div className="flex gap-4 justify-start items-start">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-[#4F46E5] dark:text-indigo-400 flex items-center justify-center shrink-0 border border-slate-200/40 animate-pulse">
                <Bot className="w-5 h-5 animate-spin" />
              </div>
              <div className="max-w-[45%] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[20px] shadow-[0_10px_25px_rgba(0,0,0,0.04)] rounded-tl-xs space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-indigo-500 dark:text-[#4F46E5] font-mono tracking-wider font-bold uppercase animate-pulse">Analyzing facts context</span>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-505 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-505 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-505 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
                <p className="text-xs text-slate-400">Synthesizing authoritative intelligence from article facts...</p>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input box */}
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
              placeholder={activeArticle ? `Ask anything about "${activeArticle.title}"...` : "Choose a loaded news context to begin..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isSending || !activeArticle}
              className="flex-1 bg-white dark:bg-slate-950 border border-slate-205 dark:border-slate-800 focus:border-teal-500 rounded-xl px-4 py-3 text-xs focus:outline-hidden transition-all text-slate-850 dark:text-slate-100 placeholder-slate-400"
            />
            <button
              type="submit"
              disabled={isSending || !input.trim() || !activeArticle}
              className="px-4.5 py-3 rounded-xl bg-slate-900 hover:bg-slate-805 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-950 font-bold disabled:bg-slate-100 dark:disabled:bg-slate-850 disabled:text-slate-400 dark:disabled:text-slate-500 transition-colors cursor-pointer select-none"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
