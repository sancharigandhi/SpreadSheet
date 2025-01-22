export const calculateRowsAndColumnsToDisplay = (size, visbleArea, offSet,cellOffSet) => {
  const visible = [];
  const start = [];
  const end = [];

  let index = cellOffSet;
  let nextStart = offSet;

  while (nextStart < visbleArea) {
    visible.push(index);
    start.push(nextStart);
    end.push(nextStart + size);

    index++;
    nextStart += size;
  }

  return { visible, start, end };
};

export const resizeCanvas = (canvas) => {
  const { width, height } = canvas.getBoundingClientRect();

  const ratio = window.devicePixelRatio;
  const newCanvasWidth = Math.round(width * ratio);
  const newCanvasHeight = Math.round(height * ratio);

  const context = canvas.getContext("2d");

  canvas.width = newCanvasWidth;
  canvas.height = newCanvasHeight;

  context.scale(ratio, ratio);
};

export const getEncodedCharacter = (num) => {
  // console.log(num);
  let result = "";
  while (num > 0) {
    const rem = (num - 1) % 26;
    // console.log("rem is-->", rem);
    result = String.fromCharCode(65 + rem) + result;
    // console.log("res is-->", result);
    num = Math.floor((num - 1) / 26);
    // console.log("num is-->", num);
  }
  return result;
};
