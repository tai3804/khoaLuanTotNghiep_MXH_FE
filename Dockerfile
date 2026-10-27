# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build arguments for frontend env configuration
ARG VITE_API_BASE_URL=http://localhost:8080/api/v1
ARG VITE_CHAT_WS_URL=http://localhost:8080/ws-chat
ARG VITE_NOTIFICATION_WS_URL=http://localhost:8080/ws-notifications
ARG VITE_CALL_WS_URL=http://localhost:8080/ws-call

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_CHAT_WS_URL=$VITE_CHAT_WS_URL
ENV VITE_NOTIFICATION_WS_URL=$VITE_NOTIFICATION_WS_URL
ENV VITE_CALL_WS_URL=$VITE_CALL_WS_URL

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
