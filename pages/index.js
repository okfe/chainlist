import React, { useState, useEffect, useMemo } from "react";
import Head from "next/head";
import Web3 from "web3";
import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";
import {
  withTheme,
  createMuiTheme,
  ThemeProvider,
} from "@material-ui/core/styles";
import path from "path";
import {
  Grid,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Paper,
} from "@material-ui/core";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import Chain from "../components/chain";
import MultiChain from "../components/multichain";
import Header from "../components/header";

import SearchIcon from "@material-ui/icons/Search";
import AppsIcon from "@material-ui/icons/Apps";
import ListIcon from "@material-ui/icons/List";
import AddIcon from "@material-ui/icons/Add";
import useSWR from "swr";

import classes from "./index.module.css";
import stores from "../stores";
import { UPDATE_CONNECT_WALLET } from "../stores/constants";

const searchTheme = createMuiTheme({
  palette: {
    type: "light",
    primary: {
      main: "#2F80ED",
    },
  },
  shape: {
    borderRadius: "10px",
  },
  typography: {
    fontFamily: [
      "Inter",
      "Arial",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
    body1: {
      fontSize: "12px",
    },
  },
  overrides: {
    MuiPaper: {
      elevation1: {
        "box-shadow": "0px 7px 7px #0000000A;",
        "-webkit-box-shadow": "0px 7px 7px #0000000A;",
        "-moz-box-shadow": "0px 7px 7px #0000000A;",
      },
    },
    MuiInputBase: {
      input: {
        fontSize: "14px",
      },
    },
    MuiOutlinedInput: {
      input: {
        padding: "12.5px 14px",
      },
      notchedOutline: {
        borderColor: "#FFF",
      },
    },
  },
});

const fetcher = (...args) => fetch(...args).then((res) => res.json());

function Home({ changeTheme, theme }) {
  const { data, error } = useSWR(
    "https://static.oklink.com/cdn/assets/okexchain/chainlist/chains.json",
    fetcher
  );

  const [layout, setLayout] = useState("grid");
  const [search, setSearch] = useState("");
  const [hideMultichain, setHideMultichain] = useState("1");
  const router = useRouter();
  if (router.query.search) {
    setSearch(router.query.search);
    delete router.query.search;
  }

  const onSearchChanged = (event) => {
    setSearch(event.target.value);
  };

  const handleLayoutChanged = (event, newVal) => {
    if (newVal !== null) {
      setLayout(newVal);
      localStorage.setItem("yearn.finance-invest-layout", newVal ? newVal : "");
    }
  };

  const closeMultichain = (perma) => {
    setHideMultichain("1");
    localStorage.setItem("chainlist.org-hideMultichain", perma ? "1" : "0");
  };

  useEffect(() => {
    const multi = localStorage.getItem("chainlist.org-hideMultichain");
    if (multi) {
      setHideMultichain(multi);
    } else {
      setHideMultichain("0");
    }
  }, []);

  // 插件钱包切换账户时，对应的切换界面连接的账户
  useEffect(() => {
    const cb = async function (e) {
      if (window.okexchain) {
        stores.dispatcher.dispatch({ type: UPDATE_CONNECT_WALLET });
      }
    };
    window.addEventListener("focus", cb);
    return () => {
      window.removeEventListener("focus", cb);
    };
  }, []);

  const resData = useMemo(() => {
    // 取前100个chainlist
    if (!data) return [];
    if (search === "") return data.slice(0, 100);
    return data
      .filter((chain) => {
        return (
          chain.chain.toLowerCase().includes(search.toLowerCase()) ||
          chain.chainId
            .toString()
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          chain.name.toLowerCase().includes(search.toLowerCase()) ||
          (chain.nativeCurrency ? chain.nativeCurrency.symbol : "")
            .toLowerCase()
            .includes(search.toLowerCase())
        );
      })
      .slice(0, 100);
  }, [data, search]);

  const isLoading = !error && !data;

  return (
    <div className={styles.container}>
      <Head>
        <title>OKEx Chainlist</title>
        <meta name="google" content="notranslate" />
        <link
          rel="shortcut icon"
          href="https://static.okex.com/cdn/assets/imgs/MjAxODg/D91A7323087D31A588E0D2A379DD7747.png"
          type="image/png"
        ></link>
      </Head>

      <main className={styles.main}>
        <div
          className={
            theme.palette.type === "dark"
              ? classes.containerDark
              : classes.container
          }
        >
          <div
            className={
              theme.palette.type === "dark"
                ? classes.listContainerDark
                : classes.listContainer
            }
          >
            <div
              className={
                theme.palette.type === "dark"
                  ? classes.headerContainerDark
                  : classes.headerContainer
              }
            >
              <div className={classes.filterRow}>
                <ThemeProvider theme={searchTheme}>
                  <Paper className={classes.searchPaper}>
                    <TextField
                      fullWidth
                      className={classes.searchContainer}
                      variant="outlined"
                      placeholder="ETH, Fantom, ..."
                      value={search}
                      onChange={onSearchChanged}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <SearchIcon fontSize="small" />
                          </InputAdornment>
                        ),
                        startAdornment: (
                          <InputAdornment position="start">
                            <Typography
                              className={classes.searchInputAdnornment}
                            >
                              搜索网络
                            </Typography>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Paper>
                </ThemeProvider>
              </div>
              <Header changeTheme={changeTheme} />
            </div>
            <div
              className={
                isLoading
                  ? classes.cardsContainerLoading
                  : classes.cardsContainer
              }
            >
              {resData.map((chain, idx) => (
                <Chain chain={chain} key={idx} />
              ))}
              {isLoading && <div>加载中...</div>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default withTheme(Home);
