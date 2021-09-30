#!/bin/sh
docker-compose --env-file secrets/.env -f pektin-compose/pektin.yml pull
bash start.sh