import { Dimensions, PixelRatio } from "react-native";

const { width, height } = Dimensions.get("window");

// Base dimensions
const baseWidth = 375;
const baseHeight = 812;

// Dimensionador para largura
export const widthPercentageToDP = (widthPercent: number | string) => {
  const elemWidth =
    typeof widthPercent === "number" ? widthPercent : parseFloat(widthPercent);
  return PixelRatio.roundToNearestPixel((width * elemWidth) / 100);
};

// Dimensionador para altura
export const heightPercentageToDP = (heightPercent: number | string) => {
  const elemHeight =
    typeof heightPercent === "number"
      ? heightPercent
      : parseFloat(heightPercent);
  return PixelRatio.roundToNearestPixel((height * elemHeight) / 100);
};

// Escala com base na largura da tela
export const wp = (dimension: number) => {
  return (dimension / baseWidth) * width;
};

// Escala com base na altura da tela
export const hp = (dimension: number) => {
  return (dimension / baseHeight) * height;
};

// Escala de fontes
export const normalizeFont = (size: number) => {
  const scale = width / baseWidth;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};
