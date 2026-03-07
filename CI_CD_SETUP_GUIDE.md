# CI/CD Deployment Setup Guide

This guide will help you set up automatic deployment using GitHub Actions with free hosting platforms.

## What Gets Deployed

- **Frontend**: Automatically deploys to Vercel whenever you push to `frontend/` folder
- **Backend**: Automatically deploys to Railway whenever you push to `backend/` folder

## Prerequisites

✅ GitHub repository (already set up)
✅ GitHub Actions (built-in, no setup needed)

## Step 1: Set Up Frontend Deployment (Vercel)

### 1.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub (recommended)
3. Authorize Vercel to access your repositories

### 1.2 Create Vercel Project
1. Click "Add New Project"
2. Import your `Friend-Locater` repository
3. Configure project settings:
   - **Framework Preset**: React
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
4. Click "Deploy"

### 1.3 Generate Vercel Tokens

**Get Vercel Token:**
1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Name it: `GITHUB_ACTIONS`
4. Copy the token

**Get Vercel Project ID:**
1. Go to your project settings: https://vercel.com/nivedh-cloud/gps-friendlocater
2. Copy the **Project ID** from project settings
3. Copy the **Org ID** from your account settings: https://vercel.com/account/general

### 1.4 Add Secrets to GitHub

1. Go to your GitHub repo: https://github.com/nivedh-cloud/Friend-Locater
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click "New repository secret" and add:

| Name | Value |
|------|-------|
| `VERCEL_TOKEN` | Your Vercel token from step 1.3 |
| `VERCEL_ORG_ID` | Your Vercel Org ID |
| `VERCEL_PROJECT_ID` | Your Vercel Project ID |

---

## Step 2: Set Up Backend Deployment (Railway)

### 2.1 Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Authorize Railway to access your repositories

### 2.2 Create Railway Project
1. Click "New Project" → "Deploy from GitHub repo"
2. Select your `Friend-Locater` repository
3. Railway will auto-detect it's a Python project

### 2.3 Configure Railway

**Add Environment Variables:**
1. Go to project settings
2. Add these variables:
```
DATABASE_URL=your_database_url
GOOGLE_MAPS_API_KEY=your_api_key
SECRET_KEY=your_secret_key
```

**Configure Python:**
1. Create `Procfile` in `backend/` folder:
```
web: gunicorn main:app
```

2. Create `requirements.txt` in `backend/`:
```
fastapi==0.104.1
uvicorn==0.24.0
sqlalchemy==2.0.23
mysql-connector-python==8.2.0
python-multipart==0.0.6
python-jose==3.3.0
passlib==1.7.4
pydantic==2.5.0
gunicorn==21.2.0
```

### 2.4 Generate Railway Token

1. Go to https://railway.app/account/tokens
2. Click "Create new token"
3. Copy the token

### 2.5 Add to GitHub Secrets

1. Go to GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click "New repository secret":

| Name | Value |
|------|-------|
| `RAILWAY_TOKEN` | Your Railway token from step 2.4 |

---

## Step 3: Create Netlify Database (Optional)

For production database, use Railway's built-in PostgreSQL:

1. In Railway project, click "Add Service"
2. Select "Provision PostgreSQL"
3. Railway will create a PostgreSQL database
4. Database URL will be auto-added as `DATABASE_URL`

---

## Step 4: Test the Setup

### Test Frontend Deployment:
```bash
# Make a change to frontend code
echo "// test change" >> frontend/src/App.jsx

git add .
git commit -m "test: verify frontend deployment"
git push origin master
```

Then check:
1. Go to GitHub repo → **Actions** tab
2. Watch `Deploy Frontend to Vercel` workflow
3. Once done, visit your Vercel URL (shown in deployment)

### Test Backend Deployment:
```bash
# Make a change to backend code
echo "# test change" >> backend/main.py

git add .
git commit -m "test: verify backend deployment"
git push origin master
```

Then check:
1. Go to GitHub repo → **Actions** tab
2. Watch `Deploy Backend to Railway` workflow
3. Once done, visit your Railway app URL

---

## Workflow Triggers

Workflows automatically run on:

**Frontend:**
- ✅ Any push to `frontend/` folder
- ✅ Any push to `.github/workflows/deploy-frontend.yml`

**Backend:**
- ✅ Any push to `backend/` folder  
- ✅ Any push to `.github/workflows/deploy-backend.yml`

---

## Monitoring Deployments

### GitHub Actions Dashboard
1. Go to your repo → **Actions** tab
2. See all workflow runs
3. Click to see logs and errors

### Vercel Deployments
1. Go to https://vercel.com/nivedh-cloud/gps-friendlocater
2. See deployment history
3. View logs and rollback if needed

### Railway Deployments
1. Go to https://railway.app (logged in)
2. Click your project
3. See deployment logs
4. Monitor live status

---

## Environment Variables Needed

### Backend (Railway)
```env
DATABASE_URL=mysql://user:password@host:3306/dbname
GOOGLE_MAPS_API_KEY=your_key_here
SECRET_KEY=your_secret_key
```

### Frontend (Vercel)
```env
REACT_APP_API_URL=https://your-railway-backend.railway.app
REACT_APP_GOOGLE_MAPS_API_KEY=your_key_here
```

---

## Common Issues & Fixes

### Workflow Not Running
**Problem**: Pushed code but workflow didn't start
**Solution**: 
- Check file paths are correct (`frontend/` or `backend/`)
- Workflow files must be in `.github/workflows/`
- Could take 30 seconds to show up

### Build Failed
**Problem**: Build step fails in GitHub Actions
**Solution**:
- Check build logs in Actions tab
- Usually missing dependencies: update `package.json` or `requirements.txt`
- Run build locally first: `npm run build` (frontend) or `python main.py` (backend)

### Secret Not Found
**Problem**: Error about missing `VERCEL_TOKEN` or `RAILWAY_TOKEN`
**Solution**:
- Double-check secret names (case-sensitive!)
- Verify secrets are added to correct repository
- Secrets can take 1 minute to be available

### Database Connection Error
**Problem**: Backend can't connect to database
**Solution**:
- Verify `DATABASE_URL` in Railway environment variables
- Check database is running
- Try connecting locally first

---

## Free Tier Limits

| Service | Free Tier Limit |
|---------|-----------------|
| Vercel | 100 GB bandwidth, unlimited deployments |
| Railway | $5/month free credit (usually covers everything) |
| GitHub Actions | 2000 minutes/month |

---

## Next Steps

1. ✅ Create Vercel account → Deploy frontend
2. ✅ Create Railway account → Deploy backend
3. ✅ Add GitHub secrets
4. ✅ Test deployment workflows
5. ✅ Monitor in GitHub Actions dashboard
6. ✅ Share deployed URLs with team

---

## Deployment URLs After Setup

After first successful deployment:

- **Frontend**: `https://your-project.vercel.app`
- **Backend**: `https://your-project.railway.app`

Update frontend config to use backend URL:
```javascript
// frontend/src/config.js
const API_BASE_URL = "https://your-project.railway.app";
```

---

## Support

For issues:
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- GitHub Actions Docs: https://docs.github.com/actions
