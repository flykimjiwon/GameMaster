const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { extractCapabilityCandidates, expandSignals, renderCandidatesPreview } = require('../src/gep/candidates');

describe('expandSignals', () => {
  it('derives structured learning tags from weak signals', () => {
    const tags = expandSignals(['perf_bottleneck', 'stable_success_plateau'], '');
    assert.ok(tags.includes('problem:performance'));
    assert.ok(tags.includes('problem:stagnation'));
    assert.ok(tags.includes('action:optimize'));
  });
});

describe('extractCapabilityCandidates', () => {
  it('creates a failure-driven candidate from repeated failed capsules', () => {
    const result = extractCapabilityCandidates({
      recentSessionTranscript: '',
      signals: ['perf_bottleneck'],
      recentFailedCapsules: [
        { trigger: ['perf_bottleneck'], failure_reason: 'validation failed because latency stayed high', outcome: { status: 'failed' } },
        { trigger: ['perf_bottleneck'], failure_reason: 'constraint violation after slow path regression', outcome: { status: 'failed' } },
      ],
    });
    const failureCandidate = result.find(function (c) { return c.source === 'failed_capsules'; });
    assert.ok(failureCandidate);
    assert.ok(failureCandidate.tags.includes('problem:performance'));
  });

  it('returns empty array when no failed capsules', () => {
    const result = extractCapabilityCandidates({
      recentSessionTranscript: '',
      signals: ['log_error'],
      recentFailedCapsules: [],
    });
    assert.ok(Array.isArray(result));
  });

  it('deduplicates candidates by id', () => {
    const failedCapsules = [
      { trigger: ['perf_bottleneck'], failure_reason: 'reason A', outcome: { status: 'failed' } },
      { trigger: ['perf_bottleneck'], failure_reason: 'reason B', outcome: { status: 'failed' } },
      { trigger: ['perf_bottleneck'], failure_reason: 'reason C', outcome: { status: 'failed' } },
    ];
    const result = extractCapabilityCandidates({
      recentSessionTranscript: '',
      signals: ['perf_bottleneck'],
      recentFailedCapsules: failedCapsules,
    });
    const ids = result.map(c => c.id);
    assert.equal(ids.length, new Set(ids).size, 'should have no duplicate IDs');
  });
});

describe('expandSignals edge cases', () => {
  it('handles empty signals array', () => {
    const tags = expandSignals([], '');
    assert.ok(Array.isArray(tags));
  });

  it('handles null/undefined gracefully', () => {
    const tags = expandSignals(null, '');
    assert.ok(Array.isArray(tags));
  });

  it('expands error signals to problem:reliability', () => {
    const tags = expandSignals(['log_error'], '');
    assert.ok(tags.includes('problem:reliability'));
  });
});

describe('renderCandidatesPreview', () => {
  it('renders candidates to string', () => {
    const candidates = [{
      id: 'cand_test',
      title: 'Test candidate',
      shape: { input: 'signals', output: 'fix', invariants: 'none', params: 'n/a', failure_points: 'none' },
    }];
    const result = renderCandidatesPreview(candidates);
    assert.ok(result.includes('cand_test'));
    assert.ok(result.includes('Test candidate'));
    assert.ok(result.includes('signals'));
  });

  it('returns empty for empty array', () => {
    const result = renderCandidatesPreview([]);
    assert.equal(result, '');
  });

  it('truncates to maxChars', () => {
    const candidates = Array.from({ length: 50 }, (_, i) => ({
      id: `cand_${i}`,
      title: 'A'.repeat(100),
      shape: {},
    }));
    const result = renderCandidatesPreview(candidates, 200);
    assert.ok(result.length <= 200);
  });
});
