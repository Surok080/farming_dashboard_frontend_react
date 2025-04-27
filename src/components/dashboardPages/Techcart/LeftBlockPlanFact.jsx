import { Box, Tooltip, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { TehMapApi } from "../../../api/tehMap";
import CulturalList from "./CulturalList";

const LeftBlockPlanFact = ({ year, data, setData }) => {

  const [checked, setChecked] = useState([]);
  const [dataCulture, setDataCulture] = useState([]);


  useEffect(() => {
    TehMapApi.getPlanFact(year)
    .then(res => {
      console.log(res.data);
    
      setDataCulture(res.data)
    })
  }, [year]);

  useEffect(() => {
    console.log(checked);
  }, [checked]);


  const sampleData = [
    {
      id: "1",
      name: "Пшеница озимая",
      type: "Категория",
      value: "",
      children: [
        {
          id: "1-1",
          name: "Пшеница озимая-1",
          type: "10",
          value: "100",
        },
        {
          id: "1-2",
          name: "Пшеница озимая-2",
          type: "30",
          value: "200",
        },
      ],
    },
    {
      id: "2",
      name: "Кукуруза",
      type: "40",
      value: "",
      children: [
        {
          id: "2-1",
          name: "Кукуруза-1",
          type: "Элемент",
          value: "300",
        },
      ],
    },
    {
      id: "3",
      name: "Соя",
      type: "20",
      value: "",
    },
  ];

console.log(dataCulture, '=====1======');

  return (
    <Box display={"flex"} flexDirection={"column"} gap={1} maxHeight={"100%"}>
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
 
        <Box display={"flex"} flexDirection={"column"} gap={1}>
          <CulturalList data={dataCulture} checked={checked} setChecked={setChecked}/>

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
                })}
                {" - "}
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

export default LeftBlockPlanFact;
