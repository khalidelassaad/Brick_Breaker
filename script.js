// author: khalidelassaad.com

const GLOBAL_SIZE = 11;
const TICK_TIME_MS = 200;

function generateEmptyGrid(size) {
  let grid = [];
  for (let i = 0; i < size; i++) {
    grid.push([...Array(size)].map((x) => 0));
  }

  return grid;
}

function getRandomInt(lowerBound, upperBound) {
  return Math.floor(Math.random() * (upperBound - lowerBound + 1)) + lowerBound;
}

function insertItemInGrid(grid, coords, item) {
  grid[coords[0]][coords[1]] = item;
}

function isSameCoords(coords1, coords2) {
  return coords1[0] === coords2[0] && coords1[1] === coords2[1];
}

function doesCoordsListContainCoords(coordsList, coords) {
  return coordsList.reduce((prevBool, currentCoords) => {
    return prevBool || isSameCoords(currentCoords, coords);
  }, false);
}

function runGame() {
  const size = GLOBAL_SIZE;

  function generateRandomCoords() {
    return [getRandomInt(0, size - 1), getRandomInt(0, size - 1)];
  }

  function generateRandomFruitCoords() {
    let coords = generateRandomCoords();
    while (doesCoordsListContainCoords(currentSnakeCoordsQueue, coords)) {
      coords = generateRandomCoords();
    }
    return coords;
  }

  function generateNewFruit() {
    currentFruitCoords = generateRandomFruitCoords();
    insertItemInGrid(grid, currentFruitCoords, 2);
  }

  function scoresRenderString() {
    return `<div class="scores-container">
      <span class="score">Score: ${currentScore}</span>
      <span class="hi-score"> Hi-Score: ${hiScore}</span>
    </div>`;
  }

  function gameRenderString(grid) {
    let buildString = "";

    buildString += '<div class="game-container">';
    for (const rowList of grid) {
      for (const value of rowList) {
        if (value === 0) {
          buildString += "⬜";
        } else if (value === 1) {
          buildString += "⬛";
        } else if (value === 2) {
          buildString += "🟩";
        }
      }
      buildString += "<br>";
    }
    buildString += "</div>";

    return buildString;
  }

  function gameOverRenderString() {
    return `<div class="game-over-container">
      <h1>GAME OVER!</h1>
      <span>Press any key to retry...</span>
    </div>`;
  }

  function gameTitleRenderString() {
    return `<div class="game-title-container">
    <span>S</span><span class="greentext">naked</span>
    <span> 'n' </span>
    <span class="redtext">Short</span>!
    </div>`;
  }

  function render(grid) {
    // empty grid: ⬜
    // snake cell: ⬛
    // fruit cell: 🟩

    let buildString = "";
    buildString += gameTitleRenderString();
    buildString += gameRenderString(grid);
    buildString += scoresRenderString();
    if (isGameOver) {
      buildString += gameOverRenderString();
    }
    $("body").html(buildString);
  }

  function initializeArrowKeyListenersForGame(moveSnake, resetGame) {
    $(document).keydown(function (e) {
      switch (e.which) {
        case 37: // left arrow key
        case 65: // a key
          nextDirection = [0, -1];
          break;
        case 38: // up arrow key
        case 87: // w key
          nextDirection = [-1, 0];
          break;
        case 39: // right arrow key
        case 68: // d key
          nextDirection = [0, 1];
          break;
        case 40: // bottom arrow key
        case 83: // s key
          nextDirection = [1, 0];
          break;
        case 82: // r key
          resetGame();
          break;
      }
    });
  }

  function displayGameOver() {
    isGameOver = true;
    render(grid);
  }

  function handleGameOver(moveSnake, resetGame) {
    displayGameOver();
    $(document).unbind("keydown");
    $(document).keydown(function (e) {
      $(document).unbind("keydown");
      resetGame();
      initializeArrowKeyListenersForGame(moveSnake, resetGame);
    });
  }

  function noLeaveGridGuard(newSnakeCoords) {
    // guard against leaving the grid, do nothing
    if (
      newSnakeCoords[0] < 0 ||
      newSnakeCoords[0] > size - 1 ||
      newSnakeCoords[1] < 0 ||
      newSnakeCoords[1] > size - 1
    ) {
      return true;
    }

    return false;
  }

  function noMoveBackwardsGuard(direction) {
    // guard against moving back the way we came, do nothing
    if (currentSnakeCoordsQueue.length > 1) {
      previousSegment = currentSnakeCoordsQueue[0];
      previousDirection = [
        currentSnakeCoordsQueue[1][0] - currentSnakeCoordsQueue[0][0],
        currentSnakeCoordsQueue[1][1] - currentSnakeCoordsQueue[0][1],
      ];
      didWeReverseDirection =
        previousDirection[0] == direction[0] &&
        previousDirection[1] == direction[1];
      if (didWeReverseDirection) {
        return true;
      }
    }
  }

  function gameOverGuard(newSnakeCoords) {
    // guard against running into ourselves -- GAME OVER
    if (doesCoordsListContainCoords(currentSnakeCoordsQueue, newSnakeCoords)) {
      handleGameOver(moveSnake, resetGame);
      return true;
    }
  }

  function moveSnake(direction) {
    // takes grid, currentSnakeCoords, and a direction, transforms grid if the move is possible
    // direction is either [0,-1] left, [0, 1] right, [-1, 0] up, [1, 0] down
    let newSnakeCoords = [
      currentSnakeCoordsQueue[0][0] + direction[0],
      currentSnakeCoordsQueue[0][1] + direction[1],
    ];

    if (noLeaveGridGuard(newSnakeCoords)) {
      return false;
    }

    if (noMoveBackwardsGuard(direction)) {
      // keep moving in previous direction
      direction = [
        currentSnakeCoordsQueue[0][0] - currentSnakeCoordsQueue[1][0],
        currentSnakeCoordsQueue[0][1] - currentSnakeCoordsQueue[1][1],
      ];
      moveSnake(direction);
      return false;
    }

    if (gameOverGuard(newSnakeCoords)) {
      return true;
    }

    currentSnakeCoordsQueue.unshift(newSnakeCoords);
    grid[newSnakeCoords[0]][newSnakeCoords[1]] = 1;

    if (isSameCoords(newSnakeCoords, currentFruitCoords)) {
      generateNewFruit();
      currentScore++;
      if (currentScore > hiScore) {
        hiScore = currentScore;
      }
    } else {
      const newlyEmptiedCell = currentSnakeCoordsQueue.pop();
      grid[newlyEmptiedCell[0]][newlyEmptiedCell[1]] = 0;
    }

    render(grid);

    return false;
  }

  function startMainLoop() {
    mainLoopTimeout = setTimeout(() => {
      if (!moveSnake(nextDirection)) {
        startMainLoop();
      }
    }, TICK_TIME_MS);
  }

  function resetGame() {
    clearTimeout(mainLoopTimeout);
    mainLoopTimeout = null;

    grid = generateEmptyGrid(size);
    currentSnakeCoordsQueue = [generateRandomCoords()];
    currentFruitCoords = generateRandomFruitCoords();
    currentScore = 0;
    nextDirection = [0, 1];
    isGameOver = false;

    insertItemInGrid(grid, currentSnakeCoordsQueue[0], 1);
    insertItemInGrid(grid, currentFruitCoords, 2);

    render(grid);
    startMainLoop();
  }

  let grid = generateEmptyGrid(size);
  let currentSnakeCoordsQueue = [generateRandomCoords()];
  let currentFruitCoords = generateRandomFruitCoords();
  let currentScore = 0;
  let nextDirection = [0, 1];
  let mainLoopTimeout = null;
  let isGameOver = false;

  let hiScore = 0;

  insertItemInGrid(grid, currentSnakeCoordsQueue[0], 1);
  insertItemInGrid(grid, currentFruitCoords, 2);

  initializeArrowKeyListenersForGame(moveSnake, resetGame);

  render(grid);
  startMainLoop();
}

runGame();
