// eslint-disable-next-line import/no-namespace
import * as core from '@actions/core';
import { simpleCoverage, simpleExpectation } from '../__mocks__/coverage';
import runTasks from '../src/runTasks';
import {
    NO_TOKEN_FAIL_MESSAGE,
    DEFAULT_TEST_COMMAND,
} from '../src/tasks/gatherAllInputs';
import { JEST_ERROR_MESSAGE } from '../src/tasks/runJest';

describe('Main Tests', () => {
    const GITHUB_TOKEN = '12345';
    const TEST_COMMAND = 'npm run test --coverage';

    const debugSpy = jest.spyOn(core, 'debug');
    const errorSpy = jest.spyOn(core, 'error');
    const setFailedSpy = jest.spyOn(core, 'setFailed');

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('Should call execSync with correct testCommand, and format response correctly', async () => {
        const execSync = jest.fn().mockReturnValue(simpleCoverage);

        const inputs = {
            github_token: GITHUB_TOKEN,
            test_command: TEST_COMMAND,
        };
        await runTasks(inputs, execSync, false);

        expect(execSync).toHaveBeenCalledWith(TEST_COMMAND);
        expect(debugSpy).toHaveBeenCalledWith(simpleExpectation);
        expect(setFailedSpy).not.toHaveBeenCalled();
    });

    it('Should call with default test command if none given', async () => {
        const execSync = jest.fn().mockReturnValue(simpleCoverage);

        const inputs = {
            github_token: GITHUB_TOKEN,
        };
        await runTasks(inputs, execSync, false);

        expect(execSync).toHaveBeenCalledWith(DEFAULT_TEST_COMMAND);
        expect(debugSpy).toHaveBeenCalledWith(simpleExpectation);
        expect(setFailedSpy).not.toHaveBeenCalled();
    });

    it('Should fail with no github_token', async () => {
        const execSync = jest.fn().mockReturnValue(simpleCoverage);

        const inputs = {
            test_command: TEST_COMMAND,
        };
        await runTasks(inputs, execSync, false);

        expect(setFailedSpy).toHaveBeenCalledWith(NO_TOKEN_FAIL_MESSAGE);
    });

    it('Should gracefully fail with appropriate message if Jest fails', async () => {
        const execSync = jest.fn().mockImplementation(() => {
            throw new Error('Jest Failed');
        });

        const inputs = {
            github_token: GITHUB_TOKEN,
            test_command: TEST_COMMAND,
        };
        await runTasks(inputs, execSync, false);

        expect(errorSpy).toHaveBeenCalledWith(JEST_ERROR_MESSAGE);
        expect(setFailedSpy).toHaveBeenCalledWith('Jest Failed');
    });
});
