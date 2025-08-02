// API configuration and service functions

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD 
    ? 'https://component-breaker-api.your-domain.workers.dev' 
    : 'http://localhost:8787')

export interface ComponentAnalysis {
  elementType: string
  description: string
  colors: {
    background: string
    text: string
    hover?: string
  }
  spacing: {
    padding: string
    margin: string
  }
  typography: {
    fontSize: string
    fontWeight: string
    fontFamily: string
  }
  styles: {
    borderRadius: string
    border: string
    boxShadow: string
  }
  tailwindClasses: string
  htmlCode: string
  breakdown: Array<{
    property: string
    value: string
    description: string
  }>
}

export interface AnalysisResponse {
  success: boolean
  analysis: ComponentAnalysis
  metadata: {
    fileName: string
    fileSize: number
    fileType: string
    processedAt: string
  }
}

export interface ApiError {
  error: string
  details?: string
}

/**
 * Analyze uploaded image using Cloudflare AI
 */
export async function analyzeImage(imageFile: File): Promise<AnalysisResponse> {
  const formData = new FormData()
  formData.append('image', imageFile)

  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    body: formData,
    headers: {
      // Don't set Content-Type for FormData - browser will set it with boundary
    },
  })

  if (!response.ok) {
    const errorData: ApiError = await response.json()
    throw new Error(errorData.error || `HTTP ${response.status}`)
  }

  return response.json()
}

/**
 * Check API health status
 */
export async function checkApiHealth(): Promise<{ status: string; timestamp: string; environment: string }> {
  const response = await fetch(`${API_BASE_URL}/api/health`)
  
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`)
  }

  return response.json()
}

/**
 * Create a preview URL for uploaded images
 */
export function createImagePreviewUrl(file: File): string {
  return URL.createObjectURL(file)
}

/**
 * Cleanup preview URL to prevent memory leaks
 */
export function cleanupImagePreviewUrl(url: string): void {
  URL.revokeObjectURL(url)
}