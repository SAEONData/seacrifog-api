# Setup DEV environment
1. Add a `.env` configuration file to the route of the source code directory (`touch .env`)
2. Add appropriate configuration settings for your machine (see the section on configuration)
3. Install all dependencies: `npm install`
4. Start the dev server: `npm run dev`

# Setup production environment
1. Configure the Node.js environment however best this is done in the context of your deployment
2. Add appropriate configuration settings for your machine (see the section on configuration)
3. Start the app: `npm run start:prod`

# Configuration
This is a sample of the environment variables that the app requires to run - specifically in the context of a `.env` file.

```
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```