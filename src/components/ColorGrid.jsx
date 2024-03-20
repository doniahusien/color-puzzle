import { useState, useEffect } from 'react';

const ColorGrid = ({ gridSize = 4, numOpacitiesPerColor = 4 }) => {
    const [moveCount, setMoveCount] = useState(0);
    const [selectedShape, setSelectedShape] = useState(null);
    const [grid, setGrid] = useState([]);// State to store the grid of shapes

    useEffect(() => {
        createGrid();
    }, []);

    //generate random colors with different opacities
    function generateRandomColors(numColors, numOpacities) {
        const colors = [];
        for (let i = 0; i < numColors; i++) {
            const baseColor = [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)];// Generate a base color with random RGB values
            const colorOpacities = [];
            for (let j = 0; j < numOpacities; j++) {
                const opacity = (j + 1) * (1 / (numOpacities + 1));
                colorOpacities.push([...baseColor, opacity]);
            }
            colors.push(colorOpacities);
        }
        return colors;
    }
    
    // Function to shuffle an array
    const shuffleArray = array => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
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

    // Function to handle shape click and swap colors
    function handleShapeClick(shape) {
        if (selectedShape && selectedShape !== shape) {
            // Swap colors between the selected shape and the clicked shape
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
        
        const gradientDirection = rows[0][0].a < rows[0][gridSize - 1].a ? "left-to-right" : "right-to-left";
        const isOrdered = rows.every(row => {
            if (gradientDirection === "left-to-right") {
                return row.every((color, index) => {
                    if (index === 0) return true; 
                    return color.a >= row[index - 1].a; 
                });
            } else {
                return row.every((color, index) => {
                    if (index === 0) return true; 
                    return color.a <= row[index - 1].a; 
                });
            }
        });

        if (isOrdered) {
            alert("You win in " + moveCount + " moves");
            resetGame();
        }
    }

    return (
        <div id="container">
            {grid.map((shape) => (
                <div
                    key={shape.id}
                    className={`shape ${selectedShape && selectedShape.id === shape.id ? 'selectedShape' : ''}`}
                    style={{ backgroundColor: `rgba(${shape.r}, ${shape.g}, ${shape.b}, ${shape.a})` }}
                    onClick={() => handleShapeClick(shape)}
                />
            ))}
            <div>Move Count: {moveCount}</div>
            <button id="resetBtn" onClick={resetGame}>Reset</button>
        </div>
    );
}
export default ColorGrid;
