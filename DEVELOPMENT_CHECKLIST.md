# 📋 Development Checklist & Workspaces

Use this to track progress and manage different development sessions.

---

## ✅ Setup Checklist

### Initial Setup (One Time)
- [ ] Clone repository
- [ ] Read GETTING_STARTED.md
- [ ] Read PROJECT_STATUS.md
- [ ] Install Node.js dependencies
  ```bash
  cd backend && npm install
  cd ../frontend && npm install
  ```
- [ ] Create frontend/.env (copy from template)
- [ ] Add localhost to Google OAuth origins
- [ ] Test local backend: `cd backend && npm run dev`
- [ ] Test local frontend: `cd frontend && npm run dev`
- [ ] Test Google login flow

### Before First Deployment
- [ ] Read backend/DEPLOYMENT_GUIDE.md
- [ ] Create Cloudflare account
- [ ] Run `wrangler login`
- [ ] Create D1 database
- [ ] Create R2 bucket
- [ ] Create KV namespaces
- [ ] Update wrangler.toml with resource IDs
- [ ] Test deployment: `npm run deploy`

---

## 🎯 Daily Development Workflow

### Morning Standup
- [ ] Check PROJECT_STATUS.md for latest updates
- [ ] Read QUICK_REFERENCE.txt for any new info
- [ ] Check git for recent changes: `git log --oneline -5`

### Start Development Session
- [ ] Open two terminals
- [ ] Terminal 1: `cd backend && npm run dev`
- [ ] Terminal 2: `cd frontend && npm run dev`
- [ ] Visit http://localhost:3000
- [ ] Test basic functionality

### During Development
- [ ] Make changes in code
- [ ] Frontend auto-reloads (check console for errors)
- [ ] Backend: restart `npm run dev` after changes
- [ ] Test frequently
- [ ] Commit changes: `git add . && git commit -m "description"`

### Before Committing
- [ ] Run tests (if any)
- [ ] Check for console errors (F12)
- [ ] Check backend logs for issues
- [ ] Test with deployed API (if changed backend)
  ```bash
  cd frontend && ./switch-api.sh
  ```

### End of Day
- [ ] Commit all changes
- [ ] Push to repo (if applicable)
- [ ] Document any blockers in notes

---

## 🔧 Backend Development Checklist

### Task: Create New Endpoint

- [ ] Design endpoint (method, path, request/response)
- [ ] Create handler file: `backend/src/handlers/nameHandler.ts`
- [ ] Create route file: `backend/src/routes/name.ts`
- [ ] Add route to router: `backend/src/router/router.ts`
- [ ] Test locally: 
  ```bash
  curl http://localhost:8787/api/v1/endpoint
  ```
- [ ] Test with frontend
- [ ] Update API documentation
- [ ] Deploy: `npm run deploy`

### Task: Modify Database Schema

- [ ] Update model: `backend/src/models/Name.ts`
- [ ] Update repository: `backend/src/repositories/NameRepository.ts`
- [ ] Update database init: `backend/src/database/init.ts`
- [ ] Test locally
- [ ] Check wrangler.toml for D1 binding
- [ ] Deploy: `npm run deploy`
- [ ] Update backend/DATA_MODELS.md

### Task: Add New Service

- [ ] Create service: `backend/src/services/NewService.ts`
- [ ] Implement methods
- [ ] Add TypeScript types
- [ ] Import in handlers
- [ ] Test locally
- [ ] Add documentation
- [ ] Deploy: `npm run deploy`

---

## 🎨 Frontend Development Checklist

### Task: Create New Component

- [ ] Create component: `frontend/src/components/Name.vue`
- [ ] Add template
- [ ] Add script (TypeScript)
- [ ] Add styles (scoped)
- [ ] Import in parent/view
- [ ] Test locally: `npm run dev`
- [ ] Check on multiple browsers
- [ ] Document in code

### Task: Create New Page/View

- [ ] Create view: `frontend/src/views/Name.vue`
- [ ] Add route in `frontend/src/routes/index.js`
- [ ] Create corresponding API service
- [ ] Add navigation link
- [ ] Test routing
- [ ] Test API calls
- [ ] Check styling on mobile

### Task: Integrate API Endpoint

- [ ] Update `frontend/src/api/endpoints.js`
- [ ] Add service method in `frontend/src/services/nameService.js`
- [ ] Add store action in `frontend/src/stores/nameStore.js`
- [ ] Use in component
- [ ] Handle loading state
- [ ] Handle error state
- [ ] Test with actual backend
- [ ] Test with deployed API

### Task: Update State Management

- [ ] Update store: `frontend/src/stores/nameStore.js`
- [ ] Define state
- [ ] Define getters
- [ ] Define actions
- [ ] Define mutations
- [ ] Update components using store
- [ ] Test state changes
- [ ] Check dev tools

---

## 🚀 Deployment Checklist

### Pre-Deployment (Backend)

- [ ] All tests passing (if any)
- [ ] No console errors
- [ ] No TypeScript errors: `npm run build`
- [ ] Tested locally thoroughly
- [ ] Updated documentation
- [ ] Version bump in package.json (optional)

### Deployment (Backend)

- [ ] Run: `cd backend && wrangler login`
- [ ] Run: `npm run deploy`
- [ ] Check deployment output
- [ ] Note worker URL
- [ ] Test with health check: `curl https://image-generator-api.YOUR-USERNAME.workers.dev/api/v1/health`
- [ ] View logs: `npm run tail`

### Post-Deployment (Backend)

- [ ] Check no errors in logs
- [ ] Test all endpoints
- [ ] Verify D1/R2/KV connections
- [ ] Document any issues
- [ ] Update team on deployment

### Pre-Deployment (Frontend)

- [ ] All tests passing
- [ ] No console errors
- [ ] Tested locally thoroughly
- [ ] Updated .env with deployed API URL
- [ ] Run: `npm run build`
- [ ] Check build output
- [ ] No build warnings

### Deployment (Frontend)

- [ ] Choose deployment platform (Netlify, Vercel, etc.)
- [ ] Push to repo (if auto-deploy configured)
- [ ] Or manually deploy build directory
- [ ] Verify deployment
- [ ] Test authentication flow
- [ ] Check CORS headers

### Post-Deployment (Frontend)

- [ ] Test all features
- [ ] Check console for errors
- [ ] Check backend logs
- [ ] Monitor for issues
- [ ] Document deployment

---

## 🐛 Debugging Checklist

### When Something Breaks

- [ ] Check browser console (F12)
- [ ] Check backend logs: `npm run tail` (if deployed)
- [ ] Check terminal output (if local)
- [ ] Verify API URL in .env
- [ ] Verify backend is running
- [ ] Check network tab (F12)
- [ ] Verify request/response
- [ ] Check CORS errors
- [ ] Restart services
- [ ] Check git diff for recent changes

### Specific Issues

**API 404:**
- [ ] Verify endpoint exists
- [ ] Check API URL format
- [ ] Check backend is running
- [ ] Check method (GET/POST/etc)

**API 500:**
- [ ] Check backend logs
- [ ] Check request format
- [ ] Check authentication token
- [ ] Check database connection

**Frontend not loading:**
- [ ] Check browser console
- [ ] Check Vite output
- [ ] Clear browser cache
- [ ] Check .env file
- [ ] Restart dev server

**Database issues:**
- [ ] Check D1 connection
- [ ] Check migrations
- [ ] Check schema
- [ ] Check data types

---

## 📝 Session Templates

### Frontend Development Session

```
Date: ____________________
Task: ____________________
Duration: _____

Start:
- [ ] Terminal: npm run dev (backend)
- [ ] Terminal: npm run dev (frontend)
- [ ] Visit http://localhost:3000

Work:
- [ ] Task: _____________
- [ ] Files changed: _______________
- [ ] Issues: _______________

Test:
- [ ] Local testing: ✓/✗
- [ ] API testing: ✓/✗
- [ ] Browser compat: ✓/✗

End:
- [ ] Commit: git commit -m "..."
- [ ] Push: git push
- [ ] Notes: _______________
```

### Backend Development Session

```
Date: ____________________
Task: ____________________
Duration: _____

Start:
- [ ] Terminal: npm run dev
- [ ] Check git status

Work:
- [ ] Task: _____________
- [ ] Files changed: _______________
- [ ] New endpoints: _______________

Test:
- [ ] Local testing: ✓/✗
- [ ] Endpoint test: curl _______________
- [ ] TypeScript: npm run build ✓/✗

Deploy:
- [ ] Deployed: ✓/✗
- [ ] Worker URL: _______________
- [ ] Issues: _______________

End:
- [ ] Commit: git commit -m "..."
- [ ] Push: git push
- [ ] Notes: _______________
```

### Deployment Session

```
Date: ____________________
Component: _______________
Environment: _______________

Pre-Deployment:
- [ ] Tests passing
- [ ] No errors
- [ ] Documented
- [ ] Ready to deploy

Deployment:
- [ ] Started at: _______________
- [ ] Completed at: _______________
- [ ] Issues: _______________

Post-Deployment:
- [ ] Verified working
- [ ] Monitored for issues
- [ ] Team notified
- [ ] Documentation updated
```

---

## 🎯 Feature Implementation Template

### New Feature Checklist

**Feature Name:** _______________

**Backend:**
- [ ] Design API endpoint(s)
- [ ] Create handler
- [ ] Create route
- [ ] Add to router
- [ ] Test with curl
- [ ] Update database (if needed)
- [ ] Deploy: `npm run deploy`
- [ ] Test deployed endpoint
- [ ] Document API

**Frontend:**
- [ ] Create component (if UI needed)
- [ ] Add API service
- [ ] Add store action
- [ ] Create/update view
- [ ] Add routing (if needed)
- [ ] Test locally
- [ ] Test with deployed API
- [ ] Update documentation

**Verification:**
- [ ] Feature works end-to-end
- [ ] No console errors
- [ ] No API errors
- [ ] Mobile responsive (if applicable)
- [ ] Tested in multiple browsers
- [ ] Documentation complete

---

## 📊 Progress Tracking

### Weekly Progress

**Week of: ____________________**

Monday:
- [ ] Task: _______________
- [ ] Status: _______________

Tuesday:
- [ ] Task: _______________
- [ ] Status: _______________

Wednesday:
- [ ] Task: _______________
- [ ] Status: _______________

Thursday:
- [ ] Task: _______________
- [ ] Status: _______________

Friday:
- [ ] Task: _______________
- [ ] Status: _______________

**Summary:**
- Completed: _______________
- Blockers: _______________
- Next week: _______________

---

## 🔄 Environment Switching Checklist

### Switch to Local

- [ ] Run: `cd frontend && ./switch-api.sh`
- [ ] Select: 1 (Local Backend)
- [ ] Run: `npm run dev`
- [ ] Verify: Backend on http://localhost:8787
- [ ] Verify: Frontend on http://localhost:3000
- [ ] Test API call

### Switch to Deployed

- [ ] Run: `cd frontend && ./switch-api.sh`
- [ ] Select: 2 (Deployed Worker)
- [ ] Enter: Your Cloudflare username
- [ ] Run: `npm run dev`
- [ ] Verify: URL in .env.local
- [ ] Test API call

### Switch to Custom

- [ ] Run: `cd frontend && ./switch-api.sh`
- [ ] Select: 3 (Custom URL)
- [ ] Enter: Custom API URL
- [ ] Run: `npm run dev`
- [ ] Test API call

---

## 💾 Git Workflow

### Before Committing

- [ ] `git status` - Review changes
- [ ] `git diff` - Review code
- [ ] Test thoroughly
- [ ] Fix any issues

### Committing

```bash
git add .
git commit -m "Descriptive message"
git push
```

### Before Merging

- [ ] All tests passing
- [ ] Code reviewed
- [ ] No conflicts
- [ ] Documentation updated

---

## 🎓 Learning Path

### Phase 1: Understanding (Days 1-2)
- [ ] Read GETTING_STARTED.md
- [ ] Read PROJECT_STATUS.md
- [ ] Explore codebase structure
- [ ] Read backend/README.md
- [ ] Read frontend code structure

### Phase 2: Development (Days 3-5)
- [ ] Run project locally
- [ ] Test authentication
- [ ] Make small code changes
- [ ] Deploy to Cloudflare
- [ ] Test deployed version

### Phase 3: Building (Days 6+)
- [ ] Implement new features
- [ ] Integrate Nanobanana API
- [ ] Create UI components
- [ ] Test thoroughly
- [ ] Deploy to production

---

## 📱 Environment Quick Reference

| Env | URL | Command | Status |
|-----|-----|---------|--------|
| Local | http://localhost:8787 | `cd backend && npm run dev` | Ready |
| Frontend Local | http://localhost:3000 | `cd frontend && npm run dev` | Ready |
| Deployed | https://image-generator-api.YOUR-USERNAME.workers.dev | `npm run deploy` | Ready |

---

**Print this and keep it handy! ✅**

Use it to track your progress and manage development sessions.

🚀 Happy coding!
