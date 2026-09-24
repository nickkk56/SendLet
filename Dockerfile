FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++ musl-dev

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json drizzle.config.ts ./
COPY src/ ./src/
RUN npm run build

COPY public/ ./public/

RUN mkdir -p /app/data

ENV NODE_ENV=production
EXPOSE 3001

# Run migrations, then start the server
CMD ["sh", "-c", "npm run db:migrate && node dist/index.js"]