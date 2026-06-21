/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Settings, 
  Trash2, 
  Sparkles, 
  History, 
  PieChart as ChartIcon, 
  Bookmark, 
  Compass, 
  Clock, 
  ListOrdered,
  Plus,
  Tv
} from 'lucide-react';
import { User, Article } from '../types';

interface DashboardViewProps {
  user: User;
  onUpdateInterests: (interests: string[]) => void;
  onSelectArticle: (article: Article) => void;
  onToggleBookmark: (e: React.MouseEvent, id: string) => void;
  bookmarkedArticles: Article[];
}

const ALL_INTERESTS = [
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

interface HistoryLog {
  articleId: string;
  title: string;
  category: string;
  viewedAt: string;
  readTimeSeconds: number;
}

interface CategoryStat {
  name: string;
  value: number;
}

export default function DashboardView({
  user,
  onUpdateInterests,
  onSelectArticle,
  onToggleBookmark,
  bookmarkedArticles
}: DashboardViewProps) {
  const [activeMenu, setActiveMenu] = useState<'profile' | 'bookmarks' | 'history' | 'preferences'>('profile');
  const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [totalRead, setTotalRead] = useState(0);
  const [draftInterests, setDraftInterests] = useState<string[]>(user.interests);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Sync draft interests when user props change
    setDraftInterests(user.interests);
  }, [user.interests]);

  useEffect(() => {
    // Fetch reading history logs from API
    fetch(`/api/news/dashboard-history?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.historyLogs) setHistoryLogs(data.historyLogs);
        if (data.categoryStats) setCategoryStats(data.categoryStats);
        if (data.totalArticlesRead !== undefined) setTotalRead(data.totalArticlesRead);
      })
      .catch(err => console.error('Error fetching dashboard log statistics:', err));
  }, [user.id, bookmarkedArticles.length]);

  const handleInterestToggle = (category: string) => {
    if (draftInterests.includes(category)) {
      setDraftInterests(draftInterests.filter(i => i !== category));
    } else {
      setDraftInterests([...draftInterests, category]);
    }
  };

  const handleSaveInterests = async () => {
    if (draftInterests.length === 0) {
      alert('Please select at least one interest representation!');
      return;
    }
    setIsUpdating(true);
    try {
      const response = await fetch('/api/auth/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          interests: draftInterests
        })
      });
      if (response.ok) {
        onUpdateInterests(draftInterests);
        alert('Interests updated successfully!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Compute maximum read count to normalize SVG chart bars
  const maxCategoryWeight = categoryStats.length > 0 
    ? Math.max(...categoryStats.map(s => s.value)) 
    : 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in-50 duration-200">
      
      {/* Dashboard Top Header banner card */}
      <div className="bg-linear-to-br from-slate-900 to-slate-950 dark:from-slate-950 dark:to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-200 dark:border-slate-800 shadow-xl mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center font-sans font-bold text-xl uppercase shadow-inner">
            {user.name.slice(0, 2)}
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-white tracking-tight">{user.name}</h1>
            <p className="text-xs text-slate-400 font-mono mt-1">{user.email} &bull; Joined Hub Reader</p>
          </div>
        </div>

        {/* Statistical Micro-Metrics Cards */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0 w-full md:w-auto">
          <div className="bg-white/5 border border-white/5 px-4 py-3 rounded-2xl flex-1 md:flex-initial">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Articles Viewed</span>
            <span className="text-xl font-bold text-teal-400 font-mono block mt-0.5">{totalRead}</span>
          </div>
          <div className="bg-white/5 border border-white/5 px-4 py-3 rounded-2xl flex-1 md:flex-initial">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Saved Bookmarks</span>
            <span className="text-xl font-bold text-indigo-400 font-mono block mt-0.5">{bookmarkedArticles.length}</span>
          </div>
          <div className="bg-white/5 border border-white/5 px-4 py-3 rounded-2xl flex-1 md:flex-initial">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Interests Met</span>
            <span className="text-xl font-bold text-amber-400 font-mono block mt-0.5">{user.interests.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar Drawer */}
        <div className="space-y-2 lg:col-span-1">
          <button
            onClick={() => setActiveMenu('profile')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors cursor-pointer ${
              activeMenu === 'profile'
                ? 'bg-slate-900 text-white dark:bg-teal-500/20 dark:text-teal-400 border border-transparent dark:border-teal-500/10'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-100 dark:border-slate-800'
            }`}
          >
            <UserIcon className="w-4.5 h-4.5" />
            <span>Profile Overview</span>
          </button>

          <button
            onClick={() => setActiveMenu('bookmarks')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors cursor-pointer ${
              activeMenu === 'bookmarks'
                ? 'bg-slate-900 text-white dark:bg-teal-500/20 dark:text-teal-400 border border-transparent dark:border-teal-500/10'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-100 dark:border-slate-800'
            }`}
          >
            <Bookmark className="w-4.5 h-4.5" />
            <span>Saved Bookmarks ({bookmarkedArticles.length})</span>
          </button>

          <button
            onClick={() => setActiveMenu('history')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors cursor-pointer ${
              activeMenu === 'history'
                ? 'bg-slate-900 text-white dark:bg-teal-500/20 dark:text-teal-400 border border-transparent dark:border-teal-500/10'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-100 dark:border-slate-800'
            }`}
          >
            <History className="w-4.5 h-4.5" />
            <span>Reading History Logs</span>
          </button>

          <button
            onClick={() => setActiveMenu('preferences')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors cursor-pointer ${
              activeMenu === 'preferences'
                ? 'bg-slate-900 text-white dark:bg-teal-500/20 dark:text-teal-400 border border-transparent dark:border-teal-500/10'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-100 dark:border-slate-800'
            }`}
          >
            <Settings className="w-4.5 h-4.5" />
            <span>Interest Channels</span>
          </button>
        </div>

        {/* Dashboard Main Visual Content window */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 sm:p-8 rounded-3xl min-h-[400px] shadow-sm">
            
            {/* View 1: Profile Overview with Analytics */}
            {activeMenu === 'profile' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white">Profile Overview</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Unified channel analytics, favorite topics, and user diagnostic profile.</p>
                </div>

                {/* Grid layout containing Bento Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Category Distribution SVG Chart */}
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                    <div className="flex items-center gap-2 mb-4">
                      <ChartIcon className="w-4 h-4 text-teal-500" />
                      <h4 className="text-sm font-sans font-semibold text-slate-800 dark:text-slate-200">Category Distribution</h4>
                    </div>

                    {categoryStats.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
                        <Compass className="w-8 h-8 text-slate-300 dark:text-slate-700 stroke-[1.5] mb-2 animate-bounce" />
                        <p className="text-xs">No analytics compiled. Start reading articles across various categories!</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {categoryStats.map((stat, idx) => {
                          const percentage = Math.round((stat.value / totalRead) * 100);
                          const barWidthPercent = (stat.value / maxCategoryWeight) * 100;
                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-medium text-slate-700 dark:text-slate-300">{stat.name}</span>
                                <span className="text-slate-500 font-mono">{stat.value} read ({percentage}%)</span>
                              </div>
                              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-linear-to-r from-teal-500 to-indigo-500 rounded-full transition-all duration-500"
                                  style={{ width: `${barWidthPercent}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Interests Panel list */}
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/60 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-4 h-4 text-indigo-500" />
                        <h4 className="text-sm font-sans font-semibold text-slate-800 dark:text-slate-200">My Interested Channels</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {user.interests.map((it, idx) => (
                          <span key={idx} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 text-xs px-3 py-1.5 rounded-xl font-medium shadow-xs">
                            {it}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveMenu('preferences')}
                      className="mt-6 w-full py-2.5 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold text-center cursor-pointer transition-colors"
                    >
                      Manage Category Channels
                    </button>
                  </div>

                </div>

                {/* Profile contact Details Panel */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-teal-600 dark:text-teal-400 font-semibold mb-3">Diagnostic Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block font-mono">User Name</span>
                      <strong className="text-slate-700 dark:text-slate-200 font-medium block mt-0.5">{user.name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-mono">Security Node</span>
                      <strong className="text-slate-700 dark:text-slate-200 font-medium block mt-0.5">Email-Auth Node</strong>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* View 2: Saved Bookmarks */}
            {activeMenu === 'bookmarks' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white">Saved Bookmarks</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Discover summaries, insights, and full taking points on saved sheets.</p>
                </div>

                {bookmarkedArticles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                    <Bookmark className="w-12 h-12 text-slate-300 dark:text-slate-700 stroke-[1.2] mb-3 animate-pulse" />
                    <h4 className="text-sm font-sans font-semibold text-slate-700 dark:text-slate-300">Your Bookmarked Drawer is Empty</h4>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">Articles you save using the pin buttons across categories will accumulate here of easy offline retrieval.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {bookmarkedArticles.map((art) => (
                      <div
                        key={art.id}
                        onClick={() => onSelectArticle(art)}
                        className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-800/20 shadow-xs flex gap-3 items-start cursor-pointer group"
                      >
                        <img
                          src={art.imageUrl}
                          alt={art.title}
                          className="w-16 h-16 rounded-xl object-cover shrink-0 select-none"
                        />
                        <div className="space-y-1 overflow-hidden">
                          <span className="bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-md">
                            {art.category}
                          </span>
                          <h4 className="text-xs font-sans font-semibold text-slate-800 dark:text-slate-100 leading-snug truncate group-hover:text-teal-500 transition-colors">
                            {art.title}
                          </h4>
                          <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 font-mono">
                            <span>{art.source}</span>
                            <button
                              onClick={(e) => onToggleBookmark(e, art.id)}
                              className="text-rose-600 hover:text-rose-700 cursor-pointer p-1 rounded-sm"
                              title="Delete bookmark"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* View 3: Reading Logs */}
            {activeMenu === 'history' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white">Reading History Logs</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Audit trail mapping your viewed intelligence briefings.</p>
                </div>

                {historyLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                    <History className="w-12 h-12 text-slate-300 dark:text-slate-700 stroke-[1.2] mb-3 animate-pulse" />
                    <h4 className="text-sm font-sans font-semibold text-slate-750">No Reading Trails Processed</h4>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">Opening details and summaries of categories compiles logs onto dynamic telemetry screens here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-mono font-medium pb-2 uppercase tracking-wide">
                          <th className="py-2.5">Article Headline</th>
                          <th className="py-2.5">Category</th>
                          <th className="py-2.5 text-right">Viewed At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60 font-sans">
                        {historyLogs.map((log, idx) => (
                          <tr
                            key={idx}
                            onClick={() => {
                              const articles = bookmarkedArticles; // fallback mock reference container
                              // Trigger detail modal via simple fetch
                              fetch(`/api/news/articles/${log.articleId}`)
                                .then(res => res.json())
                                .then(data => {
                                  if (data.article) onSelectArticle(data.article);
                                });
                            }}
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                          >
                            <td className="py-3 font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 max-w-[280px]">
                              {log.title}
                            </td>
                            <td className="py-3">
                              <span className="bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 font-mono text-[10px] px-2 py-0.5 rounded-sm">
                                {log.category}
                              </span>
                            </td>
                            <td className="py-3 text-right text-slate-400 font-mono">
                              {formatTime(log.viewedAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* View 4: Interest Channels Management */}
            {activeMenu === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white">Interest Channels</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Modify your followed tags and categories anytime to tailor recommended feeds instantly.</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pb-6">
                  {ALL_INTERESTS.map((cat) => {
                    const isSelected = draftInterests.includes(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => handleInterestToggle(cat)}
                        className={`p-3.5 rounded-xl border text-left flex items-center justify-between text-xs sm:text-sm cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-teal-50 dark:bg-teal-950/30 border-teal-500 text-teal-950 dark:text-teal-300 font-medium'
                            : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span>{cat}</span>
                        {isSelected ? (
                          <div className="bg-teal-500 text-white rounded-full p-0.5">
                            <Plus className="w-3 h-3 rotate-45" />
                          </div>
                        ) : (
                          <Plus className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    onClick={handleSaveInterests}
                    disabled={isUpdating}
                    className="px-6 py-2.5 bg-slate-900 dark:bg-teal-500 hover:bg-slate-800 dark:hover:bg-teal-450 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50 transition-all active:scale-95 duration-100"
                  >
                    {isUpdating ? 'Saving Channels...' : 'Update Channels'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
