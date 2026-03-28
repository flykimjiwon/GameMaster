const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  classifyFailureMode,
  adaptGeneFromLearning,
  buildSoftFailureLearningSignals,
  buildEpigeneticMark,
  applyEpigeneticMarks,
  getEpigeneticBoost,
  buildSuccessReason,
} = require('../src/gep/solidify');

describe('classifyFailureMode', () => {
  it('treats validation-only failures as soft and retryable', () => {
    const result = classifyFailureMode({
      constraintViolations: [],
      protocolViolations: [],
      validation: { ok: false, results: [{ ok: false, cmd: 'npm test' }] },
      canary: { ok: true, skipped: false },
    });
    assert.equal(result.mode, 'soft');
    assert.equal(result.reasonClass, 'validation');
    assert.equal(result.retryable, true);
  });

  it('treats destructive constraint failures as hard', () => {
    const result = classifyFailureMode({
      constraintViolations: ['CRITICAL_FILE_DELETED: MEMORY.md'],
      protocolViolations: [],
      validation: { ok: true, results: [] },
      canary: { ok: true, skipped: false },
    });
    assert.equal(result.mode, 'hard');
    assert.equal(result.reasonClass, 'constraint_destructive');
    assert.equal(result.retryable, false);
  });

  it('treats protocol violations as hard', () => {
    const result = classifyFailureMode({
      constraintViolations: [],
      protocolViolations: ['missing required field'],
      validation: { ok: true, results: [] },
      canary: { ok: true, skipped: false },
    });
    assert.equal(result.mode, 'hard');
    assert.equal(result.reasonClass, 'protocol');
    assert.equal(result.retryable, false);
  });

  it('treats canary failure as hard', () => {
    const result = classifyFailureMode({
      constraintViolations: [],
      protocolViolations: [],
      validation: { ok: true, results: [] },
      canary: { ok: false, skipped: false },
    });
    assert.equal(result.mode, 'hard');
    assert.equal(result.reasonClass, 'canary');
    assert.equal(result.retryable, false);
  });

  it('treats skipped canary as non-failure', () => {
    const result = classifyFailureMode({
      constraintViolations: [],
      protocolViolations: [],
      validation: { ok: true, results: [] },
      canary: { ok: false, skipped: true },
    });
    assert.notEqual(result.reasonClass, 'canary');
  });

  it('returns unknown soft when no specific failure', () => {
    const result = classifyFailureMode({
      constraintViolations: [],
      protocolViolations: [],
      validation: { ok: true, results: [] },
      canary: { ok: true, skipped: false },
    });
    assert.equal(result.mode, 'soft');
    assert.equal(result.reasonClass, 'unknown');
    assert.equal(result.retryable, true);
  });

  it('handles HARD CAP BREACH as destructive', () => {
    const result = classifyFailureMode({
      constraintViolations: ['HARD CAP BREACH: 50 files modified'],
      protocolViolations: [],
    });
    assert.equal(result.mode, 'hard');
    assert.equal(result.reasonClass, 'constraint_destructive');
  });

  it('handles null/empty opts gracefully', () => {
    const result = classifyFailureMode({});
    assert.equal(result.mode, 'soft');
    assert.equal(result.reasonClass, 'unknown');
  });
});

describe('adaptGeneFromLearning', () => {
  it('adds structured success signals back into gene matching', () => {
    const gene = {
      type: 'Gene',
      id: 'gene_test',
      signals_match: ['error'],
    };
    adaptGeneFromLearning({
      gene,
      outcomeStatus: 'success',
      learningSignals: ['problem:performance', 'action:optimize', 'area:orchestration'],
      failureMode: { mode: 'none', reasonClass: null, retryable: false },
    });
    assert.ok(gene.signals_match.includes('problem:performance'));
    assert.ok(gene.signals_match.includes('area:orchestration'));
    assert.ok(!gene.signals_match.includes('action:optimize'));
    assert.ok(Array.isArray(gene.learning_history));
    assert.equal(gene.learning_history[0].outcome, 'success');
  });

  it('records failed anti-patterns without broadening matching', () => {
    const gene = {
      type: 'Gene',
      id: 'gene_test_fail',
      signals_match: ['protocol'],
    };
    adaptGeneFromLearning({
      gene,
      outcomeStatus: 'failed',
      learningSignals: ['problem:protocol', 'risk:validation'],
      failureMode: { mode: 'soft', reasonClass: 'validation', retryable: true },
    });
    assert.deepEqual(gene.signals_match, ['protocol']);
    assert.ok(Array.isArray(gene.anti_patterns));
    assert.equal(gene.anti_patterns[0].mode, 'soft');
  });
});

describe('buildSoftFailureLearningSignals', () => {
  it('extracts structured tags from validation failures', () => {
    const tags = buildSoftFailureLearningSignals({
      signals: ['perf_bottleneck'],
      failureReason: 'validation_failed: npm test => latency remained high',
      violations: [],
      validationResults: [
        { ok: false, cmd: 'npm test', stderr: 'latency remained high', stdout: '' },
      ],
    });
    assert.ok(tags.includes('problem:performance'));
    assert.ok(tags.includes('risk:validation'));
  });
});

describe('buildEpigeneticMark', () => {
  it('creates mark with clamped boost', () => {
    const mark = buildEpigeneticMark('darwin/arm64/v20', 0.3, 'success');
    assert.equal(mark.context, 'darwin/arm64/v20');
    assert.equal(mark.boost, 0.3);
    assert.equal(mark.reason, 'success');
    assert.ok(mark.created_at);
  });

  it('clamps boost to [-0.5, 0.5]', () => {
    assert.equal(buildEpigeneticMark('ctx', 1.0, 'r').boost, 0.5);
    assert.equal(buildEpigeneticMark('ctx', -1.0, 'r').boost, -0.5);
  });

  it('handles null/undefined inputs', () => {
    const mark = buildEpigeneticMark(null, null, null);
    assert.equal(mark.context, '');
    assert.equal(mark.boost, 0);
    assert.equal(mark.reason, '');
  });
});

describe('applyEpigeneticMarks', () => {
  it('adds positive mark on success', () => {
    const gene = { type: 'Gene', id: 'g1' };
    const env = { platform: 'darwin', arch: 'arm64', node_version: 'v20' };
    applyEpigeneticMarks(gene, env, 'success');
    assert.ok(Array.isArray(gene.epigenetic_marks));
    assert.equal(gene.epigenetic_marks.length, 1);
    assert.ok(gene.epigenetic_marks[0].boost > 0);
  });

  it('adds negative mark on failure', () => {
    const gene = { type: 'Gene', id: 'g1' };
    const env = { platform: 'linux', arch: 'x64', node_version: 'v18' };
    applyEpigeneticMarks(gene, env, 'failed');
    assert.equal(gene.epigenetic_marks[0].boost, -0.1);
  });

  it('reinforces existing mark on repeated success', () => {
    const gene = { type: 'Gene', id: 'g1' };
    const env = { platform: 'darwin', arch: 'arm64', node_version: 'v20' };
    applyEpigeneticMarks(gene, env, 'success');
    applyEpigeneticMarks(gene, env, 'success');
    assert.equal(gene.epigenetic_marks.length, 1);
    assert.ok(gene.epigenetic_marks[0].boost > 0.1);
  });

  it('returns non-Gene objects unchanged', () => {
    const obj = { type: 'Other' };
    const result = applyEpigeneticMarks(obj, {}, 'success');
    assert.equal(result, obj);
    assert.ok(!obj.epigenetic_marks);
  });
});

describe('getEpigeneticBoost', () => {
  it('returns boost for matching environment', () => {
    const gene = {
      type: 'Gene', id: 'g1',
      epigenetic_marks: [{ context: 'darwin/arm64/v20', boost: 0.3 }],
    };
    const env = { platform: 'darwin', arch: 'arm64', node_version: 'v20' };
    assert.equal(getEpigeneticBoost(gene, env), 0.3);
  });

  it('returns 0 for non-matching environment', () => {
    const gene = {
      type: 'Gene', id: 'g1',
      epigenetic_marks: [{ context: 'linux/x64/v18', boost: 0.2 }],
    };
    const env = { platform: 'darwin', arch: 'arm64', node_version: 'v20' };
    assert.equal(getEpigeneticBoost(gene, env), 0);
  });

  it('returns 0 for gene without marks', () => {
    assert.equal(getEpigeneticBoost({ type: 'Gene' }, {}), 0);
    assert.equal(getEpigeneticBoost(null, {}), 0);
  });
});

describe('buildSuccessReason', () => {
  it('builds reason string from gene and signals', () => {
    const result = buildSuccessReason({
      gene: { id: 'gene_fix', category: 'repair', strategy: ['patch error'] },
      signals: ['log_error'],
      blast: { files: 2, lines: 30 },
      score: 0.85,
    });
    assert.ok(result.includes('gene_fix'));
    assert.ok(result.includes('repair'));
    assert.ok(result.includes('log_error'));
    assert.ok(result.includes('0.85'));
    assert.ok(result.includes('2 file'));
  });

  it('returns default message when no data', () => {
    const result = buildSuccessReason({});
    assert.equal(result, 'Evolution succeeded.');
  });
});
