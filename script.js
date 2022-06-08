const GLOBAL_SIZE = 3;

// TODO: implement hi score
// TODO: center text
// TODO: style scoring
// TODO: style game over!
// TODO: fix bug with long snake going around edges
// TODO: implement keypress direction save and ticking movement
// TODO: handle any key press

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

function initializeArrowKeyListeners(moveSnake, resetGame) {
  $(document).keydown(function (e) {
    switch (e.which) {
      case 37: // left arrow key
      case 65: // a key
        moveSnake([0, -1]);
        break;
      case 38: // up arrow key
      case 87: // w key
        moveSnake([-1, 0]);
        break;
      case 39: // right arrow key
      case 68: // d key
        moveSnake([0, 1]);
        break;
      case 40: // bottom arrow key
      case 83: // s key
        moveSnake([1, 0]);
        break;
      case 82: // r key
        resetGame();
        break;
    }
  });
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

  function render(grid) {
    // empty grid: ⬜
    // snake cell: 🟪
    // fruit cell: 🟩

    let buildString = `\
    <div class="scores-container">
      <span class="score">Score: ${currentScore}</span>
      <span class="hi-score"> Hi-Score: ${hiScore}</span>
    </div>`;

    buildString += '<div class="game-container"><br>';
    for (const rowList of grid) {
      for (const value of rowList) {
        if (value === 0) {
          buildString += "⬜";
        } else if (value === 1) {
          buildString += "🟪";
        } else if (value === 2) {
          buildString += "🟩";
        }
      }
      buildString += "<br>";
    }
    buildString += "</div>";
    $("body").html(buildString);
  }

  function moveSnake(direction) {
    // takes grid, currentSnakeCoords, and a direction, transforms grid if the move is possible
    // direction is either [0,-1] left, [0, 1] right, [-1, 0] up, [1, 0] down
    let newSnakeCoords = [
      currentSnakeCoordsQueue[0][0] + direction[0],
      currentSnakeCoordsQueue[0][1] + direction[1],
    ];

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
        return;
      }
    }

    // guard against running into ourselves -- GAME OVER
    if (doesCoordsListContainCoords(currentSnakeCoordsQueue, newSnakeCoords)) {
      $("body").append("GAME OVER!");
      return;
    }

    // guard against leaving the grid, do nothing
    if (
      newSnakeCoords[0] < 0 ||
      newSnakeCoords[0] > size - 1 ||
      newSnakeCoords[1] < 0 ||
      newSnakeCoords[1] > size - 1
    ) {
      return;
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
  }

  function resetGame() {
    grid = generateEmptyGrid(size);
    currentSnakeCoordsQueue = [generateRandomCoords()];
    currentFruitCoords = generateRandomFruitCoords();
    currentScore = 0;

    insertItemInGrid(grid, currentSnakeCoordsQueue[0], 1);
    insertItemInGrid(grid, currentFruitCoords, 2);

    render(grid);
  }

  let grid = generateEmptyGrid(size);
  let currentSnakeCoordsQueue = [generateRandomCoords()];
  let currentFruitCoords = generateRandomFruitCoords();
  let currentScore = 0;
  let hiScore = 0;

  insertItemInGrid(grid, currentSnakeCoordsQueue[0], 1);
  insertItemInGrid(grid, currentFruitCoords, 2);

  initializeArrowKeyListeners(moveSnake, resetGame);

  render(grid);
}

runGame();
