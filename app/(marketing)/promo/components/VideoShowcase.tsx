'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Video {
  title: string;
  duration: string;
  description: string;
  embedUrl: string;
}

export default function VideoShowcase() {
  const [activeVideo, setActiveVideo] = useState('intro')

  const videos: Record<string, Video> = {
    intro: {
      title: "What is WriFe?",
      duration: "2:30",
      description: "Michael Ankrah explains the WriFe approach and why it works",
      embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
    curriculum: {
      title: "Curriculum Layout",
      duration: "3:15",
      description: "See how 67 lessons build systematically from simple to complex",
      embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
    alignment: {
      title: "Curriculum Review Alignment",
      duration: "2:45",
      description: "How WriFe addresses government review recommendations",
      embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
    components: {
      title: "WriFe Components",
      duration: "4:30",
      description: "Interactive activities, PWP, worksheets, assessments explained",
      embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
    guide: {
      title: "Using the Teacher Guide",
      duration: "3:20",
      description: "Step-by-step tutorial on using WriFe lesson materials",
      embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    }
  }

  return (
    <section id="video" className="py-16 md:py-24" style={{ backgroundColor: 'var(--wrife-bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Image 
                src="/mascots/book-mascot.png" 
                alt="Book mascot"
                width={80}
                height={60}
                className="drop-shadow-md"
              />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--wrife-text-main)' }}>
              See WriFe in Action
            </h2>
            <p className="text-xl mt-4" style={{ color: 'var(--wrife-text-muted)' }}>
              Watch these short videos to understand how WriFe transforms writing instruction
            </p>
          </div>

          <div className="mb-8">
            <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ backgroundColor: 'black' }}>
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={videos[activeVideo].embedUrl}
                  title={videos[activeVideo].title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full"
                ></iframe>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--wrife-text-main)' }}>{videos[activeVideo].title}</h3>
              <p style={{ color: 'var(--wrife-text-muted)' }}>{videos[activeVideo].description}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(videos).map(([key, video]) => (
              <button
                key={key}
                onClick={() => setActiveVideo(key)}
                className={`text-left p-4 rounded-lg border-2 transition-all ${
                  activeVideo === key
                    ? ''
                    : 'hover:border-gray-300'
                }`}
                style={{
                  borderColor: activeVideo === key ? 'var(--wrife-blue)' : 'var(--wrife-border)',
                  backgroundColor: activeVideo === key ? 'var(--wrife-blue-soft)' : 'white'
                }}
              >
                <div className="font-semibold text-sm mb-1" style={{ color: 'var(--wrife-text-main)' }}>{video.title}</div>
                <div className="text-xs" style={{ color: 'var(--wrife-text-muted)' }}>{video.duration}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
