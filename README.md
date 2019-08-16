# SEACRIFOG API
This is an Express.js application. The Express.js webserver is defined in `/src/bin/index.js`, tucked out the way. The web-server loads and serves the application - the application root is `./src/app.js`

## Setup DEV environment
1. Add a `.env` configuration file to the route of the source code directory (`touch .env`)
2. Add appropriate configuration settings for your machine (see the section on configuration)
3. Install all dependencies: `npm install`
4. Start the dev server: `npm start`

## Setup production environment
1. Add a `.env` file with production-sensible values
3. Start the app: `npm run start:prod`

## Configuration
This is a sample of the environment variables that the app requires to run - specifically in the context of a `.env` file (with the default values shown).

```
PORT=3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
POSTGRES_HOST=localhost
POSTGRES_USER=postgres
POSTGRES_DATABASE=seacrifog
POSTGRES_PASSWORD=password
POSTGRES_PORT=5432
```