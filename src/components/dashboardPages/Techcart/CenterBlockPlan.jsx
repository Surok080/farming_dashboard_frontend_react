import { Box, Tooltip, Typography } from "@mui/material";
import React from "react";
import { BarChart } from "@mui/x-charts/BarChart";

const CenterBlockPlan = ({ data }) => {
  const uData = [
    data.consumption.seeds_kg,
    data.consumption.fertilizers_kg,
    data.consumption.fertilizers_l,
    data.consumption.shzr_kg,
    data.consumption.shzr_l,
    data.consumption.fuel_l,
    data.consumption.products_kg,
    data.consumption.other_expenses,
  ];
  const xLabels = [
    "Семена, кг",
    "Мин.удобрения, кг",
    "Удобрения, л",
    "СХЗР, кг",
    "СХЗР, л",
    "ГСМ, л",
    "Продукция, кг",
    "Прочие затраты",
  ];

  return (
    <Box display={"flex"} flexDirection={"column"} gap={1} minHeight={"100%"}>
      <Box display={"flex"} maxHeight={"50%"} gap={1}>
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
          width={"50%"}
        >
          <Box p={2} sx={{ background: "#62A65D" }} width={"100%"}>
            <Typography
              sx={{ fontWeight: "bold", color: "white" }}
              variant="body"
            >
              Итого затрат
            </Typography>
          </Box>
          <Box p={2} display={"flex"} flexDirection={"column"} gap={2}>
            <Box display={"flex"}>
              <Box
                width={"50%"}
                gap={2}
                display={"flex"}
                flexDirection={"column"}
              >
                <Typography variant="body1">Затраты на 1 га</Typography>
                <Typography
                  sx={{ fontWeight: "bold", color: "#62A65D" }}
                  variant="h5"
                >
                  {data.total_costs.costs_on_1_ga}
                </Typography>
              </Box>
              <Box
                width={"50%"}
                gap={2}
                display={"flex"}
                flexDirection={"column"}
              >
                <Typography variant="body1">Итого затрат</Typography>
                <Typography
                  sx={{ fontWeight: "bold", color: "#62A65D" }}
                  variant="h5"
                >
                  {data.total_costs.total_costs}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
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
          width={"50%"}
        >
          <Box p={2} sx={{ background: "#62A65D" }} width={"100%"}>
            <Typography
              sx={{ fontWeight: "bold", color: "white" }}
              variant="body"
            >
              Планируемый бюджет
            </Typography>
          </Box>
          <Box p={2} display={"flex"} flexDirection={"column"} gap={2}>
            <Box display={"flex"}>
              <Box
                width={"50%"}
                gap={2}
                display={"flex"}
                flexDirection={"column"}
              >
                <Typography variant="body1">в семенах</Typography>
                <Typography
                  sx={{ fontWeight: "bold", color: "#62A65D" }}
                  variant="h5"
                >
                  {data.budget.seeds}
                </Typography>
              </Box>
              <Box
                width={"50%"}
                gap={2}
                display={"flex"}
                flexDirection={"column"}
              >
                <Typography variant="body1">ГСМ</Typography>
                <Typography
                  sx={{ fontWeight: "bold", color: "#62A65D" }}
                  variant="h5"
                >
                  {data.budget.fuel}
                </Typography>
              </Box>
            </Box>
            <Box display={"flex"}>
              <Box
                width={"50%"}
                gap={2}
                display={"flex"}
                flexDirection={"column"}
              >
                <Typography variant="body1">в СХЗР</Typography>
                <Typography
                  sx={{ fontWeight: "bold", color: "#62A65D" }}
                  variant="h5"
                >
                  {data.budget.shzr}
                </Typography>
              </Box>
              <Box
                width={"50%"}
                gap={2}
                display={"flex"}
                flexDirection={"column"}
              >
                <Typography variant="body1">прочие затраты </Typography>
                <Typography
                  sx={{ fontWeight: "bold", color: "#62A65D" }}
                  variant="h5"
                >
                  {data.budget.other_expenses}
                </Typography>
              </Box>
            </Box>
            <Box display={"flex"}>
              <Box
                width={"50%"}
                gap={2}
                display={"flex"}
                flexDirection={"column"}
              >
                <Typography variant="body1">в мин. удобрениях</Typography>
                <Typography
                  sx={{ fontWeight: "bold", color: "#62A65D" }}
                  variant="h5"
                >
                  {data.budget.fertilizers}
                </Typography>
              </Box>
              <Box
                width={"50%"}
                gap={2}
                display={"flex"}
                flexDirection={"column"}
              >
                <Typography variant="body1">продукция </Typography>
                <Typography
                  sx={{ fontWeight: "bold", color: "#62A65D" }}
                  variant="h5"
                >
                  {data.budget.products}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box display={"flex"} maxHeight={"50%"}>
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
          <Box p={2} sx={{ background: "#62A65D" }} width={"100%"}>
            <Typography
              sx={{ fontWeight: "bold", color: "white" }}
              variant="body"
            >
              Распределение потребности
            </Typography>
          </Box>

          <Box p={2} display={"flex"} flexDirection={"column"} gap={2}>
            <BarChart
              height={300}
              series={[
                {
                  data: uData,
                  // label: "План",
                  id: "pvId",
                  stack: "total",
                  color: "#82F865", // измените цвет этой серии на зеленый
                },
                // {
                //   data: pData,
                //   label: "Факт",
                //   id: "uvId",
                //   stack: "total",
                //   color: "#D9D9D9", // измените цвет этой серии на фиолетовый
                // },
              ]}
              xAxis={[{ data: xLabels, scaleType: "band" }]}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CenterBlockPlan;
