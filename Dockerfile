FROM node:20.11.1-alpine

WORKDIR /app

# Copia la build del frontend
COPY ./build ./build

# Copia il backend
COPY ./blogList-backend ./blogList-backend

WORKDIR /app/blogList-backend

# Esponi la porta (modifica se usi un'altra porta)
EXPOSE 3000

# Avvia il backend
CMD ["node", "index.js"]