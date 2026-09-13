# syntax=docker/dockerfile:1
FROM node:24-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS build
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}
RUN npm run build

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
RUN addgroup -S nodeapp && adduser -S nodeapp -G nodeapp
COPY --from=build --chown=nodeapp:nodeapp /app/.next/standalone ./
COPY --from=build --chown=nodeapp:nodeapp /app/.next/static ./.next/static
COPY --from=build --chown=nodeapp:nodeapp /app/public ./public
USER nodeapp
EXPOSE 3000
CMD ["node", "server.js"]
