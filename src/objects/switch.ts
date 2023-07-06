import {
  GAME_GATE_REGISTRY_ENTRY,
  GameGate
} from '../interfaces/gate.interface';
import { ISwitchConstructor } from '../interfaces/switch.interface';

export class Switch extends Phaser.GameObjects.Sprite {
  body: Phaser.Physics.Arcade.Body;

  // variables
  private currentScene: Phaser.Scene;
  private inactiveFrame: string | number;
  private activeFrame: string | number;
  private target: string;
  private switchState: boolean;
  private lastToggleTime: number;

  constructor(aParams: ISwitchConstructor) {
    super(
      aParams.scene,
      aParams.x,
      aParams.y,
      aParams.texture,
      aParams.inactiveFrame
    );

    // variables
    this.activeFrame = aParams.activeFrame ?? 0;
    this.inactiveFrame = aParams.inactiveFrame ?? 0;
    this.lastToggleTime = 0;

    // debugger
    // variables
    this.currentScene = aParams.scene;
    this.target = aParams.target;
    this.initSprite(aParams.invert);
    this.currentScene.add.existing(this);

    // events
    this.currentScene.registry.events.on(
      Phaser.Data.Events.CHANGE_DATA,
      this.onChangeData,
      this
    );
  }

  private initSprite(startInverted: boolean) {
    // sprite
    this.setOrigin(0, 0);

    // physics
    this.currentScene.physics.world.enable(this);
    this.body.setSize(8, 8);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);

    // disable if is false in registry
    const state = this.currentScene.registry.get(GAME_GATE_REGISTRY_ENTRY);

    if (state !== undefined && state !== null && Object.keys(state).includes(this.target)) {
      // predetermined, set as predetermined
      this.setSwitchState(state[this.target]);
    } else {
      // not predetermined, set as default, start off unless inverted
      this.setSwitchState(startInverted);
    }
  }

  update(): void {}

  public toggleSwitch() {
    if (this.lastToggleTime + 200 < this.currentScene.time.now) {
      this.setSwitchState(!this.switchState);
      this.lastToggleTime = this.currentScene.time.now;
    }
  }

  private onChangeData(
    parent: Phaser.Data.DataManager,
    key: string,
    data: GameGate
  ) {
    if (
      key === GAME_GATE_REGISTRY_ENTRY &&
      Object.keys(data).includes(this.target) &&
      this.switchState !== data[this.target]
    ) {
      this.setSwitchState(data[this.target]);
    }
  }

  private setSwitchState(state: boolean) {
    this.switchState = state;
    const switchTarget = this.target
    const newState = {
      ...this.currentScene.registry.get(GAME_GATE_REGISTRY_ENTRY),
      [switchTarget]: state
    }
    this.setFrame(state ? this.activeFrame : this.inactiveFrame);
    this.currentScene.registry.set(GAME_GATE_REGISTRY_ENTRY, newState);
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
