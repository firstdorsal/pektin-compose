#!/bin/bash
SCRIPTS_IMAGE_NAME=pektin/scripts
SCRIPTS_CONTAINER_NAME=pektin-scripts

for i in "$@"; do
  case $i in
    -s=*|--script-path=*)
      SCRIPT_PATH="${i#*=}"
      shift # past argument=value
      ;;
    -d=*|--delete-old=*)
      DELETE_OLD="${i#*=}"
      shift # past argument=value
      ;;
  esac
done


RED='\u001b[1;91m' ; NO_COLOR='\u001b[0m' 
# remove old containers and volumes in development environment
if [[ $DELETE_OLD = "true" ]]
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
bash reset.sh
echo -e "${RED}--------     RESET FINISHED      --------${NO_COLOR}"
fi

docker rm ${SCRIPTS_CONTAINER_NAME} -v --force &> /dev/null


if [[ ! -z ${SCRIPT_PATH} ]]
then
    echo "Using the local pektin scripts docker image from $SCRIPT_PATH"
    docker build ${SCRIPT_PATH} -t ${SCRIPTS_IMAGE_NAME} #> /dev/null
else
    docker build ./scripts/ -t ${SCRIPTS_IMAGE_NAME} #> /dev/null
fi

mkdir secrets
echo -e "DB_PEKTIN_SERVER_PASSWORD='stop'\nCSP_CONNECT_SRC='the'\nV_PEKTIN_API_PASSWORD='warnings'\nDB_PEKTIN_API_PASSWORD='docker'\nUSE_POLICIES='compose'\nSERVER_LOGGING='you'\nAPI_LOGGING='naughty'\n" > secrets/.env



# start vault
docker-compose --env-file secrets/.env -f pektin-compose/pektin.yml up -d vault

# run pektin-install
docker rm ${SCRIPTS_CONTAINER_NAME} -v --force &> /dev/null
docker run --env UID=$(id -u) --env GID=$(id -g) --env FORCE_COLOR=3 --user $(id -u):$(id -g) --name ${SCRIPTS_CONTAINER_NAME} --network rp --mount "type=bind,source=$PWD,dst=/pektin-compose/" -it ${SCRIPTS_IMAGE_NAME} node ./dist/js/install/scripts.js compose-install || exit 1

# join swarm script
bash swarm.sh > /dev/null
rm swarm.sh &> /dev/null
docker network create --opt encrypted --driver overlay --attachable pektin-gewerkschaft
# run the start script
bash start.sh

# run pektin-first-start
docker rm ${SCRIPTS_CONTAINER_NAME} -v --force &> /dev/null
docker run --env UID=$(id -u) --env GID=$(id -g) --env FORCE_COLOR=3 --user $(id -u):$(id -g) --name ${SCRIPTS_CONTAINER_NAME} --network pektin-compose_vault --mount "type=bind,source=$PWD,dst=/pektin-compose/" -it ${SCRIPTS_IMAGE_NAME} node ./dist/js/install/scripts.js compose-first-start 
docker rm ${SCRIPTS_CONTAINER_NAME} -v --force &> /dev/null
