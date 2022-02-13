#!/bin/sh
echo "Deleting old artifacts..."
docker swarm leave --force
docker-compose --env-file secrets/.env -f pektin-compose/pektin.yml down --remove-orphans
docker rm pektin-vault --force -v
docker volume rm pektin-compose_vault pektin-compose_db
rm -rf update.sh start.sh stop.sh secrets/ arbeiter/ swarm.sh
docker image rm pektin-compose-check-config pektin-compose-install pektin-compose-first-start pektin-compose-start --force