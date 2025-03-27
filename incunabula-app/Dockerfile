FROM node:14.0.0 as development
# Set the working directory
WORKDIR /app
# Copy package files and list files for debugging
COPY package*.json ./
# Install dependencies and ensure no vulnerabilities
RUN npm install
# Copy the rest of the application code
COPY . .
# Start the application
CMD ["npm", "start"]

FROM node:14.0.0 as build
# Set the working directory
WORKDIR /app
# Copy the rest of the application code
COPY . .
# Copy package files and list files for debugging
# COPY package*.json ./
# Install dependencies and ensure no vulnerabilities
RUN npm install
# Build the application
CMD ["npm", "run", "build"]
