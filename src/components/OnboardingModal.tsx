/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Check, ChevronRight } from 'lucide-react';
import { User } from '../types';

interface OnboardingModalProps {
  user: User;
  onComplete: (interests: string[]) => void;
}

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

export default function OnboardingModal({ user, onComplete }: OnboardingModalProps) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleInterest = (category: string) => {
    if (selectedInterests.includes(category)) {
      setSelectedInterests(selectedInterests.filter(i => i !== category));
    } else {
      setSelectedInterests([...selectedInterests, category]);
    }
  };

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    if (selectedInterests.length === 0) {
      alert('Please select at least one interest to personalize your feed!');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          interests: selectedInterests
        })
      });
      const data = await response.json();
      if (response.ok) {
        onComplete(selectedInterests);
      } else {
        console.error(data.error);
        onComplete(selectedInterests); // fallback local save
      }
    } catch (err) {
      console.error(err);
      onComplete(selectedInterests); // fallback local save
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="onboarding-overlay" className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div id="onboarding-card" className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transform transition-all duration-300 scale-100">
        
        {/* Header Bar */}
        <div className="bg-linear-to-r from-teal-500 to-indigo-600 p-6 text-white text-center relative">
          <div className="absolute top-4 right-4 bg-white/20 px-3 py-1 rounded-full text-xs font-mono">
            Step {step} of 2
          </div>
          <Sparkles className="w-10 h-10 mx-auto mb-2 text-yellow-300 animate-pulse" />
          <h2 className="text-2xl font-serif font-semibold">Personalize Your Hub</h2>
          <p className="text-teal-50 text-sm mt-1">Hello, {user.name}! Let's build your tailored intelligence feed.</p>
        </div>

        {/* Modal Content */}
        <div className="p-8">
          {step === 1 ? (
            <div className="text-center space-y-4">
              <h3 className="text-lg font-sans font-semibold text-slate-800 dark:text-slate-100">Welcome to News Intelligence Hub</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-md mx-auto">
                We synthesize daily breaking news from real-world publishers and leverage Gemini AI model patterns to distill articles into summaries, fact indices, and key takeaways.
              </p>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl max-w-md mx-auto text-left border border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-mono uppercase tracking-wider text-teal-600 dark:text-teal-400 font-semibold mb-2">What you get:</h4>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> AI-Generated takeaways & summarized briefs</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Fast discovery filtering 10 distinct categories</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Tailored feeds updated by real-time intelligence</li>
                </ul>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-md font-sans font-semibold text-slate-800 dark:text-slate-100 mb-2 text-center">
                Select category channels you want to follow
              </h3>
              <p className="text-xs text-slate-500 text-center mb-6">Choose as many as you like. We prioritize these categories in your home dashboard.</p>
              
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedInterests.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleInterest(cat)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between text-sm transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-900 dark:text-teal-200 shadow-xs'
                          : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <span>{cat}</span>
                      {isSelected ? (
                        <div className="bg-teal-500 text-white rounded-full p-0.5">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-4.5 h-4.5 rounded-full border border-slate-300 dark:border-slate-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleNext}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-teal-500 dark:hover:bg-teal-400 text-white font-sans text-sm font-medium rounded-xl flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50 transition-all duration-200"
          >
            {isSubmitting ? (
              <span>Finalizing Hub...</span>
            ) : step === 2 ? (
              <>
                <span>Get Started</span>
                <Check className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Next Section</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
