class Sprite {
  constructor({
    position,
    image,
    frames = { max: 1, hold: 10 },
    sprites,
    rotation = 0,
  }) {
    this.position = position;
    this.image = new Image();
    this.frames = { ...frames, val: 0, elapssed: 0 };

    this.image.onload = () => {
      this.width = this.image.width / this.frames.max;
      this.height = this.image.height;
      console.log(this.width);
      console.log(this.height);
    };
    this.image.src = image.src;
    this.moving = true;
    this.sprites = sprites;
    this.opacity = 1;
    this.rotation = rotation;
  }
  draw() {
    c.save();
    c.translate(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2
    );
    c.rotate(this.rotation);
    c.translate(
      -this.position.x - this.width / 2,
      -this.position.y - this.height / 2
    );
    c.globalAlpha = this.opacity;
    c.drawImage(
      this.image,
      this.frames.val * this.width,
      0,
      this.image.width / this.frames.max,
      this.image.height,
      this.position.x,
      this.position.y,
      this.image.width / this.frames.max,
      this.image.height
    );
    c.restore();

    if (!this.moving) return;
    if (this.frames.max > 1) {
      this.frames.elapssed++;
    }
    if (this.frames.elapssed % this.frames.hold === 0) {
      if (this.frames.val < this.frames.max - 1) this.frames.val++;
      else this.frames.val = 0;
    }
  }
}
class Monster extends Sprite {
  constructor({
    position,
    image,
    frames = { max: 1, hold: 10 },
    sprites,
    rotation = 0,
    isEnemy = false,
    name,
    attacks,
  }) {
    super({ position, image, frames, sprites, rotation });
    this.health = 100;
    this.isEnemy = isEnemy;
    this.name = name;
    this.attacks = attacks;
  }

  faint() {
    document.querySelector(
      "#textExplain"
    ).innerHTML = `${this.name} has fainted!!`;
    gsap.to(this.position, {
      y: this.position.y + 20,
    });
    gsap.to(this, {
      opacity: 0,
    });
    audio.battle.stop();
    audio.victoryCharm.play();
  }
  attack({ attack, recipient, renderedSprites }) {
    document.querySelector("#textExplain").style.display = "block";
    document.querySelector(
      "#textExplain"
    ).innerHTML = `${this.name} used ${attack.name}`;

    let healthBar = "#healthSlider2";
    if (this.isEnemy) healthBar = "#healthSlider4";

    let rotation = 1;
    if (this.isEnemy) rotation = -2.2;

    recipient.health -= attack.damage;

    switch (attack.name) {
      case "Fireball":
        audio.initFireball.play();
        const fireballImage = new Image();
        fireballImage.src = "./Images/fireball.png";
        const fireball = new Sprite({
          position: {
            x: this.position.x,
            y: this.position.y,
          },
          image: fireballImage,
          frames: {
            max: 4,
            hold: 10,
          },
          rotation,
        });
        renderedSprites.splice(1, 0, fireball);

        gsap.to(fireball.position, {
          x: recipient.position.x,
          y: recipient.position.y,
          onComplete: () => {
            audio.fireballHit.play();
            gsap.to(healthBar, {
              width: recipient.health + "%",
            });
            gsap.to(recipient.position, {
              x: recipient.position.x + 10,
              yoyo: true,
              repeat: 5,
              duration: 0.08,
            });
            gsap.to(recipient, {
              opacity: 0,
              repeat: 5,
              yoyo: true,
              duration: 0.08,
            });
            renderedSprites.splice(1, 1);
          },
        });
        break;

      case "Tackle":
        const tl = gsap.timeline();

        let movementDistanceX = 20;
        let movementDistanceY = -20;

        if (this.isEnemy) movementDistanceX = -20;
        tl.to(this.position, {
          x: this.position.x - movementDistanceX,
        })
          .to(this.position, {
            x: this.position.x + movementDistanceX * 2,
            y: this.position.y + movementDistanceY,
            duration: 0.1,
            onComplete: () => {
              audio.tackleHit.play();
              gsap.to(healthBar, {
                width: recipient.health + "%",
              });
              gsap.to(recipient.position, {
                x: recipient.position.x + 10,
                yoyo: true,
                repeat: 5,
                duration: 0.08,
              });
              gsap.to(recipient, {
                opacity: 0,
                repeat: 5,
                yoyo: true,
                duration: 0.08,
              });
            },
          })
          .to(this.position, {
            y: this.position.y,
            duration: 0.1,
          })
          .to(this.position, {
            x: this.position.x,
          });

        break;
    }
  }
}
class Boundary {
  static width = 48;
  static height = 48;
  constructor({ position }) {
    this.position = position;
    this.width = 48;
    this.height = 48;
  }
  draw() {
    c.fillStyle = "rgba(255,0,0,0.0)";
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}
