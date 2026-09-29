# Node.js 20 slim base image (Debian-based with GLIBC pre-built binary support)
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install OpenSSL for Prisma engine compatibility
RUN apt-get update -y && apt-get install -y openssl

# Copy package files
COPY package*.json ./

# Install dependencies directly
RUN npm install

# Copy source code and Prisma schema
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose port
EXPOSE 5000

# Set environment variable defaults
ENV NODE_ENV=production
ENV PORT=5000

# Apply Prisma database schema migrations and start application
CMD ["sh", "-c", "npx prisma db push && npm start"]

