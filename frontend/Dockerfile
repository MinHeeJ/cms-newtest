FROM node:20.11.0-alpine AS builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install --no-audit --no-fund
COPY frontend/tailwind.config.ts frontend/postcss.config.js frontend/vite.config.ts frontend/tsconfig.json ./
COPY frontend/index.html ./
COPY frontend/src ./src
RUN npm run build

FROM nginx:1.27.0-alpine
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
