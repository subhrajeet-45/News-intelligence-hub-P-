/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Bookmark, Clock, Copy, Sparkles, AlertCircle, ChevronDown, ChevronUp, Check, Eye, MessageSquare } from 'lucide-react';
import { Article } from '../types';
import { copyTextToClipboard } from '../utils/clipboard';

interface ArticleCardProps {
  key?: string | number;
  article: Article;
  isBookmarked: boolean;
  onSelect: (article: Article) => void;
  onToggleBookmark: (e: React.MouseEvent, articleId: string) => void;
  userId?: string;
  onChat?: (e: React.MouseEvent, article: Article) => void;
}

export default function ArticleCard({
  article,
  isBookmarked,
  onSelect,
  onToggleBookmark,
  userId,
  onChat
}: ArticleCardProps) {
  const [showAiBrief, setShowAiBrief] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await copyTextToClipboard(`${window.location.origin}/articles/${article.id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      // Notify server of share increment
      fetch(`/api/news/articles/${article.id}/share`, { method: 'POST' });
    } catch (err) {
      console.error(err);
    }
  };

  const toggleAiBrief = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowAiBrief(!showAiBrief);
  };

  return (
    <div
      onClick={() => onSelect(article)}
      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden group cursor-pointer hover:border-slate-200 dark:hover:border-slate-700/80 hover:shadow-lg transition-all duration-300 flex flex-col h-full"
    >
      {/* Article Image Header */}
      <div className="relative h-48 sm:h-52 overflow-hidden shrink-0">
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        {/* Transparent Dark overlay on image */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/60 to-transparent" />
        
        {/* Category Tag overlay */}
        <span className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded-lg">
          {article.category}
        </span>

        {/* Floating Save Pin Trigger */}
        <button
          onClick={(e) => onToggleBookmark(e, article.id)}
          className={`absolute top-4 right-4 p-2 rounded-xl backdrop-blur-xs transition-transform active:scale-90 cursor-pointer ${
            isBookmarked
              ? 'bg-teal-500 text-white shadow-md'
              : 'bg-slate-900/60 hover:bg-slate-900/80 text-white border border-white/10'
          }`}
          title={isBookmarked ? 'Remove bookmark' : 'Bookmark for later'}
        >
          <Bookmark className="w-4 h-4 fill-current" />
        </button>
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col justify-between grow">
        <div>
          {/* Headline Metadata stats */}
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono mb-2">
            <span>{article.source}</span>
            <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
            <span>{formatDate(article.publishedAt)}</span>
          </div>

          {/* Story title */}
          <h3 className="text-md font-sans text-slate-900 dark:text-white font-semibold leading-snug group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors duration-200 line-clamp-3">
            {article.title}
          </h3>

          {/* Regular Description summary */}
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-2 line-clamp-2 leading-relaxed">
            {article.summary}
          </p>
        </div>

        {/* Interactive AI Brief and Callouts Panel */}
        <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800/60 flex flex-col gap-3">
          
          <div className="flex items-center justify-between text-xs font-sans">
            {/* Action buttons list */}
            <div className="flex items-center gap-1.5 text-slate-400">
              <Eye className="w-3.5 h-3.5 text-teal-500/80" />
              <span className="text-[11px] font-mono">{(article.views || 0).toLocaleString()} views</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Bookmark status button code */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark(e, article.id);
                }}
                className={`p-1.5 rounded-lg cursor-pointer transition-all duration-150 flex items-center justify-center ${
                  isBookmarked
                    ? 'text-teal-500 bg-teal-50 dark:bg-teal-500/10'
                    : 'text-slate-400 hover:text-slate-705 dark:hover:text-slate-300'
                }`}
                title={isBookmarked ? 'Remove bookmark' : 'Add to bookmarks'}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>

              {/* Copy URL trigger */}
              <button
                onClick={handleShare}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg cursor-pointer transition-colors"
                title="Copy Link"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              {/* RAG LLM Chat trigger */}
              {onChat && (
                <button
                  onClick={(e) => onChat(e, article)}
                  className="flex items-center gap-1 px-2.5 py-1 text-teal-605 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-bold border border-teal-500/10 hover:border-teal-500/30 bg-teal-500/5 hover:bg-teal-500/15 rounded-xl cursor-pointer transition-all duration-150"
                  title="Chat with local LLM (RAG)"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-teal-500" />
                  <span className="text-[11px]">RAG</span>
                </button>
              )}

              {/* Show takeaways preview toggle */}
              <button
                onClick={toggleAiBrief}
                className="flex items-center gap-1 px-2.5 py-1 text-slate-500 dark:text-slate-400 hover:text-teal-500 dark:hover:text-teal-300 font-medium border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all duration-150"
              >
                <Sparkles className="w-3 h-3 text-teal-500 animate-pulse" />
                <span>AI Brief</span>
                {showAiBrief ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* AI Takeaways Panel - Accordion expanding */}
          {showAiBrief && (
            <div className="p-3 bg-teal-500/5 dark:bg-teal-500/10 border border-teal-500/10 rounded-xl space-y-2 animate-in slide-in-from-top-1 fade-in-40 duration-200">
              <div className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-teal-500" />
                <span className="text-[10px] font-mono font-bold text-teal-900 dark:text-teal-300 uppercase tracking-wider">AI Executive Takeaways</span>
              </div>
              <ul className="list-disc pl-3 text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 space-y-1 font-sans">
                {article.takeaways ? (
                  article.takeaways.slice(0, 2).map((takeaway, idx) => (
                    <li key={idx} className="leading-snug">{takeaway}</li>
                  ))
                ) : (
                  <li>Synthesizing real-time analytical vectors...</li>
                )}
              </ul>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
