import React, { useState, useEffect } from "react";
import { StyleSheet, View, SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  LoginForm,
  MenuSelection,
  ConnectedHeader,
  CreateNewGame,
  ListNewGames,
  ListMyGames,
  DisplayMessage,
  Game,
} from "./components";

import { fetchData } from "./utils/fetchData";

const config = require("./config.js");
const { BACKEND } = config;

export default function App() {
  const [token, setToken] = useState(null);
  const [loggingState, setLoggingState] = useState(true);
  const [menuState, setMenuState] = useState(0);
  const [errorTextValue, setErrorTextValue] = useState("");
  const [connectedUsername, setConnectedUsername] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    // Si le token existe deja a la connexion
    console.log("Trying to retrieve token...");
    AsyncStorage.getItem("token").then((retrievedToken) => {
      if (retrievedToken != null) {
        fetchData("whoami", "GET")
          .then((json) => {
            if (json.username != null) {
              setConnectedUsername(json.username);
              setToken(retrievedToken);
              console.log("Retrieved !");

              // Si le joueur était entrain de jouer a une partie
              AsyncStorage.getItem("idGame").then((idGame) => {
                if (idGame != null) {
                  console.log("Reconnecting to game " + idGame);
                  setMenuState(4);
                }
              });
            } else {
              console.log("No token found.");
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
          setConnectedUsername(json.data.username);
          setToken(json.data.token);
          AsyncStorage.setItem("token", json.data.token)
            .then(() => console.log("Token stored successfully"))
            .catch((error) => console.log(error));
          if (!loggingState) {
            setModalVisible(true);
            setErrorTextValue(
              `Bienvenue ${json.data.username}, vous avez été inscrit avec succès.`
            );
          }
          <MenuSelection onMenuChoose={setMenuState} />;
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
    } catch (e) {
      console.log("Could not remove token from storage");
    }
    toMenu();
    setToken(null);
    setLoggingState(true);
    setErrorTextValue("");
    setConnectedUsername("");
  }

  async function toMenu() {
    try {
      await AsyncStorage.removeItem("idGame");
    } catch (e) {
      console.log("Could not remove game from storage");
    }
    setMenuState(0);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "black" }]}>
      <StatusBar translucent={false} style="light" backgroundColor="black" />

      <DisplayMessage
        visible={modalVisible}
        textMessage={errorTextValue}
        onPress={() => setModalVisible(false)}
      />

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
            onMenu={toMenu}
          />

          {menuState === 0 ? (
            <MenuSelection onMenuChoose={setMenuState} />
          ) : menuState === 1 ? (
            <ListNewGames
              setMenuState={setMenuState}
              onDisconnect={disconnect}
            />
          ) : menuState === 2 ? (
            <ListMyGames
              setMenuState={setMenuState}
              onDisconnect={disconnect}
            />
          ) : menuState === 3 ? (
            <CreateNewGame
              setMenuState={setMenuState}
              onDisconnect={disconnect}
            />
          ) : (
            <Game token={token} />
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
