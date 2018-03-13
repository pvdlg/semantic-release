const {template, escapeRegExp} = require('lodash');
const semver = require('semver');
const pFilter = require('p-filter');
const pReduce = require('p-reduce');
const debug = require('debug')('semantic-release:get-tags');
const {gitTags, isRefInHistory} = require('../lib/git');

module.exports = async (branches, options) => {
  // Generate a regex to parse tags formatted with `tagFormat`
  // by replacing the `version` variable in the template by `(.+)`.
  // The `tagFormat` is compiled with space as the `version` as it's an invalid tag character,
  // so it's guaranteed to no be present in the `tagFormat`.
  const tagRegexp = escapeRegExp(template(options.tagFormat)({version: ' '})).replace(' ', '(.+)');
  const tags = (await gitTags())
    .map(tag => ({gitTag: tag, version: (tag.match(tagRegexp) || new Array(2))[1]}))
    .filter(version => version && semver.valid(semver.clean(version)));

  debug('found tags: %o', tags);

  return pReduce(
    branches,
    async (branches, branch) => {
      branch.tags = await pFilter(tags, ({gitTag}) => isRefInHistory(gitTag, branch.name), {concurrency: 1});
      debug('found tags for branch %s: %o', tags, branch.name);
      return [...branches, branch];
    },
    []
  );
};
