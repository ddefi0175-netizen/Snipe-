# Contributing to Snipe

Thank you for your interest in contributing to Snipe! We welcome contributions from the community.

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, browser)
- Screenshots if applicable

### Suggesting Features

Feature requests are welcome! Please open an issue with:
- Clear description of the feature
- Use case and benefits
- Any implementation ideas you have

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/ddefi0175-netizen/Snipe.git
   cd Snipe
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add tests if applicable
   - Update documentation as needed

4. **Test your changes**
   ```bash
   # Backend tests
   cd backend
   npm test

   # Frontend tests
   cd ../Onchainweb
   npm test
   ```

5. **Commit your changes**
   ```bash
   git commit -m "feat: add your feature description"
   ```

   We follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `refactor:` for code refactoring
   - `test:` for adding tests
   - `chore:` for maintenance tasks

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request**
   - Provide a clear description of the changes
   - Reference any related issues
   - Ensure all tests pass

## Code Style

### JavaScript/React
- Use ES6+ syntax
- Use functional components with hooks
- Follow existing naming conventions
- Add comments for complex logic

### Backend
- Use async/await for asynchronous operations
- Add proper error handling
- Validate all user inputs
- Follow REST API best practices

## Security

**IMPORTANT:** Never commit:
- Passwords or API keys
- `.env` files
- Database credentials
- Private keys or tokens

All sensitive data must use environment variables. See [SECURITY.md](SECURITY.md) for more details.

If you discover a security vulnerability, please email the maintainers privately instead of opening a public issue.

## Development Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
npm install
npm run dev
```

### Frontend Setup
```bash
cd Onchainweb
cp .env.example .env
# Edit .env with your backend URL
npm install
npm run dev
```

## Testing

Before submitting a PR, ensure:
- [ ] Code follows project style
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No console.log statements in production code
- [ ] No security vulnerabilities introduced

## Questions?

Feel free to open an issue for any questions about contributing!

## Code of Conduct

Please note that this project follows a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
