import * as Phaser from "phaser";

export default class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Container;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private bullets!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private powerups!: Phaser.Physics.Arcade.Group;
  private score: number = 0;
  private health: number = 100;
  private scoreText!: Phaser.GameObjects.Text;
  private healthText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private lastFired: number = 0;
  private fireRate: number = 150;
  private wave: number = 1;
  private enemiesInWave: number = 5;
  private enemiesDefeated: number = 0;
  private enemiesSpawned: number = 0;
  private playerSpeed: number = 300;
  private hasShield: boolean = false;
  private shieldGraphics!: Phaser.GameObjects.Arc;
  private stars!: Phaser.GameObjects.Particles.ParticleEmitter;
  private gameOver: boolean = false;
  private isMobile: boolean = false;
  private pointer: Phaser.Input.Pointer | null = null;

  constructor() {
    super({ key: "GameScene" });
  }

  create() {
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    // Star background
    this.createStarfield();

    // Create player
    this.createPlayer();

    // Create groups
    this.bullets = this.physics.add.group({
      classType: Phaser.GameObjects.Rectangle,
      runChildUpdate: true,
    });

    this.enemies = this.physics.add.group();
    this.powerups = this.physics.add.group();

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasdKeys = {
      up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.spaceKey = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    // Mobile controls
    if (this.isMobile) {
      this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
        this.pointer = pointer;
      });
      this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
        this.pointer = pointer;
      });
    }

    // UI
    this.createUI();

    // Collisions
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.hitEnemy as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitPlayer as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.powerups,
      this.collectPowerup as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    // Start first wave
    this.spawnWave();

    // ESC to exit
    this.input.keyboard!.on("keydown-ESC", () => {
      const onExit = this.game.registry.get("onExit");
      if (onExit) onExit();
    });
  }

  createStarfield() {
    this.stars = this.add.particles(0, 0, "white", {
      x: { min: 0, max: this.scale.width },
      y: -10,
      lifespan: 4000,
      speedY: { min: 50, max: 200 },
      scale: { start: 0.5, end: 1.5 },
      alpha: { start: 0.8, end: 0.2 },
      frequency: 100,
      blendMode: "ADD",
    });
  }

  createPlayer() {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height - 100;

    // Create player ship with distinctive arrow/spaceship design
    this.player = this.add.container(centerX, centerY);

    // Main body (triangle pointing up)
    const triangle = this.add.triangle(0, 0, -15, 20, 15, 20, 0, -20, 0x00f3ff);
    triangle.setStrokeStyle(2, 0x00ffff, 1);

    // Cockpit highlight
    const cockpit = this.add.circle(0, 0, 5, 0x00ffff, 0.8);

    // Wings
    const leftWing = this.add.triangle(-10, 10, -5, 0, -15, 10, -10, 15, 0x0099cc);
    leftWing.setStrokeStyle(1, 0x00f3ff, 0.8);
    const rightWing = this.add.triangle(10, 10, 5, 0, 15, 10, 10, 15, 0x0099cc);
    rightWing.setStrokeStyle(1, 0x00f3ff, 0.8);

    // Engine glow
    const engineGlow = this.add.ellipse(0, 20, 12, 8, 0x00ff88, 0.6);

    this.player.add([leftWing, rightWing, triangle, engineGlow, cockpit]);

    this.physics.add.existing(this.player);
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    playerBody.setCollideWorldBounds(true);
    playerBody.setSize(30, 40);
    playerBody.setOffset(-15, -20);

    // Shield graphics (hidden initially)
    this.shieldGraphics = this.add.circle(centerX, centerY, 40, 0x00ff88, 0.3);
    this.shieldGraphics.setStrokeStyle(2, 0x00ff88, 0.8);
    this.shieldGraphics.setVisible(false);
    this.shieldGraphics.setDepth(50);
  }

  createUI() {
    // Score
    this.scoreText = this.add.text(20, 20, "Score: 0", {
      fontSize: "24px",
      color: "#00f3ff",
      fontStyle: "bold",
    });
    this.scoreText.setScrollFactor(0);
    this.scoreText.setDepth(100);

    // Health
    this.healthText = this.add.text(20, 50, "Health: 100", {
      fontSize: "24px",
      color: "#00ff88",
      fontStyle: "bold",
    });
    this.healthText.setScrollFactor(0);
    this.healthText.setDepth(100);

    // Wave
    this.waveText = this.add.text(
      this.scale.width - 20,
      20,
      "Wave: 1",
      {
        fontSize: "24px",
        color: "#ff006e",
        fontStyle: "bold",
      }
    );
    this.waveText.setOrigin(1, 0);
    this.waveText.setScrollFactor(0);
    this.waveText.setDepth(100);

    // Mobile controls hint
    if (this.isMobile) {
      const hint = this.add.text(
        this.scale.width / 2,
        this.scale.height - 30,
        "Touch and drag to move • Auto-fire active",
        {
          fontSize: "16px",
          color: "#8b5cf6",
        }
      );
      hint.setOrigin(0.5);
      hint.setScrollFactor(0);
      hint.setDepth(100);
    }
  }

  update(time: number) {
    if (this.gameOver) return;

    // Player movement
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0);

    if (this.isMobile && this.pointer && this.pointer.isDown) {
      // Mobile touch controls
      const dx = this.pointer.x - this.player.x;
      const dy = this.pointer.y - this.player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 20) {
        body.setVelocity(
          (dx / distance) * this.playerSpeed,
          (dy / distance) * this.playerSpeed
        );
      }
    } else {
      // Keyboard controls
      if (this.cursors.left.isDown || this.wasdKeys.left.isDown) {
        body.setVelocityX(-this.playerSpeed);
      } else if (this.cursors.right.isDown || this.wasdKeys.right.isDown) {
        body.setVelocityX(this.playerSpeed);
      }

      if (this.cursors.up.isDown || this.wasdKeys.up.isDown) {
        body.setVelocityY(-this.playerSpeed);
      } else if (this.cursors.down.isDown || this.wasdKeys.down.isDown) {
        body.setVelocityY(this.playerSpeed);
      }
    }

    // Auto-fire continuously (no button press needed)
    if (time > this.lastFired + this.fireRate) {
      this.fireBullet();
      this.lastFired = time;
    }

    // Update shield position
    if (this.hasShield) {
      this.shieldGraphics.setPosition(this.player.x, this.player.y);
    }

    // Clean up off-screen bullets
    this.bullets.children.each((bullet: Phaser.GameObjects.GameObject) => {
      const b = bullet as Phaser.GameObjects.Rectangle;
      if (b.y < -10) {
        b.destroy();
      }
      return true;
    });

    // Clean up off-screen enemies (count as escaped)
    this.enemies.children.each((enemy: Phaser.GameObjects.GameObject) => {
      const e = enemy as Phaser.GameObjects.Container;
      if (e.y > this.scale.height + 50) {
        this.enemiesDefeated++; // Count escaped enemies
        e.destroy();
      }
      return true;
    });

    // Check if wave is complete (all enemies spawned and accounted for)
    if (
      this.enemiesSpawned >= this.enemiesInWave &&
      this.enemiesDefeated >= this.enemiesInWave
    ) {
      this.nextWave();
    }
  }

  fireBullet() {
    const bullet = this.add.rectangle(
      this.player.x,
      this.player.y - 20,
      4,
      15,
      0xff006e
    );
    this.bullets.add(bullet);
    this.physics.add.existing(bullet);

    const bulletBody = bullet.body as Phaser.Physics.Arcade.Body;
    bulletBody.setVelocityY(-500);

    // Add glow effect
    bullet.setStrokeStyle(2, 0xff006e, 0.8);

    // Particle trail
    const emitter = this.add.particles(bullet.x, bullet.y, "white", {
      speed: 20,
      scale: { start: 0.5, end: 0 },
      blendMode: "ADD",
      lifespan: 200,
      tint: 0xff006e,
    });

    emitter.startFollow(bullet);
  }

  spawnWave() {
    this.enemiesDefeated = 0;
    this.enemiesSpawned = 0;
    this.enemiesInWave = 5 + this.wave * 2;

    for (let i = 0; i < this.enemiesInWave; i++) {
      this.time.delayedCall(i * 500, () => {
        if (!this.gameOver) {
          this.spawnEnemy();
        }
      });
    }

    // Show wave text
    const waveAnnouncement = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
      `Wave ${this.wave}`,
      {
        fontSize: "64px",
        color: "#ff006e",
        fontStyle: "bold",
      }
    );
    waveAnnouncement.setOrigin(0.5);
    waveAnnouncement.setDepth(200);

    this.tweens.add({
      targets: waveAnnouncement,
      alpha: 0,
      scale: 2,
      duration: 2000,
      onComplete: () => waveAnnouncement.destroy(),
    });
  }

  spawnEnemy() {
    this.enemiesSpawned++;
    const x = Phaser.Math.Between(50, this.scale.width - 50);
    const y = -50;

    const enemyType = Phaser.Math.Between(1, 3);
    let enemy: Phaser.GameObjects.Container;
    let speed: number;
    let color: number;
    let accentColor: number;
    let health: number;
    let size: number;

    enemy = this.add.container(x, y);

    switch (enemyType) {
      case 1: // Fast, weak - Small triangle pointing down (RED)
        color = 0xff006e;
        accentColor = 0xff3399;
        speed = 150 + this.wave * 10;
        health = 1;
        size = 20;

        const smallTri = this.add.triangle(0, 0, -12, -12, 12, -12, 0, 12, color);
        smallTri.setStrokeStyle(2, accentColor, 1);
        const smallCore = this.add.circle(0, 0, 4, accentColor);
        enemy.add([smallTri, smallCore]);
        break;

      case 2: // Medium - Pentagon (PURPLE)
        color = 0x8b5cf6;
        accentColor = 0xb794f6;
        speed = 100 + this.wave * 8;
        health = 2;
        size = 25;

        const pentagon = this.add.polygon(0, 0, [
          0, -15, 14, -5, 9, 12, -9, 12, -14, -5
        ], color);
        pentagon.setStrokeStyle(2, accentColor, 1);
        const medCore1 = this.add.circle(0, 0, 5, accentColor, 0.8);
        const medCore2 = this.add.circle(0, 0, 3, 0xffffff, 0.6);
        enemy.add([pentagon, medCore1, medCore2]);
        break;

      case 3: // Slow, strong - Hexagon (ORANGE/YELLOW)
        color = 0xff9500;
        accentColor = 0xffbb33;
        speed = 70 + this.wave * 5;
        health = 3;
        size = 30;

        const hexagon = this.add.polygon(0, 0, [
          0, -18, 16, -9, 16, 9, 0, 18, -16, 9, -16, -9
        ], color);
        hexagon.setStrokeStyle(2, accentColor, 1);
        const heavyCore = this.add.circle(0, 0, 6, accentColor);
        const heavyInner = this.add.polygon(0, 0, [
          0, -8, 7, -4, 7, 4, 0, 8, -7, 4, -7, -4
        ], 0xffdd66, 0.8);
        enemy.add([hexagon, heavyCore, heavyInner]);
        break;

      default:
        color = 0xff006e;
        accentColor = 0xff3399;
        speed = 100;
        health = 1;
        size = 20;

        const defaultTri = this.add.triangle(0, 0, -12, -12, 12, -12, 0, 12, color);
        defaultTri.setStrokeStyle(2, accentColor, 1);
        enemy.add([defaultTri]);
    }

    enemy.setData("health", health);
    enemy.setData("maxHealth", health);
    enemy.setData("enemyType", enemyType);

    this.enemies.add(enemy);
    this.physics.add.existing(enemy);

    const enemyBody = enemy.body as Phaser.Physics.Arcade.Body;
    enemyBody.setVelocityY(speed);
    enemyBody.setSize(size, size);
    enemyBody.setOffset(-size / 2, -size / 2);

    // Add sine wave movement for variety (50% chance)
    if (Phaser.Math.Between(0, 1) === 1) {
      this.tweens.add({
        targets: enemy,
        x: x + Phaser.Math.Between(-100, 100),
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }

    // Pulse animation for visual interest
    this.tweens.add({
      targets: enemy,
      angle: Phaser.Math.Between(0, 1) === 1 ? 360 : -360,
      duration: 3000 + Phaser.Math.Between(-500, 500),
      repeat: -1,
      ease: "Linear",
    });
  }

  hitEnemy(
    bullet: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    const bulletObj = bullet as Phaser.GameObjects.Rectangle;
    const enemyObj = enemy as Phaser.GameObjects.Container;

    bulletObj.destroy();

    const health = enemyObj.getData("health") - 1;
    enemyObj.setData("health", health);

    if (health <= 0) {
      // Enemy destroyed
      this.score += 10 * this.wave;
      this.scoreText.setText(`Score: ${this.score}`);
      this.enemiesDefeated++;

      // Get enemy type for color
      const enemyType = enemyObj.getData("enemyType") || 1;
      const colors = [0xff006e, 0x8b5cf6, 0xff9500];

      // Explosion effect
      this.createExplosion(enemyObj.x, enemyObj.y, colors[enemyType - 1]);

      // Chance to drop powerup
      if (Phaser.Math.Between(1, 100) <= 15) {
        this.spawnPowerup(enemyObj.x, enemyObj.y);
      }

      enemyObj.destroy();
    } else {
      // Flash enemy to show damage
      this.tweens.add({
        targets: enemyObj,
        alpha: 0.5,
        duration: 100,
        yoyo: true,
      });
    }
  }

  hitPlayer(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    const enemyObj = enemy as Phaser.GameObjects.Container;

    if (this.hasShield) {
      // Shield absorbs hit
      this.hasShield = false;
      this.shieldGraphics.setVisible(false);
      this.enemiesDefeated++; // Count as defeated
      enemyObj.destroy();
      return;
    }

    this.health -= 20;
    this.healthText.setText(`Health: ${this.health}`);

    // Flash player
    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 3,
    });

    this.enemiesDefeated++; // Count as defeated
    enemyObj.destroy();

    if (this.health <= 0) {
      this.endGame();
    }
  }

  collectPowerup(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    powerup: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    const powerupObj = powerup as Phaser.GameObjects.Container;
    const type = powerupObj.getData("type");

    switch (type) {
      case "shield":
        this.hasShield = true;
        this.shieldGraphics.setVisible(true);
        this.showPowerupText("Shield Active!");
        break;
      case "speed":
        this.playerSpeed = 450;
        this.showPowerupText("Speed Boost!");
        this.time.delayedCall(5000, () => {
          this.playerSpeed = 300;
        });
        break;
      case "weapon":
        const oldFireRate = this.fireRate;
        this.fireRate = 75;
        this.showPowerupText("Rapid Fire!");
        this.time.delayedCall(5000, () => {
          this.fireRate = oldFireRate;
        });
        break;
    }

    powerupObj.destroy();
  }

  spawnPowerup(x: number, y: number) {
    const types = ["shield", "speed", "weapon"];
    const colors = [0x00ff88, 0x00f3ff, 0xff006e];
    const typeIndex = Phaser.Math.Between(0, 2);

    const container = this.add.container(x, y);
    const powerup = this.add.circle(0, 0, 15, colors[typeIndex]);
    const ring = this.add.circle(0, 0, 20, colors[typeIndex], 0);
    ring.setStrokeStyle(2, colors[typeIndex], 0.8);

    container.add([powerup, ring]);
    container.setData("type", types[typeIndex]);

    this.powerups.add(container);
    this.physics.add.existing(container);

    const containerBody = container.body as Phaser.Physics.Arcade.Body;
    containerBody.setVelocityY(100);
    containerBody.setCircle(15);

    // Pulse animation
    this.tweens.add({
      targets: ring,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 1000,
      repeat: -1,
    });
  }

  showPowerupText(text: string) {
    const powerupText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 - 50,
      text,
      {
        fontSize: "32px",
        color: "#00ff88",
        fontStyle: "bold",
      }
    );
    powerupText.setOrigin(0.5);
    powerupText.setDepth(200);

    this.tweens.add({
      targets: powerupText,
      y: this.scale.height / 2 - 100,
      alpha: 0,
      duration: 1500,
      onComplete: () => powerupText.destroy(),
    });
  }

  createExplosion(x: number, y: number, color: number) {
    const particles = this.add.particles(x, y, "white", {
      speed: { min: 100, max: 300 },
      scale: { start: 1, end: 0 },
      blendMode: "ADD",
      lifespan: 500,
      quantity: 20,
      tint: color,
    });

    this.time.delayedCall(500, () => {
      particles.destroy();
    });
  }

  nextWave() {
    this.wave++;
    this.waveText.setText(`Wave: ${this.wave}`);

    // Bonus health for completing wave
    this.health = Math.min(100, this.health + 10);
    this.healthText.setText(`Health: ${this.health}`);

    this.time.delayedCall(2000, () => {
      this.spawnWave();
    });
  }

  endGame() {
    this.gameOver = true;

    // Stop all movements
    this.physics.pause();

    // Game over text
    const gameOverText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 - 50,
      "GAME OVER",
      {
        fontSize: "64px",
        color: "#ff006e",
        fontStyle: "bold",
      }
    );
    gameOverText.setOrigin(0.5);
    gameOverText.setDepth(200);

    const finalScoreText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 + 30,
      `Final Score: ${this.score}`,
      {
        fontSize: "32px",
        color: "#00f3ff",
        fontStyle: "bold",
      }
    );
    finalScoreText.setOrigin(0.5);
    finalScoreText.setDepth(200);

    const restartText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 + 100,
      "Press ESC to return to menu",
      {
        fontSize: "24px",
        color: "#8b5cf6",
      }
    );
    restartText.setOrigin(0.5);
    restartText.setDepth(200);
  }
}
