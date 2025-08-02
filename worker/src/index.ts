import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  AI: Ai
  ENVIRONMENT: string
  ALLOWED_ORIGINS?: string
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS middleware
app.use('*', async (c, next) => {
  const corsOptions = {
    origin: (origin: string) => {
      if (c.env.ENVIRONMENT === 'development') {
        return true // Allow all origins in development
      }
      
      const allowedOrigins = c.env.ALLOWED_ORIGINS?.split(',') || []
      return allowedOrigins.includes(origin)
    },
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  }
  
  return cors(corsOptions)(c, next)
})

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT 
  })
})

// Main image analysis endpoint
app.post('/api/analyze', async (c) => {
  try {
    const formData = await c.req.formData()
    const imageFile = formData.get('image') as File
    
    if (!imageFile) {
      return c.json({ error: 'No image file provided' }, 400)
    }

    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      return c.json({ error: 'File must be an image' }, 400)
    }

    // Validate file size (max 10MB)
    if (imageFile.size > 10 * 1024 * 1024) {
      return c.json({ error: 'Image file too large (max 10MB)' }, 400)
    }

    // Convert image to base64 for AI processing
    const imageBytes = await imageFile.arrayBuffer()
    const imageBase64 = btoa(String.fromCharCode(...new Uint8Array(imageBytes)))

    // Use Cloudflare AI Vision model for image analysis
    const aiResponse = await c.env.AI.run('@cf/llava-hf/llava-1.5-7b-hf', {
      image: [...new Uint8Array(imageBytes)],
      prompt: `You are a UI component analyzer. Analyze this UI screenshot and provide a detailed breakdown.

Look for these elements:
- Buttons, cards, forms, inputs, navigation elements
- Colors (provide hex codes if possible)
- Typography (font sizes, weights)
- Spacing and layout
- Border radius, shadows, effects

Respond with a JSON object in this exact format:
{
  "elementType": "Primary Button",
  "description": "A modern blue button with hover effects",
  "colors": {
    "background": "#3B82F6",
    "text": "#FFFFFF",
    "hover": "#2563EB"
  },
  "spacing": {
    "padding": "16px 24px",
    "margin": "0"
  },
  "typography": {
    "fontSize": "16px",
    "fontWeight": "500",
    "fontFamily": "system-ui"
  },
  "styles": {
    "borderRadius": "8px",
    "border": "none",
    "boxShadow": "none"
  },
  "tailwindClasses": "bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg font-medium transition-colors",
  "htmlCode": "<button class=\\"bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg font-medium transition-colors\\">\\n  Button Text\\n</button>",
  "breakdown": [
    {
      "property": "Background Color",
      "value": "bg-blue-600",
      "description": "Primary blue background"
    }
  ]
}

Focus on accuracy and provide specific Tailwind CSS classes that match the visual appearance.`
    })

    // Parse the AI response
    let analysisResult
    try {
      // Try to extract JSON from the AI response
      const responseText = aiResponse.response || aiResponse.description || ''
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0])
      } else {
        // Fallback if AI doesn't return proper JSON
        analysisResult = createFallbackAnalysis(responseText)
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      analysisResult = createFallbackAnalysis(aiResponse.response || 'Analysis completed')
    }

    // Ensure the response has the expected structure
    const normalizedResult = normalizeAnalysisResult(analysisResult)

    return c.json({
      success: true,
      analysis: normalizedResult,
      metadata: {
        fileName: imageFile.name,
        fileSize: imageFile.size,
        fileType: imageFile.type,
        processedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Analysis error:', error)
    return c.json({ 
      error: 'Failed to analyze image',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Fallback analysis when AI response parsing fails
function createFallbackAnalysis(description: string) {
  return {
    elementType: "UI Component",
    description: description || "A UI component that was analyzed",
    colors: {
      background: "#3B82F6",
      text: "#FFFFFF",
      hover: "#2563EB"
    },
    spacing: {
      padding: "16px 24px",
      margin: "0"
    },
    typography: {
      fontSize: "16px",
      fontWeight: "500",
      fontFamily: "system-ui"
    },
    styles: {
      borderRadius: "8px",
      border: "none",
      boxShadow: "none"
    },
    tailwindClasses: "bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg font-medium transition-colors",
    htmlCode: `<div class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg font-medium transition-colors">
  Component
</div>`,
    breakdown: [
      { property: "Background Color", value: "bg-blue-600", description: "Primary blue background" },
      { property: "Text Color", value: "text-white", description: "White text for contrast" },
      { property: "Padding", value: "px-6 py-4", description: "24px horizontal, 16px vertical padding" },
      { property: "Border Radius", value: "rounded-lg", description: "8px rounded corners" },
      { property: "Font Weight", value: "font-medium", description: "Medium font weight" },
      { property: "Transition", value: "transition-colors", description: "Smooth color transitions" }
    ]
  }
}

// Normalize and validate the analysis result structure
function normalizeAnalysisResult(result: any) {
  return {
    elementType: result.elementType || "UI Component",
    description: result.description || "A UI component that was analyzed",
    colors: result.colors || {
      background: "#3B82F6",
      text: "#FFFFFF",
      hover: "#2563EB"
    },
    spacing: result.spacing || {
      padding: "16px 24px",
      margin: "0"
    },
    typography: result.typography || {
      fontSize: "16px",
      fontWeight: "500",
      fontFamily: "system-ui"
    },
    styles: result.styles || {
      borderRadius: "8px",
      border: "none",
      boxShadow: "none"
    },
    tailwindClasses: result.tailwindClasses || "bg-blue-600 text-white px-6 py-4 rounded-lg",
    htmlCode: result.htmlCode || `<div class="${result.tailwindClasses || 'bg-blue-600 text-white px-6 py-4 rounded-lg'}">
  Component
</div>`,
    breakdown: Array.isArray(result.breakdown) ? result.breakdown : [
      { property: "Background Color", value: "bg-blue-600", description: "Primary blue background" },
      { property: "Text Color", value: "text-white", description: "White text for contrast" },
      { property: "Padding", value: "px-6 py-4", description: "Horizontal and vertical padding" },
      { property: "Border Radius", value: "rounded-lg", description: "Rounded corners" }
    ]
  }
}

export default app