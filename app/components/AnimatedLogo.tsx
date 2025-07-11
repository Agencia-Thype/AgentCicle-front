// app/components/AnimatedLogo.tsx
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import * as Animatable from "react-native-animatable";
import { ImageStyle } from "react-native";

export const    AnimatedLogo = forwardRef<any, { style?: ImageStyle }>(
  (props, ref) => {
    const internalRef = useRef<any>(null);

    // Expõe métodos personalizados para fora
    useImperativeHandle(ref, () => ({
      animateOut: (onEnd?: () => void) => {
        internalRef.current?.fadeOutUp(500).then(() => {
          if (onEnd) onEnd();
        });
      },
      animateIn: () => {
        internalRef.current?.fadeInDown(1000);
      },
    }));

    return (
      <Animatable.Image
        ref={internalRef}
        animation="fadeInDown"
        duration={1000}
        source={require("../assets/logo.png")}
        style={{
          width: 160,
          height: 130,
          alignSelf: "center",
          marginBottom: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
          ...props.style,
        }}
        resizeMode="contain"
      />
    );
  }
);
