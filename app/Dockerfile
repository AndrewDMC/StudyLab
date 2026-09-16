# syntax=docker/dockerfile:1
#
# Immagine "web" (PIANO.md §8): serve API + frontend statico in un solo
# processo Express. Il contesto di build è la RADICE del repo (vedi
# deploy/docker-compose.yml: context: ..), non app/ da solo — perché
# app/server/index.js richiede ../../cli/lib/* con percorso relativo
# fisso, la stessa struttura che ha in sviluppo (vedi CLAUDE.md). Questa
# immagine contiene solo CODICE (app/ + cli/); i dati veri del vault
# (materie/, srs/, _jobs/) arrivano da bind mount in docker-compose.yml,
# così un rebuild non tocca mai i contenuti dello studente.

FROM node:20-slim AS build
WORKDIR /vault
COPY app/package.json app/package-lock.json ./app/
RUN npm --prefix app ci
COPY app ./app
RUN npm --prefix app run build

FROM node:20-slim
WORKDIR /vault
ENV NODE_ENV=production
COPY app/package.json app/package-lock.json ./app/
RUN npm --prefix app ci --omit=dev
COPY --from=build /vault/app/dist ./app/dist
COPY app/server ./app/server
COPY cli ./cli

EXPOSE 8081
CMD ["node", "app/server/index.js"]
