FROM node:20.11.0-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY tailwind.config.js postcss.config.js vite.config.ts tsconfig.json index.html ./
COPY src ./src
RUN npm run build

FROM nginx:1.27.3-alpine
COPY --chown=nginx:nginx nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html
RUN mkdir -p /var/cache/nginx/client_temp \
    && touch /var/run/nginx.pid \
    && chown -R nginx:nginx /var/cache/nginx /var/run /run /var/log/nginx /etc/nginx/conf.d /usr/share/nginx/html
USER nginx
EXPOSE 80
HEALTHCHECK --interval=10s --timeout=3s --retries=10 CMD wget -qO- http://127.0.0.1/ || exit 1
