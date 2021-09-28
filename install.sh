#!/bin/sh

# remove old containers and volumes in development environment
if [[ $1 = "delete-old" ]]
then
echo "deleting old artifacts"
#sudo rm -rf secrets
docker-compose -f pektin-compose/pektin.yml down
docker rm pektin-vault --force -v
docker volume rm pektin-compose_vault
docker-compose -f pektin-compose/pektin.yml pull
fi

# start vault
docker-compose -f pektin-compose/pektin.yml up -d vault

# run pektin-install
docker run --name pektin-compose-install --network container:pektin-vault --mount "type=bind,source=$PWD,dst=/pektin-compose/" -it $(docker build -q ./scripts/install/)

# clean up pektin-install
docker rm pektin-compose-install -v

