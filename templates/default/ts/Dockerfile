FROM node:20.11.0-bullseye
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
EXPOSE 5000
RUN yarn prisma generate
CMD ["yarn", "dev"]
