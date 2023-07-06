import {
  GAME_GATE_REGISTRY_ENTRY,
  GameGate,
  IGateConstructor
} from '../interfaces/gate.interface';

export class Gate extends Phaser.GameObjects.Sprite {
  body: Phaser.Physics.Arcade.Body;

  // variables
  private currentScene: Phaser.Scene;
  private tag: string;
  private defaultGateState: boolean;

  constructor(aParams: IGateConstructor) {
    super(aParams.scene, aParams.x, aParams.y, aParams.texture, aParams.frame);

    // variables
    this.defaultGateState = aParams.invert;
    this.currentScene = aParams.scene;
    this.tag = aParams.tag;
    this.initSprite(aParams.invert ?? false);
    this.currentScene.add.existing(this);
  }

  private initSprite(isInverted: boolean) {
    // sprite
    this.setOrigin(0, 0);
    this.setFrame(0);

    // physics
    this.currentScene.physics.world.enable(this);
    this.body.setSize(8, 8);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);

    const state = this.currentScene.registry.get(GAME_GATE_REGISTRY_ENTRY);
    if (state !== undefined && state !== null && Object.keys(state).includes(this.tag)) {
      this.setGateState(state[this.tag]);
    } else {
      // not predetermined, set as default, start off unless inverted
      this.setGateState(this.defaultGateState);
    }

    this.currentScene.registry.events.on(
      Phaser.Data.Events.CHANGE_DATA,
      this.onChangeData,
      this
    );
  }

  update(): void {}

  private onChangeData(
    parent: Phaser.Data.DataManager,
    key: string,
    data: GameGate
  ) {
    if (
      key === GAME_GATE_REGISTRY_ENTRY &&
      Object.keys(data).includes(this.tag)
    ) {
      this.setGateState(data[this.tag]);
    }
  }

  private setGateState(state: boolean) {
    const isSame = state === this.defaultGateState;

    if (isSame) {
      this.currentScene.physics.world.enable(this);
    } else {
      this.currentScene.physics.world.disable(this);
    }

    this.setVisible(isSame);
    this.setActive(isSame);
  }

  destroy(fromScene?: boolean): void {
    this.currentScene.registry.events.off(
      Phaser.Data.Events.CHANGE_DATA,
      this.onChangeData,
      this
    );
    super.destroy(fromScene);
  }
}
