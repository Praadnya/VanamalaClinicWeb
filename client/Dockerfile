# Step 1: Build the React application
FROM node:20 AS build

# Set working directory
WORKDIR /app

# Install dependencies
COPY client/package*.json ./
RUN npm install

# Copy source files and build the app
COPY client/ ./
RUN npm run build

# Step 2: Serve the application using Nginx
FROM nginx:alpine

# Copy the build output from the previous stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
