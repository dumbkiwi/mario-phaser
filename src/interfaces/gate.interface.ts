export const GAME_GATE_REGISTRY_ENTRY = 'game-gate'

export interface IGateConstructor {
    scene: Phaser.Scene;
    tag: string;
    x: number;
    y: number;
    texture: string;
    invert: boolean;
    frame?: string | number;
  }
  
export type GameGate = {
  [key: string]: boolean;
}