import { useState } from 'react'
import { ComponentAnalysis } from '../services/api'

interface ComponentBreakdownProps {
  analysis: ComponentAnalysis | null
  onReset: () => void
}

export default function ComponentBreakdown({ analysis, onReset }: ComponentBreakdownProps) {
  const [copiedItem, setCopiedItem] = useState<string | null>(null)

  const handleCopy = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItem(itemId)
      setTimeout(() => setCopiedItem(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Fallback data if no analysis provided
  const breakdown = analysis || {
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
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Component Breakdown</h2>
          <p className="text-gray-600">Here's exactly how to build this component</p>
        </div>
        <button
          onClick={onReset}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Try Another
        </button>
      </div>

      {/* Component Preview */}
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <p className="text-sm text-gray-500 mb-4">Preview:</p>
        <div 
          className={breakdown.tailwindClasses}
          style={{
            backgroundColor: breakdown.colors?.background,
            color: breakdown.colors?.text,
          }}
        >
          {breakdown.elementType.includes('Button') ? 'Button Text' : 'Component'}
        </div>
      </div>

      {/* Color Palette */}
      {breakdown.colors && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Color Palette</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(breakdown.colors).map(([colorType, colorValue]) => (
              <div key={colorType} className="flex items-center space-x-3">
                <div 
                  className="w-8 h-8 rounded border border-gray-200 flex-shrink-0"
                  style={{ backgroundColor: colorValue }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 capitalize">{colorType}</p>
                  <p className="text-xs text-gray-500 truncate">{colorValue}</p>
                </div>
                <button
                  onClick={() => handleCopy(colorValue, `color-${colorType}`)}
                  className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  {copiedItem === `color-${colorType}` ? '✓' : 'Copy'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Element Info */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Element Type</h3>
        <p className="text-blue-600 font-medium">{breakdown.elementType}</p>
        <p className="text-gray-600 mt-1">{breakdown.description}</p>
      </div>

      {/* Quick Copy - Full Classes */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Complete Tailwind Classes</h3>
          <button
            onClick={() => handleCopy(breakdown.tailwindClasses, 'classes')}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            {copiedItem === 'classes' ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <code className="block bg-gray-50 p-3 rounded text-sm text-gray-800 font-mono overflow-x-auto">
          {breakdown.tailwindClasses}
        </code>
      </div>

      {/* Complete HTML */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Complete HTML</h3>
          <button
            onClick={() => handleCopy(breakdown.htmlCode, 'html')}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            {copiedItem === 'html' ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <pre className="bg-gray-50 p-3 rounded text-sm text-gray-800 font-mono overflow-x-auto">
          <code>{breakdown.htmlCode}</code>
        </pre>
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Breakdown</h3>
        <div className="space-y-3">
          {breakdown.breakdown.map((item, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.property}</p>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">
                  {item.value}
                </code>
                <button
                  onClick={() => handleCopy(item.value, `class-${index}`)}
                  className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  {copiedItem === `class-${index}` ? '✓' : 'Copy'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}