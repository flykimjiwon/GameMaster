/**
 * Simple FIFO matchmaking.
 * In a production version this would use trophy-based ELO matching.
 * For now, Colyseus' joinOrCreate handles 1:1 matching automatically.
 */
export class MatchmakingSystem {
  /**
   * Generate a display name for a player.
   */
  static generateName(index: number): string {
    const names = [
      "용사", "기사", "마법사", "궁수", "전사",
      "닌자", "해적", "기사단장", "드래곤", "피닉스",
      "천둥", "폭풍", "불꽃", "얼음", "번개",
    ];
    return names[index % names.length] + (Math.floor(index / names.length) + 1);
  }

  /**
   * Generate a random seed for material generation.
   */
  static generateSeed(): string {
    return Math.random().toString(36).substring(2, 10);
  }
}
