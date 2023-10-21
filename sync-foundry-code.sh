#! /bin/bash

IMAGE_NAME=$(grep -m 1 "image:" docker-compose.yml | awk '{print $2}' | tr -d "'\"")
DIRECTORY="foundry-code"
RUNNING_CONTAINER=$(docker ps -qf "name=foundry")
CONTAINER_NAME=${RUNNING_CONTAINER:-foundry-copy}
ERROR=""

rm -rf ${DIRECTORY}

if [ -z "$RUNNING_CONTAINER" ]; then
    echo "Start foundry container..."
    docker run -dit -e FOUNDRY_USERNAME -e FOUNDRY_PASSWORD --name "${CONTAINER_NAME}" "$IMAGE_NAME" > /dev/null

    # Wait until "Preserving release archive file in cache" was logged by new container, but wait at most 1 minute
    echo "Wait for foundry to be installed..."
    for i in {1..60}; do
        if ! docker ps | grep -q "${CONTAINER_NAME}"; then
            echo "Foundry exited unexpectedley:"
            docker logs ${CONTAINER_NAME}
            ERROR="true"
            break
        fi

        if docker logs ${CONTAINER_NAME} 2>&1 | grep -q "Preserving release archive file in cache"; then
            break
        fi
        sleep 1
    done
fi

if [ -z "$ERROR" ]; then
    echo "Copy foundry code..."
    docker cp ${CONTAINER_NAME}:/home/foundry/resources/app ${DIRECTORY}
fi

if [ -z "$RUNNING_CONTAINER" ]; then
    echo "Stop and remove foundry container..."
    docker stop ${CONTAINER_NAME} > /dev/null
    docker rm ${CONTAINER_NAME} > /dev/null
fi

if [ -n "$ERROR" ]; then
    exit 1
fi
