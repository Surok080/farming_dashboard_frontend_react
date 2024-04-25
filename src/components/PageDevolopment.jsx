import React from 'react';
import {Box, CircularProgress} from "@mui/material";

const PageDevelopment = () => {
    return (
        <Box display={'flex'} flexDirection={'column'} height={'100%'} alignItems="center" justifyContent={'center'}>
                Страница находится в разработке
            <CircularProgress sx={{marginTop: '50px'}} color="inherit"/>
        </Box>
    );
};

export default PageDevelopment;