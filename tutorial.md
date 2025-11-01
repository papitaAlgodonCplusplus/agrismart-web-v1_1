# Playwright Test Suite Tutorial

This guide will help you run and view results from the AgriSmart Playwright test suite.

## Prerequisites

Before running the tests, ensure you have:
- Node.js installed
- All dependencies installed: `npm install`
- Playwright browsers installed: `npx playwright install`

## Test Suite Overview

The test suite includes 6 test files:
- `01-login.spec.ts` - Login functionality tests
- `02-dashboard.spec.ts` - Dashboard tests
- `03-farms-crud.spec.ts` - Farms CRUD operations
- `04-crops-crud.spec.ts` - Crops CRUD operations
- `05-devices-crud.spec.ts` - Devices CRUD operations
- `06-other-pages.spec.ts` - Other page tests
- `auth.helper.ts` - Authentication helper functions

## Running Tests

### Basic Commands

**Run all tests:**
```bash
npx playwright test
```

**Run tests in UI mode (recommended for development):**
```bash
npx playwright test --ui
```
UI mode provides an interactive interface where you can:
- See all tests at a glance
- Run individual tests
- Step through tests line by line
- Time-travel debug with the trace viewer

**Run a specific test file:**
```bash
npx playwright test e2e/01-login.spec.ts
```

**Run tests in headed mode (see the browser):**
```bash
npx playwright test --headed
```

**Run tests and automatically open the report:**
```bash
npx playwright test && npx playwright show-report
```

### Advanced Options

**Run tests matching a specific pattern:**
```bash
npx playwright test -g "login"
```

**Run tests in debug mode:**
```bash
npx playwright test --debug
```

**Update snapshots (if your tests use visual comparisons):**
```bash
npx playwright test --update-snapshots
```

**Run with specific browser:**
```bash
npx playwright test --project=chromium
```

## Viewing Test Results

### HTML Report

After tests run, view the detailed HTML report:
```bash
npx playwright show-report
```

The HTML report includes:
- ✅ Pass/fail status for each test
- 📸 Screenshots of failures
- 🎥 Videos of failed tests (when configured)
- 🔍 Detailed traces for debugging
- ⏱️ Execution times

The report is saved in the `playwright-report/` directory.

### JSON Report

Test results are also saved as `test-results.json` in the root directory for programmatic access.

### Command Line Output

The test runner provides real-time output showing:
- Which tests are running
- Pass/fail status
- Error messages for failures
- Summary statistics

## Test Configuration

The tests are configured in `playwright.config.ts` with these settings:

- **Base URL:** `http://localhost:4200` (Angular dev server)
- **Auto-start server:** Runs `npm run serve` automatically
- **Workers:** 1 (sequential execution to avoid conflicts)
- **Browser:** Chromium (Desktop Chrome)
- **Screenshots:** Captured on failure
- **Videos:** Recorded on failure
- **Trace:** Enabled on first retry

## Troubleshooting

### Port Already in Use

If port 4200 is already in use, the tests will reuse the existing server thanks to `reuseExistingServer: true`.

### Backend Services Not Running

Ensure your backend services are running:
```bash
./run-all.bat
```

### Tests Timing Out

If tests timeout waiting for the server:
- Check that `npm run serve` starts successfully
- Verify your Angular app loads at `http://localhost:4200`
- The timeout is set to 120 seconds (configurable in playwright.config.ts)

### Browser Not Installed

If you see "Browser not found" errors:
```bash
npx playwright install chromium
```

### SSL Certificate Errors

SSL errors are ignored for localhost (configured in playwright.config.ts with `ignoreHTTPSErrors: true`).

## Best Practices

1. **Run tests before committing:** Ensure all tests pass before pushing changes
2. **Use UI mode during development:** It's easier to debug and iterate
3. **Keep tests isolated:** Each test should clean up after itself
4. **Review failure screenshots:** They often reveal the issue immediately
5. **Use trace viewer:** For complex failures, traces show the exact state of the page

## CI/CD Integration

The test suite is configured for CI environments:
- Retries failed tests 2 times in CI (`retries: process.env.CI ? 2 : 0`)
- Fails if `.only` is used (`forbidOnly: !!process.env.CI`)

To run in CI mode:
```bash
CI=true npx playwright test
```

## Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Test Runner](https://playwright.dev/docs/test-intro)
- [Playwright Trace Viewer](https://playwright.dev/docs/trace-viewer)
- [Debugging Tests](https://playwright.dev/docs/debug)

## Quick Reference

| Command | Description |
|---------|-------------|
| `npx playwright test` | Run all tests |
| `npx playwright test --ui` | Open UI mode |
| `npx playwright test --headed` | See browser while running |
| `npx playwright test --debug` | Debug mode with inspector |
| `npx playwright show-report` | View HTML report |
| `npx playwright test e2e/01-login.spec.ts` | Run specific file |
| `npx playwright test -g "pattern"` | Run tests matching pattern |

---

**Need Help?** Check the Playwright documentation or review the test files in the `e2e/` directory.
