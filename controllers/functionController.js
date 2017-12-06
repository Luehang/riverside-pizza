const functionController = {};

// function to round number to nearest hundredths
functionController.nearestHundredths = (number) => {
    if ((/\./).test(number)) {
      number = number.toString();
      let dotIndex = number.match(/\./).index;
  
      const integer = number.slice(0, dotIndex);
  
      const startSlice = dotIndex + 1;
      let parseDecimal = number.slice(startSlice, startSlice + 2);
   
      let tempNum = null;
      if (integer === "0") {
        tempNum = parseDecimal;
      } else {
        tempNum = integer + parseDecimal;
      }
      const tempDem = number.slice(startSlice + 2, 10000);
      
      const newTempStringNum = tempNum + "." + tempDem;
      let newTempNum = Number.parseFloat(newTempStringNum);
      newTempNum = Math.round(newTempNum);
      newTempNum = newTempNum.toString();
      
      let roundedString = null;
      if (integer !== "0") {
        const int = newTempNum.substr(0, dotIndex);
        const dem = newTempNum.substr(dotIndex, 2);
        roundedString = int + "." + dem;
      } else if ((/\.(?=0)/).test(number)) {
        roundedString = "0.0" + newTempNum;
      } else {
        newTempNum = newTempNum.length === 1 ? newTempNum + "0" : newTempNum;
        roundedString = "0." + newTempNum;
      }
      return roundedString;
    }
    return number;
}

// function to change price to string ex. "2.00"
functionController.priceToCompleteString = (number) => {
    newString = number.toString();
    if ((/\./).test(newString) !== true) {
        return newString + ".00";
    }
    const startIndex = newString.match(/\./).index + 1;
    const decimalPlace = newString.substring(startIndex, newString.length);
    if (decimalPlace.length === 1) {
        return newString + "0";
    } else {
        return newString;
    }
}

module.exports = functionController;