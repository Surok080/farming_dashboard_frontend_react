import { Box, Typography } from "@mui/material";
import React from "react";

const ReportArea = () => {
  const tempData = [
    {
      cropGroup: "Зерновые - Хлебные и крупяные культуры",
      crops: [
        {
          crop: "пшеница озимая",
          area: "215,1",
        },
        {
          crop: "пшеница яровая",
          area: "272,2",
        },
        {
          crop: "ячмень яровой",
          area: "178,4",
        },
      ],
      allArea: "665,7",
    },
    {
      cropGroup: "Зерновые - Хлебные и крупяные культуры",
      crops: [
        {
          crop: "пшеница озимая",
          area: "215,1",
        },
        {
          crop: "пшеница яровая",
          area: "272,2",
        },
        {
          crop: "ячмень яровой",
          area: "178,4",
        },
      ],
      allArea: "665,7",
    },
    {
      cropGroup: "Зерновые - Хлебные и крупяные культуры",
      crops: [
        {
          crop: "пшеница озимая",
          area: "215,1",
        },
        {
          crop: "пшеница яровая",
          area: "272,2",
        },
        {
          crop: "ячмень яровой",
          area: "178,4",
        },
      ],
      allArea: "665,7",
    },
    {
      cropGroup: "Масличные культуры",
      crops: [
        {
          crop: "подсолнечник",
          area: "69",
        },
        {
          crop: "рапс яровой",
          area: "86,5",
        },
      ],
      allArea: "155,5",
    },
    {
      cropGroup: "Однолетние травы-силосные культуры",
      crops: [
        {
          crop: "кукуруза на силос",
          area: "116,1",
        },
      ],
      allArea: "116,1",
    },
    {
      cropGroup: "Клубнеплоды и корнеплоды",
      crops: [
        {
          crop: "свекла сахарная",
          area: "141,6",
        },
      ],
      allArea: "141,6",
    },
  ];
  return (
    <>
      <Typography>Список полей</Typography>
      <Box sx={{overflowY: 'scroll', display: 'flex', flexDirection: 'column'}}>
        {tempData.map((item) => {
          return (
            <Box
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
                {item.cropGroup}
              </Typography>

              {item.crops.map((crop) => {
                return (
                  <Box
                    sx={{
                      border: "1px solid #F0F0F0",
                      padding: "5px",
                    }}
                    display={"flex"}
                    justifyContent={"space-between"}
                  >
                    <Typography>{crop.crop}</Typography>
                    <Typography>{crop.area}</Typography>
                  </Box>
                );
              })}
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
                  <b>{item.allArea}</b>
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </>
  );
};

export default ReportArea;
