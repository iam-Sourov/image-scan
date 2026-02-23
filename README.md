# 🛡️ AI Image Authenticator

An enterprise-grade, high-performance web application designed to detect AI-generated and deepfake images with precision. Built with a modern, glassmorphic UI, it seamlessly integrates with the Hugging Face Inference API to analyze pixel noise, edge discrepancies, and compression artifacts to accurately determine image authenticity.


## ✨ Features

- **Immersive Glassmorphism UI**: A clean, modern landing page with beautifully crafted, animated UI components.
- **Advanced File Upload**: Drag-and-drop zone using `react-dropzone` with client-side validation (JPEG, PNG, WebP) and strict 5MB size limits.
- **URL Scanning Support**: Directly fetch and analyze images via external URLs seamlessly.
- **Real-Time Processing UI**: A simulated "laser scanning" visual overlay during image analysis.
- **Authenticity Dashboard**:
  - **Recharts Gauge**: A circular progress gauge showing the exact % probability of being "Human-Made" versus "AI-Generated."
  - **Verdict Badge**: Instantly displays "Likely Authentic" (Green) or "Likely AI" (Red).
  - **Metadata & Artifact Extraction**: Displays image format, size, and simulated detection breakdown.
- **History Sidebar**: Uses `localStorage` to keep a browsable, visual history of recent scans with thumbnail previews and easy "Clear History" capabilities.
- **Intelligent API Backend**: Securely acts as a bridge to Hugging Face's open-source machine learning vision models.
- **Fully Responsive & Dark Mode Supported**: Uses `next-themes` and Tailwind frameworks to achieve a flawless layout across all devices.

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui (Radix UI Primitive)
- **Animations**: Framer Motion & Tailwind Animate CSS
- **Icons**: Lucide React
- **Data Visualization**: Recharts
- **State Management**: React Hooks & LocalStorage
- **AI Engine**: Hugging Face Inference API (`@huggingface/inference`)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed on your local machine.
- A free Hugging Face account and API Key.

### 1. Clone the repository
```bash
git clone https://github.com/your-username/ai-image-authenticator.git
cd ai-image-authenticator
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env.local` file in the root directory:
```bash
touch .env.local
```
Add your Hugging Face API Key to the file:
```env
HUGGINGFACE_API_KEY="your_huggingface_api_key_here"
```
*(You can get a free key by creating an account at [Hugging Face](https://huggingface.co/settings/tokens) and generating a new "Read" Access Token).*

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to start scanning!

## 🧠 AI Detection Engine

The backend securely interacts with the Hugging Face API. By default, it runs the `umm-maybe/AI-image-detector` model. 
The custom logic inside `app/api/detect/route.ts` parses the exact confidence percentages mapping "human", "real", "fake", and "artificial" labels natively provided by the engine into our visual Recharts dashboard.

## 💡 Customization

- **Change AI Model**: You can swap the detection model by editing the `model: "umm-maybe/AI-image-detector"` string inside `app/api/detect/route.ts` to any other Vision classification model on Hugging Face.
- **Theme**: UI colors (`Slate`, `Emerald`, `Indigo`) can be adjusted directly through `tailwind.config.ts` or the individual components.

## 📝 License

This project is licensed under the [MIT License](LICENSE).
