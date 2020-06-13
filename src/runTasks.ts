import { info, error, setFailed } from '@actions/core';
import gatherAllInputs from './tasks/gatherAllInputs';
import runJest from './tasks/runJest';
import postComment from './tasks/postComment';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import packageJson from '../package.json';

const runTasks = async (
    getInputParam?: (key: string) => string,
    execSyncParam?: (command: string) => Buffer,
    actuallyPostComment = true
): Promise<void> => {
    try {
        info(`Jest Commenter version ${packageJson.version}`);
        const inputs = gatherAllInputs(getInputParam);
        if (!inputs) {
            return;
        }
        const { githubToken, testCommand } = inputs;
        info('Inputs have been gathered');

        const commentToPost = runJest(testCommand, execSyncParam);
        info('Jest has been ran and coverage collected');
        if (!commentToPost || !actuallyPostComment) {
            return;
        }
        await postComment(commentToPost, githubToken);
        info('Comment has been posted to the PR');
    } catch (err) {
        error(err);
        setFailed(err.message);
    }
};

export default runTasks;
