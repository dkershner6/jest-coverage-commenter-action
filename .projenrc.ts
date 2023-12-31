import { Node20GitHubActionTypescriptProject } from "dkershner6-projen-github-actions";

import { RunsUsing } from "projen-github-action-typescript";
import { Nvmrc } from "projen-nvm";

const MAJOR_VERSION = 2;

const project = new Node20GitHubActionTypescriptProject({
    majorVersion: MAJOR_VERSION,
    defaultReleaseBranch: "main",

    devDeps: [
        "dkershner6-projen-github-actions",
        "projen-github-action-typescript",
        "projen-nvm",
    ],
    name: "jest-coverage-commenter-action",
    description: "Comment on PRs with Jest Coverage",

    actionMetadata: {
        name: "Jest Coverage Commenter",
        description: "Comment on PRs with Jest Coverage Information",
        inputs: {
            github_token: {
                description: "A GitHub Token, the standard one is great",
                required: true,
            },
            test_command: {
                description:
                    "The test command to run, that also runs coverage appropriately",
                default: "npx jest --coverage",
                required: false,
            },
            reporter: {
                description:
                    "Possible types: text, text-summary. Set your --coverageReporters to match.",
                default: "text",
                required: false,
            },
            comment_prefix: {
                description:
                    "A message desired to be shown before the code coverage report",
                default: "## Jest Coverage",
                required: false,
            },
        },
        runs: {
            using: RunsUsing.NODE_20,
            main: "dist/index.js",
        },
        branding: {
            icon: "percent",
            color: "orange",
        },
    },

    deps: ["@octokit/core", "@octokit/rest"],

    autoApproveOptions: {
        allowedUsernames: ["dkershner6"],
    },

    sampleCode: false,
    docgen: true,
});

new Nvmrc(project);

project.synth();
