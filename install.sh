#dev
docker rm pektin-vault --force -v
docker volume rm pektin-compose_vault

docker-compose up -d vault
docker run --name pektin-compose-install --network container:pektin-vault --mount "type=bind,source=${PWD},dst=/pektin-compose/" -it $(docker build -q ./scripts/install/)
docker rm pektin-compose-install -v
