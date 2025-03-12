import React from 'react';
import {Box, Typography} from "@mui/material";
import UploadFiles from "./UploadFiles";


const MapSettings = () => {


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
            <Box display={'flex'} alignItems={'flex-start'} gap={5}>
                <Box display={'flex'} flexDirection={'column'} textAlign={'left'} gap={2}>
                    <Typography variant="h6" color="textSecondary">
                        Слой “Поля”
                    </Typography>
                    <UploadFiles url={"/fields/upload_file"}/>
                </Box>

                <Box display={'flex'} flexDirection={'column'} textAlign={'left'} gap={2}>
                    <Typography variant="h6" color="textSecondary">
                        Слой “Картограммы”
                    </Typography>
                    <UploadFiles url={"/cartogram/upload_cartogram"}/>
                </Box>

                <Box display={'flex'} flexDirection={'column'} textAlign={'left'} gap={2}>
                    <Typography variant="h6" color="textSecondary">
                        Слой “Госмониторинг”
                    </Typography>
                    <UploadFiles url={"/state_monitoring/upload_plots"}/>
                </Box>
            </Box>

        </Box>
    );
};

export default MapSettings;