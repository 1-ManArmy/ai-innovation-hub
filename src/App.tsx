import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Heart, Brain, TrendingUp, MessageCircle, Camera, Mic, Sparkles, ChartLine, Calendar, Target, Lightbulb, Clock, ArrowRight, Code, Palette, Zap, Shield, Globe, Users } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface MoodEntry {
  id: string
  timestamp: number
  text: string
  mood: string
  confidence: number
  content?: string
  inputMethod: 'text' | 'voice' | 'photo'
}

interface WeeklySummary {
  weekStart: number
  weekEnd: number
  entries: MoodEntry[]
  dominantMood: string
  moodDistribution: Record<string, number>
  averageConfidence: number
  insights: string[]
  recommendations: string[]
}

interface PatternInsight {
  pattern: string
  frequency: number
  description: string
  recommendation: string
  timeframe: string
}

const MOOD_COLORS = {
  happy: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  sad: 'bg-blue-100 text-blue-800 border-blue-200', 
  angry: 'bg-red-100 text-red-800 border-red-200',
  anxious: 'bg-purple-100 text-purple-800 border-purple-200',
  excited: 'bg-orange-100 text-orange-800 border-orange-200',
  calm: 'bg-green-100 text-green-800 border-green-200',
  confused: 'bg-gray-100 text-gray-800 border-gray-200',
  motivated: 'bg-emerald-100 text-emerald-800 border-emerald-200'
}

const MOOD_EMOJIS = {
  happy: '😊',
  sad: '😢', 
  angry: '😠',
  anxious: '😰',
  excited: '🤩',
  calm: '😌',
  confused: '🤔',
  motivated: '💪'
}

function App() {
  const [moodHistory, setMoodHistory] = useKV<MoodEntry[]>('mood-history', [])
  const [weeklySummaries, setWeeklySummaries] = useKV<WeeklySummary[]>('weekly-summaries', [])
  const [currentInput, setCurrentInput] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentMood, setCurrentMood] = useState<MoodEntry | null>(null)
  const [selectedTab, setSelectedTab] = useState('text')
  const [activeInsightTab, setActiveInsightTab] = useState('hero')
  const [patternInsights, setPatternInsights] = useState<PatternInsight[]>([])
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)
  const [showMoodAnalyzer, setShowMoodAnalyzer] = useState(false)

  // Generate floating lights
  const generateLights = () => {
    return Array.from({ length: 15 }, (_, i) => (
      <div
        key={i}
        className="light"
        style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 8}s`,
          animationDuration: `${8 + Math.random() * 6}s`
        }}
      />
    ))
  }

  // Generate pattern insights when mood history changes
  useEffect(() => {
    if (moodHistory.length >= 5) {
      generatePatternInsights()
    }
  }, [moodHistory.length])

  // Generate weekly summary when a new week starts
  useEffect(() => {
    const now = new Date()
    const currentWeekStart = getWeekStart(now)
    const lastSummary = weeklySummaries[0]
    
    if (moodHistory.length >= 3 && (!lastSummary || lastSummary.weekStart < currentWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000)) {
      generateWeeklySummary()
    }
  }, [moodHistory])

  const getWeekStart = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day
    return new Date(d.setDate(diff))
  }

  const generatePatternInsights = async () => {
    if (isGeneratingInsights) return
    setIsGeneratingInsights(true)

    try {
      const recentEntries = moodHistory.slice(0, 20)
      const moodCounts = recentEntries.reduce((acc, entry) => {
        acc[entry.mood] = (acc[entry.mood] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const prompt = spark.llmPrompt`
        Analyze these mood patterns and generate insights:
        
        Recent mood entries: ${JSON.stringify(recentEntries.map(e => ({
          mood: e.mood,
          timestamp: new Date(e.timestamp).toISOString(),
          text: e.text.substring(0, 100)
        })))}
        
        Mood frequency: ${JSON.stringify(moodCounts)}
        
        Generate 3-5 pattern insights as a JSON array with this structure:
        {
          "pattern": "brief pattern name",
          "frequency": percentage_of_occurrence,
          "description": "what this pattern means",
          "recommendation": "actionable advice",
          "timeframe": "when this pattern occurs (e.g., 'weekdays', 'evenings', 'recently')"
        }
        
        Focus on:
        - Recurring emotional states
        - Time-based patterns
        - Emotional triggers or themes
        - Positive trends to reinforce
        - Areas for emotional growth
      `

      const response = await spark.llm(prompt, 'gpt-4o', true)
      const insights = JSON.parse(response)
      if (Array.isArray(insights)) {
        setPatternInsights(insights)
      } else {
        console.error('Invalid insights format received:', insights)
        setPatternInsights([])
      }
      
    } catch (error) {
      console.error('Pattern insights generation error:', error)
      setPatternInsights([]) // Reset to empty array on error
    } finally {
      setIsGeneratingInsights(false)
    }
  }

  const generateWeeklySummary = async () => {
    const now = new Date()
    const weekStart = getWeekStart(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000))
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    const weekEntries = moodHistory.filter(entry => 
      entry.timestamp >= weekStart.getTime() && entry.timestamp < weekEnd.getTime()
    )

    if (weekEntries.length < 3) return

    try {
      const moodDistribution = weekEntries.reduce((acc, entry) => {
        acc[entry.mood] = (acc[entry.mood] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const dominantMood = Object.entries(moodDistribution)
        .sort((a, b) => b[1] - a[1])[0][0]

      const averageConfidence = weekEntries.reduce((sum, entry) => sum + entry.confidence, 0) / weekEntries.length

      const prompt = spark.llmPrompt`
        Generate a weekly mood summary based on this data:
        
        Week: ${weekStart.toDateString()} to ${weekEnd.toDateString()}
        Total entries: ${weekEntries.length}
        Dominant mood: ${dominantMood}
        Mood distribution: ${JSON.stringify(moodDistribution)}
        Average confidence: ${averageConfidence.toFixed(1)}%
        
        Sample entries: ${JSON.stringify(weekEntries.slice(0, 5).map(e => ({
          mood: e.mood,
          text: e.text.substring(0, 100)
        })))}
        
        Provide a JSON response with:
        {
          "insights": ["3-4 key observations about the week"],
          "recommendations": ["3-4 actionable suggestions for the upcoming week"]
        }
        
        Keep insights positive but honest, focus on growth and patterns.
      `

      const response = await spark.llm(prompt, 'gpt-4o', true)
      const analysis = JSON.parse(response)

      const summary: WeeklySummary = {
        weekStart: weekStart.getTime(),
        weekEnd: weekEnd.getTime(),
        entries: weekEntries,
        dominantMood,
        moodDistribution,
        averageConfidence,
        insights: analysis.insights,
        recommendations: analysis.recommendations
      }

      setWeeklySummaries(current => [summary, ...current].slice(0, 12))
      toast.success('Weekly summary generated!')
      
    } catch (error) {
      console.error('Weekly summary generation error:', error)
    }
  }

  const analyzeMood = async (input: string, method: 'text' | 'voice' | 'photo' = 'text') => {
    if (!input.trim()) {
      toast.error('Please enter some text to analyze')
      return
    }

    setIsAnalyzing(true)
    
    try {
      const prompt = spark.llmPrompt`
        Analyze the emotional tone of this text and determine the primary mood. 
        
        Text: "${input}"
        
        Respond with a JSON object containing:
        - mood: one of (happy, sad, angry, anxious, excited, calm, confused, motivated)
        - confidence: number between 0-100 representing confidence in the analysis
        - reasoning: brief explanation of why this mood was detected
        
        Focus on the overall emotional tone and dominant feeling expressed.
      `
      
      const response = await spark.llm(prompt, 'gpt-4o', true)
      const analysis = JSON.parse(response)
      
      const moodEntry: MoodEntry = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        text: input,
        mood: analysis.mood,
        confidence: analysis.confidence,
        inputMethod: method
      }
      
      setCurrentMood(moodEntry)
      setMoodHistory(current => [moodEntry, ...current].slice(0, 50))
      setCurrentInput('') // Clear input after successful analysis
      
      // Generate personalized content
      generatePersonalizedContent(moodEntry)
      
      toast.success(`Mood detected: ${analysis.mood} (${analysis.confidence}% confidence)`)
      
    } catch (error) {
      toast.error('Failed to analyze mood. Please try again.')
      console.error('Mood analysis error:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const generatePersonalizedContent = async (moodEntry: MoodEntry) => {
    try {
      const prompt = spark.llmPrompt`
        Based on someone feeling ${moodEntry.mood}, create personalized content to help them.
        
        Current mood: ${moodEntry.mood}
        Context: "${moodEntry.text}"
        
        Generate helpful content that could be:
        - An uplifting quote or affirmation
        - A brief mindfulness exercise
        - A creative prompt or activity suggestion
        - Words of encouragement or perspective
        
        Keep it concise (2-3 sentences max) and emotionally supportive.
        Make it feel personal and understanding, not generic.
      `
      
      const content = await spark.llm(prompt, 'gpt-4o')
      
      setCurrentMood(current => current ? { ...current, content } : null)
      setMoodHistory(current => 
        current.map(entry => 
          entry.id === moodEntry.id ? { ...entry, content } : entry
        )
      )
      
    } catch (error) {
      console.error('Content generation error:', error)
    }
  }

  const getMoodTrend = () => {
    if (moodHistory.length < 2) return null
    const recent = moodHistory.slice(0, 5)
    const positiveCount = recent.filter(entry => 
      ['happy', 'excited', 'calm', 'motivated'].includes(entry.mood)
    ).length
    return positiveCount >= 3 ? 'positive' : positiveCount <= 1 ? 'concerning' : 'mixed'
  }

  const moodTrend = getMoodTrend()

  return (
    <div className="min-h-screen bg-background relative">
      {/* Logo in corner */}
      <div className="logo-corner">
        <div className="code-symbol">&lt;/&gt;</div>
      </div>

      {/* Floating lights background */}
      <div className="floating-lights">
        {generateLights()}
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl relative">
        <Tabs value={activeInsightTab} onValueChange={setActiveInsightTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-5 glass-card">
            <TabsTrigger value="hero" className="flex items-center gap-2">
              <Sparkles size={16} />
              Home
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <Palette size={16} />
              Features
            </TabsTrigger>
            <TabsTrigger value="tech" className="flex items-center gap-2">
              <Code size={16} />
              Tech
            </TabsTrigger>
            <TabsTrigger value="mood" className="flex items-center gap-2">
              <Heart size={16} />
              Try Now
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <ChartLine size={16} />
              Insights
            </TabsTrigger>
          </TabsList>

          {/* Hero Section */}
          <TabsContent value="hero" className="space-y-8">
            <div className="hero-section">
              <div className="particle-bg"></div>
              <div className="hero-glow absolute inset-0"></div>
              
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="text-center z-10 relative"
              >
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="flex items-center justify-center gap-4 mb-8"
                >
                  <div className="mood-gradient p-6 rounded-3xl breathing-pulse shadow-2xl">
                    <Heart size={48} color="white" weight="fill" />
                  </div>
                  <h1 className="text-6xl font-bold text-gradient">MoodMirror</h1>
                </motion.div>
                
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed"
                >
                  Your AI companion for emotional intelligence and well-being. 
                  Understand your emotions with advanced AI analysis, get personalized insights, 
                  and build better mental health habits.
                </motion.p>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="flex gap-4 justify-center flex-wrap"
                >
                  <Button 
                    size="lg" 
                    className="px-8 py-6 text-lg glass-card neon-border"
                    onClick={() => setActiveInsightTab('mood')}
                  >
                    <Heart size={20} className="mr-2" />
                    Start Your Journey
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="px-8 py-6 text-lg glass-card"
                    onClick={() => setActiveInsightTab('features')}
                  >
                    <Sparkles size={20} className="mr-2" />
                    Explore Features
                  </Button>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                  className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm"
                >
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Brain size={16} className="text-primary" />
                    AI-Powered Analysis
                  </div>
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Shield size={16} className="text-accent" />
                    Privacy-First Design
                  </div>
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Zap size={16} className="text-secondary" />
                    Real-time Insights
                  </div>
                </motion.div>
              </motion.div>
            </div>

            <div className="section-divider"></div>

            {/* Quick Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <Card className="glass-card feature-card text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {moodHistory.length}
                  </div>
                  <p className="text-muted-foreground">Mood Entries Tracked</p>
                </CardContent>
              </Card>
              <Card className="glass-card feature-card text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-accent mb-2">
                    {weeklySummaries.length}
                  </div>
                  <p className="text-muted-foreground">Weekly Summaries</p>
                </CardContent>
              </Card>
              <Card className="glass-card feature-card text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-secondary mb-2">
                    {patternInsights.length}
                  </div>
                  <p className="text-muted-foreground">Pattern Insights</p>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Features Section */}
          <TabsContent value="features" className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-gradient mb-4">Powerful Features</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to understand and improve your emotional well-being
              </p>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: <Heart size={24} className="text-primary" />,
                  title: "Mood Analysis",
                  description: "Advanced AI analyzes your text, voice, and photos to understand your emotional state with high accuracy.",
                  features: ["Text analysis", "Voice detection (coming soon)", "Photo emotions (coming soon)"]
                },
                {
                  icon: <ChartLine size={24} className="text-accent" />,
                  title: "Pattern Recognition",
                  description: "Discover emotional patterns and triggers to better understand your mental health journey.",
                  features: ["Trend analysis", "Trigger identification", "Behavior patterns"]
                },
                {
                  icon: <Calendar size={24} className="text-secondary" />,
                  title: "Weekly Summaries",
                  description: "Get comprehensive weekly reports with insights and personalized recommendations.",
                  features: ["Mood distribution", "Key insights", "Action recommendations"]
                },
                {
                  icon: <Brain size={24} className="text-primary" />,
                  title: "AI Recommendations",
                  description: "Receive personalized content and activities based on your current emotional state.",
                  features: ["Mindfulness exercises", "Motivational content", "Coping strategies"]
                },
                {
                  icon: <Shield size={24} className="text-accent" />,
                  title: "Privacy First",
                  description: "Your data stays secure with local storage and optional cloud sync with encryption.",
                  features: ["Local storage", "Encrypted data", "No tracking"]
                },
                {
                  icon: <Globe size={24} className="text-secondary" />,
                  title: "Multi-Platform",
                  description: "Access your mood data across all devices with seamless synchronization.",
                  features: ["Web app", "Mobile ready", "Cross-device sync"]
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                >
                  <Card className="glass-card feature-card h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        {feature.icon}
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                      </div>
                      <CardDescription className="text-base leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {feature.features.map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Tech Section */}
          <TabsContent value="tech" className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-gradient mb-4">Built with Modern Tech</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Powered by cutting-edge AI and modern web technologies
              </p>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-2">
              <Card className="glass-card feature-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain size={24} className="text-primary" />
                    AI & Machine Learning
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Code size={16} className="text-accent" />
                      <span className="font-mono text-sm">GPT-4o Integration</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Code size={16} className="text-accent" />
                      <span className="font-mono text-sm">Natural Language Processing</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Code size={16} className="text-accent" />
                      <span className="font-mono text-sm">Sentiment Analysis</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Code size={16} className="text-accent" />
                      <span className="font-mono text-sm">Pattern Recognition</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card feature-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette size={24} className="text-secondary" />
                    Frontend Technologies
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Code size={16} className="text-accent" />
                      <span className="font-mono text-sm">React 18 + TypeScript</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Code size={16} className="text-accent" />
                      <span className="font-mono text-sm">Tailwind CSS</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Code size={16} className="text-accent" />
                      <span className="font-mono text-sm">Framer Motion</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Code size={16} className="text-accent" />
                      <span className="font-mono text-sm">Shadcn/ui Components</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="glass-card feature-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap size={24} className="text-primary" />
                  Architecture & Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold mb-3 text-accent">Data Management</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Local-first storage with KV persistence</li>
                      <li>• Real-time state synchronization</li>
                      <li>• Optimistic UI updates</li>
                      <li>• Automatic data backup</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-secondary">User Experience</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Responsive design for all devices</li>
                      <li>• Smooth animations and transitions</li>
                      <li>• Crystal-clear dark theme</li>
                      <li>• Accessibility-first approach</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mood Analyzer Section */}
          <TabsContent value="mood" className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl font-bold text-gradient mb-4">Try MoodMirror Now</h2>
              <p className="text-lg text-muted-foreground">
                Experience the power of AI emotional intelligence analysis
              </p>
            </motion.div>

            <div className="grid gap-8 lg:grid-cols-3">
              {/* Main Input Section */}
              <div className="lg:col-span-2">
                <Card className="glass-card feature-card border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain size={24} className="text-primary" />
                      How are you feeling?
                    </CardTitle>
                    <CardDescription>
                      Share your thoughts and let AI understand your emotional state
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                      <TabsList className="grid w-full grid-cols-3 glass-card">
                        <TabsTrigger value="text" className="flex items-center gap-2">
                          <MessageCircle size={16} />
                          Text
                        </TabsTrigger>
                        <TabsTrigger value="voice" className="flex items-center gap-2">
                          <Mic size={16} />
                          Voice
                        </TabsTrigger>
                        <TabsTrigger value="photo" className="flex items-center gap-2">
                          <Camera size={16} />
                          Photo
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="text" className="space-y-4">
                        <Textarea
                          placeholder="Tell me about your day, your feelings, or what's on your mind..."
                          value={currentInput}
                          onChange={(e) => setCurrentInput(e.target.value)}
                          className="min-h-32 resize-none glass-card"
                        />
                        <Button 
                          onClick={() => analyzeMood(currentInput)}
                          disabled={isAnalyzing || !currentInput.trim()}
                          className="w-full glass-card neon-border"
                          size="lg"
                        >
                          {isAnalyzing ? (
                            <>
                              <div className="breathing-pulse mr-2">
                                <Brain size={20} />
                              </div>
                              Analyzing your mood...
                            </>
                          ) : (
                            <>
                              <Sparkles size={20} className="mr-2" />
                              Analyze My Mood
                            </>
                          )}
                        </Button>
                      </TabsContent>
                      
                      <TabsContent value="voice" className="space-y-4">
                        <div className="text-center py-12 text-muted-foreground glass-card rounded-lg">
                          <Mic size={48} className="mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium mb-2">Voice Analysis Coming Soon!</p>
                          <p className="text-sm">We're working on advanced voice emotion detection</p>
                          <div className="mt-4 flex items-center justify-center gap-2 text-xs">
                            <div className="w-2 h-2 bg-accent rounded-full breathing-pulse"></div>
                            Integration with speech recognition API in progress
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="photo" className="space-y-4">
                        <div className="text-center py-12 text-muted-foreground glass-card rounded-lg">
                          <Camera size={48} className="mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium mb-2">Photo Mood Detection Coming Soon!</p>
                          <p className="text-sm">Upload photos to detect facial emotions and body language</p>
                          <div className="mt-4 flex items-center justify-center gap-2 text-xs">
                            <div className="w-2 h-2 bg-secondary rounded-full breathing-pulse"></div>
                            Computer vision integration in development
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Current Mood Analysis */}
                <AnimatePresence>
                  {currentMood && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="mt-6"
                    >
                      <Card className="glass-card feature-card border-2">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <div className="text-2xl">
                              {MOOD_EMOJIS[currentMood.mood as keyof typeof MOOD_EMOJIS]}
                            </div>
                            Your Current Mood
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center gap-3">
                            <Badge 
                              variant="outline" 
                              className={`${MOOD_COLORS[currentMood.mood as keyof typeof MOOD_COLORS]} px-3 py-1`}
                            >
                              {currentMood.mood.charAt(0).toUpperCase() + currentMood.mood.slice(1)}
                            </Badge>
                            <div className="flex-1">
                              <div className="text-sm text-muted-foreground mb-1">
                                Confidence: {currentMood.confidence}%
                              </div>
                              <Progress value={currentMood.confidence} className="h-2" />
                            </div>
                          </div>
                          
                          {currentMood.content && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="glass-card p-4 rounded-lg"
                            >
                              <p className="text-sm leading-relaxed">{currentMood.content}</p>
                            </motion.div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Communication Features Preview */}
                <Card className="glass-card feature-card mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users size={24} className="text-accent" />
                      Communication Features (Coming Soon)
                    </CardTitle>
                    <CardDescription>
                      Connect with our AI agents through multiple channels
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="glass-card p-4 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <MessageCircle size={20} className="text-primary" />
                          <h4 className="font-semibold">Live Chat</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Real-time text conversations with AI emotional support
                        </p>
                      </div>
                      <div className="glass-card p-4 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <Mic size={20} className="text-secondary" />
                          <h4 className="font-semibold">Voice Chat</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Natural voice conversations with emotion detection
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Mood Trend */}
                {moodTrend && (
                  <Card className="glass-card feature-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <TrendingUp size={20} className="text-primary" />
                        Recent Trend
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`p-3 rounded-lg text-center glass-card ${
                        moodTrend === 'positive' ? 'border-green-500/30' :
                        moodTrend === 'concerning' ? 'border-red-500/30' :
                        'border-yellow-500/30'
                      }`}>
                        {moodTrend === 'positive' ? '📈 Looking up!' :
                         moodTrend === 'concerning' ? '📉 Need support?' :
                         '📊 Mixed feelings'}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Mood History */}
                <Card className="glass-card feature-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Moods</CardTitle>
                    <CardDescription>
                      Your emotional journey over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-3">
                        {moodHistory.length === 0 ? (
                          <p className="text-muted-foreground text-sm text-center py-4">
                            No mood entries yet. Share how you're feeling!
                          </p>
                        ) : (
                          moodHistory.map((entry) => (
                            <motion.div
                              key={entry.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-start gap-3 p-3 rounded-lg glass-card hover:bg-white/10 transition-colors"
                            >
                              <Avatar className="w-8 h-8 flex-shrink-0">
                                <AvatarFallback className="text-xs glass-card">
                                  {MOOD_EMOJIS[entry.mood as keyof typeof MOOD_EMOJIS]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge 
                                    variant="outline" 
                                    className={`${MOOD_COLORS[entry.mood as keyof typeof MOOD_COLORS]} text-xs px-2 py-0`}
                                  >
                                    {entry.mood}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(entry.timestamp).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {entry.text}
                                </p>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Pattern Insights */}
              <Card className="glass-card feature-card lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChartLine size={24} className="text-primary" />
                    Mood Pattern Insights
                    {isGeneratingInsights && (
                      <div className="breathing-pulse">
                        <Brain size={16} />
                      </div>
                    )}
                  </CardTitle>
                  <CardDescription>
                    AI-powered analysis of your emotional patterns and trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {moodHistory.length < 5 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <ChartLine size={48} className="mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">Keep tracking your moods to unlock pattern insights!</p>
                      <p className="text-sm">You need at least 5 entries to see patterns</p>
                    </div>
                  ) : patternInsights.length === 0 && !isGeneratingInsights ? (
                    <div className="text-center py-8">
                      <Button onClick={generatePatternInsights} variant="outline" className="glass-card">
                        <Sparkles size={16} className="mr-2" />
                        Generate Pattern Insights
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {Array.isArray(patternInsights) && patternInsights.map((insight, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="glass-card border rounded-lg p-4 space-y-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Target size={16} className="text-primary" />
                              <h3 className="font-semibold">{insight.pattern}</h3>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {insight.frequency}% frequency
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {insight.timeframe}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {insight.description}
                          </p>
                          <div className="flex items-start gap-2 glass-card p-3 rounded-lg">
                            <Lightbulb size={16} className="text-accent mt-0.5 flex-shrink-0" />
                            <p className="text-sm font-medium text-accent-foreground">
                              {insight.recommendation}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                      
                      {Array.isArray(patternInsights) && patternInsights.length > 0 && (
                        <div className="text-center pt-4">
                          <Button 
                            onClick={generatePatternInsights} 
                            variant="outline" 
                            size="sm"
                            disabled={isGeneratingInsights}
                            className="glass-card"
                          >
                            <Sparkles size={14} className="mr-2" />
                            Refresh Insights
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Weekly Summaries */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gradient">Weekly Summaries</h2>
                    <p className="text-muted-foreground">
                      AI-generated insights and recommendations from your weekly mood data
                    </p>
                  </div>
                  <Button 
                    onClick={generateWeeklySummary} 
                    variant="outline"
                    disabled={moodHistory.length < 3}
                    className="glass-card"
                  >
                    <Calendar size={16} className="mr-2" />
                    Generate This Week
                  </Button>
                </div>

                {weeklySummaries.length === 0 ? (
                  <Card className="glass-card feature-card">
                    <CardContent className="text-center py-12">
                      <Calendar size={48} className="mx-auto mb-4 opacity-50 text-muted-foreground" />
                      <p className="text-muted-foreground mb-2 text-lg font-medium">No weekly summaries yet</p>
                      <p className="text-sm text-muted-foreground">
                        Track your moods for a week to get your first summary
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {weeklySummaries.map((summary, index) => (
                      <motion.div
                        key={`${summary.weekStart}-${summary.weekEnd}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="glass-card feature-card">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="flex items-center gap-2">
                                  <Clock size={20} className="text-primary" />
                                  Week of {new Date(summary.weekStart).toLocaleDateString()}
                                </CardTitle>
                                <CardDescription>
                                  {summary.entries.length} mood entries • Dominant mood: {summary.dominantMood}
                                </CardDescription>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl mb-1">
                                  {MOOD_EMOJIS[summary.dominantMood as keyof typeof MOOD_EMOJIS]}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {summary.averageConfidence.toFixed(0)}% avg confidence
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            {/* Mood Distribution */}
                            <div>
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <ChartLine size={16} />
                                Mood Distribution
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {Object.entries(summary.moodDistribution).map(([mood, count]) => (
                                  <div key={mood} className="text-center p-2 rounded-lg glass-card">
                                    <div className="text-lg mb-1">
                                      {MOOD_EMOJIS[mood as keyof typeof MOOD_EMOJIS]}
                                    </div>
                                    <div className="text-xs font-medium capitalize">{mood}</div>
                                    <div className="text-xs text-muted-foreground">{count}x</div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <Separator className="bg-border/50" />

                            {/* Insights */}
                            <div>
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Brain size={16} />
                                Key Insights
                              </h4>
                              <div className="space-y-2">
                                {summary.insights.map((insight, i) => (
                                  <div key={i} className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                    <p className="text-sm">{insight}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <Separator className="bg-border/50" />

                            {/* Recommendations */}
                            <div>
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <ArrowRight size={16} />
                                Recommendations
                              </h4>
                              <div className="space-y-2">
                                {summary.recommendations.map((rec, i) => (
                                  <div key={i} className="flex items-start gap-2 glass-card p-3 rounded-lg">
                                    <Lightbulb size={16} className="text-accent mt-0.5 flex-shrink-0" />
                                    <p className="text-sm font-medium text-accent-foreground">{rec}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App