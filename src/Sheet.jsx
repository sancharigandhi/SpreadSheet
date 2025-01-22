import { useRef, useEffect, useState } from "react";
import {
  calculateRowsAndColumnsToDisplay,
  getEncodedCharacter,
  resizeCanvas,
} from "./Sheet.util";
import { useFormState } from "react-dom";

export const Sheet = (props) => {
  const canvasRef = useRef(null);

  const [canvasWidth, setCanvasWidth] = useState(window.innerWidth);
  const [canvasHeight, setCanvasHeight] = useState(window.innerHeight);
  const [cellsOffSet, setCellsOffset] = useState({ x: 0, y: 0 });
  const [maxScrollArea, setMaxScrollArea] = useState({ x: 5000, y: 5000 });
  const [selection, setSelection] = useState({
    x1: -1,
    y1: -1,
    x2: -1,
    y2: -1,
  });
  const [selectionInProgress, setSelectionInProgress] = useState(false);
  const [editCell, setEditCell] = useState({ x: -1, y: -1 });
  const [editValue ,setEditValue]= useState('')

  const cellWidth = 100;
  const cellHeight = 30;

  const rowHeaderWidth = 50;
  const columnHeaderHeight = 20;

  const headerColor = "#E5E4E2";
  const gridLineColor = "#D3D3D3";
  const headerTextColor = "#666666";

  const {
    visible: visibleColumns,
    start: columnStart,
    end: columnEnd,
  } = calculateRowsAndColumnsToDisplay(
    cellWidth,
    canvasWidth,
    rowHeaderWidth,
    cellsOffSet.x
  );
  const {
    visible: visibleRows,
    start: rowStart,
    end: rowEnd,
  } = calculateRowsAndColumnsToDisplay(
    cellHeight,
    canvasHeight,
    columnHeaderHeight,
    cellsOffSet.y
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    resizeCanvas(canvas);

    context.fillStyle = "white";
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);

    // selection cell
    let selX1 = selection.x1;
    let selX2 = selection.x2;
    let selY1 = selection.y1;
    let selY2 = selection.y2;

    if (selection.x1 > selection.x2) {
      selX1 = selection.x2;
      selX2 = selection.x1;
    }

    if (selection.y1 > selection.y2) {
      selY1 = selection.y2;
      selY2 = selection.y1;
    }

    const isSelectionActive =
      selX1 !== -1 && selY1 !== -1 && selX2 !== -1 && selY2 !== -1;

    let point1 = cellToCoordinate(selX1, selY1);
    let point2 = cellToCoordinate(selX2, selY2);

    point2.x += cellWidth;
    point2.y += cellHeight;

    // draw for columns
    let startX = rowHeaderWidth;
    context.strokeStyle = gridLineColor;
    for (const col of visibleColumns) {
      context.beginPath();
      context.moveTo(startX, columnHeaderHeight);
      context.lineTo(startX, context.canvas.height);
      context.stroke();
      startX += cellWidth;
    }

    // draw for row
    let startY = columnHeaderHeight;
    context.strokeStyle = gridLineColor;
    for (const row of visibleRows) {
      context.beginPath();
      context.moveTo(rowHeaderWidth, startY);
      context.lineTo(context.canvas.width, startY);
      context.stroke();
      startY += cellHeight;
    }

    // draw row header
    startY = columnHeaderHeight;
    context.fillStyle = headerColor;
    context.fillRect(0, 0, rowHeaderWidth, context.canvas.height);
    for (const row of visibleRows) {
      context.beginPath();
      context.moveTo(0, startY);
      context.lineTo(rowHeaderWidth, startY);
      context.stroke();
      startY += cellHeight;
    }

    // draw column header
    startX = rowHeaderWidth;
    context.fillRect(0, 0, context.canvas.width, columnHeaderHeight);
    for (const col of visibleColumns) {
      context.beginPath();
      context.moveTo(startX, 0);
      context.lineTo(startX, columnHeaderHeight);
      context.stroke();
      startX += cellWidth;
    }

    // write col header text
    startX = rowHeaderWidth;
    context.font = "15px sans-serif";
    context.fillStyle = headerTextColor;
    context.textAlign = "center";
    context.textBaseline = "middle";
    for (const col of visibleColumns) {
      const centerX = startX + cellWidth * 0.5;
      const centerY = columnHeaderHeight * 0.5;

      const content = getEncodedCharacter(col + 1);
      context.fillText(content, centerX, centerY);
      startX += cellWidth;
    }

    // draw for row
    startY = columnHeaderHeight;
    for (const row of visibleRows) {
      const centerX = rowHeaderWidth * 0.5;
      const centerY = startY + cellHeight * 0.5;
      const content = row + 1;
      context.fillText(content, centerX, centerY);

      startY += cellHeight;
    }

    if (isSelectionActive) {
      const rectWidth = point2.x - point1.x;
      const rectHeight = point2.y - point1.y;

      console.log("RECT WIDTH ->", rectWidth, "RECT HEIGHT ->", rectHeight);

      context.fillStyle = "#e6effd";
      context.fillRect(point1.x, point1.y, rectWidth, rectHeight);
      context.strokeStyle = "#1a73e8";
      context.rect(point1.x, point1.y, rectWidth, rectHeight);
      context.stroke();
    }

    // write cells content

    let yCoord = columnHeaderHeight;
    context.textBaseline = "middle";
    context.textAlign = "left";
    context.fillStyle = "black";

    for (const row of visibleRows) {
      let xCoord = rowHeaderWidth;
      for (const col of visibleColumns) {
        const content = props?.displayData?.[row]?.[col];
        if (content) {
          const x = xCoord + 5;
          const y = yCoord + cellHeight * 0.5;
          context.fillText(content, x, y);
        }
        xCoord += cellWidth;
      }
      yCoord += cellHeight;
    }
  }, [canvasWidth, canvasHeight, cellsOffSet.x, cellsOffSet.y, selection,props.displayData]);

  useEffect(() => {
    const resizeCanvas = () => {
      setCanvasWidth(window.innerWidth);
      setCanvasHeight(window.innerHeight);
    };
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  const onScroll = (e) => {
    const scrollX = e.target.scrollLeft;
    const scrollY = e.target.scrollTop;

    const cellsOffsetInX = Math.floor(scrollX / cellWidth);
    const cellsOffsetInY = Math.floor(scrollY / cellHeight);
    setCellsOffset({ x: cellsOffsetInX, y: cellsOffsetInY });

    let newMaxScrollArea = { ...maxScrollArea };

    if (maxScrollArea.x / scrollX < 1) {
      newMaxScrollArea.x *= 2;
    }
    if (maxScrollArea.y / scrollY < 1) {
      newMaxScrollArea.y *= 2;
    }

    setMaxScrollArea({ ...newMaxScrollArea });
  };

  // console.log(visibleColumns);
  //   console.log(visibleRows);

  const coordinateOfCell = (x, y) => {
    let cellX = 0;
    let cellY = 0;

    for (let i = 0; i < visibleColumns.length; i++) {
      if (x >= columnStart[i] && x < columnEnd[i]) {
        cellX = visibleColumns[i];
      }
    }

    for (let i = 0; i < visibleRows.length; i++) {
      if (x >= rowStart[i] && x < rowEnd[i]) {
        cellY = visibleRows[i];
      }
    }

    return { x: cellX, y: cellY };
  };

  const cellToCoordinate = (cellX, cellY) => {
    let x = 0;
    let y = 0;

    // Find the index of the cellX in visibleColumns
    let idx = visibleColumns.findIndex((i) => i === cellX);
    if (idx !== -1) {
      x = columnStart[idx]; // Correctly reference idx instead of i
    } else {
      x = (cellX - cellsOffSet.x) * cellWidth;
    }

    // Find the index of the cellY in visibleRows
    idx = visibleRows.findIndex((i) => i === cellY);
    if (idx !== -1) {
      y = rowStart[idx]; // Correctly reference idx instead of i
    } else {
      y = (cellY - cellsOffSet.y) * cellHeight;
    }

    return { x, y };
  };

  const onMouseDown = (e) => {
    const x = e.clientX;
    const y = e.clientY;
    setSelectionInProgress(true);
    const set1 = coordinateOfCell(x, y); // point1
    const set2 = { ...set1 };
    // console.log("set1-->", set1);
    // console.log("set2-->", set2);
    setSelection({ x1: set1.x, y1: set1.y, x2: set2.x, y2: set2.y });
  };

  const onMouseMove = (e) => {
    const x = e.clientX;
    const y = e.clientY;
    setSelectionInProgress(true);

    if (selectionInProgress) {
      const set2 = coordinateOfCell(x, y);
      console.log(set2);

      setSelection({ ...selection, x2: set2.x, y2: set2.y });
    }
  };

  const onMouseUp = () => {
    setSelectionInProgress(false);
  };

  function onDoubleClick(e) {
    const x = e.clientX;
    const y = e.clientY;
    const cell = coordinateOfCell(x, y);
    setEditCell({ x: cell.x, y: cell.y });
    const content = props?.displayData?.[cell.y]?.[cell.x];
    if(content)setEditValue(content)

  }
  const editMode = editCell.x !== -1 && editCell.y !== -1;
  let position = { x: 0, y: 0 };
  let editWidth = 0
  let editHeight = 0

  if (editMode) {
    position = cellToCoordinate(editCell.x, editCell.y);
    position.x +=1
    position.y+=1
    editWidth = cellWidth-2
    editHeight = cellHeight -1
  }

  function onkeydown(e) {
    if(e.key ==='Enter'){
      props.onChange?.([{x:editCell.x,y:editCell.y,value:editValue}])
      setEditValue('')
      setEditCell({x:-1,y:-1})
    }
  }

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <canvas ref={canvasRef} style={{ height: "100%", width: "100%" }} />
      <div
        onScroll={onScroll}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onDoubleClick={onDoubleClick}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          overflow: "scroll",
        }}
      >
        {/* For horizontal scrolling  */}
        <div
          style={{ width: maxScrollArea.x + 2000 + "px", height: "1px" }}
        ></div>

        {/* For vertical scrolling  */}
        <div
          style={{ width: "1px", height: maxScrollArea.y + 2000 + "px" }}
        ></div>
      </div>
      {editMode && (
        <input
          type="text"
          value={editValue}
          onChange={e =>setEditValue(e.target.value)}
          onKeyDown={onkeydown}
          style={{
            position: "absolute",
            top: position.y,
            left: position.x,
            width:editWidth,
            height:editHeight,
            outline:'none',
            border:"none",
            color:"black",
            fontSize:'16px'
          }}
        />
      )}
    </div>
  );
};
