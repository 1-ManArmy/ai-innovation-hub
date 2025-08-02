import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, Brain, ChartLine, Calendar, Camera, Mic, MessageCircle, Users, Bot, Sparkles, ChartBar } from '@phosphor-icons/react'

const modules = [
  {
    id: 'moodanalyzer',
    title: 'Mood Analyzer',
    description: 'Advanced AI-powered mood detection and analysis through text, voice, and visual inputs.',
    subdomain: 'mood.moodmirror.ai',
    features: ['Text Analysis', 'Voice Detection', 'Facial Recognition'],
    icon: Heart,
    status: 'Available'
  },
  {
    id: 'patterninsights',
    title: 'Pattern Insights',
    description: 'Discover emotional patterns and triggers with AI-driven behavioral analysis.',
    subdomain: 'patterns.moodmirror.ai',
    features: ['Trend Analysis', 'Trigger Identification', 'Behavior Patterns'],
    icon: ChartLine,
    status: 'Available'
  },
  {
    id: 'weeklysummary',
    title: 'Weekly Reports',
    description: 'Comprehensive weekly emotional intelligence reports with personalized recommendations.',
    subdomain: 'reports.moodmirror.ai',
    features: ['Mood Distribution', 'Key Insights', 'Action Plans'],
    icon: Calendar,
    status: 'Available'
  },
  {
    id: 'emotionalai',
    title: 'Emotional AI Chat',
    description: 'Conversational AI companion specialized in emotional support and mental wellness.',
    subdomain: 'chat.moodmirror.ai',
    features: ['24/7 Support', 'Personalized Responses', 'Crisis Detection'],
    icon: MessageCircle,
    status: 'Beta'
  },
  {
    id: 'voiceemotion',
    title: 'Voice Emotion AI',
    description: 'Real-time voice emotion analysis with advanced speech processing capabilities.',
    subdomain: 'voice.moodmirror.ai',
    features: ['Real-time Processing', 'Emotion Recognition', 'Voice Patterns'],
    icon: Mic,
    status: 'Coming Soon'
  },
  {
    id: 'visualemotion',
    title: 'Visual Emotion AI',
    description: 'Computer vision-based emotional analysis through facial expressions and body language.',
    subdomain: 'vision.moodmirror.ai',
    features: ['Facial Analysis', 'Body Language', 'Micro-expressions'],
    icon: Camera,
    status: 'Coming Soon'
  },
  {
    id: 'wellnesssocial',
    title: 'Wellness Community',
    description: 'Connect with others on similar emotional wellness journeys in a supportive environment.',
    subdomain: 'community.moodmirror.ai',
    features: ['Peer Support', 'Group Sessions', 'Anonymous Sharing'],
    icon: Users,
    status: 'Coming Soon'
  },
  {
    id: 'apianalytics',
    title: 'API Analytics Dashboard',
    description: 'Comprehensive API usage metrics, performance monitoring, and analytics insights.',
    subdomain: 'analytics.moodmirror.ai',
    features: ['Usage Metrics', 'Performance Monitoring', 'Error Tracking'],
    icon: ChartBar,
    status: 'Available'
  },
  {
    id: 'therapybot',
    title: 'AI Therapy Assistant',
    description: 'Advanced therapeutic AI trained in evidence-based therapeutic techniques and interventions.',
    subdomain: 'therapy.moodmirror.ai',
    features: ['CBT Techniques', 'Guided Sessions', 'Progress Tracking'],
    icon: Bot,
    status: 'Development'
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Available': return 'bg-green-500/20 text-green-400 border-green-500/30'
    case 'Beta': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    case 'Coming Soon': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    case 'Development': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }
}

interface ModulesSectionProps {
  onModuleSelect?: (moduleId: string) => void
}

export function ModulesSection({ onModuleSelect }: ModulesSectionProps) {
  return (
    <section className="py-16 px-4 relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Available Modules Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
            AI Emotional Intelligence Modules
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose from our specialized AI modules, each designed to enhance your emotional awareness and mental wellness
          </p>
        </motion.div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {modules.map((module, index) => {
            const IconComponent = module.icon
            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-card/50 backdrop-blur-sm border-border/50 hover:border-accent/50 transition-all duration-300 glow-effect group">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 rounded-lg bg-primary/20">
                        <IconComponent size={20} className="text-accent" />
                      </div>
                      <Badge className={getStatusColor(module.status)}>
                        {module.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors">
                      {module.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      {module.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div className="text-xs text-accent font-mono bg-accent/10 px-2 py-1 rounded">
                        {module.subdomain}
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-xs font-medium text-foreground uppercase tracking-wider">Features</h4>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {module.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center">
                              <div className="w-1 h-1 rounded-full bg-accent mr-2" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button 
                        className={`w-full text-sm ${
                          module.status === 'Available' 
                            ? 'bg-primary hover:bg-primary/90' 
                            : module.status === 'Beta'
                            ? 'bg-yellow-600 hover:bg-yellow-600/90'
                            : 'bg-secondary hover:bg-secondary/90'
                        }`}
                        disabled={module.status === 'Coming Soon' || module.status === 'Development'}
                        onClick={() => {
                          if ((module.status === 'Available' || module.status === 'Beta') && onModuleSelect) {
                            onModuleSelect(module.id)
                          }
                        }}
                      >
                        {module.status === 'Available' ? (
                          <>
                            <Sparkles size={14} className="mr-2" />
                            Launch Module
                          </>
                        ) : module.status === 'Beta' ? (
                          <>
                            <Sparkles size={14} className="mr-2" />
                            Join Beta
                          </>
                        ) : module.status === 'Development' ? (
                          'In Development'
                        ) : (
                          'Coming Soon'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Coming Soon Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground">
            More specialized AI modules are in development. Each module will be available as a standalone application.
          </p>
        </motion.div>
      </div>
    </section>
  )
}