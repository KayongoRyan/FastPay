import Svg, { Path, Rect } from "react-native-svg";

interface FastPayLogoProps {
  size?: number;
  color?: string;
}

export function FastPayLogo({ size = 48, color = "#FFFFFF" }: FastPayLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Rect x="8" y="10" width="6" height="28" rx="2" fill={color} />
      <Rect x="21" y="16" width="6" height="22" rx="2" fill={color} />
      <Path
        d="M34 10C34 10 40 14 40 24C40 34 34 38 34 38"
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

export function FastPayWordmark({ color = "#FFFFFF" }: { color?: string }) {
  return (
  <Svg width={140} height={24} viewBox="0 0 140 24">
    <Path
      d="M0 2h18.4l1.2 14.8h.2L21.2 2H39.6v20H31V9.4h-.2L28.8 22h-6.8L19.4 9.4h-.2V22H10.4V2H0zm44.8 0h8.4v20H44.8V2zm14.4 0h18.2c5.4 0 9 3.4 9 8.6 0 4-2.2 6.8-5.6 7.8L88.4 22h-9.2l-5.8-8.2h-3.4V22H59.2V2zm8.4 5.2v5.4h8.2c1.8 0 2.8-.8 2.8-2.6s-1-2.8-2.8-2.8h-8.2zm24.2-5.2h8.6l9.4 20h-9l-1.4-3.4h-9.8L88.8 22h-9l9.4-20zm4.4 6.2l-2.8 6.8h5.6l-2.8-6.8z"
      fill={color}
    />
  </Svg>
  );
}
