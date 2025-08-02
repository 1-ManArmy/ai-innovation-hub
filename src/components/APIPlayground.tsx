import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Code, 
  Play, 
  Copy, 
  CheckCircle, 
  XCircle, 
  Clock,
  Lightning,
  Globe,
  Key,
  Download
} from '@phosphor-icons/react'
import { toast } from 'sonner'

const apiEndpoints = [
  {
    id: 'mood-analyze',
    name: 'Mood Analysis',
    method: 'POST',
    endpoint: '/api/v1/mood/analyze',
    description: 'Analyze mood patterns from text input with detailed emotional insights',
    parameters: [
      { name: 'text', type: 'string', required: true, description: 'Text content to analyze' },
      { name: 'includeInsights', type: 'boolean', required: false, description: 'Include detailed insights' },
      { name: 'language', type: 'string', required: false, description: 'Language code (default: en)' }
    ],
    exampleRequest: {
      text: "I'm feeling overwhelmed with work but excited about the weekend plans",
      includeInsights: true,
      language: "en"
    },
    exampleResponse: {
      mood: "mixed",
      emotions: {
        stress: 0.75,
        excitement: 0.68,
        optimism: 0.45
      },
      insights: {
        primary_emotion: "stress",
        confidence: 0.89,
        recommendations: ["Take breaks", "Focus on positive aspects"]
      }
    }
  },
  {
    id: 'mood-history',
    method: 'GET',
    name: 'Mood History',
    endpoint: '/api/v1/mood/history',
    description: 'Retrieve historical mood data with filtering and pagination',
    parameters: [
      { name: 'days', type: 'integer', required: false, description: 'Number of days to retrieve (default: 30)' },
      { name: 'limit', type: 'integer', required: false, description: 'Results per page (max: 100)' },
      { name: 'offset', type: 'integer', required: false, description: 'Pagination offset' }
    ],
    exampleRequest: {
      days: 7,
      limit: 20
    },
    exampleResponse: {
      data: [
        {
          date: "2024-01-15",
          mood: "positive",
          score: 0.78,
          entries: 5
        }
      ],
      total: 150,
      page: 1
    }
  },
  {
    id: 'mood-insights',
    method: 'GET',
    name: 'Weekly Insights',
    endpoint: '/api/v1/mood/insights/weekly',
    description: 'Get personalized weekly mood insights and recommendations',
    parameters: [
      { name: 'week', type: 'string', required: false, description: 'Week in YYYY-MM-DD format' },
      { name: 'includeRecommendations', type: 'boolean', required: false, description: 'Include AI recommendations' }
    ],
    exampleRequest: {
      week: "2024-01-15",
      includeRecommendations: true
    },
    exampleResponse: {
      week: "2024-01-15",
      overall_mood: "improving",
      trends: {
        stress_level: "decreasing",
        happiness: "stable",
        energy: "increasing"
      },
      recommendations: [
        "Continue your current stress management practices",
        "Consider adding more social activities"
      ]
    }
  }
]

const methodColors = {
  GET: 'bg-green-500/20 text-green-400 border-green-500/30',
  POST: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  PUT: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  DELETE: 'bg-red-500/20 text-red-400 border-red-500/30'
}

export function APIPlayground() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(apiEndpoints[0])
  const [requestData, setRequestData] = useState(JSON.stringify(selectedEndpoint.exampleRequest, null, 2))
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [responseTime, setResponseTime] = useState(0)
  const [apiKey, setApiKey] = useState('')
  const [copiedCode, setCopiedCode] = useState('')

  // Generate animated typing effect for code examples
  const [typedCode, setTypedCode] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const codeExamples = {
    javascript: `// JavaScript/Node.js Example
const response = await fetch('https://api.moodmirror.ai${selectedEndpoint.endpoint}', {
  method: '${selectedEndpoint.method}',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify(${JSON.stringify(selectedEndpoint.exampleRequest, null, 2)})
});

const data = await response.json();
console.log(data);`,
    python: `# Python Example
import requests

url = "https://api.moodmirror.ai${selectedEndpoint.endpoint}"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_KEY"
}
data = ${JSON.stringify(selectedEndpoint.exampleRequest, null, 2)}

response = requests.${selectedEndpoint.method.toLowerCase()}(url, headers=headers, json=data)
result = response.json()
print(result)`,
    curl: `# cURL Example
curl -X ${selectedEndpoint.method} \\
  https://api.moodmirror.ai${selectedEndpoint.endpoint} \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '${JSON.stringify(selectedEndpoint.exampleRequest)}'`
  }

  useEffect(() => {
    setRequestData(JSON.stringify(selectedEndpoint.exampleRequest, null, 2))
    setResponse('')
  }, [selectedEndpoint])

  const typeCode = (code: string, language: string) => {
    setIsTyping(true)
    setTypedCode('')
    let i = 0
    const timer = setInterval(() => {
      if (i < code.length) {
        setTypedCode(code.slice(0, i + 1))
        i++
      } else {
        clearInterval(timer)
        setIsTyping(false)
      }
    }, 20)
  }

  const handleSendRequest = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter your API key')
      return
    }

    setIsLoading(true)
    const startTime = Date.now()

    try {
      // Simulate API call with realistic delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500))
      
      const mockResponse = {
        success: true,
        data: selectedEndpoint.exampleResponse,
        timestamp: new Date().toISOString(),
        request_id: `req_${Math.random().toString(36).substr(2, 9)}`
      }

      setResponse(JSON.stringify(mockResponse, null, 2))
      setResponseTime(Date.now() - startTime)
      toast.success('Request completed successfully!')
    } catch (error) {
      const errorResponse = {
        error: true,
        message: 'Failed to process request',
        code: 500,
        timestamp: new Date().toISOString()
      }
      setResponse(JSON.stringify(errorResponse, null, 2))
      toast.error('Request failed')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(type)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopiedCode(''), 2000)
  }

  return (
    <section className="py-16 px-4 relative z-10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
            API Playground
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Test our Mood Mirror API endpoints directly in your browser with real-time examples
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Endpoints List */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe size={20} className="text-accent" />
                  API Endpoints
                </CardTitle>
                <CardDescription>
                  Select an endpoint to test
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {apiEndpoints.map((endpoint) => (
                  <button
                    key={endpoint.id}
                    onClick={() => setSelectedEndpoint(endpoint)}
                    className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                      selectedEndpoint.id === endpoint.id
                        ? 'border-accent bg-accent/10'
                        : 'border-border hover:border-accent/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{endpoint.name}</span>
                      <Badge className={methodColors[endpoint.method as keyof typeof methodColors]}>
                        {endpoint.method}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      {endpoint.endpoint}
                    </p>
                  </button>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* API Testing Interface */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Code size={20} className="text-accent" />
                      {selectedEndpoint.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {selectedEndpoint.description}
                    </CardDescription>
                  </div>
                  <Badge className={methodColors[selectedEndpoint.method as keyof typeof methodColors]}>
                    {selectedEndpoint.method}
                  </Badge>
                </div>
                <div className="text-xs font-mono text-muted-foreground bg-muted/30 px-3 py-2 rounded">
                  https://api.moodmirror.ai{selectedEndpoint.endpoint}
                </div>
              </CardHeader>

              <CardContent>
                <Tabs defaultValue="test" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="test">Test API</TabsTrigger>
                    <TabsTrigger value="parameters">Parameters</TabsTrigger>
                    <TabsTrigger value="examples">Code Examples</TabsTrigger>
                  </TabsList>

                  <TabsContent value="test" className="space-y-4 mt-4">
                    {/* API Key Input */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Key size={16} />
                        API Key
                      </Label>
                      <Input
                        type="password"
                        placeholder="Enter your API key..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="font-mono"
                      />
                    </div>

                    {/* Request Body */}
                    {selectedEndpoint.method !== 'GET' && (
                      <div className="space-y-2">
                        <Label>Request Body (JSON)</Label>
                        <Textarea
                          value={requestData}
                          onChange={(e) => setRequestData(e.target.value)}
                          className="font-mono text-sm min-h-[120px] code-block"
                          placeholder="Enter JSON request body..."
                        />
                      </div>
                    )}

                    {/* Send Request Button */}
                    <Button
                      onClick={handleSendRequest}
                      disabled={isLoading}
                      className="w-full bg-primary hover:bg-primary/90 glow-effect"
                    >
                      {isLoading ? (
                        <>
                          <Clock size={16} className="mr-2 animate-spin" />
                          Sending Request...
                        </>
                      ) : (
                        <>
                          <Play size={16} className="mr-2" />
                          Send Request
                        </>
                      )}
                    </Button>

                    {/* Response */}
                    {response && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2">
                            Response
                            {responseTime > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {responseTime}ms
                              </Badge>
                            )}
                          </Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(response, 'response')}
                          >
                            {copiedCode === 'response' ? (
                              <CheckCircle size={16} className="text-green-400" />
                            ) : (
                              <Copy size={16} />
                            )}
                          </Button>
                        </div>
                        <Textarea
                          value={response}
                          readOnly
                          className="font-mono text-sm min-h-[200px] code-block"
                        />
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="parameters" className="mt-4">
                    <div className="space-y-4">
                      <h4 className="font-medium">Parameters</h4>
                      <div className="space-y-3">
                        {selectedEndpoint.parameters.map((param, index) => (
                          <div key={index} className="p-3 border border-border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-mono text-sm font-medium">{param.name}</span>
                              <Badge variant={param.required ? "default" : "secondary"}>
                                {param.required ? 'Required' : 'Optional'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {param.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{param.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="examples" className="mt-4">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Label>Language</Label>
                        <Select defaultValue="javascript" onValueChange={(value) => typeCode(codeExamples[value as keyof typeof codeExamples], value)}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="javascript">JavaScript</SelectItem>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="curl">cURL</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(typedCode || codeExamples.javascript, 'code')}
                        >
                          {copiedCode === 'code' ? (
                            <CheckCircle size={16} className="text-green-400" />
                          ) : (
                            <Copy size={16} />
                          )}
                        </Button>
                      </div>
                      
                      <div className="relative">
                        <pre className="code-block p-4 rounded-lg text-sm overflow-x-auto">
                          <code>{typedCode || codeExamples.javascript}</code>
                          {isTyping && <span className="animate-pulse">|</span>}
                        </pre>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* API Documentation Link */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-8 text-center"
        >
          <Card className="bg-card/30 backdrop-blur-sm border-border/50 max-w-2xl mx-auto">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Lightning size={24} className="text-accent" />
                <h3 className="text-lg font-semibold">Need an API Key?</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Get started with our Mood Mirror API by requesting your free API key
              </p>
              <div className="flex gap-3 justify-center">
                <Button className="bg-primary hover:bg-primary/90 glow-effect">
                  <Key size={16} className="mr-2" />
                  Get API Key
                </Button>
                <Button variant="outline">
                  <Download size={16} className="mr-2" />
                  Download Docs
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}