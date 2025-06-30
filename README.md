# Resume UI - React Application

A modern, responsive resume matching application built with React.js that features user authentication and AI-powered resume analysis.

## Features

- **Authentication System**: Login/Signup with form validation
- **Modern UI**: Beautiful glass-morphism design with dark theme
- **Resume Matching**: Upload and analyze resumes against job descriptions
- **AI Chat**: Interactive AI assistant for resume analysis
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **File Upload**: Support for multiple file formats (PDF, DOC, DOCX)

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository or download the files
2. Navigate to the project directory:

   ```bash
   cd Resume-UI
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

### Demo Credentials

For testing purposes, use these credentials:

- **Email**: demo@fisecglobal.net
- **Password**: password

## Project Structure

```
src/
├── components/          # Reusable React components
│   ├── Header.js       # Application header
│   ├── ResumeCard.js   # Resume display card
│   ├── SignupModal.js  # Registration modal
│   └── AIChat.js       # AI chat interface
├── pages/              # Main application pages
│   ├── Login.js        # Authentication page
│   └── Dashboard.js    # Main application dashboard
├── styles/             # CSS stylesheets
│   ├── index.css       # Global styles
│   ├── App.css         # App component styles
│   ├── Login.css       # Login page styles
│   ├── Dashboard.css   # Dashboard styles
│   └── Modal.css       # Modal component styles
├── utils/              # Utility functions
│   └── AuthContext.js  # Authentication context
├── App.js              # Main application component
└── index.js            # Application entry point
```

## Technologies Used

- **React 18**: Frontend framework
- **React Router**: Client-side routing
- **Context API**: State management
- **CSS3**: Modern styling with animations
- **Font Awesome**: Icon library
- **Local Storage**: Session persistence

## Features in Detail

### Authentication

- Form validation
- Remember me functionality
- Google login integration (UI ready)
- Password confirmation
- Session persistence

### Dashboard

- Job description input/upload
- Multiple file upload options
- Resume scoring and ranking
- Interactive resume cards
- AI chat assistant

### Design

- Glass-morphism effects
- Responsive grid layouts
- Smooth animations
- Dark theme with purple gradients
- Mobile-first design approach

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm build`: Builds the app for production
- `npm test`: Launches the test runner
- `npm eject`: Ejects from Create React App (one-way operation)

## Customization

### Colors

The application uses a purple gradient theme. You can customize colors by modifying the CSS variables in the respective style files.

### API Integration

The authentication is currently simulated. To integrate with a real backend:

1. Update `AuthContext.js` with actual API endpoints
2. Replace localStorage with secure token management
3. Add proper error handling and loading states

### File Upload

The file upload functionality is ready for backend integration. Update the `handleFileUpload` function in `Dashboard.js` to connect with your file processing API.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the MIT License.
