# 🤝 Contributing to WebSocket Chat

Thank you for your interest in contributing to WebSocket Chat! This document provides guidelines and instructions for contributing.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Project Architecture](#project-architecture)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

---

## Code of Conduct

This project and everyone participating in it is governed by basic principles of respect and inclusivity. By participating, you are expected to uphold this code. Please be respectful, inclusive, and constructive in all interactions.

---

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating a bug report, please check existing issues to avoid duplicates. When creating a bug report, please include:

- **Clear title**: A concise description of the bug
- **Steps to reproduce**: Detailed steps to reproduce the behavior
- **Expected behavior**: What you expected to happen
- **Actual behavior**: What actually happened
- **Screenshots**: If applicable, add screenshots
- **Environment**: 
  - OS (Windows, macOS, Linux)
  - Browser (Chrome, Firefox, Safari, etc.)
  - Node.js/Bun version

**Bug Report Template:**

```markdown
## Bug Description
[Clear description of the bug]

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happened]

## Environment
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Node/Bun version: [e.g., Bun 1.3]

## Screenshots
[If applicable]
```

### 💡 Suggesting Features

Feature suggestions are welcome! Please include:

- **Clear title**: A concise description of the feature
- **Problem statement**: What problem does this solve?
- **Proposed solution**: How would you like it to work?
- **Alternatives considered**: Any alternative solutions you've thought about
- **Additional context**: Screenshots, mockups, or examples

**Feature Request Template:**

```markdown
## Feature Description
[Clear description of the feature]

## Problem Statement
[What problem does this solve?]

## Proposed Solution
[How should it work?]

## Additional Context
[Any other details or mockups]
```

### 🔧 Submitting Pull Requests

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

See detailed instructions below.

---

## Development Setup

### Prerequisites

- **Bun** (recommended) or Node.js 18+
- **Git**
- A code editor (VS Code recommended)

### Initial Setup

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/websocket-chat.git
cd websocket-chat

# 3. Add upstream remote
git remote add upstream https://github.com/TheStrongestOfTomorrow/websocket-chat.git

# 4. Install dependencies
bun install

# 5. Install WebSocket server dependencies
cd mini-services/chat-server && bun install && cd ../..

# 6. Start development servers (see README.md)
```

### Running Tests

```bash
# Run linting
bun run lint

# Type checking
bun run build
```

---

## Project Architecture

### Frontend (Next.js)

```
src/app/
├── page.tsx        # Main chat component
│   ├── Landing     # Username input + Host/Join UI
│   └── Chat        # Message list + Input + User sidebar
├── layout.tsx      # Root layout with providers
└── globals.css     # Global Tailwind styles
```

**Key Technologies:**
- React 19 with hooks (useState, useEffect, useCallback, useRef)
- Socket.io-client for WebSocket communication
- shadcn/ui components
- Tailwind CSS for styling

### Backend (Socket.io Server)

```
mini-services/chat-server/
└── index.ts        # WebSocket server
    ├── Room Management (create, join, leave)
    ├── Message Handling (public, private)
    ├── User Management (tracking, typing indicators)
    └── Host Transfer Logic
```

**Key Concepts:**
- Rooms identified by unique 6-character codes
- Users tracked with socket IDs and usernames
- Private messages use direct socket targeting
- Host transfer on disconnect

---

## Coding Standards

### TypeScript

- Use strict TypeScript configuration
- Define interfaces for all data structures
- Avoid `any` type - use proper typing

```typescript
// ✅ Good
interface User {
  id: string
  username: string
}

const users: User[] = []

// ❌ Bad
const users: any[] = []
```

### React Components

- Use functional components with hooks
- Use `useCallback` for functions passed as props
- Use `useRef` for mutable values that don't trigger re-renders

```typescript
// ✅ Good - Stable callback reference
const sendMessage = useCallback(() => {
  if (!inputMessage.trim() || !socketRef.current) return
  socketRef.current.emit('send-message', { content: inputMessage.trim() })
  setInputMessage('')
}, [inputMessage])

// ❌ Bad - New function on every render
const sendMessage = () => {
  socket.emit('send-message', { content: inputMessage })
}
```

### Socket.io

- Use `socketRef` pattern to avoid stale closures
- Clean up event listeners in useEffect return

```typescript
// ✅ Good
useEffect(() => {
  const socketInstance = io('/?XTransformPort=3003', options)
  socketRef.current = socketInstance
  
  socketInstance.on('message', handleMessage)
  
  return () => {
    socketInstance.off('message', handleMessage)
    socketInstance.disconnect()
  }
}, [])
```

### Styling

- Use Tailwind utility classes
- Follow the existing color scheme (slate, emerald, purple for private messages)
- Ensure responsive design

```typescript
// ✅ Good - Consistent styling pattern
<div className="bg-slate-800/90 border-slate-700 backdrop-blur-sm">
  <p className="text-emerald-400 font-semibold">Message</p>
</div>
```

### File Naming

- React components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- CSS modules: `component.module.css` (if needed)

---

## Commit Guidelines

We follow conventional commits for clear commit history:

### Commit Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, etc.) |
| `refactor` | Code refactoring |
| `test` | Adding/updating tests |
| `chore` | Maintenance tasks |

### Commit Format

```
<type>(<scope>): <description>

[optional body]
[optional footer]
```

### Examples

```bash
# Feature
feat(chat): add message reactions

# Bug fix
fix(socket): resolve connection timeout issue

# Documentation
docs(readme): update installation instructions

# Style
style(chat): improve message bubble styling
```

---

## Pull Request Process

### Before Submitting

1. **Update your branch** with upstream main:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   git checkout your-feature-branch
   git merge main
   ```

2. **Run linting**:
   ```bash
   bun run lint
   ```

3. **Test locally**:
   - Start both servers
   - Test all affected features
   - Test with multiple users if applicable

4. **Update documentation** if needed

### PR Template

```markdown
## Description
[Clear description of changes]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
[How was this tested?]

## Screenshots
[If applicable]

## Checklist
- [ ] Code follows project style guidelines
- [ ] Linting passes
- [ ] Documentation updated
- [ ] No new warnings introduced
```

### Review Process

1. At least one review required
2. All CI checks must pass
3. No merge conflicts
4. Squash and merge to main

---

## Getting Help

- Open a [Discussion](https://github.com/TheStrongestOfTomorrow/websocket-chat/discussions) for questions
- Join our community chat (coming soon)
- Check existing issues before creating new ones

---

## Recognition

Contributors will be recognized in:
- The project README
- Release notes for significant contributions

Thank you for contributing! 🎉
