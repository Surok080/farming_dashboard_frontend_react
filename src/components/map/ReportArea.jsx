import { Box, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { httpService } from "../../api/setup";

const ReportArea = ({year}) => {
  const [yearReports, setYearReports] = useState([])

  
  useEffect(() => {
    httpService.get(`/fields/report?year=${year}`)
    .then((res) => {
      if (res.status && res.status === 200) {
        setYearReports(res.data)
      } else {
        setYearReports([])
      }
    })
    .catch((e) => {
      console.log(e);
      setYearReports([])
    })
  }, [year])
  return (
      yearReports.length ?
      <>
      <Typography>Список полей</Typography>
      <Box sx={{overflowY: 'scroll', display: 'flex', flexDirection: 'column'}}>
        {yearReports.map((item) => {
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
                {item.crop_group}
              </Typography>

              {item.crop.map((crop) => {
                return (
                  <Box
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
                  <b>{item.area_group}</b>
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
