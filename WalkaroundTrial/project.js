const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

const collisionsMap = [];
for (let i = 0; i < collisions.length; i += 70) {
  collisionsMap.push(collisions.slice(i, 70 + i));
}

const fightTimeMap = [];
for (let i = 0; i < fightTimeData.length; i += 70) {
  fightTimeMap.push(fightTimeData.slice(i, 70 + i));
}

const boundaries = [];
const offset = {
  x: -700,
  y: -570,
};

collisionsMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 1025)
      boundaries.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y,
          },
        })
      );
  });
});

const fightTime = [];
fightTimeMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 1025)
      fightTime.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y,
          },
        })
      );
  });
});

const image = new Image();
image.src = "images/Poke_Style.png";

const foreImage = new Image();
foreImage.src = "images/ForegroundObj.png";

const playerSpriteDown = new Image();
playerSpriteDown.src = "images/playerDown.png";
const playerSpriteUp = new Image();
playerSpriteUp.src = "images/playerUp.png";
const playerSpriteLeft = new Image();
playerSpriteLeft.src = "images/playerLeft.png";
const playerSpriteRight = new Image();
playerSpriteRight.src = "images/playerRight.png";

const player = new Sprite({
  position: {
    x: canvas.width / 2 - 192 / 2,
    y: canvas.height / 2 - 68 / 2,
  },
  image: playerSpriteDown,
  frames: {
    max: 4,
    hold: 10,
  },
  sprites: {
    up: playerSpriteUp,
    left: playerSpriteLeft,
    right: playerSpriteRight,
    down: playerSpriteDown,
  },
});

const background = new Sprite({
  position: {
    x: offset.x,
    y: offset.y,
  },
  image: image,
});

const foreground = new Sprite({
  position: {
    x: offset.x,
    y: offset.y,
  },
  image: foreImage,
});

const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
};

const movables = [background, ...boundaries, foreground, ...fightTime];

function rectangularCollision({ rectangle1, rectangle2 }) {
  return (
    rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
    rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
    rectangle1.position.y + rectangle1.height >= rectangle2.position.y &&
    rectangle1.position.y <= rectangle2.position.y + rectangle2.height
  );
}

const battle = {
  initiated: false,
};

function animate() {
  const animationID = window.requestAnimationFrame(animate);
  background.draw();
  boundaries.forEach((boundary) => {
    boundary.draw();
  });
  fightTime.forEach((fightTime) => {
    fightTime.draw();
  });
  player.draw();
  foreground.draw();

  let moving = true;
  player.moving = false;

  if (battle.initiated) return;
  // how battle is initiated. added maths and using the data from the json files to get the random battles started.
  if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
    for (let i = 0; i < fightTime.length; i++) {
      const fightBringIt = fightTime[i];
      const overLappingArea =
        (Math.min(
          player.position.x + player.width,
          fightBringIt.position.x + fightBringIt.width
        ) -
          Math.max(player.position.x, fightBringIt.position.x)) *
        (Math.min(
          player.position.y + player.height,
          fightBringIt.position.y + fightBringIt.height
        ) -
          Math.max(player.position.y, fightBringIt.position.y));
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: fightBringIt,
        }) &&
        overLappingArea > (player.width * player.height) / 2 &&
        Math.random() < 0.01
      ) {
        window.cancelAnimationFrame(animationID);
        audio.Map.stop();
        audio.initBattle.play();
        audio.battle.play();

        battle.initiated = true;
        gsap.to("#screen", {
          opacity: 1,
          repeat: 3,
          yoyo: true,
          duration: 0.4,
          onComplete() {
            gsap.to("#screen", {
              opacity: 1,
              duration: 0.4,
              onComplete() {
                initBattle();
                animateFight();
                gsap.to("#screen", {
                  opacity: 0,
                  duration: 0.4,
                });
              },
            });
          },
        });
        break;
      }
    }
  }

  if (keys.w.pressed && lastKey === "w") {
    player.moving = true;
    player.image = player.sprites.up;
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: { x: boundary.position.x, y: boundary.position.y + 3 },
          },
        })
      ) {
        moving = false;
        break;
      }
    }

    if (moving)
      movables.forEach((movable) => {
        movable.position.y += 3;
      });
  } else if (keys.a.pressed && lastKey === "a") {
    player.moving = true;
    player.image = player.sprites.left;

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: { x: boundary.position.x + 3, y: boundary.position.y },
          },
        })
      ) {
        moving = false;
        break;
      }
    }
    if (moving)
      movables.forEach((movable) => {
        movable.position.x += 3;
      });
    player.moving = true;
  } else if (keys.s.pressed && lastKey === "s") {
    player.moving = true;
    player.image = player.sprites.down;

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: { x: boundary.position.x, y: boundary.position.y - 3 },
          },
        })
      ) {
        moving = false;
        break;
      }
    }
    if (moving)
      movables.forEach((movable) => {
        movable.position.y -= 3;
      });
  } else if (keys.d.pressed && lastKey === "d") {
    player.moving = true;
    player.image = player.sprites.right;
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x - 3,
              y: boundary.position.y,
            },
          },
        })
      ) {
        moving = false;
        break;
      }
    }
    if (moving)
      movables.forEach((movable) => {
        movable.position.x -= 3;
      });
  }
}

let lastKey = "";
window.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "w":
      keys.w.pressed = true;
      lastKey = "w";
      break;
    case "a":
      keys.a.pressed = true;
      lastKey = "a";
      break;
    case "s":
      keys.s.pressed = true;
      lastKey = "s";
      break;
    case "d":
      keys.d.pressed = true;
      lastKey = "d";
      break;
  }
});

window.addEventListener("keyup", (e) => {
  switch (e.key) {
    case "w":
      keys.w.pressed = false;
      break;
    case "a":
      keys.a.pressed = false;
      break;
    case "s":
      keys.s.pressed = false;
      break;
    case "d":
      keys.d.pressed = false;
      break;
  }
});
let clicked = false;
addEventListener("click", () => {
  if (!clicked) {
    audio.Map.play();
    clicked = true;
  }
});
