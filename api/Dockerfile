FROM node:22-alpine

# Install DNS + SSL tools(as getting problem in connecting to atlas)
RUN apk add --no-cache \
    bash \
    bind-tools \
    busybox-extras \
    curl \
    ca-certificates && update-ca-certificates

WORKDIR /app
COPY  package.json ./
COPY package-lock.json ./

RUN npm install
COPY . . 
EXPOSE 3000
CMD ["npm", "run","dev"]