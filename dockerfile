FROM node:12

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm install pm2 -g

COPY . .

EXPOSE 3002 

CMD ["pm2-runtime", "app.json"]
