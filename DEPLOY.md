# 🚀 Deploying to GitHub Pages Guide

This project is fully designed and structured as a **Single Page Application (SPA)** using **Vite**, **React**, and **Tailwind CSS**.

---

## 📁 What is the Root Folder?

* **Project Root:** Current directory (containing `package.json`, `index.html`, `/src`, etc.).
* **Production Build Folder:** **`dist/`**
  When you run `npm run build`, Vite compiles all source components down into standard, ultra-optimized static assets (HTML, JS, CSS) inside the **`dist`** directory. This is the **exact folder** that needs to be deployed to GitHub Pages!

---

## 🛠️ Step-by-Step GitHub Pages Deployment Options

We have pre-configured everything for you! 

### Option A: The Automatic Deployment Script (Recommended)

This compiles and pushes your static files straight to a secure `gh-pages` branch on your repository automatically.

1. **Verify your `package.json`**:
   Ensure you have a `"homepage"` field indicating where your app will reside (optional but recommended):
   ```json
   "homepage": "https://<your-username>.github.io/<your-repository-name>/"
   ```
2. **Commit your code** to GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit of modern time calculator"
   git remote add origin https://github.com/<your-username>/<your-repository-name>.git
   git branch -M main
   git push -u origin main
   ```
3. **Execute the deploy command**:
   Run the following in your terminal:
   ```bash
   npm run deploy
   ```
   *This automatically builds the project (`npm run build`) and publishes the `dist/` directory to the `gh-pages` branch.*
4. **Activate Page on GitHub**:
   * Go to your repository on GitHub.
   * Navigate to **Settings** &rarr; **Pages** (under Code and automation).
   * Under **Build and deployment** &rarr; **Source**, make sure **Deploy from a branch** is selected.
   * Under **Branch**, select **`gh-pages`** and the root folder `/`, then click **Save**.

---

### Option B: GitHub Actions (Continuous Deployment)

If you prefer GitHub to build and deploy your app automatically on every `push` to `main`:

1. In your project, create a directory structure: `.github/workflows/`
2. Create a file named `deploy.yml` with the following content:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

permissions:
  contents: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Install Node.js
        uses: actions/setup-node@v4
        with:
          node-node: 20

      - name: Install Dependencies
        run: npm ci

      - name: Compile Application
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: dist # The folder the action should deploy.
```
3. Push this workflow file. GitHub will automatically carry out the build and deploy to GitHub Pages on every single commit!

---

## 💡 Important Notes for GitHub Pages
* **Base Path Safety:** We have safely configured `base: './'` in `vite.config.ts`. This ensures that all script/stylesheet references in `index.html` resolve relatively (i.e. `./assets/...` instead of absolute `/assets/...`), so the app will load successfully even if hosted in a nested repository path!
