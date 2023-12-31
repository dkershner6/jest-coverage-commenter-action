// eslint-disable-next-line import/no-namespace
import * as core from "@actions/core";
import runTasks from "./runTasks";
import {
    NO_TOKEN_FAIL_MESSAGE,
    DEFAULT_TEST_COMMAND,
    DEFAULT_COMMENT_PREFIX,
} from "./tasks/gatherAllInputs";
import { JEST_ERROR_MESSAGE } from "./tasks/runJest";

const simpleCoverage = `
Logs and other stuff
::test::::::
!@%@$^%$&#^*&#*&#*
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |     100 |      100 |     100 |     100 |                   
 index.ts |     100 |      100 |     100 |     100 |                   
----------|---------|----------|---------|---------|-------------------`;

const simpleExpectation = `File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------|---------|----------|---------|---------|-------------------
All files |     100 |      100 |     100 |     100 |                   
_index.ts |     100 |      100 |     100 |     100 |                   `;

const textSummary = `
=============================== Coverage summary ===============================
Statements   : 75.2% ( 94/125 )
Branches     : 30% ( 33/110 )
Functions    : 61.54% ( 8/13 )
Lines        : 75.2% ( 94/125 )
================================================================================
Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        3.397 s
`;

const textSummaryExpectation = `=============================== Coverage summary ===============================
Statements   : 75.2% ( 94/125 )
Branches     : 30% ( 33/110 )
Functions    : 61.54% ( 8/13 )
Lines        : 75.2% ( 94/125 )
================================================================================`;

describe("Main Tests", () => {
    const GITHUB_TOKEN = "12345";
    const TEST_COMMAND = "npm run test --coverage";
    const TEST_COMMAND_SUMMARY = "npm run test:coverage-summary";

    const debugSpy = jest.spyOn(core, "debug");
    const errorSpy = jest.spyOn(core, "error");
    const setFailedSpy = jest.spyOn(core, "setFailed");
    const postCommentMock = jest.fn();

    afterEach(() => {
        jest.resetAllMocks();
    });

    it("Should call execSync with correct testCommand, and format response correctly", async () => {
        const execSync = jest.fn().mockReturnValue(simpleCoverage);

        const getInput = jest.fn().mockImplementation((key: string) => {
            switch (key) {
                case "github_token":
                    return GITHUB_TOKEN;
                case "test_command":
                    return TEST_COMMAND;
                default:
                    return "";
            }
        });
        await runTasks(getInput, execSync, postCommentMock);

        expect(execSync).toHaveBeenCalledWith(TEST_COMMAND);
        expect(debugSpy).toHaveBeenCalledWith(simpleExpectation);
        expect(setFailedSpy).not.toHaveBeenCalled();
    });

    it("Should call execSync with correct testCommand, and format response correctly for text-summary", async () => {
        const execSync = jest.fn().mockReturnValue(textSummary);

        const getInput = jest.fn().mockImplementation((key: string) => {
            switch (key) {
                case "github_token":
                    return GITHUB_TOKEN;
                case "test_command":
                    return TEST_COMMAND_SUMMARY;
                case "reporter":
                    return "text-summary";
                default:
                    return "";
            }
        });
        await runTasks(getInput, execSync, postCommentMock);

        expect(execSync).toHaveBeenCalledWith(TEST_COMMAND_SUMMARY);
        expect(debugSpy).toHaveBeenCalledWith(textSummaryExpectation);
        expect(setFailedSpy).not.toHaveBeenCalled();
    });

    it("Should call execSync with default test command if none given", async () => {
        const execSync = jest.fn().mockReturnValue(simpleCoverage);

        const getInput = jest.fn().mockImplementation((key: string) => {
            // eslint-disable-next-line sonarjs/no-small-switch
            switch (key) {
                case "github_token":
                    return GITHUB_TOKEN;
                default:
                    return "";
            }
        });
        await runTasks(getInput, execSync, postCommentMock);

        expect(execSync).toHaveBeenCalledWith(DEFAULT_TEST_COMMAND);
        expect(debugSpy).toHaveBeenCalledWith(simpleExpectation);
        expect(setFailedSpy).not.toHaveBeenCalled();
    });

    it("Should post a comment with returned formattedCoverage", async () => {
        const execSync = jest.fn().mockReturnValue(simpleCoverage);
        const getInput = jest.fn().mockImplementation((key: string) => {
            switch (key) {
                case "github_token":
                    return GITHUB_TOKEN;
                case "test_command":
                    return TEST_COMMAND;
                default:
                    return "";
            }
        });
        await runTasks(getInput, execSync, postCommentMock);

        expect(postCommentMock).toHaveBeenCalledWith(
            expect.objectContaining({ details: simpleExpectation }),
            expect.stringMatching(GITHUB_TOKEN),
            expect.stringMatching(DEFAULT_COMMENT_PREFIX),
        );
        expect(setFailedSpy).not.toHaveBeenCalled();
    });

    it("Should fail with no github_token", async () => {
        const execSync = jest.fn().mockReturnValue(simpleCoverage);

        const getInput = jest.fn().mockImplementation((key: string) => {
            // eslint-disable-next-line sonarjs/no-small-switch
            switch (key) {
                case "test_command":
                    return TEST_COMMAND;
                default:
                    return "";
            }
        });
        await runTasks(getInput, execSync, postCommentMock);

        expect(setFailedSpy).toHaveBeenCalledWith(NO_TOKEN_FAIL_MESSAGE);
    });

    it("Should gracefully fail with appropriate message if Jest fails", async () => {
        const execSync = jest.fn().mockImplementation(() => {
            throw new Error("Jest Failed");
        });

        const getInput = jest.fn().mockImplementation((key: string) => {
            switch (key) {
                case "github_token":
                    return GITHUB_TOKEN;
                case "test_command":
                    return TEST_COMMAND;
                default:
                    return "";
            }
        });
        await runTasks(getInput, execSync, postCommentMock);

        expect(errorSpy).toHaveBeenCalledWith(JEST_ERROR_MESSAGE);
        expect(setFailedSpy).toHaveBeenCalledWith("Jest Failed");
    });
});
