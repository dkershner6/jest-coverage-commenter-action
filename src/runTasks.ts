import { info, error, setFailed } from '@actions/core';
import gatherAllInputs from './tasks/gatherAllInputs';
import runJest from './tasks/runJest';
import postComment from './tasks/postComment';

import packageJson from '../package.json';

const runTasks = async (
    getInputParam?: (key: string) => string,
    execSyncParam?: (command: string) => Buffer,
    actuallyPostComment = true
): Promise<void> => {
    try {
        info(`Jest Coverage Commenter v${packageJson.version}`);
        const inputs = gatherAllInputs(getInputParam);
        if (!inputs) {
            return;
        }
        const { githubToken, testCommand } = inputs;
        info('Inputs have been gathered');

        const formattedCoverage = runJest(testCommand, execSyncParam);
        info('Jest has been ran and coverage collected');
        if (!formattedCoverage || !actuallyPostComment) {
            return;
        }
        await postComment(formattedCoverage, githubToken);
        info('Comment has been posted to the PR');
    } catch (err) {
        error(err);
        setFailed(err.message);
    }
};

export default runTasks;
