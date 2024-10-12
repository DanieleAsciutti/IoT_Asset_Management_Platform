#React app image
FROM node:lts-alpine as build

WORKDIR /app

COPY package*.json ./

#RUN npm ci --legacy-peer-deps
RUN npm ci

COPY . .

RUN npm run build

# Stage 2: Setup the Nginx Server to serve the React Application
FROM nginx:latest as prod

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Expose port 3000
EXPOSE 3000/tcp
#EXPOSE 80/tcp

CMD ["/usr/sbin/nginx", "-g", "daemon off;"]