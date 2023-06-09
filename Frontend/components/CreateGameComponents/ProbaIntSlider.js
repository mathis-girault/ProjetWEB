import React from "react";
import { View, Platform } from "react-native";
import Slider from "@react-native-community/slider";
import SizedText from "../SizedText";
import PropTypes from "prop-types";

export default function ProbaIntSlider({ proba, setProba, labelProba }) {
  const numFactor = 1000;

  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <SizedText
        label={labelProba}
        size="large"
        textStyle={{ fontWeight: "bold", textAlign: "center" }}
      />
      <SizedText
        label={proba.toString()}
        size="large"
        textStyle={{ fontWeight: "bold", textAlign: "center" }}
      />

      <Slider
        style={{ width: "100%", height: 10 }}
        minimumValue={0}
        maximumValue={numFactor}
        step={1}
        minimumTrackTintColor="rgb(255,0,0)"
        maximumTrackTintColor="rgb(0,0,255)"
        value={proba * numFactor}
        onValueChange={(value) => {
          if (Platform.OS !== "web") {
            clearTimeout(this.sliderTimeoutId);
            this.sliderTimeoutId = setTimeout(() => {
              setProba(value / numFactor);
            }, 5);
          } else {
            setProba(value / numFactor);
          }
        }}
      />
    </View>
  );
}

ProbaIntSlider.propTypes = {
  proba: PropTypes.number.isRequired,
  setProba: PropTypes.func.isRequired,
  labelProba: PropTypes.string.isRequired,
};
