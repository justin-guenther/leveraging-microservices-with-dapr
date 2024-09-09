FROM node:latest

WORKDIR /app

COPY package.json .
RUN npm install
COPY tsconfig.json .
COPY src ./src

# Increase Node.js memory limit during build
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

CMD [ "npm", "run", "start" ]
