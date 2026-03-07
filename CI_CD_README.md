# GPS Friend Locator - CI/CD Pipeline Setup

## 🚀 Automatic Deployment with GitHub Actions

This project uses **GitHub Actions** for continuous integration and continuous deployment (CI/CD).

### ✨ Features

- **Automatic Frontend Deployment** to Vercel on every push to `frontend/`
- **Automatic Backend Deployment** to Railway on every push to `backend/`
- **Free Tier Support** - No credit card needed for basic usage
- **Instant Deployments** - Code pushed = Live in seconds

### 📋 Quick Start

1. **Create Vercel Account** (Frontend)
   ```bash
   https://vercel.com → Sign up with GitHub
   ```

2. **Create Railway Account** (Backend)
   ```bash
   https://railway.app → Sign up with GitHub
   ```

3. **Follow Setup Guide**
   → See `CI_CD_SETUP_GUIDE.md` for detailed instructions

4. **Add GitHub Secrets**
   → Repository Settings → Secrets and variables → Actions

### 🔄 Deployment Workflow

```
Your Code
    ↓
Git Push to GitHub
    ↓
GitHub Actions Triggered
    ├→ Frontend Changes? → Build & Deploy to Vercel ✅
    └→ Backend Changes? → Build & Deploy to Railway ✅
    ↓
Live! 🎉
```

### 📁 Workflow Files

- `.github/workflows/deploy-frontend.yml` - Vercel deployment
- `.github/workflows/deploy-backend.yml` - Railway deployment

### 🛠 Configuration Files

- `Procfile` - Railway process definition
- `Dockerfile` - Container setup for Railway
- `railway.json` - Railway project configuration
- `backend/requirements.txt` - Python dependencies
- `.env.example.frontend` - Frontend environment variables
- `.env.example.backend` - Backend environment variables

### 📊 Current Setup

| Component | Platform | Status | Free Tier |
|-----------|----------|--------|-----------|
| Frontend | Vercel | Ready | ✅ 100GB/month |
| Backend | Railway | Ready | ✅ $5/month |
| Database | MySQL | Manual | ✅ Free option available |
| CI/CD | GitHub Actions | Ready | ✅ 2000min/month |

### 🔐 Required Secrets (GitHub)

Add these in `Settings → Secrets and variables → Actions`:

**For Vercel:**
- `VERCEL_TOKEN` - Your Vercel authentication token
- `VERCEL_ORG_ID` - Your Vercel organization ID
- `VERCEL_PROJECT_ID` - Your Vercel project ID

**For Railway:**
- `RAILWAY_TOKEN` - Your Railway authentication token

### 📝 Environment Variables

**Frontend (Vercel):**
```env
REACT_APP_API_URL=https://your-backend.railway.app
REACT_APP_GOOGLE_MAPS_API_KEY=xxx
```

**Backend (Railway):**
```env
DATABASE_URL=mysql://user:password@host/db
GOOGLE_MAPS_API_KEY=xxx
SECRET_KEY=your-secret
```

### ✅ Testing Deployment

1. **Test Frontend Deployment:**
   ```bash
   echo "// test" >> frontend/src/App.jsx
   git add .
   git commit -m "test: frontend deployment"
   git push origin master
   ```

2. **Test Backend Deployment:**
   ```bash
   echo "# test" >> backend/main.py
   git add .
   git commit -m "test: backend deployment"
   git push origin master
   ```

3. **Watch in GitHub Actions:**
   → Go to repository → Actions tab → See live deployment

### 🎯 Deployed URLs

After first deployment:

- **Frontend:** `https://your-project.vercel.app`
- **Backend:** `https://your-project.railway.app`
- **API Docs:** `https://your-project.railway.app/docs`

### 🚨 Troubleshooting

**Deployment Failed?**
1. Check GitHub Actions logs → Actions tab
2. Verify all secrets are set correctly
3. Check build output for errors

**Need Help?**
→ See `CI_CD_SETUP_GUIDE.md` for detailed troubleshooting

### 📚 Documentation

- **Setup Instructions:** → `CI_CD_SETUP_GUIDE.md`
- **Android Build:** → `ANDROID_BUILD_GUIDE.md`
- **Capacitor Setup:** → `CAPACITOR_SETUP_SUMMARY.md`

### 🔄 How Automatic Deployment Works

When you push code:

1. **GitHub Actions Detects Change**
   - Frontend files changed? → Deploy to Vercel
   - Backend files changed? → Deploy to Railway

2. **Build & Test**
   - Install dependencies
   - Run build command
   - Check for errors

3. **Deploy**
   - Push to platform (Vercel/Railway)
   - Platform builds and deploys
   - Site goes live automatically

4. **Monitor**
   - Check GitHub Actions for status
   - Visit platform dashboards
   - View live deployment

### 💡 Tips

- ✅ Each push triggers deployment (fast!)
- ✅ Rollback available on both platforms
- ✅ View deployment logs in GitHub Actions
- ✅ Monitor live performance in dashboards
- ✅ Set up alerts for failed deployments

### 🎉 You're All Set!

Just push code and watch it deploy automatically!

```bash
git add .
git commit -m "feature: awesome new feature"
git push origin master
# → Automatically deployed! 🚀
```

---

**Need to Deploy Manually?**
1. Vercel: Push any file to `frontend/`
2. Railway: Push any file to `backend/`
3. Check GitHub Actions → See deployment status

**Lost Your Deployment URLs?**
- Vercel: https://vercel.com → Your Project
- Railway: https://railway.app → Your Project
