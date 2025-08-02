#!/usr/bin/env node

// Simple test script for ComponentBreaker API
const API_BASE_URL = process.env.API_URL || 'http://localhost:8787'

async function testHealthCheck() {
  try {
    console.log('🔍 Testing health check...')
    const response = await fetch(`${API_BASE_URL}/api/health`)
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Health check passed:', data)
      return true
    } else {
      console.log('❌ Health check failed:', data)
      return false
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message)
    return false
  }
}

async function testImageAnalysis() {
  try {
    console.log('🔍 Testing image analysis endpoint...')
    
    // Create a simple test form data
    const formData = new FormData()
    
    // Create a minimal test image (1x1 PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
      0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ])
    
    const blob = new Blob([testImageBuffer], { type: 'image/png' })
    formData.append('image', blob, 'test.png')
    
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      body: formData
    })
    
    const data = await response.json()
    
    if (response.ok && data.success) {
      console.log('✅ Image analysis test passed')
      console.log('📊 Analysis result preview:')
      console.log(`   Element Type: ${data.analysis.elementType}`)
      console.log(`   Description: ${data.analysis.description}`)
      console.log(`   Tailwind Classes: ${data.analysis.tailwindClasses}`)
      return true
    } else {
      console.log('❌ Image analysis test failed:', data)
      return false
    }
  } catch (error) {
    console.log('❌ Image analysis error:', error.message)
    return false
  }
}

async function runTests() {
  console.log(`🚀 Testing ComponentBreaker API at: ${API_BASE_URL}`)
  console.log('=' .repeat(50))
  
  const healthOk = await testHealthCheck()
  console.log('')
  
  if (healthOk) {
    await testImageAnalysis()
  } else {
    console.log('⏭️  Skipping image analysis test (health check failed)')
  }
  
  console.log('')
  console.log('=' .repeat(50))
  console.log('💡 Next steps:')
  console.log('   1. Start worker: cd worker && npm run dev')
  console.log('   2. Start frontend: npm run dev')
  console.log('   3. Test in browser with real images')
}

// Run tests
runTests().catch(console.error)