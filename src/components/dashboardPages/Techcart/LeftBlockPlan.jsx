import {
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Tooltip,
    Typography,
} from "@mui/material";
import React, {useEffect, useState} from "react";
import {TehMapApi} from "../../../api/tehMap";

const LeftBlockPlan = ({crops, year, fact, data, setData}) => {
    const [crop, setCrop] = useState("");
    const [tech, setTech] = useState(null);
    const [arrTech, setArrTech] = useState([]);
    const [updateId, setUpdateId] = useState(0);

    function getTechCultivationValue() {
        const foundItem = crops.find(item => item.culture === crop);
        if (foundItem) {
            return foundItem.tech_cultivation.length > 0 ? foundItem.tech_cultivation[0] : 0;
        }
        return null; // Если не найдено соответствие, возвращаем null
    }


    const checkTechItems = () => {
        const foundItem = crops.find(item => item.culture === crop);
        if (foundItem?.tech_cultivation.length > 0) {
            return foundItem?.tech_cultivation;
        } else {
            return []
        }
    }


    useEffect(() => {
        if (crop) {
            setArrTech(checkTechItems())
            setTimeout(() => {
                const newTechValue = getTechCultivationValue();
                setTech(prevTech => {
                    if (prevTech === newTechValue) {
                        // Если значение не изменилось, обновляем updateId
                        setUpdateId(prev => prev + 1);
                    }
                    return newTechValue;
                });
            }, 0);
        }
    }, [crop]);

    useEffect(() => {
        if (crop && crops.some(item => item.culture === crop)) {
            TehMapApi.getDataCrop(year, fact, crop, tech).then((res) => {
                if (!!res?.status && res?.status !== 200) {
                    throw new Error(`HTTP error! Status: ${res.status}`);
                } else {
                    setData(res.data);
                }
            })
                .catch((err) => {
                    console.log(err)
                })
        }
    }, [tech, updateId])

    const handleChange = (event) => {
        setCrop(event.target.value);
    };
    const handleChangeTech = (event) => {
        setTech(event.target.value);
    };

    const checkDisabled = () => {
        if (crop) {
            return crops.filter(item => item.culture === crop)[0].tech_cultivation?.length <= 0 ? true : false
        } else {
            return true;
        }
    }

    return (
        <Box display={"flex"} flexDirection={"column"} gap={1} maxHeight={"100%"}>
            <FormControl
                sx={{background: "#F9F9F9", borderRadius: "4px"}}
                fullWidth
            >
                <InputLabel id="demo-simple-select-label">Выберите культуру</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={crop}
                    label="Выберите культуру"
                    onChange={handleChange}
                >
                    {crops.map((item) => (
                        <MenuItem key={item} value={item.culture}>
                            {item.culture}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <FormControl
                key={tech}
                sx={{background: "#F9F9F9", borderRadius: "4px"}}
                fullWidth
            >
                <InputLabel id="demo-simple-select-label2">Выберите операцию</InputLabel>
                <Select
                    disabled={checkDisabled()}

                    labelId="demo-simple-select-label2"
                    id="demo-simple-select2"
                    value={tech}
                    label="Выберите операцию"
                    onChange={handleChangeTech}
                >
                    {
                        arrTech.map((item) => (
                            <MenuItem key={item} value={item}>
                                {item}
                            </MenuItem>
                        ))
                    }
                </Select>
            </FormControl>
            <Box
                sx={{
                    background: "#F9F9F9",
                    border: "1px solid #bfbfbf",
                    borderRadius: "4px",
                }}
                display={"flex"}
                p={2}
            >
                <Box width={"50%"} gap={1} display={"flex"} flexDirection={"column"}>
                    <Typography variant="body1">Площадь</Typography>
                    <Typography
                        sx={{fontWeight: "bold", color: "#62A65D"}}
                        variant="h5"
                    >
                        {data.culture.total_area}
                    </Typography>
                </Box>
                <Box width={"50%"} gap={1} display={"flex"} flexDirection={"column"}>
                    <Typography variant="body1">Кол-во полей</Typography>
                    <Typography
                        sx={{fontWeight: "bold", color: "#62A65D"}}
                        variant="h5"
                    >
                        {data.culture.total_count}
                    </Typography>
                </Box>
            </Box>
            <Box
                sx={{
                    background: "#F9F9F9",
                    border: "1px solid #bfbfbf",
                    borderRadius: "4px",
                    height: "100%",
                    overflowY: "scroll",
                    padding: 0,
                    flexDirection: "column",
                }}
                display={"flex"}
                p={2}
            >
                <Box p={2} sx={{background: "#62A65D"}} width={"100%"}>
                    <Typography
                        sx={{fontWeight: "bold", color: "white"}}
                        variant="body"
                    >
                        Технологические операции
                    </Typography>
                </Box>
                <Box p={2} display={"flex"} flexDirection={"column"} gap={1}>
                    {data.works.map((item, index) => (
                        <Box
                            key={index + item.work_type}
                            display={"flex"}
                            alignItems={"center"}
                            justifyContent={"space-between"}
                        >
                            <Tooltip title="Обработка зяби">
                                <Typography
                                    className="truncat"
                                    textAlign={"left"}
                                    width={"60%"}
                                    variant="body1"
                                >
                                    {item.work_type}
                                </Typography>
                            </Tooltip>
                            <Typography textAlign={"right"} width={"40%"} variant="caption">
                                {new Date(item.date_start).toLocaleDateString("ru-RU", {
                                    day: "numeric",
                                    month: "long",
                                })}{" - "}
                                {new Date(item.date_end).toLocaleDateString("ru-RU", {
                                    day: "numeric",
                                    month: "long",
                                })}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
};

export default LeftBlockPlan;
