FROM node:23.10-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build the TypeScript code
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]