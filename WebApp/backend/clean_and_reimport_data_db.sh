docker stop mongodb
docker rm mongodb
rm -rf mongo_data
mkdir mongo_data
docker-compose up -d
cp ./CHe_cloud_data.json ./mongo_data
docker exec -it mongodb mongoimport --db mydatabase --collection CHe_cloud_data --file ./mongo_data/CHe_cloud_data.json --jsonArray --upsert