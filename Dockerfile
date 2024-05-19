FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY . .

RUN npx prisma generate
RUN npx prisma migrate dev

EXPOSE 3000

# Define environment variable
ENV NODE_ENV production

CMD ["node", "/usr/src/app/main.js"]
