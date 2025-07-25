import { useState, useRef, useEffect } from 'react';
import { analyzeDream, analyzeDreamWithContext, generateDreamImage } from './services/openai.js';

const DreamInput = () => {
  const [dreamText, setDreamText] = useState('');
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [selectedSymbols, setSelectedSymbols] = useState([]);
  const [messages, setMessages] = useState([]);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConversationMode, setIsConversationMode] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(null); // Track which message is generating image
  const messagesEndRef = useRef(null);

  const emotions = [
    'Happy', 'Excited', 'Peaceful', 'Anxious', 'Scared', 'Confused',
    'Sad', 'Angry', 'Curious', 'Nostalgic', 'Empowered', 'Vulnerable'
  ];

  const symbols = [
    'Shadow Figure', 'Water/Ocean', 'Animals', 'Death/Rebirth', 
    'Journey/Quest', 'Wise Elder', 'Divine Mother', 'Inner Child',
    'House/Building', 'Flying/Falling', 'Mirror', 'Tree'
  ];

  const toggleEmotion = (emotion) => {
    setSelectedEmotions(prev => 
      prev.includes(emotion)
        ? prev.filter(e => e !== emotion)
        : [...prev, emotion]
    );
  };

  const toggleSymbol = (symbol) => {
    setSelectedSymbols(prev => 
      prev.includes(symbol)
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!dreamText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: dreamText,
      emotions: isConversationMode ? [] : [...selectedEmotions],
      symbols: isConversationMode ? [] : [...selectedSymbols],
      timestamp: new Date(),
      type: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    
    const currentDreamText = dreamText;
    const currentEmotions = [...selectedEmotions];
    const currentSymbols = [...selectedSymbols];
    
    setDreamText('');
    if (!isConversationMode) {
      setSelectedEmotions([]);
      setSelectedSymbols([]);
      setIsConversationMode(true); // Switch to conversation mode immediately after first submit
    }
    setIsLoading(true);

    try {
      let analysis;
      let newConversationHistory;
      
      if (messages.length > 0) {
        // Follow-up question - add user message to conversation history and send full context
        console.log('💬 Processing follow-up question with full context...');
        newConversationHistory = [
          ...conversationHistory,
          {
            role: 'user',
            content: currentDreamText
          }
        ];
        analysis = await analyzeDreamWithContext(newConversationHistory);
      } else {
        // First dream submission - create initial conversation structure
        console.log('🔮 Analyzing initial dream with Jungian AI...');
        const systemPrompt = "You are a Jungian dream analyst. Provide insightful interpretations of dreams based on Jungian psychology, focusing on archetypes, symbols, and the collective unconscious. Maintain context of our conversation for follow-up questions.";
        
        const userPrompt = `Please analyze this dream from a Jungian perspective:

Dream: ${currentDreamText}

Symbols noticed: ${currentSymbols.length > 0 ? currentSymbols.join(', ') : 'None specified'}
Emotions felt: ${currentEmotions.length > 0 ? currentEmotions.join(', ') : 'None specified'}

Please provide a thoughtful analysis focusing on archetypal meanings and psychological insights.`;

        newConversationHistory = [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ];
        
        analysis = await analyzeDreamWithContext(newConversationHistory);
      }
      
      // Add AI response to conversation history
      const updatedHistory = [
        ...newConversationHistory,
        {
          role: 'assistant',
          content: analysis
        }
      ];
      
      setConversationHistory(updatedHistory);
      
      const aiMessage = {
        id: Date.now() + 1,
        text: analysis,
        timestamp: new Date(),
        type: 'ai',
        dreamText: messages.length === 0 ? currentDreamText : null, // Only store for initial dream
        symbols: messages.length === 0 ? currentSymbols : null, // Only store for initial dream
        emotions: messages.length === 0 ? currentEmotions : null, // Only store for initial dream
        isInitialAnalysis: messages.length === 0 // Flag to show visualize button
      };

      setMessages(prev => [...prev, aiMessage]);
      console.log('✅ Analysis complete with context preserved');
    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: `I apologize, but I couldn't analyze your message right now. ${error.message}`,
        timestamp: new Date(),
        type: 'ai'
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVisualizeDream = async (messageId, dreamText, symbols, emotions) => {
    setGeneratingImage(messageId);
    
    try {
      console.log('🎨 Generating cartoon dream visualization...');
      const imageUrl = await generateDreamImage(dreamText, symbols, emotions);
      
      // Update the message to include the generated image
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, imageUrl, imageGenerated: true }
          : msg
      ));
      
      console.log('✅ Dream image generated successfully');
    } catch (error) {
      console.error('❌ Image generation failed:', error.message);
      
      // Update message to show error state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, imageError: error.message }
          : msg
      ));
    } finally {
      setGeneratingImage(null);
    }
  };

  const handleNewDream = () => {
    setDreamText('');
    setSelectedEmotions([]);
    setSelectedSymbols([]);
    setMessages([]);
    setConversationHistory([]);
    setIsLoading(false);
    setIsConversationMode(false);
    setGeneratingImage(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <div className="max-w-md mx-auto w-full flex flex-col h-screen">
        {/* Header */}
        <header className="flex items-center justify-between py-4 px-4 border-b border-slate-700">
          <h1 className="text-xl font-bold text-slate-100">Dream Journal</h1>
          {isConversationMode && (
            <button
              onClick={handleNewDream}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              New Dream
            </button>
          )}
        </header>

        {/* Chat Messages Area */}
        {messages.length > 0 && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`rounded-lg p-4 ${
                message.type === 'ai' 
                  ? 'bg-indigo-900/50 border-l-4 border-indigo-500 ml-2' 
                  : 'bg-slate-800 mr-2'
              }`}>
                {message.type === 'ai' && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                    <span className="text-xs text-indigo-300 font-medium">Jungian Analysis</span>
                  </div>
                )}
                
                <p className="text-slate-100 mb-3 whitespace-pre-wrap">{message.text}</p>
                
                {/* Visualize Dream Button - only for initial AI analysis */}
                {message.type === 'ai' && message.isInitialAnalysis && !message.imageUrl && !message.imageError && (
                  <div className="mb-3">
                    <button
                      onClick={() => handleVisualizeDream(message.id, message.dreamText, message.symbols, message.emotions)}
                      disabled={generatingImage === message.id}
                      className="flex items-center gap-2 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 disabled:bg-purple-600/10 border border-purple-500/30 text-purple-300 text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {generatingImage === message.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                          <span>Visualize this dream</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
                
                {/* Generated Image Display */}
                {message.type === 'ai' && message.imageUrl && (
                  <div className="mb-3">
                    <img 
                      src={message.imageUrl} 
                      alt="Generated dream visualization" 
                      className="w-full rounded-lg border border-indigo-500/30"
                    />
                  </div>
                )}
                
                {/* Image Generation Error */}
                {message.type === 'ai' && message.imageError && (
                  <div className="mb-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-300 text-sm">
                      <span className="font-medium">Image generation failed:</span> {message.imageError}
                    </p>
                  </div>
                )}
                
                {message.type === 'user' && message.symbols.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-slate-400 mb-1">Symbols:</p>
                    <div className="flex flex-wrap gap-1">
                      {message.symbols.map((symbol) => (
                        <span key={symbol} className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
                          {symbol}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {message.type === 'user' && message.emotions.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Emotions:</p>
                    <div className="flex flex-wrap gap-1">
                      {message.emotions.map((emotion) => (
                        <span key={emotion} className="px-2 py-1 bg-indigo-600 text-white text-xs rounded-full">
                          {emotion}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="bg-indigo-900/50 border-l-4 border-indigo-500 ml-2 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-indigo-300 font-medium">Analyzing your dream...</span>
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Symbols Section */}
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isConversationMode 
            ? 'max-h-0 opacity-0 -translate-y-4' 
            : 'max-h-96 opacity-100 translate-y-0'
        }`}>
          <div className="p-4 border-t border-slate-700 space-y-3">
            <h3 className="text-sm font-semibold text-slate-200">
              Symbols you noticed:
            </h3>
            <div className="flex flex-wrap gap-2">
              {symbols.map((symbol) => (
                <button
                  key={symbol}
                  onClick={() => toggleSymbol(symbol)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedSymbols.includes(symbol)
                      ? 'bg-purple-600 text-white border border-purple-500'
                      : 'bg-slate-800 text-slate-300 border border-slate-600 hover:bg-slate-700'
                  }`}
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Emotions Section */}
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isConversationMode 
            ? 'max-h-0 opacity-0 -translate-y-4' 
            : 'max-h-96 opacity-100 translate-y-0'
        }`}>
          <div className="p-4 border-t border-slate-700 space-y-3">
            <h3 className="text-sm font-semibold text-slate-200">
              How did this dream make you feel?
            </h3>
            <div className="flex flex-wrap gap-2">
              {emotions.map((emotion) => (
                <button
                  key={emotion}
                  onClick={() => toggleEmotion(emotion)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedEmotions.includes(emotion)
                      ? 'bg-indigo-600 text-white border border-indigo-500'
                      : 'bg-slate-800 text-slate-300 border border-slate-600 hover:bg-slate-700'
                  }`}
                >
                  {emotion}
                </button>
                ))}
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex gap-2">
            <textarea
              value={dreamText}
              onChange={(e) => setDreamText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isConversationMode ? "Ask a follow-up question..." : "Describe your dream..."}
              className="flex-1 p-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              rows={3}
            />
            <button
              onClick={handleSend}
              disabled={!dreamText.trim() || isLoading}
              className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {isLoading 
                ? (isConversationMode ? 'Thinking...' : 'Analyzing...') 
                : (isConversationMode ? 'Send' : 'Submit Dream')
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DreamInput;