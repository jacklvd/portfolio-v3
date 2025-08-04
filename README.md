# 🖥️ Portfolio

A modern, responsive portfolio website built with Next.js 14, featuring a unique macOS terminal aesthetic with dark/light theme support.

## ✨ Features

- **🖥️ macOS Terminal Design**: Authentic terminal window styling with command-line interfaces
- **🌓 Theme Switching**: Seamless dark/light mode with `next-themes`
- **📱 Fully Responsive**: Mobile-first design with optimized layouts for all devices
- **🎨 Modern UI Components**: Built with Radix UI and Tailwind CSS
- **🎯 Interactive Animations**: Smooth transitions powered by Framer Motion
- **📊 CMS Integration**: Content management with Sanity CMS
- **⚡ Performance Optimized**: Next.js 14 with App Router and TypeScript
- **🔧 Developer Experience**: ESLint, Prettier, Husky, and lint-staged setup

## 🚀 Tech Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **next-themes** - Theme management

### UI Components

- **Radix UI** - Headless UI components
- **Lucide React** - Icon library
- **React Hook Form** - Form management
- **Zod** - Schema validation

### CMS & Data

- **Sanity CMS** - Content management system
- **Sanity Image URL** - Image optimization

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **lint-staged** - Pre-commit linting

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- Yarn (recommended), npm, pnpm, or bun

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/jacklvd/portfolio-v3.git
cd portfolio-v3
```

1. **Install dependencies**

```bash
yarn install
# or
npm install
# or
pnpm install
```

1. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2023-05-03
```

1. **Run the development server**

```bash
yarn dev
# or
npm run dev
# or
pnpm dev
# or
bun dev
```

Open [https://localhost:3000](https://localhost:3000) with your browser to see the result.

## 📁 Project Structure

```text
portfolio-v3/
├── app/                    # Next.js 14 App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── globals.css        # Global styles
│   └── meet-jack/         # Portfolio sections
│       └── components/    # Section components
├── components/            # Reusable UI components
│   ├── ui/               # Shadcn/ui components
│   ├── magicui/          # Custom animated components
│   └── styles/           # Component-specific styles
├── client/               # Sanity CMS client
├── constants/            # App constants
├── context/              # React contexts
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── public/               # Static assets
└── types/                # TypeScript definitions
```

## 🎨 Design Features

### macOS Terminal Aesthetic

- Authentic terminal window headers with red, yellow, green controls
- Command-line interface styling throughout
- Unix-style prompts and commands
- Monospace font for authentic terminal feel

### Responsive Design

- Mobile-first approach
- Optimized layouts for all screen sizes
- Touch-friendly interactions
- Adaptive content display

### Theme System

- Dark and light mode support
- Smooth theme transitions
- Theme-aware components
- System preference detection

## 🚀 Performance

- **Next.js 14** with App Router for optimal performance
- **Image Optimization** with Next.js Image component
- **Code Splitting** for faster loading
- **TypeScript** for better development experience
- **Tailwind CSS** for minimal CSS bundle size

## 📱 Sections

- **About** - Personal introduction with terminal-style bio
- **Experience** - Professional journey with company terminals
- **Projects** - Portfolio showcase with live demos
- **Publications** - Articles and blog posts
- **Contact** - Get in touch form and social links

## 🛠️ Development

### Available Scripts

```bash
yarn dev             # Start development server
yarn build           # Build for production
yarn start           # Start production server
yarn lint            # Run ESLint
yarn format          # Format code with Prettier
yarn format:check    # Check code formatting
```

### Code Quality

This project uses several tools to maintain code quality:

- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **Husky** - Git hooks for pre-commit checks
- **lint-staged** - Run linters on staged files
- **TypeScript** - Static type checking

## 🚀 Deployment

### Vercel (Recommended)

The easiest way to deploy this Next.js app is using [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme):

1. Push your code to GitHub
1. Import your repository in Vercel
1. Add your environment variables
1. Deploy!

### Other Platforms

This app can be deployed on any platform that supports Next.js:

- **Netlify**
- **Railway**
- **DigitalOcean App Platform**
- **AWS Amplify**

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

⭐ Don't forget to star this repo if you found it helpful!
