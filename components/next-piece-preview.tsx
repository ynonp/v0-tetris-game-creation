import { memo } from "react"

interface NextPiecePreviewProps {
  piece: any
}

const NextPiecePreview = ({ piece }: NextPiecePreviewProps) => {
  // Color mapping for different tetrominos
  const colors = {
    I: "bg-cyan-500",
    J: "bg-blue-500",
    L: "bg-orange-500",
    O: "bg-yellow-500",
    S: "bg-green-500",
    T: "bg-purple-500",
    Z: "bg-red-500",
  }

  // Create a small board for the preview
  const previewBoard = Array(4)
    .fill(0)
    .map(() => Array(4).fill(0))

  // Center the piece in the preview
  const offsetX = piece.type === "I" ? 0 : piece.type === "O" ? 1 : 0.5
  const offsetY = piece.type === "I" ? 0.5 : 0

  // Add the piece to the preview board
  piece.tetromino.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell !== 0) {
        const previewX = Math.floor(x + offsetX)
        const previewY = Math.floor(y + offsetY)
        if (previewBoard[previewY] && previewBoard[previewY][previewX] !== undefined) {
          previewBoard[previewY][previewX] = piece.type
        }
      }
    })
  })

  return (
    <div className="mt-2">
      <h3 className="text-lg font-medium text-white mb-2">Next Piece</h3>
      <div className="border-2 border-gray-700 bg-gray-900 p-2">
        <div className="grid grid-cols-4 gap-0">
          {previewBoard.map((row, y) =>
            row.map((cell, x) => (
              <div key={`preview-${y}-${x}`} className={`${colors[cell] || "bg-gray-900"} w-5 h-5`} />
            )),
          )}
        </div>
      </div>
    </div>
  )
}

export default memo(NextPiecePreview)
