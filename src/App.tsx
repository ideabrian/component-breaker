import { useState } from 'react'
import FileUpload from './components/FileUpload'
import CCBuilderDashboard from './components/CCBuilderDashboard'
import ComponentBreakdown from './components/ComponentBreakdown'
import { analyzeImage, ComponentAnalysis } from './services/api'

function App() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [currentView, setCurrentView] = useState<'componentbreaker' | 'dashboard'>('componentbreaker')
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<ComponentAnalysis | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  const handleFileSelect = (file: File) => {
    setUploadedFile(file)
    console.log('File selected:', file.name)
    // For MVP, we'll just show uploaded state, user clicks "Analyze" to see breakdown
  }

  const handleTrySample = () => {
    setIsAnalyzing(true)
    setAnalysisError(null)
    
    // For sample demo, we'll use hardcoded data for now
    // In production, you could have a sample image that gets analyzed
    setTimeout(() => {
      setAnalysisResult({
        elementType: "Primary Button",
        description: "A modern blue button with hover effects and rounded corners",
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
        tailwindClasses: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors",
        htmlCode: `<button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
  Get Started
</button>`,
        breakdown: [
          { property: "Background Color", value: "bg-blue-600", description: "Primary blue background" },
          { property: "Hover State", value: "hover:bg-blue-700", description: "Darker blue on hover" },
          { property: "Text Color", value: "text-white", description: "White text for contrast" },
          { property: "Horizontal Padding", value: "px-4", description: "16px left and right padding" },
          { property: "Vertical Padding", value: "py-2", description: "8px top and bottom padding" },
          { property: "Border Radius", value: "rounded-lg", description: "8px rounded corners" },
          { property: "Font Weight", value: "font-medium", description: "Medium font weight (500)" },
          { property: "Transition", value: "transition-colors", description: "Smooth color transitions" }
        ]
      })
      setIsAnalyzing(false)
      setShowBreakdown(true)
    }, 2000)
  }

  const handleAnalyzeUpload = async () => {
    if (!uploadedFile) return
    
    setIsAnalyzing(true)
    setAnalysisError(null)
    
    try {
      const response = await analyzeImage(uploadedFile)
      setAnalysisResult(response.analysis)
      setShowBreakdown(true)
    } catch (error) {
      console.error('Analysis failed:', error)
      setAnalysisError(error instanceof Error ? error.message : 'Analysis failed')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReset = () => {
    setUploadedFile(null)
    setShowBreakdown(false)
    setIsAnalyzing(false)
    setAnalysisResult(null)
    setAnalysisError(null)
  }

  if (currentView === 'dashboard') {
    return <CCBuilderDashboard onBack={() => setCurrentView('componentbreaker')} />
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              ComponentBreaker
            </h1>
            <p className="text-lg text-gray-600">
              Upload a UI screenshot and see exactly how to build it
            </p>
          </div>
          <button
            onClick={() => setCurrentView('dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            CC-Builder Dashboard
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          {showBreakdown ? (
            <ComponentBreakdown analysis={analysisResult} onReset={handleReset} />
          ) : analysisError ? (
            <div className="text-center py-12">
              <div className="text-red-600 text-6xl mb-4">⚠️</div>
              <p className="text-lg font-medium text-red-900 mb-2">Analysis Failed</p>
              <p className="text-red-600 mb-4">{analysisError}</p>
              <div className="space-x-4">
                <button
                  onClick={uploadedFile ? handleAnalyzeUpload : handleTrySample}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Try Again
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Start Over
                </button>
              </div>
            </div>
          ) : isAnalyzing ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg font-medium text-gray-900 mb-2">Analyzing your component...</p>
              <p className="text-gray-600">Breaking down the design into buildable pieces</p>
            </div>
          ) : !uploadedFile ? (
            <div>
              <FileUpload onFileSelect={handleFileSelect} />
              
              {/* Try Sample Section */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Want to see it in action?
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try our sample button breakdown to see exactly how ComponentBreaker works
                  </p>
                  <button
                    onClick={handleTrySample}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Try Sample Button
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-green-600 mb-4">
                ✅ Uploaded: {uploadedFile.name}
              </p>
              <p className="text-gray-600 mb-6">
                Ready to analyze your component
              </p>
              <div className="space-x-4">
                <button
                  onClick={handleAnalyzeUpload}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Analyze Component
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Upload Different Image
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App