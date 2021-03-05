# Jest Coverage Commenter GitHub Action

GitHub Action to create a PR comment detailing how well test files are covering code. You can run whatever test command you want, but make sure it uses the coverage reporter to match your reporter input (see below).

## Usage

### Inputs

| key | default | required | description |
|-----|---------|----------|-------------|
| github_token | n/a | true | A GitHub Token, the standard one is great. |
| test_command | `npx jest --coverage` | false | The test command to run, that also runs coverage appropriately |
| reporter | `text` | false | Possible types: text, text-summary. Set your --coverageReporters to match. |

### Outputs

None

### Example Workflow

```yaml
on: pull_request

jobs:
  test-coverage:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2
        with:
          fetch-depth: 0
      - run: npm i

      - name: Comment with Test Coverage
        uses: dkershner6/jest-coverage-commenter-action@v1
        with:
          github_token: "${{ secrets.GITHUB_TOKEN }}"
          test_command: "npm run test:coverage"
```
