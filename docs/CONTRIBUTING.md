# Contributing to CodeChat AI

Thank you for your interest in contributing to CodeChat AI! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you are expected to uphold our code of conduct:

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Report any unacceptable behavior

## Getting Started

### Development Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/codechat-ai.git
   cd codechat-ai
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Set up the database:
   ```bash
   npm run db:push
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

### Development Guidelines

#### Code Style

- Use TypeScript for all new code
- Follow the existing code formatting (we use Prettier)
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Keep functions small and focused

#### Frontend Guidelines

- Use React hooks and functional components
- Implement proper error boundaries
- Use TanStack Query for data fetching
- Follow the component structure in `/client/src/components`
- Use Tailwind CSS for styling
- Ensure responsive design for mobile devices

#### Backend Guidelines

- Use Express.js with TypeScript
- Implement proper error handling
- Use Drizzle ORM for database operations
- Follow RESTful API conventions
- Add proper validation using Zod schemas
- Keep route handlers thin, move logic to services

#### Database Guidelines

- Use Drizzle ORM for all database operations
- Define schemas in `shared/schema.ts`
- Never write raw SQL migrations
- Use `npm run db:push` for schema changes
- Ensure proper relationships between tables

## Making Changes

### Branch Naming

Use descriptive branch names:
- `feature/chat-export` - for new features
- `fix/message-rendering` - for bug fixes
- `docs/api-documentation` - for documentation
- `refactor/auth-service` - for refactoring

### Commit Messages

Follow conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `chore`: Build process or auxiliary tool changes

Examples:
```
feat(chat): add message export functionality
fix(auth): resolve session timeout issue
docs(api): update endpoint documentation
```

### Pull Request Process

1. Create a new branch for your changes
2. Make your changes following the guidelines above
3. Test your changes thoroughly
4. Update documentation if needed
5. Run tests and ensure they pass
6. Submit a pull request with:
   - Clear description of changes
   - Screenshots for UI changes
   - Testing steps
   - Any breaking changes

### Pull Request Template

```markdown
## Description
Brief description of what this PR does

## Changes Made
- List of specific changes
- Each change on a new line

## Testing
- [ ] Manual testing performed
- [ ] All existing tests pass
- [ ] New tests added (if applicable)

## Screenshots (if applicable)
Add screenshots for UI changes

## Breaking Changes
List any breaking changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- Write unit tests for utility functions
- Write integration tests for API endpoints
- Write component tests for React components
- Use descriptive test names
- Follow the AAA pattern (Arrange, Act, Assert)

### Test Structure

```javascript
describe('Component/Function Name', () => {
  beforeEach(() => {
    // Setup code
  });

  it('should do something specific', () => {
    // Test implementation
  });

  it('should handle edge cases', () => {
    // Edge case testing
  });
});
```

## Documentation

### Code Documentation

- Add JSDoc comments for public functions
- Document complex logic with inline comments
- Update README.md for significant changes
- Add examples for new features

### API Documentation

- Document all API endpoints
- Include request/response examples
- Document error codes and messages
- Keep API documentation up to date

## Issue Reporting

### Bug Reports

When reporting bugs, include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser/OS information
- Screenshots or error messages

### Feature Requests

When requesting features, include:
- Clear description of the feature
- Use cases and benefits
- Proposed implementation (if any)
- Examples from other applications

## Release Process

### Versioning

We use Semantic Versioning (SemVer):
- `MAJOR.MINOR.PATCH`
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes (backward compatible)

### Release Steps

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create release notes
4. Tag the release
5. Deploy to production

## Getting Help

- Check existing issues and documentation
- Ask questions in GitHub Discussions
- Contact maintainers for urgent issues

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to CodeChat AI!