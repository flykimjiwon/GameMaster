const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

const savedEnv = {};
const envKeys = ['EVOLVER_REPO_ROOT', 'WORKSPACE_DIR', 'OPENCLAW_WORKSPACE', 'MEMORY_DIR', 'EVOLUTION_DIR'];

beforeEach(() => {
  for (const k of envKeys) { savedEnv[k] = process.env[k]; }
  process.env.EVOLVER_REPO_ROOT = path.resolve(__dirname, '..');
});

afterEach(() => {
  for (const k of envKeys) {
    if (savedEnv[k] === undefined) delete process.env[k];
    else process.env[k] = savedEnv[k];
  }
});

function loadPromptModule() {
  return require('../src/gep/prompt');
}

function buildMinimalPrompt(overrides) {
  const { buildGepPrompt } = loadPromptModule();
  return buildGepPrompt({
    nowIso: '2026-01-01T00:00:00.000Z',
    context: '',
    signals: ['test_signal'],
    selector: { selectedBy: 'test' },
    parentEventId: null,
    selectedGene: null,
    capsuleCandidates: '(none)',
    genesPreview: '[]',
    capsulesPreview: '[]',
    capabilityCandidatesPreview: '(none)',
    externalCandidatesPreview: '(none)',
    hubMatchedBlock: '',
    cycleId: '0001',
    recentHistory: '',
    failedCapsules: [],
    hubLessons: [],
    strategyPolicy: null,
    ...overrides,
  });
}

describe('buildGepPrompt -- cross-platform status write', () => {
  it('uses node -e for status file creation (not bash heredoc)', () => {
    const prompt = buildMinimalPrompt();
    assert.ok(prompt.includes('node -e'), 'prompt should contain node -e command');
    assert.ok(!prompt.includes('cat >'), 'prompt should NOT contain bash cat > redirect');
    assert.ok(!prompt.includes('STATUSEOF'), 'prompt should NOT contain heredoc delimiter');
    assert.ok(!prompt.includes('<< '), 'prompt should NOT contain heredoc operator');
  });

  it('labels the status write as cross-platform', () => {
    const prompt = buildMinimalPrompt();
    assert.ok(prompt.includes('cross-platform'), 'prompt should mention cross-platform');
  });

  it('uses mkdirSync with recursive:true for logs directory', () => {
    const prompt = buildMinimalPrompt();
    assert.ok(prompt.includes('mkdirSync'), 'prompt should use mkdirSync');
    assert.ok(prompt.includes('recursive:true') || prompt.includes('recursive: true'),
      'prompt should use recursive mkdir');
  });

  it('uses writeFileSync for status JSON', () => {
    const prompt = buildMinimalPrompt();
    assert.ok(prompt.includes('writeFileSync'), 'prompt should use writeFileSync');
  });

  it('includes cycle ID in status filename', () => {
    const prompt = buildMinimalPrompt({ cycleId: '0042' });
    assert.ok(prompt.includes('status_0042'), 'prompt should include cycle ID in filename');
  });

  it('escapes backslash paths for Windows compatibility', () => {
    process.env.WORKSPACE_DIR = 'D:\\Projects\\evolver';
    const prompt = buildMinimalPrompt();
    assert.ok(!prompt.includes('D:\\Projects\\evolver/logs') || prompt.includes('D:/Projects/evolver/logs'),
      'backslash paths should be normalized to forward slashes in the node -e command');
  });
});

describe('buildGepPrompt -- structure', () => {
  it('contains GEP protocol header', () => {
    const prompt = buildMinimalPrompt();
    assert.ok(prompt.includes('GEP'), 'prompt should contain GEP header');
    assert.ok(prompt.includes('GENOME EVOLUTION PROTOCOL'), 'prompt should contain full protocol name');
  });

  it('contains mandatory object model section', () => {
    const prompt = buildMinimalPrompt();
    assert.ok(prompt.includes('Mutation'), 'prompt should contain Mutation object');
    assert.ok(prompt.includes('PersonalityState'), 'prompt should contain PersonalityState');
    assert.ok(prompt.includes('EvolutionEvent'), 'prompt should contain EvolutionEvent');
    assert.ok(prompt.includes('Gene'), 'prompt should contain Gene');
    assert.ok(prompt.includes('Capsule'), 'prompt should contain Capsule');
  });

  it('contains constitutional ethics section', () => {
    const prompt = buildMinimalPrompt();
    assert.ok(prompt.includes('CONSTITUTIONAL ETHICS'), 'prompt should contain ethics section');
    assert.ok(prompt.includes('HUMAN WELFARE'), 'prompt should contain human welfare principle');
  });

  it('contains cycle ID in report requirement', () => {
    const prompt = buildMinimalPrompt({ cycleId: '0099' });
    assert.ok(prompt.includes('0099'), 'prompt should reference cycle ID');
  });
});

describe('buildReusePrompt', () => {
  it('produces reuse-mode prompt with capsule info', () => {
    const { buildReusePrompt } = loadPromptModule();
    const result = buildReusePrompt({
      capsule: {
        asset_id: 'asset_001',
        source_node_id: 'node_abc',
        payload: { summary: 'Fix auth bug', gene: 'gene_auth', confidence: 0.9, trigger: ['auth_error'] },
      },
      signals: ['auth_error'],
      nowIso: '2026-01-01T00:00:00.000Z',
    });
    assert.ok(result.includes('REUSE MODE'), 'should contain REUSE MODE header');
    assert.ok(result.includes('asset_001'), 'should contain asset ID');
    assert.ok(result.includes('node_abc'), 'should contain source node');
    assert.ok(result.includes('Fix auth bug'), 'should contain summary');
    assert.ok(result.includes('0.9'), 'should contain confidence');
  });

  it('handles missing payload fields gracefully', () => {
    const { buildReusePrompt } = loadPromptModule();
    const result = buildReusePrompt({
      capsule: {},
      signals: [],
      nowIso: '2026-01-01T00:00:00.000Z',
    });
    assert.ok(result.includes('REUSE MODE'), 'should still produce reuse prompt');
    assert.ok(result.includes('(no summary)'), 'should show no summary fallback');
  });
});

describe('buildLessonsBlock', () => {
  it('returns empty string for empty lessons', () => {
    const { buildLessonsBlock } = loadPromptModule();
    assert.equal(buildLessonsBlock([], []), '');
    assert.equal(buildLessonsBlock(null, []), '');
  });

  it('separates positive and negative lessons', () => {
    const { buildLessonsBlock } = loadPromptModule();
    const lessons = [
      { content: 'Retry with backoff works', lesson_type: 'positive', scenario: 'network' },
      { content: 'Never skip validation', lesson_type: 'negative', scenario: 'deploy' },
    ];
    const result = buildLessonsBlock(lessons, ['test']);
    assert.ok(result.includes('Strategies that WORKED'), 'should have positive section');
    assert.ok(result.includes('Pitfalls to AVOID'), 'should have negative section');
    assert.ok(result.includes('Retry with backoff'), 'should contain positive lesson');
    assert.ok(result.includes('Never skip validation'), 'should contain negative lesson');
  });

  it('caps at 6 lessons total', () => {
    const { buildLessonsBlock } = loadPromptModule();
    const lessons = Array.from({ length: 10 }, (_, i) => ({
      content: `Lesson ${i}`, lesson_type: 'positive', scenario: 'test',
    }));
    const result = buildLessonsBlock(lessons, []);
    const matches = result.match(/Lesson \d/g) || [];
    assert.ok(matches.length <= 6, 'should cap at 6 lessons');
  });
});

describe('buildNarrativeBlock', () => {
  it('returns string without throwing', () => {
    const { buildNarrativeBlock } = loadPromptModule();
    const result = buildNarrativeBlock();
    assert.equal(typeof result, 'string');
  });
});

describe('buildPrinciplesBlock', () => {
  it('returns string without throwing', () => {
    const { buildPrinciplesBlock } = loadPromptModule();
    const result = buildPrinciplesBlock();
    assert.equal(typeof result, 'string');
  });
});
