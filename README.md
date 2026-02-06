# AI Messaging v2

A production-ready AI-powered chatbot hosted on **bettingproduct.ai**.

## Features
- ⚡ Lightning-fast AI responses with streaming
- 🚀 Supports 50+ concurrent users
- 🎨 Modern, responsive chat interface
- 🔒 Secure and scalable architecture

## Tech Stack
- **Frontend**: Next.js 14+ with TypeScript
- **Styling**: Tailwind CSS
- **AI**: Anthropic Claude / OpenAI GPT
- **Hosting**: Vercel
- **Domain**: bettingproduct.ai

## Project Structure
```
ai-messaging-v2/
├── src/
│   ├── app/              # Next.js app router
│   ├── components/       # React components
│   ├── lib/             # Utilities and helpers
│   └── types/           # TypeScript types
├── public/              # Static assets
└── docs/                # Documentation
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm
- Vercel account
- AI provider API key (Claude or OpenAI)

### Installation
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/ai-messaging-v2.git
cd ai-messaging-v2

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see the app.

## Deployment

This project is configured for one-click deployment to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/ai-messaging-v2)

### Custom Domain Setup
1. Add `bettingproduct.ai` in Vercel project settings
2. Configure DNS records as shown in Vercel dashboard
3. Wait for SSL certificate provisioning

## Environment Variables

Required environment variables:

```env
# AI Provider (choose one)
ANTHROPIC_API_KEY=your_claude_api_key
# OR
OPENAI_API_KEY=your_openai_api_key

# Optional
NEXT_PUBLIC_APP_URL=https://bettingproduct.ai
```

## Performance

Optimized for:
- **50+ concurrent users**
- **<2s first token response time**
- **Streaming AI responses**
- **Edge deployment** for low latency

## License

MIT
