import React, { useState, useCallback, useRef } from 'react';
import produce from 'immer';

const numRows = 50;
const numCols = 50;

//Relative coordinates for "neighbors" of a given cell
const operations = [ 
  [0, 1],
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
  [-1, -1],
  [-1, 0],
  [-1, 1]
]

const generateEmptyGrid = () => {
  const rows = [];
  for (let i = 0; i < numRows; i++) {
    rows.push(Array.from(Array(numCols), () => 0));
  }
  return rows;
}

const generateRandomGrid = () => {
  const rows = [];
  for (let i = 0; i < numRows; i++) {
    rows.push(Array.from(Array(numCols), () => Math.random() > 0.5 ? 1 : 0));
  }
  return rows;
}

const App: React.FC = () => {
  const [grid, setGrid] = useState(() => {
    return generateEmptyGrid();
  });

  const [running, setRunning] = useState(false);
  
  /*
  Doing this because runSumulation is defined once and we require the value of running 
  to be up to date every time the fn is called, not just at deifnition time.
  */
  const runningRef = useRef(running);
  runningRef.current = running;
  

  const runSimulation = useCallback( () => {
    if (!runningRef.current) {
      return;
    }
    
    setGrid((g) => {	
      return produce(g, gridCopy => {	
        for (let i=0; i < numRows; i++){	
          for (let k=0; k < numCols; k++) {	
            let neighbors = 0;	
            operations.forEach(([x,y]) => {	
              const newI = i + x;	
              const newK = k + y;	

              /*Tests that the current neighbor is within grid bounds in both x and y.
              We record only total neighbor count, not position */
              if (newI >= 0 && newI < numRows && newK >= 0 && newK < numCols) {	
                neighbors += g[newI][newK];	
              }	
            });	

            //Now define game of life rules
            if (neighbors < 2 || neighbors > 3) {	
              gridCopy[i][k] = 0;	
            } else if (g[i][k] === 0 && neighbors === 3) {	
              gridCopy[i][k] = 1;	
            }	
          }	
        }	
      });	
    });

    setTimeout(runSimulation, 100)
  }, [])

  return (
    <>
      <button onClick={() => {
        setRunning(!running);
        if (!running) {
          runningRef.current = true;
          runSimulation()
        }
        }}>
        {running ? 'Stop' :'Start'}
      </button>

      <button onClick={() => setGrid(generateEmptyGrid())}>
        Clear
      </button>

      <button onClick={() => setGrid(generateRandomGrid())}>
        Random
      </button>

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${numCols}, 22px)`
      }}>
        {grid.map((rows, i) =>
          rows.map((col, k) => 
            <div 
            onClick={() => {
              const newGrid = produce(grid, gridCopy => {
                gridCopy[i][k] = grid[i][k] ? 0 : 1;
              });
              setGrid(newGrid);
            }}
              style={{ 
                width: 20, 
                height: 20, 
                backgroundColor: grid[i][k] ? 'green' : undefined,
                border: 'solid 1px black'
              }}
              key={`${i}-${k}`}
            ></div>))}
      </div>
    </>
  )
}

export default App;
