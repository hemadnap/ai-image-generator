# AI Image Generator

A modern Vue.js application for generating AI images using Replicate's API. Built with Vue 3 Composition API, Tailwind CSS, and modern development tools.

## Features

- 🎨 Generate AI images from text prompts
- 🚀 Vue 3 with Composition API
- 🎯 Multiple AI models (FLUX Kontext Pro, Stable Diffusion XL, FLUX Schnell)
- 🎭 Various art styles (Photorealistic, Digital Art, Oil Painting, etc.)
- 📱 Responsive design with Tailwind CSS
- 💾 Download generated images
- ⚡ Fast and modern development with Vite
- 🎪 Beautiful animations and transitions

## Tech Stack

- **Frontend Framework**: Vue.js 3 (Composition API)
- **Styling**: Tailwind CSS + SCSS
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **AI Service**: Replicate API
- **Language**: JavaScript

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Replicate API account and token

## Quick Start

1. **Clone and setup the project**
   ```bash
   git clone <repository-url>
   cd ai-image-generator
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Replicate API token:
   ```
   VITE_REPLICATE_API_TOKEN=your_actual_api_token_here
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   
   Navigate to `http://localhost:3000`

## Getting a Replicate API Token

1. Sign up at [Replicate.com](https://replicate.com)
2. Go to your [API tokens page](https://replicate.com/account/api-tokens)
3. Create a new token
4. Copy the token to your `.env` file

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code with ESLint

## Project Structure

```
src/
├── components/
│   └── ImageGenerator.vue    # Main image generation component
├── composables/
│   └── useImageGeneration.js # Vue composable for image generation logic
├── services/
│   ├── http.js              # Axios HTTP client configuration
│   └── replicate.js         # Replicate API service
├── styles/
│   ├── main.scss           # Main stylesheet with Tailwind imports
│   └── variables.scss      # SCSS variables
├── App.vue                 # Root component
└── main.js                # Application entry point
```

## Features in Detail

### Image Generation
- Support for multiple AI models
- Style presets for different art types
- Configurable aspect ratios
- Real-time generation status
- Error handling and user feedback

### User Interface
- Clean, modern design
- Responsive layout for all devices
- Smooth animations and transitions
- Accessible form controls
- Image gallery with download functionality

### Technical Features
- Vue 3 Composition API for better code organization
- Axios interceptors for request/response handling
- SCSS variables for consistent styling
- Tailwind CSS for rapid UI development
- Environment-based configuration

## Supported AI Models

- **FLUX Kontext Pro**: Advanced context-aware image generation with superior quality (default)
- **Stable Diffusion XL**: High-quality general-purpose image generation
- **FLUX Schnell**: Fast, high-quality image generation
- **SDXL Turbo**: Optimized for speed

## Art Styles

- Default
- Photorealistic
- Artistic
- Digital Art
- Oil Painting
- Watercolor
- Sketch
- Anime

## Development

### Adding New Models

1. Update the models array in `ImageGenerator.vue`
2. Add model-specific configuration in `replicate.js`
3. Test with different prompts and styles

### Customizing Styles

1. Modify the `enhancePrompt` method in `replicate.js`
2. Add new style options in `ImageGenerator.vue`
3. Update the styles array with new options

### Environment Variables

- `VITE_REPLICATE_API_TOKEN`: Your Replicate API token (required)
- `VITE_API_BASE_URL`: Base URL for API calls (optional)
- `VITE_APP_NAME`: Application name
- `VITE_DEV_MODE`: Development mode flag

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Check the [Issues](./issues) page
- Review the Replicate API documentation
- Check Vue.js and Tailwind CSS documentation

## Acknowledgments

- [Replicate](https://replicate.com) for providing AI model APIs
- [Vue.js](https://vuejs.org) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework
- [Vite](https://vitejs.dev) for the fast build tool
