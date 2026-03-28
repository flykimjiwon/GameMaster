const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  parseNumstatRows,
  isForbiddenPath,
  classifyBlastSeverity,
  isValidationCommandAllowed,
  BLAST_RADIUS_HARD_CAP_FILES,
  BLAST_RADIUS_HARD_CAP_LINES,
} = require('../src/gep/policyCheck');

describe('parseNumstatRows', () => {
  it('parses standard numstat output', () => {
    const rows = parseNumstatRows('10\t5\tsrc/main.js\n3\t1\tREADME.md');
    assert.equal(rows.length, 2);
    assert.equal(rows[0].file, 'src/main.js');
    assert.equal(rows[0].added, 10);
    assert.equal(rows[0].deleted, 5);
    assert.equal(rows[1].file, 'README.md');
  });

  it('handles rename arrows', () => {
    const rows = parseNumstatRows('5\t2\tsrc/{old.js => new.js}');
    assert.equal(rows.length, 1);
    assert.ok(rows[0].file.includes('new.js'));
  });

  it('returns empty for empty input', () => {
    assert.deepEqual(parseNumstatRows(''), []);
    assert.deepEqual(parseNumstatRows(null), []);
  });

  it('skips malformed lines', () => {
    const rows = parseNumstatRows('not a valid line\n10\t5\tfile.js');
    assert.equal(rows.length, 1);
    assert.equal(rows[0].file, 'file.js');
  });
});

describe('isForbiddenPath', () => {
  it('matches exact path', () => {
    assert.ok(isForbiddenPath('package.json', ['package.json', 'yarn.lock']));
  });

  it('matches prefix (directory)', () => {
    assert.ok(isForbiddenPath('node_modules/foo/bar.js', ['node_modules']));
  });

  it('returns false for non-matching path', () => {
    assert.ok(!isForbiddenPath('src/main.js', ['node_modules', 'dist']));
  });

  it('handles empty forbidden list', () => {
    assert.ok(!isForbiddenPath('anything.js', []));
    assert.ok(!isForbiddenPath('anything.js', null));
  });

  it('normalizes backslashes', () => {
    assert.ok(isForbiddenPath('src\\secret\\key.js', ['src/secret']));
  });

  it('handles null/empty path', () => {
    assert.ok(!isForbiddenPath('', ['src']));
    assert.ok(!isForbiddenPath(null, ['src']));
  });
});

describe('classifyBlastSeverity', () => {
  it('returns hard_cap_breach when files exceed hard cap', () => {
    const result = classifyBlastSeverity({ blast: { files: BLAST_RADIUS_HARD_CAP_FILES + 1, lines: 0 }, maxFiles: 100 });
    assert.equal(result.severity, 'hard_cap_breach');
  });

  it('returns hard_cap_breach when lines exceed hard cap', () => {
    const result = classifyBlastSeverity({ blast: { files: 0, lines: BLAST_RADIUS_HARD_CAP_LINES + 1 }, maxFiles: 100 });
    assert.equal(result.severity, 'hard_cap_breach');
  });

  it('returns within_limit when no maxFiles constraint', () => {
    const result = classifyBlastSeverity({ blast: { files: 5, lines: 100 }, maxFiles: null });
    assert.equal(result.severity, 'within_limit');
  });

  it('returns exceeded when files over maxFiles', () => {
    const result = classifyBlastSeverity({ blast: { files: 15, lines: 100 }, maxFiles: 10 });
    assert.equal(result.severity, 'exceeded');
  });

  it('returns critical_overrun when files far exceed maxFiles', () => {
    const result = classifyBlastSeverity({ blast: { files: 25, lines: 100 }, maxFiles: 10 });
    assert.equal(result.severity, 'critical_overrun');
  });

  it('returns within_limit when under maxFiles', () => {
    const result = classifyBlastSeverity({ blast: { files: 3, lines: 50 }, maxFiles: 10 });
    assert.equal(result.severity, 'within_limit');
  });
});

describe('isValidationCommandAllowed', () => {
  it('allows node commands', () => {
    assert.ok(isValidationCommandAllowed('node test.js'));
    assert.ok(isValidationCommandAllowed('node --test test/*.test.js'));
  });

  it('allows npm/npx commands', () => {
    assert.ok(isValidationCommandAllowed('npm test'));
    assert.ok(isValidationCommandAllowed('npx tsc --noEmit'));
  });

  it('blocks non-allowed prefixes', () => {
    assert.ok(!isValidationCommandAllowed('rm -rf /'));
    assert.ok(!isValidationCommandAllowed('curl evil.com'));
    assert.ok(!isValidationCommandAllowed('python script.py'));
  });

  it('blocks shell operators', () => {
    assert.ok(!isValidationCommandAllowed('npm test && rm -rf /'));
    assert.ok(!isValidationCommandAllowed('node test.js | grep pass'));
    assert.ok(!isValidationCommandAllowed('npm test; echo done'));
  });

  it('blocks command substitution', () => {
    assert.ok(!isValidationCommandAllowed('node $(whoami)'));
    assert.ok(!isValidationCommandAllowed('node `id`'));
  });

  it('blocks node -e/--eval for safety', () => {
    assert.ok(!isValidationCommandAllowed('node -e "process.exit(1)"'));
    assert.ok(!isValidationCommandAllowed('node --eval "require(\'fs\')"'));
  });

  it('returns false for empty/null input', () => {
    assert.ok(!isValidationCommandAllowed(''));
    assert.ok(!isValidationCommandAllowed(null));
  });
});
