# 📱 VibeDesign.ai | AI-VIBE-WEBSITE-BUILDER-V2

<p align="center">
  <img src="https://img.shields.io/badge/AI--VIBE-WEBSITE--BUILDER--V2-black?style=for-the-badge&logo=next.js&logoColor=white" alt="AI Vibe Project">
  <br>
  <b>AI-powered platform to design and prototype mobile apps in seconds.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat-square&logo=tailwindcss" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Prisma-7.0-2d3748?style=flat-square&logo=prisma" alt="Prisma">
  <img src="https://img.shields.io/badge/Clerk-Auth-6c47ff?style=flat-square&logo=clerk" alt="Clerk">
</p>

---

## 🗺️ Quick Navigation

- [✨ Features](#-features)
- [🛠️ Tech Stack](#%EF%B8%8F-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [📂 Project Structure](#-project-structure)
- [📚 API Documentation](#-api-documentation)
- [🌐 Deployment](#-deployment)
- [🏗️ Architecture](#%EF%B8%8F-architecture)

---

## 🛠️ Engineered With

<p align="left">
  <a href="https://nextjs.org"><img src="https://skillicons.dev/icons?i=nextjs" alt="Next.js"></a>
  <a href="https://react.dev"><img src="https://skillicons.dev/icons?i=react" alt="React"></a>
  <a href="https://prisma.io"><img src="https://skillicons.dev/icons?i=prisma" alt="Prisma"></a>
  <a href="https://tailwindcss.com"><img src="https://skillicons.dev/icons?i=tailwind" alt="Tailwind CSS"></a>
  <a href="https://clerk.com"><img src="https://img.shields.io/badge/Auth-Clerk-6C47FF" alt="Clerk"></a>
  <a href="https://xyflow.com"><img src="https://img.shields.io/badge/Flow-XYFlow-FF0071" alt="XYFlow"></a>
</p>

---

## ✨ Features

- **AI Direct Design**: Prompt-to-UI generation using Minimax AI
- **Draggable Canvas**: Infinite workspace powered by XYFlow (React Flow)
- **Real Mockups**: View designs inside realistic mobile device frames
- **Export PNG**: Download high-quality images of your designs
- **Dark/Light Mode**: Seamless switching between themes
- **Secure Authentication**: Powered by Clerk with middleware protection
- **Responsive Design**: Works on all screen sizes
- **Error Handling**: Comprehensive error boundaries with fallback content
- **Chat Assistant**: AI-powered design assistant for guidance

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| UI Components | Radix UI, shadcn/ui pattern |
| Animation | Framer Motion |
| State Management | React Hooks, XYFlow |
| Database | PostgreSQL with Prisma 7 |
| Authentication | Clerk |
| AI | Vercel AI SDK (Minimax) |
| Forms | Zod validation |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn or pnpm
- PostgreSQL database (local or hosted)
- Clerk account (free tier works)
- Minimax API key (https://api.minimax.chat)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/vibedesign-ai.git
   cd vibedesign-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your credentials:
   ```env
   # Database (Supabase, Neon, or local)
   DATABASE_URL="postgresql://user:password@host:5432/db"

   # Clerk
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
   CLERK_SECRET_KEY=sk_test_xxx

   # AI (Minimax)
   MINIMAX_API_KEY=sk-xxx
   ```

4. **Setup database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk public key |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key |
| `MINIMAX_API_KEY` | Yes | Minimax API key for AI generation |

---

## 📂 Project Structure

<details>
<summary>View Detailed Directory Map</summary>

```
vibedesign-ai/
├── prisma/                    # Database schema
├── public/                    # Static assets
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── api/              # API routes
│   │   ├── dashboard/        # User dashboard
│   │   ├── editor/           # Project editor
│   │   ├── projects/         # Projects list
│   │   ├── templates/        # App templates
│   │   └── pricing/          # Pricing page
│   ├── components/
│   │   ├── editor/           # Editor components
│   │   ├── home/             # Home page components
│   │   ├── layout/           # Layout components
│   │   └── ui/               # Reusable UI components
│   ├── lib/
│   │   ├── ai.ts             # AI provider utilities
│   │   ├── env.ts            # Environment validation
│   │   ├── prisma.ts         # Prisma client
│   │   └── utils.ts          # Utility functions
└── tsconfig.json             # TypeScript configuration
```
</details>


---

## 📚 API Documentation

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all user projects |
| POST | `/api/projects` | Create new project |
| GET | `/api/projects/:id` | Get single project |
| PATCH | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |

### Screens
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/screens/:id` | Get single screen |
| PATCH | `/api/screens/:id` | Update screen |
| DELETE | `/api/screens/:id` | Delete screen |

### AI Generation
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/generate` | Generate new screen |
| POST | `/api/chat` | AI chat assistant |

---

## 🌐 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

```bash
npm run build
vercel deploy --prod
```

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🏗️ Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed architecture documentation.

---

## 🤝 Contributing & Support

1. Fork the repository
2. Create feature branch
3. Submit a Pull Request

- **Issues:** Create an issue for bugs
- **Discussions:** Discussions for questions
- **Wiki:** Wiki for documentation

---

## 📄 License

MIT License - see LICENSE file for details.

---

<p align="center">
  <i>Built with ❤️ using Next.js, AI, and Modern Web Technologies</i>
</p>


## 🎯 Problem Solved

This repository provides a streamlined approach to modern development needs, enabling developers to build robust applications with minimal complexity and maximum efficiency.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/mk-knight23/AI-VIBE-WEBSITE-BUILDER-V2
cd AI-VIBE-WEBSITE-BUILDER-V2

# Install dependencies
npm install

# Start development server
npm run dev
```
