# Jest Coverage Commenter GitHub Action

GitHub Action to create a PR comment detailing how well test files are covering code. You can run whatever test command you want, but make sure it uses the coverage reporter to match your reporter input (see below).

## Usage

### Inputs

| key | default | required | description |
|-----|---------|----------|-------------|
| github_token | n/a | true | A GitHub Token, the standard one is great. |
| test_command | `npx jest --coverage` | false | The test command to run, that also runs coverage appropriately |
| reporter | `text` | false | Possible types: `text`, `text-summary`. Set your `--coverageReporters` to match. `text-summary` should be used on large projects. |

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

## Reporter

For the standard `text` reporter, the most common jest coverageReporter, the comment on the PR looks like this, with expandable details:

![image](https://user-images.githubusercontent.com/25798427/110061018-ab82d800-7d1b-11eb-9ecc-05ac4ef22e6d.png)

For the `text-summary` reporter, you should run a jest command that includes `--coverageReporters=text-summary`. When this occurs and the reporter input is also set to `text-summary`, the PR comments looks like this:

![image](https://user-images.githubusercontent.com/25798427/110061175-f8ff4500-7d1b-11eb-8241-1c1bddc72c20.png)

