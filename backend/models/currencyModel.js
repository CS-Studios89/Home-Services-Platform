exports.convertCurrency = (amount, from, to) => {

    const rates = {

      USD: 1,

      EUR: 0.92,

      GBP: 0.78,

      JPY: 150,

      AUD: 1.5,

      CAD: 1.35,

      CHF: 0.88,

      CNY: 7.2,

      AED: 3.67,

      SAR: 3.75,

      OMT: 0.385,  // Oman Rial to USD (1 OMT = ~2.6 USD)

      WISH: 1      // Wish Money to USD (1:1 with USD)

    };

  

    if (!rates[from] || !rates[to]) {

      throw new Error("Unsupported currency");

    }

  

    const usdAmount = amount / rates[from]; // normalize to USD

    return usdAmount * rates[to];

}