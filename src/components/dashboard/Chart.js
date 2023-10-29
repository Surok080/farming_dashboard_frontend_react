import * as React from 'react';
import { useTheme } from '@mui/material/styles';

import Title from './Title';

// Generate Sales Data
function createData(time, amount) {
  return { time, amount };
}


export default function Chart() {

  return (
    <React.Fragment>
      <Title>Today</Title>
    </React.Fragment>
  );
}
