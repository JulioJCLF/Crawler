#!/bin/sh
set -e

# Garante que o diretório persistente /app/data pertença ao usuário nextjs
if [ -d "/app/data" ]; then
  chown -R nextjs:nodejs /app/data 2>/dev/null || true
  chmod -R 775 /app/data 2>/dev/null || true
fi

exec su-exec nextjs:nodejs "$@"
