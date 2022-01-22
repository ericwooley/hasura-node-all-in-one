FROM hasura/graphql-engine
RUN apt-get update && apt-get install wget -y
RUN wget https://nodejs.org/dist/v16.13.2/node-v16.13.2-linux-x64.tar.gz
RUN tar --strip-components 1 -xzf node-v16.13.2-linux-x64.tar.gz
RUN echo $(node --version)
RUN npm install -g yarn
WORKDIR /usr/src/app
COPY yarn.lock .
COPY package.json .
RUN yarn install --frozen-lockfile
COPY dist .
CMD [ "yarn", "run", "start:prod" ]
