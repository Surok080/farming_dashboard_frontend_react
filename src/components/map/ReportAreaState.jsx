import { Box, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { httpService } from "../../api/setup";

const ReportAreaState = () => {
  const [yearReports, setYearReports] = useState([])

  
  useEffect(() => {
    httpService.get(`/state_monitoring/report`)
    .then((res) => {
      if (res?.status && res?.status === 200) {
        setYearReports(res.data)
      } else {
        setYearReports([])
      }
    })
    .catch((e) => {
      console.log(e);
      setYearReports([])
    })
  }, [])
  return (
      yearReports.length ?
      <>
      <Typography>Список полей</Typography>
      <Box sx={{overflowY: 'scroll', display: 'flex', flexDirection: 'column'}}>
        {yearReports.map((item, index) => {
          return (
            <Box
              key={item.area_group + index}
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
                {item.form_owner_group}
              </Typography>

              {item.plots.map((plots, index) => {
                return (
                  <Box
                    key={plots.plot_area + index}
                    sx={{
                      border: "1px solid #F0F0F0",
                      padding: "5px",
                    }}
                    display={"flex"}
                    justifyContent={"space-between"}
                  >
                    <Typography>{plots.plot_cadastral_number}</Typography>
                    <Typography>{plots.plot_area}</Typography>
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

export default ReportAreaState;
