//Global selections and variables
const colorDivs = document.querySelectorAll(".color");
// const currentHexes = document.querySelectorAll(".color--header");

// Functions

// Generate new color in HEX

function generateHex() {
  //   const letters = "0123456789ABCDEF";
  //   let hash = "#";
  //   for (let i = 0; i < 6; i++) {
  //     hash += letters[Math.floor(Math.random() * 16)];
  //   }
  //   return hash;
  // ZAMIANA PĘTLI NA WERSJĘ Z BIBLIOTEKĄ CHROMA.JS
  const hexColor = chroma.random();
  return hexColor;
}

function randomColors() {
  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const randomColor = generateHex();

    div.style.backgroundColor = randomColor;
    hexText.innerText = randomColor;
    checkTextContrast(randomColor, hexText);
  });
}

function checkTextContrast(color, hex) {
  const luminColor = color.get("lab.l");
  // DODAĆ OPCJĘ ZMIANY KOLORÓW IKON RAZEM Z TEKSTEM
  if (luminColor < 50) {
    hex.style.color = "white";
  } else {
    hex.style.color = "black";
  }
}

randomColors();
