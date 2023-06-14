### build environment
FROM node:16-alpine as build

# install dependencies (and fix solid-dep)
COPY algorithm /sparqledit/algorithm
WORKDIR /sparqledit/app
COPY app/package.json app/package-lock.json app/.env.production ./
RUN npm ci --silent
RUN cd node_modules/@inrupt/solid-client-authn-core/dist/; mv index.mjs backup-index.mjs

# build the app
COPY app/public ./public
COPY app/src ./src
RUN npm run build


### production environment
FROM nginx:stable-alpine

LABEL maintainer="S.Meckler <mkl@iis.fraunhofer.de>"
LABEL name="SPARQL_edit" description="Web app for editing RDF literals in knowledge graphs"

COPY --from=build /sparqledit/app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]