
# Branching Strategy Guide

## Overview

This project uses a **GitFlow-inspired** branching strategy optimized for continuous deployment and collaborative development.

## Branch Types

### Main Branches

#### `main`
- **Purpose**: Production-ready code
- **Protection**: Fully protected, requires PR reviews
- **Deployment**: Auto-deploys to production
- **Naming**: Always `main`

#### `develop`
- **Purpose**: Integration branch for features
- **Protection**: Requires PR reviews
- **Deployment**: Auto-deploys to staging
- **Naming**: Always `develop`

### Supporting Branches

#### Feature Branches
- **Purpose**: New features and enhancements
- **Naming**: `feature/<ticket-number>-<short-description>`
- **Examples**: 
  - `feature/123-chat-export`
  - `feature/456-dark-mode`
- **Lifetime**: Created from `develop`, merged back to `develop`

#### Bugfix Branches
- **Purpose**: Bug fixes for development
- **Naming**: `bugfix/<ticket-number>-<short-description>`
- **Examples**:
  - `bugfix/789-message-rendering`
  - `bugfix/101-auth-timeout`
- **Lifetime**: Created from `develop`, merged back to `develop`

#### Hotfix Branches
- **Purpose**: Critical production fixes
- **Naming**: `hotfix/<ticket-number>-<short-description>`
- **Examples**:
  - `hotfix/999-security-patch`
  - `hotfix/888-critical-error`
- **Lifetime**: Created from `main`, merged to both `main` and `develop`

#### Release Branches
- **Purpose**: Prepare releases
- **Naming**: `release/<version>`
- **Examples**:
  - `release/v1.2.0`
  - `release/v2.0.0-beta`
- **Lifetime**: Created from `develop`, merged to `main` and `develop`

## Workflow Process

### 1. Feature Development

```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/123-new-feature

# Work on feature
git add .
git commit -m "feat(chat): add message export functionality"

# Push and create PR
git push origin feature/123-new-feature
```

### 2. Code Review Process

1. **Create PR** to `develop` branch
2. **Automated checks** must pass:
   - Tests
   - Type checking
   - Security scan
   - Code quality
3. **Peer review** required (minimum 1 approver)
4. **Address feedback** and update
5. **Merge** when approved

### 3. Release Process

```bash
# Create release branch
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# Update version and changelog
npm version 1.2.0
git add .
git commit -m "chore: bump version to 1.2.0"

# Push and create PR to main
git push origin release/v1.2.0
```

### 4. Hotfix Process

```bash
# Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/999-critical-fix

# Fix the issue
git add .
git commit -m "fix(security): patch authentication vulnerability"

# Push and create PRs to both main and develop
git push origin hotfix/999-critical-fix
```

## Branch Protection Rules

### Main Branch
- Require PR reviews (2 approvers)
- Require status checks to pass
- Require up-to-date branches
- Restrict pushes to admins only
- Require linear history

### Develop Branch
- Require PR reviews (1 approver)
- Require status checks to pass
- Require up-to-date branches
- Allow squash merging

### Feature Branches
- No protection rules
- Allow force pushes for rebasing
- Delete after merge

## Commit Message Guidelines

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting/style
- `refactor`: Code restructuring
- `perf`: Performance improvement
- `test`: Testing
- `chore`: Build/tooling

### Examples
```
feat(auth): add OAuth integration
fix(ui): resolve mobile layout issues
docs(api): update endpoint documentation
refactor(db): optimize query performance
```

## Automation Rules

### Auto-merge Conditions
- All checks pass
- Required approvals obtained
- No merge conflicts
- Branch is up-to-date

### Auto-delete Branches
- Feature branches after merge
- Bugfix branches after merge
- Stale branches after 30 days

## Best Practices

### Do's
- ✅ Keep branches focused and small
- ✅ Rebase before merging
- ✅ Write descriptive commit messages
- ✅ Test locally before pushing
- ✅ Update documentation
- ✅ Reference issues in commits

### Don'ts
- ❌ Direct pushes to main/develop
- ❌ Long-lived feature branches
- ❌ Merge commits in feature branches
- ❌ Generic commit messages
- ❌ Breaking changes without notice
- ❌ Committing sensitive data

## Emergency Procedures

### Rollback Process
1. Identify problematic commit
2. Create hotfix branch from previous stable commit
3. Revert changes or apply fixes
4. Fast-track through review process
5. Deploy immediately

### Branch Recovery
```bash
# Recover deleted branch
git reflog
git checkout -b recovered-branch <commit-hash>

# Recover from force push
git reflog origin/branch-name
git reset --hard <previous-commit>
```

## Tools and Integration

### Required Tools
- **Git GUI**: GitHub Desktop, GitKraken, or SourceTree
- **CLI Tools**: GitHub CLI (`gh`), Git hooks
- **IDE Integration**: VS Code Git extensions

### Recommended Hooks
- Pre-commit: Linting, type checking
- Pre-push: Tests, security scan
- Post-merge: Dependency updates

## Training Resources

### For Beginners
- [Git Basics Tutorial](https://git-scm.com/docs/gittutorial)
- [GitHub Flow Guide](https://guides.github.com/introduction/flow/)
- [Interactive Git Tutorial](https://learngitbranching.js.org/)

### For Advanced Users
- [Pro Git Book](https://git-scm.com/book)
- [GitFlow Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
- [Advanced Git Techniques](https://github.com/git-tips/tips)

## Monitoring and Metrics

### Key Metrics
- Branch lifetime
- PR review time
- Deployment frequency
- Lead time for changes
- Mean time to recovery

### Reporting
- Weekly branch health reports
- Monthly workflow efficiency analysis
- Quarterly strategy review
