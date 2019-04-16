import * as Octokit from '@octokit/rest'
import { Toolkit } from 'actions-toolkit';

const toolkit = new Toolkit({
  event: ['pull_request', 'release', 'check_run.completed']
});

const okToMergeLabel: string = process.env.OK_TO_MERGE_LABEL!;

const baseBranch: string = process.env.BASE_BRANCH!;


if (!okToMergeLabel) {
  toolkit.exit.failure('Please set environment variable OK_TO_MERGE_LABEL');
}

if (!baseBranch) {
  toolkit.exit.failure('Please set environment variable BASE_BRANCH');
}


const handleReleaseEvents = async (tools: Toolkit) => {
  tools.log.info('Handling GitHub release event');
  tools.log.info(JSON.stringify(tools.context));

  const context = tools.context.repo;

  const octokit = tools.github as Octokit;

  const pulls = await octokit.pulls.list({
    base: baseBranch,
    owner: context.owner,
    per_page: 100,
    repo: context.repo,
    sort: 'updated',
    state: 'open'
  });

  tools.log.info(JSON.stringify(pulls));
}

const handlePullRequestEvents = async (tools: Toolkit) => {
  tools.log.info('Handling GitHub pull request event');
  tools.log.info(JSON.stringify(tools.context));
}

const handleCheckRunEvents = async (tools: Toolkit) => {
  tools.log.info('Handling GitHub check_run event');
  tools.log.info(tools.context);
}


switch (toolkit.context.event) {
  case "release":
    handleReleaseEvents(toolkit);
    break;

  case "labeled":
    handlePullRequestEvents(toolkit);
    break;

  case "check_run":
    handleCheckRunEvents(toolkit);
    break;

  default:
  toolkit.exit.success('Nothing to handle');
    break;
}
