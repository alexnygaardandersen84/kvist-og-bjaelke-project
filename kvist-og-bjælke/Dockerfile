FROM node:22-alpine AS build

WORKDIR /app

ARG VITE_API_URL=http://localhost:3001
ARG VITE_KEYCLOAK_URL=http://localhost:8100
ARG VITE_KEYCLOAK_REALM=kvist-og-bjaelke
ARG VITE_KEYCLOAK_CLIENT_ID=kvist-og-bjaelke-app

ENV VITE_API_URL=$VITE_API_URL \
    VITE_KEYCLOAK_URL=$VITE_KEYCLOAK_URL \
    VITE_KEYCLOAK_REALM=$VITE_KEYCLOAK_REALM \
    VITE_KEYCLOAK_CLIENT_ID=$VITE_KEYCLOAK_CLIENT_ID

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
