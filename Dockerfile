# deps
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .


# DUMMY envs for build-time only (don’t leak real secrets here)
ENV MONGODB_URI="mongodb://placeholder/db" \
    NEXTAUTH_URL="http://localhost:3000" \
    NEXTAUTH_SECRET="placeholder" \
    GOOGLE_CLIENT_ID="placeholder" \
    GOOGLE_CLIENT_SECRET="placeholder" \
    GITHUB_CLIENT_ID="placeholder" \
    GITHUB_CLIENT_SECRET="placeholder"
    
RUN npm run build

# runtime (standalone)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000

# Only the standalone server + static + public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node","server.js"]
