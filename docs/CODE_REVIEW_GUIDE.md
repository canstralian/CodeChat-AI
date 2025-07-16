
# Code Review Guide

## Overview

This guide establishes standards for code reviews to ensure code quality, knowledge sharing, and team collaboration.

## Review Process

### 1. Pre-Review Checklist (Author)

Before requesting a review:
- [ ] Code compiles and runs without errors
- [ ] All tests pass locally
- [ ] Code follows project style guidelines
- [ ] Documentation is updated
- [ ] Self-review completed
- [ ] PR description is clear and complete

### 2. Review Timeline

| PR Size | Review Time | Response Time |
|---------|-------------|---------------|
| Small (< 100 lines) | 2 hours | 4 hours |
| Medium (100-500 lines) | 4 hours | 8 hours |
| Large (> 500 lines) | 8 hours | 24 hours |

### 3. Review Assignments

#### Automatic Assignment
- Frontend changes: Frontend team members
- Backend changes: Backend team members
- Security changes: Security team + Senior developer
- Database changes: Database specialist + Team lead

#### Manual Assignment
- Complex features: Domain expert + Peer
- Critical fixes: Senior developer + Team lead
- Architecture changes: Technical architect + Team lead

## Review Criteria

### Code Quality
- **Correctness**: Does the code solve the problem?
- **Readability**: Is the code easy to understand?
- **Maintainability**: Will future developers understand this?
- **Performance**: Are there any performance concerns?
- **Security**: Are there any security vulnerabilities?

### Specific Checks

#### TypeScript/JavaScript
- [ ] Proper type annotations
- [ ] No `any` types without justification
- [ ] Proper error handling
- [ ] No console.log statements
- [ ] Consistent naming conventions
- [ ] Proper async/await usage

#### React Components
- [ ] Proper component structure
- [ ] Appropriate use of hooks
- [ ] Props validation
- [ ] Accessibility considerations
- [ ] Performance optimizations (useMemo, useCallback)

#### Backend Code
- [ ] Proper request validation
- [ ] Error handling and logging
- [ ] Database query optimization
- [ ] Authentication/authorization checks
- [ ] API documentation updates

#### Database Changes
- [ ] Schema migrations are reversible
- [ ] Proper indexing strategy
- [ ] Data validation rules
- [ ] Performance impact assessment

## Review Guidelines

### For Reviewers

#### What to Look For
1. **Logic and Algorithms**
   - Correctness of implementation
   - Edge cases handling
   - Algorithm efficiency

2. **Code Structure**
   - Function/class organization
   - Separation of concerns
   - Code duplication

3. **Error Handling**
   - Proper exception handling
   - Graceful degradation
   - User-friendly error messages

4. **Security**
   - Input validation
   - Authentication/authorization
   - Data sanitization
   - Secure API usage

5. **Performance**
   - Database query efficiency
   - Memory usage
   - Caching strategies
   - Bundle size impact

#### How to Give Feedback

**Effective Comments:**
```
// Good: Specific and actionable
"Consider using useMemo here to prevent unnecessary recalculations 
on every render when `data` hasn't changed."

// Good: Explain reasoning
"This function could benefit from error handling. If the API call 
fails, the user won't get any feedback about what went wrong."

// Good: Suggest alternatives
"Instead of mapping over this array multiple times, consider using 
a single reduce operation for better performance."
```

**Avoid:**
```
// Bad: Vague
"This looks wrong."

// Bad: Personal preference without explanation
"I don't like this approach."

// Bad: Nitpicky without value
"Add a space here."
```

#### Comment Categories

Use these prefixes to categorize your comments:

- **🔴 MUST FIX**: Critical issues that block merging
- **🟡 SHOULD FIX**: Important improvements
- **🟢 CONSIDER**: Suggestions for improvement
- **💭 QUESTION**: Asking for clarification
- **👍 PRAISE**: Positive feedback
- **📚 LEARN**: Educational comments

### For Authors

#### Responding to Feedback
1. **Thank reviewers** for their time
2. **Ask for clarification** if comments are unclear
3. **Explain your reasoning** for implementation choices
4. **Make requested changes** promptly
5. **Respond to each comment** (even if just "Done")

#### Handling Disagreements
1. **Discuss in comments** first
2. **Schedule a meeting** if needed
3. **Escalate to team lead** if no consensus
4. **Document decisions** for future reference

## Review Tools and Automation

### GitHub Features
- **Review assignments**: Automatic and manual
- **Review requests**: Request specific reviewers
- **Suggestions**: Use GitHub's suggestion feature
- **Batch reviews**: Review multiple files together

### IDE Integration
- **VS Code**: GitHub Pull Requests extension
- **IntelliJ**: GitHub integration
- **Vim**: GitHub CLI integration

### Automation Tools
- **CodeQL**: Security analysis
- **ESLint**: Code quality
- **Prettier**: Code formatting
- **Dependabot**: Dependency updates

## Special Review Types

### Security Reviews
Required for:
- Authentication/authorization changes
- API endpoint modifications
- Database schema changes
- Third-party integrations

Additional checks:
- [ ] OWASP Top 10 considerations
- [ ] Input validation and sanitization
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection

### Performance Reviews
Required for:
- Database query changes
- Large data processing
- Frontend rendering optimizations
- API response time improvements

Additional checks:
- [ ] Load testing results
- [ ] Memory usage analysis
- [ ] Database query performance
- [ ] Bundle size impact

### Architecture Reviews
Required for:
- New service integrations
- Database schema changes
- API design modifications
- Major refactoring

Additional checks:
- [ ] System design documentation
- [ ] Scalability considerations
- [ ] Backward compatibility
- [ ] Migration strategy

## Metrics and Improvement

### Review Metrics
- Average review time
- Number of review cycles
- Defect detection rate
- Code coverage impact

### Continuous Improvement
- Monthly review retrospectives
- Feedback on review process
- Tool and process updates
- Training and knowledge sharing

## Common Pitfalls

### Reviewers
- **Over-engineering**: Suggesting complex solutions for simple problems
- **Bike-shedding**: Focusing on trivial details
- **Inconsistent standards**: Applying different standards to different PRs
- **Delayed reviews**: Not reviewing within expected timeframes

### Authors
- **Defensive responses**: Taking feedback personally
- **Insufficient context**: Not providing enough information in PR description
- **Large PRs**: Creating PRs that are too large to review effectively
- **Ignoring feedback**: Not addressing reviewer comments

## Resources

### Training Materials
- [Code Review Best Practices](https://github.com/features/code-review/)
- [Google's Code Review Guidelines](https://google.github.io/eng-practices/review/)
- [Microsoft's Code Review Guidelines](https://docs.microsoft.com/en-us/azure/devops/repos/git/review-code)

### Tools
- [GitHub CLI](https://cli.github.com/)
- [hub](https://hub.github.com/)
- [CodeStream](https://www.codestream.com/)

### Checklists
- [Security Review Checklist](./SECURITY_REVIEW_CHECKLIST.md)
- [Performance Review Checklist](./PERFORMANCE_REVIEW_CHECKLIST.md)
- [API Review Checklist](./API_REVIEW_CHECKLIST.md)
