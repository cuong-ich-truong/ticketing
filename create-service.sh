# Script that creates a new service in the system with the following steps

#!/bin/bash

# 0. Check if folder tickets is present
echo "Checking if folder 'tickets' is present and use it as a template for the new service."
if [ ! -d "./tickets" ]; then
    echo "Error:  Folder 'tickets' not found." >&2
    exit 1
fi

echo "Folder 'tickets' found. Ready to create a new service."

# 1. Get service name from user input
read -p "Enter service name: " service_name

# 2. Create a new directory for the service
mkdir -p "$service_name" || {
    echo "Error: Failed to create directory '$service_name'." >&2
    exit 1
}

# 3. Copy files from ./tickets to the new directory
cp ./tickets/.dockerignore ./tickets/Dockerfile ./tickets/package.json ./tickets/tsconfig.json .tickets/jest.config.js "$service_name" || {
    echo "Error: Failed to copy files to '$service_name'." >&2
    exit 1
}


# 4. Create the src directory in the new service

mkdir -p "$service_name/src" || {
    echo "Error: Failed to create directory '$service_name/src'." >&2
    exit 1
}

# 5. Copy the folders __mock__ and test from ./tickets/src to the new service's src directory
cp -r ./tickets/src/__mocks__ ./tickets/src/test "$service_name/src" || {
    echo "Error: Failed to copy files to '$service_name/src'." >&2
    exit 1
}


echo "Service '$service_name' created and enabled successfully."
