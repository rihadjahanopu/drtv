<div align="center">

# 📺 DR TV (tvme)

**A Next-Generation Web IPTV Player with Chromecast & PWA Support**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-State-yellow?style=for-the-badge)](https://zustand-demo.pmnd.rs/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-purple?style=for-the-badge&logo=pwa)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg?style=for-the-badge)](./LICENSE)

</div>

<br/>

## 🚀 Overview

**DR TV** is an advanced, high-performance web-based IPTV player built with cutting-edge web technologies. It allows users to stream live TV seamlessly with full quality controls, modern aesthetics, and the ability to cast directly to smart TVs using Google Chromecast.

Built as a **Progressive Web App (PWA)**, DR TV can be installed on desktop and mobile devices for a native app-like experience.

---

## Live Demo

[Demo for Netlify](https://drtvbd.netlify.app/)
[Demo for Render](https://drtv.onrender.com/)

---

## ✨ Key Features

- **🎥 Advanced HLS Playback:** Rock-solid streaming utilizing `hls.js`, supporting adaptive bitrate streaming and manual quality selection (1080p, 720p, etc).
- **📡 Google Cast Integration:** Cast your favorite live channels directly to your Chromecast-enabled TV.
- **📱 PWA Enabled:** Installable on any mobile or desktop device. Features aggressive frontend caching and offline resilience.
- **⚡ Next.js 16 & React 19:** Utilizing the latest App Router, React Compiler, and Turbopack for lightning-fast compilation and runtime performance.
- **💅 Modern UI/UX:** A stunning, glassmorphism-inspired interface powered by **Tailwind CSS v4** and beautiful **Lucide React** icons.
- **🧠 Global State Management:** Predictable, boilerplate-free state management powered by **Zustand**.
- **🚦 Smart Rewrites:** Integrated API proxying for circumventing CORS issues and securely accessing remote IPTV streams.

---

## 🛠️ Tech Stack

| Technology                                                                | Description                                 |
| ------------------------------------------------------------------------- | ------------------------------------------- |
| **[Next.js 16](https://nextjs.org/)**                                     | React Framework with App Router & Turbopack |
| **[React 19](https://react.dev/)**                                        | Library for building user interfaces        |
| **[Tailwind CSS v4](https://tailwindcss.com/)**                           | Utility-first styling framework             |
| **[Zustand](https://github.com/pmndrs/zustand)**                          | Bear-necessities state management           |
| **[hls.js](https://github.com/video-dev/hls.js/)**                        | JavaScript HLS client for web video         |
| **[@ducanh2912/next-pwa](https://github.com/DuCanhGH/next-pwa)**          | Zero-config PWA Plugin for Next.js          |
| **[Google Cast SDK](https://developers.google.com/cast/docs/web_sender)** | Framework for sending media to Chromecast   |

---

## 🏎️ Getting Started

### Prerequisites

Ensure you have **Node.js 20+** installed on your system.

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/drtv.git
   cd drtv
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the Development Server (with Turbopack):**

   ```bash
   npm run dev
   ```

4. **Access the application:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📺 How to Use Chromecast

1. Ensure your casting device (Smart TV / Chromecast dongle) is on the **same Wi-Fi network** as your browser.
2. Open the app in a supported browser (Google Chrome or Microsoft Edge).
3. Select a live TV channel from the list.
4. Click the **Cast icon** located in the player controls overlay.
5. Select your desired TV from the browser popup.
6. The stream will automatically transfer to your TV!

---

## 📱 Installing the PWA

### On Desktop (Chrome/Edge)

1. Open the app in your browser.
2. Look for the **"Install"** icon in the right side of the address bar.
3. Click Install. DR TV will now be available as a standalone app in your launcher.

### On Mobile (iOS/Android)

1. Open the app in Safari (iOS) or Chrome (Android).
2. Tap the **Share** button (iOS) or the **3-dot menu** (Android).
3. Select **"Add to Home Screen"**.

---

## 📂 Project Structure

Here is an overview of the core project structure:

```text
drtv/
├── public/                 # Static assets (SVG, icons for PWA, etc.)
│   ├── favicon.ico
│   └── globe.svg
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── globals.css     # Global Tailwind CSS styles
│   │   ├── layout.tsx      # Root layout, Google Cast & PWA Meta
│   │   ├── manifest.ts     # PWA Manifest configuration
│   │   └── page.tsx        # Main application page
│   ├── components/         # Reusable React components
│   │   └── IPTVPlayer.tsx  # Core video player with HLS & Cast logic
│   └── store/              # Global state management
│       └── usePlayerStore.ts # Zustand store for active channels
├── next.config.ts          # Next.js, PWA, and Proxy API configuration
├── package.json            # Project dependencies and scripts
└── tailwind.config.ts      # Tailwind CSS configuration (if not using v4 direct imports)
```

---

## 🔧 Architecture & Configuration

### API Proxy Configuration

To bypass browser CORS restrictions when fetching live M3U8 playlists from remote servers, DR TV utilizes Next.js rewrites.
You can find and modify the remote server IP configurations inside `next.config.ts`:

```typescript
async rewrites() {
    return [
        {
            source: "/api/live/:path*",
            destination: "http://YOUR_IPTV_SERVER_IP/:path*",
        },
    ];
}
```

---

## 📄 License

This project is licensed under the **GNU General Public License v3.0** — see the [LICENSE](./LICENSE) file for the full license text.

```
Copyright (C) 2024 Rihad

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
```

---

<div align="center">
  <p>Built with ❤️ by Rihad</p>
</div>
