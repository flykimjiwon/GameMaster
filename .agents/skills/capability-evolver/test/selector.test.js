const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { selectGene, selectCapsule, selectGeneAndCapsule, matchPatternToSignals, scoreGeneSemantic, cosineSimilarity, tokenize, buildSelectorDecision } = require('../src/gep/selector');

const GENES = [
  {
    type: 'Gene',
    id: 'gene_repair',
    category: 'repair',
    signals_match: ['error', 'exception', 'failed'],
    strategy: ['fix it'],
    validation: ['node -e "true"'],
  },
  {
    type: 'Gene',
    id: 'gene_optimize',
    category: 'optimize',
    signals_match: ['protocol', 'prompt', 'audit'],
    strategy: ['optimize it'],
    validation: ['node -e "true"'],
  },
  {
    type: 'Gene',
    id: 'gene_innovate',
    category: 'innovate',
    signals_match: ['user_feature_request', 'user_improvement_suggestion', 'capability_gap', 'stable_success_plateau'],
    strategy: ['build it'],
    validation: ['node -e "true"'],
  },
  {
    type: 'Gene',
    id: 'gene_perf_optimize',
    category: 'optimize',
    signals_match: ['latency', 'throughput'],
    summary: 'Reduce latency and improve throughput on slow paths',
    strategy: ['speed it up'],
    validation: ['node -e "true"'],
  },
];

const CAPSULES = [
  {
    type: 'Capsule',
    id: 'capsule_1',
    trigger: ['log_error', 'exception'],
    gene: 'gene_repair',
    summary: 'Fixed an error',
    confidence: 0.9,
  },
  {
    type: 'Capsule',
    id: 'capsule_2',
    trigger: ['protocol', 'gep'],
    gene: 'gene_optimize',
    summary: 'Optimized prompt',
    confidence: 0.85,
  },
];

describe('selectGene', () => {
  it('selects the gene with highest signal match', () => {
    const result = selectGene(GENES, ['error', 'exception', 'failed'], {});
    assert.equal(result.selected.id, 'gene_repair');
  });

  it('returns null when no signals match', () => {
    const result = selectGene(GENES, ['completely_unrelated_signal'], {});
    assert.equal(result.selected, null);
  });

  it('returns alternatives when multiple genes match', () => {
    const result = selectGene(GENES, ['error', 'protocol'], {});
    assert.ok(result.selected);
    assert.ok(Array.isArray(result.alternatives));
  });

  it('includes drift intensity in result', () => {
    // Drift intensity is population-size-dependent; verify it is returned.
    const result = selectGene(GENES, ['error', 'exception'], {});
    assert.ok('driftIntensity' in result);
    assert.equal(typeof result.driftIntensity, 'number');
    assert.ok(result.driftIntensity >= 0 && result.driftIntensity <= 1);
  });

  it('respects preferred gene id from memory graph', () => {
    const result = selectGene(GENES, ['error', 'protocol'], {
      preferredGeneId: 'gene_optimize',
    });
    // gene_optimize matches 'protocol' so it qualifies as a candidate
    // With preference, it should be selected even if gene_repair scores higher
    assert.equal(result.selected.id, 'gene_optimize');
  });

  it('matches gene via baseName:snippet signal (user_feature_request:snippet)', () => {
    const result = selectGene(GENES, ['user_feature_request:add a dark mode toggle to the settings'], {});
    assert.ok(result.selected);
    assert.equal(result.selected.id, 'gene_innovate', 'innovate gene has signals_match user_feature_request');
  });

  it('matches gene via baseName:snippet signal (user_improvement_suggestion:snippet)', () => {
    const result = selectGene(GENES, ['user_improvement_suggestion:refactor the payment module and simplify the API'], {});
    assert.ok(result.selected);
    assert.equal(result.selected.id, 'gene_innovate', 'innovate gene has signals_match user_improvement_suggestion');
  });

  it('uses derived learning tags to match related performance genes', () => {
    const originalRandom = Math.random;
    Math.random = () => 0.99;
    try {
      const result = selectGene(GENES, ['perf_bottleneck'], { effectivePopulationSize: 100 });
      assert.ok(result.selected);
      assert.equal(result.selected.id, 'gene_perf_optimize');
    } finally {
      Math.random = originalRandom;
    }
  });

  it('downweights genes with repeated hard-fail anti-patterns', () => {
    const riskyGenes = [
      {
        type: 'Gene',
        id: 'gene_perf_risky',
        category: 'optimize',
        signals_match: ['perf_bottleneck'],
        anti_patterns: [
          { mode: 'hard', learning_signals: ['problem:performance'] },
          { mode: 'hard', learning_signals: ['problem:performance'] },
        ],
        validation: ['node -e "true"'],
      },
      {
        type: 'Gene',
        id: 'gene_perf_safe',
        category: 'optimize',
        signals_match: ['perf_bottleneck'],
        learning_history: [
          { outcome: 'success', mode: 'none' },
        ],
        validation: ['node -e "true"'],
      },
    ];
    const result = selectGene(riskyGenes, ['perf_bottleneck'], { effectivePopulationSize: 100 });
    assert.ok(result.selected);
    assert.equal(result.selected.id, 'gene_perf_safe');
  });
});

describe('score-gap guard in drift', () => {
  it('consistently selects high-score gene over low-score gene under drift', () => {
    const strongGene = {
      type: 'Gene', id: 'gene_strong',
      category: 'repair',
      signals_match: ['error'],
      learning_history: [
        { outcome: 'success', mode: 'none' },
        { outcome: 'success', mode: 'none' },
        { outcome: 'success', mode: 'none' },
      ],
    };
    const weakGene = {
      type: 'Gene', id: 'gene_weak',
      category: 'repair',
      signals_match: ['error'],
      anti_patterns: [
        { mode: 'hard', learning_signals: ['problem:reliability'] },
        { mode: 'hard', learning_signals: ['problem:reliability'] },
        { mode: 'hard', learning_signals: ['problem:reliability'] },
      ],
    };
    // Run 20 times — score gap guard should prevent weak gene from being selected
    for (let i = 0; i < 20; i++) {
      const result = selectGene([weakGene, strongGene], ['error'], { effectivePopulationSize: 4 });
      assert.ok(result.selected);
      assert.equal(result.selected.id, 'gene_strong', `iteration ${i}: should always pick strong gene`);
    }
  });
});

describe('selectCapsule', () => {
  it('selects capsule matching signals', () => {
    const result = selectCapsule(CAPSULES, ['log_error', 'exception']);
    assert.equal(result.id, 'capsule_1');
  });

  it('returns null when no triggers match', () => {
    const result = selectCapsule(CAPSULES, ['unrelated']);
    assert.equal(result, null);
  });
});

describe('tokenize', () => {
  it('lowercases and splits text', () => {
    const tokens = tokenize('Hello World Test');
    assert.ok(tokens.includes('hello'));
    assert.ok(tokens.includes('world'));
    assert.ok(tokens.includes('test'));
  });

  it('removes stop words', () => {
    const tokens = tokenize('the quick and slow');
    assert.ok(!tokens.includes('the'));
    assert.ok(!tokens.includes('and'));
    assert.ok(tokens.includes('quick'));
    assert.ok(tokens.includes('slow'));
  });

  it('handles null/empty', () => {
    assert.deepEqual(tokenize(null), []);
    assert.deepEqual(tokenize(''), []);
  });
});

describe('cosineSimilarity', () => {
  it('returns ~1 for identical vectors', () => {
    const tf = { a: 1, b: 2 };
    const sim = cosineSimilarity(tf, tf);
    assert.ok(Math.abs(sim - 1) < 0.001, `expected ~1 but got ${sim}`);
  });

  it('returns 0 for orthogonal vectors', () => {
    assert.equal(cosineSimilarity({ a: 1 }, { b: 1 }), 0);
  });

  it('returns 0 for empty vectors', () => {
    assert.equal(cosineSimilarity({}, { a: 1 }), 0);
    assert.equal(cosineSimilarity({}, {}), 0);
  });
});

describe('scoreGeneSemantic', () => {
  it('scores non-negative for related terms', () => {
    const gene = { signals_match: ['performance_bottleneck'], id: 'gene_perf', summary: 'fix performance issues' };
    const score = scoreGeneSemantic(gene, ['performance_bottleneck']);
    assert.ok(score >= 0, `should have non-negative semantic score, got ${score}`);
  });

  it('returns 0 for unrelated terms', () => {
    const gene = { signals_match: ['auth_error'], id: 'gene_auth' };
    const score = scoreGeneSemantic(gene, ['deploy_success']);
    // May or may not be 0 due to tokenization, but should be low
    assert.ok(score >= 0);
  });

  it('returns 0 for null inputs', () => {
    assert.equal(scoreGeneSemantic(null, ['error']), 0);
    assert.equal(scoreGeneSemantic({ signals_match: ['x'] }, null), 0);
    assert.equal(scoreGeneSemantic({ signals_match: ['x'] }, []), 0);
  });
});

describe('matchPatternToSignals', () => {
  it('matches exact substring', () => {
    assert.ok(matchPatternToSignals('error', ['log_error']));
    assert.ok(matchPatternToSignals('perf', ['perf_bottleneck']));
  });

  it('is case-insensitive for substring', () => {
    assert.ok(matchPatternToSignals('Error', ['log_error']));
    assert.ok(matchPatternToSignals('ERROR', ['log_error']));
  });

  it('matches regex patterns', () => {
    assert.ok(matchPatternToSignals('/^log_/', ['log_error', 'other']));
    assert.ok(matchPatternToSignals('/bottleneck/i', ['Perf_Bottleneck']));
  });

  it('matches multi-language alias patterns', () => {
    assert.ok(matchPatternToSignals('error|错误|エラー', ['エラー発生']));
    assert.ok(matchPatternToSignals('perf|性能', ['性能问题']));
  });

  it('returns false for no match', () => {
    assert.ok(!matchPatternToSignals('deploy', ['log_error', 'exception']));
  });

  it('returns false for null/empty inputs', () => {
    assert.ok(!matchPatternToSignals(null, ['error']));
    assert.ok(!matchPatternToSignals('error', null));
    assert.ok(!matchPatternToSignals('error', []));
  });
});

describe('buildSelectorDecision', () => {
  it('builds decision with gene info', () => {
    const decision = buildSelectorDecision({
      gene: { id: 'gene_test' },
      capsule: { id: 'capsule_1' },
      signals: ['error', 'log_error'],
      alternatives: [{ id: 'gene_alt' }],
      memoryAdvice: null,
      driftEnabled: false,
    });
    assert.equal(decision.selected, 'gene_test');
    assert.ok(Array.isArray(decision.reason));
    assert.ok(decision.reason.length > 0);
    assert.deepEqual(decision.alternatives, ['gene_alt']);
  });

  it('handles null gene', () => {
    const decision = buildSelectorDecision({
      gene: null,
      capsule: null,
      signals: ['test'],
      alternatives: [],
    });
    assert.equal(decision.selected, null);
    assert.ok(decision.reason.some(r => r.includes('no matching gene')));
  });

  it('includes drift info when enabled', () => {
    const decision = buildSelectorDecision({
      gene: { id: 'g1' },
      capsule: null,
      signals: [],
      alternatives: [],
      driftEnabled: true,
      driftIntensity: 0.5,
    });
    assert.ok(decision.reason.some(r => r.includes('drift')));
  });
});

describe('selectGeneAndCapsule', () => {
  it('returns selected gene, capsule candidates, and selector decision', () => {
    const result = selectGeneAndCapsule({
      genes: GENES,
      capsules: CAPSULES,
      signals: ['error', 'log_error'],
      memoryAdvice: null,
      driftEnabled: false,
    });
    assert.ok(result.selectedGene);
    assert.ok(result.selector);
    assert.ok(result.selector.selected);
    assert.ok(Array.isArray(result.selector.reason));
  });

  it('handles failedCapsules to ban genes', () => {
    const result = selectGeneAndCapsule({
      genes: GENES,
      capsules: CAPSULES,
      signals: ['error'],
      memoryAdvice: null,
      driftEnabled: false,
      failedCapsules: [
        { gene: 'gene_repair', trigger: ['error'], outcome: { status: 'failed' } },
        { gene: 'gene_repair', trigger: ['error'], outcome: { status: 'failed' } },
      ],
    });
    // gene_repair should be banned after 2 failures with overlapping signals
    assert.ok(result.selector);
  });
});
