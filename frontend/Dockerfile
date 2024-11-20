FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy public directory before build
COPY public ./public

# Copy source files and build configuration
COPY rollup.config.js ./
COPY src ./src
COPY index.html ./

# Build the application
RUN npm run build

EXPOSE 5001

CMD ["npm", "run", "start"]
