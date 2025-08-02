import { useEffect } from 'react'

export function ParticleBackground() {
  useEffect(() => {
    const createParticle = () => {
      const particle = document.createElement('div')
      particle.className = 'particle'
      
      const size = Math.random() * 4 + 2
      particle.style.width = `${size}px`
      particle.style.height = `${size}px`
      particle.style.left = `${Math.random() * 100}%`
      particle.style.top = `${Math.random() * 100}%`
      
      document.querySelector('.particle-container')?.appendChild(particle)
      
      setTimeout(() => {
        particle.remove()
      }, 8000)
    }

    const interval = setInterval(createParticle, 300)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="particle-container fixed inset-0 pointer-events-none z-0 overflow-hidden" />
  )
}