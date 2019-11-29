# SEACRIFOG API
This is an Express.js application. The Express.js webserver is defined in `/src/bin/index.js`, tucked out the way. The web-server loads and serves the application - the application root is `./src/app.js`

## Setup DEV environment
The app will look for a PostgreSQL database server and, in accordance with the configuration, try to connect to a specific database. If that database doesn't exist it, then the app will create the database (hopefully) correctly. Note that part of this configuration involves reading data from an old version of the SEACRIFOG database currently, and inserting that into the new database. So to start the application in dev mode, you need a database called `seacrifog_old` to exist on the same PostgreSQL server. `seacrifog_old` is just a restore of the prototype database.

Once the PostgreSQL server is setup, start the app via the following steps:

1. Add a `.env` configuration file to the route of the source code directory (`touch .env`)
2. Add appropriate configuration settings for your machine (see the section on configuration)
3. Install all dependencies: `npm install`
4. Start the dev server: `npm start`

## Setup production environment
1. Configure a Postgis database server somewhere
2. Add a `.env` file with production-sensible values (that correspond with your Postgis server)
3. Start the app: `npm run start:prod`

## Configuration
This is a sample of the environment variables that the app requires to run - specifically in the context of a `.env` file (with the default values shown).

### Example `.env` file with defaults
```
PORT=3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
POSTGRES_HOST=localhost
POSTGRES_USER=postgres
POSTGRES_DATABASE=seacrifog
POSTGRES_PASSWORD=password
POSTGRES_PORT=5432
FORCE_DB_RESET=false
```

### `Node.js` configuration
The express server is started via either of two NPM scripts:

```bash
npm start # This starts the app for development purposes
npm run start:prod  # This starts the app in production mode
```

In both cases an additional environment variable is made available:

- In development environments: `process.env.NODE_ENV === 'development'`
- In production environments: `process.env.NODE_ENV === 'production'`