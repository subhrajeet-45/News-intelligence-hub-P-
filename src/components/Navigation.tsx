/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  TrendingUp, 
  Bookmark, 
  User as UserIcon, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Cpu, 
  LogOut, 
  Search, 
  Home,
  Activity,
  MessageSquare,
  ChevronDown
} from 'lucide-react';
import { User } from '../types';

interface NavigationProps {
  user: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  onLogout: () => void;
  onOpenAuth: () => void;
}

export default function Navigation({
  user,
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  onLogout,
  onOpenAuth
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [useOllama, setUseOllama] = useState<boolean>(() => {
    return localStorage.getItem('news_intel_use_ollama') === 'true';
  });

  useEffect(() => {
    const handleStorage = () => {
      setUseOllama(localStorage.getItem('news_intel_use_ollama') === 'true');
    };
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(handleStorage, 1000);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'live-hub', label: 'Live Intel', icon: Activity },
    { id: 'ai-chat', label: 'AI Chat', icon: MessageSquare },
    { id: 'categories', label: 'Categories', icon: Compass },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
    { id: 'dashboard', label: 'Dashboard', icon: UserIcon },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200/55 dark:border-slate-800/85 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-[72px]">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => handleTabClick('home')}>
            <div className="bg-gradient-to-tr from-indigo-650 to-blue-500 p-2 rounded-xl text-white shadow-xs flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:rotate-3 shadow-indigo-500/10">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-md sm:text-lg font-sans font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center">
                News Hub
                <span className="bg-indigo-550/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300 font-sans font-bold text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full ml-2 border border-indigo-550/10 hidden sm:inline-flex">
                  Intelligence
                </span>
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1.5 items-center">
            {navigationItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 shadow-xs border border-indigo-500/10'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 hover:text-indigo-650 dark:hover:text-indigo-400'
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Controls Panel */}
          <div className="hidden md:flex items-center gap-3">
            {/* Model Switcher Toggle Pill */}
            <div className="flex bg-slate-100/80 dark:bg-slate-800/60 p-1 rounded-xl items-center border border-slate-205 dark:border-slate-750">
              <button
                onClick={() => {
                  localStorage.setItem('news_intel_use_ollama', 'false');
                  setUseOllama(false);
                  window.dispatchEvent(new Event('storage'));
                }}
                className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  !useOllama
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-300 shadow-xs border border-slate-100 dark:border-slate-800/50'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
                title="Use Google Gemini Cloud"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${!useOllama ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-650'}`} />
                <span>Cloud API</span>
              </button>
              <button
                onClick={() => {
                  localStorage.setItem('news_intel_use_ollama', 'true');
                  setUseOllama(true);
                  window.dispatchEvent(new Event('storage'));
                }}
                className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  useOllama
                    ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs border border-slate-100 dark:border-slate-800/50'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
                title="Use Ollama Local LLM"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${useOllama ? 'bg-teal-500 animate-pulse' : 'bg-slate-350 dark:bg-slate-650'}`} />
                <span>Local AI</span>
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-amber-300 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-850 cursor-pointer transition-all duration-200 active:scale-95 border border-transparent hover:border-slate-200/50 dark:hover:border-slate-800/60"
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* User Dropdown Profile Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-205 dark:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all cursor-pointer text-left shadow-xs"
                >
                  <div className="w-8 h-8 rounded-full bg-linear-to-tr from-teal-400 to-indigo-500 text-white flex items-center justify-center font-sans font-semibold text-xs shadow-xs uppercase">
                    {user.name.slice(0, 2)}
                  </div>
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold max-w-[100px] truncate pr-1">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xl py-2 z-50 animate-in fade-in-50 slide-in-from-top-1">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700/50">
                      <p className="text-xs text-slate-400 uppercase font-mono tracking-wider">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate mt-0.5">{user.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 font-mono">{user.email}</p>
                    </div>
                    
                    <button
                      onClick={() => handleTabClick('dashboard')}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>My Dashboard</span>
                    </button>
                    
                    <button
                      onClick={() => handleTabClick('bookmarks')}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                    >
                      <Bookmark className="w-4 h-4 text-slate-400" />
                      <span>My Saved Pins</span>
                    </button>

                    <div className="border-t border-slate-100 dark:border-slate-700/50 my-1" />

                    <button
                      onClick={() => {
                        onLogout();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-teal-500 dark:hover:bg-teal-400 text-white rounded-xl text-xs font-semibold shadow-md cursor-pointer transition-all active:scale-95 duration-150"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Hamburger Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 text-slate-500 dark:text-slate-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 py-3 px-4 space-y-2 animate-in fade-in-50 duration-150">
          {navigationItems.map((item) => {
            const IconComp = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-teal-500 dark:text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <IconComp className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
          
          <div className="border-t border-slate-100 dark:border-slate-800 my-2 pt-2" />

          {user ? (
            <div className="space-y-2">
              <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <p className="text-xs text-slate-400 uppercase font-mono">My Account</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">{user.name}</p>
              </div>
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-rose-600 dark:text-rose-400 font-medium text-sm rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/25"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                onOpenAuth();
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 bg-slate-900 dark:bg-teal-500 text-white font-semibold text-center rounded-xl text-sm"
            >
              Sign In to Profile
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
