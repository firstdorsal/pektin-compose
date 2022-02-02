#!/bin/bash
RED='\u001b[1;91m' ; NO_COLOR='\u001b[0m' 
# remove old containers and volumes in development environment
if [[ $1 = "delete-old" ]]
then
echo -e "${RED}--------   STARTING FULL RESET   -------"
echo ""
echo -e       "       PRESS 'CTRL' + 'C' TO ABORT      "
echo ""
sleep 1
echo -en      "█████████████"
sleep 1
echo -en                    "████████████"
sleep 1
echo -en                                 "███████████████${NO_COLOR}"
sleep 1
echo ""
sh reset.sh
echo -e "${RED}--------     RESET FINISHED      --------${NO_COLOR}"
fi

# clean up pektin-config
docker rm pektin-compose-check-config -v &> /dev/null

# check config
docker build --no-cache -q ./scripts/check-config/ -t "pektin-compose-check-config" > /dev/null
docker run --env UID=$(id -u) --env GID=$(id -g) --name pektin-compose-check-config --mount "type=bind,source=$PWD,dst=/pektin-compose/" -it pektin-compose-check-config || exit 1

# clean up pektin-config
docker rm pektin-compose-check-config -v &> /dev/null

# start vault
docker-compose -f pektin-compose/pektin.yml up -d vault

# run pektin-install
docker build --no-cache -q ./scripts/install/ -t "pektin-compose-install" > /dev/null
docker run --env UID=$(id -u) --env GID=$(id -g) --name pektin-compose-install --network container:pektin-vault --mount "type=bind,source=$PWD,dst=/pektin-compose/" -it pektin-compose-install

# clean up pektin-install
docker rm pektin-compose-install -v

# join swarm script
sh swarm.sh > /dev/null
rm swarm.sh

# run the start script
sh start.sh

# run pektin-first-start
docker build --no-cache -q ./scripts/first-start/ -t "pektin-compose-first-start"  > /dev/null
docker run --env UID=$(id -u) --env GID=$(id -g) --name pektin-compose-first-start --network pektin-compose_vault --mount "type=bind,source=$PWD,dst=/pektin-compose/" -it pektin-compose-first-start

# clean up pektin-first-start
docker rm pektin-compose-first-start -v