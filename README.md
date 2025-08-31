# Project Manager

A modern web application for uploading and managing projects with images and videos. Built with Next.js, MongoDB, and Cloudinary.

## Features

- 📤 **Upload Projects**: Upload images with project titles and video URLs
- 📋 **View Projects**: Browse all uploaded projects in a beautiful grid layout
- 🗑️ **Delete Projects**: Remove projects from the database with confirmation
- 🎨 **Modern UI**: Clean, responsive design with dark/light mode support
- 🔒 **Type Safety**: Full TypeScript support throughout the application

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **File Storage**: Cloudinary
- **Styling**: Tailwind CSS with custom design system

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database
- Cloudinary account

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Configuration
MONGOURI=your_mongodb_connection_string
MONGO_DATABASE=your_database_name

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_CLOUD_API=your_cloudinary_api_key
CLOUDINARY_CLOUD_API_SECRET=your_cloudinary_api_secret

# NextAuth.js Configuration
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=http://localhost:3000
```

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Upload a Project
1. Navigate to the home page
2. Fill in the project title and video URL
3. Select an image file (PNG, JPG, WebP up to 5MB)
4. Click "Upload Project"

### View Projects
1. Click "View Projects" in the navigation
2. Browse all uploaded projects in a grid layout
3. Click "Watch Video" to open the video URL
4. Click the delete button (🗑️) to remove a project

## API Endpoints

- `POST /api/upload` - Upload a new project
- `GET /api/projects` - Fetch all projects
- `DELETE /api/projects/[id]` - Delete a specific project

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── upload/route.ts          # Upload endpoint
│   │   └── projects/
│   │       ├── route.ts             # Get all projects
│   │       └── [id]/route.ts        # Delete project
│   ├── components/
│   │   ├── ImageUploader.tsx        # Upload form component
│   │   └── Navigation.tsx           # Navigation component
│   ├── projects/
│   │   └── page.tsx                 # Projects listing page
│   ├── globals.css                  # Global styles
│   ├── layout.tsx                   # Root layout
│   └── page.tsx                     # Home page
└── lib/
    └── mongo.ts                     # MongoDB connection
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add the following environment variables in Vercel dashboard:
   - `MONGOURI`
   - `MONGO_DATABASE`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_CLOUD_API`
   - `CLOUDINARY_CLOUD_API_SECRET`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (set to your production domain)
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

Make sure to set all required environment variables in your deployment platform.

## Security Notes

- Never commit your `.env.local` file
- Use strong, unique values for `NEXTAUTH_SECRET`
- Ensure your MongoDB database has proper access controls
- Use HTTPS in production

## License

This project is open source and available under the [MIT License](LICENSE).
