import React from 'react';
import {Box, Typography, useMediaQuery, useTheme} from "@mui/material";
import UploadFiles from "./UploadFiles";
import {useSelector} from "react-redux";


const MapSettings = () => {
    const user = useSelector((state) => state.user)
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('lg'));


    return (
        <Box display={'flex'} alignItems={'flex-start'} flexDirection={'column'} gap={3}>
            <Box textAlign={'left'}>
                <Typography variant="body2" color="textSecondary">
                    Загрузите ваши кмл файлы для импорта полей.
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Поддерживаемый формат —Google KML (.kml файл)
                </Typography>
            </Box>
            <Box display={'flex'} flexDirection={isSmallScreen ? "column" : "row"} alignItems={'flex-start'} gap={5}>

                {
                    user?.userInfo?.module && (user.userInfo.module.includes('fields') || user.userInfo.module.includes('fields_v2')) ?
                        <Box display={'flex'} flexDirection={'column'} textAlign={'left'} gap={2}>
                            <Typography variant="h6" color="textSecondary">
                                Слой "Поля"
                            </Typography>
                            <UploadFiles url={"/fields_v2/upload_kml"}/>
                        </Box>
                        :
                        null
                }

                {
                    user?.userInfo?.module && user.userInfo.module.includes('cartogram') ?
                        <Box display={'flex'} flexDirection={'column'} textAlign={'left'} gap={2}>
                            <Typography variant="h6" color="textSecondary">
                                Слой “Картограммы”
                            </Typography>
                            <UploadFiles url={"/cartogram"}/>
                        </Box>
                        :
                        null
                }
                {
                    user?.userInfo?.module && user.userInfo.module.includes('state_monitoring') ?
                        <Box display={'flex'} flexDirection={'column'} textAlign={'left'} gap={2}>
                            <Typography variant="h6" color="textSecondary">
                                Слой “Госмониторинг”
                            </Typography>
                            <UploadFiles url={"/state_monitoring"}/>
                        </Box>
                        :
                        null
                }
            </Box>

        </Box>
    );
};

export default MapSettings;