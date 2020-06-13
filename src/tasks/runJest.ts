import { error, warning, debug } from '@actions/core';
import { execSync as execSyncImport } from 'child_process';

const A_BUNCH_OF_DASHES = '----------';
export const JEST_ERROR_MESSAGE = 'There was an error while running Jest.';

const runJest = (
    testCommand: string,
    execSyncParam?: (command: string) => Buffer
): string => {
    try {
        const execSync = execSyncParam ?? execSyncImport;

        const codeCoverage = execSync(testCommand).toString();
        try {
            const codeCoverageLines = codeCoverage.split('\n');

            const formattedCoverage = formatResponse(codeCoverageLines);
            debug(formattedCoverage);
            return formattedCoverage;
        } catch (innerError) {
            warning(
                "Something went wrong with formatting the message, returning the entire text instead. Perhaps you didn't run Jest with --coverage?"
            );
            return `\`\`\`
${codeCoverage}
\`\`\``;
        }
    } catch (err) {
        error(JEST_ERROR_MESSAGE);
        throw err;
    }
};

const formatResponse = (codeCoverageLines: string[]) => {
    const result = [];
    let tableStarted = false;
    let linesSinceTableStarted = 0;

    for (const line of codeCoverageLines) {
        if (!tableStarted) {
            if (line.startsWith(A_BUNCH_OF_DASHES)) {
                tableStarted = true;
                continue;
            }
            continue;
        }
        linesSinceTableStarted++;
        if (linesSinceTableStarted > 2 && line.startsWith(A_BUNCH_OF_DASHES)) {
            continue;
        }
        result.push(line.replace(/^ /gm, '_'));
    }

    return result.join('\n');
};

export default runJest;
