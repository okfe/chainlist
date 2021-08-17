import {
  ERROR,
  STORE_UPDATED,
  CONFIGURE,
  ACCOUNT_CONFIGURED,
  ACCOUNT_CHANGED,
  TRY_CONNECT_WALLET,
  UPDATE_CONNECT_WALLET,
} from "./constants";

import stores from "./";

import Web3 from "web3";
import { whatBrowser } from "../utils";

const pluginUrl = {
  chrome:
    "https://chrome.google.com/webstore/detail/okex-wallet/mcohilncbfahbmgdjkbpemcciiolgcge?hl=zh-CN",
  firefox: "https://addons.mozilla.org/zh-CN/firefox/addon/okexwallet/",
};

class Store {
  constructor(dispatcher, emitter) {
    this.dispatcher = dispatcher;
    this.emitter = emitter;

    this.store = {
      account: null,
      web3: null,
    };

    dispatcher.register(
      function (payload) {
        switch (payload.type) {
          case CONFIGURE:
            this.configure(payload);
            break;
          case TRY_CONNECT_WALLET:
            this.tryConnectWallet(payload);
            break;
          case UPDATE_CONNECT_WALLET:
            this.configure();
            break;
          default:
            break;
        }
      }.bind(this)
    );
  }

  getStore(index) {
    return this.store[index];
  }

  setStore(obj) {
    this.store = { ...this.store, ...obj };
    return this.emitter.emit(STORE_UPDATED);
  }

  configure = async () => {
    if (window.okexchain) {
      await this.okexchainConnectWallet();
    }
  };

  updateAccount = () => {
    const that = this;
    const res = window.ethereum.on("accountsChanged", function (accounts) {
      that.setStore({ account: { address: accounts[0] } });
      that.emitter.emit(ACCOUNT_CHANGED);
      that.emitter.emit(ACCOUNT_CONFIGURED);
    });
  };

  getWeb3Provider = async () => {
    let web3context = this.getStore("web3context");
    let provider = null;

    if (!web3context) {
      provider = network.providers["1"];
    } else {
      provider = web3context.library.provider;
    }

    if (!provider) {
      return null;
    }
    return new Web3(provider);
  };

  okexchainConnectWallet = async () => {
    window.web3 = new Web3(okexchain);
    try {
      await okexchain.enable();
      var accounts = await web3.eth.getAccounts();
      this.setStore({ account: { address: accounts[0] }, web3: window.web3 });
      this.emitter.emit(ACCOUNT_CONFIGURED);
    } catch (error) {
      // User denied account access...
    }
  };

  tryConnectWallet = async () => {
    if (window.okexchain) {
      await this.okexchainConnectWallet();
    }
    // Non-dapp browsers...
    else {
      console.log(
        `连接钱包失败，请先下载浏览器插件 ${pluginUrl[whatBrowser()]}`
      );
      // alert("连接钱包失败，请先下载浏览器插件");
      stores.emitter.emit(ERROR, "连接钱包失败，请先下载浏览器插件");
      // 用户点击时执行
      this.newTab = window.open("about:blank");
      // 获取start_url成功后执行
      this.newTab.location.href = pluginUrl[whatBrowser()];
    }
  };
}

export default Store;
