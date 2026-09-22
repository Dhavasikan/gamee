# Multi-stage build for production
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency manifests
COPY package.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install dependencies
RUN npm --prefix backend install --omit=dev
RUN npm --prefix frontend install

# Copy source code
COPY . .

# Build frontend production bundle
RUN npm --prefix frontend run build

# Production runtime stage
FROM node:20-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Copy necessary files from build stage
COPY --from=build /app/backend /app/backend
COPY --from=build /app/frontend/dist /app/frontend/dist
COPY --from=build /app/database /app/database
COPY --from=build /app/package.json /app/package.json

EXPOSE 5000

CMD ["node", "backend/src/server.js"]
