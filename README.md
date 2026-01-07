# Read It Later

A distraction-free reading platform for saving and managing long-form content. Save articles, PDFs, and text for focused reading with an intuitive interface featuring text highlighting, notes, and AI-powered discussions.

## Features

- 📚 **Save & Organize** - Save articles, PDFs, and text content for later reading
- 👁️ **Distraction-Free Reading** - Clean, focused reading interface
- 🎯 **Highlights & Notes** - Mark important passages and add personal notes
- 🤖 **AI Chat** - Discuss content with AI-powered chat assistant
- 📖 **Document Library** - Browse and manage all your saved content
- 🔐 **OAuth Authentication** - Secure user authentication
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS
- 📊 **Analytics** - Optional Umami analytics integration

## Tech Stack

### Frontend

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Radix UI** - Component library
- **React Hook Form** - Form management
- **TanStack React Query** - Data fetching
- **tRPC** - Type-safe API communication

### Backend

- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **tRPC** - Type-safe API
- **Drizzle ORM** - Database ORM

### Database

- **MySQL** - Primary database

### Other Tools

- **pnpm** - Package manager
- **Vitest** - Testing framework
- **Prettier** - Code formatting
- **TSConfig** - TypeScript configuration

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- MySQL database

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd "read it later"
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:

   ```env
   # Application
   PORT=3000
   NODE_ENV=development

   # Database
   DATABASE_URL=mysql://user:password@localhost:3306/readitlater

   # Authentication
   JWT_SECRET=your-secret-key-here
   OAUTH_SERVER_URL=https://your-oauth-server.com

   # Client OAuth
   VITE_OAUTH_PORTAL_URL=https://your-oauth-server.com
   VITE_APP_ID=your-app-id

   # Optional: Analytics
   VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
   VITE_ANALYTICS_WEBSITE_ID=your-website-id

   # Optional: LLM & Cloud Services
   BUILT_IN_FORGE_API_KEY=your-api-key
   BUILT_IN_FORGE_API_URL=https://forge.manus.im
   ```

4. **Set up database**

   ```bash
   pnpm run db:push
   ```

5. **Start development server**

   ```bash
   pnpm run dev
   ```

   The app will be available at `http://localhost:3000`

## Development

### Available Scripts

- `pnpm run dev` - Start development server with hot reload
- `pnpm run build` - Build for production
- `pnpm start` - Run production build
- `pnpm run check` - Type-check with TypeScript
- `pnpm run format` - Format code with Prettier
- `pnpm run test` - Run tests with Vitest
- `pnpm run db:push` - Generate and run database migrations

### Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components (Home, Library, etc.)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities (tRPC client, utils)
│   │   ├── types/         # TypeScript types
│   │   ├── contexts/      # React contexts
│   │   └── const.ts       # Constants and OAuth config
│   ├── index.html         # HTML entry point
│   └── vite.config.ts     # Vite configuration
├── server/                # Express backend
│   ├── _core/
│   │   ├── index.ts       # App entry point
│   │   ├── oauth.ts       # OAuth routes
│   │   ├── sdk.ts         # OAuth service SDK
│   │   ├── env.ts         # Environment config
│   │   ├── trpc.ts        # tRPC router setup
│   │   └── ...
│   ├── api-routes.ts      # API endpoints
│   ├── routers.ts         # tRPC routers
│   └── ...
├── drizzle/               # Database
│   ├── schema.ts          # Database schema
│   ├── relations.ts       # Entity relationships
│   └── migrations/        # Migration files
├── shared/                # Shared code
│   ├── types.ts           # Shared types
│   └── const.ts           # Shared constants
└── package.json           # Dependencies

```

## Configuration

### OAuth Setup

To enable user authentication:

1. Register your application with your OAuth provider
2. Get your OAuth Server URL and App ID
3. Configure in `.env`:
   ```env
   OAUTH_SERVER_URL=https://oauth.example.com
   VITE_OAUTH_PORTAL_URL=https://oauth.example.com
   VITE_APP_ID=your-app-id
   ```

### Database Setup

Update the `DATABASE_URL` in `.env`:

```env
DATABASE_URL=mysql://username:password@host:port/database_name
```

Then run migrations:

```bash
pnpm run db:push
```

### Analytics Setup (Optional)

To enable Umami analytics:

```env
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=your-website-id
```

## API Documentation

The application uses **tRPC** for type-safe API communication. All API routes are defined in:

- [server/routers.ts](server/routers.ts) - Main router definitions
- [server/\_core/trpc.ts](server/_core/trpc.ts) - tRPC setup
- [server/api-routes.ts](server/api-routes.ts) - Additional API routes

### Key Routes

- `/api/oauth/callback` - OAuth authentication callback
- `/api/trpc/*` - tRPC API endpoints (automatically generated)

## Testing

Run tests with Vitest:

```bash
pnpm run test
```

Test files are located alongside the code with `.test.ts` extension.

## Building for Production

1. **Build the application**

   ```bash
   pnpm run build
   ```

2. **Start production server**
   ```bash
   pnpm start
   ```

The build process:

- Bundles the React client with Vite
- Bundles the Express server with esbuild
- Outputs to the `dist/` directory

## Troubleshooting

### Environment Variables Not Defined

If you see warnings about undefined variables like `%VITE_ANALYTICS_ENDPOINT%`:

- Add the missing variables to your `.env` file
- Restart the development server

### OAuth Configuration Error

If you see "Invalid URL" or OAuth-related errors:

- Verify `VITE_OAUTH_PORTAL_URL` and `VITE_APP_ID` are set in `.env`
- Check that the OAuth provider URL is correct and accessible
- Restart the development server

### Database Connection Error

If the database connection fails:

- Verify `DATABASE_URL` is correct
- Ensure MySQL server is running
- Check database credentials and permissions

### PowerShell Execution Policy

If running `pnpm` fails on Windows with security errors:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## License

MIT

## Support

For issues and questions, please open an issue on the repository.
