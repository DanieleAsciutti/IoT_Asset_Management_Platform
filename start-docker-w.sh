#!/bin/bash

set -e

function stop_containers() {
    docker-compose -f AsyncController/docker-compose.prod.yaml down
    docker-compose -f WebPlatform/docker-compose.prod.yaml down

    NETWORK_NAME="int-net"

    if docker network ls | grep -q "$NETWORK_NAME"; then
        docker network rm int-net
    else
        echo "$NETWORK_NAME does not exists."
    fi

    echo "Containers stopped."
}

function clean_docker() {
    #docker rmi $(docker images --filter "dangling=true" -q --no-trunc)
    docker image prune -a -f
    docker volume prune -f
    docker builder prune -f
    docker network prune -f
    echo "Docker cleaned."
}

function build_app() {
    NETWORK_NAME="int-net"

    if docker network ls | grep -q "$NETWORK_NAME"; then
        echo "Network $NETWORK_NAME already exists."
    else
        echo "Creating network $NETWORK_NAME."
        docker network create "$NETWORK_NAME"
    fi

    echo "-------> Building WebPlatform App"
    docker-compose -f WebPlatform/docker-compose.prod.yaml up --build -d
    echo "-------> Building AsyncController App"
    docker-compose -f AsyncController/docker-compose.prod.yaml up --build -d
    echo "-------> Check"
    docker-compose -f WebPlatform/docker-compose.prod.yaml ps
    docker-compose -f AsyncController/docker-compose.prod.yaml ps
}

function start_app() {
    NETWORK_NAME="int-net"

    if docker network ls | grep -q "$NETWORK_NAME"; then
        echo "Network $NETWORK_NAME already exists."
    else
        echo "Creating network $NETWORK_NAME."
        docker network create "$NETWORK_NAME"
    fi

    echo "-------> Starting WebPlatform App"
    docker-compose -f WebPlatform/docker-compose.prod.yaml up -d
    echo "-------> Starting AsyncController App"
    docker-compose -f AsyncController/docker-compose.prod.yaml up -d
    echo "-------> Check"
    docker-compose -f WebPlatform/docker-compose.prod.yaml ps
    docker-compose -f AsyncController/docker-compose.prod.yaml ps
}


function display_help() {
    echo "Usage: $0 [options]"
    echo "Options:"
    echo "  -s    start containers"
    echo "  -d    Stop and remove containers"
    echo "  -b    Build and start the application"
    echo "  -c    Clean Docker (remove unused images and volumes)"
}

function list_services() {
    docker-compose -f WebPlatform/docker-compose.prod.yaml ps
    docker-compose -f AsyncController/docker-compose.prod.yaml ps
}

while getopts ":sdbclth" opt; do
  case $opt in
    s)
      start_app
      ;;
    d)
      stop_containers
      ;;
    b)
      build_app
      ;;
    c)
      clean_docker
      ;;
    l)
      list_services
      ;;
    h)
      display_help
      exit 0
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      display_help
      exit 1
      ;;
    :)
      echo "Option -$OPTARG requires an argument." >&2
      display_help
      exit 1
      ;;
  esac
done

# If no options were passed, show help
if [ $OPTIND -eq 1 ]; then
    display_help
    exit 1
fi