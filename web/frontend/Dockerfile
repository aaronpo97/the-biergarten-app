# Stage 1: install every dependency (including dev deps needed to build)
FROM node:22-alpine AS deps
WORKDIR /src
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: build the client and server bundles (react-router build)
FROM deps AS build
WORKDIR /src
COPY . .
RUN npm run build

# Stage 3: production-only dependencies for the runtime image
FROM node:22-alpine AS prod-deps
WORKDIR /src
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Stage 4: runtime
FROM node:22-alpine AS final
ENV NODE_ENV=production
WORKDIR /app
COPY package.json ./
COPY --from=prod-deps /src/node_modules ./node_modules
COPY --from=build /src/build ./build
EXPOSE 3000
USER node
CMD ["node", "./build/server/index.js"]
