import React from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

/**
 * Forma orgânica — assinatura visual do Cíclica.
 *
 * Uma pétala/folha assimétrica, não um círculo. É o elemento que amarra ciclo,
 * feminino, natureza e transformação sem recorrer a uma flor óbvia. Aparece
 * como marca d'água no card herói, em fundos e no gráfico do ciclo.
 *
 * Nunca usar em opacidade alta: ela é textura, não ilustração.
 */

type Props = {
  size?: number;
  color?: string;
  /** Segunda cor: quando presente, a forma recebe um gradiente sutil. */
  colorSecondary?: string;
  opacity?: number;
  rotation?: number;
  style?: StyleProp<ViewStyle>;
};

/** Pétala apontada nas duas extremidades, com curvatura desigual. */
const PETALA = "M100 4 C168 46 192 128 100 236 C8 128 32 46 100 4 Z";

export default function FormaOrganica({
  size = 200,
  color = "#B79AC5",
  colorSecondary,
  opacity = 0.14,
  rotation = 0,
  style,
}: Props) {
  const gradienteId = `forma-${color.replace("#", "")}-${rotation}`;

  return (
    <View
      pointerEvents="none"
      style={[{ transform: [{ rotate: `${rotation}deg` }] }, style]}
    >
      <Svg width={size} height={size * 1.2} viewBox="0 0 200 240">
        {colorSecondary && (
          <Defs>
            <LinearGradient id={gradienteId} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={color} />
              <Stop offset="1" stopColor={colorSecondary} />
            </LinearGradient>
          </Defs>
        )}
        <Path
          d={PETALA}
          fill={colorSecondary ? `url(#${gradienteId})` : color}
          opacity={opacity}
        />
      </Svg>
    </View>
  );
}

/**
 * Agrupamento de pétalas usado como marca d'água. Três formas em ângulos
 * diferentes criam profundidade sem virar ilustração.
 */
export function MarcaDaguaOrganica({
  color = "#F7F4EF",
  style,
}: {
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View pointerEvents="none" style={style}>
      <FormaOrganica size={230} color={color} opacity={0.07} rotation={18} />
      <FormaOrganica
        size={170}
        color={color}
        opacity={0.05}
        rotation={-26}
        style={{ position: "absolute", top: 42, left: 52 }}
      />
      <FormaOrganica
        size={120}
        color={color}
        opacity={0.06}
        rotation={52}
        style={{ position: "absolute", top: 104, left: 8 }}
      />
    </View>
  );
}
