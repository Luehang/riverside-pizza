module.exports = function Cart(oldCart) {
    this.items = oldCart.items || {};
    this.totalQty = oldCart.totalQty || 0;
    this.totalPrice = oldCart.totalPrice 
        ? Number.parseFloat(nearestHundredths(oldCart.totalPrice)) 
        : 0;
    this.totalAfterTax = nearestHundredths(this.totalPrice * 1.05);
    this.tax = nearestHundredths(this.totalPrice * 0.05);

    this.add = function(item, id) {
        var storedItem = this.items[id];
        if (!storedItem) {
            storedItem = this.items[id] = {item: item, qty: 0, price: 0};
            storedItem.id = id;
        }
        storedItem.qty++;
        storedItem.price = nearestHundredths(storedItem.item.price * storedItem.qty);
        this.totalQty++;
        this.totalPrice = nearestHundredths(this.totalPrice + storedItem.item.price);
    };

    this.reduceByOne = function(id) {
        this.items[id].qty--;
        this.items[id].price = nearestHundredths(this.items[id].price - this.items[id].item.price);
        this.totalQty--;
        this.totalPrice = nearestHundredths(this.totalPrice - this.items[id].item.price);

        if (this.items[id].qty <= 0) {
            delete this.items[id];
        }
    };

    this.removeItem = function(id) {
        this.totalQty -= this.items[id].qty;
        this.totalPrice = nearestHundredths(this.totalPrice - this.items[id].price);
        delete this.items[id];
    };

    this.generateArray = function() {
        var arr = [];
        for (var id in this.items) {
            arr.push(this.items[id]);
        }
        return arr;
    };
}

function nearestHundredths(number) {
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