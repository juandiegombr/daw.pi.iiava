# AWS Deployment Architecture

This document describes the current AWS deployment infrastructure for the DAW Project: the frontend on S3 + CloudFront, the backend running in Docker on EC2, and a managed MySQL database on RDS.

**[Leer en Español](AWS_DEPLOYMENT_ES.md)**

## Architecture Overview

The application is deployed entirely on AWS (region `eu-west-1`). CloudFront is the single public entry point: it serves the static frontend from S3 and routes `/api/*` requests to the backend running on EC2.

```
                       ┌─────────────────────────┐
                       │     CloudFront (CDN)    │
                       │  d12lcsgk45eqvv.cloudfront.net
                       │  Distribution: E8CAZK17RKQ5Z
                       └────────────┬────────────┘
                                    │
                ┌───────────────────┴───────────────────┐
                │                                       │
        (default behavior)                       (/api/* behavior)
                │                                       │
                ↓                                       ↓
   ┌──────────────────────────┐         ┌─────────────────────────────┐
   │  S3 (static hosting)     │         │   EC2 (Docker container)    │
   │  daw-pi-iava-frontend    │         │   ec2-108-129-184-221       │
   │  (React build artifacts) │         │   .eu-west-1.compute...     │
   └──────────────────────────┘         │   Node.js / Express :80→3000│
                                        └──────────────┬──────────────┘
                                                       │
                                                       ↓
                                        ┌─────────────────────────────┐
                                        │     RDS MySQL 8.0           │
                                        │  daw.cjgqeq2gs0wl           │
                                        │  .eu-west-1.rds.amazonaws.com
                                        └─────────────────────────────┘
```

## Deployed Components

| Component | Service | Identifier / URL | Status |
|-----------|---------|------------------|--------|
| **CDN / Entry point** | CloudFront | `https://d12lcsgk45eqvv.cloudfront.net` (distribution `E8CAZK17RKQ5Z`) | ✅ Production |
| **Frontend assets** | S3 | `s3://daw-pi-iava-frontend` | ✅ Production |
| **Backend** | EC2 + Docker | `ec2-108-129-184-221.eu-west-1.compute.amazonaws.com` | ✅ Production |
| **Database** | RDS MySQL 8.0 | `daw.cjgqeq2gs0wl.eu-west-1.rds.amazonaws.com` | ✅ Production |

**Key Benefits:**

- Single public origin (CloudFront) — no CORS to manage between frontend and API
- Global CDN with edge caching for the frontend
- HTTPS terminated at CloudFront
- Managed database with automated backups (RDS)
- Automated deployments via GitHub Actions
- Backend isolated in a Docker container on EC2, restartable independently of the host

---

## Prerequisites

Before reproducing this deployment, ensure you have:

- [AWS Account](https://aws.amazon.com/) with permissions for S3, CloudFront, EC2, and RDS
- [GitHub Account](https://github.com/) with repository access
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) installed (optional, for manual operations)
- An SSH key pair to access EC2 (the project uses `daw.pem`)

---

## Database Setup (Amazon RDS for MySQL)

### Step 1: Create the RDS Instance

1. **Open the AWS Console** → RDS → "Create database"
2. **Engine**: MySQL 8.0
3. **Templates**: Free tier (for development) or Dev/Test
4. **Settings:**
   - **DB instance identifier**: `daw`
   - **Master username**: choose an admin user (e.g. `admin`)
   - **Master password**: a strong password (store securely)
5. **Instance configuration**: `db.t3.micro` (free tier eligible)
6. **Storage**: 20 GB gp3 (autoscaling optional)
7. **Connectivity:**
   - **VPC**: default (or your project VPC)
   - **Public access**: Yes (development) / No + bastion (production)
   - **VPC security group**: create new, e.g. `daw-rds-sg`
   - **Availability zone**: `eu-west-1a` (or whichever is closest)
8. **Database authentication**: Password authentication
9. **Additional configuration**:
   - **Initial database name**: `mydatabase` (or your preferred name)
   - **Backup retention**: 7 days
10. **Create database** → wait ~5-10 minutes for provisioning.

### Step 2: Open the Security Group to the Backend

In EC2 → Security Groups → `daw-rds-sg`, add an inbound rule:

- **Type**: MYSQL/Aurora (3306/TCP)
- **Source**: the security group attached to the EC2 instance running the backend (recommended), or the EC2 public IP

### Step 3: Initialize the Database

```bash
mysql -h daw.cjgqeq2gs0wl.eu-west-1.rds.amazonaws.com -u admin -p

# Verify
SHOW DATABASES;
USE mydatabase;
```

Sequelize will create the tables automatically the first time the backend starts (`sync()`).

---

## Backend Deployment (EC2 + Docker)

The backend runs as a single Docker container on an EC2 instance. The container exposes port `3000` and EC2 maps host port `80` → container `3000`, so CloudFront can hit the EC2 origin over plain HTTP.

### Step 1: Launch the EC2 Instance

1. **EC2 → Launch instance**
2. **Name**: `daw-backend`
3. **AMI**: Amazon Linux 2023 (or Ubuntu 22.04)
4. **Instance type**: `t3.micro` (free tier) — bump up if needed
5. **Key pair**: create or reuse one — the project keeps it as `daw.pem` locally
6. **Network settings:**
   - VPC: same as RDS
   - Security group: allow inbound `22/tcp` from your IP and `80/tcp` from the CloudFront managed prefix list (`com.amazonaws.global.cloudfront.origin-facing`) — or `0.0.0.0/0` if you don't need to restrict
7. **Storage**: 8-16 GB gp3
8. **Launch instance** → note the public DNS (e.g. `ec2-108-129-184-221.eu-west-1.compute.amazonaws.com`).

### Step 2: Bootstrap the Host

SSH in and install Docker + git:

```bash
ssh -i daw.pem ec2-user@ec2-108-129-184-221.eu-west-1.compute.amazonaws.com

# Amazon Linux 2023
sudo dnf install -y docker git
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user
# Log out and back in for the group change to take effect

# Clone the repo
git clone https://github.com/juandiegombr/daw.pi.iiava.git
cd daw.pi.iiava/backend
```

### Step 3: Create the Backend `.env` on the EC2 Host

In `~/daw.pi.iiava/backend/.env`:

```env
MYSQL_HOST=daw.cjgqeq2gs0wl.eu-west-1.rds.amazonaws.com
MYSQL_PORT=3306
MYSQL_USER=admin
MYSQL_PASSWORD=your_rds_password
MYSQL_DATABASE=mydatabase
PORT=3000
NODE_ENV=production
JWT_SECRET=your_jwt_secret
```

⚠️ This file is not in git. It must exist on the EC2 host so the GitHub Actions deploy can pick it up via `--env-file .env`.

### Step 4: Configure GitHub Actions Secrets

In GitHub → repo → Settings → Secrets and variables → Actions, add:

| Secret | Value |
|--------|-------|
| `AWS_EC2_HOST` | `ec2-108-129-184-221.eu-west-1.compute.amazonaws.com` |
| `AWS_EC2_USER` | `ec2-user` (Amazon Linux) or `ubuntu` (Ubuntu) |
| `AWS_EC2_SSH` | contents of the `.pem` private key |
| `AWS_ACCESS_KEY_ID` | IAM user with CloudFront invalidation permission |
| `AWS_SECRET_ACCESS_KEY` | matching secret |
| `AWS_REGION` | `eu-west-1` |

### Step 5: The Deploy Workflow

`.github/workflows/backend-deploy.yml` runs on push to `main` under `backend/**`. It:

1. SSHes into EC2 using the secrets above.
2. Pulls the latest code.
3. Rebuilds the `backend` Docker image on the host (no registry — image stays local to the EC2 instance).
4. Replaces the running container, binding host `:80` → container `:3000`.
5. Invalidates `/api/*` in CloudFront so cached error responses are flushed.

```yaml
script: |
  cd ~/daw.pi.iiava/backend
  git pull origin main
  docker stop backend-container || true
  docker rm backend-container || true
  docker rmi backend || true
  docker build -t backend .
  docker run -d \
    -p 80:3000 \
    --name backend-container \
    --env-file .env \
    --restart unless-stopped \
    backend
```

### Step 6: Verify

```bash
# Direct to EC2 (origin)
curl http://ec2-108-129-184-221.eu-west-1.compute.amazonaws.com/api/sensors

# Through CloudFront (public path)
curl https://d12lcsgk45eqvv.cloudfront.net/api/sensors
```

---

## Frontend Deployment (S3 + CloudFront)

### Step 1: Create the S3 Bucket

1. **S3 → Create bucket**
2. **Name**: `daw-pi-iava-frontend`
3. **Region**: `eu-west-1`
4. **Block all public access**: keep enabled — CloudFront reaches the bucket via OAC, not public reads.
5. **Create bucket**

### Step 2: Create the CloudFront Distribution

1. **CloudFront → Create distribution**
2. **Default origin**: the S3 bucket above (set up Origin Access Control so CloudFront can read it).
3. **Default behavior**:
   - Viewer protocol policy: Redirect HTTP → HTTPS
   - Default root object: `index.html`
4. **Add a second origin** pointing at the EC2 instance:
   - **Origin domain**: `ec2-108-129-184-221.eu-west-1.compute.amazonaws.com`
   - **Protocol**: HTTP only, port 80
5. **Add a behavior** for path pattern `/api/*` → that EC2 origin
   - Cache policy: `CachingDisabled` (the API responses must not be cached)
   - Allowed methods: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
   - Origin request policy: `AllViewer` (forward headers, cookies, query strings)
6. **Custom error responses** (so the SPA routes resolve):
   - 403 → `/index.html` (200)
   - 404 → `/index.html` (200)
7. **Create distribution** → note the domain (e.g. `d12lcsgk45eqvv.cloudfront.net`) and the distribution ID (`E8CAZK17RKQ5Z`).

### Step 3: GitHub Actions Workflow

`.github/workflows/frontend-deploy.yml` runs on push to `main` under `frontend/**`:

1. Builds the frontend with `npm run build`.
2. Syncs `frontend/dist/` to `s3://daw-pi-iava-frontend/` with `--delete`.
3. Invalidates `/*` in CloudFront.

Requires the same `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_REGION` secrets as the backend workflow. The IAM user needs `s3:*` on the bucket and `cloudfront:CreateInvalidation` on the distribution.

### Step 4: Verify

Visit [https://d12lcsgk45eqvv.cloudfront.net](https://d12lcsgk45eqvv.cloudfront.net) and confirm:

- The SPA loads.
- API calls to `/api/sensors` resolve through the same domain (no CORS).

---

## Continuous Deployment Workflow

### Automatic Deployments

Both frontend and backend deploy on push to `main`:

```bash
git add .
git commit -m "Your commit message"
git push origin main

# Frontend: GitHub Actions builds, syncs to S3, invalidates CloudFront
# Backend:  GitHub Actions SSHes into EC2, rebuilds the Docker image, restarts the container, invalidates /api/* in CloudFront
```

### Path-Based Triggers

- **Frontend** workflow triggers only when files under `frontend/` change.
- **Backend** workflow triggers only when files under `backend/` change.

### Manual Deployment

Either workflow can be triggered from **GitHub → Actions → select workflow → "Run workflow"**.

---

## Monitoring and Troubleshooting

### Backend (EC2 + Docker)

```bash
# SSH in
ssh -i daw.pem ec2-user@ec2-108-129-184-221.eu-west-1.compute.amazonaws.com

# Container state
docker ps -a
docker logs -f backend-container

# Restart the container
docker restart backend-container

# Rebuild manually
cd ~/daw.pi.iiava/backend
git pull
docker build -t backend .
docker rm -f backend-container
docker run -d -p 80:3000 --name backend-container --env-file .env --restart unless-stopped backend
```

**Common Issues:**

1. **Container won't start** — check `docker logs backend-container`. Usually it's `.env` missing on the host or RDS credentials wrong.
2. **Cannot reach RDS** — verify the RDS security group allows traffic from the EC2 security group on `3306`.
3. **502 from CloudFront** — origin is unreachable. SSH in and check the container is up and listening on `:80`.

### Frontend (S3 + CloudFront)

- **Build failed** — read the GitHub Actions log; reproduce locally with `cd frontend && npm ci && npm run build`.
- **Old content still served** — CloudFront cache. The deploy invalidates `/*` automatically; if needed, invalidate manually:
  ```bash
  aws cloudfront create-invalidation --distribution-id E8CAZK17RKQ5Z --paths "/*"
  ```
- **404 on a SPA route** — confirm the custom error responses map 403/404 → `/index.html` (200) in the distribution.

### Database (RDS)

```bash
# Connect from anywhere allowed by the security group
mysql -h daw.cjgqeq2gs0wl.eu-west-1.rds.amazonaws.com -u admin -p

# Inspect
SHOW DATABASES;
USE mydatabase;
SHOW TABLES;
```

**Common Issues:**

1. **Connection timeout** — security group does not allow your source on `3306`.
2. **Access denied** — wrong user or password. Check the backend `.env` on EC2.
3. **SSL** — RDS supports SSL; if you enforce it, point Sequelize at the [RDS combined CA bundle](https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem).

---

## Cost Estimation (eu-west-1, monthly)

| Service | Tier | Estimated Cost |
|---------|------|----------------|
| EC2 `t3.micro` (24/7) | Free tier 12 months, then ~$8/mo | ~$0-8 |
| RDS `db.t3.micro` MySQL | Free tier 12 months, then ~$15/mo | ~$0-15 |
| S3 storage + requests | < 1 GB | < $1 |
| CloudFront | < 50 GB egress | < $5 |
| Data transfer out | Variable | $1-5 |
| **Total** | | **~$2-35/month** |

Tips:
- Stay within the AWS free tier during development.
- Stop the EC2 instance and the RDS instance when not in use.
- Watch costs with AWS Budgets.

---

## Security Notes

### Database

- ✅ Place RDS in a private subnet for production
- ✅ Restrict the security group to the backend's security group only
- ✅ Strong master password; rotate periodically
- ✅ Automated backups (default 7 days)
- ⚠️ Never commit DB credentials — they live in the EC2 host's `.env` and GitHub Secrets

### Application

- ✅ Secrets in GitHub Actions secrets / EC2 `.env`, never in code
- ✅ HTTPS terminated at CloudFront
- ✅ `restart: unless-stopped` on the container, so the backend recovers from crashes
- ⚠️ Consider rate limiting and stricter CORS at the Express layer
- ⚠️ The `daw.pem` private key must never be committed (it is gitignored)

### IAM

- The deploy IAM user only needs:
  - `s3:PutObject`, `s3:DeleteObject`, `s3:ListBucket` on the frontend bucket
  - `cloudfront:CreateInvalidation` on the distribution
- The EC2 instance role (if any) should follow least privilege.

---

## Backup and Recovery

### Database (RDS)

- **Automated backups**: 7 days retention by default (configurable up to 35).
- **Point-in-time restore** available from the RDS console.
- **Manual snapshot**:
  ```bash
  aws rds create-db-snapshot \
    --db-instance-identifier daw \
    --db-snapshot-identifier daw-manual-$(date +%Y%m%d)
  ```
- **`mysqldump` backup**:
  ```bash
  mysqldump -h daw.cjgqeq2gs0wl.eu-west-1.rds.amazonaws.com -u admin -p mydatabase > backup.sql
  ```

### Application

- **Code**: GitHub is the source of truth. Re-deploy any commit by re-running the workflow.
- **EC2**: the host is replaceable — bootstrap (Docker + git clone + `.env`) and the deploy workflow rebuilds the container.
- **Frontend**: S3 versions previous builds if you enable versioning; otherwise re-run the workflow to rebuild from a tagged commit.

---

## Useful Commands

**AWS CLI:**

```bash
# CloudFront invalidation
aws cloudfront create-invalidation --distribution-id E8CAZK17RKQ5Z --paths "/*"

# Sync frontend manually
aws s3 sync frontend/dist/ s3://daw-pi-iava-frontend/ --delete

# Tail EC2 system log
aws ec2 get-console-output --instance-id <i-id> --output text
```

**EC2 / Docker:**

```bash
# Container logs
docker logs -f backend-container

# Inspect the running container
docker inspect backend-container

# Disk usage
df -h
docker system df
```

---

**Last Updated**: May 2026
**Maintained By**: Juan Diego Martín-Blas Ramos
