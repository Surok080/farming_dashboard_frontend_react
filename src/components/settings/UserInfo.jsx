import React from 'react';
import {useSelector} from "react-redux";
import {Box, Typography} from "@mui/material";
import dayjs from "dayjs";

const UserInfo = () => {
    const user = useSelector((state) => state.user);

    return (
        <Box display={'flex'} pb={3} flexDirection={'column'} gap={3} alignItems={'flex-start'}>
            <Box display={'flex'} justifyContent={'center'} alignItems={'center'} gap={2}>
                <Typography variant={'body1'} color={'textSecondary'} >
                   Организация:
                </Typography>
                <Typography sx={{fontWeight: 'bold'}} variant={'body1'} >
                    {user.userInfo.organization ?? 'Нет названия организации'}
                </Typography>
            </Box>
            <Box display={'flex'} justifyContent={'center'} alignItems={'center'} gap={2}>
                <Typography variant={'body1'} color={'textSecondary'} >
                    E-MAIL:
                </Typography>
                <Typography sx={{fontWeight: 'bold'}} variant={'body1'} >
                    {user.userInfo.email ?? 'Нет адреса электронной почты'}
                </Typography>
            </Box>
            <Box display={'flex'} justifyContent={'center'} alignItems={'center'} gap={2}>
                <Typography variant={'body1'} color={'textSecondary'} >
                    ИНН:
                </Typography>
                <Typography sx={{fontWeight: 'bold'}} variant={'body1'} >
                    {user.userInfo.inn ?? 'Нет ИНН'}
                </Typography>
            </Box>
            <Box display={'flex'} justifyContent={'center'} alignItems={'center'} gap={2}>
                <Typography variant={'body1'} color={'textSecondary'} >
                    Дата регистрации:
                </Typography>
                <Typography sx={{fontWeight: 'bold'}} variant={'body1'} >
                    {dayjs(user.userInfo.create_date).format('DD.MM.YYYY') ?? 'Нет даты регистрации'}
                </Typography>
            </Box>
        </Box>
    );
};

export default UserInfo;