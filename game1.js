
function loadFont() {
  const font = new FontFace("micky", "url('Micky\ Dicky.ttf')");

  return font.load().then((loadedFont) => {
    document.fonts.add(loadedFont);
  });
}

const canvas = document.getElementById("canvas-id");
const context = canvas.getContext("2d");
let hue = 0;
let exitTrigger = 0;
let originalCoins = [
  [6, 7],
  [9, 2],
  [20, 6],
  [29, 5],
  [35, 7],
  [39, 7],
  [43, 7],
  [46, 7],
  [51, 7],
  [55, 7],
  [58, 2],
  [55, 0],
];
let variableCoins = [
  [6, 7],
  [9, 2],
  [20, 6],
  [29, 5],
  [35, 7],
  [39, 7],
  [43, 7],
  [46, 7],
  [51, 7],
  [55, 7],
  [57, 2],
  [55, 0],
];
canvas.width = canvas.scrollWidth;
canvas.height = canvas.scrollHeight;

const offscreenCanvas = document.createElement("canvas");
const offscreenContext = offscreenCanvas.getContext("2d");
offscreenCanvas.width = canvas.width;
offscreenCanvas.height = canvas.height;

class Player {
  constructor() {
    this.x = 50;
    // sa;
    this.y = 1;
    this.dim = 40;
    this.gravity = 0.8; // Gravity force
    this.playerForceRight = 18.7;
    this.playerForceLeft = 10.1;
    this.velocityX = 0;
    this.velocityY = 0; //vertical Velocity
    this.friction = 0.1;
    this.deathCounter = 0;
  }

  update(matrix, colorMatrix) {
    // Calculate the row and column index of the block beneath the player's feet
    const colIndex = Math.floor(this.x / this.dim);
    const rowIndex = Math.floor((this.y + this.dim) / this.dim);

    if (colorMatrix[colIndex][rowIndex] == "red") {
      this.reset();
      return;
    }
    if (
      matrix[colIndex][rowIndex - 1] == true ||
      matrix[colIndex + 1][rowIndex - 1] == true
    ) {
      this.velocityY = 0;
    }

    // Check if the block beneath the player is solid
    if (
      matrix[colIndex][rowIndex] === true ||
      matrix[colIndex + 1][rowIndex] === true
    ) {
      let blockX = rowIndex * this.dim - this.dim;
      this.velocityY = 0; // Stop the player's vertical velocity
      this.y = blockX; // Snap the player's position to the top of the block
      if (exitTrigger === 0) {
        this.draw(this.x, this.y);
      } // Redraw the player at the new position
      return; // Exit the method
    }

    // Apply gravity to the player
    this.velocityY += this.gravity;
    this.y += this.velocityY;

    // Redraw the player at the updated position
    if (exitTrigger === 0) {
      this.draw(this.x, this.y);
    }
    const index = variableCoins.findIndex(
      (item) =>
        JSON.stringify(item) ===
        JSON.stringify([
          Math.floor(this.x / this.dim),
          Math.floor(this.y / this.dim),
        ])
    );
    if (index !== -1) {
      variableCoins.splice(index, 1);
    }
  }
  moveLeft(matrix, colorMatrix) {
    let colIndex = Math.floor((this.x - this.dim) / this.dim);
    let rowIndex = Math.floor(this.y / this.dim);
    if (colorMatrix[colIndex][rowIndex] == "red") {
      this.reset();
      return;
    }
    // Check if the block to the left of the player is solid
    if (
      colIndex < 1 ||
      (matrix[colIndex][rowIndex] === true &&
        colorMatrix[colIndex][rowIndex] === "white")
    ) {
      const blockX = colIndex * this.dim + this.dim;
      this.velocityX = 0; // Stop the player's horizontal velocity
      if(this.x-blockX < 2) this.x = blockX+1.1 // Snap the player's position to the right of the block
      else this.x--;
      if (exitTrigger === 0) {
        this.draw(this.x, this.y);
      } // Redraw the player at the new position
      return; // Exit the method
    }

    this.velocityX -= this.playerForceLeft;
    this.velocityX *= this.friction; // apply friction to the player
    this.x += this.velocityX;

    // Redraw the player at the updated position
    if (exitTrigger === 0) {
      this.draw(this.x, this.y);
    }

    const index = variableCoins.findIndex(
      (item) =>
        JSON.stringify(item) ===
        JSON.stringify([
          Math.floor(this.x / this.dim),
          Math.floor(this.y / this.dim),
        ])
    );
    if (index !== -1) {
      variableCoins.splice(index, 1);
    }
  }

  moveRight(matrix, colorMatrix) {
    let colIndex = Math.floor((this.x + this.dim) / this.dim);
    let rowIndex = Math.floor(this.y / this.dim);
    if (colorMatrix[colIndex][rowIndex] == "red") {
      this.reset();
      return;
    }
    if (colIndex > 59) colIndex = 59;

    // Check if the block beneath the player is solid and has a specific color (wall color)
    if (
      colIndex > 59 ||
      (matrix[colIndex][rowIndex] === true &&
        colorMatrix[colIndex][rowIndex] === "white")
    ) {
      // Calculate the position just before the block
      const blockX = colIndex * this.dim - this.dim;

      // Adjust the player's position based on the block's position and size
      if (this.x + this.dim > blockX) {
        this.x = blockX - 1.1;
        this.velocityX = 0; // Stop the player's horizontal velocity
      }
    } else {
      this.velocityX += this.playerForceRight;
      this.velocityX *= this.friction; // Apply friction to the player
      this.x += this.velocityX;
    }

    // Redraw the player at the updated position
    if (exitTrigger === 0) {
      this.draw(this.x, this.y);
    }

    const index = variableCoins.findIndex(
      (item) =>
        JSON.stringify(item) ===
        JSON.stringify([
          Math.floor(this.x / this.dim),
          Math.floor(this.y / this.dim),
        ])
    );
    if (index !== -1) {
      variableCoins.splice(index, 1);
    }
  }

  jump() {
    this.velocityY = -10;

    this.velocityY += this.gravity;
    this.y += this.velocityY;

    if (exitTrigger === 0) {
      this.draw(this.x, this.y);
    }
    // Redraw the player at the updated position
  }

  draw(i, j) {
    context.fillStyle = `hsl(${hue}, 100%, 50%)`;
    context.beginPath();
    context.moveTo(0, 0);
    context.fillRect(i, j, this.dim, this.dim);
    context.stroke();
    context.fillStyle = `hsl(140, 100%, 50%)`;

    context.beginPath();
    // context.moveTo(0, 0);
    offscreenContext.font = "15px micky";
    context.fillText(`Death Count: ${this.deathCounter}`, 400, 20);
    context.stroke();
  }
  reset() {
    this.x = 60;
    this.y = 0;
    if (exitTrigger === 0) {
      this.draw(this.x, this.y);
    }
    this.deathCounter++;
    variableCoins = originalCoins;
  }
}

//track class
class Track {
  constructor(width, height) {
    this.width = 60;
    this.height = 10;
    this.matrix = [];
    this.colorMatrix = [];
    for (let i = 0; i < this.width; i++) {
      this.matrix[i] = [];
      this.colorMatrix[i] = [];
      for (let j = 0; j < this.height; j++) {
        this.matrix[i][j] = false;
        this.colorMatrix[i][j] = "";
      }
    }
  }
  draw() {
    this.editMatrix(5, 7, true);
    this.editMatrix(5, 6, true);
    this.editMatrix(6, 6, true);
    this.editMatrix(11, 7, true);
    this.editMatrix(12, 7, true);
    this.editMatrix(19, 8, false);
    this.editMatrix(18, 8, false);
    for (let i = 0; i < this.height - 3; i++) {
      this.editMatrix(18, i, true);
      this.editMatrix(19, i, true);
    }
    this.editMatrix(18, 3, false);
    this.editMatrix(19, 3, false);
    this.editMatrix(18, 2, false);
    this.editMatrix(19, 2, false);
    this.editMatrix(21, 5, true);
    this.editMatrix(20, 5, true);
    this.editMatrix(24, 7, true);
    this.editMatrix(24, 6, true);
    this.editMatrix(27, 4, true);
    this.editMatrix(28, 4, true);
    this.editMatrix(29, 4, true);
    this.editMatrix(28, 6, true);
    this.editMatrix(28, 7, true);
    this.editMatrix(28, 5, true);
    for (let i = 30; i < this.width; i += 3) {
      this.editMatrix(i, 8, false);
    }
    for (let i = 30; i < this.width; i++) {
      if (this.matrix[i][8] === false) this.editMatrix(i, 8, true);
      else this.editMatrix(i, 8, false);
    }
    for (let i = 0; i < this.height - 2; i++) {
      this.editMatrix(0, i, true);
    }
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        if (this.matrix[i][j] !== false) {
          placeBlock(i, j, this.colorMatrix);
        }
      }
    }
    for (let i = 0; i < this.width; i++) {
      for (let j = 8; j < 10; j++) {
        if (this.matrix[i][j] == false) {
          placeLavaBlock(i, j, this.colorMatrix);
        }
      }
    }
    for (let j = 0; j < this.height; j++) {
      placeLavaBlock(this.width - 1, j, this.colorMatrix);
    }
  }
  editMatrix(i, j, status) {
    this.matrix[i][j] = status;
  }
}

function placeBlock(i, j, colorMatrix) {
  offscreenContext.fillStyle = "white";
  offscreenContext.beginPath();
  offscreenContext.fillRect(i * 40, j * 40, 40, 40);
  offscreenContext.fill();
  colorMatrix[i][j] = "white";
}
function placeLavaBlock(i, j, colorMatrix) {
  offscreenContext.fillStyle = "#cf1020";
  offscreenContext.beginPath();
  offscreenContext.fillRect(i * 40, j * 40, 40, 40);
  offscreenContext.fill();
  colorMatrix[i][j] = "red";
}
function addText(matrix) {
  offscreenContext.fillStyle = "white";
  offscreenContext.beginPath();
  offscreenContext.font = "30px micky";
  offscreenContext.fillText("[ cybeRRun ]", 60, 40, 300);
  offscreenContext.fillStyle = "#d25852";
  offscreenContext.font = "15px micky";
  offscreenContext.fillText("Refresh or Press R To Restart", 400, 60);
  offscreenContext.moveTo(900, 250);
  offscreenContext.lineTo(750, 335);
  offscreenContext.lineTo(750, 335);
  offscreenContext.lineTo(750, 325);
  offscreenContext.moveTo(750, 335);
  offscreenContext.lineTo(760, 340);
  offscreenContext.lineTo(900, 250);
  offscreenContext.font = "25px micky";
  offscreenContext.fillText("💀", 900, 250, 300);

  offscreenContext.strokeStyle = "red";
  offscreenContext.lineWidth = 2;
  offscreenContext.stroke();
  offscreenContext.fill();
}
function handleCoins() {
  for (let i = 0; i < variableCoins.length; i++) {
    context.fillStyle = "#f3c70d";
    context.beginPath();
    context.arc(
      variableCoins[i][0] * 40 + 20,
      variableCoins[i][1] * 40 + 20,
      15,
      0,
      Math.PI * 2,
      true
    );
    context.fill();
  }
  context.fillStyle = "white";
  context.beginPath();
  context.font = "18px micky";
  context.fillText(`remaining: ${variableCoins.length}`, 2245, 25);
  context.fill();
  if (variableCoins.length == 0) {
    context.fillStyle = "greenyellow";
    context.fillRect(59 * 40, 5 * 40, 40, 40);
    context.fillRect(59 * 40, 4 * 40, 40, 40);
    context.fill();
  }
}

function checkExit() {
  if (
    variableCoins.length == 0 &&
    Math.floor(player1.x / 40) == 57 &&
    (Math.floor(player1.y / 40) == 5 || Math.floor(player1.y / 40) == 4)
  ) {
    exitTrigger = 1;
  }
}

let track = new Track(canvas.width, canvas.height);
for (let i = 0; i < track.width; i++) {
  track.editMatrix(i, 8, true);
}

track.draw();
loadFont().then(() => {
  addText(track.matrix);
});

let player1 = new Player();
player1.draw(60, 0);

function animata() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(offscreenCanvas, 0, 0);
  document
    .getElementById("container-id")
    .scrollTo(player1.x - 40, player1.y - 40);
  player1.update(track.matrix, track.colorMatrix);
  hue += 0.5;
  handleCoins();
  checkExit();
  if (exitTrigger === 0) {
    requestAnimationFrame(animata);
  } else if (exitTrigger === 1) {
    context.fillStyle = "greenyellow";
    player1.x = 60;
    player1.y = 0;
    context.font = "15px micky";
    context.fillText("You Won, Yay!", 400, 40);
    player1.update(track.matrix, track.colorMatrix);

    document
      .getElementById("container-id")
      .scrollTo(player1.x - 40, player1.y - 40);
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
  }
}
animata();

// Keep track of which keys are currently being pressed
const keysPressed = {};
let isJumping = false;

window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);

let actionIntervalId = null;

function handleKeyDown(event) {
  // Ignore repeated keydown events
  if (!keysPressed[event.key]) {
    keysPressed[event.key] = true;
    handleKeys();

    // Start the action timer if not already running
    if (actionIntervalId === null) {
      actionIntervalId = setInterval(handleKeys, 20); // Adjust the interval as needed
    }
  }
}

function handleKeyUp(event) {
  keysPressed[event.key] = false;

  // Clear the action timer if no keys are being pressed
  if (
    actionIntervalId !== null &&
    !Object.values(keysPressed).some((pressed) => pressed)
  ) {
    clearInterval(actionIntervalId);
    actionIntervalId = null;
  }

  // Reset the jumping flag when the jump key is released
  if (event.key === "ArrowUp") {
    isJumping = false;
  }
}

function handleKeys() {
  if (keysPressed["ArrowLeft"]) {
    player1.moveLeft(track.matrix, track.colorMatrix);
  }
  if (keysPressed["ArrowRight"]) {
    player1.moveRight(track.matrix, track.colorMatrix);
  }
  if (keysPressed["ArrowUp"] && !isJumping) {
    player1.jump();
    isJumping = true;
  }
}

window.addEventListener("keydown", restartt);

function restartt(event) {
  if (event.key == "R" || event.key == "r") {
    location.reload();
  }
}
