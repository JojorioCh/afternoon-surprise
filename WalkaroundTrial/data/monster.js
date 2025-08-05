const monsters = {
  tinyEmber: {
    position: {
      x: 280,
      y: 325,
    },
    image: { src: "images/embySprite.png" },
    frames: {
      max: 4,
      hold: 15,
    },
    name: "Tiny Ember",
    attacks: [attacks.Tackle, attacks.Fireball],
  },
  littleWorm: {
    position: {
      x: 800,
      y: 100,
    },
    image: { src: "images/draggleSprite.png" },
    frames: {
      max: 4,
      hold: 30,
    },
    isEnemy: true,
    name: "little Worm",
    attacks: [attacks.Tackle, attacks.Fireball],
  },
};
