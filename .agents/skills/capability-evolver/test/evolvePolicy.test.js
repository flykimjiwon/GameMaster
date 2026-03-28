const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { computeAdaptiveStrategyPolicy } = require('../src/evolve');

describe('computeAdaptiveStrategyPolicy', () => {
  it('forces innovation after repeated repair/failure streaks', () => {
    const policy = computeAdaptiveStrategyPolicy({
      signals: ['stable_success_plateau'],
      selectedGene: { type: 'Gene', id: 'gene_x', constraints: { max_files: 20 } },
      recentEvents: [
        { intent: 'repair', outcome: { status: 'failed' } },
        { intent: 'repair', outcome: { status: 'failed' } },
        { intent: 'repair', outcome: { status: 'failed' } },
      ],
    });
    assert.equal(policy.forceInnovate, true);
    assert.ok(policy.blastRadiusMaxFiles <= 10);
  });

  it('shrinks blast radius for high-risk genes with overlapping anti-patterns', () => {
    const policy = computeAdaptiveStrategyPolicy({
      signals: ['perf_bottleneck'],
      selectedGene: {
        type: 'Gene',
        id: 'gene_perf',
        constraints: { max_files: 18 },
        anti_patterns: [{ mode: 'hard', learning_signals: ['problem:performance'] }],
        learning_history: [],
      },
      recentEvents: [],
    });
    assert.equal(policy.highRiskGene, true);
    assert.ok(policy.blastRadiusMaxFiles <= 6);
    assert.equal(policy.cautiousExecution, true);
  });

  it('defaults to safe values with empty opts', () => {
    const policy = computeAdaptiveStrategyPolicy({});
    assert.equal(policy.forceInnovate, false);
    assert.equal(policy.highRiskGene, false);
    assert.equal(policy.cautiousExecution, false);
    assert.equal(policy.repairStreak, 0);
    assert.equal(policy.failureStreak, 0);
    assert.ok(policy.blastRadiusMaxFiles > 0);
    assert.ok(Array.isArray(policy.directives));
  });

  it('does not force innovate when log_error present even with stagnation', () => {
    const policy = computeAdaptiveStrategyPolicy({
      signals: ['stable_success_plateau', 'log_error'],
      recentEvents: [],
    });
    assert.equal(policy.forceInnovate, false);
  });

  it('detects failure streak from recent events tail', () => {
    const policy = computeAdaptiveStrategyPolicy({
      signals: [],
      recentEvents: [
        { intent: 'optimize', outcome: { status: 'success' } },
        { intent: 'optimize', outcome: { status: 'failed' } },
        { intent: 'repair', outcome: { status: 'failed' } },
      ],
    });
    assert.equal(policy.failureStreak, 2);
    assert.equal(policy.cautiousExecution, true);
  });

  it('caps blast radius to 10 when forceInnovate with large gene max_files', () => {
    const policy = computeAdaptiveStrategyPolicy({
      signals: ['empty_cycle_loop_detected'],
      selectedGene: { type: 'Gene', id: 'gene_big', constraints: { max_files: 50 } },
      recentEvents: [],
    });
    assert.equal(policy.forceInnovate, true);
    assert.ok(policy.blastRadiusMaxFiles <= 10);
  });

  it('uses default blast radius 12 when gene has no constraints', () => {
    const policy = computeAdaptiveStrategyPolicy({
      signals: [],
      selectedGene: { type: 'Gene', id: 'gene_nocap' },
      recentEvents: [],
    });
    assert.equal(policy.blastRadiusMaxFiles, 12);
  });
});
