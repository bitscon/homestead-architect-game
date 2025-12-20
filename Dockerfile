################################
# --- build stage ---
FROM node:20-alpine AS build
WORKDIR /app

# install deps
COPY package*.json ./
RUN npm install

# copy source
COPY . .
RUN npm run build

# --- run stage ---
FROM nginx:alpine

# copy build output
COPY --from=build /app/dist /usr/share/nginx/html

# overwrite default nginx config to support React Router
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
