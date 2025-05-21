FROM node:23.10-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build app
RUN npm run build

# Install serve to run the build
RUN npm install -g serve

EXPOSE 3000
