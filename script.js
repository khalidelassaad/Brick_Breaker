const LOWER_DIMENSION_BOUND = 10;
const UPPER_DIMENSION_BOUND = 55;

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

function initializeArrowKeyListeners(moveSnake) {
  $(document).keydown(function (e) {
    switch (e.which) {
      case 37: //left arrow key
        moveSnake([0, -1]);
        break;
      case 38: //up arrow key
        moveSnake([-1, 0]);
        break;
      case 39: //right arrow key
        moveSnake([0, 1]);
        break;
      case 40: //bottom arrow key
        moveSnake([1, 0]);
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
  const size = getRandomInt(LOWER_DIMENSION_BOUND, UPPER_DIMENSION_BOUND);
  const grid = generateEmptyGrid(size);

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
    // snake cell: ⬛
    // fruit cell: 🟩

    let buildString = "Score: " + currentScore + "<br>";
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
    $("body").html(buildString);
  }

  function moveSnake(direction) {
    // takes grid, currentSnakeCoords, and a direction, transforms grid if the move is possible
    // direction is either [0,-1] left, [0, 1] right, [-1, 0] up, [1, 0] down
    let newSnakeCoords = [
      currentSnakeCoordsQueue[0][0] + direction[0],
      currentSnakeCoordsQueue[0][1] + direction[1],
    ];

    if (doesCoordsListContainCoords(currentSnakeCoordsQueue, newSnakeCoords)) {
      // we ran into ourselves, GAME OVER
      // disable event listeners
      $(document).unbind("keydown");
      // display gameover!
      $("body").append("GAME OVER!");
      return;
    }

    if (
      newSnakeCoords[0] < 0 ||
      newSnakeCoords[0] > size - 1 ||
      newSnakeCoords[1] < 0 ||
      newSnakeCoords[1] > size - 1
    ) {
      // We've tried to leave the grid, do nothing
      return;
    }

    currentSnakeCoordsQueue.unshift(newSnakeCoords);
    grid[newSnakeCoords[0]][newSnakeCoords[1]] = 1;

    if (isSameCoords(newSnakeCoords, currentFruitCoords)) {
      generateNewFruit();
      currentScore++;
    } else {
      const newlyEmptiedCell = currentSnakeCoordsQueue.pop();
      grid[newlyEmptiedCell[0]][newlyEmptiedCell[1]] = 0;
    }

    render(grid);
  }

  let currentSnakeCoordsQueue = [generateRandomCoords()];
  let currentFruitCoords = generateRandomFruitCoords();
  let currentScore = 0;

  insertItemInGrid(grid, currentSnakeCoordsQueue[0], 1);
  insertItemInGrid(grid, currentFruitCoords, 2);

  initializeArrowKeyListeners(moveSnake);

  render(grid);
}

runGame();
