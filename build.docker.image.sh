#!/bin/bash
imageFolder="docker"
app="lims-backend"
if [ -z "$1" ]
then
    version="test"
else
    version=$1
fi
echo ">>> building images: $app:$version"
docker build -t $app:$version .
echo ">>> saving images: $app.$version"
docker save -o $imageFolder/$app.$version $app:$version
