FROM node:22-alpine

WORKDIR /app

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++ musl-dev

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY tsconfig.json drizzle.config.ts ./
COPY src/ ./src/
RUN npm run build

# Copy public assets
COPY public/ ./public/

# Set production environment
ENV NODE_ENV=production

# Expose port
EXPOSE 3001

# Start the server
CMD ["node", "dist/index.js"]
