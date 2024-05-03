import { useState, useEffect } from 'react';
import Model from './Model';

class Node {
    constructor(grid, depth, gridSize, parent = null, cost = 0) {
        this.grid = grid;
        this.depth = depth;
        this.parent = parent;
        this.cost = cost;
        this.gridSize = gridSize;
        this.h = this.calculateHeuristic();
        this.g = this.depth;
    }

    isSolution() {
        const goalState = [...this.grid].sort((a, b) => {
            if (a.r !== b.r) return a.r - b.r;
            if (a.g !== b.g) return a.g - b.g;
            if (a.b !== b.b) return a.b - b.b;
            return a.a - b.a;
        });

        return this.grid.every((shape, index) => {
            const goalShape = goalState[index];
            return (
                shape.id === goalShape.id &&
                shape.r === goalShape.r &&
                shape.g === goalShape.g &&
                shape.b === goalShape.b &&
                shape.a === goalShape.a
            );
        });
    }

    calculateHeuristic() {
        let totalDistance = 0;
        for (let i = 0; i < this.grid.length; i++) {
            const currentRow = Math.floor(i / this.gridSize);
            const currentCol = i % this.gridSize;
            const goalRow = Math.floor(this.grid[i].id / this.gridSize);
            const goalCol = this.grid[i].id % this.gridSize;
            const distance = Math.abs(currentRow - goalRow) + Math.abs(currentCol - goalCol);
            totalDistance += distance;
        }
        return totalDistance;
    }

    getSuccessors() {
        const successors = [];
        const visitedStates = new Set();
        for (let i = 0; i < this.grid.length; i++) {
            const childGrid = [...this.grid];
            const temp = childGrid.splice(i, 1)[0];
            for (let j = 0; j < this.grid.length; j++) {
                if (i !== j) {
                    const newGrid = [...childGrid.slice(0, j), temp, ...childGrid.slice(j)];
                    const newState = JSON.stringify(newGrid);
                    if (!visitedStates.has(newState)) {
                        successors.push(new Node(newGrid, this.depth + 1, this.gridSize, this, this.cost + 1));
                        visitedStates.add(newState);
                    }
                }
            }
        }

        return successors;
    }
}

const AColorGrid = ({ gridSize = 5, numOpacitiesPerColor = 5 }) => {
    const [moveCount, setMoveCount] = useState(0);
    const [selectedShape, setSelectedShape] = useState(null);
    const [grid, setGrid] = useState([]);
    const [isWin, setIsWin] = useState(false);

    useEffect(() => {
        createGrid();
    }, []);


    const generateRandomColors = (numColors, numOpacities) => {
        const colors = [];
        for (let i = 0; i < numColors; i++) {
            const baseColor = [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)];
            const colorOpacities = [];
            for (let j = 0; j < numOpacities; j++) {
                const opacity = (j + 1) * (1 / (numOpacities + 1));
                colorOpacities.push([...baseColor, opacity]);
            }
            colors.push(colorOpacities);
        }
        return colors;
    }


    const createGrid = () => {
        const opacities = generateRandomColors(gridSize, numOpacitiesPerColor);
        const shuffledOpacities = shuffleArray(opacities.flat());
        const newGrid = shuffledOpacities.map(([r, g, b, a], index) => ({
            id: index,
            r,
            g,
            b,
            a
        }));
        setGrid(newGrid);
    };

    const shuffleArray = array => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    const handleShapeClick = (shape) => {
        if (selectedShape && selectedShape !== shape) {
            const tempColor = { ...selectedShape };
            selectedShape.r = shape.r;
            selectedShape.g = shape.g;
            selectedShape.b = shape.b;
            selectedShape.a = shape.a;

            shape.r = tempColor.r;
            shape.g = tempColor.g;
            shape.b = tempColor.b;
            shape.a = tempColor.a;

            setSelectedShape(null);
            setMoveCount(prevCount => prevCount + 1);
            checkWin();
        } else if (selectedShape === shape) {
            setSelectedShape(null);
        } else {
            setSelectedShape(shape);
        }
    }

    const resetGame = () => {
        setMoveCount(0);
        setSelectedShape(null);
        createGrid();
    }

    const checkWin = () => {
        const rows = Array.from({ length: gridSize }, () => []);
        grid.forEach(shape => {
            const row = parseInt(shape.id / gridSize);
            const col = shape.id % gridSize;
            const color = shape;
            rows[row][col] = color;
        });

        const Direction = rows[0][0].a < rows[0][gridSize - 1].a ? "left-to-right" : "right-to-left";
        const isOrdered = rows.every(row => {
            if (Direction === "left-to-right") {
                return row.every((color, index) => {
                    if (index === 0) return true;
                    return color.a >= row[index - 1].a && color.r === row[index - 1].r && color.g === row[index - 1].g && color.b === row[index - 1].b;
                });
            } else {
                return row.every((color, index) => {
                    if (index === 0) return true;
                    return color.a <= row[index - 1].a && color.r === row[index - 1].r && color.g === row[index - 1].g && color.b === row[index - 1].b;
                });
            }
        });
        if (isOrdered) {
            setIsWin(true);
        }
    }

    const closeModal = () => {
        setIsWin(false);
        resetGame();
    };


    const solveGame = () => {
        const maxDepth = 700;
        const initialNode = new Node(grid, 0, gridSize);
        let stack = [initialNode];
        const visited = new Set();
        let depth = 0;

        const search = () => {
            while (stack.length > 0 && depth < maxDepth) {
                const currentNode = stack.pop();
                visited.add(JSON.stringify(currentNode.grid));
                depth++;

                if (currentNode.isSolution()) {
                    const path = [];
                    let current = currentNode;
                    while (current !== null) {
                        path.unshift(current);
                        current = current.parent;
                    }
                    let currentPosition = 0;
                    if (path.length > 1) {
                        const nextMove = path[currentPosition];
                        setGrid(nextMove.grid);
                        setMoveCount(moveCount + 1);
                        checkWin();
                        currentPosition++;
                        return;
                    }
                }
                const successors = currentNode.getSuccessors();
                const unvisitedSuccessors = successors.filter(successor => {
                    const gridString = JSON.stringify(successor.grid);
                    return !visited.has(gridString) && successor.depth < maxDepth;
                });
                stack.push(...unvisitedSuccessors);
            }
            console.log("No solution found within maxDepth.");
        };
        setTimeout(search, 2000);
    };

    return (
        <div className='game'>
            <div id="container">
                <h1>Move Count: {moveCount}</h1>
                <div className='colors'>
                    {grid.map((shape) => (
                        <div
                            key={shape.id}
                            className={`shape ${selectedShape && selectedShape.id === shape.id ? 'selected' : ''}`}
                            style={{ backgroundColor: `rgba(${shape.r}, ${shape.g}, ${shape.b}, ${shape.a})` }}
                            onClick={() => handleShapeClick(shape)}
                        />
                    ))}
                </div>
                <div className='btns'>
                    <button id="resetBtn" onClick={resetGame}>Reset</button>
                    <button id="hintBtn" onClick={solveGame}>Hint</button>
                </div>
            </div>
            {isWin && <Model moveCount={moveCount} onClose={closeModal} />}
        </div>
    );
};

export default AColorGrid;

