import test from 'ava';
import branches from '../../lib/definitions/branches';
import errors from '../../lib/definitions/errors';

test('The "lts" branches have a name or range formatted like "N.x.x"or "N.N.x"', t => {
  t.true(branches.lts.filter({name: '1.x.x'}));
  t.true(branches.lts.filter({name: '1.0.x'}));
  t.true(branches.lts.filter({name: '1.x'}));
  t.true(branches.lts.filter({name: 'some-name', range: '1.x.x'}));
  t.true(branches.lts.filter({name: 'some-name', range: '1.1.x'}));

  t.false(branches.lts.filter({name: 'some-name'}));
  t.false(branches.lts.filter({name: '1.0.0'}));
  t.false(branches.lts.filter({name: 'x.x.x'}));
  t.false(branches.lts.filter({name: 'some-name', range: '1.0.0'}));
  t.false(branches.lts.filter({name: 'some-name', range: 'wrong-range'}));
  t.false(branches.lts.filter({name: '1.x.x', prerelease: true}));
  t.false(branches.lts.filter({name: 'some-name', range: '1.x.x', prerelease: true}));
  t.false(branches.lts.filter({name: '1.x.x', prerelease: 'beta'}));
  t.false(branches.lts.filter({name: 'some-name', range: '1.x.x', prerelease: 'beta'}));
});

test('The "lts" branches have a valid range matching no more than a major line of versions', t => {
  t.true(branches.lts.config.validator({range: '1.x.x'}));
  t.true(branches.lts.config.validator({range: '1.0.x'}));
  t.true(branches.lts.config.validator({range: '1.x'}));

  t.false(branches.lts.config.validator({range: 'wrong-range'}));
  t.false(branches.lts.config.validator({range: '1.0.0'}));
  t.false(branches.lts.config.validator({range: 'x'}));
  t.false(branches.lts.config.validator({range: 'x.x'}));
  t.false(branches.lts.config.validator({range: 'x.x.x'}));
});

test('The "lts" branches must have unique ranges', t => {
  t.true(branches.lts.configs.validator([{range: '1.x.x'}, {range: '1.0.x'}]));

  t.false(branches.lts.configs.validator([{range: '1.x.x'}, {range: '1.x.x'}]));
  t.false(branches.lts.configs.validator([{range: '1.x.x'}, {range: '1.x'}]));
});

test('The "lts" config validators return an existing error code', t => {
  t.true(Object.keys(errors).includes(branches.lts.config.error));
  t.true(Object.keys(errors).includes(branches.lts.configs.error));
});

test('The "release" branches have no "range" or "prerelease" and are not named with a range', t => {
  t.true(branches.release.filter({name: 'some-name'}));

  t.false(branches.release.filter({name: '1.x.x'}));
  t.false(branches.release.filter({name: '1.0.x'}));
  t.false(branches.release.filter({name: 'some-name', range: '1.x.x'}));
  t.false(branches.release.filter({name: 'some-name', range: '1.1.x'}));
  t.false(branches.release.filter({name: 'some-name', prerelease: true}));
  t.false(branches.release.filter({name: 'some-name', prerelease: 'beta'}));
});

test('There must be between 1 and 3 release branches', t => {
  t.true(branches.release.configs.validator([{name: 'branch1'}]));
  t.true(branches.release.configs.validator([{name: 'branch1'}, {name: 'branch2'}]));
  t.true(branches.release.configs.validator([{name: 'branch1'}, {name: 'branch2'}, {name: 'branch3'}]));

  t.false(branches.release.configs.validator([]));
  t.false(
    branches.release.configs.validator([{name: 'branch1'}, {name: 'branch2'}, {name: 'branch3'}, {name: 'branch4'}])
  );
});

test('The "release" config validators return an existing error code', t => {
  t.true(Object.keys(errors).includes(branches.release.configs.error));
});

test('The "prerelease" branches have a "prerelease", not "range" and are not named with a range', t => {
  t.true(branches.prerelease.filter({name: 'some-name', prerelease: true}));
  t.true(branches.prerelease.filter({name: 'some-name', prerelease: 'beta'}));

  t.false(branches.prerelease.filter({name: 'some-name'}));
  t.false(branches.prerelease.filter({name: '1.x.x'}));
  t.false(branches.prerelease.filter({name: '1.0.x'}));
  t.false(branches.prerelease.filter({name: 'some-name', range: '1.x.x'}));
  t.false(branches.prerelease.filter({name: '1.x.x', prerelease: true}));
  t.false(branches.prerelease.filter({name: '1.0.x', prerelease: 'beta'}));
});

test('The "prerelease" branches must a valid preid in "prerelease" property', t => {
  t.true(branches.prerelease.config.validator({prerelease: 'beta'}));

  t.false(branches.prerelease.config.validator({prerelease: 1}));
  t.false(branches.prerelease.config.validator({prerelease: ''}));
  t.false(branches.prerelease.config.validator({prerelease: null}));
  t.false(branches.prerelease.config.validator({}));
});

test('The "prerelease" branches must have unique "prerelease" property', t => {
  t.true(branches.prerelease.configs.validator([{prerelease: 'beta'}, {prerelease: 'alpha'}]));

  t.false(branches.prerelease.configs.validator([{range: 'beta'}, {range: 'beta'}, {range: 'alpha'}]));
});

test('The "prerelease" config validators return an existing error code', t => {
  t.true(Object.keys(errors).includes(branches.prerelease.config.error));
  t.true(Object.keys(errors).includes(branches.prerelease.configs.error));
});
