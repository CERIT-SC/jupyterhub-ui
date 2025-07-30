FROM node:20-alpine AS base

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . ./
RUN find /app -not -path "/app/node_modules/*" -exec chown 1000:1000 {} +
FROM base AS development
ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm", "run", "dev"]