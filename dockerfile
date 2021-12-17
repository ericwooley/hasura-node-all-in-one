FROM hasura/graphql-engine
RUN apt-get update
RUN apt-get install nodejs -y
WORKDIR /usr/src/app
COPY . .
RUN npm ci
ENTRYPOINT [ "node", "dist/index.js" ]
