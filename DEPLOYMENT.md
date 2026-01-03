# CodexAI Deployment Guide

## Overview

CodexAI is now a fully platform-independent, self-hosted legal AI application that can be deployed on any Linux server, cloud environment (AWS, Azure, GCP), or bare metal infrastructure.

## Prerequisites

- **Node.js**: v22.x or higher
- **MySQL**: v8.0 or higher
- **pnpm**: v10.x or higher
- **Operating System**: Any Linux distribution (Ubuntu, Debian, CentOS, etc.)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/KI-Ind/codexai-app.git
cd codexai-app
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database (Required)
DATABASE_URL=mysql://username:password@localhost:3306/codexai

# JWT Secret (Required - Change this!)
JWT_SECRET=your-secure-random-secret-key

# LLM Provider (Required)
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your-openai-api-key

# Storage (Default: local)
STORAGE_PROVIDER=local
LOCAL_STORAGE_PATH=./storage

# Admin User (for initial setup)
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=YourSecurePassword123!
ADMIN_NAME=Admin User
```

### 4. Setup Database

Create the database and run migrations:

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE codexai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Create database user
mysql -u root -p -e "CREATE USER 'codexai_user'@'localhost' IDENTIFIED BY 'secure_password';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON codexai.* TO 'codexai_user'@'localhost';"
mysql -u root -p -e "FLUSH PRIVILEGES;"

# Run migrations
pnpm db:push
```

### 5. Seed Initial Data

Create the admin user and sample data:

```bash
pnpm db:seed
```

### 6. Build for Production

```bash
pnpm build
```

### 7. Start the Application

```bash
pnpm start
```

The application will be available at `http://localhost:3000`

## Configuration Options

### LLM Provider

CodexAI supports two LLM providers:

#### OpenAI (Recommended)

```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your-api-key
OPENAI_BASE_URL=https://api.openai.com/v1
```

#### Manus Forge (Optional)

```env
LLM_PROVIDER=forge
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=your-forge-key
```

### Storage Provider

#### Local Storage (Default)

```env
STORAGE_PROVIDER=local
LOCAL_STORAGE_PATH=./storage
```

#### Amazon S3

```env
STORAGE_PROVIDER=s3
S3_BUCKET=your-bucket-name
S3_REGION=us-east-1
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
```

## Production Deployment

### Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start application with PM2
pm2 start dist/index.js --name codexai

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Using systemd

Create `/etc/systemd/system/codexai.service`:

```ini
[Unit]
Description=CodexAI Application
After=network.target mysql.service

[Service]
Type=simple
User=codexai
WorkingDirectory=/opt/codexai
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl enable codexai
sudo systemctl start codexai
sudo systemctl status codexai
```

### Using Docker

Create `Dockerfile`:

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
```

Build and run:

```bash
docker build -t codexai .
docker run -d -p 3000:3000 --env-file .env --name codexai codexai
```

### Nginx Reverse Proxy

Create `/etc/nginx/sites-available/codexai`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/codexai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Security Recommendations

1. **Change JWT Secret**: Use a strong, random secret key
2. **Use HTTPS**: Always use SSL/TLS in production
3. **Firewall**: Configure firewall to only allow necessary ports
4. **Database Security**: Use strong passwords and limit database access
5. **Regular Updates**: Keep dependencies and system packages updated
6. **Backup**: Implement regular database and file backups

## Monitoring

### Health Check Endpoint

The application exposes a health check at `/api/health` (to be implemented).

### Logs

Application logs are written to stdout. Use PM2 or systemd to manage logs:

```bash
# PM2 logs
pm2 logs codexai

# systemd logs
sudo journalctl -u codexai -f
```

## Backup and Recovery

### Database Backup

```bash
# Backup
mysqldump -u codexai_user -p codexai > backup_$(date +%Y%m%d).sql

# Restore
mysql -u codexai_user -p codexai < backup_20240103.sql
```

### File Storage Backup

```bash
# Backup local storage
tar -czf storage_backup_$(date +%Y%m%d).tar.gz ./storage

# Restore
tar -xzf storage_backup_20240103.tar.gz
```

## Troubleshooting

### Database Connection Issues

- Verify DATABASE_URL is correct
- Check MySQL service is running: `sudo systemctl status mysql`
- Verify user permissions: `SHOW GRANTS FOR 'codexai_user'@'localhost';`

### Authentication Issues

- Verify JWT_SECRET is set
- Clear browser cookies and try again
- Check server logs for authentication errors

### LLM API Issues

- Verify OPENAI_API_KEY is valid
- Check API quota and rate limits
- Test API connection: `curl https://api.openai.com/v1/models -H "Authorization: Bearer $OPENAI_API_KEY"`

## Support

For issues and questions:
- GitHub Issues: https://github.com/KI-Ind/codexai-app/issues
- Documentation: See README.md and inline code comments

## License

MIT License - See LICENSE file for details
