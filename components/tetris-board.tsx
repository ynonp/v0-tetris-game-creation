import { memo } from "react"
import { addPieceToBoard } from "@/lib/tetris-utils"

interface TetrisBoardProps {
  board: (string | number)[][]
  currentPiece: any
}

const TetrisBoard = ({ board, currentPiece }: TetrisBoardProps) => {
  // Create a board with the current piece on it
  const boardWithPiece = addPieceToBoard([...board.map((row) => [...row])], currentPiece, true)

  // Color mapping for different tetrominos
  const colors = {
    0: "bg-gray-900",
    I: "bg-cyan-500",
    J: "bg-blue-500",
    L: "bg-orange-500",
    O: "bg-yellow-500",
    S: "bg-green-500",
    T: "bg-purple-500",
    Z: "bg-red-500",
    ghost: "bg-gray-700 border border-gray-600",
  }

  return (
    <div className="border-4 border-gray-700 bg-gray-900">
      <div className="grid grid-cols-10 gap-0">
        {boardWithPiece.map((row, y) =>
          row.map((cell, x) => (
            <div key={`${y}-${x}`} className={`${colors[cell] || colors[0]} w-6 h-6 sm:w-8 sm:h-8`} />
          )),
        )}
      </div>
    </div>
  )
}

export default memo(TetrisBoard)
