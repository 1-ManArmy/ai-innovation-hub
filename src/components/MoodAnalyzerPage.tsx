import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Heart, Brain, MessageCircle, Mic, Camera, Sparkles, ChartLine } from '@phosphor-icons/react'
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

interface MoodAnalyzerPageProps {
  onBack: () => void
}

export function MoodAnalyzerPage({ onBack }: MoodAnalyzerPageProps) {
  const [moodHistory, setMoodHistory] = useKV<MoodEntry[]>('mood-history', [])
  const [currentInput, setCurrentInput] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentMood, setCurrentMood] = useState<MoodEntry | null>(null)
  const [selectedTab, setSelectedTab] = useState('text')

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
      setCurrentInput('')
      
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

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="border-border/50"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Home
          </Button>
          <div>
            <h1 className="text-3xl font-bold gradient-text">Mood Analyzer</h1>
            <p className="text-muted-foreground">Advanced AI-powered emotional analysis</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Input Section */}
          <div className="lg:col-span-2">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 glow-effect">
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
                  <TabsList className="grid w-full grid-cols-3 bg-background/50">
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
                      className="min-h-32 resize-none bg-background/50 border-border/50"
                    />
                    <Button 
                      onClick={() => analyzeMood(currentInput)}
                      disabled={isAnalyzing || !currentInput.trim()}
                      className="w-full bg-primary hover:bg-primary/90"
                      size="lg"
                    >
                      {isAnalyzing ? (
                        <>
                          <Brain size={20} className="mr-2 animate-pulse" />
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
                    <div className="text-center py-12 text-muted-foreground bg-background/30 rounded-lg">
                      <Mic size={48} className="mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">Voice Analysis Coming Soon!</p>
                      <p className="text-sm">We're working on advanced voice emotion detection</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="photo" className="space-y-4">
                    <div className="text-center py-12 text-muted-foreground bg-background/30 rounded-lg">
                      <Camera size={48} className="mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">Photo Mood Detection Coming Soon!</p>
                      <p className="text-sm">Upload photos to detect facial emotions and body language</p>
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
                  <Card className="bg-card/50 backdrop-blur-sm border-border/50 glow-effect">
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
                          className="bg-background/50 p-4 rounded-lg border border-border/50"
                        >
                          <p className="text-sm leading-relaxed">{currentMood.content}</p>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ChartLine size={20} className="text-accent" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {moodHistory.length}
                  </div>
                  <p className="text-muted-foreground text-sm">Mood Entries Tracked</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Moods */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Recent Moods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {moodHistory.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-4">
                      No mood entries yet. Share how you're feeling!
                    </p>
                  ) : (
                    moodHistory.slice(0, 5).map((entry) => (
                      <div key={entry.id} className="flex items-start gap-3 p-2 rounded-lg bg-background/30">
                        <div className="text-lg">
                          {MOOD_EMOJIS[entry.mood as keyof typeof MOOD_EMOJIS]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium capitalize">{entry.mood}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(entry.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {entry.text}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}