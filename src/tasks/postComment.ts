/* istanbul ignore file */
import { error, setFailed, info } from "@actions/core";
import { getOctokit as getOctokitImport, context } from "@actions/github";
import { GitHub } from "@actions/github/lib/utils";

import { FormattedCoverage } from "./runJest";

export type PostComment = (
    formattedCoverage: FormattedCoverage,
    githubToken: string,
    commentPrefix: string,
    getOctokitParam?: (token: string) => InstanceType<typeof GitHub>,
) => Promise<void>;

const postComment: PostComment = async (
    formattedCoverage,
    githubToken,
    commentPrefix,
    getOctokitParam,
) => {
    try {
        const prNumber = context?.issue?.number;
        const repo = context?.repo?.repo;
        const owner = context?.repo?.owner;

        if (!prNumber || !repo || !owner) {
            return setFailed(
                `Was unable to obtain: ${[prNumber, repo, owner]
                    .filter((item) => item === undefined)
                    .join(", ")} from context.`,
            );
        }

        const getOctokit = getOctokitParam ?? getOctokitImport;
        const github = getOctokit(githubToken);

        const prComments = await github.rest.issues.listComments({
            issue_number: prNumber,
            repo,
            owner,
        });

        const existingComment = prComments?.data?.find(
            (comment) => comment?.body?.startsWith(commentPrefix),
        );

        const commentBody = `${commentPrefix}

${formattedCoverage?.summary ? formattedCoverage.summary : ""}

${
    formattedCoverage?.details
        ? `<details>\n\n

${formattedCoverage.details}

\n\n</details>`
        : ""
}`;

        info(`Comment to post:
${commentBody}`);

        if (existingComment?.id) {
            info(`Previous comment found: ${existingComment.id}`);
            await github.rest.issues.updateComment({
                issue_number: prNumber,
                comment_id: existingComment.id,
                repo,
                owner,
                body: commentBody,
            });
        } else {
            info("Creating new comment");
            await github.rest.issues.createComment({
                issue_number: prNumber,
                repo,
                owner,
                body: commentBody,
            });
        }
    } catch (err) {
        error("There was an error while posting the comment");
        throw err;
    }
};

export default postComment;
