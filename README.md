# 🌍 Job Hunter Pro - Remote First

A modern, remote-first job search platform built with Next.js that helps you discover and track remote job opportunities from around the world.

## ✨ Features

- **🌍 Remote-First Job Search**: Exclusively focuses on remote and hybrid positions
- **🎯 Smart Job Matching**: AI-powered algorithm that scores jobs based on your skills and preferences
- **📊 Application Tracking**: Kanban-style board to manage your job applications
- **📅 Interview Scheduler**: Keep track of all your interviews in one place
- **✅ Task Management**: Stay organized with integrated task tracking
- **🕐 Timezone Preferences**: Filter jobs by timezone compatibility
- **🎨 Modern UI**: Beautiful, responsive design with dark mode support

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. (Optional) Set up API keys in `.env.local`:

```env
JSEARCH_API_KEY=your_jsearch_api_key_here
```

> **Note**: The app works without API keys by using web scrapers for remote job boards like We Work Remotely and RemoteOK.

### Running the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🎯 How It Works

1. **Create Your Profile**: Set up your profile with skills, experience, and remote work preferences
2. **Fetch Remote Jobs**: Click "Fetch Jobs" to get personalized remote opportunities
3. **Apply & Track**: Mark jobs as applied and track them through the application process
4. **Schedule Interviews**: Add interviews to your calendar
5. **Manage Tasks**: Create tasks related to your job search

## 🌟 Remote-First Features

- **Automatic Filtering**: Only shows remote and hybrid positions
- **Timezone Indicators**: See which timezones each job supports
- **Remote Work Preferences**: Specify your timezone and remote work setup
- **Async-Friendly**: Highlights jobs that support asynchronous work

## 🔧 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: CSS with CSS Variables
- **State Management**: React Context API
- **Job Sources**: JSearch API, We Work Remotely, RemoteOK, The Muse, Remotive

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.
