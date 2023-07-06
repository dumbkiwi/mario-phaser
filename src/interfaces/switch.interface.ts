export interface ISwitchConstructor {
    scene: Phaser.Scene;
    target: string;
    x: number;
    y: number;
    texture: string;
    invert: boolean;
    inactiveFrame?: string | number;
    activeFrame?: string | number;
  }
  