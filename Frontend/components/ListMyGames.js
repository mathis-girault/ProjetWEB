import { useState, useEffect } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import ListParties from "./ListParties";
import SizedText from "./SizedText";

const config = require("../config");
const { BACKEND } = config;

export default function ListMyGames({token}) {
  const [parties, setParties] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    // TODO, uniquement parties auxquelles joueur X participe
    fetch(`${BACKEND}/game`, {
      headers: {
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "x-access-token": token
      },
    })
      .then((res) => res.json())
      .then((json) => setParties(json))
      .catch((error) => console.log(error));
  }, []);

  function joinMyGame() {
    // TODO

    console.log(selectedId);
    // fetch(`${BACKEND}/game/${selectedId}`, {
    //   method: "POST",
    //   headers: {
    //     "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    //   },
    // })
    //   .then((res) => res.json())
    //   .then((json) => setParties(json))
    //   .catch((error) => console.log(error));
  }

  return (
    <SafeAreaView style={{ backgroundColor: "white" }}>
      <View style={styles.container}>
        <SizedText
          label={"Liste des parties auxquelles vous participez déjà : (TODO)"}
          size={"large"}
          textStyle={styles.title}
        />
        <ListParties
          parties={parties}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          onPress={joinMyGame}
          onPressLabel={"Je lance la partie"}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontWeight: "bold",
  },
  container: {
    margin: 15,
  },
});
