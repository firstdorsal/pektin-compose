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
rm -rf update.sh start.sh stop.sh secrets/ pektin-compose/src/
fi

# start vault
docker-compose -f pektin-compose/pektin.yml up -d vault

# run pektin-install
docker run --user $(id -u):$(id -g) --name pektin-compose-install --network container:pektin-vault --mount "type=bind,source=$PWD,dst=/pektin-compose/" -it $(docker build -q ./scripts/install/)

chmod 700 secrets/ -R

# clean up pektin-install
docker rm pektin-compose-install -v

