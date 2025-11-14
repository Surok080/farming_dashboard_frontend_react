import {Box, Typography} from "@mui/material";
import React, {useEffect, useState} from "react";
import {httpService} from "../../api/setup";

const ReportArea = ({year, grouping}) => {
    const [yearReports, setYearReports] = useState([])


    useEffect(() => {
        httpService.get(`/fields_v2/report?year=${year}`)
            .then((res) => {
                if (res.status && res.status === 200) {
                    setYearReports(res.data)
                } else {
                    setYearReports([])
                }
            })
            .catch((e) => {
                setYearReports([])
            })

    }, [year])
    return (
        yearReports.length ?
            <>
                <Typography>Список полей</Typography>
                <Box sx={{overflowY: 'scroll', display: 'flex', flexDirection: 'column'}}>
                    {yearReports.map((item, index) => {
                        return (
                            <Box
                                key={index}
                                sx={{
                                    margin: "10px 2px 20px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "5px",
                                }}
                            >
                                <Typography
                                    sx={{
                                        border: "1px solid #62A65D",
                                        padding: "5px",
                                    }}
                                    textAlign={"left"}
                                    alignItems={"left"}
                                >
                                    {grouping === "productivity" ? item.culture_group : item.crop_group}
                                </Typography>

                                {
                                    grouping === "productivity" ?
                                        item.productivity.map((product, index) => {
                                            return (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        border: "1px solid #F0F0F0",
                                                    }}
                                                    display={"flex"}
                                                >
                                                    <Box sx={{
                                                        width: '5px',
                                                        height: '100%',
                                                        backgroundColor: product.color
                                                    }}/>
                                                    <Box
                                                        width={'100%'}
                                                        display={"flex"}
                                                        justifyContent={"space-between"}
                                                        sx={{padding: '5px 5px 5px 5px'}}
                                                    >
                                                        <Typography
                                                        >{product.description}</Typography>
                                                        <Typography
                                                        >{product.productivity_area} га ({product.percentage}%)</Typography>
                                                    </Box>

                                                </Box>
                                            )
                                        }) :
                                        item.crop.map((crop, index) => {
                                            return (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        border: "1px solid #F0F0F0",
                                                        padding: "5px",
                                                    }}
                                                    display={"flex"}
                                                    justifyContent={"space-between"}
                                                >
                                                    <Typography>{crop.crop_name}</Typography>
                                                    <Typography>{crop.crop_area}</Typography>
                                                </Box>
                                            );
                                        })
                                }
                                <Box
                                    sx={{
                                        border: "1px solid #F0F0F0",
                                        padding: "5px",
                                    }}
                                    display={"flex"}
                                    justifyContent={"space-between"}
                                >
                                    <Typography>
                                        <b>Итого</b>
                                    </Typography>
                                    <Typography>
                                        <b> {grouping === "productivity" ? item.culture_area : item.area_group} Га</b>
                                    </Typography>
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            </>
            :
            <Typography>Нет данных</Typography>
    );
};

export default ReportArea;
