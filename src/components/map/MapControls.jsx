import React from 'react';
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';
import WallpaperIcon from '@mui/icons-material/Wallpaper';
import ModeOfTravelIcon from '@mui/icons-material/ModeOfTravel';

const actions = [
  { icon: <WallpaperIcon />, name: 'Космоснимки', action: 'satellite' },
  { icon: <ModeOfTravelIcon />, name: 'Телеметрия', action: 'telemetry' },
];

const MapControls = ({ openSpeedDial, setOpenSpeedDial, onActionClick }) => {
  const handleActionClick = (action) => {
    onActionClick(action.action);
    setOpenSpeedDial(false);
  };

  return (
    <SpeedDial
      ariaLabel="Дополнительные функции"
      sx={{
        position: 'absolute',
        bottom: 16,
        right: 220,
        zIndex: 1000
      }}
      icon={<SpeedDialIcon />}
      onClose={() => setOpenSpeedDial(false)}
      onOpen={() => setOpenSpeedDial(true)}
      open={openSpeedDial}
    >
      {actions.map((action) => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          tooltipTitle={action.name}
          tooltipOpen={true}
          onClick={() => handleActionClick(action)}
        />
      ))}
    </SpeedDial>
  );
};

export default MapControls;

