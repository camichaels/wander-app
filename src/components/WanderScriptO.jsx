import React, { useState, useEffect } from 'react'

const WanderScriptO = ({ 
  onCancel = () => {} 
}) => {
  const [generatedElements, setGeneratedElements] = useState({
    character: '',
    dialogue: '',
    prop: ''
  })
  const [title, setTitle] = useState('')
  const [logline, setLogline] = useState('')

  const characters = [
    'A retired circus performer', 'A conspiracy theorist librarian', 'A time-traveling food critic',
    'A ghost who runs a coffee shop', 'A professional mourner', 'A reformed cat burglar',
    'A meteorologist afraid of rain', 'A mime who breaks their vow of silence', 'A pessimistic wedding planner',
    'A narcoleptic insomniac', 'A color-blind art restorer', 'A vegan vampire',
    'A claustrophobic astronaut', 'A tone-deaf music teacher', 'A pacifist superhero',
    'A germaphobic janitor', 'A stage magician who lost their memory', 'A cynical mall Santa',
    'A dolphin trainer who can\'t swim', 'A lottery winner who keeps losing tickets',
    'A fortune teller with terrible luck', 'A chef allergic to most foods', 'A travel writer who never leaves home',
    'A dance instructor with two left feet', 'A matchmaker who\'s never been in love'
  ]

  const dialogueLines = [
    '"I specifically asked for no pickles"', '"That\'s not how gravity works"',
    '"My grandmother would be spinning in her grave if she weren\'t still alive"', '"Tuesday feels different this year"',
    '"I\'ve been practicing this conversation in the shower for weeks"', '"The Wi-Fi password is my deepest secret"',
    '"I don\'t remember ordering a existential crisis"', '"My houseplants are judging my life choices"',
    '"That\'s either the best idea or the worst idea I\'ve ever heard"', '"I thought this was a Wendy\'s"',
    '"The manual definitely didn\'t mention this part"', '"I\'m allergic to bad decisions but here we are"',
    '"This is why I don\'t trust stairs"', '"My therapist is going to love this story"',
    '"I peaked in kindergarten and it\'s been downhill ever since"', '"The universe has a very specific sense of humor"',
    '"I\'m not saying it\'s aliens, but it\'s probably aliens"', '"My backup plan needs a backup plan"',
    '"This is exactly why I read the terms and conditions"', '"I think my GPS has trust issues"',
    '"Monday called and wants its energy back"', '"I\'m too old for this and too young to give up"',
    '"The instruction manual is clearly written by someone who\'s never done this"', '"I need an adult, and unfortunately, I am the adult"',
    '"This is either a really good dream or a really weird Tuesday"'
  ]

  const props = [
    'a rubber duck that squeaks in different languages', 'a mirror that shows what you looked like yesterday',
    'a pen that only writes other people\'s thoughts', 'a compass that points to lost socks',
    'a calculator that solves emotional problems', 'a flashlight that illuminates memories',
    'a umbrella that attracts rain instead of repelling it', 'a clock that runs backwards on Sundays',
    'a phone that only receives calls from the future', 'a book where the words rearrange themselves',
    'a camera that photographs what might have been', 'a key that opens doors to yesterday',
    'a hat that translates animal thoughts', 'a spoon that stirs up trouble',
    'a pencil that erases mistakes from real life', 'a coin that always lands on its edge',
    'a map of places that don\'t exist yet', 'a jar that contains last Tuesday',
    'a remote control for real life', 'a paperclip that holds time together',
    'a stamp that sends letters to parallel universes', 'a measuring tape that measures feelings',
    'a whistle that summons lost things', 'a button that should never be pressed',
    'a shoelace that ties itself to destiny'
  ]

  const generateNewElements = () => {
    const character = characters[Math.floor(Math.random() * characters.length)]
    const dialogue = dialogueLines[Math.floor(Math.random() * dialogueLines.length)]
    const prop = props[Math.floor(Math.random() * props.length)]
    
    setGeneratedElements({ character, dialogue, prop })
  }

  useEffect(() => {
    generateNewElements()
  }, [])

  const canSubmit = title.trim() && logline.trim()

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #FECACA 0%, #FCA5A5 100%)',
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
            boxShadow: '0 4px 16px rgba(239, 68, 68, 0.1)',
            transition: 'all 0.3s ease'
          }}
        >
          ←
        </button>
        
        <img 
          src="/script-logo.png" 
          alt="Script o Wander" 
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
            console.log('Script logo failed to load from:', e.target.src);
            // Fallback to text if image fails
            e.target.outerHTML = '<h1 style="font-size: 24px; font-weight: 300; color: #DC2626; margin: 0; font-family: Georgia, serif; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Script o Wander</h1>';
          }}
          onLoad={(e) => {
            console.log('Script logo loaded successfully from:', e.target.src);
          }}
        />
      </header>

      <main style={{ maxWidth: '512px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        
        {/* Instructions */}
        <div style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
          borderRadius: '24px',
          padding: '24px',
          border: '1px solid rgba(255,255,255,0.2)',
          marginBottom: '24px',
          boxShadow: '0 8px 32px rgba(239, 68, 68, 0.15), 0 2px 8px rgba(239, 68, 68, 0.1)',
          textAlign: 'center'
        }}>
          <p style={{ 
            color: '#374151', 
            fontSize: '18px', 
            fontWeight: '500', 
            lineHeight: '1.4', 
            margin: 0
          }}>
            Create a movie or TV show using these three elements:
          </p>
        </div>

        {/* Generated Elements */}
        <div style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
          borderRadius: '20px',
          padding: '24px',
          border: '1px solid rgba(255,255,255,0.2)',
          marginBottom: '24px',
          boxShadow: '0 8px 32px rgba(239, 68, 68, 0.15), 0 2px 8px rgba(239, 68, 68, 0.1)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            <p style={{ 
              fontSize: '16px', 
              color: '#DC2626', 
              margin: 0, 
              fontWeight: '600' 
            }}>
              Your Elements
            </p>
            <button
              onClick={generateNewElements}
              style={{
                fontSize: '12px',
                color: '#DC2626',
                background: 'none',
                border: '1px solid #DC2626',
                borderRadius: '8px',
                padding: '6px 12px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#DC2626'
                e.target.style.color = 'white'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'none'
                e.target.style.color = '#DC2626'
              }}
            >
              New Elements
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              <p style={{ fontSize: '12px', color: '#B91C1C', marginBottom: '8px', fontWeight: '600' }}>
                CHARACTER
              </p>
              <p style={{ fontSize: '16px', color: '#374151', margin: 0, fontWeight: '500' }}>
                {generatedElements.character}
              </p>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              <p style={{ fontSize: '12px', color: '#B91C1C', marginBottom: '8px', fontWeight: '600' }}>
                DIALOGUE LINE
              </p>
              <p style={{ fontSize: '16px', color: '#374151', margin: 0, fontWeight: '500' }}>
                {generatedElements.dialogue}
              </p>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              <p style={{ fontSize: '12px', color: '#B91C1C', marginBottom: '8px', fontWeight: '600' }}>
                PROP
              </p>
              <p style={{ fontSize: '16px', color: '#374151', margin: 0, fontWeight: '500' }}>
                {generatedElements.prop}
              </p>
            </div>
          </div>
        </div>

        {/* Response Form */}
        <div style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
          borderRadius: '20px',
          padding: '24px',
          border: '1px solid rgba(255,255,255,0.2)',
          marginBottom: '24px',
          boxShadow: '0 8px 32px rgba(239, 68, 68, 0.15), 0 2px 8px rgba(239, 68, 68, 0.1)'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <p style={{ 
              fontSize: '14px', 
              color: '#DC2626', 
              marginBottom: '12px', 
              fontWeight: '600' 
            }}>
              TITLE
            </p>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Your movie or TV show title..."
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
                border: '2px solid #FECACA',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none',
                color: '#374151',
                boxSizing: 'border-box',
                fontWeight: '500',
                boxShadow: 'inset 0 2px 8px rgba(239, 68, 68, 0.05), 0 2px 4px rgba(239, 68, 68, 0.05)',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#DC2626'
                e.target.style.boxShadow = 'inset 0 2px 8px rgba(239, 68, 68, 0.1), 0 0 0 3px rgba(239, 68, 68, 0.2)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#FECACA'
                e.target.style.boxShadow = 'inset 0 2px 8px rgba(239, 68, 68, 0.05), 0 2px 4px rgba(239, 68, 68, 0.05)'
              }}
            />
          </div>

          <div>
            <p style={{ 
              fontSize: '14px', 
              color: '#DC2626', 
              marginBottom: '12px', 
              fontWeight: '600' 
            }}>
              LOGLINE
            </p>
            <p style={{ 
              fontSize: '12px', 
              color: '#6B7280', 
              marginBottom: '12px',
              fontStyle: 'italic' 
            }}>
              A one-sentence summary of your story idea
            </p>
            <textarea
              value={logline}
              onChange={(e) => setLogline(e.target.value)}
              placeholder="When [character] says [dialogue], they must use [prop] to..."
              style={{
                width: '100%',
                height: '120px',
                padding: '16px',
                background: 'linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)',
                border: '2px solid #FECACA',
                borderRadius: '12px',
                resize: 'none',
                outline: 'none',
                fontSize: '16px',
                color: '#374151',
                boxSizing: 'border-box',
                lineHeight: '1.5',
                fontFamily: 'inherit',
                boxShadow: 'inset 0 2px 8px rgba(239, 68, 68, 0.05), 0 2px 4px rgba(239, 68, 68, 0.05)',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#DC2626'
                e.target.style.boxShadow = 'inset 0 2px 8px rgba(239, 68, 68, 0.1), 0 0 0 3px rgba(239, 68, 68, 0.2)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#FECACA'
                e.target.style.boxShadow = 'inset 0 2px 8px rgba(239, 68, 68, 0.05), 0 2px 4px rgba(239, 68, 68, 0.05)'
              }}
            />
          </div>
        </div>

        {/* Examples for inspiration */}
        <div style={{
          background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid rgba(209, 213, 219, 0.3)',
          marginBottom: '24px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)'
        }}>
          <p style={{ 
            fontSize: '14px', 
            color: '#6B7280', 
            marginBottom: '12px', 
            fontWeight: '600' 
          }}>
            EXAMPLES
          </p>
          <div style={{ fontSize: '12px', color: '#6B7280', lineHeight: '1.4' }}>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>Title:</strong> "The Midnight Memorizer"
            </p>
            <p style={{ margin: '0 0 12px 0' }}>
              <strong>Logline:</strong> When a professional mourner says "I specifically asked for no pickles," they must use a compass that points to lost socks to track down their missing memories before dawn.
            </p>
            <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid #E5E7EB' }} />
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>Title:</strong> "Tuesday Feels Different"
            </p>
            <p style={{ margin: 0 }}>
              <strong>Logline:</strong> A conspiracy theorist librarian who declares "Tuesday feels different this year" discovers that a pen that writes other people's thoughts is the key to preventing Tuesdays from disappearing forever.
            </p>
          </div>
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

export default WanderScriptO