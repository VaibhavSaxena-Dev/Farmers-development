# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Use production env values
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# Serve with Nginx
FROM nginx:stable-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx default port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

