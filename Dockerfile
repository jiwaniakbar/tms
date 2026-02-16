# Use the official Node.js image
FROM node:20-alpine AS base

# Install better-sqlite3 build dependencies
RUN apk add --no-cache python3 make g++ sqlite

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
# Avoid copying lockfile to force fresh resolution for container architecture
COPY package.json ./
RUN npm install
# Install sharp for image optimization
RUN npm install sharp

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Needed for build-time static generation where db.ts is executed
RUN mkdir -p /app/data && chown -R node:node /app

# Switch to node user before building so sqlite can write
USER node

# Environment variable for Next.js build
ENV NEXT_TELEMETRY_DISABLED=1

# Run the build
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create required directories and set proper permissions
RUN mkdir -p /app/public/uploads /app/data && chown -R node:node /app/public /app/data

# You only need to copy next.config.mjs if you are NOT using the default configuration
# COPY next.config.mjs ./

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown -R node:node .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public


# Add this line to explicitly answer your question about source code!
# The `standalone` build creates a minimized production version of the app.
# The original source code (.tsx, .ts files) is NOT included in this final runner stage,
# which keeps the Docker image smaller and more secure.

USER node

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
