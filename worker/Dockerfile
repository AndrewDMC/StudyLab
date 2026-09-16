# syntax=docker/dockerfile:1
#
# Immagine "worker" (PIANO.md §8): l'unico servizio che invoca davvero
# Claude Code (`claude -p "/skill ..."`, vedi cli/worker.js). Il contesto
# di build è la radice del repo, come per app/Dockerfile. Qui bakiamo solo
# il CODICE che il worker esegue (cli/) e ciò che `claude -p` deve trovare
# nella working directory per riconoscere skill e regole (.claude/,
# CLAUDE.md) — non materie/ né _jobs/, che restano bind mount di dati veri
# in docker-compose.yml.
#
# poppler-utils e libreoffice non sono opzionali: senza, /cattura fallisce
# silenziosamente sui PDF scansionati e sulle slide .pptx con ink a mano
# libera (vedi PIANO.md §8, verificato su materiale reale).

FROM node:20-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
      poppler-utils \
      libreoffice \
    && rm -rf /var/lib/apt/lists/*
RUN npm install -g @anthropic-ai/claude-code

WORKDIR /vault
COPY cli ./cli
COPY .claude ./.claude
COPY CLAUDE.md ./CLAUDE.md

# Login di Claude Code (device-code, una tantum) scrive qui: va mappato su
# un volume persistente nel compose, altrimenti si perde a ogni rebuild.
ENV HOME=/root

CMD ["node", "cli/worker.js"]
