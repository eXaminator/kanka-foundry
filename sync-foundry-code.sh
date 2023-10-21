#! /bin/bash

rm -rf foundry-code
docker cp $(docker ps -qf "name=foundry"):/home/foundry/resources/app foundry-code