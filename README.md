# Jest Coverage Commenter GitHub Action

GitHub Action to create a PR comment detailing how well test files are covering code. You can run whatever test command you want, but make sure it returns the table jest usually does into the console.

Pro tip: The argument `--changedSince=master` will allow you to only run coverages on the files changed in the PR (change `master` to whatever base branch you are using).

## Usage

### Inputs

| key | default | required | description |
|-----|---------|----------|-------------|
| github_token | n/a | true | A GitHub Token, the standard one is great. |
| test_command | `npx jest --coverage --changedSince=master` | false | The test command to run, that also runs coverage appropriately |

### Outputs

None

### Example Workflow

```yaml
on: pull_request

name: Run an action that commits

jobs:
  test-coverage:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2
      - run: npm i

      - name: Comment with Test Coverage
        uses: dkershner6/jest-coverage-commenter-action@v1
        with:
          github_token: "${{ secrets.GITHUB_TOKEN }}"
          test_command: "npm run test:coverage"
```