# Slide Sage - AI-Powered Presentation Assistant

Slide Sage is an advanced web application designed to help users enhance their Google Slides presentations using artificial intelligence. It provides tools for analyzing content, generating feedback, and interacting with conversational AI agents to refine and create slides directly.

## 1. Functional Specifications

### 1.1 Core Features

- **Google Authentication**: Users can securely sign in with their Google account. The application uses Firebase Authentication and requests the necessary OAuth scopes to interact with Google Drive and Google Slides.
- **Presentation Discovery**: After authenticating, users can connect to their Google Drive to fetch a list of their Google Slides presentations.
- **Presentation Viewer**: Selected presentations are displayed in an embedded `iframe`, providing a read-only view that mirrors the exact appearance of the slides in Google Slides.

### 1.2 AI-Powered Analysis Panel

The main interface is centered around the Analysis Panel, which is organized into several tabs, each offering a distinct AI-powered capability.

- **Analyze Tab**:
    - Users can provide a custom prompt (e.g., "Check for brand consistency") to guide the AI's analysis.
    - The AI processes the entire text content of the presentation and generates slide-specific comments and suggestions.
    - Comments are displayed in a list, and clicking a comment navigates to the corresponding slide.

- **Summary Tab**:
    - After an analysis, users can generate two types of summaries of the AI's comments:
        1.  **Overall Summary**: A single, high-level summary of all feedback.
        2.  **By Slide Summary**: A grouped summary of comments for each slide.

- **Refine (Chat) Tab**:
    - Provides a conversational interface with an AI agent.
    - Users can discuss the analysis results for the currently viewed slide.
    - **Key Action**: The agent is equipped with a tool to **add comments directly to the Google Slide** on the user's behalf. The agent will ask for the comment text if not provided.

- **Create Tab**:
    - A dedicated conversational agent for content creation.
    - **Key Action**: This agent can **create new slides** with a specified title and content. If the user does not provide the necessary information, the agent will intelligently ask for it.
    - After a slide is created, the presentation view automatically refreshes to show the new slide.

- **Research Tab**:
    - A specialized agent equipped with a **Google Search tool**.
    - Users can ask questions that require up-to-date information from the web (e.g., "What are the latest trends in marketing?").
    - The agent performs a (mock) search and provides an informed response, demonstrating how Genkit agents can use external tools.

## 2. Technical Specifications

### 2.1 Technology Stack

- **Frontend**:
    - **Framework**: [Next.js](https://nextjs.org/) (with App Router)
    - **Language**: [TypeScript](https://www.typescriptlang.org/)
    - **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
    - **Styling**: [Tailwind CSS](https://tailwindcss.com/)
    - **State Management**: React Context API for global dashboard state.

- **AI & Backend Logic**:
    - **AI Framework**: [Genkit](https://firebase.google.com/docs/genkit)
    - **Model**: Google's Gemini family of models (e.g., `gemini-2.5-flash`).
    - **Agentic Features**: Genkit flows with tool-use capabilities for adding comments, creating slides, and performing web searches.

- **Backend Services & Authentication**:
    - **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth) (Google Sign-In).
    - **APIs**: [Google Slides API](https://developers.google.com/slides/api) and [Google Drive API](https://developers.google.com/drive/api) for fetching and modifying presentations.

### 2.2 Project Structure

The codebase is organized into the following key directories:

```
src
├── app/                  # Next.js routes and main pages (e.g., login, dashboard).
├── ai/
│   ├── flows/            # Genkit flows defining the logic for each AI agent.
│   └── genkit.ts         # Genkit initialization and configuration.
├── components/
│   ├── ui/               # Reusable UI components from shadcn/ui.
│   └── *.tsx             # Application-specific components (e.g., AnalysisPanel, SlideViewer).
├── contexts/             # React context providers for global state (e.g., DashboardContext).
├── firebase/             # Firebase configuration, initialization, and auth hooks.
├── hooks/                # Custom React hooks (e.g., useToast, useUser).
├── lib/                  # Utility functions, type definitions, and static data.
└── services/             # Functions for interacting with external APIs (Google Slides, Drive).
```

### 2.3 Key Genkit Flows

- `analyze-presentation-and-add-comments.ts`: Analyzes presentation text based on a user prompt and returns structured comment suggestions.
- `conversational-agent.ts`: A multi-tool agent that handles conversations and can trigger actions like `addCommentToSlide` and `createSlide`.
- `google-search-agent.ts`: A specialized agent that uses a `googleSearch` tool to answer questions requiring external information.
- `summarize-comments.ts`: Generates summaries from a list of comments.

## 3. Getting Started

### 3.1 Prerequisites

- Node.js and npm (or a compatible package manager).
- A Firebase project with Firebase Authentication and the Google provider enabled.
- Google Cloud project with the Google Slides API and Google Drive API enabled.

### 3.2 Environment Variables

Create a `.env` file in the root of the project and add your Firebase project configuration and Google Cloud API Key.

```.env
# Firebase Configuration - Replace with your project's config
NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
NEXT_PUBLIC_FIREBASE_APP_ID="1:..."

# Genkit/Gemini API Key
GEMINI_API_KEY="AIza..."
```

### 3.3 Running the Application

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run the Development Server**:
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:9002`.
