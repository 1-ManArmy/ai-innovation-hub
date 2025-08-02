import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Heart, Brain, TrendingUp, MessageCircle, Camera, Mic, Sparkles } from '@phosphor-icons/react'
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="mood-gradient p-3 rounded-2xl breathing-pulse">
              <Heart size={32} color="white" weight="fill" />
            </div>
            <h1 className="text-4xl font-bold text-gradient">MoodMirror</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Your AI companion for emotional intelligence and well-being
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Input Section */}
          <div className="lg:col-span-2">
            <Card className="border-2 shadow-lg">
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
                  <TabsList className="grid w-full grid-cols-3">
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
                      className="min-h-32 resize-none"
                    />
                    <Button 
                      onClick={() => analyzeMood(currentInput)}
                      disabled={isAnalyzing || !currentInput.trim()}
                      className="w-full"
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
                    <div className="text-center py-12 text-muted-foreground">
                      <Mic size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Voice analysis coming soon!</p>
                      <p className="text-sm">We're working on voice emotion detection</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="photo" className="space-y-4">
                    <div className="text-center py-12 text-muted-foreground">
                      <Camera size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Photo mood detection coming soon!</p>
                      <p className="text-sm">Upload photos to detect facial emotions</p>
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
                  <Card className="border-2 shadow-lg">
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
                          className="bg-muted p-4 rounded-lg"
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
            {/* Mood Trend */}
            {moodTrend && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp size={20} className="text-primary" />
                    Recent Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`p-3 rounded-lg text-center ${
                    moodTrend === 'positive' ? 'bg-green-50 text-green-800' :
                    moodTrend === 'concerning' ? 'bg-red-50 text-red-800' :
                    'bg-yellow-50 text-yellow-800'
                  }`}>
                    {moodTrend === 'positive' ? '📈 Looking up!' :
                     moodTrend === 'concerning' ? '📉 Need support?' :
                     '📊 Mixed feelings'}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mood History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Moods</CardTitle>
                <CardDescription>
                  Your emotional journey over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
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
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback className="text-xs">
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App