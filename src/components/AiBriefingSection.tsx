/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Share2, 
  Bookmark, 
  RefreshCw, 
  Check, 
  RotateCcw,
  Gauge,
  ChevronRight,
  TrendingUp,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Article } from '../types';
import { copyTextToClipboard } from '../utils/clipboard';

interface Story {
  title: string;
  summary: string;
  whyItMatters: string;
}

interface Briefing {
  title: string;
  stories: Story[];
  outlook: string;
}

interface AiBriefingSectionProps {
  user: User | null;
  onSelectArticleTitle: (title: string) => void;
}

const BRIEF_CATEGORIES = [
  { id: '', label: 'General Intel' },
  { id: 'Artificial Intelligence', label: 'Artificial Intel' },
  { id: 'Technology', label: 'Technology' },
  { id: 'Sports', label: 'Sports' },
  { id: 'Business', label: 'Business' },
  { id: 'Finance', label: 'Finance' },
  { id: 'Science', label: 'Science' },
  { id: 'Politics', label: 'Politics' }
];

export default function AiBriefingSection({ user, onSelectArticleTitle }: AiBriefingSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [savedBriefs, setSavedBriefs] = useState<Briefing[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Audio / Speech State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Set up auto load briefing
  useEffect(() => {
    generateBriefing();
  }, [activeCategory]);

  // Clean speaking on category switch
  useEffect(() => {
    stopSpeaking();
  }, [activeCategory]);

  const generateBriefing = async () => {
    setIsLoading(true);
    setIsSaved(false);
    stopSpeaking();

    try {
      const response = await fetch('/api/news/briefing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category: activeCategory || undefined,
          userId: user?.id || undefined
        })
      });

      if (response.ok) {
        const data = await response.json();
        setBriefing(data);
      }
    } catch (err) {
      console.error('Error compiling daily briefing:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getFullBriefingText = (brief: Briefing) => {
    let text = `${brief.title}. Here is your customized AI Daily Intelligence Briefing. `;
    brief.stories.forEach((story, idx) => {
      text += `Story number ${idx + 1}: ${story.title}. Summary: ${story.summary} Why it matters: ${story.whyItMatters}. `;
    });
    text += `Outlook and trends context: ${brief.outlook}`;
    return text;
  };

  const startSpeaking = () => {
    if (!synthRef.current || !briefing) return;

    // Clear any active speaking
    synthRef.current.cancel();

    const fullText = getFullBriefingText(briefing);
    const utterance = new SpeechSynthesisUtterance(fullText);
    utteranceRef.current = utterance;
    
    utterance.rate = playbackRate;
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    setIsPlaying(true);
    setIsPaused(false);
    synthRef.current.speak(utterance);
  };

  const pauseSpeaking = () => {
    if (!synthRef.current) return;
    if (synthRef.current.speaking && !synthRef.current.paused) {
      synthRef.current.pause();
      setIsPaused(true);
    }
  };

  const resumeSpeaking = () => {
    if (!synthRef.current) return;
    if (synthRef.current.paused) {
      synthRef.current.resume();
      setIsPaused(false);
    } else {
      startSpeaking();
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
  };

  const changeSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (isPlaying) {
      // Must restart speech to apply rate change in older SpeechSynthesis implementations smoothly
      setTimeout(() => {
        startSpeaking();
      }, 50);
    }
  };

  const handleSaveBrief = () => {
    if (!briefing) return;
    setSavedBriefs(prev => [...prev, briefing]);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleShareBrief = () => {
    if (!briefing) return;
    const shareText = `Explore the AI Daily News Briefing: "${briefing.title}" on the News Intelligence Hub!`;
    copyTextToClipboard(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="ai-briefing-module" className="bg-linear-to-b from-slate-900/40 to-slate-950/20 dark:from-slate-950/40 dark:to-slate-950/80 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 mb-8 shadow-sm backdrop-blur-md">
      
      {/* Category selector row */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/50 pb-4 mb-5 overflow-x-auto select-none no-scrollbar">
        <div className="flex items-center gap-2 shrink-0">
          <div className="p-1 px-2.5 rounded-xl bg-teal-500/10 border border-teal-500/15 text-teal-500 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider font-mono">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>AI briefing node</span>
          </div>
        </div>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {BRIEF_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-teal-500 dark:text-slate-950 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Story Summary Block */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="min-h-[220px] flex flex-col items-center justify-center p-8 space-y-3">
              <RefreshCw className="w-8 h-8 text-teal-500 animate-spin" />
              <p className="text-xs text-slate-400 font-mono">Compiling news context and generating AI briefing summary...</p>
            </div>
          ) : briefing ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-serif font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{briefing.title}</span>
                </h2>
              </div>

              {/* Story Items Accordion list */}
              <div className="space-y-3">
                {briefing.stories.length === 0 ? (
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl flex items-center gap-2.5 text-xs text-slate-400">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span>No analytical articles available for today's briefing in this channel.</span>
                  </div>
                ) : (
                  briefing.stories.map((story, index) => (
                    <div 
                      key={index} 
                      onClick={() => onSelectArticleTitle(story.title)}
                      className="group p-3.5 bg-white/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 rounded-2xl hover:border-teal-500/30 dark:hover:border-teal-500/20 hover:bg-slate-50 dark:hover:bg-slate-900/80 cursor-pointer transition-all duration-300"
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-slate-150 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                          {index + 1}
                        </div>
                        <div className="space-y-1 grow">
                          <h4 className="text-xs sm:text-sm font-sans font-semibold text-slate-800 dark:text-slate-200 leading-snug group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors flex items-center gap-1.5">
                            <span>{story.title}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed font-sans">{story.summary}</p>
                          <div className="pt-1 flex items-center gap-1">
                            <span className="text-[10px] uppercase font-mono font-bold text-amber-600 dark:text-amber-400">Why it matters:</span>
                            <span className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 italic font-mono leading-tight">{story.whyItMatters}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs font-mono">
              Briefing node is standby. Select any category tag to refresh.
            </div>
          )}
        </div>

        {/* Action, Voice Player, Outlook Side Panel */}
        <div className="lg:col-span-1 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/40 p-4 rounded-3xl flex flex-col justify-between gap-5">
          {briefing ? (
            <>
              {/* Voice Player console */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Acoustic Audio Brief</span>
                  </span>
                  
                  {isPlaying && (
                    <span className="flex items-center gap-0.5">
                      <span className="h-2 w-0.5 bg-teal-500 rounded-full animate-[bounce_0.8s_infinite_100ms]" />
                      <span className="h-3 w-0.5 bg-teal-500 rounded-full animate-[bounce_0.8s_infinite_200ms]" />
                      <span className="h-1.5 w-0.5 bg-teal-500 rounded-full animate-[bounce_0.8s_infinite_300ms]" />
                    </span>
                  )}
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3.5 rounded-2xl shadow-xs space-y-3">
                  <div className="flex items-center justify-center gap-3">
                    {/* Play/Pause control */}
                    {isPlaying && !isPaused ? (
                      <button 
                        onClick={pauseSpeaking}
                        className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-white flex items-center justify-center cursor-pointer transition-all active:scale-95"
                        title="Pause acoustic speech"
                      >
                        <Pause className="w-4 h-4 fill-current" />
                      </button>
                    ) : (
                      <button 
                        onClick={resumeSpeaking}
                        className="h-10 w-10 rounded-full bg-teal-500 hover:bg-teal-400 text-white flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-md shadow-teal-500/10"
                        title="Synthesize and Play Speech"
                      >
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </button>
                    )}

                    {isPlaying && (
                      <button 
                        onClick={stopSpeaking}
                        className="h-9 w-9 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 flex items-center justify-center cursor-pointer transition-all active:scale-90"
                        title="Stop speech"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Playback rate speed slider */}
                  <div className="space-y-1.5 pt-1.5 border-t border-slate-50 dark:border-slate-800/60">
                    <div className="flex justify-between items-center text-[10px] text-slate-450 font-mono">
                      <span className="flex items-center gap-1">
                        <Gauge className="w-3 h-3 text-slate-400" />
                        <span>Speaking rate</span>
                      </span>
                      <span>{playbackRate.toFixed(2)}x</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {[1.0, 1.25, 1.5, 1.75].map((speed) => (
                        <button
                          key={speed}
                          onClick={() => changeSpeed(speed)}
                          className={`flex-1 py-1 rounded-md text-[10px] font-mono leading-none transition-all cursor-pointer ${
                            playbackRate === speed
                              ? 'bg-slate-900 border border-slate-900 text-white dark:bg-teal-500 dark:border-teal-500 dark:text-slate-950 font-bold'
                              : 'bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-850/60 text-slate-500 border border-slate-100 dark:border-slate-800/10'
                          }`}
                        >
                          {speed.toFixed(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Trends / Outlook Panel */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-teal-500" />
                  <span>Market & News Outlook</span>
                </span>
                <div className="p-3.5 bg-teal-500/[0.02] dark:bg-teal-500/[0.04] border border-teal-500/5 rounded-2xl">
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
                    {briefing.outlook}
                  </p>
                </div>
              </div>

              {/* Action toolset: Save / Share info */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/40">
                <button
                  onClick={handleSaveBrief}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                    isSaved
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-750 dark:text-white'
                  }`}
                  title="Bookmark Briefing text block"
                >
                  {isSaved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5 text-teal-550" />}
                  <span>{isSaved ? 'Saved Brief' : 'Save Brief'}</span>
                </button>

                <button
                  onClick={handleShareBrief}
                  className="p-2 py-2.5 bg-slate-105 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  title="Share Daily Briefing link"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span className="text-xs">Share</span>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs font-mono">
              Diagnostic data loading...
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
