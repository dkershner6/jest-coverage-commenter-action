// eslint-disable-next-line import/no-namespace
import * as core from '@actions/core';
import {
    simpleCoverage,
    simpleExpectation,
    textSummary,
    textSummaryExpectation,
} from '../__mocks__/coverage';
import runTasks from '../src/runTasks';
import {
    NO_TOKEN_FAIL_MESSAGE,
    DEFAULT_TEST_COMMAND,
    DEFAULT_COMMENT_AUTHOR,
} from '../src/tasks/gatherAllInputs';
import { JEST_ERROR_MESSAGE } from '../src/tasks/runJest';

describe('Main Tests', () => {
    const GITHUB_TOKEN = '12345';
    const TEST_COMMAND = 'npm run test --coverage';
    const TEST_COMMAND_SUMMARY = 'npm run test:coverage-summary';
    const COMMENT_AUTHOR = 'some-author';

    const debugSpy = jest.spyOn(core, 'debug');
    const errorSpy = jest.spyOn(core, 'error');
    const setFailedSpy = jest.spyOn(core, 'setFailed');

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('Should call execSync with correct testCommand, and format response correctly', async () => {
        const execSync = jest.fn().mockReturnValue(simpleCoverage);

        const getInput = jest.fn().mockImplementation((key: string) => {
            switch (key) {
                case 'github_token':
                    return GITHUB_TOKEN;
                case 'test_command':
                    return TEST_COMMAND;
                default:
                    return '';
            }
        });
        await runTasks(getInput, execSync, jest.fn(), false);

        expect(execSync).toHaveBeenCalledWith(TEST_COMMAND);
        expect(debugSpy).toHaveBeenCalledWith(simpleExpectation);
        expect(setFailedSpy).not.toHaveBeenCalled();
    });

    it('Should call execSync with correct testCommand, and format response correctly for text-summary', async () => {
        const execSync = jest.fn().mockReturnValue(textSummary);

        const getInput = jest.fn().mockImplementation((key: string) => {
            switch (key) {
                case 'github_token':
                    return GITHUB_TOKEN;
                case 'test_command':
                    return TEST_COMMAND_SUMMARY;
                case 'reporter':
                    return 'text-summary';
                default:
                    return '';
            }
        });
        await runTasks(getInput, execSync, jest.fn(), false);

        expect(execSync).toHaveBeenCalledWith(TEST_COMMAND_SUMMARY);
        expect(debugSpy).toHaveBeenCalledWith(textSummaryExpectation);
        expect(setFailedSpy).not.toHaveBeenCalled();
    });

    it('Should call execSync with default test command if none given', async () => {
        const execSync = jest.fn().mockReturnValue(simpleCoverage);

        const getInput = jest.fn().mockImplementation((key: string) => {
            switch (key) {
                case 'github_token':
                    return GITHUB_TOKEN;
                default:
                    return '';
            }
        });
        await runTasks(getInput, execSync, jest.fn(), false);

        expect(execSync).toHaveBeenCalledWith(DEFAULT_TEST_COMMAND);
        expect(debugSpy).toHaveBeenCalledWith(simpleExpectation);
        expect(setFailedSpy).not.toHaveBeenCalled();
    });

    it('Should call postComment with correct commentAuthor if given', async () => {
        const postComment = jest.fn();
        const execSync = jest.fn().mockReturnValue(simpleCoverage);
        const getInput = jest.fn().mockImplementation((key: string) => {
            switch (key) {
                case 'github_token':
                    return GITHUB_TOKEN;
                case 'comment_author':
                    return COMMENT_AUTHOR;
                default:
                    return '';
            }
        });
        await runTasks(getInput, execSync, postComment);

        expect(postComment).toHaveBeenCalledWith(
            expect.objectContaining({ details: simpleExpectation }),
            expect.stringMatching(GITHUB_TOKEN),
            expect.stringMatching(COMMENT_AUTHOR)
        );
        expect(setFailedSpy).not.toHaveBeenCalled();
    });

    it('Should call postComment with default comment author if none given', async () => {
        const execSync = jest.fn().mockReturnValue(simpleCoverage);
        const postComment = jest.fn();
        const getInput = jest.fn().mockImplementation((key: string) => {
            switch (key) {
                case 'github_token':
                    return GITHUB_TOKEN;
                case 'test_command':
                    return TEST_COMMAND;
                default:
                    return '';
            }
        });
        await runTasks(getInput, execSync, postComment);

        expect(postComment).toHaveBeenCalledWith(
            expect.objectContaining({ details: simpleExpectation }),
            expect.stringMatching(GITHUB_TOKEN),
            expect.stringMatching(DEFAULT_COMMENT_AUTHOR)
        );
        expect(setFailedSpy).not.toHaveBeenCalled();
    });

    it('Should fail with no github_token', async () => {
        const execSync = jest.fn().mockReturnValue(simpleCoverage);

        const getInput = jest.fn().mockImplementation((key: string) => {
            switch (key) {
                case 'test_command':
                    return TEST_COMMAND;
                default:
                    return '';
            }
        });
        await runTasks(getInput, execSync, jest.fn(), false);

        expect(setFailedSpy).toHaveBeenCalledWith(NO_TOKEN_FAIL_MESSAGE);
    });

    it('Should gracefully fail with appropriate message if Jest fails', async () => {
        const execSync = jest.fn().mockImplementation(() => {
            throw new Error('Jest Failed');
        });

        const getInput = jest.fn().mockImplementation((key: string) => {
            switch (key) {
                case 'github_token':
                    return GITHUB_TOKEN;
                case 'test_command':
                    return TEST_COMMAND;
                default:
                    return '';
            }
        });
        await runTasks(getInput, execSync, jest.fn(), false);

        expect(errorSpy).toHaveBeenCalledWith(JEST_ERROR_MESSAGE);
        expect(setFailedSpy).toHaveBeenCalledWith('Jest Failed');
    });
});
