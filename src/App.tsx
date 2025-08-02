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
import { Heart, Brain, TrendingUp, MessageCircle, Camera, Mic, Sparkles, ChartLine, Calendar, Target, Lightbulb, Clock, ArrowRight } from '@phosphor-icons/react'
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
  const [activeInsightTab, setActiveInsightTab] = useState('patterns')
  const [patternInsights, setPatternInsights] = useState<PatternInsight[]>([])
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
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

        <Tabs value={activeInsightTab} onValueChange={setActiveInsightTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mood" className="flex items-center gap-2">
              <Heart size={16} />
              Mood Check
            </TabsTrigger>
            <TabsTrigger value="patterns" className="flex items-center gap-2">
              <ChartLine size={16} />
              Insights
            </TabsTrigger>
            <TabsTrigger value="summaries" className="flex items-center gap-2">
              <Calendar size={16} />
              Summaries
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mood" className="space-y-8">
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
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="patterns" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Pattern Insights */}
              <Card className="lg:col-span-2">
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
                      <p>Keep tracking your moods to unlock pattern insights!</p>
                      <p className="text-sm">You need at least 5 entries to see patterns</p>
                    </div>
                  ) : patternInsights.length === 0 && !isGeneratingInsights ? (
                    <div className="text-center py-8">
                      <Button onClick={generatePatternInsights} variant="outline">
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
                          className="border rounded-lg p-4 space-y-3"
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
                          <div className="flex items-start gap-2 bg-accent/10 p-3 rounded-lg">
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
            </div>
          </TabsContent>

          <TabsContent value="summaries" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Weekly Summaries</h2>
                <p className="text-muted-foreground">
                  AI-generated insights and recommendations from your weekly mood data
                </p>
              </div>
              <Button 
                onClick={generateWeeklySummary} 
                variant="outline"
                disabled={moodHistory.length < 3}
              >
                <Calendar size={16} className="mr-2" />
                Generate This Week
              </Button>
            </div>

            {weeklySummaries.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar size={48} className="mx-auto mb-4 opacity-50 text-muted-foreground" />
                  <p className="text-muted-foreground mb-2">No weekly summaries yet</p>
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
                    <Card>
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
                              <div key={mood} className="text-center p-2 rounded-lg bg-muted/50">
                                <div className="text-lg mb-1">
                                  {MOOD_EMOJIS[mood as keyof typeof MOOD_EMOJIS]}
                                </div>
                                <div className="text-xs font-medium capitalize">{mood}</div>
                                <div className="text-xs text-muted-foreground">{count}x</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Separator />

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

                        <Separator />

                        {/* Recommendations */}
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <ArrowRight size={16} />
                            Recommendations
                          </h4>
                          <div className="space-y-2">
                            {summary.recommendations.map((rec, i) => (
                              <div key={i} className="flex items-start gap-2 bg-accent/10 p-3 rounded-lg">
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App