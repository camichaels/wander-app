import React, { useState, useRef, useEffect } from 'react'

const WanderDoodlePad = ({ 
  onCancel = () => {}
}) => {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentTool, setCurrentTool] = useState('pen')
  const [currentColor, setCurrentColor] = useState('#374151')
  const [brushSize, setBrushSize] = useState(3)
  const [isAddingText, setIsAddingText] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 })
  
  // Undo/Redo state
  const [history, setHistory] = useState([])
  const [historyStep, setHistoryStep] = useState(-1)

  const colors = [
    '#374151', '#EF4444', '#F97316', '#EAB308', 
    '#22C55E', '#06B6D4', '#3B82F6', '#8B5CF6', 
    '#EC4899', '#F59E0B', '#10B981', '#6366F1'
  ]

  const tools = [
    { id: 'pen', name: 'Pen', icon: '✏️', size: 3 },
    { id: 'marker', name: 'Marker', icon: '🖊️', size: 8 },
    { id: 'brush', name: 'Brush', icon: '🖌️', size: 12 },
    { id: 'eraser', name: 'Eraser', icon: '🗑️', size: 15 },
    { id: 'text', name: 'Text', icon: 'T', size: 3 }
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas size
    const rect = canvas.parentElement.getBoundingClientRect()
    canvas.width = rect.width - 48
    canvas.height = 400

    const ctx = canvas.getContext('2d')
    
    // Initialize with white background
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    saveStateToHistory()
  }, [])

  const saveStateToHistory = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const dataURL = canvas.toDataURL()
    setHistory(prev => {
      const newHistory = prev.slice(0, historyStep + 1)
      newHistory.push(dataURL)
      return newHistory
    })
    setHistoryStep(prev => prev + 1)
  }

  const undo = () => {
    if (historyStep > 0) {
      setHistoryStep(prev => prev - 1)
      restoreFromHistory(historyStep - 1)
    }
  }

  const redo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep(prev => prev + 1)
      restoreFromHistory(historyStep + 1)
    }
  }

  const restoreFromHistory = (step) => {
    const canvas = canvasRef.current
    if (!canvas || !history[step]) return
    
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
    }
    img.src = history[step]
  }

  const getEventPos = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    
    // Handle touch events
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    }
  }

  const startDrawing = (e) => {
    e.preventDefault()
    
    if (currentTool === 'text') {
      const pos = getEventPos(e)
      setTextPosition(pos)
      setIsAddingText(true)
      return
    }
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getEventPos(e)
    
    setIsDrawing(true)
    
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }

  const draw = (e) => {
    e.preventDefault()
    
    if (!isDrawing || currentTool === 'text') return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getEventPos(e)
    
    ctx.lineWidth = currentTool === 'eraser' ? 15 : brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    
    if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
    } else {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = currentColor
      
      if (currentTool === 'marker') {
        ctx.globalAlpha = 0.7
      } else if (currentTool === 'brush') {
        ctx.globalAlpha = 0.8
      } else {
        ctx.globalAlpha = 1.0
      }
    }
    
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }

  const stopDrawing = (e) => {
    if (e) e.preventDefault()
    
    if (!isDrawing) return
    
    setIsDrawing(false)
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) {
      ctx.globalAlpha = 1.0
      ctx.globalCompositeOperation = 'source-over'
    }
    
    // Save state after drawing
    setTimeout(() => saveStateToHistory(), 100)
  }

  const addText = () => {
    if (!textInput.trim()) {
      setIsAddingText(false)
      setTextInput('')
      return
    }
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    
    // Set font properties
    ctx.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    ctx.fillStyle = currentColor
    ctx.textBaseline = 'top'
    
    // Add text at clicked position
    ctx.fillText(textInput, textPosition.x, textPosition.y)
    
    setIsAddingText(false)
    setTextInput('')
    saveStateToHistory()
  }

  const cancelText = () => {
    setIsAddingText(false)
    setTextInput('')
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    saveStateToHistory()
  }

  const selectTool = (tool) => {
    setCurrentTool(tool.id)
    setBrushSize(tool.size)
    if (tool.id !== 'text') {
      setIsAddingText(false)
      setTextInput('')
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)',
      paddingBottom: '100px',
      position: 'relative'
    }}>
      
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        pointerEvents: 'none'
      }}></div>

      <header style={{ padding: '24px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <button 
          onClick={onCancel}
          style={{ 
            position: 'absolute', 
            left: '24px', 
            top: '24px',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 100%)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '12px',
            padding: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(124, 58, 237, 0.1)',
            transition: 'all 0.3s ease'
          }}
        >
          ←
        </button>
        
        <img 
          src="/doodles-logo.png" 
          alt="Doodle Pad" 
          style={{ 
            height: '55px',
            width: 'auto',
            maxWidth: '250px',
            display: 'block',
            margin: '0 auto',
            filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
          onError={(e) => {
            console.log('Doodles logo failed to load from:', e.target.src);
            // Fallback to text if image fails
            e.target.outerHTML = '<h1 style="font-size: 24px; font-weight: 300; color: #7C3AED; margin: 0; font-family: Georgia, serif; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Doodle Pad</h1>';
          }}
          onLoad={(e) => {
            console.log('Doodles logo loaded successfully from:', e.target.src);
          }}
        />
      </header>

      <main style={{ maxWidth: '512px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        
        {/* Prompt */}
        <div style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
          borderRadius: '24px',
          padding: '24px',
          border: '1px solid rgba(255,255,255,0.2)',
          marginBottom: '24px',
          boxShadow: '0 8px 32px rgba(124, 58, 237, 0.15), 0 2px 8px rgba(124, 58, 237, 0.1)',
          textAlign: 'center'
        }}>
          <p style={{ 
            color: '#374151', 
            fontSize: '18px', 
            fontWeight: '500', 
            lineHeight: '1.4', 
            margin: 0
          }}>
            Draw something that represents your current mood
          </p>
        </div>

        {/* Tools */}
        <div style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
          borderRadius: '20px',
          padding: '20px',
          border: '1px solid rgba(255,255,255,0.2)',
          marginBottom: '16px',
          boxShadow: '0 8px 32px rgba(124, 58, 237, 0.15), 0 2px 8px rgba(124, 58, 237, 0.1)'
        }}>
          
          {/* Drawing Tools */}
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '14px', color: '#7C3AED', margin: '0 0 12px 0', fontWeight: '600' }}>
              Tools
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              {tools.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => selectTool(tool)}
                  style={{
                    padding: '12px',
                    background: currentTool === tool.id 
                      ? 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' 
                      : 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
                    color: currentTool === tool.id ? 'white' : '#374151',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: currentTool === tool.id 
                      ? '0 4px 16px rgba(124, 58, 237, 0.3)' 
                      : '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '48px',
                    height: '48px'
                  }}
                >
                  <span style={{ 
                    fontFamily: tool.id === 'text' ? 'Georgia, serif' : 'inherit',
                    fontWeight: tool.id === 'text' ? 'bold' : 'normal',
                    fontSize: tool.id === 'text' ? '18px' : '16px'
                  }}>
                    {tool.icon}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '14px', color: '#7C3AED', margin: '0 0 12px 0', fontWeight: '600' }}>
              Colors
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => setCurrentColor(color)}
                  style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: color,
                    border: currentColor === color ? '3px solid #7C3AED' : '2px solid #E5E7EB',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    boxShadow: currentColor === color 
                      ? '0 4px 16px rgba(124, 58, 237, 0.3)' 
                      : '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={undo}
              disabled={historyStep <= 0}
              style={{
                padding: '10px 16px',
                background: historyStep > 0 
                  ? 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)' 
                  : 'linear-gradient(135deg, #D1D5DB 0%, #9CA3AF 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: historyStep > 0 ? 'pointer' : 'not-allowed',
                boxShadow: historyStep > 0 ? '0 4px 16px rgba(107, 114, 128, 0.3)' : 'none',
                transition: 'all 0.3s ease'
              }}
            >
              ↶ Undo
            </button>
            
            <button
              onClick={redo}
              disabled={historyStep >= history.length - 1}
              style={{
                padding: '10px 16px',
                background: historyStep < history.length - 1 
                  ? 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)' 
                  : 'linear-gradient(135deg, #D1D5DB 0%, #9CA3AF 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: historyStep < history.length - 1 ? 'pointer' : 'not-allowed',
                boxShadow: historyStep < history.length - 1 ? '0 4px 16px rgba(107, 114, 128, 0.3)' : 'none',
                transition: 'all 0.3s ease'
              }}
            >
              ↷ Redo
            </button>

            <button
              onClick={clearCanvas}
              style={{
                padding: '10px 16px',
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              Clear
            </button>
            
            <div style={{ fontSize: '12px', color: '#6B7280', flex: 1 }}>
              {currentTool !== 'eraser' && currentTool !== 'text' && `Brush: ${brushSize}px`}
            </div>
          </div>
        </div>

        {/* Text Input Modal */}
        {isAddingText && (
          <div style={{
            position: 'fixed',
            inset: '0',
            backgroundColor: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            zIndex: 30
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
              borderRadius: '20px',
              padding: '24px',
              maxWidth: '400px',
              width: '100%',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
            }}>
              <p style={{ fontSize: '16px', color: '#7C3AED', marginBottom: '16px', fontWeight: '600' }}>
                Add Text
              </p>
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type your text..."
                autoFocus
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
                  border: '2px solid #DDD6FE',
                  borderRadius: '12px',
                  fontSize: '16px',
                  outline: 'none',
                  marginBottom: '16px',
                  boxSizing: 'border-box',
                  color: currentColor,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addText()
                  if (e.key === 'Escape') cancelText()
                }}
              />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={addText}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(124, 58, 237, 0.3)'
                  }}
                >
                  Add Text
                </button>
                <button
                  onClick={cancelText}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Canvas */}
        <div style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
          borderRadius: '20px',
          padding: '24px',
          border: '1px solid rgba(255,255,255,0.2)',
          marginBottom: '24px',
          boxShadow: '0 8px 32px rgba(124, 58, 237, 0.15), 0 2px 8px rgba(124, 58, 237, 0.1)'
        }}>
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            style={{
              border: '2px solid #E5E7EB',
              borderRadius: '12px',
              cursor: currentTool === 'text' ? 'text' : 'crosshair',
              touchAction: 'none',
              width: '100%',
              display: 'block'
            }}
          />
        </div>
      </main>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default WanderDoodlePad