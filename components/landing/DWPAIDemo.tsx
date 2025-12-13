"use client";

import { useState } from 'react';

interface Assessment {
  overallScore: number;
  performanceBand: string;
  feedback: {
    strengths: string[];
    improvements: string[];
    encouragement: string;
  };
}

export default function DWPAIDemo() {
  const [isOpen, setIsOpen] = useState(false);
  const [writing, setWriting] = useState('');
  const [isAssessing, setIsAssessing] = useState(false);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [error, setError] = useState('');

  const samplePrompt = {
    title: "Level 1: Simple Sentences",
    instruction: "Write 3 simple sentences about your favourite animal. Each sentence should have a subject (who or what), a verb (action), and make sense on its own.",
    example: "Example: Dogs are friendly pets. They love to play. My dog likes treats."
  };

  const handleAssess = async () => {
    if (writing.trim().length < 10) {
      setError('Please write at least 10 characters.');
      return;
    }
    
    setError('');
    setIsAssessing(true);
    setAssessment(null);
    
    try {
      const response = await fetch('/api/dwp/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pupilWriting: writing,
          levelId: 'writing_level_1',
          levelNumber: 1,
          activityName: 'Simple Sentences',
          promptTitle: samplePrompt.title,
          promptInstructions: samplePrompt.instruction,
          rubric: {
            criteria: [
              { name: 'Sentence Structure', weight: 40, description: 'Uses complete sentences with subject and verb' },
              { name: 'Clarity', weight: 30, description: 'Ideas are clear and make sense' },
              { name: 'Task Completion', weight: 30, description: 'Wrote 3 sentences about the topic' }
            ]
          },
          isDemo: true
        })
      });
      
      if (!response.ok) {
        throw new Error('Assessment failed');
      }
      
      const data = await response.json();
      setAssessment(data);
    } catch (err) {
      setError('Unable to assess right now. Please try again.');
      console.error('Assessment error:', err);
    } finally {
      setIsAssessing(false);
    }
  };

  const getBandColor = (band: string) => {
    switch (band?.toLowerCase()) {
      case 'mastery': return 'bg-purple-500';
      case 'secure': return 'bg-green-500';
      case 'developing': return 'bg-yellow-500';
      case 'emerging': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const resetDemo = () => {
    setWriting('');
    setAssessment(null);
    setError('');
  };

  return (
    <>
      <div 
        className="bg-white rounded-2xl overflow-hidden shadow-lg border border-[var(--wrife-border)] hover:shadow-xl transition-all cursor-pointer group"
        onClick={() => { setIsOpen(true); resetDemo(); }}
      >
        <div className="relative h-48 bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 text-center text-white">
            <div className="text-5xl mb-2">🤖</div>
            <div className="text-sm font-medium opacity-90">Instant AI Feedback</div>
          </div>
          <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-medium">
            Live Demo
          </div>
        </div>
        <div className="p-5">
          <h3 className="text-lg font-bold text-[var(--wrife-text-main)] mb-2 group-hover:text-orange-600 transition-colors">
            AI Writing Assessment
          </h3>
          <p className="text-sm text-[var(--wrife-text-muted)] mb-3">
            Try our Developmental Writing Programme. Write something and get instant, personalised feedback from AI.
          </p>
          <div className="flex items-center gap-2 text-orange-600 text-sm font-medium">
            <span>Try AI Feedback</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
          <div 
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <div>
                <h2 className="text-xl font-bold">DWP AI Assessment Demo</h2>
                <p className="text-sm opacity-90">Experience instant, intelligent feedback</p>
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
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-72px)]">
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
                <h3 className="font-bold text-orange-800 mb-1">{samplePrompt.title}</h3>
                <p className="text-sm text-orange-700 mb-2">{samplePrompt.instruction}</p>
                <p className="text-xs text-orange-600 italic">{samplePrompt.example}</p>
              </div>
              
              {!assessment ? (
                <>
                  <textarea
                    value={writing}
                    onChange={(e) => setWriting(e.target.value)}
                    placeholder="Start writing here... Tell us about your favourite animal!"
                    className="w-full h-40 p-4 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none resize-none text-gray-800"
                    disabled={isAssessing}
                  />
                  
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-gray-500">
                      {writing.length} characters
                    </span>
                    <button
                      onClick={handleAssess}
                      disabled={isAssessing || writing.length < 10}
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                      {isAssessing ? (
                        <>
                          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Assessing...
                        </>
                      ) : (
                        <>
                          <span>Get AI Feedback</span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                  
                  {error && (
                    <p className="mt-3 text-sm text-red-500">{error}</p>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className={`w-16 h-16 rounded-full ${getBandColor(assessment.performanceBand)} flex items-center justify-center text-white font-bold text-xl`}>
                      {assessment.overallScore}%
                    </div>
                    <div>
                      <p className="font-bold text-lg text-gray-800 capitalize">{assessment.performanceBand}</p>
                      <p className="text-sm text-gray-600">Performance Band</p>
                    </div>
                  </div>
                  
                  {Array.isArray(assessment.feedback?.strengths) && assessment.feedback.strengths.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                        <span>✨</span> Strengths
                      </h4>
                      <ul className="space-y-1">
                        {assessment.feedback.strengths.map((s, i) => (
                          <li key={i} className="text-sm text-green-700">• {String(s)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {Array.isArray(assessment.feedback?.improvements) && assessment.feedback.improvements.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                        <span>🎯</span> Areas to Develop
                      </h4>
                      <ul className="space-y-1">
                        {assessment.feedback.improvements.map((s, i) => (
                          <li key={i} className="text-sm text-blue-700">• {String(s)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {assessment.feedback?.encouragement && (
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                      <p className="text-sm text-purple-700 italic">&ldquo;{assessment.feedback.encouragement}&rdquo;</p>
                    </div>
                  )}
                  
                  <button
                    onClick={resetDemo}
                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
