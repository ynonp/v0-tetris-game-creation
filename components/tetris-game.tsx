"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import TetrisBoard from "./tetris-board"
import NextPiecePreview from "./next-piece-preview"
import { createEmptyBoard, checkCollision, addPieceToBoard, clearRows, createRandomPiece } from "@/lib/tetris-utils"

export default function TetrisGame() {
  const [gameOver, setGameOver] = useState(false)
  const [paused, setPaused] = useState(false)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [lines, setLines] = useState(0)
  const [board, setBoard] = useState(() => createEmptyBoard())
  const [currentPiece, setCurrentPiece] = useState(() => createRandomPiece())
  const [nextPiece, setNextPiece] = useState(() => createRandomPiece())
  const [dropTime, setDropTime] = useState(1000)
  const [dropCounter, setDropCounter] = useState(0)

  const movePlayer = useCallback(
    (dir) => {
      if (!gameOver && !paused) {
        if (!checkCollision(currentPiece, board, { x: dir, y: 0 })) {
          setCurrentPiece((prev) => ({
            ...prev,
            pos: {
              x: prev.pos.x + dir,
              y: prev.pos.y,
            },
          }))
        }
      }
    },
    [board, currentPiece, gameOver, paused],
  )

  const drop = useCallback(() => {
    if (!gameOver && !paused) {
      // Increase level when player has cleared 10 lines
      if (lines >= level * 10) {
        setLevel((prev) => prev + 1)
        // Also increase speed
        setDropTime(1000 / (level + 1) + 200)
      }

      if (!checkCollision(currentPiece, board, { x: 0, y: 1 })) {
        setCurrentPiece((prev) => ({
          ...prev,
          pos: {
            x: prev.pos.x,
            y: prev.pos.y + 1,
          },
        }))
      } else {
        // Game over check
        if (currentPiece.pos.y < 1) {
          setGameOver(true)
          return
        }

        // Merge the piece with the board
        const newBoard = addPieceToBoard(board, currentPiece)

        // Check if we cleared any rows
        const { newBoard: clearedBoard, rowsCleared } = clearRows(newBoard)

        // Update score based on rows cleared
        if (rowsCleared > 0) {
          const linePoints = [40, 100, 300, 1200]
          setScore((prev) => prev + linePoints[rowsCleared - 1] * level)
          setLines((prev) => prev + rowsCleared)
        }

        setBoard(clearedBoard)

        // Get new piece
        setCurrentPiece(nextPiece)
        setNextPiece(createRandomPiece())
      }
    }
  }, [board, currentPiece, gameOver, level, lines, nextPiece, paused])

  const dropPlayer = useCallback(() => {
    if (!gameOver && !paused) {
      drop()
    }
  }, [drop, gameOver, paused])

  const hardDrop = useCallback(() => {
    if (!gameOver && !paused) {
      let newY = currentPiece.pos.y
      while (
        !checkCollision(currentPiece, board, {
          x: 0,
          y: 1,
          piece: { ...currentPiece, pos: { ...currentPiece.pos, y: newY } },
        })
      ) {
        newY += 1
      }

      setCurrentPiece((prev) => ({
        ...prev,
        pos: {
          x: prev.pos.x,
          y: newY,
        },
      }))

      drop()
    }
  }, [board, currentPiece, drop, gameOver, paused])

  const rotate = useCallback(
    (dir) => {
      if (!gameOver && !paused) {
        const clonedPiece = JSON.parse(JSON.stringify(currentPiece))

        // Rotate the tetromino
        const rotatedPiece = {
          ...clonedPiece,
          tetromino: clonedPiece.tetromino[0].map((_, index) =>
            clonedPiece.tetromino.map((row) => row[dir === 1 ? index : row.length - 1 - index]),
          ),
        }

        // Check if the rotation is valid (not colliding)
        if (!checkCollision(rotatedPiece, board, { x: 0, y: 0 })) {
          setCurrentPiece(rotatedPiece)
        }
      }
    },
    [board, currentPiece, gameOver, paused],
  )

  const handleKeyPress = useCallback(
    (e) => {
      if (!gameOver) {
        if (e.key === "ArrowLeft") {
          movePlayer(-1)
        } else if (e.key === "ArrowRight") {
          movePlayer(1)
        } else if (e.key === "ArrowDown") {
          dropPlayer()
        } else if (e.key === "ArrowUp") {
          rotate(1)
        } else if (e.key === " ") {
          hardDrop()
        } else if (e.key === "p") {
          setPaused((prev) => !prev)
        }
      }
    },
    [dropPlayer, gameOver, hardDrop, movePlayer, rotate],
  )

  const resetGame = () => {
    setGameOver(false)
    setPaused(false)
    setScore(0)
    setLevel(1)
    setLines(0)
    setBoard(createEmptyBoard())
    setCurrentPiece(createRandomPiece())
    setNextPiece(createRandomPiece())
    setDropTime(1000)
  }

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress)
    return () => {
      window.removeEventListener("keydown", handleKeyPress)
    }
  }, [handleKeyPress])

  useEffect(() => {
    let gameInterval

    if (!gameOver && !paused) {
      gameInterval = setInterval(() => {
        setDropCounter((prev) => {
          if (prev > dropTime) {
            drop()
            return 0
          }
          return prev + 16.67 // Approximately 60 FPS
        })
      }, 16.67)
    }

    return () => {
      clearInterval(gameInterval)
    }
  }, [drop, dropTime, gameOver, paused])

  return (
    <div className="flex flex-col md:flex-row gap-8 items-center">
      <Card className="p-6 bg-gray-800 border-gray-700">
        <div className="flex flex-col items-center">
          <div className="mb-4 text-center">
            <h2 className="text-2xl font-bold text-white">Score: {score}</h2>
            <div className="text-lg text-gray-300">Level: {level}</div>
            <div className="text-lg text-gray-300">Lines: {lines}</div>
          </div>

          <NextPiecePreview piece={nextPiece} />

          <div className="mt-4 space-y-2">
            <Button onClick={() => setPaused((prev) => !prev)} disabled={gameOver} className="w-full">
              {paused ? "Resume" : "Pause"}
            </Button>
            <Button onClick={resetGame} variant="destructive" className="w-full">
              {gameOver ? "New Game" : "Reset"}
            </Button>
          </div>
        </div>
      </Card>

      <div className="relative">
        <TetrisBoard board={board} currentPiece={currentPiece} />

        {(gameOver || paused) && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="text-center p-4">
              <h2 className="text-3xl font-bold text-white mb-4">{gameOver ? "Game Over" : "Paused"}</h2>
              <Button onClick={gameOver ? resetGame : () => setPaused(false)}>
                {gameOver ? "Play Again" : "Resume"}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="md:hidden mt-4 grid grid-cols-3 gap-2">
        <Button onClick={() => movePlayer(-1)} className="col-span-1">
          ←
        </Button>
        <Button onClick={dropPlayer} className="col-span-1">
          ↓
        </Button>
        <Button onClick={() => movePlayer(1)} className="col-span-1">
          →
        </Button>
        <Button onClick={() => rotate(1)} className="col-span-1">
          ↻
        </Button>
        <Button onClick={hardDrop} className="col-span-1">
          Drop
        </Button>
        <Button onClick={() => setPaused((prev) => !prev)} className="col-span-1">
          {paused ? "Resume" : "Pause"}
        </Button>
      </div>

      <div className="mt-4 text-gray-400 text-sm">
        <p>Controls: Arrow keys to move, Up to rotate, Space to hard drop, P to pause</p>
      </div>
    </div>
  )
}
