import React from 'react';
import Svg, { Path } from 'react-native-svg';
import theme from '../../theme/colors';

interface TabIconProps {
  focused: boolean;
  size?: number;
}

export function ProjectsIcon({ focused, size = 24 }: TabIconProps) {
  const color = focused ? theme.accent.primary : theme.text.muted;
  const fill = focused ? color + '20' : 'none';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 7V17C3 18.1 3.9 19 5 19H19C20.1 19 21 18.1 21 17V9C21 7.9 20.1 7 19 7H12L10 5H5C3.9 5 3 5.9 3 7Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={fill}
      />
    </Svg>
  );
}

export function BoardsIcon({ focused, size = 24 }: TabIconProps) {
  const color = focused ? theme.accent.primary : theme.text.muted;
  const fill = focused ? color + '20' : 'none';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 5V19H8V5H4Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={fill}
      />
      <Path
        d="M10 5V19H14V5H10Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={fill}
      />
      <Path
        d="M16 5V19H20V5H16Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={fill}
      />
    </Svg>
  );
}

export function AgendaIcon({ focused, size = 24 }: TabIconProps) {
  const color = focused ? theme.accent.primary : theme.text.muted;
  const fill = focused ? color + '20' : 'none';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 4H5C3.9 4 3 4.9 3 6V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={fill}
      />
      <Path
        d="M16 2V6"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8 2V6"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3 10H21"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function NotesIcon({ focused, size = 24 }: TabIconProps) {
  const color = focused ? theme.accent.primary : theme.text.muted;
  const fill = focused ? color + '20' : 'none';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={fill}
      />
      <Path
        d="M14 2V8H20"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8 13H16"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8 17H16"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function TimeIcon({ focused, size = 24 }: TabIconProps) {
  const color = focused ? theme.accent.primary : theme.text.muted;
  const fill = focused ? color + '20' : 'none';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={fill}
      />
      <Path
        d="M12 6V12L16 14"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function GoalsIcon({ focused, size = 24 }: TabIconProps) {
  const color = focused ? theme.accent.primary : theme.text.muted;
  const fill = focused ? color + '20' : 'none';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L15 7L21 8L17 12L18 19L12 16L6 19L7 12L3 8L9 7L12 2Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={fill}
      />
    </Svg>
  );
}

export function RoutinesIcon({ focused, size = 24 }: TabIconProps) {
  const color = focused ? theme.accent.primary : theme.text.muted;
  const fill = focused ? color + '20' : 'none';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 12C4 7.58172 7.58172 4 12 4C15.3137 4 18.173 6.01472 19.4142 8.85786"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20 4V9H15"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20 12C20 16.4183 16.4183 20 12 20C8.68629 20 5.82703 17.9853 4.58579 15.1421"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4 20V15H9"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 8V12L14.5 13.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={fill}
      />
    </Svg>
  );
}

export function ProfileIcon({ focused, size = 24 }: TabIconProps) {
  const color = focused ? theme.accent.primary : theme.text.muted;
  const fill = focused ? color + '20' : 'none';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={fill}
      />
      <Path
        d="M20 21C20 18.8783 19.1571 16.8434 17.6569 15.3431C16.1566 13.8429 14.1217 13 12 13C9.87827 13 7.84344 13.8429 6.34315 15.3431C4.84285 16.8434 4 18.8783 4 21"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ChevronRightIcon({ focused, size = 24 }: TabIconProps) {
  const color = focused ? theme.accent.primary : theme.text.muted;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18L15 12L9 6"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

interface PlusIconProps extends TabIconProps {
  color?: string;
}

export function PlusIcon({ focused, size = 24, color: customColor }: PlusIconProps) {
  const color = customColor || (focused ? theme.accent.primary : theme.text.muted);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5V19"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5 12H19"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

interface CheckIconProps extends TabIconProps {
  color?: string;
}

export function CheckIcon({ focused, size = 24, color: customColor }: CheckIconProps) {
  const color = customColor || (focused ? theme.accent.primary : theme.text.muted);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 6L9 17L4 12"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
