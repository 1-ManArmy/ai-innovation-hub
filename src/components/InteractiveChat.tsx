import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Mic, Send, Sparkles } from '@phosphor-icons/react'

export function InteractiveChat() {
  const [message, setMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSendMessage = () => {
    if (!message.trim()) return
    
    setIsProcessing(true)
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false)
      setMessage('')
    }, 2000)
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
            Try Our AI Communication
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience real-time AI communication with both voice and text options
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
                Interactive AI Demo
              </CardTitle>
              <CardDescription>
                Communicate with our AI using voice or text input
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle size={16} className="text-primary" />
                    <span className="font-medium">Text Chat</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Available
                    </Badge>
                  </div>
                  <Textarea
                    placeholder="Type your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-32 resize-none bg-background/50 border-border/50"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isProcessing || !message.trim()}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    {isProcessing ? (
                      <>
                        <Sparkles size={16} className="mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send size={16} className="mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Mic size={16} className="text-secondary" />
                    <span className="font-medium">Voice Chat</span>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      Coming Soon
                    </Badge>
                  </div>
                  <div className="min-h-32 bg-background/30 border border-border/30 rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Mic size={48} className="mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Voice chat will be available soon</p>
                    </div>
                  </div>
                  <Button
                    disabled
                    className="w-full bg-secondary/50"
                  >
                    <Mic size={16} className="mr-2" />
                    Start Voice Chat
                  </Button>
                </div>
              </div>

              <div className="border-t border-border/50 pt-6">
                <h4 className="font-semibold mb-3">Communication Features</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                    Real-time response generation
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                    Emotional context awareness
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                    Multi-language support
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                    Privacy-first architecture
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