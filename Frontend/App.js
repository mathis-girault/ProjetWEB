import { StatusBar } from "expo-status-bar";
import { useState, React, useEffect } from "react";
import { StyleSheet, View, SafeAreaView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoginForm from "./components/LoginForm";
import MenuSelection from "./components/MenuSelection";
import ConnectedHeader from "./components/ConnectedHeader";
import CreateNewGame from "./components/CreateNewGame";
import ListNewGames from "./components/ListNewGames";
import ListMyGames from "./components/ListMyGames";
import { fetchData } from "./utils/fetchData";

const config = require("./config.js");
const { BACKEND } = config;

export default function App() {
  const [token, setToken] = useState(null);
  const [loggingState, setLoggingState] = useState(true);
  const [menuState, setMenuState] = useState(0);
  const [errorTextValue, setErrorTextValue] = useState("");
  const [connectedUsername, setConnectedUsername] = useState("");

  useEffect(() => {
    // Si le token existe deja a la connexion
    console.log("Trying to retrieve token");
    AsyncStorage.getItem("token").then((retrievedToken) => {
      if (retrievedToken != null) {
        fetchData("whoami", "GET")
          .then((json) => {
            if (json.username != null) {
              setConnectedUsername(json.username);
              setToken(retrievedToken);
            }
          })
          .catch((error) => console.log(error));
      }
    });
  }, []);

  function connect(username, password) {
    const loginURL = loggingState ? `${BACKEND}/login` : `${BACKEND}/signin`;
    fetch(loginURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": BACKEND,
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          setErrorTextValue(json.message);
        } else if (json.data.token) {
          setErrorTextValue("");
          setConnectedUsername(json.data.username);
          setToken(json.data.token);
          AsyncStorage.setItem("token", json.data.token)
            .then(() => console.log("Token stored successfully"))
            .catch((error) => console.log(error));
          if (!loggingState) {
            window.alert(
              `Bienvenue ${json.data.username}, vous avez été inscrit.`
            );
          }
        } else {
          setErrorTextValue("Server error, should not happen");
        }
      })
      .catch((error) => {
        setErrorTextValue("Erreur serveur");
        console.log(error);
      });
  }

  async function disconnect() {
    try {
      await AsyncStorage.removeItem("token");
      console.log("Removed token from storage succesfully");
    } catch (e) {
      console.log("Could not remove token from storage");
    }
    setMenuState(0);
    setToken(null);
    setLoggingState(true);
    setErrorTextValue("");
    setConnectedUsername("");
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "white" }]}>
      <StatusBar translucent={false} backgroundColor="white" />

      {!token ? (
        // If no token (user non connected)
        <LoginForm
          onConnect={connect}
          errorTextValue={errorTextValue}
          setErrorTextValue={setErrorTextValue}
          loggingState={loggingState}
          setLoggingState={setLoggingState}
        />
      ) : (
        // If token (user connected)
        <View style={[styles.container, { backgroundColor: "white" }]}>
          <ConnectedHeader
            username={connectedUsername}
            onDisconnect={disconnect}
            menuState={menuState}
            onMenu={() => setMenuState(0)}
          />

          {menuState === 0 ? (
            <MenuSelection onMenuChoose={setMenuState} />
          ) : menuState === 1 ? (
            <ListNewGames onDisconnect={disconnect} />
          ) : menuState === 2 ? (
            <ListMyGames onDisconnect={disconnect} />
          ) : (
            <CreateNewGame
              setMenuState={setMenuState}
              onDisconnect={disconnect}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
