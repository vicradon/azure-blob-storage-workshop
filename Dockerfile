FROM node:12-alpine
WORKDIR /testing-do
COPY . .
RUN npm install --production
CMD ["node", "index.js"]