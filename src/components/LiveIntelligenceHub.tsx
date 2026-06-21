/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  TrendingUp, 
  AlertCircle, 
  RefreshCw, 
  BarChart2, 
  Calendar,
  Sparkles,
  PieChart as PieIcon,
  Rss,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { Article } from '../types';

interface LiveIntelligenceHubProps {
  onSelectArticle: (article: Article) => void;
}

interface SentimentData {
  name: string;
  value: number;
  color: string;
}

interface TimelineItem {
  id: string;
  time: string;
  category: string;
  headline: string;
  impact: string;
}

interface AiAnalysis {
  title: string;
  category: string;
  source: string;
  whatHappened: string;
  whyItMatters: string;
  impact: string;
  takeaways: string[];
}

export default function LiveIntelligenceHub({ onSelectArticle }: LiveIntelligenceHubProps) {
  const [countdown, setCountdown] = useState<number>(30);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // States for server fetched metrics
  const [sentiment, setSentiment] = useState<{ positive: number; neutral: number; negative: number }>({ positive: 50, neutral: 35, negative: 15 });
  const [velocity, setVelocity] = useState<{ mentions: number; sources: number; growth: number }>({ mentions: 0, sources: 0, growth: 0 });
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis | null>(null);

  // Velocity Chart data
  const [velocityData, setVelocityData] = useState<{ time: string; mentions: number }[]>([]);

  useEffect(() => {
    fetchMetrics();
    
    // Set periodic refresh countdown ticker
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          fetchMetrics();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/news/intelligence-hub');
      if (res.ok) {
        const data = await res.json();
        
        if (data.sentiment) setSentiment(data.sentiment);
        if (data.velocity) {
          setVelocity(data.velocity);
          
          // Generate artificial timeline points for area charts based on actual counts
          const now = new Date();
          const points = Array.from({ length: 6 }).map((_, idx) => {
            const minutesAgo = (5 - idx) * 5;
            const timeStr = new Date(now.getTime() - minutesAgo * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            return {
              time: timeStr,
              mentions: Math.round(data.velocity.mentions * (0.8 + Math.random() * 0.4))
            };
          });
          setVelocityData(points);
        }
        if (data.timeline) setTimeline(data.timeline);
        if (data.aiAnalysis) setAiAnalysis(data.aiAnalysis);

        setLastUpdated(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (err) {
      console.error('Failed to update live news metrics:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const sentimentChartData: SentimentData[] = [
    { name: 'Positive', value: sentiment.positive, color: '#14b8a6' }, // teal-500
    { name: 'Neutral', value: sentiment.neutral, color: '#6366f1' },  // indigo-500
    { name: 'Negative', value: sentiment.negative, color: '#f43f5e' }  // rose-500
  ];

  return (
    <div id="live-intelligence-hub-tab" className="space-y-8 py-4 animate-in fade-in-50 duration-200">
      
      {/* 🟢 Live header section banner */}
      <div className="bg-linear-to-r from-teal-900/40 via-indigo-950/30 to-slate-950/60 border border-teal-500/10 p-5 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0 flex items-center justify-center">
            <span className="absolute flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
            <div className="w-10 h-10 rounded-2xl bg-rose-505/10 border border-rose-500/20 text-rose-500 flex items-center justify-center font-bold uppercase ml-4 text-[10px] font-mono tracking-widest pl-0.5">
              LIVE
            </div>
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Live News Intel Center</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Aggregated real-time metrics, automated story semantic analyzers, and velocity diagnostic telemetry.
            </p>
          </div>
        </div>

        {/* Refresh tracker controls */}
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto select-none">
          <div className="bg-white/5 border border-white/5 dark:bg-slate-900/60 dark:border-slate-800 px-3.5 py-2 rounded-xl flex items-center gap-2.5">
            <div className="relative w-4 h-4 flex items-center justify-center">
              {/* Circular progress simulated countdown */}
              <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Refresh in <strong className="text-teal-400 font-semibold">{countdown}s</strong>
            </span>
          </div>

          <button
            onClick={fetchMetrics}
            disabled={isRefreshing}
            className="p-2 bg-slate-900 hover:bg-slate-800 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-950 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            title="Force refresh index"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 🔴 Breaking Live Ticker bar */}
      {timeline.length > 0 && (
        <div className="relative bg-slate-900 text-white text-xs select-none rounded-2xl h-10 overflow-hidden flex items-center border border-slate-800">
          <div className="absolute left-0 z-10 bg-linear-to-r from-rose-600 to-rose-700 font-mono text-[10px] font-bold text-white uppercase tracking-widest h-full px-4 flex items-center shadow-md grow-0 shrink-0">
            Ticker Alert
          </div>
          <div className="w-full flex whitespace-nowrap overflow-hidden">
            <div className="animate-[marquee_25s_linear_infinite] flex gap-12 pl-36 font-semibold font-sans tracking-wide shrink-0">
              {timeline.map((item, idx) => (
                <span key={idx} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 bg-rose-500 rounded-full animate-pulse" />
                  <span className="text-slate-350">{item.time} &bull;</span>
                  <span className="text-white hover:underline cursor-pointer">{item.headline}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grid container: Sentiment donut, news velocity line chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Sentiment Analysis card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150/40 dark:border-slate-800/80 p-6 rounded-3xl flex flex-col justify-between min-h-[300px] shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <PieIcon className="w-4.5 h-4.5 text-teal-500" />
              <h3 className="text-md font-sans font-bold text-slate-800 dark:text-slate-200">System Sentiment Profile</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed font-sans">
              Dynamic real-time NLP classification of headlines mapping optimism indices.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            
            {/* Recharts PieChart container */}
            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {sentimentChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: 10, border: 'none', background: '#0f172a', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Overlay center label inside donut */}
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-serif font-black text-slate-900 dark:text-white leading-none">
                  {sentiment.positive}%
                </span>
                <span className="text-[9px] font-mono font-bold text-teal-400 uppercase tracking-widest mt-0.5">Optimism</span>
              </div>
            </div>

            {/* Custom styled labels legends column */}
            <div className="space-y-3.5">
              {sentimentChartData.map((lbl, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800/40">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: lbl.color }} />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{lbl.name}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">{lbl.value}%</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* News Velocity Diagnostic Analytics */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150/40 dark:border-slate-800/80 p-6 rounded-3xl flex flex-col justify-between min-h-[300px] shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4.5 h-4.5 text-indigo-500" />
              <h3 className="text-md font-sans font-bold text-slate-800 dark:text-slate-200">Mention Velocity Index</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed font-sans">
              Cumulative citations across verified feeds compiled over continuous time arrays.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 my-3">
            <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/50 p-3 rounded-2xl text-center">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Total Citations</span>
              <span className="text-md sm:text-lg font-bold text-slate-800 dark:text-white font-mono block mt-0.5">{(velocity.mentions || 0).toLocaleString()}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/50 p-3 rounded-2xl text-center">
              <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">Active Sources</span>
              <span className="text-md sm:text-lg font-bold text-indigo-400 font-mono block mt-0.5">{velocity.sources}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/50 p-3 rounded-2xl text-center border-l-teal-500 border-l-2">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Hour velocity</span>
              <span className="text-md sm:text-lg font-bold text-teal-400 font-mono block mt-0.5">+{velocity.growth}%</span>
            </div>
          </div>

          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocityData}>
                <defs>
                  <linearGradient id="colorMentions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="mentions" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorMentions)" />
                <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8, background: '#0f172a', border: 'none', color: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Grid container: AI Analysis box & Event timeline view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Section B: AI Executive Deep Analysis */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-150/40 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-400 animate-pulse" />
              <h3 className="text-sm sm:text-md font-serif font-bold text-slate-900 dark:text-white">AI Real-time Story Analyzer</h3>
            </div>
            {aiAnalysis && (
              <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                {aiAnalysis.category}
              </span>
            )}
          </div>

          {aiAnalysis ? (
            <div className="space-y-4 font-sans text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400">Current Lead Headline Analysis</span>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 mt-0.5">
                  <span>{aiAnalysis.title}</span>
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/65 rounded-2xl">
                  <h5 className="font-mono text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase">What Happened</h5>
                  <p className="text-slate-650 dark:text-slate-400 text-[11px] leading-relaxed mt-1">{aiAnalysis.whatHappened}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/65 rounded-2xl">
                  <h5 className="font-mono text-[10px] font-bold text-indigo-500 uppercase">Why It Matters</h5>
                  <p className="text-slate-650 dark:text-slate-400 text-[11px] leading-relaxed mt-1">{aiAnalysis.whyItMatters}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/65 rounded-2xl">
                  <h5 className="font-mono text-[10px] font-bold text-emerald-500 uppercase">Potential Impact</h5>
                  <p className="text-slate-650 dark:text-slate-400 text-[11px] leading-relaxed mt-1">{aiAnalysis.impact}</p>
                </div>
              </div>

              {/* Bullet takeaways */}
              <div className="space-y-2 pt-2 border-t border-slate-50 dark:border-slate-800/60">
                <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest block">AI Editorial Takeaways</span>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-350 text-[11px] sm:text-xs">
                  {aiAnalysis.takeaways.map((take, idx) => (
                    <li key={idx} className="leading-normal">{take}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs font-mono">
              Generating lead analysis...
            </div>
          )}
        </div>

        {/* Section E: Dynamic Event Timeline View */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-150/40 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-50 dark:border-slate-800">
            <Calendar className="w-4.5 h-4.5 text-indigo-500" />
            <h3 className="text-sm font-serif font-bold text-slate-900 dark:text-white">Chronological event chain</h3>
          </div>

          {timeline.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-mono">
              Standby mapping event timeline...
            </div>
          ) : (
            <div className="relative pl-4 border-l border-slate-100 dark:border-slate-800 space-y-5">
              {timeline.map((item, idx) => (
                <div key={item.id || idx} className="relative group">
                  {/* Timeline point indicator */}
                  <span className="absolute -left-[20px] top-1 h-3 w-3 rounded-full border-2 border-indigo-500 bg-white dark:bg-slate-950 group-hover:scale-125 transition-transform" />
                  
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 text-[10px] font-mono leading-none">
                      <span className="text-indigo-400 font-bold">{item.time}</span>
                      <span className="text-slate-400 dark:text-slate-550">({item.category})</span>
                    </div>
                    <h4 
                      className="text-xs font-sans font-bold text-slate-800 dark:text-slate-250 leading-snug hover:text-teal-500 cursor-pointer pt-0.5 transition-colors"
                      onClick={() => {
                        // Look up full article by checking timeline or custom event trigger
                        fetch(`/api/news/articles/${item.id}`)
                          .then(res => res.json())
                          .then(data => {
                            if (data.article) onSelectArticle(data.article);
                          });
                      }}
                    >
                      {item.headline}
                    </h4>
                    <p className="text-[10px] text-slate-500 leading-normal">{item.impact}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
