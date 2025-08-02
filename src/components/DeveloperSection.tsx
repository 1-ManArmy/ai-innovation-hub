import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Code, Copy, Terminal, Globe, Lightning } from '@phosphor-icons/react'
import { toast } from 'sonner'

const codeExamples = [
  {
    language: 'JavaScript',
    title: 'Mood Analysis Request',
    code: `// Initialize Mood Mirror AI
const moodAnalyzer = new MoodMirrorAI({
  apiKey: 'your-api-key',
  endpoint: 'https://api.onelast.ai/mood'
});

// Analyze mood from text
const analyzeMood = async (text) => {
  try {
    const response = await moodAnalyzer.analyze({
      text: text,
      includeEmotions: true,
      includeSentiment: true,
      includeRecommendations: true
    });
    
    console.log('Mood Analysis:', response);
    return response;
  } catch (error) {
    console.error('Analysis failed:', error);
  }
};

// Usage example
const userText = "I'm feeling overwhelmed with work lately";
const moodData = await analyzeMood(userText);`
  },
  {
    language: 'Python',
    title: 'Weekly Mood Insights',
    code: `import requests
from datetime import datetime, timedelta

class MoodMirrorClient:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://api.onelast.ai/mood"
        
    def get_weekly_insights(self, user_id):
        """Get personalized weekly mood insights"""
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'user_id': user_id,
            'period': 'weekly',
            'include_patterns': True,
            'include_recommendations': True
        }
        
        response = requests.post(
            f"{self.base_url}/insights",
            json=payload,
            headers=headers
        )
        
        return response.json()

# Initialize client
client = MoodMirrorClient('your-api-key')
insights = client.get_weekly_insights('user123')`
  },
  {
    language: 'cURL',
    title: 'Real-time Mood Tracking',
    code: `# Real-time mood analysis endpoint
curl -X POST "https://api.onelast.ai/mood/analyze" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Today has been challenging, but I feel hopeful",
    "user_id": "user123",
    "timestamp": "2024-01-15T10:30:00Z",
    "context": {
      "location": "work",
      "activity": "meeting"
    },
    "options": {
      "include_emotions": true,
      "include_sentiment": true,
      "include_recommendations": true,
      "generate_insights": true
    }
  }'

# Response format
{
  "mood_score": 0.65,
  "primary_emotion": "hopeful",
  "sentiment": "mixed_positive",
  "emotions": {
    "joy": 0.3,
    "hope": 0.8,
    "stress": 0.4
  },
  "recommendations": [...],
  "patterns": {...}
}`
  }
]

const apiEndpoints = [
  {
    method: 'POST',
    endpoint: '/mood/analyze',
    description: 'Analyze mood from text input with emotional intelligence',
    parameters: ['text', 'user_id', 'options']
  },
  {
    method: 'GET',
    endpoint: '/mood/insights/{user_id}',
    description: 'Get personalized mood insights and patterns',
    parameters: ['period', 'include_patterns', 'include_recommendations']
  },
  {
    method: 'POST',
    endpoint: '/mood/track',
    description: 'Track mood entries over time for pattern analysis',
    parameters: ['entries[]', 'user_id', 'context']
  },
  {
    method: 'GET',
    endpoint: '/mood/recommendations/{user_id}',
    description: 'Get personalized wellness recommendations',
    parameters: ['mood_state', 'preferences', 'history_days']
  }
]

export function DeveloperSection() {
  const [activeExample, setActiveExample] = useState(0)
  const [typedCode, setTypedCode] = useState('')
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    if (!isTyping) return

    const code = codeExamples[activeExample].code
    let currentIndex = 0

    const typeInterval = setInterval(() => {
      if (currentIndex <= code.length) {
        setTypedCode(code.slice(0, currentIndex))
        currentIndex++
      } else {
        setIsTyping(false)
        clearInterval(typeInterval)
      }
    }, 30)

    return () => clearInterval(typeInterval)
  }, [activeExample, isTyping])

  const handleExampleChange = (index: number) => {
    if (index !== activeExample) {
      setActiveExample(index)
      setTypedCode('')
      setIsTyping(true)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Code copied to clipboard!')
  }

  return (
    <section className="py-20 px-4 relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
            Developer Integration
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Integrate MoodMirror AI into your applications with our powerful APIs and SDKs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Live Code Examples */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="h-full bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Code size={20} className="text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Live Code Examples</CardTitle>
                    <CardDescription>Interactive code demonstrations</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Language Selector */}
                  <div className="flex gap-2 flex-wrap">
                    {codeExamples.map((example, index) => (
                      <Button
                        key={index}
                        variant={activeExample === index ? "default" : "secondary"}
                        size="sm"
                        onClick={() => handleExampleChange(index)}
                        className="text-xs"
                      >
                        {example.language}
                      </Button>
                    ))}
                  </div>

                  {/* Code Display */}
                  <div className="relative">
                    <div className="flex items-center justify-between bg-muted/30 px-4 py-2 rounded-t-lg border border-border/50">
                      <span className="text-sm font-medium text-accent">
                        {codeExamples[activeExample].title}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(codeExamples[activeExample].code)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy size={12} />
                      </Button>
                    </div>
                    <div className="code-block p-4 rounded-b-lg min-h-96 overflow-auto">
                      <pre className="text-sm text-foreground">
                        <code>
                          {typedCode}
                          {isTyping && (
                            <span className="animate-pulse text-accent">|</span>
                          )}
                        </code>
                      </pre>
                    </div>
                  </div>

                  <Button 
                    onClick={() => {
                      setTypedCode('')
                      setIsTyping(true)
                    }}
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                  >
                    <Terminal size={16} className="mr-2" />
                    Replay Animation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* API Documentation */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="h-full bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Globe size={20} className="text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">API Reference</CardTitle>
                    <CardDescription>RESTful API endpoints for MoodMirror</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Lightning size={16} className="text-accent" />
                    Base URL: <code className="bg-muted/30 px-2 py-1 rounded text-accent">https://api.onelast.ai</code>
                  </div>

                  <div className="space-y-3">
                    {apiEndpoints.map((endpoint, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="p-4 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Badge 
                            variant={endpoint.method === 'GET' ? 'secondary' : 'default'}
                            className="text-xs"
                          >
                            {endpoint.method}
                          </Badge>
                          <code className="text-accent font-mono text-sm">
                            {endpoint.endpoint}
                          </code>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {endpoint.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {endpoint.parameters.map((param, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {param}
                            </Badge>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <Button className="w-full" variant="outline">
                      <Globe size={16} className="mr-2" />
                      View Full API Docs
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Integration Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card className="bg-card/30 backdrop-blur-sm border-border/50 text-center p-6">
            <div className="p-3 rounded-full bg-accent/20 w-fit mx-auto mb-4">
              <Lightning size={24} className="text-accent" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Real-time Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Process mood data in real-time with sub-second response times
            </p>
          </Card>

          <Card className="bg-card/30 backdrop-blur-sm border-border/50 text-center p-6">
            <div className="p-3 rounded-full bg-accent/20 w-fit mx-auto mb-4">
              <Code size={24} className="text-accent" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Multiple SDKs</h3>
            <p className="text-sm text-muted-foreground">
              JavaScript, Python, and REST APIs for seamless integration
            </p>
          </Card>

          <Card className="bg-card/30 backdrop-blur-sm border-border/50 text-center p-6">
            <div className="p-3 rounded-full bg-accent/20 w-fit mx-auto mb-4">
              <Globe size={24} className="text-accent" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Global Scale</h3>
            <p className="text-sm text-muted-foreground">
              99.9% uptime with global CDN and enterprise-grade infrastructure
            </p>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}