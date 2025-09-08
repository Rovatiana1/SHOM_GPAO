# Étape de build du frontend React
FROM node:22.12.0-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances et installer
COPY package.json yarn.lock ./
RUN yarn install
RUN yarn add prismjs emoji-picker-react
RUN yarn add @types/prismjs -D 

# Copier tout le code source
COPY . .

# Build du frontend React
RUN yarn run build:prod

# Étape finale d’exécution (même Node que la build pour éviter les incompatibilités)
FROM node:22.12.0-alpine

WORKDIR /app
ENV NODE_ENV=production

# Copier le dossier complet du builder (y compris package.json, server, etc.)
COPY --from=builder /app /app

# Installer serve, nodemon et ts-node (pour exécuter le backend en TS)
RUN yarn global add serve ts-node nodemon concurrently

# Exposer les ports nécessaires
EXPOSE 7860

# Lancer le site sur 0.0.0.0 et le port Hugging Face
CMD ["sh", "-c", "serve -s build-prod -l ${PORT:-7860}"]
