import {
    getInput as getInputImport,
    debug,
    setFailed,
    error,
} from '@actions/core';

export interface IInputs {
    githubToken: string;
    testCommand: string;
}

export const NO_TOKEN_FAIL_MESSAGE =
    'No github token provided (input: github_token)';
export const DEFAULT_TEST_COMMAND = 'npx jest --coverage --changedSince=master';

const gatherAllInputs = (
    getInputParam: (key: string) => string
): IInputs | void => {
    try {
        const getInput = getInputParam ?? getInputImport;

        const githubToken = determineValue([getInput('github_token')]);
        debug(`Input - github_token: ${githubToken}`);
        if (!githubToken) {
            return setFailed(NO_TOKEN_FAIL_MESSAGE);
        }

        const testCommand = determineValue(
            [getInput('test_command')],
            DEFAULT_TEST_COMMAND
        );
        debug(`Input - test_command: ${testCommand}`);

        return {
            githubToken,
            testCommand,
        };
    } catch (err) {
        error('There was an error while gathering inputs');
        throw err;
    }
};

const determineValue = (
    valuesInOrderOfImportance: (string | undefined)[],
    defaultValue?: string
) => {
    for (const value of valuesInOrderOfImportance) {
        if (!isFalsyOrBlank(value)) {
            return value;
        }
    }
    if (defaultValue) {
        return defaultValue;
    }
    return null;
};

/**
 * GitHub Actions getInput returns blank strings, not null.
 * @param value
 */
const isFalsyOrBlank = (value: string | undefined) => {
    if (!value || value === '') {
        return true;
    }
    return false;
};

export default gatherAllInputs;
