import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useKV } from '@github/spark/hooks'
import { 
  ChartBar, 
  Clock, 
  TrendUp, 
  Code, 
  Users, 
  Activity,
  CheckCircle,
  XCircle,
  Timer,
  ArrowLeft
} from '@phosphor-icons/react'

interface APIMetric {
  endpoint: string
  requests: number
  successRate: number
  avgResponseTime: number
  errors: number
  lastUsed: string
}

interface UsageStats {
  totalRequests: number
  totalErrors: number
  avgResponseTime: number
  activeEndpoints: number
  uptime: number
}

const mockEndpoints: APIMetric[] = [
  {
    endpoint: '/api/mood/analyze',
    requests: 1247,
    successRate: 98.2,
    avgResponseTime: 145,
    errors: 23,
    lastUsed: '2 minutes ago'
  },
  {
    endpoint: '/api/mood/insights',
    requests: 892,
    successRate: 99.1,
    avgResponseTime: 89,
    errors: 8,
    lastUsed: '5 minutes ago'
  },
  {
    endpoint: '/api/mood/recommendations',
    requests: 634,
    successRate: 97.8,
    avgResponseTime: 203,
    errors: 14,
    lastUsed: '1 minute ago'
  },
  {
    endpoint: '/api/mood/history',
    requests: 445,
    successRate: 99.5,
    avgResponseTime: 67,
    errors: 2,
    lastUsed: '8 minutes ago'
  },
  {
    endpoint: '/api/mood/trends',
    requests: 289,
    successRate: 96.9,
    avgResponseTime: 178,
    errors: 9,
    lastUsed: '12 minutes ago'
  }
]

const generateHourlyData = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    requests: Math.floor(Math.random() * 100) + 20,
    errors: Math.floor(Math.random() * 5)
  }))
}

interface APIAnalyticsDashboardProps {
  onBack: () => void
}

export function APIAnalyticsDashboard({ onBack }: APIAnalyticsDashboardProps) {
  const [usageStats, setUsageStats] = useKV<UsageStats>('api-usage-stats', {
    totalRequests: 3507,
    totalErrors: 56,
    avgResponseTime: 134,
    activeEndpoints: 5,
    uptime: 99.7
  })
  
  const [hourlyData] = useState(generateHourlyData())
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')

  const getStatusColor = (rate: number) => {
    if (rate >= 99) return 'text-green-400'
    if (rate >= 95) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getResponseTimeColor = (time: number) => {
    if (time <= 100) return 'text-green-400'
    if (time <= 200) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="min-h-screen p-6 pt-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="hover:bg-card/50"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Platform
          </Button>
          <div>
            <h1 className="text-3xl font-bold gradient-text">API Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-1">Monitor your API usage and performance metrics</p>
          </div>
        </div>
        <div className="text-xs font-bold platform-name">
          One Last AI
        </div>
      </motion.div>

      {/* Overview Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
      >
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold text-foreground">{usageStats.totalRequests.toLocaleString()}</p>
              </div>
              <ChartBar size={24} className="text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Endpoints</p>
                <p className="text-2xl font-bold text-green-400">{usageStats.activeEndpoints}</p>
              </div>
              <Code size={24} className="text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response</p>
                <p className={`text-2xl font-bold ${getResponseTimeColor(usageStats.avgResponseTime)}`}>
                  {usageStats.avgResponseTime}ms
                </p>
              </div>
              <Timer size={24} className="text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Error Rate</p>
                <p className="text-2xl font-bold text-red-400">{((usageStats.totalErrors / usageStats.totalRequests) * 100).toFixed(1)}%</p>
              </div>
              <XCircle size={24} className="text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Uptime</p>
                <p className="text-2xl font-bold text-green-400">{usageStats.uptime}%</p>
              </div>
              <Activity size={24} className="text-green-400" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="endpoints" className="space-y-6">
        <TabsList className="bg-card/50 backdrop-blur-sm border border-border/50">
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="usage">Usage Trends</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">API Endpoints Overview</CardTitle>
                <CardDescription>Performance metrics for all active endpoints</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockEndpoints.map((endpoint, index) => (
                    <motion.div
                      key={endpoint.endpoint}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/30"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <code className="text-sm font-mono text-accent bg-accent/10 px-2 py-1 rounded">
                            {endpoint.endpoint}
                          </code>
                          <Badge className={`${getStatusColor(endpoint.successRate)} bg-transparent border`}>
                            {endpoint.successRate}% success
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <ChartBar size={14} className="mr-1" />
                            {endpoint.requests.toLocaleString()} requests
                          </span>
                          <span className="flex items-center">
                            <Clock size={14} className="mr-1" />
                            {endpoint.avgResponseTime}ms avg
                          </span>
                          <span className="flex items-center">
                            <XCircle size={14} className="mr-1" />
                            {endpoint.errors} errors
                          </span>
                          <span className="text-xs">Last used: {endpoint.lastUsed}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {endpoint.successRate >= 99 ? (
                          <CheckCircle size={20} className="text-green-400" />
                        ) : endpoint.successRate >= 95 ? (
                          <Clock size={20} className="text-yellow-400" />
                        ) : (
                          <XCircle size={20} className="text-red-400" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Usage Trends</CardTitle>
                    <CardDescription>Request patterns over the last 24 hours</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    {['1h', '24h', '7d', '30d'].map((range) => (
                      <Button
                        key={range}
                        variant={selectedTimeRange === range ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedTimeRange(range)}
                        className="text-xs"
                      >
                        {range}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between space-x-1">
                  {hourlyData.map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-accent/30 rounded-t-sm transition-all duration-300 hover:bg-accent/50"
                        style={{ height: `${(data.requests / 120) * 100}%` }}
                      />
                      <div 
                        className="w-full bg-red-400/30 rounded-b-sm"
                        style={{ height: `${(data.errors / 5) * 20}%` }}
                      />
                      <span className="text-xs text-muted-foreground mt-2">
                        {data.hour}:00
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-accent/30 rounded mr-2" />
                    Requests
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-400/30 rounded mr-2" />
                    Errors
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Response Time Distribution</CardTitle>
                <CardDescription>Average response times by endpoint</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockEndpoints.map((endpoint) => (
                    <div key={endpoint.endpoint} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-mono text-accent">{endpoint.endpoint.split('/').pop()}</span>
                        <span className={getResponseTimeColor(endpoint.avgResponseTime)}>
                          {endpoint.avgResponseTime}ms
                        </span>
                      </div>
                      <div className="w-full bg-muted/30 rounded-full h-2">
                        <div 
                          className="bg-accent h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((endpoint.avgResponseTime / 300) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Error Analysis</CardTitle>
                <CardDescription>Error distribution by endpoint</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockEndpoints.map((endpoint) => (
                    <div key={endpoint.endpoint} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                      <div>
                        <span className="font-mono text-sm text-accent">{endpoint.endpoint.split('/').pop()}</span>
                        <div className="text-xs text-muted-foreground mt-1">
                          {endpoint.errors} errors out of {endpoint.requests} requests
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${getStatusColor(endpoint.successRate)}`}>
                          {((endpoint.errors / endpoint.requests) * 100).toFixed(2)}%
                        </div>
                        <div className="text-xs text-muted-foreground">error rate</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}