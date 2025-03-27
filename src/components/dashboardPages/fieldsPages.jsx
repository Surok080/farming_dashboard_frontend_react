import {Box, Typography} from "@mui/material";
import React from "react";
import Paper from "@mui/material/Paper";
import logo from "../../images/agro_logo.svg";
import hello_bg from "../../images/hello_bg.jpg";

const FieldsPages = () => {

    return (
        <Box sx={{height: '100%'}}>

            <Paper sx={{padding: '26px', height: '100%', overflowY: 'auto'}}>
                <Box display="flex" justifyContent="center" alignItems="center" margin={'0 auto'}>
                    <img src={logo} width={34} height={27} alt="logo"/>
                    <Typography variant={'h6'}>Агро-Коннект</Typography>
                </Box>
                <Box
                    width={'100%'}
                    maxWidth={'640px'}
                    display={'flex'}
                    flexDirection={'column'}
                    margin={'20px auto'}
                    justifyContent={'center'}
                    gap={2}
                >
                    <img width={'100%'} src={hello_bg} alt="Ферма"/>
                    <Typography>
                        Добро пожаловать в Агро-Коннект!
                    </Typography>
                    <Typography>Агро-Коннект — это совместный научный проект, разработанный с целью улучшить доступ
                        сельхозтоваропроизводителям, а также фермерских сообществ
                        к цифровым сельскохозяйственным технологиям.</Typography>

                    <Typography>Агро-Коннект стремится помочь сельхозтоваропроизводителям управлять своими фермами
                        более прибыльными, (экологически) и социально устойчивыми способами.</Typography>

                    <Typography>Команда Агро-Коннект — это междисциплинарная группа ученых, исследователей,
                        сельхозтоваропроизводителей, и специалистов по программному обеспечению.</Typography>


                    <Typography mt={4}>Если у вас возникнут трудности с использованием Агро-Коннект,
                        Вы всегда можете обратиться в нашу тех.поддержку или пройти обучение.</Typography>
                    <Typography>По всем вопросам можете обращаться по адресу: <a href="mailto:sof-it.tech@yandex.ru">sof-it.tech@yandex.ru</a></Typography>
                </Box>


            </Paper>
        </Box>
    );
};

export default FieldsPages;
