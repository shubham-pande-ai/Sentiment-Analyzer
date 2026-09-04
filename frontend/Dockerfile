# Use official Node.js image as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Disable Next.js telemetry for privacy
ENV NEXT_TELEMETRY_DISABLED 1

# Build the Next.js application
RUN npm run build

# Expose port 3000 for the Next.js server
EXPOSE 3000

# Command to start the Next.js server
CMD ["npm", "run", "start"]
