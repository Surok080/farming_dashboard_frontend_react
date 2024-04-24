import { Box, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { httpService } from "../../api/setup";

const ReportAreaCartogram = ({ grouping }) => {
  const [yearReports, setYearReports] = useState([]);

  useEffect(() => {
    httpService
      .get(`/cartogram/report?group=${grouping}`)
      .then((res) => {
        if (res?.status && res?.status === 200) {
          console.log(res.data);

          setYearReports(res.data);
        } else {
          setYearReports([]);
        }
      })
      .catch((e) => {
        console.log(e);
        setYearReports([]);
      });
  }, []);
  return yearReports?.groups?.length ? (
    <>
      <Typography mb={2}>Диапазоны значений</Typography>
      <Box
        sx={{ overflowY: "auto", display: "flex", flexDirection: "column" }}
      >
        <Box
          sx={{
            margin: "10px 2px 20px",
            display: "flex",
            gap: "5px",
            justifyContent: "space-between",
          }}
        >
          <Box display={"flex"} alignItems={"center"} gap={1}>
            <Typography sx={{ fontWeight: 'bold' }} ml={4} textAlign={"left"} alignItems={"left"}>
              мк/г
            </Typography>
          </Box>
          <Box
            display={"flex"}
            alignItems={"center"}
            justifyContent={"space-between"}
            maxWidth={"120px"}
            width={"100%"}
          >
            <Typography sx={{ fontWeight: 'bold' }} ml={1} textAlign={"left"} alignItems={"left"}>
              %
            </Typography>
            <Typography sx={{ fontWeight: 'bold' }} textAlign={"left"} alignItems={"left"}>
              га
            </Typography>
          </Box>
        </Box>
        {yearReports.groups.map((item, index) => {

          return (
            <Box
              key={item.phosphorus_group_id + index}
              sx={{
                margin: "10px 2px 20px",
                display: "flex",
                gap: "5px",
                justifyContent: "space-between",
              }}
            >
              <Box display={"flex"} alignItems={"center"} gap={1}>
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    backgroundColor: item.group_color,
                    borderRadius: "50%",
                  }}
                />
                <Typography textAlign={"left"} alignItems={"left"}>
                  {item.group_borders}
                </Typography>
              </Box>
              <Box
                display={"flex"}
                alignItems={"center"}
                justifyContent={"space-between"}
                maxWidth={"120px"}
                width={"100%"}
              >
                <Typography textAlign={"left"} alignItems={"left"}>
                  {item.percent}
                </Typography>
                <Typography textAlign={"left"} alignItems={"left"}>
                  {item.group_area}
                </Typography>
              </Box>
            </Box>
          );
        })}
        <Box
          sx={{
            margin: "10px 2px 20px",
            display: "flex",
            gap: "5px",
            justifyContent: "space-between",
          }}
        >
          <Box display={"flex"} alignItems={"center"} gap={1}>
            <Typography sx={{ fontWeight: 'bold' }} ml={4} textAlign={"left"} alignItems={"left"}>
              Итого
            </Typography>
          </Box>
          <Box
            display={"flex"}
            alignItems={"center"}
            justifyContent={"space-between"}
            maxWidth={"120px"}
            width={"100%"}
          >
            <Typography sx={{ fontWeight: 'bold' }} ml={1} textAlign={"left"} alignItems={"left"}>
              {yearReports.total_percents}
            </Typography>
            <Typography sx={{ fontWeight: 'bold' }} textAlign={"left"} alignItems={"left"}>
            {yearReports.total_area}
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  ) : (
    <Typography>Нет данных</Typography>
  );
};

export default ReportAreaCartogram;
