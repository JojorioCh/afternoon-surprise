const fightBackgroundImage = new Image();
fightBackgroundImage.src = "./Images/battleBackground.png";
const fightBackground = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  image: fightBackgroundImage,
});

let littleWorm;
let tinyEmber;
let renderedSprites;
let battleAnimationId;
let queue;

function initBattle() {
  document.querySelector("#userInterface").style.display = "block";
  document.querySelector("#textExplain").style.display = "none";
  document.querySelector("#healthSlider2").style.width = "100%";
  document.querySelector("#healthSlider4").style.width = "100%";
  document.querySelector("#attackButtons").replaceChildren();

  littleWorm = new Monster(monsters.littleWorm);
  tinyEmber = new Monster(monsters.tinyEmber);
  renderedSprites = [littleWorm, tinyEmber];
  queue = [];

  tinyEmber.attacks.forEach((attack) => {
    const button = document.createElement("button");
    button.innerHTML = attack.name;
    document.querySelector("#attackButtons").append(button);
  });
  document.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", (e) => {
      const selectedAttacks = attacks[e.currentTarget.innerHTML];
      tinyEmber.attack({
        attack: selectedAttacks,
        recipient: littleWorm,
        renderedSprites,
      });
      if (littleWorm.health <= 0) {
        queue.push(() => {
          littleWorm.faint();
        });
        queue.push(() => {
          gsap.to("#screen", {
            opacity: 1,
            onComplete: () => {
              cancelAnimationFrame(battleAnimationId);
              animate();
              document.querySelector("#userInterface").style.display = "none";

              gsap.to("#screen", { opacity: 0 });
              battle.initiated = false;
              audio.Map.play();
            },
          });
        });
      }
      const randomAttack =
        littleWorm.attacks[
          Math.floor(Math.random() * littleWorm.attacks.length)
        ];
      queue.push(() => {
        littleWorm.attack({
          attack: randomAttack,
          recipient: tinyEmber,
          renderedSprites,
        });
        if (tinyEmber.health <= 0) {
          queue.push(() => {
            tinyEmber.faint();
          });
          queue.push(() => {
            gsap.to("#screen", {
              opacity: 1,
              onComplete: () => {
                cancelAnimationFrame(battleAnimationId);
                animate();
                document.querySelector("#userInterface").style.display = "none";

                gsap.to("#screen", { opacity: 0 });
                battle.initiated = false;
                audio.Map.play();
              },
            });
          });
        }
      });
    });
    button.addEventListener("mouseenter", (e) => {
      const selectedAttacks = attacks[e.currentTarget.innerHTML];
      document.querySelector("#attackType").innerHTML = selectedAttacks.type;
      document.querySelector("#attackType").style.color = selectedAttacks.color;
    });
  });
}

function animateFight() {
  battleAnimationId = window.requestAnimationFrame(animateFight);
  fightBackground.draw();

  console.log(battleAnimationId);

  renderedSprites.forEach((sprite) => {
    sprite.draw();
  });
}
animate();
// initBattle();
// animateFight();

document.querySelector("#textExplain").addEventListener("click", (e) => {
  if (queue.length > 0) {
    queue[0]();
    queue.shift();
  } else e.currentTarget.style.display = "none";
});
