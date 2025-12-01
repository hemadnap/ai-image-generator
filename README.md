# OPNNG.IO Frontend Application

A modern Vue 3 frontend application with Composition API, featuring Google authentication, Pinia state management, Vue Router, i18n localization, D3 visualizations, and Axios for API communication.

## Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **Composition API** - Modern Vue 3 composition API
- **Vite** - Next generation frontend build tool
- **Pinia** - State management
- **Vue Router** - Client-side routing
- **Vue i18n** - Internationalization
- **Axios** - HTTP client
- **D3.js** - Data visualization
- **FontAwesome** - Icon library
- **Google OAuth** - Authentication

## Project Structure

```
src/
├── api/               # API client and endpoints
├── models/            # Data models
├── services/          # Business logic services
├── components/        # Reusable Vue components
├── stores/            # Pinia stores
├── routes/            # Vue Router configuration
├── utils/             # Utility functions
├── constants/         # Application constants
├── views/             # Page components
├── i18n/              # Internationalization config
├── assets/            # Static assets
├── App.vue            # Root component
└── main.js            # Application entry point
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd opnng.io
```

2. Install dependencies:

```bash
npm install
```

3. Create environment configuration:

```bash
cp .env.example .env.local
```

4. Update `.env.local` with your configuration:

```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_APP_TITLE=OPNNG.IO
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Features

### Authentication

- Google OAuth integration
- Token-based authentication
- Automatic token refresh
- Protected routes

### State Management

- Pinia store for auth, user, and data
- Composition API pattern
- Reactive error handling

### Routing

- Vue Router with lazy-loaded views
- Route guards for authentication
- 404 Not Found page

### Internationalization

- English and Spanish translations
- Language switcher in navbar
- Persistent locale preference

### Components

- Responsive Navbar
- Loading Spinner
- Alert/Notification component
- Card component for content

### Views

- Home page with features
- Login page
- Dashboard with statistics
- User Profile page
- Analytics page with D3 placeholder
- 404 Not Found page

### Utilities

- Date formatting utilities
- String manipulation utilities
- Validation utilities
- D3 chart utilities

### API Integration

- Axios instance with interceptors
- Automatic token injection
- Error handling
- Auth endpoints
- User endpoints
- Data endpoints

## Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_GOOGLE_CLIENT_ID=your_client_id
VITE_APP_TITLE=OPNNG.IO
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint and fix code

## API Integration

The app includes pre-configured API endpoints for:

- **Authentication**: Login with Google, logout, get current user, refresh token
- **Users**: Get user, update profile, get all users
- **Data**: Get dashboard data, get analytics data

All requests automatically include the auth token in the Authorization header.

## Stores (Pinia)

### authStore

- `user` - Current authenticated user
- `isLoading` - Loading state
- `error` - Error message
- `isAuthenticated` - Computed auth status
- Methods: `loginWithGoogle()`, `logout()`, `initializeAuth()`, `clearError()`

### userStore

- `users` - List of users
- `currentUser` - Current user data
- Methods: `fetchUserById()`, `updateUserProfile()`, `fetchAllUsers()`

### dataStore

- `dashboardData` - Dashboard data
- `analyticsData` - Analytics data
- Methods: `fetchDashboardData()`, `fetchAnalyticsData()`

## Localization

Translations are stored in `src/i18n/index.js`. Currently supports:

- English (en)
- Spanish (es)

Add new translations in the respective language objects.

## D3 Integration

D3.js is available for data visualization. The `analyticsData` view includes placeholders for D3 charts. Use the utility functions in `src/utils/chartUtils.js` for data processing.

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google OAuth API
4. Create OAuth credentials (Web application)
5. Add authorized origins and redirect URIs
6. Copy the Client ID to your `.env.local` file

## Contributing

1. Follow the existing code structure
2. Use Composition API for new components
3. Add new translations to i18n
4. Keep components reusable and modular

## License

MIT

## Support

For issues and questions, please open an issue in the repository.
