# 🚀 Hosting Guide for WebSocket Chat

This guide covers everything you need to know about hosting WebSocket Chat - whether you want to run it locally for development or deploy it to production on various platforms.

---

## 📋 Table of Contents

1. [Prerequisites](#-prerequisites)
2. [Local Development Hosting](#-local-development-hosting)
3. [Production Hosting Options](#-production-hosting-options)
   - [Vercel + Railway](#option-1-vercel--railway-recommended)
   - [Docker Deployment](#option-2-docker-deployment)
   - [DigitalOcean Droplet](#option-3-digitalocean-droplet)
   - [AWS EC2](#option-4-aws-ec2)
   - [Heroku](#option-5-heroku)
   - [Railway (All-in-One)](#option-6-railway-all-in-one)
   - [Render](#option-7-render)
   - [Self-Hosted VPS](#option-8-self-hosted-vps)
4. [Environment Configuration](#-environment-configuration)
5. [Troubleshooting](#-troubleshooting)
6. [Security Considerations](#-security-considerations)

---

## 🎯 Prerequisites

Before hosting, ensure you have:

| Requirement | Minimum Version | Recommended |
|-------------|-----------------|-------------|
| **Node.js** | v18.0.0 | v20.x LTS |
| **Bun** | v1.0.0 | Latest |
| **npm/yarn/pnpm** | Any | Latest |
| **Git** | Any | Latest |
| **Docker** (optional) | v20.0 | Latest |

### Checking Your Versions

```bash
# Check Node.js version
node --version

# Check Bun version
bun --version

# Check npm version
npm --version

# Check Git version
git --version

# Check Docker version (if using)
docker --version
```

---

## 💻 Local Development Hosting

### Method 1: Using Bun (Recommended - Fastest)

Bun is significantly faster than Node.js and npm. Highly recommended for development!

#### Step 1: Install Bun

**macOS/Linux:**
```bash
curl -fsSL https://bun.sh/install | bash
```

**Windows (PowerShell):**
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

**Using npm:**
```bash
npm install -g bun
```

#### Step 2: Clone and Install

```bash
# Clone the repository
git clone https://github.com/TheStrongestOfTomorrow/websocket-chat.git
cd websocket-chat

# Install all dependencies
bun install

# Install WebSocket server dependencies
cd mini-services/chat-server
bun install
cd ../..
```

#### Step 3: Start the Servers

**Terminal 1 - WebSocket Server:**
```bash
cd mini-services/chat-server
bun run dev
```

You should see:
```
[Server] WebSocket Chat Server running on port 3003
[Server] Ready for connections!
[Server] Features: File uploads (up to 20MB), Address detection
```

**Terminal 2 - Next.js App:**
```bash
bun run dev
```

You should see:
```
✓ Ready in <time>ms
○ Local:        http://localhost:3000
```

#### Step 4: Access the App

Open your browser and navigate to:
```
http://localhost:3000
```

---

### Method 2: Using Node.js + npm

If you prefer Node.js or Bun isn't available for your platform:

#### Step 1: Install Node.js

**Using nvm (Node Version Manager) - Recommended:**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart your terminal, then:
nvm install --lts
nvm use --lts
```

**Direct Download:**
- Visit [nodejs.org](https://nodejs.org/)
- Download the LTS version for your OS
- Run the installer

#### Step 2: Clone and Install

```bash
# Clone the repository
git clone https://github.com/TheStrongestOfTomorrow/websocket-chat.git
cd websocket-chat

# Install all dependencies
npm install

# Install WebSocket server dependencies
cd mini-services/chat-server
npm install
cd ../..
```

#### Step 3: Update Package Scripts

The `package.json` uses Bun by default. For npm, update the WebSocket server's package.json:

**File: `mini-services/chat-server/package.json`**
```json
{
  "scripts": {
    "dev": "node --watch index.ts"
  }
}
```

Or use `ts-node`:
```bash
npm install -D ts-node
```

Then update the script:
```json
{
  "scripts": {
    "dev": "ts-node index.ts"
  }
}
```

#### Step 4: Start the Servers

**Terminal 1 - WebSocket Server:**
```bash
cd mini-services/chat-server
npm run dev
```

**Terminal 2 - Next.js App:**
```bash
npm run dev
```

---

### Method 3: Using Docker (Local)

Perfect for consistent development environments:

#### Step 1: Create Docker Compose File

Create `docker-compose.yml` in the project root:

```yaml
version: '3.8'

services:
  # Next.js Frontend
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_WS_URL=ws://localhost:3003
    depends_on:
      - websocket

  # WebSocket Server
  websocket:
    build:
      context: ./mini-services/chat-server
      dockerfile: Dockerfile.websocket
    ports:
      - "3003:3003"

networks:
  default:
    name: chat-network
```

#### Step 2: Create Dockerfiles

**`Dockerfile.frontend`:**
```dockerfile
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Build and run
RUN bun run build
EXPOSE 3000
CMD ["bun", "run", "start"]
```

**`mini-services/chat-server/Dockerfile.websocket`:**
```dockerfile
FROM oven/bun:1
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

EXPOSE 3003
CMD ["bun", "run", "dev"]
```

#### Step 3: Run with Docker Compose

```bash
docker-compose up --build
```

---

### Method 4: Using PM2 (Process Manager)

PM2 keeps your servers running and auto-restarts on crashes:

#### Step 1: Install PM2

```bash
npm install -g pm2
```

#### Step 2: Create Ecosystem Config

Create `ecosystem.config.js` in the project root:

```javascript
module.exports = {
  apps: [
    {
      name: 'websocket-chat-frontend',
      script: 'bun',
      args: 'run dev',
      cwd: '/path/to/websocket-chat',
      env: {
        PORT: 3000,
        NODE_ENV: 'development'
      }
    },
    {
      name: 'websocket-chat-server',
      script: 'bun',
      args: 'run dev',
      cwd: '/path/to/websocket-chat/mini-services/chat-server',
      env: {
        PORT: 3003,
        NODE_ENV: 'development'
      }
    }
  ]
}
```

#### Step 3: Start with PM2

```bash
pm2 start ecosystem.config.js

# View logs
pm2 logs

# Monitor
pm2 monit

# Save to start on boot
pm2 save
pm2 startup
```

---

## 🌐 Production Hosting Options

### Option 1: Vercel + Railway (Recommended)

This is the easiest way to deploy! Host the frontend on Vercel and the WebSocket server on Railway.

#### Frontend on Vercel

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js
   - Click "Deploy"

3. **Note your Vercel URL:** (e.g., `https://your-app.vercel.app`)

#### WebSocket Server on Railway

1. **Go to [railway.app](https://railway.app)**
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Set the root directory to `mini-services/chat-server`
5. Add environment variables:
   ```
   PORT=3003
   CORS_ORIGIN=https://your-app.vercel.app
   ```
6. Deploy and note your Railway URL

#### Connect Frontend to WebSocket Server

Update your frontend to connect to the Railway WebSocket server:

**In `src/app/page.tsx`, update the socket connection:**
```typescript
const socketInstance = io('https://your-railway-app.railway.app/?XTransformPort=3003', {
  transports: ['websocket', 'polling'],
  // ... rest of config
})
```

Or use environment variables:
```typescript
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3003'
const socketInstance = io(WS_URL, {
  transports: ['websocket', 'polling'],
  // ... rest of config
})
```

---

### Option 2: Docker Deployment

#### Build and Push to Container Registry

```bash
# Build the images
docker build -t websocket-chat-frontend -f Dockerfile.frontend .
docker build -t websocket-chat-server -f mini-services/chat-server/Dockerfile.websocket ./mini-services/chat-server

# Tag for registry
docker tag websocket-chat-frontend your-registry/websocket-chat-frontend:latest
docker tag websocket-chat-server your-registry/websocket-chat-server:latest

# Push to registry
docker push your-registry/websocket-chat-frontend:latest
docker push your-registry/websocket-chat-server:latest
```

#### Deploy with Docker Compose

```bash
# On your server
docker-compose -f docker-compose.prod.yml up -d
```

---

### Option 3: DigitalOcean Droplet

#### Step 1: Create a Droplet

1. Go to [DigitalOcean](https://digitalocean.com)
2. Create a new Droplet
3. Choose Ubuntu 22.04 LTS
4. Select at least 1GB RAM
5. Add SSH keys

#### Step 2: Initial Server Setup

```bash
# SSH into your droplet
ssh root@your-droplet-ip

# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install Bun
curl -fsSL https://bun.sh/install | bash

# Install PM2
npm install -g pm2

# Install Nginx
apt install -y nginx

# Install Certbot for SSL
apt install -y certbot python3-certbot-nginx
```

#### Step 3: Clone and Setup App

```bash
# Create app directory
mkdir -p /var/www/websocket-chat
cd /var/www/websocket-chat

# Clone repository
git clone https://github.com/TheStrongestOfTomorrow/websocket-chat.git .

# Install dependencies
bun install
cd mini-services/chat-server && bun install && cd ../..
```

#### Step 4: Configure Nginx

Create `/etc/nginx/sites-available/websocket-chat`:

```nginx
# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# WebSocket Server
server {
    listen 80;
    server_name ws.yourdomain.com;

    location / {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket specific settings
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
}
```

Enable the sites:
```bash
ln -s /etc/nginx/sites-available/websocket-chat /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### Step 5: Setup SSL

```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com -d ws.yourdomain.com
```

#### Step 6: Start with PM2

```bash
cd /var/www/websocket-chat
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

### Option 4: AWS EC2

#### Step 1: Launch EC2 Instance

1. Go to AWS Console → EC2
2. Launch Instance
3. Choose Ubuntu Server 22.04
4. Select t3.small or larger
5. Configure Security Group:
   - Allow SSH (22)
   - Allow HTTP (80)
   - Allow HTTPS (443)
   - Allow Custom TCP (3000, 3003)

#### Step 2: Connect and Setup

```bash
# Connect via SSH
ssh -i your-key.pem ubuntu@your-ec2-public-ip

# Follow the same steps as DigitalOcean setup above
```

#### Step 3: Configure Elastic IP

1. Allocate Elastic IP in AWS Console
2. Associate with your EC2 instance
3. Update your domain's DNS records

---

### Option 5: Heroku

Heroku doesn't natively support WebSockets well, but you can make it work:

#### Frontend on Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set buildpacks
heroku buildpacks:set heroku/nodejs

# Deploy
git push heroku main
```

#### WebSocket on Heroku

The WebSocket server needs special handling because Heroku assigns random ports:

**Update `mini-services/chat-server/index.ts`:**
```typescript
const PORT = process.env.PORT || 3003
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

Create `Procfile` in `mini-services/chat-server/`:
```
web: node index.ts
```

Deploy as a separate Heroku app.

---

### Option 6: Railway (All-in-One)

Railway can host both services:

1. Create a new project
2. Add two services from GitHub:
   - Main app (root directory)
   - WebSocket server (`mini-services/chat-server`)
3. Connect them via private networking
4. Add custom domains

---

### Option 7: Render

#### Frontend on Render

1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repo
4. Set:
   - Build Command: `bun install && bun run build`
   - Start Command: `bun run start`

#### WebSocket on Render

1. Create another Web Service
2. Set root directory to `mini-services/chat-server`
3. Set:
   - Build Command: `bun install`
   - Start Command: `bun run dev`

---

### Option 8: Self-Hosted VPS

For complete control on any VPS provider:

#### Minimum Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 1 vCPU | 2 vCPU |
| RAM | 1 GB | 2 GB |
| Storage | 10 GB | 20 GB |
| Bandwidth | 1 TB | Unlimited |

#### Quick Setup Script

Save as `setup.sh`:

```bash
#!/bin/bash

# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install Bun
curl -fsSL https://bun.sh/install | bash
export PATH="$HOME/.bun/bin:$PATH"

# Install PM2
npm install -g pm2

# Install Nginx
apt install -y nginx

# Install Git
apt install -y git

# Clone app
cd /var/www
git clone https://github.com/TheStrongestOfTomorrow/websocket-chat.git
cd websocket-chat

# Install dependencies
bun install
cd mini-services/chat-server && bun install && cd ../..

# Setup PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "Setup complete!"
```

Run with:
```bash
chmod +x setup.sh
sudo ./setup.sh
```

---

## ⚙️ Environment Configuration

### Environment Variables

Create `.env` files for configuration:

**Root `.env`:**
```env
# Next.js
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_WS_URL=wss://ws.yourdomain.com

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

**`mini-services/chat-server/.env`:**
```env
# Server
PORT=3003
NODE_ENV=production

# CORS
CORS_ORIGIN=https://yourdomain.com

# Optional: Rate limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000
```

### Production Optimizations

**Update `mini-services/chat-server/index.ts` for production:**
```typescript
const io = new Server(httpServer, {
  path: '/',
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 20e6
})
```

---

## 🔧 Troubleshooting

### Common Issues

#### WebSocket Connection Fails

**Symptoms:**
- "Connection Error" toast
- "Connecting..." spinner stays forever
- Messages not sending

**Solutions:**
1. Check if WebSocket server is running:
   ```bash
   curl http://localhost:3003/socket.io/
   # Should return: {"code":0,"message":"Transport unknown"}
   ```

2. Check firewall rules:
   ```bash
   # Allow port 3003
   sudo ufw allow 3003
   ```

3. Check Nginx configuration:
   ```bash
   nginx -t
   ```

4. Check browser console for errors

#### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 bun run dev
```

#### CORS Errors

**Symptoms:**
- Browser console shows CORS errors
- WebSocket connection refused

**Solution:**
Update CORS settings in `mini-services/chat-server/index.ts`:
```typescript
cors: {
  origin: ["https://yourdomain.com", "http://localhost:3000"],
  methods: ["GET", "POST"],
  credentials: true
}
```

#### Memory Issues

**Symptoms:**
- Server crashes
- Slow performance

**Solution:**
Increase Node.js memory:
```bash
NODE_OPTIONS="--max-old-space-size=4096" bun run dev
```

#### SSL/HTTPS Issues

**Symptoms:**
- WebSocket won't connect over HTTPS
- Mixed content warnings

**Solution:**
Use `wss://` for secure WebSocket connections:
```typescript
const WS_URL = process.env.NODE_ENV === 'production' 
  ? 'wss://ws.yourdomain.com' 
  : 'ws://localhost:3003'
```

---

## 🔒 Security Considerations

### For Production

1. **Use HTTPS/WSS Everywhere**
   - Never use unencrypted connections in production
   - Get free SSL certificates from Let's Encrypt

2. **Rate Limiting**
   - Implement rate limiting on the WebSocket server
   - Prevent abuse and DDoS attacks

3. **Input Validation**
   - Validate all user inputs
   - Sanitize messages (already implemented)

4. **Authentication (Optional)**
   - Add JWT or session-based auth
   - Restrict room creation to authenticated users

5. **Monitoring**
   - Set up logging with tools like Winston or Pino
   - Monitor server health with PM2 or similar

6. **Backups**
   - Regular backups of any persistent data
   - Infrastructure as code for easy recovery

### Security Headers

Add to Nginx config:
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Content-Security-Policy "default-src 'self';" always;
```

---

## 📊 Performance Tips

1. **Use PM2 Cluster Mode:**
   ```javascript
   // ecosystem.config.js
   module.exports = {
     apps: [{
       name: 'websocket-chat',
       script: 'bun',
       instances: 'max',
       exec_mode: 'cluster'
     }]
   }
   ```

2. **Enable Gzip in Nginx:**
   ```nginx
   gzip on;
   gzip_types text/plain text/css application/json application/javascript;
   ```

3. **Use CDN for Static Assets:**
   - CloudFlare
   - AWS CloudFront
   - Vercel's built-in CDN

---

## 🆘 Getting Help

If you encounter issues:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Search existing [GitHub Issues](https://github.com/TheStrongestOfTomorrow/websocket-chat/issues)
3. Create a new issue with:
   - Your hosting platform
   - Error messages
   - Steps to reproduce

---

<div align="center">

**Made with ❤️ for the community**

[⬆ Back to Top](#-hosting-guide-for-websocket-chat)

</div>
