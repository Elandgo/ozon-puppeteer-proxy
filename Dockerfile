# 1. Берём облегчённый Node.js + Chromium
FROM zenika/alpine-chrome:with-node

# 2. Рабочая папка
WORKDIR /usr/src/app

# 3. Копируем только список зависимостей, ставим их
COPY package.json package-lock.json ./
RUN npm install --production

# 4. Копируем весь код
COPY . .

# 5. Открываем порт (для Render это 10000, но лучше читать из env)
ENV PORT 10000
EXPOSE 10000

# 6. Запускаем ваш сервер
CMD ["node", "index.js"]
