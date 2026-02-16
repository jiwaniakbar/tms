#!/bin/bash

# 1. Ensure directories exist
mkdir -p ./data/uploads
touch ./data/sqlite.db

# 2. Get your actual IDs (will detect 1000 and 1003)
USER_ID=$(id -u)
GROUP_ID=$(id -g)

# 3. Fix ownership to match YOUR specific IDs
sudo chown -R $USER_ID:$GROUP_ID ./data
chmod -R 775 ./data


# 4. VERIFICATION STEP
echo "--- Verifying Data Folder Permissions ---"
ls -la ./data
echo "----------------------------------------"

# 5. Export for Docker Compose
export UID=$USER_ID
export GID=$GROUP_ID

# 6. Restart with Cache Clearing if needed
echo "Starting Fresh Docker Build..."

# If you see that error often, you can uncomment the next line:
# docker builder prune -f 

docker compose down #Stops old versions
docker compose up --build -d #Rebuilds with new code and starts fresh

# 7. Final Container Health Check
echo "--- Container Status ---"
docker compose ps
echo "--- Verifying internal UID/GID ---"
docker exec tms-nextjs id

