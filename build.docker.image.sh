#!/bin/bash
image_folder="docker"
app="lims-backend"
timestamp=`date +%Y%m%d_%H%M`
if [ -z "$1" ]
then
    version="test"
else
    version=$1
fi
image_tag=$app:${version}_${timestamp}
image_file=$image_folder/$app.${version}_${timestamp}
echo ">>> building images: $image_tag"
docker build \
    -t $image_tag \
    --build-arg GIT_COMMIT=$(git log -1 --format=%h) \
    .
echo ">>> saving images: $image_file"
docker save -o $image_file $image_tag
scp $image_file 192.168.1.99:~/
ssh 192.168.1.99 "docker load -i ~/$app.${version}_${timestamp}"
scp $image_file 192.168.1.27:~/
ssh 192.168.1.27 "docker load -i ~/$app.${version}_${timestamp}"
