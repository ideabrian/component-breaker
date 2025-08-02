# UI Disassembler - Project Prompt

## Project Name Options:
- **ComponentBreaker** (my favorite - captures the bike story)
- **UIDecomposer** 
- **DesignDissector**
- **ElementExtractor**
- **PixelParser**

## The Core Concept
Build a tool that takes any UI screenshot and breaks it down into labeled, buildable pieces - like taking apart a bike and laying out all the parts with instructions.

## Mario Level 1-1 Version (Start Here)
Create a simple web app where:

1. **Upload a screenshot** of a single UI element (button, card, form field)
2. **AI analyzes** and identifies every component piece
3. **Display the breakdown** showing:
   - Element type (button, container, text, etc.)
   - Exact Tailwind CSS classes needed
   - Spacing/sizing values
   - Color codes
   - Typography details
4. **Show the code** - exact HTML + Tailwind to recreate it

## The User Experience (5 minutes)
- User uploads screenshot of intimidating design
- Sees it broken into 8-12 simple, labeled pieces  
- Thinks: "Wait, that's ALL it is? I can build that!"
- Gets exact code to copy/paste
- Feels empowered instead of overwhelmed

## Technical Approach
- Simple React app with drag-and-drop upload
- Use Claude/GPT Vision API for screenshot analysis
- Focus on Tailwind CSS output (most popular)
- Clean, minimal UI that doesn't distract from the breakdown

## Success Metric
Someone uploads a screenshot they thought was "too complex" and says: "Oh, I can totally build this now."

## Phase 1 Constraints
- Single element screenshots only (buttons, cards, forms)
- Tailwind CSS output only
- No responsive breakpoints yet
- No multi-element layouts
- Just: screenshot → pieces → code

## The Deeper Vision
This isn't just about UI. It's about taking apart complexity in general. But start with screenshots because they're visual and immediate.

## Key Insight
You're not teaching design theory. You're showing people that complex-looking things are just simple pieces assembled together. Like your bike story - the magic is in the disassembly, not the reassembly.