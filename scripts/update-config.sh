#!/bin/bash
SCRIPTS_IMAGE_NAME=pektin/scripts
SCRIPTS_CONTAINER_NAME=pektin-scripts


docker rm ${SCRIPTS_CONTAINER_NAME} -v &> /dev/null 
docker run --env UID=$(id -u) --env GID=$(id -g) --env FORCE_COLOR=3 --name ${SCRIPTS_CONTAINER_NAME} --user $(id -u):$(id -g) --network container:pektin-vault --mount "type=bind,source=$PWD,dst=/pektin-compose/" -it ${SCRIPTS_IMAGE_NAME} node ./dist/js/install/scripts.js update-config
docker rm ${SCRIPTS_CONTAINER_NAME} -v &> /dev/null 