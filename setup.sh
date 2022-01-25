#!/bin/bash

# remove old containers and volumes in development environment
if [[ $1 = "delete-old" ]]
then
sh reset.sh
fi

# clean up pektin-config
docker rm pektin-compose-check-config -v &>  /dev/null

# check config
docker run --env UID=$(id -u) --env GID=$(id -g) --name pektin-compose-check-config --mount "type=bind,source=$PWD,dst=/pektin-compose/" -it $(docker build -q ./scripts/check-config/ --no-cache) || exit 1

# clean up pektin-config
docker rm pektin-compose-check-config -v &>  /dev/null

# start vault
docker-compose -f pektin-compose/pektin.yml up -d vault

# run pektin-install
docker run --env UID=$(id -u) --env GID=$(id -g) --name pektin-compose-install --network container:pektin-vault --mount "type=bind,source=$PWD,dst=/pektin-compose/" -it $(docker build -q ./scripts/install/ --no-cache)

# clean up pektin-install
docker rm pektin-compose-install -v

# join swarm script
sh swarm.sh > /dev/null
rm swarm.sh

# run the start script
sh start.sh

# run pektin-first-start
docker run --env UID=$(id -u) --env GID=$(id -g) --name pektin-compose-first-start --network pektin-compose_vault --mount "type=bind,source=$PWD,dst=/pektin-compose/" -it $(docker build -q ./scripts/first-start/)

# clean up pektin-first-start
docker rm pektin-compose-first-start -v