import { info, error, setFailed } from "@actions/core";

import gatherAllInputs from "./tasks/gatherAllInputs";
import postCommentImport from "./tasks/postComment";
import runJest from "./tasks/runJest";

const runTasks = async (
    getInputParam?: (key: string) => string,
    execSyncParam?: (command: string) => Buffer,
    postComment = postCommentImport,
): Promise<void> => {
    try {
        info(`Jest Coverage Commenter v2`);
        const inputs = gatherAllInputs(getInputParam);
        if (!inputs) {
            return;
        }
        const { githubToken, testCommand, reporter, commentPrefix } = inputs;
        info("Inputs have been gathered");

        const formattedCoverage = runJest(testCommand, reporter, execSyncParam);
        info("Jest has been ran and coverage collected");
        if (!formattedCoverage) {
            return;
        }
        await postComment(formattedCoverage, githubToken, commentPrefix);
        info("Comment has been posted to the PR");
    } catch (err) {
        error(err as Error);
        setFailed((err as Error)?.message);
    }
};

export default runTasks;
