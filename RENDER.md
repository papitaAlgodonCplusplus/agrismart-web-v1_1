to switch to dev:

.UseWindowsService()
enviorment.ts
npm run build-dev
npm run start


docker redeploy:

1. Rebuild the Docker Image
# Launch  Docker Desktop
Docker Desktop windows

# Build the new image with your CORS changes
docker build -f Dockerfile.agronomic -t agrismart-agronomic .
docker build -f Dockerfile.agronomic -t alexquesada22/agrismart-agronomic .

docker build -f Dockerfile.iot -t agrismart-iot .
docker build -f Dockerfile.iot -t alexquesada22/agrismart-iot:latest .

2. Login
docker login

3. Push the New Container
docker push alexquesada22/agrismart-iot:latest
docker push alexquesada22/agrismart-agronomic

4. On render, deploy latest commit


# Alternative: If Using Docker Compose

If you're using docker-compose, you can:

# Rebuild and restart

docker-compose up --build -d

# For Cloud Deployment (Render/AWS/Azure)

If you're deploying to a cloud service:

1. Push to your repository with the Program.cs changes

2. Trigger a new deployment on your cloud platform

The platform will automatically rebuild the Docker image with your changes