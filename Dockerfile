FROM zenika/alpine-chrome:with-node

WORKDIR /usr/src/app
COPY package.json ./
RUN npm install --production

COPY . .
ENV PORT 10000
EXPOSE 10000
CMD ["node", "index.js"]
