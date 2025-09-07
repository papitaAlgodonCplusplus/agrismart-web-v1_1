to switch to dev:

.UseWindowsService
enviorment.ts
npm run build-dev
npm run start


docker redeploy:

1. Rebuild the Docker Image
bash# Build the new image with your CORS changes
docker build -t agrismart-iot-api .
2. Stop and Remove the Current Container (if running)
bash# Find the running container
docker ps

# Stop the container
docker stop <container-name-or-id>

# Remove the container
docker rm <container-name-or-id>
3. Run the New Container
bash# Run with the updated image
docker run -d -p 80:80 --name agrismart-iot-api agrismart-iot-api
Alternative: If Using Docker Compose
If you're using docker-compose, you can:
bash# Rebuild and restart
docker-compose up --build -d
For Cloud Deployment (Render/AWS/Azure)
If you're deploying to a cloud service:

Push to your repository with the Program.cs changes
Trigger a new deployment on your cloud platform
The platform will automatically rebuild the Docker image with your changes