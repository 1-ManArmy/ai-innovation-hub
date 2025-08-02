import { useState } from 'react'
import { ParticleBackground } from '@/components/ParticleBackground'
import { HeroSection } from '@/components/HeroSection'
import { ModulesSection } from '@/components/ModulesSection'
import { InteractiveChat } from '@/components/InteractiveChat'
import { APIPlayground } from '@/components/APIPlayground'
import { APIAnalyticsDashboard } from '@/components/APIAnalyticsDashboard'
import { DeveloperSection } from '@/components/DeveloperSection'
import { Footer } from '@/components/Footer'
import { MoodAnalyzerPage } from '@/components/MoodAnalyzerPage'
import { Toaster } from '@/components/ui/sonner'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  const handleModuleSelect = (moduleId: string) => {
    if (moduleId === 'moodanalyzer') {
      setCurrentPage('moodanalyzer')
    } else if (moduleId === 'apianalytics') {
      setCurrentPage('apianalytics')
    }
    // Add other module routing here as they become available
  }

  const handleBackToHome = () => {
    setCurrentPage('home')
  }

  const scrollToModules = () => {
    const modulesSection = document.querySelector('#modules-section')
    if (modulesSection) {
      modulesSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  if (currentPage === 'moodanalyzer') {
    return (
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
        <ParticleBackground />
        <MoodAnalyzerPage onBack={handleBackToHome} />
        <Toaster 
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: 'oklch(0.18 0.12 240)',
              border: '1px solid oklch(0.3 0.15 240)',
              color: 'oklch(0.92 0 0)',
            }
          }}
        />
      </div>
    )
  }

  if (currentPage === 'apianalytics') {
    return (
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
        <ParticleBackground />
        <APIAnalyticsDashboard onBack={handleBackToHome} />
        <Toaster 
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: 'oklch(0.18 0.12 240)',
              border: '1px solid oklch(0.3 0.15 240)',
              color: 'oklch(0.92 0 0)',
            }
          }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <ParticleBackground />
      
      <main className="relative z-10">
        <HeroSection onExploreModules={scrollToModules} />
        <InteractiveChat />
        <div id="modules-section">
          <ModulesSection onModuleSelect={handleModuleSelect} />
        </div>
        <APIPlayground />
        <DeveloperSection />
        <Footer />
      </main>
      
      <Toaster 
        position="top-right"
        theme="dark"
        toastOptions={{
          style: {
            background: 'oklch(0.18 0.12 240)',
            border: '1px solid oklch(0.3 0.15 240)',
            color: 'oklch(0.92 0 0)',
          }
        }}
      />
    </div>
  )
}

export default App