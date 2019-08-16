FROM node:12.8-alpine
WORKDIR /app
COPY package-lock.json .
COPY package.json .
RUN npm ci
COPY . .
EXPOSE 3000
CMD [ "npm", "run", "start:prod" ]