import { Toolkit } from 'actions-toolkit';
// import * as Octokit from '@octokit/rest';

const tools = new Toolkit({
  event: ['pull_request', 'release']
});

const okToMergeLabel: string = process.env.OK_TO_MERGE_LABEL!;

const baseBranch: string = process.env.BASE_BRANCH!;


if (!okToMergeLabel) {
  tools.exit.failure('Please set environment variable OK_TO_MERGE_LABEL');
}

if (!baseBranch) {
  tools.exit.failure('Please set environment variable BASE_BRANCH');
}


const handleReleaseEvents = async (tools: any) => {
  tools.log.info('Handling GitHub release event');
  tools.log.info(JSON.stringify(tools.context));

  const context = tools.context.repo;

  const pulls = await tools.github.pulls.list({
    owner: context.owner,
    repo: context.repo
  });

  tools.log.info(JSON.stringify(pulls));
}

const handlePullRequestEvents = async (tools: any) => {
  tools.log.info('Handling GitHub pull request event');
  tools.log.info(JSON.stringify(tools.context));
}

tools.log.info(JSON.stringify(tools.context));

switch (tools.context.event) {
  case "published":
    handleReleaseEvents(tools);
    break;

  case "labeled":
  case "synchronize":
    handlePullRequestEvents(tools);
    break;

  default:
    tools.exit.success('Nothing to handle');
    break;
}
