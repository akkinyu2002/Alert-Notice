import { Icon as IconifyIcon } from '@iconify/react';
import homeOutline from '@iconify-icons/mdi/home-outline';
import alertOutline from '@iconify-icons/mdi/alert-outline';
import waterOutline from '@iconify-icons/mdi/water-outline';
import bellOutline from '@iconify-icons/mdi/bell-outline';
import viewDashboardOutline from '@iconify-icons/mdi/view-dashboard-outline';
import plusIcon from '@iconify-icons/mdi/plus';
import accountGroupOutline from '@iconify-icons/mdi/account-group-outline';
import accountOutline from '@iconify-icons/mdi/account-outline';
import menuIcon from '@iconify-icons/mdi/menu';
import closeIcon from '@iconify-icons/mdi/close';
import phoneOutline from '@iconify-icons/mdi/phone-outline';
import mapMarkerOutline from '@iconify-icons/mdi/map-marker-outline';
import checkIcon from '@iconify-icons/mdi/check';
import noteTextOutline from '@iconify-icons/mdi/note-text-outline';
import heartOutline from '@iconify-icons/mdi/heart-outline';
import wavesIcon from '@iconify-icons/mdi/waves';
import fireIcon from '@iconify-icons/mdi/fire';
import earthIcon from '@iconify-icons/mdi/earth';
import roadVariant from '@iconify-icons/mdi/road-variant';
import terrainIcon from '@iconify-icons/mdi/terrain';
import bullhornOutline from '@iconify-icons/mdi/bullhorn-outline';
import clockOutline from '@iconify-icons/mdi/clock-outline';
import radioTower from '@iconify-icons/mdi/radio-tower';
import officeBuildingOutline from '@iconify-icons/mdi/office-building-outline';
import arrowRight from '@iconify-icons/mdi/arrow-right';

const iconSet = {
  home: homeOutline,
  alert: alertOutline,
  blood: waterOutline,
  bell: bellOutline,
  dashboard: viewDashboardOutline,
  plus: plusIcon,
  users: accountGroupOutline,
  user: accountOutline,
  menu: menuIcon,
  close: closeIcon,
  phone: phoneOutline,
  location: mapMarkerOutline,
  check: checkIcon,
  xmark: closeIcon,
  note: noteTextOutline,
  heart: heartOutline,
  wave: wavesIcon,
  fire: fireIcon,
  quake: earthIcon,
  road: roadVariant,
  mountain: terrainIcon,
  warning: alertOutline,
  megaphone: bullhornOutline,
  clock: clockOutline,
  tower: radioTower,
  building: officeBuildingOutline,
  arrow: arrowRight,
};

export default function Icon({ name, size = 18, className = '', strokeWidth = 1.9 }) {
  const glyph = iconSet[name] || iconSet.megaphone;

  return (
    <IconifyIcon
      icon={glyph}
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
      style={{ strokeWidth }}
    />
  );
}
