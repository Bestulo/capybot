const Discord = require("discord.js");
const client = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"],
});
const rp = require("request-promise");

const commaNumber = require("comma-number"),
  cn = commaNumber.bindWith(".", ",");

function milear(num) {
  const firstRounded = String(num);
  const stringRounded = firstRounded.replace(".", ",");
  const rounded = cn(stringRounded);
  return rounded;
}

const getCapyCoin = (id) =>
  rp("https://www.capybaraexchange.com/api/currency/" + id).then(JSON.parse);

const getTasa = ({ amount, price, maxprice, lmin, lmax, stock }) => {
  if (amount == "pene") {
    return price;
  } else if (Number(amount) < lmax) {
    return Number(price) + price * (maxprice / price - 1) * (amount / lmax);
  } else if (Number(amount) > lmax) {
    return maxprice;
  }
};

const getTasa2 = ({ amount, price, maxprice, lmin, lmax }) => {
  const incremento = Number(maxprice / price - 1);
  const monedas = Number(
    Math.sqrt(
      (lmax * lmax) / (4 * (incremento * incremento)) +
        (lmax * amount) / (incremento * price)
    ) -
      lmax / (2 * incremento)
  );
  if (amount == "pene") {
    return price;
  } else if (Number(monedas) < lmax) {
    return Number(price) + price * (maxprice / price - 1) * (monedas / lmax);
  } else if (Number(monedas) > lmax) {
    return maxprice;
  }
};

const getCosto = (amount, tasa) => amount * tasa;

const getCoinDetails = (coin) => {
  if (/^paypal/.test(coin)) {
    coin = "PaypalUSD";
  }
  return getCapyCoin(coin);
};

const getExchangeText = (coin, amount = "pene") =>
  getCoinDetails(coin).then(({ data }) => {
    console.log("COIN COIN COIN", coin);
    const tasa = Number(getTasa({ ...data, amount }));
    console.log("amount", amount);
    const { maxprice, lmin, lmax, currency } = data;
    let text = "";
    if (amount == "pene") {
      text += `
1 **${currency}** = Bs. **${milear(tasa.toFixed(2))}**`;
    } else {
      amount = Number(amount);
      if (amount > 0 && amount <= lmin) {
        text += `
1 **${currency}** = Bs. **${milear(tasa.toFixed(2))}** 
${amount} **${currency}** = Bs. **${milear((tasa * amount).toFixed(2))}**`;
      } else if (amount > lmin) {
        text += `Tasa: 1 **${currency}** = Bs. **${milear(tasa.toFixed(2))}**
${amount} **${currency}** = Bs. **${milear((tasa * amount).toFixed(2))}**
Nota: La tasa de **${currency}** aumenta si cambias más de ${lmin} **${currency}**, la tasa máxima siendo Bs. **${milear(
          maxprice.toFixed(2)
        )}** al cambiar ${lmax} o más **${currency}**.`;
      } else {
        text += `**Error:** parámetro incorrecto, usa **$help** para obtener ayuda.`;
      }
    }
    return text;
  });

const getExchangeText2 = (coin, amount = "pene") =>
  getCoinDetails(coin).then(({ data }) => {
    console.log("COIN COIN COIN", coin);
    const tasa = Number(getTasa2({ ...data, amount }));
    console.log("amount", amount);
    const { price, maxprice, lmin, lmax, currency } = data;
    const incremento = Number(maxprice / price - 1);
    let monedas = Number(
      Math.sqrt(
        (lmax * lmax) / (4 * (incremento * incremento)) +
          (lmax * amount) / (incremento * price)
      ) -
        lmax / (2 * incremento)
    );
    if (monedas > lmax) {
      monedas = amount / maxprice;
    }
    let decimal;
    if (["HBD", "SBD", "HIVE", "STEEM", "EOS"].includes(currency)) {
      decimal = 3;
    } else if (["byte", "DOGE", "TRX", "BTS"].includes(currency)) {
      decimal = 0;
    } else {
      decimal = 8;
    }
    const myToFixed = (monedas, decimal) =>
      Number(Math.ceil(monedas + "e" + decimal) + "e-" + decimal);
    const resultado = myToFixed(monedas, decimal);
    let text = "";
    if (amount == "pene") {
      text += `
1 **${currency}** = Bs. **${milear(tasa.toFixed(2))}**`;
    } else {
      amount = Number(amount);
      if (monedas > 0 && monedas <= lmin) {
        text += `
1 **${currency}** = Bs. **${milear(tasa.toFixed(2))}**
Para obtener Bs. **${milear(
          amount.toFixed(2)
        )}** debes cambiar ${resultado} **${currency}**`;
      } else if (monedas > lmin) {
        text += `
Tasa: 1 **${currency}** = Bs. **${milear(tasa.toFixed(2))}**
Para obtener Bs. **${milear(
          amount.toFixed(2)
        )}** debes cambiar ${resultado} **${currency}**
Nota: La tasa de **${currency}** aumenta si cambias más de ${lmin} **${currency}**, la tasa máxima siendo Bs. **${milear(
          maxprice.toFixed(2)
        )}** al cambiar ${lmax} o más **${currency}**.`;
      } else {
        text += `**Error:** parámetro incorrecto, usa **$help** para obtener ayuda.`;
      }
    }
    return text;
  });

const getLinkText = (coin, amount = "pene", memo = "null") =>
  getCoinDetails(coin).then(({ data }) => {
    console.log("COIN COIN COIN", coin);
    const tasa = Number(getTasa({ ...data, amount }));
    console.log("amount", amount);
    console.log("memo", memo);
    const { maxprice, lmin, lmax, currency } = data;
    let text = "";
    if (memo == "null") {
      text += `****Error:** ausencia de **UMEMO**, usa **$help** para obtener ayuda.`;
    } else {
      amount = Number(amount);
      if (["HBD", "HIVE"].includes(currency)) {
        text += `Usa el siguiente enlace para vender **${amount} ${currency}** en nuestra plataforma:
https://hivesigner.com/sign/transfer?to=capybaraexchange&amount=${amount.toFixed(
          3
        )}%20${currency}&memo=${memo}`;
      } else if (["SBD", "STEEM"].includes(currency)) {
        text += `Usa el siguiente enlace para vender **${amount} ${currency}** en nuestra plataforma:
https://steemlogin.com/sign/transfer?to=capybaraexchange&amount=${amount.toFixed(
          3
        )}%20${currency}&memo=${memo}`;
      } else {
        text += `**Error:** parámetro incorrecto, usa **$help** para obtener ayuda.`;
      }
    }
    return text;
  });

const _isCommand = (prefix, text) => {
  const commandPrefix = "^" + (prefix === "$" ? "\\$" : prefix);
  const commandMiddle = "[a-z]+";
  const regex = new RegExp(commandPrefix + commandMiddle, "i");

  if (regex.test(text)) {
    const splatArgs = text.split(" ");
    const command = splatArgs[0].substr(prefix.length);
    const args = splatArgs.slice(1);

    return {
      status: true,
      command,
      args,
    };
  } else {
    return {
      status: false,
    };
  }
};

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", (msg) => {
  const isCommand = _isCommand("$", msg.content);
  if (isCommand.status) {
    client.emit("command:" + isCommand.command.toLowerCase(), {
      isCommand,
      msg,
    });
  }
});

client.on("command:p", (ctx) => {
  const { args } = ctx.isCommand;
  const coin = args[0];
  const amount = args[1];
  console.log(coin, amount);
  getExchangeText(coin, amount)
    .then((replyText) => ctx.msg.reply(replyText).catch(console.error))
    .catch((e) => console.error("ERROR ERROR ERROR"));
});

client.on("command:b", (ctx) => {
  const { args } = ctx.isCommand;
  const coin = args[0];
  const amount = args[1];
  console.log(coin, amount);
  getExchangeText2(coin, amount)
    .then((replyText) => ctx.msg.reply(replyText).catch(console.error))
    .catch("ERROR ERROR ERROR", console.error);
});

client.on("command:d", (ctx) => {
  const { args } = ctx.isCommand;
  const coin = args[0];
  const amount = args[1];
  console.log(coin, amount);
  getStockText(coin, amount)
    .then((replyText) => ctx.msg.reply(replyText).catch(console.error))
    .catch("ERROR ERROR ERROR", console.error);
});

client.on("command:orden", (ctx) => {
  const { args } = ctx.isCommand;
  const coin = args[0];
  const amount = args[1];
  const memo = args[2];
  console.log(coin, amount);
  getLinkText(coin, amount, memo)
    .then((replyText) => ctx.msg.reply(replyText).catch(console.error))
    .catch("ERROR ERROR ERROR", console.error);
});

client.on("command:help", (ctx) => {
  const { args } = ctx.isCommand;
  const coin = args[0];
  const amount = args[1];
  console.log(coin, amount);
  getHelpText(coin, amount)
    .then((replyText) => ctx.msg.reply(replyText).catch(console.error))
    .catch("ERROR ERROR ERROR", console.error);
});

const getHelpText = (coin = "HIVE", amount = "pene") =>
  getCoinDetails("HIVE").then(({ data }) => {
    console.log("COIN COIN COIN", coin);
    console.log("amount", amount);
    let text = "";
    return (text += `
**Lista de comandos:**
** *Price: $p moneda cantidad** te permite conocer la tasa actual para una moneda, e incluso calcular el equivalente en bolívares de ellas.

** *Bolívar: $b moneda cantidad** te permite conocer la tasa actual para una moneda, e incluso calcular el equivalente en monedas de un monto en bolívares.

** *Disponibilidad: $d** te permite conocer la disponibilidad actual.

** *Orden: $orden moneda cantidad UMEMO** te permite generar un link de **steemlogin/hivesigner** conociendo la cantidad de monedas a vender y tu **UMEMO.**.`);
  });

const getStockText = (coin = "HIVE", amount = "pene") =>
  getCoinDetails("HIVE").then(({ data }) => {
    console.log("COIN COIN COIN", coin);
    console.log("amount", amount);
    const { stock } = data;
    let text = "";
    return (text += `
La disponibilidad actual es: **${milear(stock)}Bs**`);
  });

client.on("error", console.error);

client.login(require("./secrets.json").token);
