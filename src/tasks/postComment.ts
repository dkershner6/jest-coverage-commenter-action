/* istanbul ignore file */
import { error, setFailed, info } from '@actions/core';
import { getOctokit as getOctokitImport, context } from '@actions/github';
import { Octokit } from '@octokit/core';
import { FormattedCoverage } from './runJest';

export const COMMENT_PREFIX = '## Jest Coverage';

const postComment = async (
    formattedCoverage: FormattedCoverage,
    githubToken: string,
    getOctokitParam?: (token: string) => Octokit
): Promise<void> => {
    try {
        const prNumber = context?.issue?.number;
        const repo = context?.repo?.repo;
        const owner = context?.repo?.owner;

        if (!prNumber || !repo || !owner) {
            return setFailed(
                `Was unable to obtain: ${[prNumber, repo, owner]
                    .filter((item) => item === undefined)
                    .join(', ')} from context.`
            );
        }

        const getOctokit = getOctokitParam ?? getOctokitImport;
        const github = getOctokit(githubToken);

        const prComments = await github.issues.listComments({
            issue_number: prNumber,
            repo,
            owner,
        });

        const existingComment = prComments?.data?.find(
            (comment: { user: { type: string }; body: string }) =>
                comment?.user?.type === 'Bot' &&
                comment?.body?.startsWith(COMMENT_PREFIX)
        );

        const commentBody = `${COMMENT_PREFIX}

${formattedCoverage?.summary ? formattedCoverage.summary : ''}

${
    formattedCoverage?.details
        ? `<details>\n\n

${formattedCoverage.details}

\n\n</details>`
        : ''
}`;

        info(`Comment to post:
${commentBody}`);

        if (existingComment?.id) {
            info(`Previous comment found: ${existingComment.id}`);
            await github.issues.updateComment({
                issue_number: prNumber,
                comment_id: existingComment.id,
                repo,
                owner,
                body: commentBody,
            });
        } else {
            info('Creating new comment');
            await github.issues.createComment({
                issue_number: prNumber,
                repo,
                owner,
                body: commentBody,
            });
        }
    } catch (err) {
        error('There was an error while posting the comment');
        throw err;
    }
};

export default postComment;
