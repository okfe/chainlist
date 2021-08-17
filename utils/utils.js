import BigNumber from "bignumber.js";

// todo: get navigator declared somehow? probably an issue with using nextjs
// function getLang() {
//  if (window.navigator.languages != undefined)
//   return window.navigator.languages[0];
//  else
//   return window.navigator.language;
// }

export function formatCurrency(amount, decimals = 2) {
  if (!isNaN(amount)) {
    const formatter = new Intl.NumberFormat(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    return formatter.format(amount);
  } else {
    return 0;
  }
}

export function formatAddress(address, length = "short") {
  if (address && length === "short") {
    address =
      address.substring(0, 6) +
      "..." +
      address.substring(address.length - 4, address.length);
    return address;
  } else if (address && length === "long") {
    address =
      address.substring(0, 12) +
      "..." +
      address.substring(address.length - 8, address.length);
    return address;
  } else {
    return null;
  }
}

export function bnDec(decimals) {
  return new BigNumber(10).pow(parseInt(decimals));
}

export function getProvider() {
  if (
    typeof window !== "undefined" &&
    typeof window.okexchain !== "undefined"
  ) {
    if (window.okexchain.isOKExWallet) return "OKEx";
  }
  return "Wallet";
}

export const prefix = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function whatBrowser() {
  const agent = navigator.userAgent.toLowerCase();
  if (agent.indexOf("chrome") > 0) {
    return "chrome";
  }
  if (agent.indexOf("firefox") > 0) {
    return "firefox";
  }
  if (agent.indexOf("trident") > 0) {
    return "ie";
  }

  return "chrome";
}
