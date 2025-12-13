"use client";

import { useState } from 'react';

export default function InteractivePracticeDemo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div 
        className="bg-white rounded-2xl overflow-hidden shadow-lg border border-[var(--wrife-border)] hover:shadow-xl transition-all cursor-pointer group"
        onClick={() => setIsOpen(true)}
      >
        <div className="relative h-48 bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 text-center text-white">
            <div className="text-5xl mb-2">🎮</div>
            <div className="text-sm font-medium opacity-90">20 Interactive Activities</div>
          </div>
          <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-medium">
            Try It Free
          </div>
        </div>
        <div className="p-5">
          <h3 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2 group-hover:text-green-600 transition-colors">
            Interactive Practice
          </h3>
          <p className="text-sm text-[var(--wrife-text-muted)] mb-3">
            Lesson 11: Subject, Verb & Object - 20 progressive activities that build grammar skills step-by-step.
          </p>
          <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
            <span>Click to Try</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
          <div 
            className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-green-500 to-green-600 text-white">
              <div>
                <h2 className="text-xl font-bold">Lesson 11: Interactive Practice</h2>
                <p className="text-sm opacity-90">Subject, Main Verb and Object - 20 Activities</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <iframe 
              src="/demo-assets/L11_Interactive_Practice.html"
              className="w-full h-[calc(100%-72px)]"
              title="Interactive Practice Demo"
            />
          </div>
        </div>
      )}
    </>
  );
}
