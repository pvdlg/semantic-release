const {differenceBy} = require('lodash');
const AggregateError = require('aggregate-error');
const DEFINITIONS = require('../definitions/branches');
const getError = require('../get-error');
const verify = require('./verify');
const normalize = require('./normalize');

module.exports = async branches => {
  await verify(branches);

  const errors = [];
  const branchesByType = Object.keys(DEFINITIONS).reduce(
    (branchesByType, type) => ({[type]: branches.filter(DEFINITIONS[type].filter), ...branchesByType}),
    {}
  );

  const result = Object.keys(DEFINITIONS).reduce((result, type) => {
    const branchesOfType = normalize[type](branchesByType);

    if (!DEFINITIONS[type].config.validator(branchesOfType)) {
      errors.push(getError(DEFINITIONS[type].config.error, {branches: branchesOfType}));
    }

    return [...result, ...branchesOfType];
  }, []);

  const unknowns = differenceBy(branches, result, 'name');
  if (unknowns.length > 0) {
    errors.push(getError('EUNKNOWNBRANCH', {unknowns}));
  }

  if (errors.length > 0) {
    throw new AggregateError(errors);
  }

  return result;
};
