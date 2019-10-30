FROM node:12.8-alpine
WORKDIR /app
COPY . .
RUN npm ci
EXPOSE 3000
CMD [ "npm", "run", "start:prod" ]