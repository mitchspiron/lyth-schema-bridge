# Contributing to Schema Bridge

Thank you for your interest in contributing to Schema Bridge!

## How to Contribute

### Reporting Issues

Found a bug or have a feature request? Please open an issue on GitHub with:

- A clear description
- Steps to reproduce (for bugs)
- Expected vs actual behavior

### Submitting Code

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit your changes: `git commit -m "feat: add new feature"`
6. Push to your fork: `git push origin feature/your-feature`
7. Open a Pull Request

## Development Setup

```bash
# Clone the repository
git clone https://github.com/mitchspiron/lyth-schema-bridge.git
cd schema-bridge

# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build
```

## Coding Guidelines

- Write clear, readable code
- Add tests for new features
- Follow existing code style
- Update documentation when needed

### Code Style

- Use TypeScript
- Follow ESLint rules
- Run `npm run lint:fix` before committing
- Run `npm run format` to format code

## Commit Messages

Use clear commit messages:

- `feat: add new feature`
- `fix: resolve bug`
- `docs: update readme`
- `test: add tests`

### Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Update CHANGELOG.md
5. Request review from maintainers

## Adding New Generators

To add a new generator:

1. Create a new file in `src/core/generators/`
2. Implement the generator class
3. Export it from `src/index.ts`
4. Add tests in `tests/`
5. Update documentation

Example:

```typescript
// src/core/generators/MyGenerator.ts
export class MyGenerator {
  static generate(config: ProjectConfig): string {
    // Implementation
  }
}

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for public APIs
- Update examples if needed

## Questions?

Feel free to open an issue for any questions or reach out to the maintainers.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
```

Thank you for contributing to Schema Bridge!
