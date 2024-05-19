FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY . .

RUN npx prisma generate
# Use github workflow for migration. Too many issues with docker/prisma/secrets/db access
# RUN npx prisma migrate dev --verbose

EXPOSE 3000

CMD ["node", "/usr/src/app/main.js"]
