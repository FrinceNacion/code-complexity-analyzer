FROM node:20-slim

WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source
COPY . .

# Expose Vite's default dev port
EXPOSE 5173

# Start development server
CMD ["npm", "run", "dev"]
