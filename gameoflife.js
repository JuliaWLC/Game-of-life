const unitLength = 20;
let boxColor = 0;
let stableLifeColor = 0;
let strokeColor = 50;
let columns; /* To be determined by window width */
let rows; /* To be determined by window height */
let currentBoard; // array of number (0 or 1) -> array of object
let nextBoard;
let lifeCounterArr;
let stopFlag = true;
let underPopulation = 2;
let overPopulation = 3;
let reproduction = 3;
let selectedPattern = null;

// querySelector
let resetBtn = document.querySelector("#reset-game");
let gameControl = document.querySelector("#game-control");
let randomBtn = document.querySelector("#random");
let color = document.querySelector("#colorInput");
let stableColor = document.querySelector("#stableColorInput");
let fpsRange = document.querySelector("#fpsRange");
let aBtn = document.querySelector("#underPopulation");
let bBtn = document.querySelector("#overPopulation");
let cBtn = document.querySelector("#reproduction");
let body = document.body;
let colorMode = document.querySelector(".color-mode");
let darkButton = document.querySelector(".dark-button");
let lightButton = document.querySelector(".light-button");
let c = document.querySelector("#canvas");
let patternSelect = document.querySelector("#patternSelect");
let cursorBtn = document.querySelector("#cursor-control");

const cursorObj = {
  isActive: false,
  x: 0,
  y: 0,
  direction: {
    UP: 87,
    LEFT: 65,
    DOWN: 83,
    RIGHT: 68,
    DROP: 76,
  },
};

function setup() {
  let gameBoard = select(".gameBoard");

  /* Set the canvas to be under the element #canvas*/
  const canvas = createCanvas(gameBoard.width, gameBoard.height);
  canvas.parent(document.querySelector("#canvas"));

  /*Calculate the number of columns and rows */
  columns = floor(width / unitLength);
  rows = floor(height / unitLength);

  /* Making both currentBoard and nextBoard 2-dimensional matrix that has (columns * rows) boxes. */
  currentBoard = [];
  nextBoard = [];
  lifeCounterArr = [];
  for (let i = 0; i < columns; i++) {
    currentBoard[i] = [];
    nextBoard[i] = [];
    lifeCounterArr[i] = [];
  }

  // Now both currentBoard and nextBoard are array of array of undefined values.
  initBoard(); // Set the initial values of the currentBoard and nextBoard
}

/**
 * Initialize/reset the board state
 */

function initBoard() {
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      currentBoard[i][j] = 0;
      nextBoard[i][j] = 0;
      lifeCounterArr[i][j] = 0;
    }
  }
}

// boxColor <= 10
// > 10 && <= 20 -> boxColor + 155 * (0.3)
// > 20 && <= 30 -> boxColor + 155 * (0.5)
// > 30 -> boxColor + 155

function drawBoard() {
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      if (currentBoard[i][j] == 1) {
        //Darken colors for stable life
        // if (nextBoard[i][j] == 1) {
        //   fill(stableLifeColor);
        // } else {
        //   fill(boxColor);
        // }
        if (lifeCounterArr[i][j] <= 10) {
          fill(boxColor);
        } else if (lifeCounterArr[i][j] <= 20) {
          fill(boxColor + 155 * 0.3);
        } else if (lifeCounterArr[i][j] <= 30) {
          fill(boxColor + 155 * 0.5);
        } else {
          fill(stableLifeColor);
        }
      } else {
        fill(174, 156, 143);
      }
      stroke(242, 232, 225);
      rect(i * unitLength, j * unitLength, unitLength, unitLength);
    }
  }
}

function drawCursor() {
  if (!cursorObj.isActive) {
    return;
  }
  const x = cursorObj.x;
  const y = cursorObj.y;
  fill("#515151");
  stroke(242, 232, 225);
  rect(x * unitLength, y * unitLength, unitLength, unitLength);
}

function draw() {
  background(174, 156, 143);
  stroke(242, 232, 225);
  if (!stopFlag) {
    generate();
  }
  drawBoard();
  drawCursor();
}

function generate() {
  //Loop over every single box on the board
  for (let x = 0; x < columns; x++) {
    for (let y = 0; y < rows; y++) {
      // Count all living members in the Moore neighborhood(8 boxes surrounding)
      let neighbors = 0;
      for (let i of [-1, 0, 1]) {
        for (let j of [-1, 0, 1]) {
          if (i == 0 && j == 0) {
            // the cell itself is not its own neighbor
            continue;
          }
          // The modulo operator is crucial for wrapping on the edge
          neighbors +=
            currentBoard[(x + i + columns) % columns][(y + j + rows) % rows];
        }
      }

      // Rules of Life
      if (currentBoard[x][y] == 1 && neighbors < underPopulation) {
        // Die of Loneliness
        nextBoard[x][y] = 0;
      } else if (currentBoard[x][y] == 1 && neighbors > overPopulation) {
        // Die of Overpopulation
        nextBoard[x][y] = 0;
      } else if (currentBoard[x][y] == 0 && neighbors == reproduction) {
        // New life due to Reproduction
        nextBoard[x][y] = 1;
      } else {
        // Stasis
        nextBoard[x][y] = currentBoard[x][y];
      }

      if (nextBoard[x][y] === 1) {
        lifeCounterArr[x][y] += 1;
      } else {
        lifeCounterArr[x][y] = 0;
      }
    }
  }

  // Swap the nextBoard to be the current Board
  [currentBoard, nextBoard] = [nextBoard, currentBoard];
}

/**
 * When mouse is dragged
 */
function mouseDragged() {
  /**
   * If the mouse coordinate is outside the board
   */
  if (mouseX > unitLength * columns || mouseY > unitLength * rows) {
    return;
  }
  const x = Math.floor(mouseX / unitLength);
  const y = Math.floor(mouseY / unitLength);
  currentBoard[x][y] = 1;
  fill(boxColor);
  stroke(242, 232, 225);
  rect(x * unitLength, y * unitLength, unitLength, unitLength);
}

// chosen by the color-picker
colorInput.addEventListener("click", () => {
  boxColor = colorInput.value;
});

/**
 * When mouse is pressed
 */
function mousePressed() {
  if (mouseX > unitLength * columns || mouseY > unitLength * rows) {
    return;
  }
  if (selectedPattern) {
    console.log("selectedPattern");
    const x = Math.floor(mouseX / unitLength);
    const y = Math.floor(mouseY / unitLength);
    for (let i = 0; i < selectedPattern.length; i++) {
      // row
      for (let j = 0; j < selectedPattern[0].length; j++) {
        // column
        currentBoard[j + x][i + y] = +(selectedPattern[i][j] === "O");
      }
    }
    stopFlag = true;
    gameControl.innerHTML = "Start";
    selectedPattern = null;
    return;
  }
  stopFlag = true;
  gameControl.innerHTML = "Start";
  mouseDragged();
}

/**
 * When mouse is released
 */
// function mouseReleased() {
//   if (!stopFlag) {
//     loop();
//   }
// }

//reset the game

resetBtn.addEventListener("click", function () {
  initBoard();
  stopFlag = true;
  gameControl.innerHTML = "Start";
});

//start/pause the game

gameControl.addEventListener("click", function () {
  if (!stopFlag) {
    gameControl.innerHTML = "Start";
    stopFlag = true;
  } else {
    stopFlag = false;
    gameControl.innerHTML = "Pause";
  }
});

//speed control
function onChangeFrameRate(frameRate) {
  setFrameRate(parseInt(frameRate)); //framerate
  stopFlag = false;
  gameControl.innerHTML = "Pause";
}

//rules of survival
//change rules of reproduction
aBtn.addEventListener("change", (event) => {
  let result = event.target.value;
  underPopulation = parseInt(result);
});

bBtn.addEventListener("change", (event) => {
  let result = event.target.value;
  overPopulation = parseInt(result);
});

cBtn.addEventListener("change", (event) => {
  let result = event.target.value;
  reproduction = parseInt(result);
});

stableColorInput.addEventListener("change", () => {
  stableLifeColor = stableColorInput.value;
});

//Switching between different styles
function changeMode() {
  body.classList.toggle("dark-mode");
  lightButton.classList.toggle("invisible");
  darkButton.classList.toggle("invisible");
}

body.addEventListener("click", (event) => {
  // let inCanvas = event.target.getAttribute("id");
  // if (inCanvas !== null) {
  //   notInCanvas = false;
  // } else {
  //   notInCanvas = true;
  // }
});

//Random initial states
randomBtn.addEventListener("click", function () {
  stopFlag = false;
  gameControl.innerHTML = "Pause";

  for (let x = 0; x < columns; x++) {
    for (let y = 0; y < rows; y++) {
      currentBoard[x][y] = Math.random() < 0.3 ? 1 : 0;
    }
  }
});

color.addEventListener("change", (events) => {
  boxColor = events.target.value;
});

fpsRange.addEventListener("change", (events) => {
  onChangeFrameRate(events.target.value);
});

//Resize board on windows resize (Check out windowsResized())
window.onresize = () => {
  setup();
};

// [x] multiple colors of life on the same board

// [x] Well-known patterns of Game of Life to select from (Examples: Gosper Glider Gun, Glider, Lightweight train)

// Use Keyboard to control the cursor to place the life

let htmlStr = `<option selected>Pattern</option>`;
for (let patternName in patterns) {
  htmlStr += `<option value="${patternName}">${patternName}</option>;`;
}
patternSelect.innerHTML = htmlStr;

patternSelect.addEventListener("change", function (e) {
  // const pattern = patterns[e.target.value].split("\n");
  // for (let i = 0; i < pattern.length; i++) {
  //   // row
  //   for (let j = 0; j < pattern[0].length; j++) {
  //     // column
  //     currentBoard[j][i] = +(pattern[i][j] === "O");
  //   }
  // }
  // drawBoard();
  selectedPattern = patterns[e.target.value].split("\n");
});

// function mouseMoved() {
//   /**
//    * If the mouse coordinate is outside the board
//    */
//   if (mouseX > unitLength * columns || mouseY > unitLength * rows) {
//     return;
//   }
//   const x = Math.floor(mouseX / unitLength);
//   const y = Math.floor(mouseY / unitLength);
//   fill("#eee");
//   stroke(242, 232, 225);
//   rect(x * unitLength, y * unitLength, unitLength, unitLength);

//   setTimeout(() => {
//     // fill(174, 156, 143);
//     // stroke(242, 232, 225);
//     // rect(x * unitLength, y * unitLength, unitLength, unitLength);
//     drawBoard();
//   }, 500);
// }

cursorBtn.addEventListener("click", function (e) {
  const btn = e.target;
  if (cursorObj.isActive) {
    cursorObj.isActive = false;
    btn.textContent = "Start Cursor";
  } else {
    cursorObj.isActive = true;
    btn.textContent = "Stop Cursor";
  }
});

function keyPressed() {
  if (!cursorObj.isActive) {
    return;
  }
  let xChange = 0;
  let yChange = 0;
  switch (keyCode) {
    case cursorObj.direction.UP:
      yChange -= 1;
      break;
    case cursorObj.direction.DOWN:
      yChange += 1;
      break;
    case cursorObj.direction.LEFT:
      xChange -= 1;
      break;
    case cursorObj.direction.RIGHT:
      xChange += 1;
      break;
    case cursorObj.direction.DROP:
      currentBoard[cursorObj.x][cursorObj.y] = 1;
      break;
  }
  cursorObj.x = (cursorObj.x + xChange + columns) % columns;
  cursorObj.y = (cursorObj.y + yChange + rows) % rows;
}
