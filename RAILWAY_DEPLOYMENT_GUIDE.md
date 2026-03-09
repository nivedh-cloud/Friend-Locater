# Railway Deployment Guide

## Overview
This guide walks you through deploying the GPS Friend Locator app to Railway with all necessary configuration.

## Prerequisites
- Railway account (https://railway.app)
- GitHub account with repository access
- API tokens and credentials

## Step 1: Environment Variables for Railway

Copy these values for later use:
- **RAILWAY_TOKEN**: (From Railway account settings)
- **PROJECT_ID**: (From your Railway project)
- **TEAM_ID**: (From your Railway account)

## Step 2: Set Up Database (MySQL on Railway)

### In Railway Dashboard:
1. Go to your project
2. Click **+ New Service** → **MySQL**
3. Wait 2-3 minutes for initialization
4. Click on the **MySQL** service
5. Go to **Variables** tab
6. Copy all the database credentials

Your credentials will look like:
```
MYSQL_ROOT_PASSWORD=<password>
MYSQL_HOST=<host>
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_DATABASE=friend_tracker
```

## Step 3: Configure Backend Service

### In Railway Dashboard - Backend Service Variables:

Set these environment variables:

```
# Database Configuration (from MySQL service)
DB_HOST=<mysql-host>
DB_PORT=3306
DB_USER=root
DB_PASSWORD=<mysql-password>
DB_NAME=friend_tracker

# JWT Configuration (generate a secure random key)
SECRET_KEY=<generate-32-char-random-key>

# Railway Internal
PORT=8000
```

### How to Generate SECRET_KEY:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Step 4: Configure Frontend Service

The frontend will be deployed via **Vercel** (already configured).

Your API URL will automatically point to the Railway backend domain.

## Step 5: GitHub Secrets Configuration

### Add to GitHub Repository Secrets:

1. Go to: **Settings** → **Secrets and variables** → **Actions**
2. Add these secrets:

| Secret Name | Value |
|---|---|
| `RAILWAY_TOKEN` | (Your Railway API token) |
| `RAILWAY_PROJECT_ID` | (Your Railway Project ID) |

## Step 6: Deployment

### Push Changes to GitHub:
```bash
git add .
git commit -m "Configure production deployment"
git push origin main
```

### GitHub Actions will automatically:
1. Deploy frontend to Vercel (when `frontend/` changes)
2. Deploy backend to Railway (when `backend/` changes)
3. Initialize database tables on startup

## Step 7: Verify Deployment

### Check Railway Logs:
1. Go to your Railway project
2. Click on the **Backend** service
3. Click **Deployments** tab
4. Click on latest deployment to view logs

### Expected Success Messages:
```
Creating database tables...
Database tables initialized successfully
INFO:     Uvicorn running on 0.0.0.0:8000
```

### Check Frontend:
- Visit your Vercel deployment URL
- Backend API should connect automatically

## Troubleshooting

### Backend Keeps Crashing

**Check:**
1. All database environment variables are set
2. MySQL service is running and accessible
3. Check deployment logs for errors

**Solution:**
```bash
# Redeploy
git push origin main
```

### Database Connection Failed

**Check:**
1. Database host/port are correct
2. Password is URL-encoded (no special characters without encoding)
3. MySQL service is running

**Test Connection:**
The app will retry connections automatically.

### Frontend Can't Reach Backend

**Check:**
1. Backend service URL is correct
2. CORS is enabled (it is by default)
3. Check frontend `config.js` has correct API_BASE_URL

## Important Files

- **Backend**: `.github/workflows/deploy-backend.yml`
- **Frontend**: `.github/workflows/deploy-frontend.yml`
- **Docker**: `Dockerfile` (Railway uses this for backend build)
- **Config**: `backend/models.py` (database configuration)
- **Config**: `frontend/src/config.js` (API endpoint configuration)

## Production Access URLs

After deployment:
- **Backend API**: `https://web-production-xxxx.up.railway.app`
- **Frontend**: `https://gps-friend-locator.vercel.app` (or your Vercel domain)

## Security Notes

1. **SECRET_KEY**: Change this immediately in production
2. **Database Password**: Use strong, unique password
3. **CORS**: Consider restricting `allow_origins` to specific domains in `main.py`
4. **Consider**: Using environment-specific configurations

## Next Steps

1. ✅ Add MySQL service to Railway
2. ✅ Configure environment variables
3. ✅ Add GitHub secrets
4. ✅ Push to GitHub
5. ✅ Monitor deployments

---

**Need Help?** Check the logs in Railway dashboard under Deployments tab.
