# Git Commit Message Conventions

Based on the AngularJS Git Commit Message Conventions used in this project.

## Commit Message Structure

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Header

### Type (Required)
The type must be one of the following:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools and libraries
- **revert**: Reverts a previous commit

### Scope (Optional)
The scope could be anything specifying the place of the commit change:
- Database
- Controller
- Template
- Specific module names

### Subject (Required)
- Brief description, no more than 50 characters
- No period at the end
- Use imperative mood ("add" not "added" or "adds")

## Body (Optional)
- Wrap at 72 characters per line
- Explain what and why vs. how
- Include comparison with previous behavior

## Footer (Optional)
- Reference issue numbers (if any)
- BREAKING CHANGE: describe incompatible changes

## Examples

### Simple Examples

```bash
# Feature addition
feat(auth): add Google OAuth login

# Bug fix
fix(search): resolve pagination error in search results

# Documentation
docs(readme): update API documentation

# Style changes
style(header): adjust navigation padding

# Refactoring
refactor(user): restructure user data processing logic

# Performance improvement
perf(image): optimize image loading speed

# Testing
test(auth): add unit tests for login functionality

# Build/tooling
chore(deps): update dependencies to latest versions

# Revert
revert: feat(auth): add Google OAuth login
```

### Complete Example (with Body and Footer)

```bash
feat(search): add advanced search filters

Add the following filter options:
- Age range filter
- Price range filter
- Location filter

Improves user search experience by providing more precise results.
Users can now narrow down search results more effectively.

Closes #123
BREAKING CHANGE: Search API now requires additional parameters
```

### Project Scopes Examples

- `feat(ui)`: 新增 shadcn/ui 客製元件
- `fix(swr)`: 修正快取 key 或樂觀更新回滾
- `docs(a11y)`: 更新可近用性實務文件
- `refactor(features-projects)`: 重構 projects 領域 hooks/組件分層
- `chore(orval)`: 更新 OpenAPI 並重新產碼
- `test(ideas)`: 新增 ideas 領域 hooks 單元測試

### Writing Tips

- 主旨 50 字以內，祈使句；Body 說明「做了什麼、為何做、前後差異」。
- 有破壞性異動加上 `BREAKING CHANGE:`，並於 PR 說明遷移步驟。

### Multiple Line Example

```bash
fix(user): resolve user profile update issue

- Fix validation error when updating profile
- Ensure proper error handling for invalid data
- Add loading state during profile updates

The previous implementation had inconsistent validation
that caused users to lose their changes unexpectedly.

Fixes #456
```

## Benefits of Following This Convention

1. **Improved Code Review**: Different types help reviewers understand what perspective to take
2. **Automated Tooling**: Can automatically generate CHANGELOGs
3. **Clear History**: Easy to track project evolution
4. **Team Collaboration**: Consistent format helps team members understand changes

## Type Guidelines

| Type | When to Use | Review Focus |
|------|-------------|--------------|
| `feat` | New features or functionality | How the feature works and integrates |
| `fix` | Bug fixes | How the bug is resolved |
| `refactor` | Code restructuring | Code quality and maintainability |
| `style` | Formatting, whitespace | Code formatting consistency |
| `docs` | Documentation changes | Clarity and completeness |
| `test` | Test additions/modifications | Test coverage and quality |
| `chore` | Build, tools, dependencies | Project maintenance |
| `perf` | Performance improvements | Performance impact |

## Common Mistakes to Avoid

❌ **Don't:**
```bash
# Too long subject line
feat(auth): add a new authentication system that supports multiple providers including Google, Facebook, and GitHub

# Missing type
add login functionality

# Unclear subject
fix: stuff

# Wrong tense
feat(auth): added login
```

✅ **Do:**
```bash
# Clear and concise
feat(auth): add multi-provider authentication

# Proper format
fix(search): resolve empty results bug

# Descriptive but brief
refactor(api): simplify user data structure
```

Following these conventions will make your Git history clean, professional, and easy to navigate!
