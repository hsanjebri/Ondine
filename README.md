# ✧ Maison Ondine

An ultra-premium, interactive jewelry commerce experience and 3D ring configurator, built with Next.js and Three.js.

![Maison Ondine](https://images.unsplash.com/photo-1599643478514-4a884f180708?q=80&w=2000&auto=format&fit=crop)

## ✦ Overview

Maison Ondine showcases a state-of-the-art e-commerce interface designed for luxury jewelry. It features a fully interactive 3D ring composer, ultra-smooth scrolling mechanics, and premium aesthetic interactions powered by advanced WebGL and animation libraries.

The project is deployed and available at: [Ondine on Vercel](https://ondine-silk.vercel.app/)

## ✦ Key Features

- **3D Ring Composer**: A high-fidelity WebGL configurator allowing users to customize ring bands and gems in real-time.
- **Premium Animations**: Cinematic entrance animations, scroll-linked transitions, and typographic reveals.
- **Fluid Smooth Scrolling**: Hardware-accelerated smooth scrolling using Lenis.
- **Dynamic Media Management**: Automated fetching and blurring of high-quality Unsplash placeholder media.
- **Modern Stack**: Fully utilizing Next.js App Router, React Server Components, and Tailwind CSS v4.

## ✦ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI & Styling**: React 19, Tailwind CSS v4
- **WebGL & 3D**: Three.js, React Three Fiber, React Three Drei
- **Animations**: GSAP, Framer Motion
- **Scroll Handling**: Lenis
- **State Management**: Zustand

## ✦ Getting Started

### Prerequisites

- Node.js (v20 or higher recommended)
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hsanjebri/Ondine.git
   cd Ondine
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Fetch placeholder media** (Optional but recommended)
   ```bash
   npm run seed:images
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## ✦ Scripts

- `npm run dev`: Starts the Next.js development server
- `npm run build`: Creates a production-optimized build
- `npm run start`: Starts the production server
- `npm run lint`: Runs ESLint checks
- `npm run typecheck`: Runs TypeScript type checking without emitting files
- `npm run seed:images`: Fetches and caches Unsplash images specified in the media configuration

## ✦ Architecture & Folders

- `/app`: Next.js App Router pages and layouts.
- `/components`: Modular React components.
  - `/composer`: 3D configurator components.
  - `/home`: Homepage specific sections and scenes.
  - `/ui`: Reusable UI elements (Cursors, Loaders, Buttons).
  - `/motion`: Animation wrappers and transition logic.
- `/lib`: Utility functions, hooks, and configuration files.
- `/store`: Zustand state slices (cart, UI state, composer state).
- `/public`: Static assets, 3D models (`.glb`), and HDRI environments.

## ✦ License

Private & Confidential. All rights reserved.
