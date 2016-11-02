const SHEEP_CHANCE = 4;

function pickSquareType() {
  let number = Math.floor(Math.random() * SHEEP_CHANCE) + 1;
  if (number === 1) {
    return SheepSquare;
  } else {
    return GrassSquare;
  }
}
function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}

class GridOfSquares {
  constructor(height, width) {
    this.height = height;
    this.width = width;

    this.isFirstStep = true;

    this.currentExplorationCounter = 0;

    this.rows = [];
    this.squares = [];

    for (let y = 0; y < height; y++) {
      let row = [];

      for (let x = 0; x < width; x++) {
        let squareType = pickSquareType();
        let square = new squareType(this, x, y, this.squares.length + 1);

        row.push(square);
        this.squares.push(square);
      }

      this.rows.push(row);
    }
  }

  getSquareAt([x, y]) {
    try {
      return this.rows[y][x];
    } catch (e) {
      return undefined;
    }
  }

  countSheepSquaresAdjacentTo(square) {
    let sheepCount = 0;

    for (let directionCombo of SHEEP_LOOKUP_DIRECTIONS) {

      let coords = [square.x, square.y];

      for (let letter of directionCombo) {
        coords = DIRECTION_MOVEMENTS[letter](coords);
      }

      let adjacentSquare = this.getSquareAt(coords);

      if (adjacentSquare instanceof SheepSquare) {
        sheepCount += 1;
      }
    }
    return sheepCount;
  }
}

class Square {
  constructor(grid, x, y, key) {
    this.key = key;
    this.grid = grid;
    this.x = x;
    this.y = y;
    this.exposed = false;

    this.expose = this.expose.bind(this);
  }

  expose() {
    if (!this.exposed) {
      this.exposed = true;
      return this.handleExposure();
    } else {
      return;
    }
  }
}

class GrassSquare extends Square {
  get type() {
    return '🌱';
  }
  handleExposure() {
    let adjacentSheep = this.grid.countSheepSquaresAdjacentTo(this);

    // Chances, increasing likelihood
    let doubtedly = Math.floor(Math.random() * 4) === 0;
    let luckily = Math.floor(Math.random() * 2) === 0;
    let somewhatLikely = Math.floor(Math.random() * 3) !== 0;
    let likely = Math.floor(Math.random() * 9) !== 0;

    let surelyOnFirstClick = this.grid.isFirstStep;
    let surelyWithoutSheep = adjacentSheep === 0;
    let likelyWithFewSheep = likely && adjacentSheep < 2;
    let probablyWithSomeSheep = luckily && adjacentSheep >= 2 && adjacentSheep < 4;
    let maybeWithManySheep = luckily && adjacentSheep >= 4 && adjacentSheep < 5;
    let unlikelyWithTonsOfSheep = luckily && adjacentSheep >= 5 && adjacentSheep < 8;

    let shouldExplore = (
      surelyOnFirstClick ||
      surelyWithoutSheep ||
      likelyWithFewSheep ||
      probablyWithSomeSheep ||
      maybeWithManySheep ||
      unlikelyWithTonsOfSheep);

    if (shouldExplore) {
      let directions = GRASS_EXPLORATION_DIRECTIONS.slice();
      shuffle(directions);
      for (let directionCombo of directions) {
        let explored = exploreGrass(directionCombo, this, this.grid);
        this.grid.isFirstStep = false;
      }
    }
  }
}

class SheepSquare extends Square {
  get type() {
    return '🐑';
  }
  handleExposure() {
    for (let square of this.grid.squares) {
      if (square instanceof SheepSquare) {
        square.expose();
      }
    }
  }
}

// Automatic grass exploration

function exploreGrass(inDirection, fromSquare, ofGrid) {
  let coords = [fromSquare.x, fromSquare.y];

  for (let letter of inDirection) {
    coords = DIRECTION_MOVEMENTS[letter](coords);
  }

  let nextSquare = ofGrid.getSquareAt(coords);
  if (!nextSquare || nextSquare.exposed) {
    return false;
  }

  if (nextSquare instanceof SheepSquare) {
    return false;
  }

  //let shouldExpose = ofGrid.isFirstStep || ofGrid.currentExplorationCounter < 15;

  //ofGrid.currentExplorationCounter += 1;

  //if (shouldExpose) {
    nextSquare.expose();
  //}

  return true;

  /*
  if (ofGrid.countSheepSquaresAdjacentTo(nextSquare) < 4) {
    return;
  } else {
    return;
  }
  */
}

const SHEEP_LOOKUP_DIRECTIONS = new Set([
  'NW',
  'N',
  'NE',
  'E',
  'SE',
  'S',
  'SW',
  'W',
]);

const GRASS_EXPLORATION_DIRECTIONS = [
  'N',
  'E',
  'S',
  'W',
];

const DIRECTION_MOVEMENTS = {
  'E': ([x, y]) => [x + 1, y],
  'S': ([x, y]) => [x, y + 1],
  'W': ([x, y]) => [x - 1, y],
  'N': ([x, y]) => [x, y - 1],
};

export default GridOfSquares;