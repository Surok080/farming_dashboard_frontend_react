import React from 'react';
import {Box, Link, Typography, useMediaQuery, useTheme} from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import UploadFiles from "./UploadFiles";
import {useSelector} from "react-redux";
import testKmlUrl from "../../docs/test.kml?url";

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

            <Box textAlign="left" sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.primary" sx={{ mb: 1.5 }}>
                    Используйте ссылку ниже, чтобы скачать пример KML-файла
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                *.kml-формат файл для импорта полей в систему Агро-Коннет, в раздел “Поля”
                Поддерживаемый формат - Google KML (.kml файл).
                </Typography>

                <Box display="flex" alignItems="center" gap={1.25}>
                    <Box
                        sx={{
                            width: 40,
                            height: 48,
                            borderRadius: 1,
                            border: "1px solid",
                            borderColor: "divider",
                            backgroundColor: "#fafafa",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        <DescriptionOutlinedIcon sx={{ fontSize: 22, color: "text.secondary" }} />
                        <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 700, lineHeight: 1, mt: 0.25 }}>
                            KML
                        </Typography>
                    </Box>
                    <Link
                        href={testKmlUrl}
                        download="test.kml"
                        underline="hover"
                        sx={{ fontSize: 14 }}
                    >
                        Скачать test.kml
                    </Link>
                </Box>
            </Box>

        </Box>
    );
};

export default MapSettings;
