import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const testConnection = async () => {
  try {
    // Check if API key exists
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      throw new Error('API key is missing. Please add VITE_OPENAI_API_KEY to your .env file.');
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: "Say 'Connection successful!'"
        }
      ],
      max_tokens: 10,
      temperature: 0
    });

    console.log('✅ OpenAI API Response:', response.choices[0].message.content);
    return response.choices[0].message.content;
  } catch (error) {
    console.error('❌ OpenAI API Error:', error);
    
    if (error.status === 401) {
      throw new Error('Invalid API key. Please check your VITE_OPENAI_API_KEY in the .env file.');
    } else if (error.status === 429) {
      throw new Error('API rate limit exceeded. Please try again later.');
    } else if (error.code === 'insufficient_quota') {
      throw new Error('OpenAI API quota exceeded. Please check your billing.');
    } else {
      throw new Error(`API connection failed: ${error.message}`);
    }
  }
};

export const analyzeDreamWithContext = async (conversationHistory) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: conversationHistory,
      max_tokens: 500,
      temperature: 0.7
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error analyzing dream:', error);
    throw new Error('Failed to analyze dream. Please check your API key and try again.');
  }
};

export const analyzeDream = async (dreamText, symbols, emotions) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a Jungian analyst. Provide structured analysis using Carl Jung's specific concepts. Format your response with clear sections: 1) **Archetypal Patterns**: Identify key archetypes present (Shadow, Anima/Animus, Self, Hero, etc.), 2) **Symbolic Interpretation**: Explain symbols using Jung's framework, 3) **Individuation Process**: How this dream relates to personal growth, 4) **Shadow Work**: What repressed aspects might be emerging, 5) **Collective Unconscious**: Universal themes present. Use bullet points within sections. End with one specific question. Quote Jung when relevant."
        },
        {
          role: "user",
          content: `Please analyze this dream from a Jungian perspective:

Dream: ${dreamText}

Symbols noticed: ${symbols.join(', ')}
Emotions felt: ${emotions.join(', ')}

Please provide a thoughtful analysis focusing on archetypal meanings and psychological insights.`
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error analyzing dream:', error);
    throw new Error('Failed to analyze dream. Please check your API key and try again.');
  }
};

export const generateDreamImage = async (dreamText, symbols, emotions = []) => {
  try {
    // Check if API key exists
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      throw new Error('API key is missing. Please add VITE_OPENAI_API_KEY to your .env file.');
    }

    // Create emotion-based style keywords
    const getEmotionStyle = (emotions) => {
      if (emotions.length === 0) return 'cheerful cartoon';
      
      const emotionStyles = {
        'Happy': 'joyful cartoon',
        'Excited': 'energetic cartoon scene',
        'Peaceful': 'calm peaceful cartoon',
        'Anxious': 'gentle cartoon (avoiding scary elements)',
        'Scared': 'gentle cartoon (avoiding frightening elements)',
        'Confused': 'whimsical cartoon',
        'Sad': 'gentle melancholy cartoon',
        'Angry': 'expressive cartoon',
        'Curious': 'adventurous cartoon',
        'Nostalgic': 'warm nostalgic cartoon',
        'Empowered': 'confident cartoon',
        'Vulnerable': 'gentle caring cartoon'
      };
      
      // Use the first emotion's style, or default to cheerful
      return emotionStyles[emotions[0]] || 'cheerful cartoon';
    };

    const emotionStyle = getEmotionStyle(emotions);
    const symbolText = symbols.length > 0 ? `, featuring ${symbols.join(', ')}` : '';
    
    const prompt = `Children's cartoon illustration depicting: ${dreamText}${symbolText}. Style: ${emotionStyle}, simple cartoon drawing, crayon or colored pencil texture, simple backgrounds`;

    console.log('🎨 DALL-E Cartoon Prompt:', prompt);

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });

    return response.data[0].url;
  } catch (error) {
    console.error('Error generating dream image:', error);
    
    if (error.status === 401) {
      throw new Error('Invalid API key for image generation.');
    } else if (error.status === 429) {
      throw new Error('Image generation rate limit exceeded. Please try again later.');
    } else if (error.code === 'insufficient_quota') {
      throw new Error('OpenAI API quota exceeded for image generation.');
    } else if (error.status === 400) {
      throw new Error('The dream content cannot be visualized due to content policy restrictions.');
    } else {
      throw new Error(`Image generation failed: ${error.message}`);
    }
  }
};

export default openai;