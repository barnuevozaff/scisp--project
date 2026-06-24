# backend/Dockerfile
# Builds a minimal production image for the SCISP backend API.
FROM node:20-alpine

WORKDIR /app

# Install dependencies first so this layer is cached unless package.json changes.
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the rest of the application source.
COPY . .

# Persisted volume mount point for uploaded profile pictures.
RUN mkdir -p uploads

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "src/server.js"]
