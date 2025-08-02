# MoodMirror - AI Emotional Intelligence Agent

An AI agent that reads your emotional state and creates personalized content to match, enhance, or transform your mood through intelligent analysis and creative response generation.

**Experience Qualities**: 
1. **Empathetic** - The interface feels understanding and responsive to emotional nuances
2. **Adaptive** - Content and responses dynamically adjust based on detected mood patterns  
3. **Inspiring** - Interactions leave users feeling understood and emotionally uplifted

**Complexity Level**: Light Application (multiple features with basic state)
- Multiple input methods (text, voice analysis, photo mood detection) with persistent mood tracking and personalized content generation

## Essential Features

### Mood Detection Engine
- **Functionality**: Analyzes text input, voice tone patterns, or facial expressions in photos to determine current emotional state
- **Purpose**: Creates baseline understanding of user's emotional state for personalized responses
- **Trigger**: User inputs text, records voice message, or uploads photo
- **Progression**: Input → AI analysis → Mood classification → Confidence score display → Store in mood history
- **Success criteria**: Accurate mood detection with 80%+ user agreement on emotional state identification

### Personalized Content Generator  
- **Functionality**: Creates custom content (quotes, mini-stories, advice, creative prompts) tailored to detected mood
- **Purpose**: Provides emotionally relevant content that resonates with user's current state
- **Trigger**: After mood detection completes
- **Progression**: Mood data → Content type selection → AI generation → Personalization layer → Content delivery
- **Success criteria**: Users engage with generated content and report emotional resonance

### Mood Journey Tracker
- **Functionality**: Tracks emotional patterns over time with visual mood timeline and insights
- **Purpose**: Helps users understand their emotional patterns and triggers
- **Trigger**: Automatic after each mood detection session
- **Progression**: New mood entry → Historical comparison → Pattern recognition → Insight generation → Visual timeline update
- **Success criteria**: Clear trend visualization with actionable emotional insights

### Mood Transformation Tools
- **Functionality**: Offers targeted activities, breathing exercises, or creative prompts to shift emotional state
- **Purpose**: Empowers users to actively improve their emotional well-being
- **Trigger**: User requests mood shift or AI suggests based on detected negative patterns
- **Progression**: Current mood assessment → Goal mood selection → Activity recommendation → Guided experience → Post-activity mood check
- **Success criteria**: Measurable mood improvement in 70%+ of transformation sessions

## Edge Case Handling
- **Privacy Concerns**: All emotional data encrypted and stored locally with clear data deletion options
- **Crisis Detection**: Identifies signs of severe distress and provides mental health resources
- **Analysis Failures**: Graceful handling when AI cannot determine mood with backup generic responses
- **Repeated Negative Moods**: Suggests professional help resources when concerning patterns emerge
- **Offline Usage**: Core mood tracking continues without internet with sync when reconnected

## Design Direction
The design should feel like a warm, understanding companion - modern and clean but with subtle organic curves and gentle animations that mirror breathing or heartbeat rhythms, creating a calming therapeutic atmosphere.

## Color Selection
Analogous color scheme using calming blues transitioning to gentle purples, evoking trust, calm, and emotional depth while maintaining professional credibility.

- **Primary Color**: Deep Ocean Blue (oklch(0.45 0.15 240)) - Communicates trust, stability, and emotional depth
- **Secondary Colors**: Soft Lavender (oklch(0.75 0.08 280)) for gentle accent areas and Sage Green (oklch(0.65 0.12 150)) for positive mood indicators  
- **Accent Color**: Warm Coral (oklch(0.70 0.18 25)) - Attention-grabbing highlight for positive actions and mood lifting elements
- **Foreground/Background Pairings**: 
  - Background (Light Blue-Gray oklch(0.96 0.02 240)): Dark Charcoal (oklch(0.25 0.03 240)) - Ratio 12.8:1 ✓
  - Card (Pure White oklch(1 0 0)): Deep Ocean Blue (oklch(0.45 0.15 240)) - Ratio 5.2:1 ✓  
  - Primary (Deep Ocean Blue oklch(0.45 0.15 240)): White (oklch(1 0 0)) - Ratio 5.2:1 ✓
  - Accent (Warm Coral oklch(0.70 0.18 25)): White (oklch(1 0 0)) - Ratio 4.9:1 ✓

## Font Selection
Typography should feel approachable yet professional - Inter for its excellent readability and modern feel, with slightly increased line height to create breathing room that mirrors the calming app purpose.

- **Typographic Hierarchy**: 
  - H1 (App Title): Inter Bold/32px/tight letter spacing
  - H2 (Section Headers): Inter SemiBold/24px/normal spacing  
  - H3 (Card Titles): Inter Medium/18px/normal spacing
  - Body (Content): Inter Regular/16px/relaxed line height (1.6)
  - Caption (Timestamps): Inter Regular/14px/muted color

## Animations
Subtle, breathing-like animations that create emotional resonance - gentle pulsing for mood detection, smooth morphing transitions between emotional states, and organic easing curves that feel naturally calming rather than mechanical.

- **Purposeful Meaning**: Motion should mirror emotional rhythms - slower for calm states, more energetic for excitement, gentle breathing patterns during analysis
- **Hierarchy of Movement**: Mood detection gets primary animation focus, content generation has secondary reveal animations, navigation remains minimal

## Component Selection
- **Components**: Cards for mood entries, Dialog for detailed mood analysis, Tabs for different input methods, Progress for mood detection loading, Avatar for personalized experience, Accordion for mood history expansion
- **Customizations**: Custom mood visualization component using D3, breathing animation wrapper component, custom color-coded mood indicators
- **States**: Buttons show loading spinners during AI processing, inputs have calm focus states with gentle glows, cards have subtle hover lift effects
- **Icon Selection**: Heart variants for emotions, Brain for AI processing, TrendingUp for mood improvement, Clock for history, Camera/Microphone for input methods
- **Spacing**: Generous padding (p-6/p-8) for calm feeling, consistent gaps (gap-4/gap-6) between related elements  
- **Mobile**: Stack input methods vertically, collapse mood history into expandable sections, single-column layout with touch-friendly 48px minimum targets