// Tetrominos shapes
export const TETROMINOS = {
  0: { shape: [[0]], color: "0" },
  I: {
    shape: [
      [0, 0, 0, 0],
      ["I", "I", "I", "I"],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: "I",
  },
  J: {
    shape: [
      [0, "J", 0],
      [0, "J", 0],
      ["J", "J", 0],
    ],
    color: "J",
  },
  L: {
    shape: [
      [0, "L", 0],
      [0, "L", 0],
      [0, "L", "L"],
    ],
    color: "L",
  },
  O: {
    shape: [
      ["O", "O"],
      ["O", "O"],
    ],
    color: "O",
  },
  S: {
    shape: [
      [0, "S", "S"],
      ["S", "S", 0],
      [0, 0, 0],
    ],
    color: "S",
  },
  T: {
    shape: [
      [0, 0, 0],
      ["T", "T", "T"],
      [0, "T", 0],
    ],
    color: "T",
  },
  Z: {
    shape: [
      ["Z", "Z", 0],
      [0, "Z", "Z"],
      [0, 0, 0],
    ],
    color: "Z",
  },
}

// Create a random tetromino
export const createRandomPiece = () => {
  const tetrominos = "IJLOSTZ"
  const randTetromino = tetrominos[Math.floor(Math.random() * tetrominos.length)]

  return {
    pos: { x: 3, y: 0 },
    tetromino: TETROMINOS[randTetromino].shape,
    type: randTetromino,
  }
}

// Create an empty board
export const createEmptyBoard = () => {
  return Array(20)
    .fill(0)
    .map(() => Array(10).fill(0))
}

// Check if the current piece collides with the board
export const checkCollision = (piece, board, { x: moveX, y: moveY, piece: customPiece = null }) => {
  const activePiece = customPiece || piece

  for (let y = 0; y < activePiece.tetromino.length; y++) {
    for (let x = 0; x < activePiece.tetromino[y].length; x++) {
      // Check if we're on a tetromino cell
      if (activePiece.tetromino[y][x] !== 0) {
        const newX = activePiece.pos.x + x + moveX
        const newY = activePiece.pos.y + y + moveY

        // Check if we're outside the game board
        if (newX < 0 || newX >= board[0].length || newY >= board.length) {
          return true
        }

        // Check if we're moving into a non-empty cell
        if (newY >= 0 && board[newY][newX] !== 0) {
          return true
        }
      }
    }
  }

  return false
}

// Add the current piece to the board
export const addPieceToBoard = (board, piece, isActive = false) => {
  const newBoard = [...board]

  // If this is the active piece, we also want to show a "ghost" piece
  // at the bottom where the piece would land
  if (isActive) {
    let ghostY = piece.pos.y

    // Find the lowest position the piece can go
    while (!checkCollision(piece, board, { x: 0, y: 1, piece: { ...piece, pos: { ...piece.pos, y: ghostY } } })) {
      ghostY += 1
    }

    // Add ghost piece to the board
    if (ghostY > piece.pos.y) {
      piece.tetromino.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell !== 0) {
            const boardY = ghostY + y
            const boardX = piece.pos.x + x

            if (boardY >= 0 && boardY < board.length && boardX >= 0 && boardX < board[0].length) {
              if (newBoard[boardY][boardX] === 0) {
                newBoard[boardY][boardX] = "ghost"
              }
            }
          }
        })
      })
    }
  }

  // Add the actual piece to the board
  piece.tetromino.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell !== 0) {
        const boardY = piece.pos.y + y
        const boardX = piece.pos.x + x

        if (boardY >= 0 && boardY < board.length && boardX >= 0 && boardX < board[0].length) {
          newBoard[boardY][boardX] = isActive ? piece.type : cell
        }
      }
    })
  })

  return newBoard
}

// Clear completed rows and return the new board and number of rows cleared
export const clearRows = (board) => {
  let rowsCleared = 0
  const newBoard = board.reduce((acc, row) => {
    // If the row doesn't have any empty cells, it's complete
    if (row.every((cell) => cell !== 0)) {
      rowsCleared += 1
      // Add an empty row at the top
      acc.unshift(Array(board[0].length).fill(0))
      return acc
    }
    acc.push(row)
    return acc
  }, [])

  return { newBoard, rowsCleared }
}
