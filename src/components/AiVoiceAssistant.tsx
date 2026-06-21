/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  X, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  CornerDownLeft, 
  MessageSquare, 
  History,
  Trash2,
  Play,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Article } from '../types';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

interface AiVoiceAssistantProps {
  user: User | null;
  currentArticleId: string | null;
  activeCategory: string | null;
  onExecuteAction: (action: string, param?: string) => void;
}

export default function AiVoiceAssistant({
  user,
  currentArticleId,
  activeCategory,
  onExecuteAction
}: AiVoiceAssistantProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: "Hello! I'm your News Intelligence voice assistant. Click the microphone below or ask me questions like 'Summarize today's news', 'Explain this article simply', or 'Open Sports channel'!",
      timestamp: new Date()
    }
  ]);
  const [typedInput, setTypedInput] = useState<string>('');
  
  // Web Speech API interfaces
  const [recognition, setRecognition] = useState<any | null>(null);
  const [speechSynthesisSupported, setSpeechSynthesisSupported] = useState<boolean>(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const conversationEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // 1. Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.lang = 'en-US';
      rec.interimResults = false;

      rec.onstart = () => {
        setVoiceState('listening');
      };

      rec.onresult = async (event: any) => {
        const resultText = event.results[0][0].transcript;
        if (resultText && resultText.trim()) {
          handleUserCommand(resultText);
        }
      };

      rec.onerror = (e: any) => {
        console.error('Speech recognition error:', e);
        setVoiceState('idle');
        
        let errorMsg = "I couldn't hear any speech. Please check your mic and try again!";
        if (e.error === 'not-allowed') {
          errorMsg = "Microphone access was blocked or denied. Please ensure you have allowed microphone permissions in your browser or try launching the app in a new tab using the top-right button!";
        } else if (e.error === 'network') {
          errorMsg = "A network error occurred during speech translation. Please try again.";
        } else if (e.error === 'no-speech') {
          errorMsg = "No audio input was detected. Speak clearly into your microphone after clicking the mic button!";
        }
        
        setMessages(prev => [...prev, {
          sender: 'assistant',
          text: `⚠️ Voice Input Issue: ${errorMsg}`,
          timestamp: new Date()
        }]);
      };

      rec.onend = () => {
        // Only reset back to idle if we were in listening state and didn't transition to thinking
        setVoiceState(prev => prev === 'listening' ? 'idle' : prev);
      };

      setRecognition(rec);
    }

    // 2. Initialize Speech Synthesis
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
      setSpeechSynthesisSupported(true);
    }
  }, []);

  // Auto-scroll messaging panel
  useEffect(() => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, voiceState]);

  const toggleAssistant = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      silenceSpeech();
    }
  };

  const startListening = () => {
    if (!recognition) {
      alert('Speech Recognition is not fully supported in this browser context, or access is blocked inside iframe environments. Feel free to use the typing input panel!');
      return;
    }
    silenceSpeech();
    try {
      recognition.start();
    } catch (e) {
      console.warn('Recognition already active:', e);
    }
  };

  const silenceSpeech = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (voiceState === 'speaking') {
      setVoiceState('idle');
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedInput.trim()) return;
    const text = typedInput;
    setTypedInput('');
    handleUserCommand(text);
  };

  const handleUserCommand = async (commandText: string) => {
    // 1. Log query
    setMessages(prev => [...prev, {
      sender: 'user',
      text: commandText,
      timestamp: new Date()
    }]);

    setVoiceState('thinking');
    silenceSpeech();

    try {
      // 2. Invoke server-side voice assistant endpoint
      const response = await fetch('/api/news/voice-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: commandText,
          currentArticleId: currentArticleId || undefined,
          activeCategory: activeCategory || undefined,
          userId: user?.id || undefined
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // 3. Log Reply
        setMessages(prev => [...prev, {
          sender: 'assistant',
          text: data.reply || "I processed your request, but returned an empty response.",
          timestamp: new Date()
        }]);

        // 4. Synthesize Audio spoken response
        if (data.speak && speechSynthesisSupported && synthRef.current) {
          setVoiceState('speaking');
          const utterance = new SpeechSynthesisUtterance(data.speak);
          activeUtteranceRef.current = utterance;
          
          utterance.onend = () => {
            setVoiceState('idle');
          };
          utterance.onerror = () => {
            setVoiceState('idle');
          };

          synthRef.current.speak(utterance);
        } else {
          setVoiceState('idle');
        }

        // 5. Fire Client-Side Navigation/Playback Actions if declared
        if (data.action && data.action !== 'NONE') {
          setTimeout(() => {
            onExecuteAction(data.action, data.actionParam);
          }, 600);
        }

      } else {
        throw new Error('Voice endpoint failed');
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        sender: 'assistant',
        text: "I experienced difficulty connecting to our AI server models. Let me know if you want to try again of explore categories.",
        timestamp: new Date()
      }]);
      setVoiceState('idle');
    }
  };

  const clearLogs = () => {
    silenceSpeech();
    setMessages([
      {
        sender: 'assistant',
        text: "Conversation cleared. Say something to start over!",
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div id="voice-assistant-root" className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 select-none">
      
      {/* Floating chatbot Panel drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-80 h-[460px] sm:w-[350px] sm:h-[500px] bg-slate-900/90 dark:bg-slate-950/95 border border-slate-700/60 rounded-3xl overflow-hidden shadow-2xl flex flex-col backdrop-blur-xl"
          >
            {/* Drawer Header */}
            <div className="p-4 bg-linear-to-r from-teal-500/20 to-indigo-500/20 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-8 h-8 rounded-xl bg-teal-500 text-slate-950 flex items-center justify-center font-bold">
                    <Mic className="w-4.5 h-4.5 animate-pulse" />
                  </div>
                  {voiceState !== 'idle' && (
                    <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-teal-500"></span>
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">AI Voice Assistant</h3>
                  <span className="text-[10px] font-mono text-teal-400 font-bold uppercase tracking-wider">
                    {voiceState === 'idle' && 'Online • Idle'}
                    {voiceState === 'listening' && 'Listening...'}
                    {voiceState === 'thinking' && 'Processing intent...'}
                    {voiceState === 'speaking' && 'Speaking audio response'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5">
                <button
                  onClick={clearLogs}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Clear conversation log"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={toggleAssistant}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-405 hover:text-white transition-colors cursor-pointer"
                  title="Close assistant panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Conversation Log Grid */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar bg-slate-950/40">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed font-sans ${
                      msg.sender === 'user'
                        ? 'bg-teal-500 text-slate-950 font-medium rounded-tr-xs'
                        : 'bg-slate-800/80 text-slate-100 border border-slate-700/30 rounded-tl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Loader Wave Animation based on Active voice state */}
              {voiceState === 'listening' && (
                <div className="flex gap-1 justify-start items-center p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/10 max-w-[60%]">
                  <span className="text-[10px] text-teal-400 font-mono uppercase tracking-wider mr-2 font-bold animate-pulse">listening</span>
                  <div className="h-4 w-1 bg-teal-400 rounded-full animate-[bounce_0.8s_infinite_100ms]" />
                  <div className="h-6 w-1 bg-teal-400 rounded-full animate-[bounce_0.8s_infinite_200ms]" />
                  <div className="h-8 w-1 bg-teal-400 rounded-full animate-[bounce_0.8s_infinite_300ms]" />
                  <div className="h-5 w-1 bg-teal-400 rounded-full animate-[bounce_0.8s_infinite_400ms]" />
                </div>
              )}

              {voiceState === 'thinking' && (
                <div className="flex gap-1.5 items-center justify-start p-3 bg-slate-800/40 rounded-2xl max-w-[50%]">
                  <span className="text-[10px] text-slate-400 font-mono">Thinking</span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              )}

              {voiceState === 'speaking' && (
                <div className="flex items-center gap-1.5 justify-start p-3 bg-indigo-500/10 border border-indigo-500/10 rounded-2xl max-w-[60%]">
                  <Volume2 className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  <span className="text-[10px] text-indigo-400 font-mono tracking-wide uppercase font-bold animate-pulse">Synthesizing audio</span>
                </div>
              )}

              <div ref={conversationEndRef} />
            </div>

            {/* Panel Input Fallback Form + Mic Action bar */}
            <div className="p-4 bg-slate-900 border-t border-slate-800/80 space-y-3">
              <form onSubmit={handleTextSubmit} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Ask or type command here..."
                  value={typedInput}
                  onChange={(e) => setTypedInput(e.target.value)}
                  disabled={voiceState === 'thinking' || voiceState === 'listening'}
                  className="flex-1 bg-slate-950 text-xs text-white border border-slate-800/90 rounded-xl px-3.5 py-2.5 outline-hidden focus:border-teal-500/60 placeholder-slate-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!typedInput.trim() || voiceState === 'thinking'}
                  className="p-2.5 rounded-xl bg-teal-500 hover:bg-teal-450 disabled:bg-slate-800 text-slate-950 font-bold transition-all disabled:text-slate-600 disabled:opacity-40 cursor-pointer"
                >
                  <CornerDownLeft className="w-4 h-4" />
                </button>
              </form>

              {/* Floating Voice wave controller */}
              <div className="flex items-center justify-between gap-4 pt-1.5">
                <span className="text-[10px] font-mono text-slate-500">
                  {voiceState === 'idle' && 'Click Mic to speak'}
                  {voiceState === 'listening' && 'Say something now!'}
                  {voiceState === 'thinking' && 'AI core querying...'}
                  {voiceState === 'speaking' && 'Click mic to mock interrupt'}
                </span>

                <div className="flex items-center gap-2">
                  {voiceState === 'speaking' && (
                    <button
                      onClick={silenceSpeech}
                      className="p-1.5 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-colors"
                      title="Silence acoustic speech"
                    >
                      <VolumeX className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={voiceState === 'listening' ? () => recognition?.stop() : startListening}
                    className={`h-11 w-11 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-90 shadow-md ${
                      voiceState === 'listening'
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-teal-500 text-slate-950 hover:bg-teal-400'
                    }`}
                  >
                    {voiceState === 'listening' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating launcher indicator sphere */}
      <motion.button
        onClick={toggleAssistant}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`h-14 w-14 rounded-full flex items-center justify-center cursor-pointer shadow-xl relative transition-transform ${
          isOpen
            ? 'bg-slate-900 text-teal-400 dark:bg-teal-500 dark:text-slate-950 border-2 border-slate-705'
            : 'bg-slate-900 border border-slate-800/80 dark:bg-slate-900 dark:border-slate-850 shadow-teal-500/10 hover:border-teal-500 text-teal-400'
        }`}
        title="Trigger AI Voice Assistant"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MicOff className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -45, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center"
            >
              <Mic className="w-6 h-6" />
              {voiceState !== 'idle' && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-teal-500"></span>
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

    </div>
  );
}
