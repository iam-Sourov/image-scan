<div align="center">

# 🛡️ AI Image Authenticator

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)
[![Hugging Face](https://img.shields.io/badge/Hugging_Face-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black)](https://huggingface.co/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

An enterprise-grade, high-performance web application designed to detect AI-generated and deepfake images with precision. Built with a modern, glassmorphic UI, it seamlessly integrates with the **Hugging Face Inference API** to analyze pixel noise, edge discrepancies, and compression artifacts to accurately determine image authenticity.

[Report Bug](https://github.com/iam-Sourov/image-scan/issues) · [Request Feature](https://github.com/iam-Sourov/image-scan/issues)

</div>

<br />

## ✨ Key Features

- **Immersive Glassmorphism UI**: A clean, modern landing page with beautifully crafted, animated UI components powered by Framer Motion.
- **Advanced File Upload**: Drag-and-drop zone using `react-dropzone` with client-side validation (JPEG, PNG, WebP) and 5MB size limits.
- **URL Scanning Support**: Directly fetch and analyze images via external URLs seamlessly.
- **Real-Time Processing UI**: A simulated "laser scanning" visual overlay during image analysis.
- **Authenticity Dashboard**:
  - **Recharts Gauge**: A circular progress gauge showing the exact % probability of being "Human-Made" versus "AI-Generated."
  - **Verdict Badge**: Instantly displays "Likely Authentic" (Green) or "Likely AI" (Red).
  - **Metadata & Artifact Extraction**: Displays image format, size, and simulated detection breakdown.
- **History Sidebar**: Uses `localStorage` to keep a browsable, visual history of recent scans with thumbnail previews and "Clear History" capabilities.
- **Intelligent API Backend**: Securely acts as a bridge to Hugging Face's open-source machine learning vision models with automatic retry and error handling logic.
- **Fully Responsive & Dark Mode Supported**: Uses `next-themes` and Tailwind frameworks to achieve a flawless layout across all devices.

## 🛠 Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI Primitive)
- **Animations**: Framer Motion & Tailwind Animate CSS
- **Icons**: Lucide React
- **Data Visualization**: Recharts
- **State Management**: React Hooks & LocalStorage

### Backend & AI
- **API Routes**: Next.js Serverless API Routes
- **AI Engine**: Hugging Face Inference API (`@huggingface/inference`)
- **Default Model**: `umm-maybe/AI-image-detector`

---

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites

- **Node.js**: v18+ installed on your local machine.
- **Hugging Face Account**: A free account and Access Token (API Key).

### 1. Clone the repository

```bash
git clone https://github.com/iam-Sourov/image-scan.git
cd image-scan
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

*(You can get a free key by creating an account at [Hugging Face Settings](https://huggingface.co/settings/tokens) and generating a new "Read" Access Token).*

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start scanning!

---

## 🧠 AI Detection Engine & Backend

The backend securely interacts with the Hugging Face API via the official `@huggingface/inference` Node.js SDK. By default, it runs the robust `umm-maybe/AI-image-detector` model. 

The custom logic inside `app/api/detect/route.ts`:
1. Receives a Blob or fetches a URL image natively.
2. Reconstructs a clean Data Blob with robust MIME typing to avoid Next.js payload serialization issues.
3. Automatically implements a retry mechanism (up to 4 cold-start retries) if the Hugging Face model is loading.
4. Parses the exact confidence percentages (mapping "human", "real", "fake", and "artificial" labels).
5. Returns a unified verdict object directly into the visual Recharts dashboard.

---

## 💡 Customization

- **Change AI Model**: You can swap the detection model by editing the `model: "umm-maybe/AI-image-detector"` string inside `app/api/detect/route.ts` to any other Vision classification model on Hugging Face.
- **Theme & Colors**: UI colors (`Slate`, `Emerald`, `Indigo`) can be adjusted directly through `tailwind.config.ts`, `globals.css` or the individual components.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Sourov** 
- GitHub: [@iam-Sourov](https://github.com/iam-Sourov)

---
<div align="center">
  <i>Built with ❤️ using Next.js and Hugging Face.</i>
</div>
