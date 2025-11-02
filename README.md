<div align="center">
<img width="1200" height="475" alt="MedAI Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# 🏥 MedAI - Verdant Health AI Assistant

**An intelligent AI-powered healthcare assistant that streamlines patient consultations and medical documentation**

[![React](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF.svg)](https://vitejs.dev/)
[![Google Gemini AI](https://img.shields.io/badge/Gemini%20AI-Powered-4285F4.svg)](https://ai.google.dev/)

[🚀 Live Demo](https://ai.studio/apps/drive/1anfcKLgiTdAkdZSn9HbsHqZe9ahLlLfr) • [📖 Documentation](#documentation) • [🤝 Contributing](#contributing)

</div>

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Integration](#api-integration)
- [Internationalization](#internationalization)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

MedAI is a sophisticated healthcare assistant designed to revolutionize the patient consultation process. It acts as an intelligent intermediary between patients and healthcare providers, gathering comprehensive patient information including symptoms, medical history, and lab reports before consultations to generate detailed summaries for physicians.

### 🎪 Key Benefits

- **Streamlined Consultations**: Reduces consultation time by pre-gathering patient information
- **Comprehensive Documentation**: Generates detailed medical reports with AI-powered insights
- **Multilingual Support**: Available in English and Hindi for broader accessibility
- **Voice Integration**: Supports voice input for hands-free interaction
- **File Upload**: Accepts medical reports in PDF, JPG, and PNG formats
- **Patient Management**: Maintains organized patient records and consultation history

## ✨ Features

### 🤖 AI-Powered Chat Interface
- Interactive conversational AI using Google Gemini
- Voice input support with microphone integration
- Real-time typing indicators and smooth animations
- File attachment support for medical documents

### 📊 Intelligent Report Generation
- Automated medical report creation from chat conversations
- Key highlights extraction and summarization
- Professional formatting for healthcare providers
- Print-ready consultation summaries

### 👥 Patient Management Dashboard
- Comprehensive patient records management
- Consultation history tracking
- Search and filter capabilities
- Visual consultation timeline

### 🌐 Multilingual Support
- English and Hindi language support
- Dynamic language switching
- Localized UI components and messages

### 🎨 Modern UI/UX
- Responsive design with gradient backgrounds
- Smooth animations and transitions
- Custom scrollbars and loading states
- Professional healthcare-themed interface

## 🛠 Tech Stack

### Frontend
- **React 19.2.0** - Modern UI library with latest features
- **TypeScript 5.8.2** - Type-safe development
- **Vite 6.2.0** - Fast build tool and development server

### AI & Services
- **Google Gemini AI** - Advanced language model for medical conversations
- **@google/genai 1.28.0** - Official Google AI SDK

### Development Tools
- **ESLint & Prettier** - Code quality and formatting
- **Tailwind CSS** - Utility-first CSS framework (implied from styling)

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Google Gemini API Key**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/medai.git
   cd medai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your Gemini API key to `.env.local`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
MedAI/
├── components/           # React components
│   ├── icons/           # SVG icon components
│   ├── ChatHeader.tsx   # Chat interface header
│   ├── ChatInput.tsx    # Message input component
│   ├── ChatView.tsx     # Main chat interface
│   ├── DashboardView.tsx # Patient dashboard
│   ├── ReportView.tsx   # Medical report display
│   └── ...
├── context/             # React context providers
│   └── LanguageContext.tsx
├── locales/             # Internationalization files
│   ├── en.json         # English translations
│   └── hi.json         # Hindi translations
├── services/            # API and external services
│   └── geminiService.ts # Google Gemini AI integration
├── utils/               # Utility functions
│   └── audioUtils.ts   # Audio processing utilities
├── types.ts            # TypeScript type definitions
├── mockData.ts         # Sample data for development
└── App.tsx             # Main application component
```

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Required: Google Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Development settings
VITE_APP_TITLE=MedAI
VITE_API_BASE_URL=https://api.example.com
```

### Gemini AI Setup

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add the key to your `.env.local` file
4. Ensure your API key has access to Gemini Pro model

## 📖 Usage

### Starting a New Consultation

1. **Dashboard Navigation**: Click "New Consultation" from the dashboard
2. **Patient Interaction**: Engage with the AI assistant to gather patient information
3. **File Upload**: Attach relevant medical documents (PDF, JPG, PNG)
4. **Voice Input**: Use the microphone for hands-free interaction
5. **Report Generation**: Click "Generate Report" to create a comprehensive medical summary

### Managing Patient Records

- **Search**: Use the search bar to find specific patients
- **View History**: Click on any patient to view their consultation history
- **Report Access**: Access previous reports and summaries

### Language Switching

- Use the language switcher in the top navigation
- All UI elements and AI responses adapt to the selected language

## 🔌 API Integration

### Gemini AI Service

The application integrates with Google's Gemini AI through the `geminiService.ts`:

```typescript
// Example usage
import { generateReport, extractPatientName } from './services/geminiService';

const report = await generateReport(messages, files);
const patientName = await extractPatientName(messages);
```

### Key Functions

- `generateReport()` - Creates comprehensive medical reports
- `generateReportHighlights()` - Extracts key medical insights
- `extractPatientName()` - Identifies patient from conversation

## 🌍 Internationalization

The app supports multiple languages through a robust i18n system:

### Adding New Languages

1. Create a new JSON file in `/locales/` (e.g., `es.json`)
2. Add translations for all keys from `en.json`
3. Update the `LanguageContext.tsx` to include the new language
4. Add language option to the `LanguageSwitcher` component

### Translation Keys

All UI text uses translation keys defined in locale files:

```json
{
  "dashboardTitle": "Doctor's Dashboard",
  "newConsultation": "New Consultation",
  "generateReport": "Generate Report"
}
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Maintain component modularity
- Add proper error handling
- Include appropriate comments
- Test thoroughly before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for powering the intelligent conversations
- **React Team** for the amazing framework
- **Vite** for the lightning-fast development experience
- **Healthcare professionals** who inspired this solution

---

<div align="center">

**Built with ❤️ for better healthcare**

[⭐ Star this repo](https://github.com/yourusername/medai) • [🐛 Report Bug](https://github.com/yourusername/medai/issues) • [💡 Request Feature](https://github.com/yourusername/medai/issues)

</div>
