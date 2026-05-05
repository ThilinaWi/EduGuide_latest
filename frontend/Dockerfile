FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV VITE_API_GATEWAY_URL=http://localhost:5000

EXPOSE 5173

CMD ["npm", "run", "dev"]
