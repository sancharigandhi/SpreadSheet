import { useState } from "react";
import { Sheet } from "./Sheet";
import "./App.css";

const initialData = [];
for (let row = 0; row < 1000; row++) {
  const rowData = [];
  for (let col = 0; col < 1000; col++) {
    rowData.push(`${col + 1}`);
  }
  initialData.push(rowData);
}
function App() {
  const [displayData, setDisplayData] = useState(initialData);
  const onChange = (changes) => {
    const newData = [...displayData];

    for (let change of changes) {
      // {x,y value}
      if (!newData[change.y]) {
        newData[change.y] = [];
      }
      newData[change.y][change.x] = change.value
    }
    setDisplayData(newData)
  };
  return (
    <div style={{ margin: 0, padding: 0 }}>
      <Sheet displayData={displayData} onChange={onChange}/>
    </div>
  );
}

export default App;
