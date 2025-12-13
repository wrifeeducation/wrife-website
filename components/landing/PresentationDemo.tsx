"use client";

import { useState } from 'react';

const slides = [
  {
    title: "Lesson 11",
    subtitle: "Subject, Main Verb and Object",
    content: "Learning Objective: I can identify the subject, main verb and object in sentences.",
    bg: "from-purple-500 to-purple-600"
  },
  {
    title: "What is a Subject?",
    subtitle: "The WHO or WHAT",
    content: "The subject is the person, animal, or thing that does the action in a sentence.",
    example: "The cows were eating hay.",
    highlight: "The cows",
    bg: "from-blue-500 to-blue-600"
  },
  {
    title: "What is a Verb?",
    subtitle: "The ACTION Word",
    content: "The verb tells us what the subject does. It's the action in the sentence.",
    example: "Mr. Brown met us at the gate.",
    highlight: "met",
    bg: "from-red-500 to-red-600"
  },
  {
    title: "What is an Object?",
    subtitle: "RECEIVES the Action",
    content: "The object is what or who receives the action of the verb.",
    example: "We saw three cows.",
    highlight: "three cows",
    bg: "from-purple-600 to-pink-500"
  },
  {
    title: "The Sentence Formula",
    subtitle: "Subject + Verb + Object",
    content: "Every complete sentence follows this pattern. Let's practice!",
    example: "The farmer fed the animals.",
    bg: "from-green-500 to-teal-500"
  }
];

export default function PresentationDemo() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1));
  };

  const prevSlide = () => {
    setCurrentSlide(prev => Math.max(prev - 1, 0));
  };

  const slide = slides[currentSlide];

  return (
    <>
      <div 
        className="bg-white rounded-2xl overflow-hidden shadow-lg border border-[var(--wrife-border)] hover:shadow-xl transition-all cursor-pointer group"
        onClick={() => { setIsOpen(true); setCurrentSlide(0); }}
      >
        <div className="relative h-48 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 text-center text-white">
            <div className="text-5xl mb-2">📽️</div>
            <div className="text-sm font-medium opacity-90">20 Classroom Slides</div>
          </div>
          <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-medium">
            Demo
          </div>
        </div>
        <div className="p-5">
          <h3 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2 group-hover:text-purple-600 transition-colors">
            Classroom Presentation
          </h3>
          <p className="text-sm text-[var(--wrife-text-muted)] mb-3">
            Ready-to-teach slides with visual examples, colour-coded grammar, and discussion prompts.
          </p>
          <div className="flex items-center gap-2 text-purple-600 text-sm font-medium">
            <span>Preview Slides</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
          <div 
            className="w-full max-w-4xl"
            onClick={e => e.stopPropagation()}
          >
            <div className={`bg-gradient-to-br ${slide.bg} rounded-2xl aspect-video relative overflow-hidden shadow-2xl`}>
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-white text-center">
                <div className="mb-2 text-white/70 text-sm font-medium">
                  Slide {currentSlide + 1} of {slides.length}
                </div>
                <h2 className="text-3xl md:text-5xl font-bold mb-3">{slide.title}</h2>
                <p className="text-xl md:text-2xl font-medium opacity-90 mb-6">{slide.subtitle}</p>
                <p className="text-lg md:text-xl max-w-2xl opacity-80 mb-6">{slide.content}</p>
                {slide.example && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4 mt-4">
                    <p className="text-lg">
                      Example: <span className="font-bold">&ldquo;{slide.example}&rdquo;</span>
                    </p>
                    {slide.highlight && (
                      <p className="text-sm mt-2 opacity-80">
                        Key part: <span className="bg-white/30 px-2 py-1 rounded">{slide.highlight}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              <button 
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 disabled:opacity-30 rounded-full transition-all"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button 
                onClick={nextSlide}
                disabled={currentSlide === slides.length - 1}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 disabled:opacity-30 rounded-full transition-all"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <div className="flex justify-center gap-2 mt-4">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    idx === currentSlide ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
            
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
