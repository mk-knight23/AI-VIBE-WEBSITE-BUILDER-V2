<div align="center">

# 🎨 AI-VIBE-WEBSITE-BUILDER-V2

### **AI-Powered Mobile App Design Platform**
*Next.js 15 · @xyflow/react · Clerk · Prisma · AI SDK · Device Mockups*

[![Next.js](https://img.shields.io/badge/Next.js-15.0+-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![XYFlow](https://img.shields.io/badge/@xyflow/react-Flow_Canvas-FF0072?style=for-the-badge)](https://xyflow.com)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge)](https://clerk.com)
[![Prisma](https://img.shields.io/badge/Prisma-6.0+-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

**[🚀 Live Demo](https://ai-vibe-builder-v2.vercel.app)** · **[📖 Docs](#documentation)** · **[⭐ Star](https://github.com/mk-knight23/AI-VIBE-WEBSITE-BUILDER-V2)**

</div>

---

## 🎯 Design Mobile Apps Visually

AI-VIBE-WEBSITE-BUILDER-V2 is a **visual flow-based design platform** for mobile applications. Connect screens with drag-and-drop flows, see your app in realistic device frames, and let AI generate or modify screen content through a sidebar chat.

> **Pillar 3, Iteration 2** — V1 builds websites. V2 designs mobile experiences.

---

## ✨ Features

| Feature | Status | Description |
|---------|--------|-------------|
| 🗺️ **Flow Canvas** | ✅ | Drag-and-drop screen flow with @xyflow/react |
| 📱 **Device Mockups** | ✅ | iPhone 16 Pro, Pixel 9, iPad frames |
| 🤖 **AI Chat Sidebar** | ✅ | Modify screens via natural language |
| 🔗 **Screen Connections** | ✅ | Arrow connections with transition types |
| 💾 **Auto-Save** | ✅ | Optimistic updates to PostgreSQL |
| 👁️ **Prototype Mode** | ✅ | Click through interactive prototype |
| 📤 **Export** | ✅ | Figma-compatible JSON, PNG, PDF |
| 🎨 **Component Library** | ✅ | 50+ pre-built mobile UI components |
| 🌙 **Dark Mode** | ✅ | Full dark mode with theme toggle |
| 👥 **Collaboration** | 🔄 | Real-time multi-user (v3.0) |

---

## 🏗️ Architecture

```
src/
├── app/
│   ├── layout.tsx                   # Auth + theme providers
│   ├── page.tsx                     # Landing / project picker
│   ├── projects/page.tsx            # Project dashboard
│   └── editor/[projectId]/page.tsx  # Main editor
├── components/
│   ├── editor/
│   │   ├── canvas.tsx               # @xyflow/react flow canvas
│   │   ├── mobile-frame.tsx         # Realistic device frames
│   │   ├── toolbar.tsx              # Top toolbar (add screen, etc.)
│   │   ├── chat-sidebar.tsx         # AI chat for screen editing
│   │   └── types.ts                 # Node/edge type definitions
│   ├── home/
│   │   ├── landing-hero.tsx         # Animated hero section
│   │   └── recent-projects.tsx      # Project grid with previews
│   └── layout/
│       └── header.tsx               # Top nav with user menu
└── prisma/
    └── schema.prisma                 # User, Project, Screen, Connection
```

---

## 🖼️ Supported Device Frames

| Device | Dimensions | Notch/Island |
|--------|-----------|--------------|
| iPhone 16 Pro | 393×852 | Dynamic Island |
| iPhone 15 | 390×844 | Notch |
| Samsung Galaxy S25 | 360×800 | Punch-hole |
| Google Pixel 9 | 412×915 | Punch-hole |
| iPad Pro 13" | 1024×1366 | Thin bezel |
| iPad Mini | 744×1133 | Standard |

---

## 🗺️ Flow Canvas

The canvas uses **@xyflow/react** for the interactive screen map:

```typescript
// components/editor/canvas.tsx
import { ReactFlow, addEdge, useNodesState, useEdgesState } from '@xyflow/react'
import { MobileScreenNode } from './nodes/MobileScreenNode'
import { TransitionEdge } from './edges/TransitionEdge'

const nodeTypes = {
  mobileScreen: MobileScreenNode,
}

const edgeTypes = {
  transition: TransitionEdge,  // Animated arrow with transition type label
}
```

---

## 🤖 AI Screen Generation

```typescript
// app/api/generate-screen/route.ts
import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'

export async function POST(req: Request) {
  const { prompt, existingScreen, deviceType } = await req.json()

  const result = await streamText({
    model: anthropic('claude-sonnet-4-6'),
    system: MOBILE_DESIGN_SYSTEM_PROMPT,
    prompt: `Generate a ${deviceType} screen for: ${prompt}
    ${existingScreen ? `Based on existing design: ${JSON.stringify(existingScreen)}` : ''}`,
    maxTokens: 4096
  })

  return result.toDataStreamResponse()
}
```

---

## 🚀 Quick Start

```bash
git clone https://github.com/mk-knight23/AI-VIBE-WEBSITE-BUILDER-V2.git
cd AI-VIBE-WEBSITE-BUILDER-V2
npm install
cp .env.example .env.local
npx prisma migrate dev
npm run dev  # → http://localhost:3000
```

### Environment Variables

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

---

<div align="center">

**Built with 🎨 by [Kazi Musharraf](https://mkazi.live)**

*Part of the [AI-VIBE Ecosystem](https://github.com/mk-knight23/AI-VIBE-ECOSYSTEM) · Built in India 🇮🇳*

</div>
