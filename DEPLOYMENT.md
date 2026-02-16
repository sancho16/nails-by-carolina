# 🚀 Deployment Guide

## Deploy to GitHub

### Step 1: Create a New GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the **+** icon in the top right corner
3. Select **New repository**
4. Fill in the details:
   - **Repository name:** `nails-by-carolina` (or your preferred name)
   - **Description:** "Animated digital flyer for Nails by Carolina luxury nail artistry"
   - **Visibility:** Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click **Create repository**

### Step 2: Push to GitHub

After creating the repository, GitHub will show you commands. Run these in your terminal:

```bash
# Add the remote repository
git remote add origin https://github.com/YOUR-USERNAME/nails-by-carolina.git

# Push your code
git branch -M main
git push -u origin main
```

Replace `YOUR-USERNAME` with your actual GitHub username.

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section (in the left sidebar)
4. Under **Source**, select:
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **Save**
6. Wait a few minutes for deployment
7. Your site will be live at: `https://YOUR-USERNAME.github.io/nails-by-carolina/`

## 📱 Share the Live URL

Once deployed, you can:
- Share the GitHub Pages URL with anyone
- View it on any device (phone, tablet, computer)
- Generate a QR code for the live URL for easy mobile access

## 🔄 Update the Site

To make changes and update the live site:

```bash
# Make your changes to the files
# Then commit and push:
git add .
git commit -m "Description of your changes"
git push
```

GitHub Pages will automatically update within a few minutes.

## 🖼️ Adding Images

Remember to add your 5 images to the `images` folder before or after deployment:
- image1.jpg/png - Logo
- image2.jpg/png - Professional photo 1
- image3.jpg/png - OPI products
- image4.jpg/png - Salon entrance
- image5.jpg/png - Professional photo 2

Then commit and push:
```bash
git add images/
git commit -m "Add images"
git push
```

## ✅ Verification

After deployment, verify:
- [ ] Site loads at your GitHub Pages URL
- [ ] All animations work
- [ ] Images display correctly
- [ ] Mobile responsive design works
- [ ] All links function properly

---

**Need help?** Check the [GitHub Pages documentation](https://docs.github.com/en/pages)
