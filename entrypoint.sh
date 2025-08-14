#!/usr/bin/env bash

arg=$1

if [ "$arg" == "frontend" ]; then
  cd /app/apps/frontend || exit
  exec moon frontend:prod
elif [ "$arg" == "backend" ]; then
  cd /app/apps/api-service || exit
  exec moon api-service:prod
elif [ "$arg" == "ai" ]; then
  cd /app/apps/ai || exit
  exec moon ai:prod
elif [ "$arg" == "seeder" ]; then
  cd /app/apps/seeder || exit
  exec moon seeder:seed
fi