import Svg, { Line, Path } from "react-native-svg";

interface BackspaceKeyIconProps {
  size?: number;
  fill?: string;
  markColor?: string;
}

export function BackspaceKeyIcon({
  size = 46,
  fill = "#FFFFFF",
  markColor = "#0D2D6E",
}: BackspaceKeyIconProps) {
  const height = (size * 28) / 46;

  return (
    <Svg width={size} height={height} viewBox="0 0 46 28">
      <Path
        d="M15.5 1.5H41.5C43.5 1.5 44.5 3 44.5 14C44.5 25 43.5 26.5 41.5 26.5H15.5L1.5 14Z"
        fill={fill}
      />
      <Line
        x1="21"
        y1="9"
        x2="31"
        y2="19"
        stroke={markColor}
        strokeWidth={2.6}
        strokeLinecap="round"
      />
      <Line
        x1="31"
        y1="9"
        x2="21"
        y2="19"
        stroke={markColor}
        strokeWidth={2.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}
