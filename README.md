# Jest Coverage Commenter GitHub Action

GitHub Action to create a PR comment detailing how well test files are covering code. You can run whatever test command you want, but make sure it returns the table jest usually does into the console.

**Pro tip:** The argument `--changedSince=origin/master` will allow you to only run coverages on the files changed in the PR (change `origin/master` to whatever base branch you are using). Just ensure you also add `fetch-depth: 0` to your checkout (example below).

## Usage

### Inputs

| key | default | required | description |
|-----|---------|----------|-------------|
| github_token | n/a | true | A GitHub Token, the standard one is great. |
| test_command | `npx jest --coverage` | false | The test command to run, that also runs coverage appropriately |

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
