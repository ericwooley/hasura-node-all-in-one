FROM hasura/graphql-engine
ADD https://nodejs.org/dist/v16.13.2/node-v16.13.2-linux-x64.tar.gz node.tar.gz
RUN tar --strip-components 1 -xzf node.tar.gz
RUN echo $(node --version)
RUN npm install -g yarn
WORKDIR /usr/src/app
COPY yarn.lock .
COPY package.json .
RUN yarn install --frozen-lockfile
COPY dist dist
CMD [ "yarn", "run", "start:prod" ]
