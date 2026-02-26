# Azure Deployment Architecture

This document describes the current Azure deployment infrastructure for the DAW Project, including frontend hosting on Vercel, backend services on Azure App Service, and database on Azure MySQL.

**[Leer en Español](AZURE_DEPLOYMENT_ES.md)**

## Architecture Overview

The application is deployed using a modern cloud architecture combining Azure and Vercel services:

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel CDN                           │
│                    (Frontend - Next.js)                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ↓ (API calls to)
┌──────────────────────────────────────────────────────────────┐
│           Azure App Service (Web App)                        │
│          (Backend - Node.js Express API)                     │
│   pi-backend-ahdch5g9ghajbjh3.spaincentral-01.azure...      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ↓ (Database connection)
┌──────────────────────────────────────────────────────────────┐
│        Azure Database for MySQL (Managed Instance)           │
│               (Production Database)                          │
│          projecte-db.mysql.database.azure.com                │
└──────────────────────────────────────────────────────────────┘
```

## Deployed Components

| Component | Platform | URL | Status |
|-----------|----------|-----|--------|
| **Frontend** | Vercel | [https://daw-pi-iiava.vercel.app](https://daw-pi-iiava.vercel.app) | ✅ Production |
| **Backend** | Azure App Service | [https://projecte-iiava-backend-eue7f0eghzakbkcd.spaincentral-01.azurewebsites.net](https://projecte-iiava-backend-eue7f0eghzakbkcd.spaincentral-01.azurewebsites.net) | ✅ Production |
| **Database** | Azure MySQL | `projecte-db.mysql.database.azure.com` | ✅ Production |

**Key Benefits:**

- Global CDN distribution via Vercel
- Automatic HTTPS/SSL
- Managed database with automated backups
- Automated deployments via GitHub Actions
- Serverless scaling for frontend
- Built-in monitoring and logging

---

## Prerequisites

Before starting the deployment process, ensure you have:

- [Azure Account](https://azure.microsoft.com/) with active subscription
- [Vercel Account](https://vercel.com/) (free tier works)
- [GitHub Account](https://github.com/) with repository access
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) installed (optional, for manual operations)

---

## Database Setup (Azure MySQL)

### Step 1: Create Azure Azure Database for MySQL

1. **Go to Azure Portal** → Search "Azure Database for MySQL"
2. **Click "Create"** → Select "Flexible server"
3. **Configure Basic Settings:**
   - **Subscription**: Choose your subscription
   - **Resource Group**: Create new or use existing
   - **Server Name**: `projecte-db` (or your preferred name)
   - **Region**: Spain Central (or nearest region)
   - **MySQL Version**: 8.0
   - **Workload Type**: Development (for small projects)
   - **Compute + Storage**: Burstable B1ms (1-2 vCores)

4. **Authentication:**
   - **Admin Username**: `juandiegombr` (or your username)
   - **Password**: Create a strong password
   - ⚠️ **Important**: Save these credentials securely

5. **Networking:**
   - **Connectivity Method**: Public access
   - **Firewall Rules**:
     - ✅ Allow Azure services to access
     - Add your local IP for development

6. **Click "Review + Create"** → Wait for deployment (5-10 minutes)

### Step 2: Configure Database Connection

```bash
# Connect to Azure MySQL
mysql -h projecte-db.mysql.database.azure.com -u juandiegombr -p

# Create database
CREATE DATABASE mydatabase;

# Verify connection
SHOW DATABASES;
```

### Step 3: Configure Firewall Rules

In Azure Portal → Your MySQL Server → Networking:

1. **Add Firewall Rule** for your local development IP
2. **Enable "Allow public access from any Azure service"** (for App Service)
3. **Save changes**

⚠️ **Security Note**: For production, restrict firewall rules to specific IPs or use VNet integration.

---

## Backend Deployment (Azure App Service)

### Step 1: Create Azure App Service

1. **Go to Azure Portal** → Search "App Services"
2. **Click "Create"** → "Web App"
3. **Configure Basic Settings:**
   - **Subscription**: Choose your subscription
   - **Resource Group**: Same as MySQL
   - **Name**: `pi-backend` (becomes pi-backend.azurewebsites.net)
   - **Publish**: Code
   - **Runtime Stack**: Node 22 LTS
   - **Operating System**: Linux
   - **Region**: Spain Central (same as database)

4. **Pricing Plan:**
   - **Plan**: Basic B1 or Free F1 (for development)
   - Free tier has limitations but works for small projects

5. **Click "Review + Create"** → Wait for deployment

### Step 2: Configure Environment Variables

In Azure Portal → Your App Service → Configuration → Application Settings:

Add the following environment variables:

```env
MYSQL_HOST=projecte-db.mysql.database.azure.com
MYSQL_PORT=3306
MYSQL_USER=juandiegombr
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=mydatabase
PORT=8080
NODE_ENV=production
```

⚠️ **Important**: Azure App Service uses port 8080 by default for Node.js apps.

Click **"Save"** after adding all variables.

### Step 3: Configure GitHub Actions Deployment

1. **In Azure Portal** → Your App Service → Deployment Center
2. **Source**: GitHub
3. **Authorize GitHub** and select:
   - **Organization**: Your GitHub username
   - **Repository**: daw.pi.iiava
   - **Branch**: main

4. Azure will automatically create a GitHub Actions workflow file

### Step 4: Update GitHub Actions Workflow

The auto-generated workflow needs adjustment for the subdirectory structure:

**File**: `.github/workflows/main_pi-backend.yml`

```yaml
name: Build and deploy Node.js app to Azure Web App - pi-backend

on:
  push:
    branches:
      - main
    paths:
      - 'backend/**'
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Node.js version
        uses: actions/setup-node@v3
        with:
          node-version: '22.x'

      - name: npm install and build
        run: |
          cd backend
          npm install
          npm run build --if-present

      - name: Zip artifact for deployment
        run: |
          cd backend
          zip -r ../release.zip . -x "node_modules/*" -x ".git/*"

      - name: Upload artifact for deployment job
        uses: actions/upload-artifact@v4
        with:
          name: node-app
          path: release.zip

  deploy:
    runs-on: ubuntu-latest
    needs: build
    environment:
      name: 'Production'
      url: ${{ steps.deploy-to-webapp.outputs.webapp-url }}

    steps:
      - name: Download artifact from build job
        uses: actions/download-artifact@v4
        with:
          name: node-app

      - name: Unzip artifact for deployment
        run: unzip release.zip

      - name: 'Deploy to Azure Web App'
        id: deploy-to-webapp
        uses: azure/webapps-deploy@v3
        with:
          app-name: 'pi-backend'
          slot-name: 'Production'
          publish-profile: ${{ secrets.AZUREAPPSERVICE_PUBLISHPROFILE_XXX }}
          package: .
```

### Step 5: Verify Backend Deployment

After pushing to main, check:

```bash
# Test API endpoint
curl https://projecte-iiava-backend-eue7f0eghzakbkcd.spaincentral-01.azurewebsites.net/api/sensors

# Expected response (with your data)
{
  "data": {
    "sensors": [...]
  }
}
```

**View Logs**: Azure Portal → Your App Service → Log stream

---

## Frontend Deployment (Vercel)

### Step 1: Connect GitHub Repository to Vercel

1. **Go to** [vercel.com](https://vercel.com)
2. **Sign in** with GitHub
3. **Click "Add New Project"**
4. **Import Git Repository**: Select `daw.pi.iiava`
5. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

### Step 2: Configure Environment Variables

In Vercel → Your Project → Settings → Environment Variables:

Add the following variable:

| Name | Value |
|------|-------|
| `API_URL` | `https://projecte-iiava-backend-eue7f0eghzakbkcd.spaincentral-01.azurewebsites.net` |

**Note**: This is used for server-side API calls. Client-side calls use the rewrite configuration in `next.config.js`.

### Step 3: Deploy

Vercel automatically deploys on:
- Every push to `main` branch
- Every pull request (preview deployments)

**Production URL**: `https://daw-pi-iiava.vercel.app`

### Step 4: Verify Frontend Deployment

1. Visit: [https://daw-pi-iiava.vercel.app](https://daw-pi-iiava.vercel.app)
2. Check that sensors load correctly
3. Test creating/editing/deleting sensors

**View Logs**: Vercel Dashboard → Your Project → Deployments → Click on deployment → Function Logs

---

## Continuous Deployment Workflow

### Automatic Deployments

Both frontend and backend deploy automatically when you push to `main`:

```bash
# Make changes to your code
git add .
git commit -m "Your commit message"
git push origin main

# Backend: GitHub Actions builds and deploys to Azure App Service
# Frontend: Vercel builds and deploys automatically
```

### Path-Based Triggers

- **Backend Deployment**: Only triggers when files in `backend/` change
- **Frontend Deployment**: Triggers on any change (Vercel default)

### Manual Deployment

**Backend (Azure)**:
- GitHub → Actions → Select workflow → "Run workflow"

**Frontend (Vercel)**:
- Vercel Dashboard → Your Project → Deployments → "Redeploy"

---

## Monitoring and Troubleshooting

### Backend Monitoring (Azure App Service)

**View Logs:**
```bash
# Azure Portal → App Service → Log stream
# Or use Azure CLI
az webapp log tail --name pi-backend --resource-group your-resource-group
```

**Common Issues:**

1. **Application Not Starting**
   - Check environment variables are set correctly
   - Verify PORT is set to 8080
   - Check logs for error messages

2. **Database Connection Failed**
   - Verify MySQL firewall allows Azure services
   - Check MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD are correct
   - Test connection from Azure Cloud Shell:
     ```bash
     mysql -h projecte-db.mysql.database.azure.com -u juandiegombr -p
     ```

3. **502/503 Errors**
   - Application crashed or not responding
   - Check logs for errors
   - Restart App Service: Azure Portal → Overview → Restart

### Frontend Monitoring (Vercel)

**View Logs:**
- Vercel Dashboard → Project → Deployments → Select deployment → Logs

**Common Issues:**

1. **API Calls Failing**
   - Verify API_URL environment variable is set
   - Check backend is responding: `curl https://projecte-iiava-backend-eue7f0eghzakbkcd.spaincentral-01.azurewebsites.net/api/sensors`
   - Check browser console for CORS errors

2. **Build Failures**
   - Check build logs in Vercel Dashboard
   - Verify all dependencies are in package.json
   - Test build locally: `cd frontend && npm run build`

3. **Old Content Showing**
   - Vercel caches aggressively
   - Force redeploy from Vercel Dashboard
   - Clear browser cache

### Database Monitoring (Azure MySQL)

**Check Database Status:**
- Azure Portal → Your MySQL Server → Monitoring → Metrics

**Connect to Database:**
```bash
mysql -h projecte-db.mysql.database.azure.com -u juandiegombr -p mydatabase
```

**Common Issues:**

1. **Connection Timeout**
   - Firewall not configured correctly
   - Add your IP: Azure Portal → MySQL Server → Networking

2. **Access Denied**
   - Check username format (should be just `juandiegombr`, not `juandiegombr@projecte-db`)
   - Verify password is correct

3. **SSL Errors**
   - Azure MySQL requires SSL by default
   - Sequelize config includes SSL settings (already configured)

---

## Cost Estimation

### Azure Costs (Monthly)

| Service | Tier | Estimated Cost |
|---------|------|----------------|
| App Service | Basic B1 | ~$13/month |
| Azure Database for MySQL | Burstable B1ms | ~$12-15/month |
| Storage | 20-32 GB | ~$2-3/month |
| **Total Azure** | | **~$27-31/month** |

### Vercel Costs

| Tier | Cost | Limits |
|------|------|--------|
| Hobby (Free) | $0/month | 100 GB bandwidth, unlimited projects |
| Pro | $20/month | 1 TB bandwidth, advanced features |

**Total Project Cost**: **~$27-31/month** (using Vercel free tier)

### Cost Optimization Tips

1. **Use Free Tiers**: Vercel Hobby is sufficient for small projects
2. **Scale Down**: Use Burstable tier for MySQL during development
3. **Auto-shutdown**: Stop App Service during non-use hours (manual)
4. **Monitor Usage**: Check Azure Cost Management regularly

---

## Security Best Practices

### 1. Database Security

- ✅ Enable SSL connections (already configured)
- ✅ Restrict firewall to specific IPs
- ✅ Use strong passwords
- ✅ Regular backups enabled (Azure default)
- ⚠️ Never commit database credentials to Git

### 2. Application Security

- ✅ Use environment variables for secrets
- ✅ Keep dependencies updated: `npm audit`
- ✅ Enable HTTPS only (Azure/Vercel default)
- ⚠️ Implement rate limiting for APIs
- ⚠️ Add authentication/authorization if needed

### 3. GitHub Secrets

Store sensitive data in GitHub Secrets:
- Azure publish profiles
- Database passwords
- API keys

**Never** hardcode secrets in code or commit them to repository.

---

## Backup and Disaster Recovery

### Database Backups (Azure MySQL)

**Automatic Backups:**
- Azure MySQL automatically backs up your database
- Retention: 7 days (default) up to 35 days
- Point-in-time restore available

**Manual Backup:**
```bash
mysqldump -h projecte-db.mysql.database.azure.com -u juandiegombr -p mydatabase > backup.sql
```

**Restore from Backup:**
- Azure Portal → MySQL Server → Backup and restore
- Or restore from manual backup:
  ```bash
  mysql -h projecte-db.mysql.database.azure.com -u juandiegombr -p mydatabase < backup.sql
  ```

### Application Recovery

**Backend:**
- Code stored in GitHub (version control)
- Redeploy from any commit via GitHub Actions
- App Service configuration backed up in Azure

**Frontend:**
- Code stored in GitHub
- Vercel keeps deployment history
- Rollback to previous deployment in Vercel Dashboard

---

## Additional Resources

### Official Documentation

- [Azure App Service Docs](https://docs.microsoft.com/en-us/azure/app-service/)
- [Azure MySQL Docs](https://docs.microsoft.com/en-us/azure/mysql/)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

### Useful Commands

**Azure CLI:**
```bash
# Login to Azure
az login

# List App Services
az webapp list --output table

# View App Service logs
az webapp log tail --name pi-backend --resource-group your-rg

# Restart App Service
az webapp restart --name pi-backend --resource-group your-rg
```

**MySQL:**
```bash
# Connect to database
mysql -h projecte-db.mysql.database.azure.com -u juandiegombr -p

# List databases
SHOW DATABASES;

# Use database
USE mydatabase;

# Show tables
SHOW TABLES;
```

---

## Support

For issues or questions:

1. Check the [Troubleshooting](#monitoring-and-troubleshooting) section
2. Review deployment logs in Azure Portal or Vercel Dashboard
3. Open an issue in the GitHub repository
4. Consult official documentation linked above

---

**Last Updated**: February 2026
**Maintained By**: Juan Diego Martín-Blas Ramos
