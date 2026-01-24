# Xdesign.ai | AI Mobile UI Design Agent

Modern full-stack AI platform to design and prototype  mobile apps in seconds.

## Features
- ✨ **AI Direct Design**: Prompt-to-UI generation using Gemini 2.0.
- 🎨 **Draggable Canvas**: Infinite workspace powered by XYFlow.
- 📱 **Real Mockups**: View designs inside realistic mobile frames.
- 🖼️ **Export PNG**: Download high-quality images of your designs.
- 🌓 **Mode Toggle**: Seamless switching between Dark and Light themes.
- 🔒 **Secure Auth**: Powered by Clerk.

## Tech Stack
- **Next.js 15 Client & Server**
- **Vercel AI SDK**
- **Prisma 7 & PostgreSQL**
- **Tailwind CSS 4**
- **Clerk Auth**
- **Framer Motion**

## Getting Started

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Setup environment**:
   Copy `.env.example` to `.env` and fill in your keys (Clerk, Google AI, Postgres).
4. **Database Migration**:
   ```bash
   npx prisma migrate dev
   ```
5. **Start development**:
   ```bash
   npm run dev
   ```

## Documentation
- [Architecture](architecture.md)
- [Design System](design-system/xdesign.ai/MASTER.md)
