import {Accordion, AccordionDetails, AccordionSummary, Box, Divider, Typography} from "@mui/material";
import React from "react";
import LinearProgressWithLabel from "../../ProgressBar";


const CenterBlockFackt = ({data}) => {

    return (
        <Box display={"flex"} flexDirection={"column"} gap={1} minHeight={"100%"}>
            <Box display={"flex"}>
                <Box
                    sx={{
                        background: "#F9F9F9",
                        border: "1px solid #bfbfbf",
                        borderRadius: "4px",
                        overflowY: "scroll",
                        padding: 0,
                        flexDirection: "column",
                    }}
                    display={"flex"}
                    width={"100%"}
                >
                    <Box p={2} sx={{background: "#62A65D"}} textAlign={'start'} width={"100%"}>
                        <Typography
                            textAlign={'left'}
                            sx={{fontWeight: "bold", color: "white"}}
                            variant="body"
                        >
                            Технологические операции
                        </Typography>
                    </Box>

                    <Box p={2} display={"flex"} flexDirection={"column"}>
                        <Box padding={'0 16px'} mb={2} display={'flex'} alignItems={'end'}>
                            <Box width={'20%'}>
                                <Typography textAlign={'left'} variant={'body1'}>
                                    По культуре
                                </Typography>
                            </Box>
                            <Box width={'20%'}>
                                <Typography textAlign={'center'}>
                                    Площадь,
                                    га
                                </Typography>
                            </Box>
                            <Box width={'20%'}>
                                <Typography textAlign={'center'}>
                                    Прицепное
                                    устройство
                                </Typography>
                            </Box>
                            <Box width={'20%'}>
                                <Typography textAlign={'center'}>
                                    Обработанная
                                    площадь, га
                                </Typography>
                            </Box>
                            <Box width={'20%'}>
                                <Typography textAlign={'center'}>
                                    %
                                    выполнения
                                </Typography>
                            </Box>
                        </Box>
                        {
                            data?.cultures.map((item, index) => {
                                return (
                                    <Accordion key={index}>
                                        <AccordionSummary
                                            // expandIcon={<ExpandMoreIcon />}
                                            aria-controls="panel1-content"
                                            id="panel1-header"
                                        >
                                            <Box width={'20%'}>
                                                <Typography textAlign={'left'} variant={'body1'}>
                                                    {item.culture}
                                                </Typography>
                                            </Box>
                                            <Box width={'20%'}>
                                                <Typography textAlign={'center'}>
                                                    {item.total_area.toFixed(1)}
                                                </Typography>
                                            </Box>
                                            <Box width={'20%'}>
                                                <Typography textAlign={'center'}>
                                                    -
                                                </Typography>
                                            </Box>
                                            <Box width={'20%'}>
                                                <Typography textAlign={'center'}>
                                                    {item.total_area_worked.toFixed(1)}
                                                </Typography>
                                            </Box>
                                            <Box width={'20%'}>
                                                <LinearProgressWithLabel value={item.completion_percentage}/>
                                            </Box>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            {
                                                item.fields.map((subItem, index) => {
                                                    return (
                                                        <Box key={index + 'subItem'}>
                                                            <Divider orientation={'horizontal'} />
                                                            <Box mt={2} mb={2} display={'flex'} >
                                                                <Box width={'20%'}>
                                                                    <Typography textAlign={'left'} variant={'body1'}>
                                                                        {subItem.field_name}
                                                                    </Typography>
                                                                </Box>
                                                                <Box width={'20%'}>
                                                                    <Typography textAlign={'center'}>
                                                                        {subItem.field_area.toFixed(1)}
                                                                    </Typography>
                                                                </Box>
                                                                <Box width={'20%'}>
                                                                    <Typography textAlign={'center'}>
                                                                        {subItem.trailer_name}
                                                                    </Typography>
                                                                </Box>
                                                                <Box width={'20%'}>
                                                                    <Typography textAlign={'center'}>
                                                                        {subItem.field_area_worked.toFixed(1)}
                                                                    </Typography>
                                                                </Box>
                                                                <Box width={'20%'}>
                                                                    <LinearProgressWithLabel value={subItem.completion_percentage}/>
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                    )
                                                })
                                            }
                                        </AccordionDetails>
                                    </Accordion>
                                )
                            })
                        }
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default CenterBlockFackt;
