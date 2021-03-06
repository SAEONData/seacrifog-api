# SEACRIFOG API
This is an Express.js application. The Express.js webserver is defined in `/src/bin/index.js`, tucked out the way. The web-server loads and serves the Express.js application - the application root is `./src/app.js`

# Quickstart (local dev environment)
You need to have Docker and Node.js installed on your machine, then run the following commands / do the following steps:

### Start a PostGIS server
```sh
docker run -p 5432:5432 --name postgis -v postgres11:/var/lib/postgresql/data -e POSTGRES_PASSWORD=password -d mdillon/postgis
```

(And sometimes you need to restart the container on computer start up - use this command `docker container start postgis`)

### Setup the DB
(This is easiest to do with DBeaver, but any PostgreSQL client should work)

- Create a DB called `seacrifog_old`
- Restore `./src/db/seacrifog-protoype.backup` to this database

### Install Node.js dependencies
```sh
npm install
```

### Configure the API to re-create the database on startup
```sh
echo FORCE_DB_RESET=true > .env
```

### Start the API
```sh
npm start
```

### Test that API is running
Go to `http://localhost:3000`


# Setup production environment
1. Configure a Postgis database server somewhere
2. Add a `.env` file with production-sensible values (refer to notes below on "Configuration")
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