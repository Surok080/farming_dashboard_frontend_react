import {Box, Typography} from "@mui/material";
import React from "react";

const FactTitle = ({year}) => {
    return (
        <Box display={"flex"} gap={2}>
            <Typography
                sx={{background: "#62A65D", color: "white", padding: "2px 5px"}}
                variant="body2"
                textAlign={"left"}
            >
                Посевная-{year}
            </Typography>
            <Typography variant="body2" textAlign={"left"}>
                Данные из спутникового мониторинга транспорта Форт Монитор (в режиме реального времени)
            </Typography>
        </Box>
    );
};

export default FactTitle;
