#!/bin/bash
docker build -t lims-backend:test .
docker save -o docker/lims-backend.test lims-backend:test
