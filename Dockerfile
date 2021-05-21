FROM vicradon/ubuntu-node:latest
COPY . .
RUN npm i -g nodemon && npm i

