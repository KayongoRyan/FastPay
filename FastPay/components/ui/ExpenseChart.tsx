import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { StyleSheet, View } from "react-native";

import { colors } from "@/theme/colors";
import { radius } from "@/theme/spacing";

const DATA = [40, 55, 45, 70, 60, 85, 75];
const WIDTH = 320;
const HEIGHT = 120;

function buildPath(values: number[]): string {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = WIDTH / (values.length - 1);

  const points = values.map((value, index) => {
    const x = index * step;
    const y = HEIGHT - ((value - min) / range) * (HEIGHT - 20) - 10;
    return { x, y };
  });

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    path += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
  }

  return path;
}

export function ExpenseChart() {
  const linePath = buildPath(DATA);
  const areaPath = `${linePath} L ${WIDTH} ${HEIGHT} L 0 ${HEIGHT} Z`;

  return (
    <View style={styles.wrap}>
      <Svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <Defs>
          <LinearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.chartFill} stopOpacity="1" />
            <Stop offset="100%" stopColor={colors.chartFill} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Path d={areaPath} fill="url(#fill)" />
        <Path
          d={linePath}
          fill="none"
          stroke={colors.chartLine}
          strokeWidth={2.5}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.md,
    overflow: "hidden",
    marginVertical: 8,
  },
});
