const unitLength = 20;
let boxColor = "#000000";
let stableLifeColor = "";
let strokeColor = 50;
let columns; /* To be determined by window width */
let rows; /* To be determined by window height */
let currentBoard;
let nextBoard;
let stopFlag = true;
let underPopulation = 2;
let overPopulation = 3;
let reproduction = 3;

// querySelector
let reset = document.querySelector("#reset-game");
let gameControl = document.querySelector("#game-control");
let random = document.querySelector("#random");
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
// let notInCanvas = "false";

function setup() {
  let gameBoard = select(".gameBoard");

  /* Set the canvas to be under the element #canvas*/
  const canvas = createCanvas(gameBoard.width, gameBoard.height);
  canvas.parent(document.querySelector("#canvas"));

  /*Calculate the number of columns and rows */
  columns = floor(width / unitLength);
  rows = floor(height / unitLength);
  // columns = 5;
  // rows = 5;

  /*Making both currentBoard and nextBoard 2-dimensional matrix that has (columns * rows) boxes. */
  currentBoard = [];
  nextBoard = [];
  for (let i = 0; i < columns; i++) {
    currentBoard[i] = [];
    nextBoard[i] = [];
  }

  // Now both currentBoard and nextBoard are array of array of undefined values.
  init(); // Set the initial values of the currentBoard and nextBoard
  // noLoop();
}

/**
 * Initialize/reset the board state
 */

function init() {
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      currentBoard[i][j] = 0;
      nextBoard[i][j] = 0;
    }
  }

  //Random initial states
  random.addEventListener("click", function () {
    stopFlag = false;
    gameControl.innerHTML = "pause";

    for (let x = 0; x < columns; x++) {
      for (let y = 0; y < rows; y++) {
        // currentBoard[x][y] = Math.random() > 0.7 ? 1 : 0;
        currentBoard[x][y] = Math.random() < 0.3 ? 1 : 0;

        // console.log("check exact ", currentBoard[x][y]);
        // // console.log("check big exact", currentBoard);
      }
    }

    loop();

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
    loop();
  };
}

function draw() {
  background(174, 156, 143);
  stroke(242, 232, 225);
  generate();
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      if (currentBoard[i][j] == 1) {
        //Darken colors for stable life
        if (nextBoard[i][j] == 1) {
          fill(stableLifeColor);
        } else {
          fill(boxColor);
        }
      } else {
        fill(174, 156, 143);
      }
      stroke(242, 232, 225);
      rect(i * unitLength, j * unitLength, unitLength, unitLength);
    }
  }
    
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
  // chosen by the color-picker
  colorInput.addEventListener("click", () => {
    boxColor = colorInput.value;
  });
}
/**
 * When mouse is pressed
 */
function mousePressed() {
  noLoop();
  mouseDragged();
}


/**
 * When mouse is released
 */
// function mouseReleased() {
//   if (stopFlag == false) {
//     loop();
//   }
// }

//reset the game

reset.addEventListener("click", function () {
  init();
  stopFlag = true;
  loop();
  gameControl.innerHTML = "start";
});

//start/pause the game

gameControl.addEventListener("click", function () {
  if (stopFlag == false) {
    noLoop();
    gameControl.innerHTML = "start";
    stopFlag = true;
  } else {
    loop();
    stopFlag = false;
    gameControl.innerHTML = "pause";
  }
});

//speed control
function onChangeFrameRate(frameRate) {
  setFrameRate(parseInt(frameRate)); //framerate
  stopFlag = false;
  gameControl.innerHTML = "pause";
  loop();
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
  // colorMode.innerHTML = "bright-mode";
}

body.addEventListener("click", (event) => {
  let inCanvas = event.target.getAttribute("id");
  if (inCanvas !== null) {
    notInCanvas = false;
  } else {
    notInCanvas = true;
  }
});


//multiple colors of life on the same board

//Well-known patterns of Game of Life to select from (Examples: Gosper Glider Gun, Glider, Lightweight train)

//Use Keyboard to control the cursor to place the life

