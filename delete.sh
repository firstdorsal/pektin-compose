#!/bin/sh
echo "deleting old artifacts"
docker swarm leave --force
docker-compose -f pektin-compose/pektin.yml down --remove-orphans
docker rm pektin-vault --force -v
docker volume rm pektin-compose_vault pektin-compose_db
rm -rf update.sh start.sh stop.sh secrets/ arbeiter/ swarm.sh