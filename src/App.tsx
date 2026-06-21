/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Compass, 
  TrendingUp, 
  Bookmark, 
  Search as SearchIcon, 
  User as UserIcon, 
  Flame, 
  Globe, 
  Cpu, 
  Clock, 
  ArrowLeft, 
  Share2, 
  Check,
  Copy,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
  Mail,
  Lock,
  ArrowRightLeft,
  AlertCircle,
  Mic,
  MicOff,
  EyeOff,
  RotateCcw,
  MessageSquare
} from 'lucide-react';
import Navigation from './components/Navigation';
import OnboardingModal from './components/OnboardingModal';
import BreakingCarousel from './components/BreakingCarousel';
import { copyTextToClipboard } from './utils/clipboard';
import ArticleCard from './components/ArticleCard';
import DashboardView from './components/DashboardView';
import AiBriefingSection from './components/AiBriefingSection';
import AiVoiceAssistant from './components/AiVoiceAssistant';
import LiveIntelligenceHub from './components/LiveIntelligenceHub';
import AiChatView from './components/AiChatView';
import ArticleChat from './components/ArticleChat';
import { Article, User } from './types';

const CATEGORIES = [
  'Artificial Intelligence',
  'Technology',
  'Sports',
  'Business',
  'Finance',
  'Science',
  'Health',
  'Entertainment',
  'Politics',
  'World News'
];

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('news_intel_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<string>('home');
  const [articles, setArticles] = useState<Article[]>([]);
  const [recommended, setRecommended] = useState<Article[]>([]);
  const [trendingArticles, setTrendingArticles] = useState<Article[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<any[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchedByAi, setIsSearchedByAi] = useState(false);
  const [aiSearchResults, setAiSearchResults] = useState<Article[]>([]);
  const [aiSearchIntent, setAiSearchIntent] = useState('');
  const [aiSearchSuggestions, setAiSearchSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    return ['AI breaks into healthcare', 'Breakthrough sports highlights', 'World finance markets trends'];
  });
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('');
  const [activeSourceFilter, setActiveSourceFilter] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');

  // Voice Search states
  const [isListeningForSearch, setIsListeningForSearch] = useState(false);
  const [voiceSearchRecognition, setVoiceSearchRecognition] = useState<any | null>(null);

  // Search diagnostics & debugging states
  const [lastSearchQuery, setLastSearchQuery] = useState<string>('');
  const [lastApiResponse, setLastApiResponse] = useState<any | null>(null);
  const [micStatus, setMicStatus] = useState<string>('checking'); // checking, granted, denied, listening, error, unsupported
  const [apiStatus, setApiStatus] = useState<{ configured: boolean; status: string; modelUsed: string; message: string }>({
    configured: false,
    status: 'checking',
    modelUsed: 'gemini-2.5-flash',
    message: 'Verifying...'
  });

  // Local LLM (Ollama) Privacy States
  const [useOllama, setUseOllama] = useState<boolean>(() => {
    return localStorage.getItem('news_intel_use_ollama') === 'true';
  });
  const [ollamaUrl, setOllamaUrl] = useState<string>(() => {
    return localStorage.getItem('news_intel_ollama_url') || 'http://localhost:11434';
  });
  const [ollamaModel, setOllamaModel] = useState<string>(() => {
    return localStorage.getItem('news_intel_ollama_model') || 'llama3';
  });
  const [isOllamaSummarizing, setIsOllamaSummarizing] = useState(false);
  const [chatReferencedArticle, setChatReferencedArticle] = useState<Article | null>(null);
  const [ollamaSummaryResult, setOllamaSummaryResult] = useState<{ summary: string; source: string; isFallback: boolean; msg?: string } | null>(null);
  const [ollamaConnection, setOllamaConnection] = useState<{ live: boolean; models: string[]; message: string }>({
    live: false,
    models: [],
    message: 'Checking local connection...'
  });

  useEffect(() => {
    localStorage.setItem('news_intel_use_ollama', String(useOllama));
    localStorage.setItem('news_intel_ollama_url', ollamaUrl);
    localStorage.setItem('news_intel_ollama_model', ollamaModel);

    const isRemote = window.location.hostname && !['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(window.location.hostname);
    if (isRemote) {
      setOllamaConnection({
        live: false,
        models: [],
        message: 'Local Ollama is only available when running the application on the same machine.'
      });
      return;
    }

    const t = setTimeout(() => {
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
            // Find matched model or auto select first
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
    }, 600);

    return () => clearTimeout(t);
  }, [useOllama, ollamaUrl, ollamaModel]);

  const [showDebugPanel, setShowDebugPanel] = useState(true);

  // Fetch search status diagnostic info and initialize mic status check
  useEffect(() => {
    fetch('/api/news/search-status')
      .then(r => r.json())
      .then(data => {
        setApiStatus(data);
      })
      .catch(err => {
        console.error('[Search Diagnostics] Failed to fetch Gemini status:', err);
        setApiStatus({
          configured: false,
          status: 'error',
          modelUsed: 'gemini-2.5-flash',
          message: 'Error connecting to server status endpoint.'
        });
      });

    // Check permissions status
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' as any })
        .then(res => {
          setMicStatus(res.state);
          res.onchange = () => {
            setMicStatus(res.state);
          };
        })
        .catch(err => {
          console.warn('[Search Diagnostics] Permissions query returned error:', err);
          setMicStatus('unknown');
        });
    } else {
      setMicStatus('unsupported-nav-api');
    }
  }, []);

  // UI state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('news_intel_dark');
      if (saved !== null) return saved === 'true';
      return true; // default dark mode for premium tech-forward aesthetic
    }
    return true;
  });

  // Auth Dialog state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');

  // AI loading State
  const [selectedArticleCopied, setSelectedArticleCopied] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // 1. Sync Theme Class
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('news_intel_dark', String(darkMode));
  }, [darkMode]);

  // 2. Fetch Initial articles aggregate
  const fetchArticles = () => {
    setIsInitialLoading(true);
    fetch('/api/news/articles')
      .then(res => res.json())
      .then(data => {
        if (data.articles) {
          setArticles(data.articles);
        }
        setIsInitialLoading(false);
      })
      .catch(err => {
        console.error('Error fetching baseline news:', err);
        setIsInitialLoading(false);
      });
  };

  useEffect(() => {
    fetchArticles();
  }, [user?.id]);

  // 3. Fetch recommended articles separately
  useEffect(() => {
    const query = user ? `?userId=${user.id}` : '';
    fetch(`/api/news/recommendations${query}`)
      .then(res => res.json())
      .then(data => {
        if (data.articles) {
          setRecommended(data.articles);
        }
      })
      .catch(err => console.error(err));
  }, [user?.id, articles.length]);

  // 4. Fetch trending topics and popular lists
  useEffect(() => {
    fetch('/api/news/trending')
      .then(res => res.json())
      .then(data => {
        if (data.trends) {
          setTrendingTopics(data.trends);
        }
        if (data.popularArticles) {
          setTrendingArticles(data.popularArticles);
        }
      })
      .catch(err => console.error(err));
  }, [articles.length]);

  // 5. Fetch bookmarks
  useEffect(() => {
    if (!user) {
      setBookmarkedIds([]);
      return;
    }
    fetch(`/api/news/bookmarks?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.articles) {
          setBookmarkedIds(data.articles.map((a: any) => a.id));
        }
      })
      .catch(err => console.error(err));
  }, [user?.id]);

  // 6. Article detailed views trigger
  const handleSelectArticle = (article: Article) => {
    setSelectedArticle(article);
    setOllamaSummaryResult(null); // Reset Ollama summary results for the new article
    setActiveTab('article-detail');
    
    // Increment telemetry view on server
    const body = user ? JSON.stringify({ userId: user.id }) : JSON.stringify({});
    fetch(`/api/news/articles/${article.id}/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    }).then(() => {
      // live update local list view number to stay visually synchronized
      setArticles(prev => prev.map(a => a.id === article.id ? { ...a, views: (a.views || 0) + 1 } : a));
    });

    // Auto-summarize if Privacy Mode is active
    if (localStorage.getItem('news_intel_use_ollama') === 'true') {
      setTimeout(() => triggerLocalSummarize(article), 100);
    }
  };

  const handleStartRagChat = (e: React.MouseEvent, article: Article) => {
    e.stopPropagation();
    setChatReferencedArticle(article);
    setActiveTab('ai-chat');
  };

  const triggerLocalSummarize = async (article: Article) => {
    setIsOllamaSummarizing(true);
    setOllamaSummaryResult(null);
    try {
      const currentOllamaUrl = localStorage.getItem('news_intel_ollama_url') || 'http://localhost:11434';
      const currentOllamaModel = localStorage.getItem('news_intel_ollama_model') || 'llama3';
      const resp = await fetch('/api/news/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: article.title,
          text: article.content,
          useOllama: true,
          ollamaModel: currentOllamaModel,
          ollamaUrl: currentOllamaUrl
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        setOllamaSummaryResult({
          summary: data.summary,
          source: data.source,
          isFallback: data.isFallback,
          msg: data.msg
        });
      } else {
        throw new Error(`Local Summarization failed: ${resp.status}`);
      }
    } catch (err: any) {
      console.error('[Ollama Frontend] Failed to summarize article:', err);
      setOllamaSummaryResult({
        summary: `Local Summarization Failed to run. Please check if your Ollama instance is configured and active.`,
        source: 'Error Handler',
        isFallback: true,
        msg: `Ensure you have start Ollama ('ollama serve') running locally on port 11434 with your selected model compiled.`
      });
    } finally {
      setIsOllamaSummarizing(false);
    }
  };

  // 7. Core Bookmark Toggle
  const handleToggleBookmark = async (e: React.MouseEvent, articleId: string) => {
    e.stopPropagation();
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const isCurrentlyBookmarked = bookmarkedIds.includes(articleId);
    if (isCurrentlyBookmarked) {
      // Remove
      setBookmarkedIds(prev => prev.filter(id => id !== articleId));
      try {
        await fetch('/api/news/bookmarks/remove', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, articleId })
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      // Add
      setBookmarkedIds(prev => [...prev, articleId]);
      try {
        await fetch('/api/news/bookmarks/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, articleId })
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  // 8. Custom Onboarding saving callback
  const handleOnboardingComplete = (interests: string[]) => {
    if (user) {
      const updatedUser = { ...user, interests };
      setUser(updatedUser);
      localStorage.setItem('news_intel_user', JSON.stringify(updatedUser));
    }
  };

  // 9. Auth Actions
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const url = isSignUp ? '/api/auth/register' : '/api/auth/login';
    const body = isSignUp 
      ? JSON.stringify({ name: authName, email: authEmail, password: authPassword, interests: [] })
      : JSON.stringify({ email: authEmail, password: authPassword });

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        localStorage.setItem('news_intel_user', JSON.stringify(data.user));
        setShowAuthModal(false);
      } else {
        setAuthError(data.error || 'Authentication parameters failed.');
      }
    } catch (err) {
      setAuthError('Connection failed.');
    }
  };

  const handleGoogleMockLogin = () => {
    const testEmail = 'google-reader@newsintelligence.io';
    const testName = 'Google Scholar';
    fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, name: testName })
    })
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
        localStorage.setItem('news_intel_user', JSON.stringify(data.user));
        setShowAuthModal(false);
      })
      .catch(err => console.error(err));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('news_intel_user');
    setActiveTab('home');
  };

  // 10. Revolutionary Action: Trigger Gemini Grounding Synthesis
  const handleSynthesizeCategory = async (category: string) => {
    setIsSynthesizing(true);
    try {
      const response = await fetch('/api/news/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category })
      });
      const data = await response.json();
      if (response.ok && data.article) {
        // Prepend new article to localized states immediately
        setArticles(prev => [data.article, ...prev]);
        handleSelectArticle(data.article);
      } else {
        alert(data.error || 'Failed to synthesize context guidelines.');
      }
    } catch (err) {
      console.error(err);
      alert('AI news synthesis request timed out.');
    } finally {
      setIsSynthesizing(false);
    }
  };

  // 11. Advanced AI Search Handler
  const handleAiSearch = async (query: string) => {
    if (!query || !query.trim()) {
      setIsSearchedByAi(false);
      setAiSearchResults([]);
      setSearchQuery('');
      setLastSearchQuery('');
      return;
    }
    setIsSearching(true);
    setSearchQuery(query);
    setLastSearchQuery(query);

    // Save to recent searches
    setRecentSearches(prev => {
      const filtered = prev.filter(q => q !== query);
      return [query, ...filtered].slice(0, 5);
    });

    try {
      console.log(`[AI Search] Initiating semantic query: "${query}"`);
      const res = await fetch('/api/news/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      const debugRes = {
        status: res.status,
        statusText: res.statusText,
        timestamp: new Date().toLocaleTimeString(),
        payload: null as any
      };

      if (res.ok) {
        const data = await res.json();
        debugRes.payload = data;
        setLastApiResponse(debugRes);

        setAiSearchResults(data.articles || []);
        setAiSearchIntent(data.intentSummary || `Results matching: "${query}"`);
        setAiSearchSuggestions(data.suggestedQueries || []);
        setIsSearchedByAi(true);

        // Update local configuration check
        if (data.apiError) {
          console.warn('[AI Search] Server reported a Gemini API error fallback:', data.apiError);
        } else {
          console.log('[AI Search] Gemini search completed successfully with', (data.articles || []).length, 'matches.');
        }
      } else {
        const textErr = await res.text();
        debugRes.payload = { error: textErr };
        setLastApiResponse(debugRes);
        console.error('[AI Search] Server returned error response:', res.status, textErr);
      }
    } catch (err: any) {
      console.error('[AI Search] Connection/Fetch error encountered:', err);
      setLastApiResponse({
        status: 'FETCH_FAILED',
        statusText: 'Failed to Connect',
        timestamp: new Date().toLocaleTimeString(),
        payload: { error: err.message || String(err) }
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  // 11.5 Voice search activation trigger
  const toggleVoiceSearch = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Safari, or Edge.');
      setMicStatus('unsupported');
      console.warn('[Voice Search] Web Speech API is not supported in this browser environment.');
      return;
    }

    try {
      console.log('[Voice Search] Requesting microphone access...');
      setMicStatus('checking');
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicStatus('granted');
    } catch (permissionError: any) {
      console.error('[Voice Search] Microphone permission error or denied:', permissionError);
      setMicStatus('denied');
      alert(`Microphone access was denied or unauthorized: ${permissionError.message || permissionError}. Please enable audio permissions for this site.`);
      return;
    }

    if (isListeningForSearch) {
      if (voiceSearchRecognition) {
        voiceSearchRecognition.stop();
      }
      setIsListeningForSearch(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.lang = 'en-US';
    rec.interimResults = false;

    rec.onstart = () => {
      setIsListeningForSearch(true);
      setMicStatus('listening');
      console.log('[Voice Search] Speech Recognition active, listening for query...');
    };

    rec.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log('[Voice Search] Transcript recognized:', transcript);
      if (transcript && transcript.trim()) {
        setSearchQuery(transcript);
        setLastSearchQuery(transcript);
        handleAiSearch(transcript);
      }
    };

    rec.onerror = (err: any) => {
      console.error('[Voice Search] Speech Recognition error:', err.error || err);
      setIsListeningForSearch(false);
      setMicStatus('error');
    };

    rec.onend = () => {
      setIsListeningForSearch(false);
      // Wait a moment and check permissions state
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'microphone' as any })
          .then(permissionStatus => {
            setMicStatus(permissionStatus.state);
          });
      } else {
        setMicStatus('granted');
      }
      console.log('[Voice Search] Speech Recognition session finished.');
    };

    try {
      rec.start();
      setVoiceSearchRecognition(rec);
    } catch (e: any) {
      console.error('[Voice Search] Failed to start recognition instance:', e);
      setIsListeningForSearch(false);
      setMicStatus('error');
    }
  };

  // 12. Floating Voice Assistant Action Executor Bridge
  const handleVoiceAssistantAction = (action: string, param?: string) => {
    console.log('[Voice Action Bridge] Executing:', { action, param });
    
    // Normalize server and client voice actions to be fully compatible
    const normAction = action ? action.toUpperCase() : 'NONE';
    const normParam = param || '';

    if (normAction === 'NAVIGATE' && normParam) {
      const p = normParam.toLowerCase();
      if (['home', 'categories', 'trending', 'bookmarks', 'dashboard', 'live-hub', 'ai-chat'].includes(p)) {
        setActiveTab(p);
        setSelectedArticle(null);
      }
    } 
    else if (normAction === 'NAVIGATE_HOME' || (normAction === 'NAVIGATE' && normParam.toLowerCase() === 'home')) {
      setActiveTab('home');
      setSelectedArticle(null);
    } 
    else if (normAction === 'NAVIGATE_TRENDING' || (normAction === 'NAVIGATE' && normParam.toLowerCase() === 'trending')) {
      setActiveTab('trending');
      setSelectedArticle(null);
    } 
    else if (normAction === 'NAVIGATE_DASHBOARD' || (normAction === 'NAVIGATE' && normParam.toLowerCase() === 'dashboard')) {
      setActiveTab('dashboard');
      setSelectedArticle(null);
    } 
    else if (normAction === 'NAVIGATE_CATEGORIES' || normAction === 'CATEGORY') {
      if (normParam) {
        // Find if it fits one of established categories
        const matchCat = articles.map(a => a.category).find(c => c.toLowerCase() === normParam.toLowerCase()) || normParam;
        setActiveCategoryFilter(matchCat);
        setActiveTab('categories');
        setSelectedArticle(null);
      }
    } 
    else if (normAction === 'READ_ARTICLE' || normAction === 'EXPLAIN') {
      if (normParam) {
        const art = articles.find(a => a.id === normParam);
        if (art) {
          handleSelectArticle(art);
        }
      }
    } 
    else if (normAction === 'SEARCH' && normParam) {
      setActiveTab('categories');
      handleAiSearch(normParam);
    } 
    else if (normAction === 'GENERATE_BRIEFING' || normAction === 'PLAY_BRIEFING') {
      // Direct users to Trending or Briefing section
      setActiveTab('trending');
      setSelectedArticle(null);
    } 
    else if (normAction === 'SYNTHESIZE' && normParam) {
      handleSynthesizeCategory(normParam);
    }
  };

  // Compute search & filters values
  const bookmarkedArticles = articles.filter(a => bookmarkedIds.includes(a.id));
  
  const sourceArticles = isSearchedByAi ? aiSearchResults : articles;

  const filteredArticles = sourceArticles.filter(art => {
    const matchesSearch = isSearchedByAi 
      ? true 
      : searchQuery === '' || (
          art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          art.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          art.source.toLowerCase().includes(searchQuery.toLowerCase())
        );

    const matchesCategory = activeCategoryFilter 
      ? art.category.toLowerCase() === activeCategoryFilter.toLowerCase() 
      : true;

    const matchesSource = activeSourceFilter
      ? art.source.toLowerCase() === activeSourceFilter.toLowerCase()
      : true;

    return matchesSearch && matchesCategory && matchesSource;
  }).sort((a, b) => {
    if (sortBy === 'popular') return (b.views || 0) - (a.views || 0);
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  const uniqueSources = Array.from(new Set(articles.map(a => a.source)));

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen transition-colors duration-200 font-sans selection:bg-teal-500/20">
      
      {/* 1. Global Navigation */}
      <Navigation
        user={user}
        activeTab={activeTab === 'article-detail' ? 'categories' : activeTab}
        setActiveTab={(tab) => {
          setSelectedArticle(null);
          setActiveTab(tab);
        }}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onLogout={handleLogout}
        onOpenAuth={() => {
          setAuthEmail('');
          setAuthPassword('');
          setAuthName('');
          setAuthError('');
          setIsSignUp(false);
          setShowAuthModal(true);
        }}
      />

      {/* 2. Onboarding Modal for New Users lacking interests */}
      {user && (!user.interests || user.interests.length === 0) && (
        <OnboardingModal
          user={user}
          onComplete={handleOnboardingComplete}
        />
      )}

      {/* 3. Main Route Switcher */}
      <main className="pb-16">
        
        {/* Loading overlay for dynamic AI processing */}
        {isSynthesizing && (
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-sm w-full text-center space-y-4 shadow-2xl">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 border-4 border-teal-500/10 rounded-full" />
                <div className="absolute inset-0 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
                <Sparkles className="w-6 h-6 text-teal-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <h3 className="text-white font-serif text-lg font-bold">Synthesizing Context</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                We are calling Gemini with Google Search groundings to fetch recent news reports, extract facts, classify content and draft key takeaways live. Please wait...
              </p>
            </div>
          </div>
        )}

        {/* Tab: Home Dashboard */}
        {activeTab === 'home' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in-50 duration-200">
            
            {/* AI DAILY NEWS BRIEFING */}
            <AiBriefingSection 
              user={user} 
              onSelectArticleTitle={(title) => {
                const found = articles.find(a => a.title.toLowerCase() === title.toLowerCase());
                if (found) {
                  handleSelectArticle(found);
                } else {
                  setActiveTab('categories');
                  handleAiSearch(title);
                }
              }} 
            />

            {/* Hero Breaking Section */}
            {articles.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-rose-500" />
                  <h3 className="text-xs uppercase tracking-widest font-mono text-slate-500 font-semibold">Live Breaking Radar</h3>
                </div>
                <BreakingCarousel
                  articles={articles}
                  onSelectArticle={handleSelectArticle}
                />
              </div>
            )}

            {/* Layout Grid: Personalized Feed alongside trending side columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Personalized Feed section */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="space-y-0.5">
                    <h2 className="text-lg font-serif font-bold text-slate-900 dark:text-white">Personalized News Feed</h2>
                    <p className="text-xs text-slate-400">Recommended based on preferred interests</p>
                  </div>
                  <Sparkles className="w-5 h-5 text-teal-500 animate-pulse" />
                </div>

                {isInitialLoading ? (
                  <div className="text-center py-12 text-slate-400">Loading your feed...</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {recommended.length > 0 ? (
                      recommended.map((art) => (
                        <ArticleCard
                          key={art.id}
                          article={art}
                          isBookmarked={bookmarkedIds.includes(art.id)}
                          onSelect={handleSelectArticle}
                          onToggleBookmark={handleToggleBookmark}
                          onChat={handleStartRagChat}
                        />
                      ))
                    ) : (
                      <p className="text-xs text-slate-400">Register or select interests to build fully personalized recommendations.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Trending side column */}
              <div className="space-y-6 lg:col-span-1">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-800/60 pb-3">
                    <TrendingUp className="w-4 h-4 text-indigo-500" />
                    <h4 className="text-sm font-sans font-bold text-slate-900 dark:text-white">Trending on Hub</h4>
                  </div>
                  
                  <div className="space-y-3">
                    {trendingTopics.map((topic, idx) => (
                      <div 
                        key={topic.id}
                        onClick={() => {
                          setActiveCategoryFilter(topic.category);
                          setActiveTab('categories');
                        }}
                        className="p-3 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all flex justify-between items-center gap-2"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <span className="text-[10px] text-teal-500 font-mono font-medium block uppercase">{topic.category}</span>
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 block truncate">{topic.topic}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-emerald-500 font-mono font-bold block">+{topic.growth}%</span>
                          <span className="text-[9px] text-slate-400 block">{topic.articlesCount} items</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Micro Category Banner Shortcuts */}
                <div className="bg-linear-to-br from-teal-500/10 to-indigo-600/10 border border-teal-500/10 p-6 rounded-2xl space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-teal-600 dark:text-teal-400 font-bold">Discover Other Channels</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => {
                          setActiveCategoryFilter(cat);
                          setActiveTab('categories');
                        }}
                        className="bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 font-semibold px-2 py-1 rounded-md transition-all cursor-pointer"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* Tab: Categories list & Discovery filters */}
        {activeTab === 'categories' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in-50 duration-200">
            
            {/* Search, Filter widgets and Category Toggle bar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl space-y-4">
              
              <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch">
                {/* Search query field with AI Search capabilities */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAiSearch(searchQuery);
                  }}
                  className="relative flex-1 flex gap-2"
                >
                  <div className="relative flex-1">
                    <SearchIcon className="w-4 h-4 text-slate-400 absolute top-1/2 left-4 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (!e.target.value.trim()) {
                          setIsSearchedByAi(false);
                          setAiSearchResults([]);
                        }
                      }}
                      placeholder="Ask AI or search: e.g. Biotech advancements or sports milestones..."
                      className="w-full bg-slate-50 dark:bg-slate-950 font-sans text-sm border border-slate-200 dark:border-slate-800 pl-11 pr-12 py-3 rounded-xl focus:border-teal-400 focus:outline-hidden text-slate-800 dark:text-slate-100 placeholder-slate-400 font-sans"
                    />
                    <button
                      type="button"
                      onClick={toggleVoiceSearch}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors cursor-pointer ${
                        isListeningForSearch 
                          ? 'text-rose-500 bg-rose-500/10 animate-pulse' 
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850'
                      }`}
                      title={isListeningForSearch ? 'Listening... click to stop' : 'Search with voice'}
                    >
                      {isListeningForSearch ? <Mic className="w-4 h-4 shrink-0" /> : <MicOff className="w-4 h-4 shrink-0" />}
                    </button>
                  </div>
                  <button 
                    type="submit"
                    disabled={isSearching}
                    className="px-4.5 bg-slate-900 text-white dark:bg-teal-500 dark:text-slate-950 font-bold rounded-xl text-xs hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    <span>{isSearching ? 'Analyzing...' : 'AI Search'}</span>
                  </button>
                </form>

                {/* Sub-Filters: sorting, sources */}
                <div className="flex gap-2 shrink-0 overflow-x-auto">
                  
                  {/* Source filter */}
                  <div className="relative">
                    <select
                      value={activeSourceFilter}
                      onChange={(e) => setActiveSourceFilter(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-950 text-xs px-3 py-3 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden text-slate-700 dark:text-slate-300 pr-8 appearance-none cursor-pointer"
                    >
                      <option value="">All Sources</option>
                      {uniqueSources.map(src => (
                        <option key={src} value={src}>{src}</option>
                      ))}
                    </select>
                    <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Popular Sorting */}
                  <button
                    onClick={() => setSortBy(prev => prev === 'latest' ? 'popular' : 'latest')}
                    className="flex items-center gap-1.5 px-4 py-3 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-xs font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Sort: {sortBy === 'latest' ? 'Latest' : 'Most Popular'}</span>
                  </button>

                </div>
              </div>

              {/* Horizontal Category Pill select bar */}
              <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
                <button
                  onClick={() => setActiveCategoryFilter('')}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
                    activeCategoryFilter === ''
                      ? 'bg-slate-900 text-white dark:bg-teal-500'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  All Channels
                </button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategoryFilter(cat)}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
                      activeCategoryFilter === cat
                        ? 'bg-slate-900 text-white dark:bg-teal-500'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Dynamic AI Search Meta Layer */}
              {isSearching && (
                <div className="flex items-center gap-2.5 p-3.5 bg-teal-500/[0.03] dark:bg-teal-500/[0.05] border border-teal-500/10 rounded-2xl animate-pulse">
                  <RefreshCw className="w-4 h-4 text-teal-400 animate-spin" />
                  <span className="text-xs font-mono text-slate-550">Querying semantic embedding model index and summarizing query intent...</span>
                </div>
              )}

              {isSearchedByAi && !isSearching && (
                <div className="p-4 bg-linear-to-r from-teal-500/10 to-indigo-500/10 border border-teal-500/15 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-teal-500 uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Semantic Intent Analysis</span>
                    </span>
                    <button 
                      onClick={() => handleAiSearch('')} 
                      className="text-[10px] text-rose-500 font-mono hover:underline font-bold cursor-pointer"
                    >
                      Clear search
                    </button>
                  </div>
                  <p className="text-xs text-slate-750 dark:text-slate-350 font-sans leading-relaxed">
                    "{aiSearchIntent}"
                  </p>

                  {/* Inline interactive suggested capsules */}
                  {aiSearchSuggestions.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap gap-1.5 items-center">
                      <span className="text-[9px] font-mono font-medium text-slate-400">Try searching:</span>
                      {aiSearchSuggestions.map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => handleAiSearch(sug)}
                          className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 px-2 py-1 border border-slate-100 dark:border-slate-800 hover:border-teal-500/20 rounded-md text-[10px] text-slate-650 dark:text-slate-450 transition-all font-semibold cursor-pointer"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Suggestions row for empty search/standard states */}
              {!isSearchedByAi && !isSearching && (
                <div className="pt-2.5 border-t border-slate-50 dark:border-slate-805/40 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center text-[11px]">
                  <div className="flex flex-wrap items-center gap-1.5 leading-none">
                    <span className="text-slate-450 font-mono">Recent queries:</span>
                    {recentSearches.map((rec, i) => (
                      <button
                        key={i}
                        onClick={() => handleAiSearch(rec)}
                        className="text-slate-600 hover:text-teal-500 dark:text-slate-400 dark:hover:text-teal-400 underline font-sans cursor-pointer"
                      >
                        {rec}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-1.5 items-center font-bold tracking-wide uppercase font-mono text-[9px] text-teal-400">
                    <span className="h-1.5 w-1.5 bg-teal-500 rounded-full animate-ping" />
                    <span>Gemini semantic search enabled</span>
                  </div>
                </div>
              )}

              {/* AI Search & Speech Diagnostics HUD Panel */}
              <div className="mt-4 pt-4 border-t border-slate-105 dark:border-slate-800/60">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowDebugPanel(!showDebugPanel)}
                    className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    <span>⚡ AI Search Diagnostics HUD</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                      {showDebugPanel ? 'Collapse' : 'Expand'}
                    </span>
                  </button>
                  {lastApiResponse?.payload?.apiError && (
                    <span className="text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 px-2.5 py-0.5 rounded-full font-semibold animate-pulse">
                      API Error Captured
                    </span>
                  )}
                </div>

                {showDebugPanel && (
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs animate-in slide-in-from-top-1 duration-200">
                    
                    {/* Gemini API Card */}
                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850 space-y-1.5 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] text-slate-400 font-mono block">GEMINI CORE SERVICE</span>
                        <span className="font-bold font-sans text-slate-700 dark:text-slate-300">{apiStatus.modelUsed}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`h-2 w-2 rounded-full ${
                          apiStatus.status === 'active' 
                            ? 'bg-emerald-500 shadow-xs' 
                            : apiStatus.status === 'checking' 
                            ? 'bg-yellow-500 animate-pulse' 
                            : 'bg-rose-500'
                        }`} />
                        <span className="font-mono text-[10px] capitalize font-semibold">{apiStatus.status}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight mt-1">{apiStatus.message}</p>
                    </div>

                    {/* Microphone Service Card */}
                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850 space-y-1.5 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] text-slate-400 font-mono block">AUDIO & MIC INTERACTION</span>
                        <span className="font-bold font-sans text-slate-700 dark:text-slate-300">Speech Recognition</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`h-2 w-2 rounded-full ${
                          micStatus === 'granted' || micStatus === 'listening'
                            ? 'bg-emerald-500 animate-pulse' 
                            : micStatus === 'denied' || micStatus === 'unsupported' || micStatus === 'error'
                            ? 'bg-rose-500' 
                            : 'bg-yellow-500 animate-pulse'
                        }`} />
                        <span className="font-mono text-[10px] uppercase font-semibold">{micStatus}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight mt-1">
                        {micStatus === 'granted' ? 'Microphone authorized. Click mic button to dictate.' :
                         micStatus === 'listening' ? 'Speech transcribing active... Speak clearly.' :
                         micStatus === 'denied' ? 'Access denied. Please check your browser address bar permissions.' :
                         micStatus === 'unsupported' ? 'SpeechRecognition API absent in browser.' :
                         micStatus === 'error' ? 'Audio capture error. Verify device exists and try again.' :
                         'Microphone authorization dynamic verification standby.'}
                      </p>
                    </div>

                    {/* Last Semantic Query Card */}
                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850 space-y-1.5 md:col-span-2 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] text-slate-400 font-mono block">LAST INTERACTIVE TELEMETRY</span>
                        <div className="text-[10px] font-mono text-slate-850 dark:text-teal-400 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2 rounded-lg mt-1 max-h-16 overflow-y-auto break-all">
                          {lastSearchQuery ? `"${lastSearchQuery}"` : 'No query logged yet. Enter text or dictate.'}
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/40 flex items-center justify-between text-[9px] font-mono">
                        <span className="text-slate-400">LAST API STATUS:</span>
                        <span className={`font-semibold ${
                          lastApiResponse?.status === 200 
                            ? 'text-emerald-500' 
                            : lastApiResponse?.status ? 'text-rose-500 font-bold' : 'text-slate-400'
                        }`}>
                          {lastApiResponse 
                            ? `${lastApiResponse.status} (${lastApiResponse.statusText}) at ${lastApiResponse.timestamp}` 
                            : 'STANDBY'}
                        </span>
                      </div>

                      {lastApiResponse?.payload?.apiError && (
                        <div className="mt-1 bg-rose-500/5 border border-rose-500/15 p-2 rounded-lg text-[9px] text-rose-500 font-mono max-h-16 overflow-y-auto">
                          <strong>Captured Error:</strong> {lastApiResponse.payload.apiError}
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>

            </div>

            {/* AI Custom synthesis button panel for the filtered category */}
            {activeCategoryFilter && (
              <div className="bg-linear-to-r from-teal-500 to-indigo-600 p-6 rounded-3xl text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md border border-teal-400/10">
                <div className="space-y-1">
                  <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold">Active: {activeCategoryFilter}</span>
                  <h3 className="text-lg font-serif font-medium">Want live dynamic breaking news?</h3>
                  <p className="text-xs text-teal-100 sm:max-w-md">Query Google logs directly via server-hosted Gemini Groundings to pull authentic, recent articles instantly.</p>
                </div>
                <button
                  onClick={() => handleSynthesizeCategory(activeCategoryFilter)}
                  className="px-5 py-2.5 bg-white text-slate-900 hover:bg-teal-50 rounded-xl text-xs font-sans font-bold flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition-all duration-150 shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>Synthesize Live Article</span>
                </button>
              </div>
            )}

            {/* Filters count details */}
            <div className="flex justify-between items-center px-2">
              <span className="text-xs text-slate-400 font-mono font-medium">Found {filteredArticles.length} publications matching filters</span>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-teal-500 font-semibold hover:underline cursor-pointer"
                >
                  Clear search
                </button>
              )}
            </div>

            {/* Main Articles grid */}
            {filteredArticles.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-3">
                <Globe className="w-10 h-10 text-slate-350 dark:text-slate-700 stroke-[1.5] mx-auto animate-pulse" />
                <h4 className="text-sm font-sans font-semibold">No publications active matching descriptions</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">Click "Synthesize Live Article" above to create a fresh report using AI groundings search!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredArticles.map(art => (
                  <ArticleCard
                    key={art.id}
                    article={art}
                    isBookmarked={bookmarkedIds.includes(art.id)}
                    onSelect={handleSelectArticle}
                    onToggleBookmark={handleToggleBookmark}
                    onChat={handleStartRagChat}
                  />
                ))}
              </div>
            )}

          </div>
        )}

        {/* Tab: Trending and popular analytics */}
        {activeTab === 'trending' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in-50 duration-200">
            
            {/* Trending banner overview */}
            <div className="bg-linear-to-br from-indigo-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white border border-indigo-500/10 shadow-xl flex gap-6 items-center">
              <div className="bg-white/10 p-4 rounded-2xl flex items-center justify-center">
                <Flame className="w-8 h-8 text-amber-400 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-serif font-bold">Trending Hot-spots</h2>
                <p className="text-xs text-indigo-200 max-w-md">Our metrics engines compute trending categories, fast-growing topic indices, and popular reports dynamically.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Category Growth Index Side metrics */}
              <div className="space-y-6 lg:col-span-1">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4 shadow-sm">
                  <h4 className="text-sm font-sans font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-50 dark:border-slate-800/60">Emerging Topics</h4>
                  <div className="space-y-3">
                    {trendingTopics.map((topic, idx) => (
                      <div 
                        key={topic.id}
                        onClick={() => {
                          setActiveCategoryFilter(topic.category);
                          setActiveTab('categories');
                        }}
                        className="p-3 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border-l-4 border-l-teal-500 rounded-r-xl cursor-pointer transition-colors"
                      >
                        <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400">{topic.category}</span>
                        <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">{topic.topic}</h5>
                        <div className="flex justify-between items-center mt-2 text-[10px] font-mono text-slate-500">
                          <span>Growth Factor</span>
                          <span className="text-emerald-500 font-bold">+{topic.growth}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Grid: Popular articles with statistics */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <h3 className="text-md font-sans font-bold text-slate-900 dark:text-white">Most Reviewed Stories</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {trendingArticles.map(art => (
                    <ArticleCard
                      key={art.id}
                      article={art}
                      isBookmarked={bookmarkedIds.includes(art.id)}
                      onSelect={handleSelectArticle}
                      onToggleBookmark={handleToggleBookmark}
                      onChat={handleStartRagChat}
                    />
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Tab: Real-Time News Intelligence Hub */}
        {activeTab === 'live-hub' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in-55 duration-200">
            <LiveIntelligenceHub 
              onSelectArticle={handleSelectArticle} 
            />
          </div>
        )}

        {/* Tab: AI Chat / RAG with Article */}
        {activeTab === 'ai-chat' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in-50 duration-200">
            <div>
              <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>💬 Deep Context Research Lab</span>
                <span className="text-xs font-mono font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  RAG enabled
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Chat interactively with any news document below using your chosen local LLM (Ollama) or secure offline cloud containers.
              </p>
            </div>

            <ArticleChat 
              articles={articles} 
              preSelectedArticle={chatReferencedArticle} 
            />
          </div>
        )}

        {/* Tab: Bookmarks */}
        {activeTab === 'bookmarks' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in-50 duration-200">
            <div>
              <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white">My Bookmark Board</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ready-later briefings saved under your reader profiles.</p>
            </div>

            {bookmarkedArticles.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-4">
                <Bookmark className="w-12 h-12 text-slate-350 dark:text-slate-700 stroke-[1.2] mx-auto animate-pulse" />
                <h4 className="text-sm font-sans font-semibold">Your Bookmarks Board is Empty</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">Explore breaking categories and toggle page markers to cache stories on offline folders here.</p>
                <button
                  onClick={() => setActiveTab('categories')}
                  className="px-5 py-2.5 bg-slate-900 dark:bg-teal-500 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-md transition-all active:scale-95 duration-100"
                >
                  Discover Articles
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {bookmarkedArticles.map(art => (
                  <ArticleCard
                    key={art.id}
                    article={art}
                    isBookmarked={true}
                    onSelect={handleSelectArticle}
                    onToggleBookmark={handleToggleBookmark}
                    onChat={handleStartRagChat}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Dashboard */}
        {activeTab === 'dashboard' && (
          user ? (
            <DashboardView
              user={user}
              onUpdateInterests={(interests) => {
                const refreshed = { ...user, interests };
                setUser(refreshed);
                localStorage.setItem('news_intel_user', JSON.stringify(refreshed));
              }}
              onSelectArticle={handleSelectArticle}
              onToggleBookmark={handleToggleBookmark}
              bookmarkedArticles={bookmarkedArticles}
            />
          ) : (
            <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6 animate-in fade-in-50">
              <UserIcon className="w-16 h-16 text-slate-300 dark:text-slate-700 stroke-[1.2] mx-auto animate-bounce" />
              <div>
                <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">Profile Dashboard Access</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Sign up or login or trace category distributions, review reading history reports, and manage interested channels dynamically.</p>
              </div>
              <button
                onClick={() => {
                  setAuthEmail('');
                  setAuthPassword('');
                  setAuthName('');
                  setAuthError('');
                  setIsSignUp(false);
                  setShowAuthModal(true);
                }}
                className="px-6 py-3 bg-slate-900 dark:bg-teal-500 hover:bg-slate-850 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95 duration-150"
              >
                Sign In to Platform
              </button>
            </div>
          )
        )}

        {/* Tab: Detailed Article Detail page view */}
        {activeTab === 'article-detail' && selectedArticle && (
          <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in slide-in-from-bottom-2 fade-in-50 duration-300">
            
            {/* Back indicator trigger */}
            <button
              onClick={() => {
                setSelectedArticle(null);
                setActiveTab('categories');
              }}
              className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to discovery grids</span>
            </button>

            {/* Detailed Article Card pane */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              
              {/* Cover featured picture */}
              <div className="relative h-[240px] sm:h-[320px] md:h-[400px]">
                <img
                  src={selectedArticle.imageUrl}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover select-none"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-slate-950/10" />
                
                {/* floating tag details */}
                <div className="absolute bottom-6 left-6 right-6 flex flex-wrap justify-between items-end gap-4 z-10 text-white">
                  <div className="space-y-1.5 min-w-0">
                    <span className="bg-teal-500 font-sans text-[11px] font-semibold px-2.5 py-1 rounded-md shrink-0 block w-fit">
                      {selectedArticle.category}
                    </span>
                    <h1 className="text-lg sm:text-2xl md:text-3xl font-serif text-white font-semibold leading-tight tracking-tight shadow-text truncate-3">
                      {selectedArticle.title}
                    </h1>
                  </div>
                </div>
              </div>

              {/* Action layout grids and primary context parameters */}
              <div className="p-6 sm:p-10 space-y-8 font-sans">
                
                {/* Meta details header and controls panel */}
                <div className="flex flex-wrap justify-between items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800/80 text-xs font-mono text-slate-500">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span>By <strong>{selectedArticle.source}</strong></span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-teal-500" />
                      <span>{new Date(selectedArticle.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setChatReferencedArticle(selectedArticle);
                        setActiveTab('ai-chat');
                      }}
                      className="flex items-center gap-2 px-3.5 py-2.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 font-sans font-bold text-xs rounded-xl cursor-pointer transition-all active:scale-95 border border-teal-500/10"
                      title="Chat with Article using RAG context"
                    >
                      <MessageSquare className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <span>Chat with Article</span>
                    </button>
                    <button
                      onClick={(e) => handleToggleBookmark(e, selectedArticle.id)}
                      className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                        bookmarkedIds.includes(selectedArticle.id)
                          ? 'bg-teal-500 text-white shadow-md'
                          : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-500 darK:text-slate-300'
                      }`}
                      title={bookmarkedIds.includes(selectedArticle.id) ? 'Bookmarked' : 'Save bookmark'}
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await copyTextToClipboard(`${window.location.origin}/articles/${selectedArticle.id}`);
                          setSelectedArticleCopied(true);
                          setTimeout(() => setSelectedArticleCopied(false), 2000);
                          fetch(`/api/news/articles/${selectedArticle.id}/share`, { method: 'POST' });
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-500 dark:text-slate-300 rounded-xl cursor-pointer transition-all"
                      title="Copy Link"
                    >
                      {selectedArticleCopied ? (
                        <Check className="w-4 h-4 text-emerald-500 animate-pulse" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Grid separating main content context from AI Executive take-away sections on right side */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  
                  {/* Left Side: Story briefs text */}
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold mb-3">Published Context</h4>
                      <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                        {selectedArticle.content}
                      </p>
                    </div>

                    {/* Collapsible Key Facts Indicator lists */}
                    {selectedArticle.facts && selectedArticle.facts.length > 0 && (
                      <div className="p-5 bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/10 rounded-2xl space-y-3">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-indigo-500" />
                          <h4 className="text-xs font-mono uppercase tracking-widest text-indigo-900 dark:text-indigo-300 font-bold">Verified Fact Indexes</h4>
                        </div>
                        <ul className="list-disc pl-5 text-xs text-slate-600 dark:text-slate-400 space-y-2">
                          {selectedArticle.facts.map((f, i) => (
                            <li key={i} className="leading-snug">{f}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Right Side Pane: AI Brief context and recommendations */}
                  <div className="lg:col-span-1 space-y-6">
                    
                    {/* executive brief summary card */}
                    <div className="bg-teal-500/5 dark:bg-teal-500/10 border border-teal-500/10 p-5 rounded-2xl space-y-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4.5 h-4.5 text-teal-500 animate-pulse" />
                        <h4 className="text-[11px] font-mono uppercase tracking-widest text-teal-800 dark:text-teal-400 font-bold">AI Executive Brief</h4>
                      </div>
                      
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans italic">
                        "{selectedArticle.summary}"
                      </p>

                      <div className="border-t border-teal-500/10 pt-3 space-y-2">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-teal-700 dark:text-teal-400">Core takeaways:</span>
                        <ul className="list-disc pl-4 text-[11px] text-slate-600 dark:text-slate-400 space-y-1.5 font-sans leading-snug">
                          {selectedArticle.takeaways && selectedArticle.takeaways.map((takeaway, idx) => (
                            <li key={idx}>{takeaway}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Privacy Mode (Ollama Local inference) Panel */}
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <EyeOff className="w-4 h-4 text-emerald-500" />
                          <h4 className="text-[11px] font-mono uppercase tracking-widest text-slate-750 dark:text-slate-300 font-bold">Privacy Mode (Ollama)</h4>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={useOllama}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setUseOllama(checked);
                              if (checked && selectedArticle) {
                                triggerLocalSummarize(selectedArticle);
                              }
                            }}
                            className="sr-only peer" 
                          />
                          <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>

                      <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                        Process and summarize news locally on your machine via <strong>Ollama</strong>. Your personal credentials and reading choices remain fully on-device.
                      </p>

                      {useOllama && (
                        <div className="space-y-3 pt-2 border-t border-slate-200/50 dark:border-slate-800 animate-in fade-in slide-in-from-top-1 duration-150">
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

                          {/* Configuration selectors */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="space-y-1">
                              <label className="text-[9px] font-mono text-slate-400 uppercase">Local Port URL</label>
                              <input 
                                type="text"
                                value={ollamaUrl}
                                onChange={(e) => setOllamaUrl(e.target.value)}
                                className="w-full px-2 py-1 text-[10.5px] rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:border-emerald-500 text-slate-850 dark:text-slate-100 font-mono"
                                placeholder="http://localhost:11434"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-mono text-slate-400 uppercase">Target Model</label>
                              <select 
                                value={ollamaModel}
                                onChange={(e) => setOllamaModel(e.target.value)}
                                className="w-full px-1 py-1 text-[10.5px] rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:border-emerald-500 text-slate-850 dark:text-slate-100 font-sans"
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

                          {/* Summarize button */}
                          <button
                            onClick={() => triggerLocalSummarize(selectedArticle)}
                            disabled={isOllamaSummarizing}
                            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white disabled:bg-emerald-500/50 cursor-pointer select-none transition-colors"
                          >
                            {isOllamaSummarizing ? (
                              <>
                                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Running local inference...</span>
                              </>
                            ) : (
                              <>
                                <RotateCcw className="w-3 h-3" />
                                <span>Synthesize Private Summary</span>
                              </>
                            )}
                          </button>

                          {/* Local Output Render box */}
                          {ollamaSummaryResult && (
                            <div className="mt-3 p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 text-[10.5px] text-slate-600 dark:text-slate-350 leading-relaxed font-sans">
                              <div className="flex items-center justify-between font-mono text-[9px] text-slate-400 border-b border-slate-100 dark:border-slate-805/80 pb-1.5">
                                <span>Engine: {ollamaSummaryResult.source}</span>
                                {ollamaSummaryResult.isFallback && <span className="text-amber-500 font-bold">LOCAL FALLBACK</span>}
                              </div>
                              <p className="whitespace-pre-wrap italic">
                                {ollamaSummaryResult.summary}
                              </p>
                              {ollamaSummaryResult.msg && (
                                <p className="text-[9.5px] font-medium text-amber-600 dark:text-amber-400 border-t border-slate-50 dark:border-slate-900 pt-1.5">
                                  💡 {ollamaSummaryResult.msg}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Related recommended items list */}
                    <div className="space-y-3">
                      <h4 className="text-xs uppercase tracking-widest font-bold text-slate-400">Related Discoveries</h4>
                      <div className="space-y-2.5">
                        {articles
                          .filter(a => a.category === selectedArticle.category && a.id !== selectedArticle.id)
                          .slice(0, 3)
                          .map(art => (
                            <div
                              key={art.id}
                              onClick={() => handleSelectArticle(art)}
                              className="p-3 border border-slate-50 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer flex gap-3 items-center"
                            >
                              <img
                                src={art.imageUrl}
                                alt={art.title}
                                className="w-10 h-10 rounded-lg object-cover shrink-0 select-none"
                              />
                              <div className="overflow-hidden space-y-0.5">
                                <h5 className="text-[11px] font-sans font-semibold text-slate-800 dark:text-slate-200 truncate leading-tight">
                                  {art.title}
                                </h5>
                                <span className="text-[9px] text-slate-400 font-mono italic block">{art.source}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

      </main>

      {/* 4. Global Authentication Slide Dialog */}
      {showAuthModal && (
        <div id="auth-overlay" className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div id="auth-modal" className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="bg-slate-900 text-white p-6 relative">
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm cursor-pointer p-1"
              >
                Close
              </button>
              <Cpu className="w-8 h-8 text-teal-400 mb-2 animate-pulse" />
              <h3 className="text-xl font-serif font-bold">News Intelligence Access</h3>
              <p className="text-xs text-slate-400 mt-1">Join high-fidelity telemetry feeds and personalized dashboards.</p>
            </div>

            {/* Error alerts indicator */}
            {authError && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 text-xs text-rose-600 dark:text-rose-400 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="p-6 space-y-4">
              
              {isSignUp && (
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Full Name</label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="e.g. Subhrajeet Dhal"
                    className="w-full bg-slate-50 dark:bg-slate-950 text-sm p-3 border border-slate-200 dark:border-slate-800 rounded-xl outline-hidden focus:border-teal-450"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="email@newsintelligence.io"
                    className="w-full bg-slate-50 dark:bg-slate-950 text-sm pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl outline-hidden focus:border-teal-450"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-950 text-sm pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl outline-hidden focus:border-teal-450"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 border border-slate-800 dark:bg-teal-500 text-white dark:text-slate-950 hover:bg-slate-800 font-sans text-sm font-bold rounded-xl mt-2 cursor-pointer shadow-md active:scale-95 transition-all duration-150"
              >
                {isSignUp ? 'Create My Account' : 'Authenticate Credentials'}
              </button>

            </form>

            {/* Divider */}
            <div className="relative px-6 py-2">
              <div className="absolute inset-x-6 top-1/2 h-px bg-slate-100 dark:bg-slate-800" />
              <span className="relative bg-white dark:bg-slate-900 px-3 text-[10px] font-mono text-slate-400 mx-auto block w-fit">Authentication Provider emulations</span>
            </div>

            {/* Simulated Google SSO Auth action */}
            <div className="p-6 pt-2 space-y-4">
              <button
                onClick={handleGoogleMockLogin}
                className="w-full py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.62-.62-1.03-1.37-1.21-2.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Automated Google Login (1-Click)</span>
              </button>

              <div className="text-center">
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-xs text-teal-500 font-semibold hover:underline cursor-pointer"
                >
                  {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Persistently Accessible AI floating widget */}
      <AiVoiceAssistant
        user={user}
        currentArticleId={selectedArticle?.id || null}
        activeCategory={activeCategoryFilter || null}
        onExecuteAction={handleVoiceAssistantAction}
      />

    </div>
  );
}
