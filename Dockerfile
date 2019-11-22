FROM node:12.13-alpine
WORKDIR /app
COPY . .
RUN npm ci
EXPOSE 3000
CMD [ "npm", "run", "start:prod" ]