import * as Octokit from '@octokit/rest'
import { Toolkit } from 'actions-toolkit';
import { get, intersection } from 'lodash';

const toolkit = new Toolkit({
  event: ['pull_request', 'release', 'check_run.completed']
});

const okToMergeLabel: string = process.env.OK_TO_MERGE_LABEL!;
const baseBranch: string = process.env.BASE_BRANCH!;
const octokit = toolkit.github as Octokit;
const blacklistLabels: string[] = get(process.env, 'BLACKLIST_LABELS', '').split(',')
const waitMs: number = 5000;
const maxRetries: number = 5;


toolkit.log.info(`Using blacklist labels ${blacklistLabels}`);

if (!okToMergeLabel) {
  toolkit.exit.failure('Please set environment variable OK_TO_MERGE_LABEL');
}

if (!baseBranch) {
  toolkit.exit.failure('Please set environment variable BASE_BRANCH');
}


const wait = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}


const fetchAllPullRequests = async (): Promise<Octokit.Response<Octokit.PullsListResponseItem[]>> => {
  toolkit.log.info('Fetchling all pull requests');

  const repo = toolkit.context.repo;

  return octokit.pulls.list({
    base: baseBranch,
    owner:repo.owner,
    per_page: 100,
    repo: repo.repo,
    sort: 'updated',
    state: 'open'
  })
}

const filterPullRequestsByLabel = (allPullRequests: Octokit.Response<Octokit.PullsListResponseItem[]>): Octokit.PullsListResponseItem[] => allPullRequests.data.filter((pullRequest) => {
  const assignedLabels: string[] = [];
  const whitelistLabel: string[] = [okToMergeLabel];
  pullRequest.labels.forEach((assignedLabel) => {
    assignedLabels.push(assignedLabel.name);
  });
  if (intersection(assignedLabels, whitelistLabel).length === 1 &&
    intersection(assignedLabels, blacklistLabels).length === 0) {
    return true;
  }
  return false;
})

const getPullRequest = async (pullRequestNumber: number, tries:number = 0): Promise<Octokit.Response<Octokit.PullsGetResponse>> => {

  if (tries > maxRetries) {
    throw new Error(`Error fetching pull request number: ${pullRequestNumber}`);
  }

  const repo = toolkit.context.repo;

  const pullRequestResponse =  await octokit.pulls.get({
    owner:repo.owner,
    pull_number: pullRequestNumber,
    repo: repo.repo
  });

  const mergable = pullRequestResponse.data.mergeable;

  if (mergable === null) {
    await wait(waitMs);
    tries++;
    return getPullRequest(pullRequestNumber, tries);
  }

  return pullRequestResponse
}


const handleReleaseEvents = async (): Promise<void> => {
  toolkit.log.info('Handling GitHub release event');
  toolkit.log.info(toolkit.context);

  try {
    const allPullRequests = await fetchAllPullRequests();
    const eligiblePullRequests = filterPullRequestsByLabel(allPullRequests);

    if (eligiblePullRequests.length === 0) {
      toolkit.exit.neutral('No pull requests ot process');
    }

    const promises: Array<Promise<Octokit.Response<Octokit.PullsGetResponse>>> = [];

    eligiblePullRequests.forEach((pullRequest) => {
      promises.push(getPullRequest(pullRequest.number));
    })

    try {
      const pullRequests = await Promise.all(promises);
      toolkit.log.info(pullRequests)
      toolkit.exit.success('success');
    } catch(error) {
      toolkit.exit.failure(`Error processing pullRequests ${error}`);
    }

  }
  catch(error) {
    toolkit.exit.failure('Error processing GitHub release event!!!');
  }
}

const handlePullRequestEvents = async (): Promise<void> => {
  toolkit.log.info('Handling GitHub pull request event');
  toolkit.log.info(toolkit.context);
}

const handleCheckRunEvents = async (): Promise<void> => {
  toolkit.log.info('Handling GitHub check_run event');
  toolkit.log.info(toolkit.context);
}


switch (toolkit.context.event) {
  case "release":
    handleReleaseEvents();
    break;

  case "labeled":
    handlePullRequestEvents();
    break;

  case "check_run":
    handleCheckRunEvents();
    break;

  default:
  toolkit.exit.success('Nothing to handle');
    break;
}
