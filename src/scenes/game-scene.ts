import AnimatedTiles from 'phaser-animated-tiles/src/plugin/main';
import { Box } from '../objects/box';
import { Brick } from '../objects/brick';
import { Collectible } from '../objects/collectible';
import { Goomba } from '../objects/goomba';
import { Mario } from '../objects/mario';
import { Platform } from '../objects/platform';
import { Portal } from '../objects/portal';
import { Gate } from '../objects/gate';
import { Switch } from '../objects/switch';

export class GameScene extends Phaser.Scene {
  private animatedTiles!: AnimatedTiles;

  // tilemap
  private map: Phaser.Tilemaps.Tilemap;
  private tileset: Phaser.Tilemaps.Tileset;
  private backgroundLayer: Phaser.Tilemaps.TilemapLayer;
  private foregroundLayer: Phaser.Tilemaps.TilemapLayer;
  private decorationLayer: Phaser.Tilemaps.TilemapLayer;

  // game objects
  private boxes: Phaser.GameObjects.Group;
  private bricks: Phaser.GameObjects.Group;
  private collectibles: Phaser.GameObjects.Group;
  private gates: Phaser.GameObjects.Group;
  private switches: Phaser.GameObjects.Group;
  private enemies: Phaser.GameObjects.Group;
  private platforms: Phaser.GameObjects.Group;
  private player: Mario;
  private portals: Phaser.GameObjects.Group;

  constructor() {
    super({
      key: 'GameScene'
    });
  }

  init(): void {}

  create(): void {
    // *****************************************************************
    // SETUP TILEMAP
    // *****************************************************************

    // create our tilemap from Tiled JSON
    this.map = this.make.tilemap({ key: this.registry.get('level') });
    // add our tileset and layers to our tilemap
    this.tileset = this.map.addTilesetImage('tiles');
    this.backgroundLayer = this.map.createLayer(
      'backgroundLayer',
      this.tileset,
      0,
      0
    );

    this.foregroundLayer = this.map.createLayer(
      'foregroundLayer',
      this.tileset,
      0,
      0
    );
    this.foregroundLayer.setName('foregroundLayer');

    // decorationLayer
    this.decorationLayer = this.map.createLayer(
      'decorationLayer',
      this.tileset,
      0,
      0
    );
    this.decorationLayer.setName('decorationLayer');

    // set collision for tiles with the property collide set to true
    this.foregroundLayer.setCollisionByProperty({ collide: true });

    this.decorationLayer.setCollisionByProperty({ collide: true });

    // *****************************************************************
    // GAME OBJECTS
    // *****************************************************************
    this.portals = this.add.group({
      /*classType: Portal,*/
      runChildUpdate: true
    });

    this.boxes = this.add.group({
      /*classType: Box,*/
      runChildUpdate: true
    });

    this.bricks = this.add.group({
      /*classType: Brick,*/
      runChildUpdate: true
    });

    this.collectibles = this.add.group({
      /*classType: Collectible,*/
      runChildUpdate: true
    });

    this.gates = this.add.group({
      /*classType: Gate,*/
      runChildUpdate: true
    });

    this.switches = this.add.group({
      /*classType: Switch,*/
      runChildUpdate: true
    });

    this.enemies = this.add.group({
      runChildUpdate: true
    });

    this.platforms = this.add.group({
      /*classType: Platform,*/
      runChildUpdate: true
    });

    this.loadObjectsFromTilemap();

    // *****************************************************************
    // COLLIDERS
    // *****************************************************************
    this.physics.add.collider(this.player, this.foregroundLayer);
    this.physics.add.collider(this.enemies, this.foregroundLayer);
    this.physics.add.collider(this.player, this.decorationLayer);
    this.physics.add.collider(this.enemies, this.decorationLayer);
    this.physics.add.collider(this.enemies, this.boxes);
    this.physics.add.collider(this.enemies, this.bricks);
    this.physics.add.collider(this.player, this.bricks);

    this.physics.add.collider(
      this.player,
      this.boxes,
      this.playerHitBox,
      null,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handlePlayerEnemyOverlap,
      null,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.portals,
      this.handlePlayerPortalOverlap,
      null,
      this
    );

    this.physics.add.collider(
      this.player,
      this.platforms,
      this.handlePlayerOnPlatform,
      null,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.collectibles,
      this.handlePlayerCollectiblesOverlap,
      null,
      this
    );

    this.physics.add.collider(
      this.player,
      this.gates,
    );

    this.physics.add.overlap(
      this.player,
      this.switches,
      this.handlePlayerSwitchOverlap,
      null,
      this
    )

    // *****************************************************************
    // CAMERA
    // *****************************************************************
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );

    // init animated tiles
    this.animatedTiles.init(this.map);
  }

  update(): void {
    this.player.update();
  }

  private loadObjectsFromTilemap(): void {
    // get the object layer in the tilemap named 'objects'
    const objects = this.map.getObjectLayer('objects').objects as any[];

    objects.forEach((object) => {
      // reduce object from an array to a single object
      const objectProps: {[key: string]: any} = object.properties ? object.properties.reduce((obj: {[key: string]: any}, item: {name: string, type: string, value: string}) => {
        obj[item.name] = item.value
        return obj;
      }, {} as {[key: string]: any}) : {};

      if (object.type === 'portal') {
        this.portals.add(
          new Portal({
            scene: this,
            x: object.x,
            y: object.y,
            height: object.width,
            width: object.height,
            spawn: {
              x: objectProps.marioSpawnX,
              y: objectProps.marioSpawnY,
              dir: objectProps.direction
            }
          }).setName(object.name)
        );
      }

      if (object.type === 'player') {
        this.player = new Mario({
          scene: this,
          x: this.registry.get('spawn').x, // object.x,
          y: this.registry.get('spawn').y, //object.y,
          texture: 'mario'
        });
      }

      if (object.type === 'goomba') {
        this.enemies.add(
          new Goomba({
            scene: this,
            x: object.x,
            y: object.y,
            texture: 'goomba'
          })
        );
      }

      if (object.type === 'brick') {
        this.bricks.add(
          new Brick({
            scene: this,
            x: object.x,
            y: object.y,
            texture: 'brick',
            value: 50
          })
        );
      }

      if (object.type === 'box') {
        this.boxes.add(
          new Box({
            scene: this,
            content: objectProps.content,
            x: object.x,
            y: object.y,
            texture: 'box'
          })
        );
      }

      if (object.type === 'collectible') {
        this.collectibles.add(
          new Collectible({
            scene: this,
            x: object.x,
            y: object.y,
            texture: objectProps.kindOfCollectible,
            points: 100
          })
        );
      }

      if (object.type === 'gate') {
        this.gates.add(
          new Gate({
            scene: this,
            x: object.x,
            y: object.y,
            invert: objectProps.invert,
            texture: objectProps.gateType,
            tag: object.name
          })
        )
      }

      if (object.type === 'switch') {
        this.switches.add(
          new Switch({
            scene: this,
            x: object.x,
            y: object.y,
            texture: 'switch',
            target: objectProps.target,
            activeFrame: 1,
            inactiveFrame: 0,
            invert: objectProps.invert
          })
        )
      }

      if (object.type === 'platformMovingUpAndDown') {
        this.platforms.add(
          new Platform({
            scene: this,
            x: object.x,
            y: object.y,
            texture: 'platform',
            tweenProps: {
              y: {
                value: 50,
                duration: 1500,
                ease: 'Power0'
              }
            }
          })
        );
      }

      if (object.type === 'platformMovingLeftAndRight') {
        this.platforms.add(
          new Platform({
            scene: this,
            x: object.x,
            y: object.y,
            texture: 'platform',
            tweenProps: {
              x: {
                value: object.x + 50,
                duration: 1200,
                ease: 'Power0'
              }
            }
          })
        );
      }
    });
  }

  private handlePlayerSwitchOverlap(_player: Mario, _switch: Switch): void {
    if (_player.getKeys().get('DOWN').isDown) {
      _switch.toggleSwitch();
    }
  }

  /**
   * Player <-> Enemy Overlap
   * @param _player [Mario]
   * @param _enemy  [Enemy]
   */
  private handlePlayerEnemyOverlap(_player: Mario, _enemy: Goomba): void {
    if (_player.body.touching.down && _enemy.body.touching.up) {
      // player hit enemy on top
      _player.bounceUpAfterHitEnemyOnHead();
      _enemy.gotHitOnHead();
      this.add.tween({
        targets: _enemy,
        props: { alpha: 0 },
        duration: 1000,
        ease: 'Power0',
        yoyo: false,
        onComplete: function () {
          _enemy.isDead();
        }
      });
    } else {
      // player got hit from the side or on the head
      if (_player.getVulnerable()) {
        _player.gotHit();
      }
    }
  }

  /**
   * Player <-> Box Collision
   * @param _player [Mario]
   * @param _box    [Box]
   */
  private playerHitBox(_player: Mario, _box: Box): void {
    if (_box.body.touching.down && _box.active) {
      // ok, mario has really hit a box on the downside
      _box.yoyoTheBoxUpAndDown();
      this.collectibles.add(_box.spawnBoxContent());

      switch (_box.getBoxContentString()) {
        // have a look what is inside the box! Christmas time!
        case 'coin': {
          _box.tweenBoxContent({ y: _box.y - 40, alpha: 0 }, 700, function () {
            _box.getContent().destroy();
          });

          _box.addCoinAndScore(1, 100);
          break;
        }
        case 'rotatingCoin': {
          _box.tweenBoxContent({ y: _box.y - 40, alpha: 0 }, 700, function () {
            _box.getContent().destroy();
          });

          _box.addCoinAndScore(1, 100);
          break;
        }
        case 'flower': {
          _box.tweenBoxContent({ y: _box.y - 8 }, 200, function () {
            _box.getContent().anims.play('flower');
          });

          break;
        }
        case 'mushroom': {
          _box.popUpCollectible();
          break;
        }
        case 'star': {
          _box.popUpCollectible();
          break;
        }
        default: {
          break;
        }
      }
      _box.startHitTimeline();
    }
  }

  private handlePlayerPortalOverlap(_player: Mario, _portal: Portal): void {
    if (
      (_player.getKeys().get('DOWN').isDown &&
        _portal.getPortalDestination().dir === 'down') ||
      (_player.getKeys().get('RIGHT').isDown &&
        _portal.getPortalDestination().dir === 'right') ||
      (_player.getKeys().get('LEFT').isDown &&
        _portal.getPortalDestination().dir === 'left') ||
        _portal.getPortalDestination().dir === 'none'
    ) {
      // set new level and new destination for mario
      this.registry.set('level', _portal.name);
      this.registry.set('spawn', {
        x: _portal.getPortalDestination().x,
        y: _portal.getPortalDestination().y,
        dir: _portal.getPortalDestination().dir
      });

      // set world
      const levelStr = RegExp(/level(\d+)/).exec(_portal.name)
      const roomStr = RegExp(/room(\d+)/).exec(_portal.name)
      this.registry.set('world', `${levelStr ? levelStr[1].toString() : '0'}-${roomStr ? roomStr[1].toString() : '0'}`)

      // restart the game scene
      this.scene.restart();
    } else if (_portal.name === 'exit') {
      this.scene.stop('GameScene');
      this.scene.stop('HUDScene');
      this.scene.start('MenuScene');
    }
  }

  private handlePlayerCollectiblesOverlap(
    _player: Mario,
    _collectible: Collectible
  ): void {
    switch (_collectible.texture.key) {
      case 'flower': {
        break;
      }
      case 'mushroom': {
        _player.growMario();
        break;
      }
      case 'star': {
        break;
      }
      default: {
        break;
      }
    }
    _collectible.collected();
  }

  // TODO!!!
  private handlePlayerOnPlatform(player: Mario, platform: Platform): void {
    if (
      platform.body.moves &&
      platform.body.touching.up &&
      player.body.touching.down
    ) {
      //
    }
  }
}
