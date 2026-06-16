# ---- Build aşaması: Astro'yu statik HTML'e derle ----
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# CI'da GITHUB_TOKEN build-arg olarak geçilirse repolar sorunsuz çekilir
ARG GITHUB_TOKEN
ENV GITHUB_TOKEN=$GITHUB_TOKEN
RUN npm run build

# ---- Servis aşaması: Nginx ile statik dosyaları yayınla ----
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
