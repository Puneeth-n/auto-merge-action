import { Toolkit } from 'actions-toolkit';
// import * as Octokit from '@octokit/rest';

const toolkit = new Toolkit({
  event: ['pull_request', 'release']
});

const okToMergeLabel: string = process.env.OK_TO_MERGE_LABEL!;

const baseBranch: string = process.env.BASE_BRANCH!;


if (!okToMergeLabel) {
  toolkit.exit.failure('Please set environment variable OK_TO_MERGE_LABEL');
}

if (!baseBranch) {
  toolkit.exit.failure('Please set environment variable BASE_BRANCH');
}


const handleReleaseEvents = async (tools: any) => {
  tools.log.info('Handling GitHub release event');
  tools.log.info(JSON.stringify(tools.context));

  const context = tools.context.repo;

  const pulls = await tools.github.pulls.list({base: baseBranch,

                                              owner: context.owner,
                                              per_page: 100,
                                              repo: context.repo,
    sort: 'updated',
    state: 'open'
  });

  tools.log.info(JSON.stringify(pulls));
}

const handlePullRequestEvents = async (tools: any) => {
  tools.log.info('Handling GitHub pull request event');
  tools.log.info(JSON.stringify(tools.context));
}

toolkit.log.info(JSON.stringify(toolkit.context));

switch (toolkit.context.payload.action) {
  case "published":
    handleReleaseEvents(toolkit);
    break;

  case "labeled":
  case "synchronize":
    handlePullRequestEvents(toolkit);
    break;

  default:
  toolkit.exit.success('Nothing to handle');
    break;
}
