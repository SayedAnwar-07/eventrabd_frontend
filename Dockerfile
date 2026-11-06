
# BUILD STAGE
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Vite production environment variables
ARG VITE_API_URL=https://eventrabd-backend-1.onrender.com
ARG VITE_WS_URL=wss://eventrabd-backend-1.onrender.com/ws/notifications/
ARG VITE_CLOUDINARY_URL=https://res.cloudinary.com/dzlhfnyu4

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_WS_URL=${VITE_WS_URL}
ENV VITE_CLOUDINARY_URL=${VITE_CLOUDINARY_URL}

# Build React application
RUN npm run build

# PRODUCTION STAGE
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
