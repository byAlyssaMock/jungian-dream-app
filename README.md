# Jungian Dream App

A React-based dream journal application that uses OpenAI's GPT and DALL-E APIs to provide Jungian psychological analysis of dreams and generate cartoon-style visualizations.

## Features

- 🌙 **Dream Journal**: Record your dreams with an intuitive chat interface
- 🧠 **Jungian Analysis**: AI-powered dream interpretation using Jungian psychology
- 🎨 **Dream Visualization**: DALL-E generated cartoon illustrations of your dreams
- 💭 **Symbol & Emotion Tracking**: Select Jungian archetypes and emotions
- 💬 **Conversation Mode**: Ask follow-up questions about your dreams

## Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd jungian-dream-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## Deployment to Vercel

### Prerequisites
- OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
- Vercel account

### Deploy Steps

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel**
   ```bash
   vercel
   ```
   Follow the prompts to link your project.

3. **Add Environment Variables**
   - Go to your [Vercel Dashboard](https://vercel.com/dashboard)
   - Select your project
   - Go to Settings → Environment Variables
   - Add: `VITE_OPENAI_API_KEY` with your OpenAI API key
   - Set for: Production, Preview, and Development

4. **Redeploy** (if needed)
   ```bash
   vercel --prod
   ```

### Alternative: GitHub Integration

1. Push your code to GitHub
2. Import project in Vercel Dashboard
3. Add `VITE_OPENAI_API_KEY` environment variable
4. Deploy automatically on each push

## OpenAI API Usage

This app uses:
- **GPT-3.5-turbo** for dream analysis
- **DALL-E-3** for image generation

Both features require OpenAI API credits. Check your usage at [OpenAI Platform](https://platform.openai.com/usage).

## Tech Stack

- **Frontend**: React 19, Vite 7
- **Styling**: Tailwind CSS 4
- **AI**: OpenAI API (GPT-3.5-turbo, DALL-E-3)
- **Deployment**: Vercel

## Security Notes

- API key is handled client-side (suitable for personal use)
- Never commit `.env` file to version control
- Environment variables are properly prefixed with `VITE_` for Vite
- API key is required for all AI features to function
