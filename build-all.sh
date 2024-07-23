#!/bin/bash

projects=("orders" "payments" "tickets" "auth" "expiration")
total_projects=${#projects[@]}
completed_projects=0

# Define the desired length of the progress bar 
total_chars=10  

for project in "${projects[@]}"; do
    echo -ne "Building project: $project " 

    # Calculate and display progress
    progress=$(( (completed_projects * 100) / total_projects ))
    filled_chars=$(( (progress * total_chars) / 100 )) 
    empty_chars=$(( total_chars - filled_chars ))       
    printf "[%${filled_chars}s%${empty_chars}s] %d%%\r" "$(printf '#%.0s' {1..$filled_chars})" "" "$progress" # Removed the second printf

    cd "$project" || exit
    if [ -d "build" ]; then
        rm -rf build
    fi
    npm run test -- --no-coverage --silent || exit
    npm run build || exit
    cd ..

    completed_projects=$(( completed_projects + 1 ))
done

echo "All projects built successfully!"
