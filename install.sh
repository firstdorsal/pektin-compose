# remove old containers and volumes in development environment
if [[ $1 = "delete-old" ]]
then
#dev
echo "test"
docker rm pektin-vault --force -v
docker volume rm pektin-compose_vault
fi

# start vault
docker-compose -f compose/pektin.yml up -d vault

# run install
docker run --name pektin-compose-install --network container:pektin-vault --mount "type=bind,source=$PWD,dst=/pektin-compose/" -it $(docker build -q ./scripts/install/)

# clean up 
docker rm pektin-compose-install -v
