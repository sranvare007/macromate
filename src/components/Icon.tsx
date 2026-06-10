// Stroke icon set ported from the design files (ui.jsx).

import * as React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'home'
  | 'chart'
  | 'flame'
  | 'user'
  | 'plus'
  | 'mic'
  | 'keyboard'
  | 'sparkle'
  | 'check'
  | 'close'
  | 'chevR'
  | 'chevL'
  | 'chevD'
  | 'pencil'
  | 'trash'
  | 'arrowUp'
  | 'bolt'
  | 'dumbbell'
  | 'scale'
  | 'leaf'
  | 'clock'
  | 'sun'
  | 'moon'
  | 'star'
  | 'egg'
  | 'soundwave';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  stroke?: number;
  style?: StyleProp<ViewStyle>;
}

export function Icon({ name, size = 24, color = '#fff', stroke = 2, style }: IconProps) {
  const p = {
    fill: 'none',
    stroke: color,
    strokeWidth: stroke,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  } as const;

  const paths: Record<IconName, React.ReactNode> = {
    home: (
      <>
        <Path {...p} d="M3 10.5 12 3l9 7.5" />
        <Path {...p} d="M5.5 9.5V20a1 1 0 0 0 1 1H17.5a1 1 0 0 0 1-1V9.5" />
      </>
    ),
    chart: (
      <>
        <Path {...p} d="M4 19V5" />
        <Path {...p} d="M4 19h16" />
        <Path {...p} d="M8 16l3.5-4 3 2.5L20 8" />
      </>
    ),
    flame: (
      <Path {...p} d="M12 3c.5 3-2 4-2 7a2 2 0 0 0 4 0c0-.8-.3-1.4-.3-1.4 2 1 3.3 3 3.3 5.4a5 5 0 1 1-10 0C7 11 12 9.5 12 3Z" />
    ),
    user: (
      <>
        <Circle {...p} cx="12" cy="8" r="3.6" />
        <Path {...p} d="M5.5 20c.6-3.4 3.3-5.4 6.5-5.4s5.9 2 6.5 5.4" />
      </>
    ),
    plus: (
      <>
        <Path {...p} d="M12 5v14" />
        <Path {...p} d="M5 12h14" />
      </>
    ),
    mic: (
      <>
        <Rect {...p} x="9" y="3" width="6" height="11" rx="3" />
        <Path {...p} d="M5.5 11.5a6.5 6.5 0 0 0 13 0" />
        <Path {...p} d="M12 18v3" />
      </>
    ),
    keyboard: (
      <>
        <Rect {...p} x="3" y="6" width="18" height="12" rx="2.5" />
        <Path {...p} d="M7 10h0M11 10h0M15 10h0M8 14h8" />
      </>
    ),
    sparkle: (
      <>
        <Path {...p} d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6L12 4Z" />
        <Path {...p} d="M18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z" />
      </>
    ),
    check: <Path {...p} d="M5 12.5l4.5 4.5L19 7" />,
    close: (
      <>
        <Path {...p} d="M6 6l12 12" />
        <Path {...p} d="M18 6 6 18" />
      </>
    ),
    chevR: <Path {...p} d="M9 5l7 7-7 7" />,
    chevL: <Path {...p} d="M15 5l-7 7 7 7" />,
    chevD: <Path {...p} d="M5 9l7 7 7-7" />,
    pencil: (
      <>
        <Path {...p} d="M14.5 5.5l4 4" />
        <Path {...p} d="M4 20l1-4L16 5l3 3L8 19l-4 1Z" />
      </>
    ),
    trash: (
      <>
        <Path {...p} d="M4 7h16" />
        <Path {...p} d="M9 7V5h6v2" />
        <Path {...p} d="M6 7l1 13h10l1-13" />
      </>
    ),
    arrowUp: (
      <>
        <Path {...p} d="M12 19V6" />
        <Path {...p} d="M6 11l6-6 6 6" />
      </>
    ),
    bolt: <Path {...p} d="M13 3 5 13h6l-1 8 8-10h-6l1-8Z" />,
    dumbbell: (
      <>
        <Path {...p} d="M3 9v6M6 7v10M18 7v10M21 9v6" />
        <Path {...p} d="M6 12h12" />
      </>
    ),
    scale: (
      <>
        <Rect {...p} x="3.5" y="4.5" width="17" height="15" rx="3.5" />
        <Path {...p} d="M8 11a4 4 0 0 1 8 0" />
        <Path {...p} d="M12 11l2.4-1.6" />
      </>
    ),
    leaf: <Path {...p} d="M5 19c0-8 6-13 14-13 0 8-5 14-13 14-1 0-1-1-1-1Z" />,
    clock: (
      <>
        <Circle {...p} cx="12" cy="12" r="8.5" />
        <Path {...p} d="M12 7.5V12l3 2" />
      </>
    ),
    sun: (
      <>
        <Circle {...p} cx="12" cy="12" r="4" />
        <Path {...p} d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" />
      </>
    ),
    moon: <Path {...p} d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5Z" />,
    star: <Path {...p} d="M12 4l2.3 4.8 5.2.7-3.8 3.6.9 5.2L12 16.6 7.4 18.3l.9-5.2L4.5 9.5l5.2-.7L12 4Z" />,
    egg: <Path {...p} d="M12 3c4 0 6 6 6 10a6 6 0 0 1-12 0c0-4 2-10 6-10Z" />,
    soundwave: <Path {...p} d="M3 12h0M7 8v8M11 5v14M15 8v8M19 11v2M21 12h0" />,
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
      {paths[name]}
    </Svg>
  );
}
