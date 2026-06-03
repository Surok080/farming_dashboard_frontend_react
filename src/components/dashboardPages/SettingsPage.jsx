import React, {useEffect, useState} from 'react';
import {Box, Tab} from "@mui/material";
import Paper from "@mui/material/Paper";
import {TabContext, TabList, TabPanel} from "@mui/lab";
import {useSelector} from "react-redux";
import UserInfo from "../settings/UserInfo";
import MapSettings from "../settings/MapSettings";
import ExternalServicesSettings from "../settings/ExternalServicesSettings";
import NotificationSettings from "../settings/NotificationSettings";

const SettingsPage = () => {
    const user = useSelector((state) => state.user);
    const hasExternalIntegrations = user?.userInfo?.module?.includes("external_integrations");
    const hasMonitoring = user?.userInfo?.module?.includes("monitoring");

    const [value, setValue] = useState('1');

    useEffect(() => {
        if (value === '4' && !hasMonitoring) {
            setValue('1');
        }
    }, [value, hasMonitoring]);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    return (
        <Box sx={{height: '100%'}}>

            <TabContext value={value}>
                <Box sx={{borderBottom: 1, borderColor: "divider", position: "relative"}}>
                    <TabList onChange={handleChange} aria-label="lab API tabs example">
                        <Tab sx={{color: 'black !important'}} label="Пользователь" value="1"/>
                        <Tab sx={{color: 'black !important'}} label="Карты" value="2"/>
                        {hasExternalIntegrations && (
                            <Tab sx={{color: 'black !important'}} label="Внешние сервисы" value="3"/>
                        )}
                        {hasMonitoring && (
                            <Tab sx={{color: 'black !important'}} label="Уведомления" value="4"/>
                        )}
                    </TabList>
                </Box>
                <Paper sx={{padding: '26px', height: '100%'}}>
                    <TabPanel sx={{padding: '0 0 50px 0', height: '100%'}} value="1">
                        <UserInfo/>
                    </TabPanel>
                    <TabPanel sx={{padding: '0 0 50px 0', height: '100%'}} value="2">
                        <MapSettings/>
                    </TabPanel>
                    {hasExternalIntegrations && (
                        <TabPanel sx={{padding: '0 0 50px 0', height: '100%'}} value="3">
                            <ExternalServicesSettings/>
                        </TabPanel>
                    )}
                    {hasMonitoring && (
                        <TabPanel sx={{padding: '0 0 50px 0', height: '100%'}} value="4">
                            <NotificationSettings/>
                        </TabPanel>
                    )}
                </Paper>
            </TabContext>

        </Box>
    );
};

export default SettingsPage;