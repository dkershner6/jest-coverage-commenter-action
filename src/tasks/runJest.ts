import { error, warning, debug } from '@actions/core';
import { execSync as execSyncImport } from 'child_process';

export interface FormattedCoverage {
    summary?: string;
    details?: string;
}

const A_BUNCH_OF_DASHES = '----------';
const A_BUNCH_OF_EQUALS = '==========';
export const JEST_ERROR_MESSAGE = 'There was an error while running Jest.';

const runJest = (
    testCommand: string,
    reporter: string,
    execSyncParam?: (command: string) => Buffer
): FormattedCoverage => {
    try {
        const execSync = execSyncParam ?? execSyncImport;

        const codeCoverage = execSync(testCommand).toString();
        try {
            if (reporter === 'text-summary') {
                return processTextSummaryReporter(codeCoverage);
            }
            return processTextReporter(codeCoverage);
        } catch (innerError) {
            warning(
                "Something went wrong with formatting the message, returning the entire text instead. Perhaps you didn't run Jest with --coverage?"
            );
            return {
                details: `\`\`\`
${codeCoverage}
\`\`\``,
            };
        }
    } catch (err) {
        error(JEST_ERROR_MESSAGE);
        throw err;
    }
};

const processTextSummaryReporter = (
    codeCoverage: string
): FormattedCoverage => {
    const result = [];
    const codeCoverageLines = codeCoverage.split('\n');
    let foundBeginning = false;

    for (const codeCoverageLine of codeCoverageLines) {
        if (foundBeginning) {
            result.push(codeCoverageLine);
        }
        if (codeCoverageLine.startsWith(A_BUNCH_OF_EQUALS)) {
            if (foundBeginning) break;
            foundBeginning = true;
            result.push(codeCoverageLine);
        }
    }
    const joinedResult = result.join('\n');
    debug(joinedResult);
    return {
        summary: `\`\`\`
${joinedResult}
\`\`\``,
    };
};

const processTextReporter = (codeCoverage: string): FormattedCoverage => {
    const codeCoverageLines = codeCoverage.split('\n');

    const formattedCoverage = formatTextReporterResponse(codeCoverageLines);
    debug(formattedCoverage.details);
    return formattedCoverage;
};

const formatTextReporterResponse = (
    codeCoverageLines: string[]
): FormattedCoverage => {
    const summaryResult = [];
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
        if (linesSinceTableStarted <= 3) {
            summaryResult.push(line.replace(/^ /gm, '_'));
        }
        result.push(line.replace(/^ /gm, '_'));
    }

    return { summary: summaryResult.join('\n'), details: result.join('\n') };
};

export default runJest;
