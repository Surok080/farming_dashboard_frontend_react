import {TabContext, TabList, TabPanel} from "@mui/lab";
import {Box, Tab, Typography} from "@mui/material";
import React, {useState} from "react";
import {useSelector} from "react-redux";
import PlanComponent from "./Techcart/PlanComponent";
import FactComponent from "./Techcart/FactComponent";
import PlanFactComponent from "./Techcart/PlanFactComponent";
import PlanFactV2Component from "./Techcart/PlanFactV2Component";

const TechcartPage = ({year}) => {
    const [value, setValue] = useState('1');
    const user = useSelector((state) => state.user);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    // Функция для проверки пермишенов
    const hasPermission = (permissionName) => {
        return user?.userInfo?.module?.includes(permissionName);
    };

    // Определяем какой компонент рендерить на основе пермишенов
    const getPlanFactComponent = () => {
        // Если есть plan_fact_v2, рендерим новую версию (приоритет v2)
        if (hasPermission('plan_fact_v2')) {
            return <PlanFactV2Component year={year} />;
        }
        // Если есть только plan_fact, рендерим старую версию
        if (hasPermission('plan_fact')) {
            return <PlanFactComponent year={year} />;
        }
        // Если нет пермишенов, показываем сообщение об отсутствии доступа
        return (
            <Box
                sx={{
                    width: "100%",
                    height: "100%",
                    background: "#f0f0f0",
                    padding: "10px 10px 18px 10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Typography variant="h4" color="text.secondary">
                    У вас нет доступа к разделу План-Факт
                </Typography>
            </Box>
        );
    };

    return (
        <Box sx={{height: '100%'}}>
            <TabContext value={value}>
                <Box sx={{borderBottom: 1, borderColor: "divider", position: "relative"}}>
                    <TabList onChange={handleChange} aria-label="lab API tabs example">
                        <Tab sx={{color: 'black !important'}} label="План-Факт" value="1"/>
                        {/* <Tab sx={{color: 'black !important'}} label="Фактический" value="2"/> */}
                    </TabList>
                    {
                        value === '2' && <Typography sx={{position: "absolute", right: 0, top: 0}} variant={"body2"}>
                            Обновление данных каждые 30 минут
                        </Typography>
                    }

                </Box>
                <TabPanel sx={{padding: '0 0 50px 0', height: '100%'}} value="1">
                    {getPlanFactComponent()}
                </TabPanel>
                {/* <TabPanel sx={{padding: '0 0 50px 0', height: '100%'}} value="2">
                    <FactComponent year={year} fact={value === '2'}/>
                </TabPanel> */}
            </TabContext>
        </Box>
    );
};

export default TechcartPage;
