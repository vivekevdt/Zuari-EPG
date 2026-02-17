
# Zuari EPG | AI Policy Navigator

**Zuari EPG (Employee Policy Gateway)** is an AI-powered internal portal designed to provide instant access to company guidelines, benefits, and HR procedures. It leverages a modern tech stack to deliver a seamless and secure experience for employees.

## 🚀 Features

*   **AI-Powered Chatbot**: Ask questions about HR policies in natural language and get accurate, context-aware answers.
*   **Vector Search**: Utilizes LanceDB for efficient similarity search across policy documents.
*   **Secure Authentication**: JWT-based authentication ensures only authorized employees can access the portal.
*   **Responsive Design**: A beautiful, responsive UI built with React and Tailwind CSS, featuring a custom "Zuari Blue" theme.
*   **Admin Dashboard**: (Planned) Manage users and upload new policy documents.

## 🛠️ Tech Stack

### Frontend
*   **React**: UI library for building interactive interfaces.
*   **Vite**: Next-generation frontend tooling.
*   **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
*   **Lottie React**: For adding lightweight animations.

### Backend
*   **Node.js & Express**: Robust backend server environment.
*   **MongoDB**: Primary database for user management and chat history.
*   **LanceDB**: Vector database for storing and querying policy embeddings.
*   **Google Gemini API**: LLM for generating intelligent responses and embeddings (`gemini-1.5-pro` & `embedding-004`).

## 📦 Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone <repository_url>
    cd hr-chatbot
    ```

2.  **Install Dependencies**
    ```bash
    # Install root dependencies (if any)
    npm install

    # Install Backend Dependencies
    cd backend
    npm install

    # Install Frontend Dependencies
    cd ../frontend
    npm install
    ```

3.  **Environment Configuration**
    *   Create a `.env` file in the `backend` directory.
    *   Add the following variables:
        ```env
        PORT=5000
        MONGO_URI=mongodb://localhost:27017/hr_chatbot
        JWT_SECRET=your_jwt_secret_key
        GEMINI_API_KEY=your_gemini_api_key
        ORIGIN=http://localhost:5173
        ```
    *   Create a `.env` file in the `frontend` directory.
    *   Add the following variable:
        ```env
        VITE_BACKEND_URL=http://localhost:5000
        ```

4.  **Ingest Policy Documents**
    *   Place your policy documents (PDF/DOCX) in the `backend/files` directory.
    *   Run the ingestion script:
        ```bash
        cd backend
        npm run ingest
        ```

5.  **Run the Application**
    *   Start the backend server:
        ```bash
        cd backend
        npm run dev
        ```
    *   Start the frontend development server:
        ```bash
        cd frontend
        npm run dev
        ```

## 📂 Project Structure

```
hr-chatbot/
├── backend/
│   ├── src/
│   │   ├── config/         # Environment & Database config
│   │   ├── controllers/    # Route controllers
│   │   ├── db/             # LanceDB setup
│   │   ├── middleware/     # Auth & Error middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── scripts/        # Ingestion scripts
│   │   ├── services/       # AI & Chat logic
│   │   └── utils/          # Helper functions (embeddings, chunking)
│   ├── .env                # Backend environment variables
│   └── server.js           # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── assets/         # Images & Animations
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Auth Context
│   │   ├── pages/          # Application Pages (Login, Dashboard)
│   │   └── api.js          # API Service
│   ├── .env                # Frontend environment variables
│   └── tailwind.config.js  # Tailwind configuration
│
└── README.md               # Project documentation
```

## 🤝 Contributing

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/YourFeature`).
3.  Commit your changes (`git commit -m 'Add some feature'`).
4.  Push to the branch (`git push origin feature/YourFeature`).
5.  Open a Pull Request.

## 📄 License

This project is licensed under the MIT License.
