import Phaser from 'phaser';
import { gameState } from '../systems/GameState';
import { AutoExplore } from '../systems/AutoExplore';
import { calcOfflineRewards, formatOfflineTime } from '../systems/IdleCalc';
import { formatDecimal, decimalFromNumber } from '../systems/BigNumber';
import { DungeonFloor } from '../objects/DungeonFloor';

const W = 800;
const H = 600;
const BOTTOM_BAR_H = 50;
const TAB_H = 36;
const CONTENT_Y = 36;
const CONTENT_H = H - BOTTOM_BAR_H - TAB_H;

type TabKey = 'dungeon' | 'monsters' | 'relics' | 'stats';

export class DungeonScene extends Phaser.Scene {
  private explorer!: AutoExplore;
  private activeTab: TabKey = 'dungeon';

  // UI containers
  private tabButtons: Map<TabKey, { bg: Phaser.GameObjects.Graphics; text: Phaser.GameObjects.Text }> = new Map();
  private contentContainer!: Phaser.GameObjects.Container;

  // Bottom bar
  private goldText!: Phaser.GameObjects.Text;
  private gemsText!: Phaser.GameObjects.Text;
  private floorText!: Phaser.GameObjects.Text;
  private gpsText!: Phaser.GameObjects.Text;
  private saveText!: Phaser.GameObjects.Text;

  // Dungeon tab
  private dungeonMapGraphics!: Phaser.GameObjects.Graphics;
  private progressBarFill!: Phaser.GameObjects.Graphics;
  private progressText!: Phaser.GameObjects.Text;
  private roomInfoText!: Phaser.GameObjects.Text;
  private battleBarFill!: Phaser.GameObjects.Graphics;
  private battleText!: Phaser.GameObjects.Text;
  private logTexts: Phaser.GameObjects.Text[] = [];
  private floorInfoText!: Phaser.GameObjects.Text;
  private dungeonContainer!: Phaser.GameObjects.Container;

  // Monsters tab
  private monsterContainer!: Phaser.GameObjects.Container;

  // Relics tab
  private relicsContainer!: Phaser.GameObjects.Container;

  // Stats tab
  private statsContainer!: Phaser.GameObjects.Container;

  // Offline popup
  private offlinePopup?: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'DungeonScene' });
  }

  async create(data: { newGame: boolean }): Promise<void> {
    if (!data.newGame) {
      const loaded = await gameState.load();
      if (!loaded) {
        // Fresh start if load fails
        gameState.gold = decimalFromNumber(50);
        gameState.currentFloor = 1;
      }
    }

    this.explorer = new AutoExplore(gameState);

    // Wire up explorer callbacks
    this.explorer.onGoldChanged = () => this._refreshBottomBar();
    this.explorer.onFloorChanged = () => {
      this._refreshBottomBar();
      if (this.activeTab === 'dungeon') this._refreshDungeonTab();
    };
    this.explorer.onLogUpdated = () => {
      if (this.activeTab === 'dungeon') this._refreshLogDisplay();
    };
    this.explorer.onBattleUpdate = () => {
      if (this.activeTab === 'dungeon') this._refreshBattleBar();
    };
    this.explorer.onRoomChanged = () => {
      if (this.activeTab === 'dungeon') this._refreshProgressBar();
    };
    gameState.onSave = () => {
      this._showSaveIndicator();
    };

    this._buildBackground();
    this._buildTabs();
    this._buildBottomBar();
    this._buildAllContainers();

    this._switchTab('dungeon');

    gameState.startAutosave();
    this.explorer.start();

    // Offline rewards
    if (!data.newGame && gameState.lastSaveTime) {
      const result = calcOfflineRewards(
        gameState.lastSaveTime,
        gameState.goldPerSecond,
        gameState.getRelicMultiplier('gold')
      );
      if (result.offlineSeconds > 5) {
        gameState.addGold(result.offlineGold);
        this._showOfflinePopup(result);
      }
    }

    this.cameras.main.fadeIn(400);

    // Update bottom bar every second
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this._refreshBottomBar();
        if (this.activeTab === 'dungeon') this._refreshDungeonMap();
      },
    });
  }

  private _buildBackground(): void {
    const bg = this.add.graphics();
    bg.fillStyle(0x1a0a2e, 1);
    bg.fillRect(0, 0, W, H);

    // Subtle grid pattern
    bg.lineStyle(1, 0x2a1a4e, 0.3);
    for (let x = 0; x <= W; x += 40) bg.lineBetween(x, 0, x, H);
    for (let y = 0; y <= H; y += 40) bg.lineBetween(0, y, W, y);
  }

  private _buildTabs(): void {
    const tabs: { key: TabKey; label: string }[] = [
      { key: 'dungeon', label: '⚔️ Dungeon' },
      { key: 'monsters', label: '👾 Monsters' },
      { key: 'relics', label: '💎 Relics' },
      { key: 'stats', label: '📊 Stats' },
    ];
    const tabW = W / tabs.length;

    tabs.forEach(({ key, label }, i) => {
      const x = i * tabW;
      const bg = this.add.graphics();
      bg.fillStyle(0x2a1a4e, 1);
      bg.fillRect(x, 0, tabW - 2, TAB_H);
      bg.lineStyle(1, 0x4a2a7e, 1);
      bg.strokeRect(x, 0, tabW - 2, TAB_H);

      const text = this.add.text(x + tabW / 2, TAB_H / 2, label, {
        fontSize: '13px',
        color: '#a090c0',
        fontFamily: 'Arial, sans-serif',
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      text.on('pointerdown', () => this._switchTab(key));
      text.on('pointerover', () => {
        if (this.activeTab !== key) text.setColor('#e0d0ff');
      });
      text.on('pointerout', () => {
        if (this.activeTab !== key) text.setColor('#a090c0');
      });

      this.tabButtons.set(key, { bg, text });
    });
  }

  private _switchTab(tab: TabKey): void {
    this.activeTab = tab;

    // Update tab visuals
    this.tabButtons.forEach(({ bg, text }, key) => {
      const tabW = W / 4;
      const i = ['dungeon', 'monsters', 'relics', 'stats'].indexOf(key);
      const x = i * tabW;
      bg.clear();
      if (key === tab) {
        bg.fillStyle(0x3a1a6e, 1);
        bg.fillRect(x, 0, tabW - 2, TAB_H);
        bg.lineStyle(2, 0xffd700, 0.8);
        bg.strokeRect(x, 0, tabW - 2, TAB_H);
        text.setColor('#ffd700');
      } else {
        bg.fillStyle(0x2a1a4e, 1);
        bg.fillRect(x, 0, tabW - 2, TAB_H);
        bg.lineStyle(1, 0x4a2a7e, 1);
        bg.strokeRect(x, 0, tabW - 2, TAB_H);
        text.setColor('#a090c0');
      }
    });

    // Show/hide containers
    this.dungeonContainer?.setVisible(tab === 'dungeon');
    this.monsterContainer?.setVisible(tab === 'monsters');
    this.relicsContainer?.setVisible(tab === 'relics');
    this.statsContainer?.setVisible(tab === 'stats');

    // Refresh active tab
    if (tab === 'dungeon') this._refreshDungeonTab();
    if (tab === 'monsters') this._refreshMonstersTab();
    if (tab === 'relics') this._refreshRelicsTab();
    if (tab === 'stats') this._refreshStatsTab();
  }

  private _buildBottomBar(): void {
    const y = H - BOTTOM_BAR_H;
    const barBg = this.add.graphics();
    barBg.fillStyle(0x0d0520, 1);
    barBg.fillRect(0, y, W, BOTTOM_BAR_H);
    barBg.lineStyle(1, 0x4a2a7e, 1);
    barBg.lineBetween(0, y, W, y);

    this.goldText = this.add.text(15, y + 14, '💰 0', {
      fontSize: '15px', color: '#ffd700', fontFamily: 'Arial',
    });

    this.gpsText = this.add.text(160, y + 14, '+0/s', {
      fontSize: '12px', color: '#aa9900', fontFamily: 'Arial',
    });

    this.gemsText = this.add.text(280, y + 14, '💎 0', {
      fontSize: '15px', color: '#33ccff', fontFamily: 'Arial',
    });

    this.floorText = this.add.text(400, y + 14, 'Floor 1', {
      fontSize: '15px', color: '#e0d0ff', fontFamily: 'Arial',
    }).setOrigin(0.5, 0);

    this.saveText = this.add.text(600, y + 14, '', {
      fontSize: '11px', color: '#4a8a4a', fontFamily: 'Arial',
    });

    const menuBtn = this.add.text(750, y + 14, '🏠', {
      fontSize: '20px',
    }).setInteractive({ useHandCursor: true });
    menuBtn.on('pointerdown', () => {
      gameState.save().then(() => {
        this.explorer.stop();
        gameState.stopAutosave();
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('MenuScene');
        });
      }).catch(console.error);
    });

    this._refreshBottomBar();
  }

  private _refreshBottomBar(): void {
    this.goldText.setText(`💰 ${formatDecimal(gameState.gold)}`);
    this.gpsText.setText(`+${gameState.goldPerSecond.toFixed(1)}/s`);
    this.gemsText.setText(`💎 ${gameState.gems}`);
    this.floorText.setText(`Floor ${gameState.currentFloor}${gameState.currentFloor % 10 === 0 ? ' 👹' : ''}`);
  }

  private _showSaveIndicator(): void {
    this.saveText.setText('✓ Saved');
    this.saveText.setColor('#44cc44');
    this.time.delayedCall(2000, () => {
      this.saveText.setText('');
    });
  }

  // ─── DUNGEON TAB ────────────────────────────────────────────────────────────

  private _buildAllContainers(): void {
    this._buildDungeonContainer();
    this._buildMonsterContainer();
    this._buildRelicsContainer();
    this._buildStatsContainer();
  }

  private _buildDungeonContainer(): void {
    this.dungeonContainer = this.add.container(0, CONTENT_Y);

    // Map area (left side)
    const mapBg = this.add.graphics();
    mapBg.fillStyle(0x0d0520, 0.8);
    mapBg.fillRect(5, 5, 380, 240);
    mapBg.lineStyle(1, 0x3a1a5e, 1);
    mapBg.strokeRect(5, 5, 380, 240);

    this.dungeonMapGraphics = this.add.graphics();

    const mapLabel = this.add.text(195, 10, 'DUNGEON MAP', {
      fontSize: '11px', color: '#5a4a7a', fontFamily: 'Arial',
    }).setOrigin(0.5, 0);

    this.floorInfoText = this.add.text(195, 230, 'Floor 1 | 0 rooms', {
      fontSize: '11px', color: '#7a6a9a', fontFamily: 'Arial',
    }).setOrigin(0.5, 1);

    // Progress bar
    const pbBg = this.add.graphics();
    pbBg.fillStyle(0x0d0520, 1);
    pbBg.fillRect(5, 252, 380, 18);
    pbBg.lineStyle(1, 0x3a1a5e, 1);
    pbBg.strokeRect(5, 252, 380, 18);

    this.progressBarFill = this.add.graphics();
    this.progressText = this.add.text(195, 261, 'Exploring...', {
      fontSize: '10px', color: '#c0b0e0', fontFamily: 'Arial',
    }).setOrigin(0.5, 0.5);

    // Battle bar
    const bbBg = this.add.graphics();
    bbBg.fillStyle(0x0d0520, 1);
    bbBg.fillRect(5, 276, 380, 14);
    bbBg.lineStyle(1, 0x5a1a1a, 1);
    bbBg.strokeRect(5, 276, 380, 14);

    this.battleBarFill = this.add.graphics();
    this.battleText = this.add.text(195, 283, '', {
      fontSize: '9px', color: '#ff8888', fontFamily: 'Arial',
    }).setOrigin(0.5, 0.5);

    this.roomInfoText = this.add.text(195, 296, '', {
      fontSize: '11px', color: '#e0d0ff', fontFamily: 'Arial',
    }).setOrigin(0.5, 0);

    // Log area
    const logBg = this.add.graphics();
    logBg.fillStyle(0x080310, 0.9);
    logBg.fillRect(5, 315, 380, 225);
    logBg.lineStyle(1, 0x2a1a4e, 1);
    logBg.strokeRect(5, 315, 380, 225);

    const logLabel = this.add.text(10, 318, 'EXPLORATION LOG', {
      fontSize: '10px', color: '#5a4a7a', fontFamily: 'Arial',
    });

    this.logTexts = [];
    for (let i = 0; i < 12; i++) {
      const t = this.add.text(10, 332 + i * 17, '', {
        fontSize: '10px', color: '#8070a0', fontFamily: 'Courier New',
        wordWrap: { width: 368 },
      });
      this.logTexts.push(t);
    }

    // Right panel: deployed monsters
    const rightBg = this.add.graphics();
    rightBg.fillStyle(0x0d0520, 0.8);
    rightBg.fillRect(392, 5, 400, 535);
    rightBg.lineStyle(1, 0x3a1a5e, 1);
    rightBg.strokeRect(392, 5, 400, 535);

    const deployedLabel = this.add.text(592, 12, 'DEPLOYED PARTY', {
      fontSize: '13px', color: '#ffd700', fontFamily: 'Georgia, serif',
    }).setOrigin(0.5, 0);

    // Deployed monster slots
    this._deployedSlots = [];
    for (let i = 0; i < 8; i++) {
      const slotY = 35 + i * 63;
      const slotBg = this.add.graphics();
      slotBg.fillStyle(0x1a0a3e, 1);
      slotBg.fillRect(398, slotY, 388, 58);
      slotBg.lineStyle(1, 0x2a1a5e, 1);
      slotBg.strokeRect(398, slotY, 388, 58);

      const slotEmoji = this.add.text(415, slotY + 12, '', { fontSize: '24px' });
      const slotName = this.add.text(450, slotY + 8, '', { fontSize: '12px', color: '#e0d0ff', fontFamily: 'Arial' });
      const slotStats = this.add.text(450, slotY + 26, '', { fontSize: '10px', color: '#9080b0', fontFamily: 'Arial' });
      const slotHpBar = this.add.graphics();
      const slotGrade = this.add.text(765, slotY + 6, '', { fontSize: '10px', color: '#ffd700', fontFamily: 'Arial' }).setOrigin(1, 0);

      this._deployedSlots.push({ bg: slotBg, emoji: slotEmoji, name: slotName, stats: slotStats, hpBar: slotHpBar, grade: slotGrade });
    }

    this.dungeonContainer.add([
      mapBg, this.dungeonMapGraphics, mapLabel, this.floorInfoText,
      pbBg, this.progressBarFill, this.progressText,
      bbBg, this.battleBarFill, this.battleText,
      this.roomInfoText,
      logBg, logLabel, ...this.logTexts,
      rightBg, deployedLabel,
      ...this._deployedSlots.flatMap(s => [s.bg, s.emoji, s.name, s.stats, s.hpBar, s.grade]),
    ]);
  }

  private _deployedSlots: Array<{
    bg: Phaser.GameObjects.Graphics;
    emoji: Phaser.GameObjects.Text;
    name: Phaser.GameObjects.Text;
    stats: Phaser.GameObjects.Text;
    hpBar: Phaser.GameObjects.Graphics;
    grade: Phaser.GameObjects.Text;
  }> = [];

  private _refreshDungeonTab(): void {
    this._refreshDungeonMap();
    this._refreshProgressBar();
    this._refreshBattleBar();
    this._refreshLogDisplay();
    this._refreshDeployedSlots();
  }

  private _refreshDungeonMap(): void {
    const floor = this.explorer.currentFloor;
    const g = this.dungeonMapGraphics;
    g.clear();

    if (!floor.generated) return;

    const mapX = 8;
    const mapY = 20;
    const mapW = 374;
    const mapH = 204;

    const tileW = mapW / floor.width;
    const tileH = mapH / floor.height;

    // Draw tiles
    for (let y = 0; y < floor.height; y++) {
      for (let x = 0; x < floor.width; x++) {
        const tile = floor.tiles[y][x];
        if (tile === 0) {
          g.fillStyle(0x1a0a3e, 1);
          g.fillRect(mapX + x * tileW, mapY + y * tileH, tileW, tileH);
        }
      }
    }

    // Draw rooms
    floor.rooms.forEach((room, i) => {
      let color = 0x2a1a5e;
      if (room.type === 'boss') color = 0x5a0a0a;
      else if (room.type === 'treasure') color = 0x2a3a1a;

      if (room.explored) {
        color = room.type === 'boss' ? 0x8a1a1a : room.type === 'treasure' ? 0x3a5a2a : 0x3a2a6e;
      }

      g.fillStyle(color, 1);
      g.fillRect(
        mapX + room.x * tileW,
        mapY + room.y * tileH,
        room.w * tileW,
        room.h * tileH
      );

      // Room border
      g.lineStyle(1, room.explored ? 0x6a5aaa : 0x3a2a6e, 1);
      g.strokeRect(
        mapX + room.x * tileW,
        mapY + room.y * tileH,
        room.w * tileW,
        room.h * tileH
      );

      // Current room indicator
      if (i === this.explorer.currentRoomIndex) {
        g.lineStyle(2, 0xffd700, 1);
        g.strokeRect(
          mapX + room.x * tileW - 1,
          mapY + room.y * tileH - 1,
          room.w * tileW + 2,
          room.h * tileH + 2
        );
        // Party indicator dot
        g.fillStyle(0xffd700, 1);
        g.fillCircle(
          mapX + room.centerX * tileW,
          mapY + room.centerY * tileH,
          3
        );
      }

      // Room type icons
      if (room.type === 'boss') {
        // Boss marker
        g.fillStyle(0xff4444, 1);
        g.fillCircle(mapX + room.centerX * tileW, mapY + room.centerY * tileH, 4);
      } else if (room.type === 'treasure' && !room.explored) {
        g.fillStyle(0xffdd00, 0.8);
        g.fillRect(mapX + room.centerX * tileW - 2, mapY + room.centerY * tileH - 2, 4, 4);
      }
    });

    // Floor info
    const cfg = this.explorer.currentFloor.config;
    const explored = floor.rooms.filter(r => r.explored).length;
    this.floorInfoText.setText(
      `Floor ${gameState.currentFloor}${cfg.isBossFloor ? ' 👹 BOSS' : ''}  |  ${explored}/${floor.rooms.length} rooms  |  Party: ${gameState.getDeployedMonsters().length} monsters`
    );
  }

  private _refreshProgressBar(): void {
    const progress = this.explorer.roomProgress;
    const g = this.progressBarFill;
    g.clear();

    const filled = (progress / 100) * 376;
    g.fillStyle(0x4a2a8e, 1);
    g.fillRect(7, 254, filled, 14);

    const rooms = this.explorer.currentFloor.rooms;
    const current = this.explorer.currentRoomIndex;
    const total = rooms.length;
    const room = rooms[current];
    const roomType = room ? room.type : 'done';

    let label = `Room ${Math.min(current + 1, total)}/${total}`;
    if (roomType === 'boss') label += ' — BOSS';
    else if (roomType === 'treasure') label += ' — Treasure';
    if (this.explorer.battle.active) label = `⚔️ In Combat — ${label}`;

    this.progressText.setText(label);
    this.roomInfoText.setText(gameState.getDeployedMonsters().length === 0
      ? '⚠️ No monsters deployed — go to Monsters tab!'
      : `Party SPD: ${gameState.getPartySpd().toFixed(2)}  ATK: ${formatDecimal(gameState.getPartyAtk())}`
    );
  }

  private _refreshBattleBar(): void {
    const battle = this.explorer.battle;
    const g = this.battleBarFill;
    g.clear();

    if (battle.active && battle.enemy) {
      const filled = ((100 - battle.progress) / 100) * 376;
      g.fillStyle(0x8a1a1a, 1);
      g.fillRect(7, 278, filled, 10);
      this.battleText.setText(`${battle.enemy.emoji} ${battle.enemy.name} — HP: ${Math.max(0, Math.round(100 - battle.progress))}%`);
    } else {
      this.battleText.setText('');
    }
  }

  private _refreshLogDisplay(): void {
    const events = this.explorer.getRecentLog(12);
    this.logTexts.forEach((t, i) => {
      const evt = events[i];
      if (!evt) { t.setText(''); return; }

      let color = '#8070a0';
      if (evt.type === 'combat') color = '#cc6666';
      else if (evt.type === 'treasure') color = '#ccaa44';
      else if (evt.type === 'boss') color = '#ff6644';
      else if (evt.type === 'floor') color = '#44aaff';
      else if (evt.type === 'relic') color = '#cc44ff';

      t.setColor(color);
      t.setText(evt.message);
    });
  }

  private _refreshDeployedSlots(): void {
    const deployed = gameState.getDeployedMonsters();
    this._deployedSlots.forEach((slot, i) => {
      const monster = deployed[i];
      slot.bg.clear();
      slot.hpBar.clear();

      const slotY = 35 + i * 63 - CONTENT_Y; // offset for container
      if (!monster) {
        slot.bg.fillStyle(0x0d0520, 0.5);
        slot.bg.fillRect(398, slotY + CONTENT_Y, 388, 58);
        slot.bg.lineStyle(1, 0x1a0a3e, 0.5);
        slot.bg.strokeRect(398, slotY + CONTENT_Y, 388, 58);
        slot.emoji.setText('');
        slot.name.setText('');
        slot.stats.setText('');
        slot.grade.setText('');
        return;
      }

      const slotAbsY = 35 + i * 63;
      slot.bg.fillStyle(0x1a0a3e, 1);
      slot.bg.fillRect(398, slotAbsY, 388, 58);
      slot.bg.lineStyle(1, monster.gradeColor.replace('#', '0x') as unknown as number, 0.6);
      slot.bg.strokeRect(398, slotAbsY, 388, 58);

      slot.emoji.setText(monster.emoji).setPosition(415, slotAbsY + 12);
      slot.name.setText(`${monster.name} Lv${monster.level}`).setPosition(450, slotAbsY + 8);
      slot.stats.setText(`ATK:${monster.atkDisplay}  HP:${monster.hpDisplay}  SPD:${monster.spdDisplay}`).setPosition(450, slotAbsY + 26);
      slot.grade.setText(monster.gradeLabel).setPosition(765, slotAbsY + 6);

      // HP bar
      const hpPct = monster.stats.hp.div(monster.stats.maxHp).toNumber();
      slot.hpBar.fillStyle(0x2a0a0a, 1);
      slot.hpBar.fillRect(450, slotAbsY + 42, 300, 8);
      const hpColor = hpPct > 0.5 ? 0x44aa44 : hpPct > 0.25 ? 0xaaaa44 : 0xaa4444;
      slot.hpBar.fillStyle(hpColor, 1);
      slot.hpBar.fillRect(450, slotAbsY + 42, Math.max(0, 300 * hpPct), 8);
    });
  }

  // ─── MONSTERS TAB ──────────────────────────────────────────────────────────

  private _buildMonsterContainer(): void {
    this.monsterContainer = this.add.container(0, CONTENT_Y);
    // Placeholder — fully rebuilt on each show
  }

  private _refreshMonstersTab(): void {
    this.monsterContainer.removeAll(true);

    const panel = this.add.graphics();
    panel.fillStyle(0x0d0520, 0.9);
    panel.fillRect(5, 5, W - 10, CONTENT_H - 10);
    panel.lineStyle(1, 0x3a1a5e, 1);
    panel.strokeRect(5, 5, W - 10, CONTENT_H - 10);
    this.monsterContainer.add(panel);

    // Summon section
    const summonLabel = this.add.text(W / 2, 14, 'SUMMON MONSTERS', {
      fontSize: '14px', color: '#ffd700', fontFamily: 'Georgia, serif',
    }).setOrigin(0.5, 0);
    this.monsterContainer.add(summonLabel);

    const { MONSTER_CONFIGS, MONSTER_TYPES } = require('../config/monsters');
    MONSTER_TYPES.forEach((type: string, i: number) => {
      const cfg = MONSTER_CONFIGS[type];
      const col = i % 5;
      const x = 20 + col * 152;
      const y = 38;
      this._makeSummonCard(x, y, cfg);
    });

    // Monster roster
    const rosterLabel = this.add.text(W / 2, 138, `ROSTER  (${gameState.monsters.length} monsters)`, {
      fontSize: '13px', color: '#e0d0ff', fontFamily: 'Georgia, serif',
    }).setOrigin(0.5, 0);
    this.monsterContainer.add(rosterLabel);

    const divLine = this.add.graphics();
    divLine.lineStyle(1, 0x3a1a5e, 0.6);
    divLine.lineBetween(20, 155, W - 20, 155);
    this.monsterContainer.add(divLine);

    if (gameState.monsters.length === 0) {
      const hint = this.add.text(W / 2, 200, 'No monsters yet! Summon one above.', {
        fontSize: '14px', color: '#5a4a7a', fontFamily: 'Georgia, serif', fontStyle: 'italic',
      }).setOrigin(0.5);
      this.monsterContainer.add(hint);
      return;
    }

    gameState.monsters.forEach((monster, idx) => {
      const col = idx % 4;
      const row = Math.floor(idx / 4);
      const x = 15 + col * 192;
      const y = 162 + row * 88;
      if (y + 88 > CONTENT_H - 10) return;
      this._makeMonsterCard(x, y, monster);
    });

    // Merge hints
    const { findMergeCandidates } = require('../systems/MergeSystem');
    const candidates = findMergeCandidates(gameState.monsters).filter((c: { canMerge: boolean }) => c.canMerge);
    if (candidates.length > 0) {
      const mergeHint = this.add.text(W / 2, CONTENT_H - 28, `✨ ${candidates.length} merge(s) available! Click "Merge" on matching monsters.`, {
        fontSize: '11px', color: '#cc44ff', fontFamily: 'Arial',
      }).setOrigin(0.5);
      this.monsterContainer.add(mergeHint);
    }
  }

  private _makeSummonCard(x: number, y: number, cfg: Record<string, unknown>): void {
    const cardW = 146;
    const cardH = 90;

    const bg = this.add.graphics();
    bg.fillStyle(0x1a0a3e, 1);
    bg.fillRect(x, y, cardW, cardH);
    bg.lineStyle(1, 0x4a2a6e, 1);
    bg.strokeRect(x, y, cardW, cardH);
    this.monsterContainer.add(bg);

    const emoji = this.add.text(x + 10, y + 8, cfg['emoji'] as string, { fontSize: '24px' });
    const name = this.add.text(x + 44, y + 8, cfg['name'] as string, { fontSize: '13px', color: cfg['color'] as string, fontFamily: 'Arial', fontStyle: 'bold' });
    const desc = this.add.text(x + 10, y + 38, cfg['specialty'] as string, {
      fontSize: '9px', color: '#7060a0', fontFamily: 'Arial',
      wordWrap: { width: cardW - 14 },
    });
    const costLabel = this.add.text(x + 10, y + 68, `💰 ${cfg['cost']}`, { fontSize: '11px', color: '#ffd700', fontFamily: 'Arial' });

    this.monsterContainer.add([emoji, name, desc, costLabel]);

    // Summon button
    const btnBg = this.add.graphics();
    const btnX = x + cardW - 52;
    const btnY = y + 64;
    btnBg.fillStyle(0x3a2a6e, 1);
    btnBg.fillRect(btnX, btnY, 46, 20);
    btnBg.lineStyle(1, 0xffd700, 0.6);
    btnBg.strokeRect(btnX, btnY, 46, 20);
    this.monsterContainer.add(btnBg);

    const btnText = this.add.text(btnX + 23, btnY + 10, 'SUMMON', {
      fontSize: '9px', color: '#ffd700', fontFamily: 'Arial',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btnText.on('pointerdown', () => {
      const cost = decimalFromNumber(cfg['cost'] as number);
      if (gameState.spendGold(cost)) {
        const { Monster } = require('../objects/Monster');
        const m = new Monster(cfg['type'] as string);
        gameState.addMonster(m);
        this._refreshBottomBar();
        this._refreshMonstersTab();
      } else {
        this._showToast(`Need ${cfg['cost']} gold!`);
      }
    });
    btnText.on('pointerover', () => { btnBg.clear(); btnBg.fillStyle(0xffd700, 0.2); btnBg.fillRect(btnX, btnY, 46, 20); btnBg.lineStyle(1, 0xffd700, 1); btnBg.strokeRect(btnX, btnY, 46, 20); });
    btnText.on('pointerout', () => { btnBg.clear(); btnBg.fillStyle(0x3a2a6e, 1); btnBg.fillRect(btnX, btnY, 46, 20); btnBg.lineStyle(1, 0xffd700, 0.6); btnBg.strokeRect(btnX, btnY, 46, 20); });
    this.monsterContainer.add(btnText);
  }

  private _makeMonsterCard(x: number, y: number, monster: import('../objects/Monster').Monster): void {
    const { performMerge } = require('../systems/MergeSystem');
    const cardW = 185;
    const cardH = 82;

    const bg = this.add.graphics();
    const borderColor = parseInt(monster.gradeColor.replace('#', ''), 16);
    bg.fillStyle(monster.deployed ? 0x1a2a1e : 0x1a0a3e, 1);
    bg.fillRect(x, y, cardW, cardH);
    bg.lineStyle(monster.deployed ? 2 : 1, borderColor, monster.deployed ? 0.8 : 0.5);
    bg.strokeRect(x, y, cardW, cardH);
    this.monsterContainer.add(bg);

    const emoji = this.add.text(x + 6, y + 6, monster.emoji, { fontSize: '22px' });
    const nameText = this.add.text(x + 36, y + 5, `${monster.name} Lv${monster.level}`, {
      fontSize: '11px', color: monster.color, fontFamily: 'Arial', fontStyle: 'bold',
    });
    const gradeText = this.add.text(x + cardW - 5, y + 5, monster.gradeLabel, {
      fontSize: '10px', color: monster.gradeColor, fontFamily: 'Arial',
    }).setOrigin(1, 0);
    const statsText = this.add.text(x + 6, y + 30, `ATK:${monster.atkDisplay}  HP:${monster.hpDisplay}  SPD:${monster.spdDisplay}`, {
      fontSize: '9px', color: '#9080b0', fontFamily: 'Arial',
    });

    this.monsterContainer.add([emoji, nameText, gradeText, statsText]);

    // Deploy/Withdraw toggle
    const dpX = x + 4;
    const dpY = y + cardH - 22;
    const dpBg = this.add.graphics();
    dpBg.fillStyle(monster.deployed ? 0x1a3a1a : 0x1a1a3a, 1);
    dpBg.fillRect(dpX, dpY, 55, 18);
    dpBg.lineStyle(1, monster.deployed ? 0x44cc44 : 0x4444cc, 1);
    dpBg.strokeRect(dpX, dpY, 55, 18);
    this.monsterContainer.add(dpBg);

    const dpText = this.add.text(dpX + 27, dpY + 9, monster.deployed ? 'WITHDRAW' : 'DEPLOY', {
      fontSize: '8px', color: monster.deployed ? '#44cc44' : '#4488ff', fontFamily: 'Arial',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    dpText.on('pointerdown', () => {
      monster.deployed = !monster.deployed;
      if (this.activeTab === 'monsters') this._refreshMonstersTab();
      if (this.activeTab === 'dungeon') this._refreshDeployedSlots();
    });
    this.monsterContainer.add(dpText);

    // Level up button
    const lvX = dpX + 60;
    const upgCost = monster.getUpgradeCost();
    const canAfford = gameState.gold.gte(upgCost);
    const lvBg = this.add.graphics();
    lvBg.fillStyle(canAfford ? 0x3a2a0a : 0x1a1a1a, 1);
    lvBg.fillRect(lvX, dpY, 58, 18);
    lvBg.lineStyle(1, canAfford ? 0xffd700 : 0x3a3a3a, 1);
    lvBg.strokeRect(lvX, dpY, 58, 18);
    this.monsterContainer.add(lvBg);

    const lvText = this.add.text(lvX + 29, dpY + 9, `LVL UP ${formatDecimal(upgCost)}`, {
      fontSize: '8px', color: canAfford ? '#ffd700' : '#5a5a5a', fontFamily: 'Arial',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    lvText.on('pointerdown', () => {
      if (gameState.spendGold(monster.getUpgradeCost())) {
        monster.levelUp();
        this._refreshBottomBar();
        if (this.activeTab === 'monsters') this._refreshMonstersTab();
      } else {
        this._showToast(`Need ${formatDecimal(monster.getUpgradeCost())} gold!`);
      }
    });
    this.monsterContainer.add(lvText);

    // Merge button
    const mergeX = lvX + 63;
    const sameGrade = gameState.monsters.filter(m => m.type === monster.type && m.grade === monster.grade && !m.deployed);
    const canMerge = sameGrade.length >= 3 && monster.grade < 5;
    const mgBg = this.add.graphics();
    mgBg.fillStyle(canMerge ? 0x2a0a3a : 0x1a1a1a, 1);
    mgBg.fillRect(mergeX, dpY, 52, 18);
    mgBg.lineStyle(1, canMerge ? 0xcc44ff : 0x3a3a3a, 1);
    mgBg.strokeRect(mergeX, dpY, 52, 18);
    this.monsterContainer.add(mgBg);

    const mgText = this.add.text(mergeX + 26, dpY + 9, `MERGE(${sameGrade.length}/3)`, {
      fontSize: '8px', color: canMerge ? '#cc44ff' : '#5a5a5a', fontFamily: 'Arial',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    mgText.on('pointerdown', () => {
      if (!canMerge) { this._showToast('Need 3 same type+grade!'); return; }
      const result = performMerge(gameState.monsters, monster.type, monster.grade);
      if (result.success && result.newMonster) {
        gameState.removeMonsters(result.removedIds);
        gameState.addMonster(result.newMonster);
        this._showToast(`Merged! ${result.newMonster.emoji} ${result.newMonster.name} ${result.newMonster.gradeLabel}`);
        if (this.activeTab === 'monsters') this._refreshMonstersTab();
      }
    });
    this.monsterContainer.add(mgText);
  }

  // ─── RELICS TAB ────────────────────────────────────────────────────────────

  private _buildRelicsContainer(): void {
    this.relicsContainer = this.add.container(0, CONTENT_Y);
  }

  private _refreshRelicsTab(): void {
    this.relicsContainer.removeAll(true);

    const panel = this.add.graphics();
    panel.fillStyle(0x0d0520, 0.9);
    panel.fillRect(5, 5, W - 10, CONTENT_H - 10);
    panel.lineStyle(1, 0x3a1a5e, 1);
    panel.strokeRect(5, 5, W - 10, CONTENT_H - 10);
    this.relicsContainer.add(panel);

    const label = this.add.text(W / 2, 14, `RELIC VAULT  (${gameState.relics.length} relics)`, {
      fontSize: '14px', color: '#ffd700', fontFamily: 'Georgia, serif',
    }).setOrigin(0.5, 0);
    this.relicsContainer.add(label);

    if (gameState.relics.length === 0) {
      const hint = this.add.text(W / 2, H / 2 - 80, '🔮', { fontSize: '48px' }).setOrigin(0.5);
      const hint2 = this.add.text(W / 2, H / 2 - 20, 'No relics yet.', {
        fontSize: '16px', color: '#5a4a7a', fontFamily: 'Georgia, serif', fontStyle: 'italic',
      }).setOrigin(0.5);
      const hint3 = this.add.text(W / 2, H / 2 + 12, 'Defeat bosses every 10 floors to earn relics!', {
        fontSize: '13px', color: '#4a3a6a', fontFamily: 'Georgia, serif', fontStyle: 'italic',
      }).setOrigin(0.5);
      this.relicsContainer.add([hint, hint2, hint3]);
    } else {
      // Bonus summary
      const atkMult = gameState.getRelicMultiplier('atk');
      const hpMult = gameState.getRelicMultiplier('hp');
      const spdMult = gameState.getRelicMultiplier('spd');
      const goldMult = gameState.getRelicMultiplier('gold');
      const summaryText = `ATK ×${atkMult.toFixed(2)}  HP ×${hpMult.toFixed(2)}  SPD ×${spdMult.toFixed(2)}  Gold ×${goldMult.toFixed(2)}`;
      const summary = this.add.text(W / 2, 34, summaryText, {
        fontSize: '11px', color: '#c0a0e0', fontFamily: 'Arial',
      }).setOrigin(0.5, 0);
      this.relicsContainer.add(summary);

      // Grid of relics
      const COLS = 6;
      const CARD_W = 120;
      const CARD_H = 90;
      const startX = (W - COLS * (CARD_W + 8)) / 2 + 4;

      gameState.relics.forEach((relic, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const rx = startX + col * (CARD_W + 8);
        const ry = 52 + row * (CARD_H + 8);

        const colorHex = parseInt(relic.color.replace('#', ''), 16);

        const cardBg = this.add.graphics();
        cardBg.fillStyle(0x1a0a3e, 1);
        cardBg.fillRect(rx, ry, CARD_W, CARD_H);
        cardBg.lineStyle(2, colorHex, 0.8);
        cardBg.strokeRoundedRect(rx, ry, CARD_W, CARD_H, 4);
        this.relicsContainer.add(cardBg);

        const emojiText = this.add.text(rx + CARD_W / 2, ry + 16, relic.emoji, { fontSize: '24px' }).setOrigin(0.5);
        const nameText = this.add.text(rx + CARD_W / 2, ry + 38, relic.name, {
          fontSize: '10px', color: relic.color, fontFamily: 'Arial', fontStyle: 'bold',
          wordWrap: { width: CARD_W - 6 }, align: 'center',
        }).setOrigin(0.5, 0);
        const bonusText = this.add.text(rx + CARD_W / 2, ry + 62, relic.bonusPercent, {
          fontSize: '13px', color: '#ffd700', fontFamily: 'Arial', fontStyle: 'bold',
        }).setOrigin(0.5, 0);
        const rarityText = this.add.text(rx + CARD_W / 2, ry + 76, relic.rarity.toUpperCase(), {
          fontSize: '9px', color: relic.color, fontFamily: 'Arial',
        }).setOrigin(0.5, 0);

        this.relicsContainer.add([emojiText, nameText, bonusText, rarityText]);
      });
    }
  }

  // ─── STATS TAB ─────────────────────────────────────────────────────────────

  private _buildStatsContainer(): void {
    this.statsContainer = this.add.container(0, CONTENT_Y);
  }

  private _refreshStatsTab(): void {
    this.statsContainer.removeAll(true);

    const panel = this.add.graphics();
    panel.fillStyle(0x0d0520, 0.9);
    panel.fillRect(5, 5, W - 10, CONTENT_H - 10);
    panel.lineStyle(1, 0x3a1a5e, 1);
    panel.strokeRect(5, 5, W - 10, CONTENT_H - 10);
    this.statsContainer.add(panel);

    const label = this.add.text(W / 2, 14, 'ADVENTURER STATS', {
      fontSize: '14px', color: '#ffd700', fontFamily: 'Georgia, serif',
    }).setOrigin(0.5, 0);
    this.statsContainer.add(label);

    const s = gameState.stats;
    const playH = Math.floor(s.playTimeSeconds / 3600);
    const playM = Math.floor((s.playTimeSeconds % 3600) / 60);
    const playS = Math.floor(s.playTimeSeconds % 60);
    const playTime = `${playH}h ${playM}m ${playS}s`;

    const rows = [
      ['⚔️ Total Kills', s.totalKills.toString()],
      ['🏆 Floors Explored', s.totalFloorsExplored.toString()],
      ['👹 Bosses Defeated', s.bossesDefeated.toString()],
      ['💰 Total Gold Earned', formatDecimal(s.totalGoldEarned)],
      ['🌟 Strongest Monster', s.strongestMonsterName],
      ['💎 Relics Found', s.relicsFound.toString()],
      ['⏱️ Play Time', playTime],
      ['🏰 Current Floor', gameState.currentFloor.toString()],
      ['👾 Monsters Owned', gameState.monsters.length.toString()],
      ['⚔️ Deployed', gameState.getDeployedMonsters().length.toString()],
      ['💰 Current Gold', formatDecimal(gameState.gold)],
      ['💎 Current Gems', gameState.gems.toString()],
      ['⚡ Gold/sec', gameState.goldPerSecond.toFixed(2)],
    ];

    rows.forEach(([key, val], i) => {
      const row = Math.floor(i / 2);
      const col = i % 2;
      const rx = 40 + col * 370;
      const ry = 45 + row * 38;

      const rowBg = this.add.graphics();
      rowBg.fillStyle(i % 2 === 0 ? 0x1a0a3e : 0x150830, 0.7);
      rowBg.fillRect(rx - 8, ry - 4, 350, 30);
      this.statsContainer.add(rowBg);

      const keyText = this.add.text(rx, ry + 6, key, {
        fontSize: '12px', color: '#9080b0', fontFamily: 'Arial',
      }).setOrigin(0, 0.5);
      const valText = this.add.text(rx + 340, ry + 6, val, {
        fontSize: '13px', color: '#ffd700', fontFamily: 'Arial', fontStyle: 'bold',
      }).setOrigin(1, 0.5);

      this.statsContainer.add([keyText, valText]);
    });
  }

  // ─── HELPERS ───────────────────────────────────────────────────────────────

  private _showToast(msg: string): void {
    const toast = this.add.text(W / 2, H - BOTTOM_BAR_H - 30, msg, {
      fontSize: '13px', color: '#ffffff', fontFamily: 'Arial',
      backgroundColor: '#3a1a5e',
      padding: { x: 12, y: 6 },
    }).setOrigin(0.5).setDepth(100);

    this.tweens.add({
      targets: toast,
      y: H - BOTTOM_BAR_H - 60,
      alpha: 0,
      duration: 1800,
      ease: 'Power2',
      onComplete: () => toast.destroy(),
    });
  }

  private _showOfflinePopup(result: { offlineGold: import('../systems/BigNumber').Decimal; offlineSeconds: number; floorsEstimated: number }): void {
    const popupW = 360;
    const popupH = 200;
    const px = (W - popupW) / 2;
    const py = (H - popupH) / 2;

    const overlay = this.add.graphics().setDepth(200);
    overlay.fillStyle(0x000000, 0.6);
    overlay.fillRect(0, 0, W, H);

    const popup = this.add.container(0, 0).setDepth(201);

    const bg = this.add.graphics();
    bg.fillStyle(0x1a0a3e, 1);
    bg.fillRoundedRect(px, py, popupW, popupH, 8);
    bg.lineStyle(2, 0xffd700, 0.8);
    bg.strokeRoundedRect(px, py, popupW, popupH, 8);
    popup.add(bg);

    popup.add(this.add.text(W / 2, py + 20, '🌙 Welcome Back!', {
      fontSize: '20px', color: '#ffd700', fontFamily: 'Georgia, serif',
    }).setOrigin(0.5));

    popup.add(this.add.text(W / 2, py + 55, `You were away for ${formatOfflineTime(result.offlineSeconds)}`, {
      fontSize: '13px', color: '#c0a0e0', fontFamily: 'Arial',
    }).setOrigin(0.5));

    popup.add(this.add.text(W / 2, py + 82, `+${formatDecimal(result.offlineGold)} Gold`, {
      fontSize: '22px', color: '#ffd700', fontFamily: 'Georgia, serif', fontStyle: 'bold',
    }).setOrigin(0.5));

    if (result.floorsEstimated > 0) {
      popup.add(this.add.text(W / 2, py + 115, `~${result.floorsEstimated} floors explored`, {
        fontSize: '12px', color: '#9080b0', fontFamily: 'Arial',
      }).setOrigin(0.5));
    }

    const okBg = this.add.graphics();
    okBg.fillStyle(0x3a2a6e, 1);
    okBg.fillRoundedRect(W / 2 - 60, py + 148, 120, 36, 6);
    okBg.lineStyle(2, 0xffd700, 0.8);
    okBg.strokeRoundedRect(W / 2 - 60, py + 148, 120, 36, 6);
    popup.add(okBg);

    const okBtn = this.add.text(W / 2, py + 166, 'COLLECT!', {
      fontSize: '16px', color: '#ffd700', fontFamily: 'Georgia, serif', fontStyle: 'bold',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    okBtn.on('pointerdown', () => {
      overlay.destroy();
      popup.destroy();
      this._refreshBottomBar();
    });
    popup.add(okBtn);

    this.offlinePopup = popup;
  }

  shutdown(): void {
    this.explorer.stop();
    gameState.stopAutosave();
  }
}
