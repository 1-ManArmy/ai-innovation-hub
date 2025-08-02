import { motion } from 'framer-motion'

export function Footer() {
  return (
    <footer className="py-12 px-4 relative z-10 border-t border-border/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="mb-6">
            <h3 className="text-lg font-bold platform-name mb-2">One Last AI</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Advanced AI platform providing intelligent solutions for mood analysis, 
              conversation, and personal insights.
            </p>
          </div>
          
          <div className="flex justify-center items-center gap-6 text-sm text-muted-foreground">
            <span>&copy; 2024 One Last AI</span>
            <span>•</span>
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>API Documentation</span>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}