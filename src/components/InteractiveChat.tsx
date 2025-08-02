import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Mic, Send, Sparkles, User, Robot } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface ChatMessage {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
}

export function InteractiveChat() {
  const [message, setMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])

  const handleSendMessage = async () => {
    if (!message.trim()) return
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    setChatHistory(prev => [...prev, userMessage])
    setMessage('')
    setIsProcessing(true)

    try {
      // Create AI prompt using spark.llmPrompt
      const prompt = spark.llmPrompt`You are an AI assistant for the One Last AI platform. The user just said: "${userMessage.content}". Provide a helpful, friendly, and engaging response. Keep it conversational and under 100 words.`
      
      // Get AI response
      const aiResponse = await spark.llm(prompt, "gpt-4o-mini")
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      }

      setChatHistory(prev => [...prev, aiMessage])
      toast.success('AI response received!')
    } catch (error) {
      console.error('Error getting AI response:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble processing your message right now. Please try again later.",
        sender: 'ai',
        timestamp: new Date()
      }
      setChatHistory(prev => [...prev, errorMessage])
      toast.error('Failed to get AI response')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <section className="py-16 px-4 relative z-10">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
            Live AI Communication
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Chat directly with our AI assistant and get real-time intelligent responses
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 glow-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle size={24} className="text-accent" />
                Live AI Chat
              </CardTitle>
              <CardDescription>
                Chat with our AI assistant - get real responses instantly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Chat History */}
              {chatHistory.length > 0 && (
                <div className="space-y-4 max-h-64 overflow-y-auto bg-background/30 rounded-lg p-4 border border-border/30">
                  <AnimatePresence>
                    {chatHistory.map((chat) => (
                      <motion.div
                        key={chat.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex gap-3 ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex gap-2 max-w-[80%] ${chat.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            chat.sender === 'user' ? 'bg-primary/20' : 'bg-accent/20'
                          }`}>
                            {chat.sender === 'user' ? (
                              <User size={16} className="text-primary" />
                            ) : (
                              <Robot size={16} className="text-accent" />
                            )}
                          </div>
                          <div className={`rounded-lg p-3 ${
                            chat.sender === 'user' 
                              ? 'bg-primary/20 text-primary-foreground' 
                              : 'bg-card/50 text-card-foreground'
                          }`}>
                            <p className="text-sm">{chat.content}</p>
                            <p className="text-xs opacity-60 mt-1">
                              {chat.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {isProcessing && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3 justify-start"
                    >
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-accent/20">
                          <Robot size={16} className="text-accent" />
                        </div>
                        <div className="bg-card/50 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <Sparkles size={16} className="text-accent animate-spin" />
                            <span className="text-sm text-muted-foreground">AI is thinking...</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Chat Input */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle size={16} className="text-primary" />
                  <span className="font-medium">Chat with AI</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Live
                  </Badge>
                </div>
                <Textarea
                  placeholder="Ask me anything... (Press Enter to send, Shift+Enter for new line)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="min-h-20 resize-none bg-background/50 border-border/50"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isProcessing || !message.trim()}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {isProcessing ? (
                    <>
                      <Sparkles size={16} className="mr-2 animate-spin" />
                      AI is responding...
                    </>
                  ) : (
                    <>
                      <Send size={16} className="mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>

              <div className="border-t border-border/50 pt-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                    Real-time AI responses
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                    Context-aware conversations
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                    Powered by GPT-4o
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                    Privacy-first design
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}