#!/bin/bash

# This script stops, removes containers, removes images, and prunes dangling images
# related to the 'config-server' Docker image.

# Continue executing commands even if one fails
set +e

# Stop all running containers based on the 'config-server' image
echo "Stopping all running containers based on the 'config-server' image..."
docker stop $(docker ps -q --filter 'ancestor=config-server')

# Remove all containers based on the 'config-server' image
echo "Removing all containers based on the 'config-server' image..."
docker rm $(docker ps -a -q --filter 'ancestor=config-server')

# Force remove all images named 'config-server'
echo "Removing all images named 'config-server'..."
docker rmi -f $(docker images 'config-server' -q)

# Prune all dangling images
echo "Pruning all dangling images..."
docker image prune -f

echo "Operations completed."
