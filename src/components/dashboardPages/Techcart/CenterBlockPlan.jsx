import { Box, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { BarChart } from "@mui/x-charts/BarChart";

const CenterBlockPlan = ({ data }) => {
  const [safeUData, setSafeUData] = useState([0, 0, 0, 0, 0, 0]);
  const [safeXData, setSafeXData] = useState([0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    setSafeUData([
      data?.plan_fact_analyze?.seeds?.plan ?? 0,
      data?.plan_fact_analyze?.fertilizers?.plan ?? 0,
      data?.plan_fact_analyze?.shzr?.plan ?? 0,
      data?.plan_fact_analyze?.fuel?.plan ?? 0,
      data?.plan_fact_analyze?.products?.plan ?? 0,
      data?.plan_fact_analyze?.other_expenses?.plan ?? 0,
    ]);
    setSafeXData([
      data?.plan_fact_analyze?.seeds?.fact ?? 0,
      data?.plan_fact_analyze?.fertilizers?.fact ?? 0,
      data?.plan_fact_analyze?.shzr?.fact ?? 0,
      data?.plan_fact_analyze?.fuel?.fact ?? 0,
      data?.plan_fact_analyze?.products?.fact ?? 0,
      data?.plan_fact_analyze?.other_expenses?.fact ?? 0,
    ]);
  }, [data]);

  const xLabels = [0, 1, 2, 3, 4, 5];
  const xAxisLabels = [
    "Семена",
    "Удобрения",
    "СХЗР",
    "ГСМ",
    "Продукция",
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
            padding: 0,
            flexDirection: "column",
          }}
          display={"flex"}
          width={"50%"}
        >
          <Box
            p={2}
            sx={{ background: "#62A65D" }}
            textAlign={"start"}
            width={"100%"}
          >
            <Typography
              sx={{ fontWeight: "bold", color: "white" }}
              variant="body"
            >
              Итого затрат, руб
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
                  {data?.total?.costs_on_1_ga
                    ? new Intl.NumberFormat("ru-RU").format(
                        data.total.costs_on_1_ga.toFixed(0)
                      )
                    : 0}
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
                  {data?.total?.total_costs
                    ? new Intl.NumberFormat("ru-RU").format(
                        data.total.total_costs.toFixed(0)
                      )
                    : 0}
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
            padding: 0,
            flexDirection: "column",
          }}
          display={"flex"}
          width={"50%"}
        >
          <Box
            p={2}
            sx={{ background: "#62A65D" }}
            textAlign={"start"}
            width={"100%"}
          >
            <Typography
              sx={{ fontWeight: "bold", color: "white" }}
              variant="body"
            >
              Планируемый бюджет, руб
            </Typography>
          </Box>
          <Box p={2} display={"flex"} flexDirection={"column"} gap={1}>
            <Box display={"flex"}>
              <Box
                width={"50%"}
                gap={1}
                display={"flex"}
                flexDirection={"column"}
              >
                <Typography variant="body1">в семенах</Typography>
                <Typography
                  sx={{ fontWeight: "bold", color: "#62A65D" }}
                  variant="h5"
                >
                  {data?.plan_budget?.seeds?.plan_rub
                    ? new Intl.NumberFormat("ru-RU").format(
                        data.plan_budget.seeds.plan_rub.toFixed(0)
                      )
                    : 0}
                </Typography>
              </Box>
              <Box
                width={"50%"}
                gap={1}
                display={"flex"}
                flexDirection={"column"}
              >
                <Typography variant="body1">ГСМ</Typography>
                <Typography
                  sx={{ fontWeight: "bold", color: "#62A65D" }}
                  variant="h5"
                >
                  {data?.plan_budget?.fuel?.plan_rub
                    ? new Intl.NumberFormat("ru-RU").format(
                        data.plan_budget.fuel.plan_rub.toFixed(0)
                      )
                    : 0}
                </Typography>
              </Box>
            </Box>
            <Box display={"flex"}>
              <Box
                width={"50%"}
                gap={1}
                display={"flex"}
                flexDirection={"column"}
              >
                <Typography variant="body1">в СХЗР</Typography>
                <Typography
                  sx={{ fontWeight: "bold", color: "#62A65D" }}
                  variant="h5"
                >
                  {data?.plan_budget?.shzr?.plan_rub
                    ? new Intl.NumberFormat("ru-RU").format(
                        data.plan_budget.shzr.plan_rub.toFixed(0)
                      )
                    : 0}
                </Typography>
              </Box>
              <Box
                width={"50%"}
                gap={1}
                display={"flex"}
                flexDirection={"column"}
              >
                <Typography variant="body1">прочие затраты </Typography>
                <Typography
                  sx={{ fontWeight: "bold", color: "#62A65D" }}
                  variant="h5"
                >
                  {data?.plan_budget?.other_expenses?.plan_rub
                    ? new Intl.NumberFormat("ru-RU").format(
                        data.plan_budget.other_expenses.plan_rub.toFixed(0)
                      )
                    : 0}
                </Typography>
              </Box>
            </Box>
            <Box display={"flex"}>
              <Box
                width={"50%"}
                gap={1}
                display={"flex"}
                flexDirection={"column"}
              >
                <Typography variant="body1">в мин. удобрениях</Typography>
                <Typography
                  sx={{ fontWeight: "bold", color: "#62A65D" }}
                  variant="h5"
                >
                  {data?.plan_budget?.fertilizers?.plan_rub
                    ? new Intl.NumberFormat("ru-RU").format(
                        data.plan_budget.fertilizers.plan_rub.toFixed(0)
                      )
                    : 0}
                </Typography>
              </Box>
              <Box
                width={"50%"}
                gap={1}
                display={"flex"}
                flexDirection={"column"}
              >
                <Typography variant="body1">продукция </Typography>
                <Typography
                  sx={{ fontWeight: "bold", color: "#62A65D" }}
                  variant="h5"
                >
                  {data?.plan_budget?.fertilizers?.products
                    ? new Intl.NumberFormat("ru-RU").format(
                        data.plan_budget.fertilizers.products.toFixed(0)
                      )
                    : 0}
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
            padding: 0,
            flexDirection: "column",
          }}
          display={"flex"}
          width={"100%"}
        >
          <Box
            p={2}
            textAlign={"start"}
            sx={{ background: "#62A65D" }}
            width={"100%"}
          >
            <Typography
              sx={{ fontWeight: "bold", color: "white" }}
              variant="body"
            >
              Распределение потребностей
            </Typography>
          </Box>

          <Box
            sx={{
              padding: "0 16px",
            }}
            display={"flex"}
            flexDirection={"column"}
            gap={1}
          >
            <BarChart
              height={300}
              sx={{
                padding: "5px 0",
              }}
              series={[
                {
                  data: safeUData,
                  label: "План",
                  color: "#82F865",
                  type: "bar", // Явно указываем тип серии
                },
                {
                  data: safeXData,
                  label: "Факт",
                  color: "#D9D9D9",
                  type: "bar", // Явно указываем тип серии
                },
              ]}
              xAxis={[
                {
                  data: xLabels,
                  scaleType: "band",
                  label: "Категории",
                  valueFormatter: (index) => xAxisLabels[index],
                },
              ]}
              slots={{
                // Переопределяем компонент тултипа для поддержки bar-графика
                tooltip: (props) => {
                  const { series, itemData, axisData } = props;
                  const category = xAxisLabels[axisData?.x?.value] || "";

                  return (
                    <div
                      style={{
                        padding: 10,
                        background: "white",
                        border: "1px solid #ddd",
                        borderRadius: 4,
                        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                      }}
                    >
                      <div style={{ fontWeight: "bold", marginBottom: 5 }}>
                        {category}
                      </div>
                      {series.map((s, i) => (
                        <div
                          key={i}
                          style={{
                            color: s.color,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              width: 10,
                              height: 10,
                              backgroundColor: s.color,
                              marginRight: 5,
                              borderRadius: 2,
                            }}
                          />
                          {s.label}: {s.data[itemData.dataIndex]}
                        </div>
                      ))}
                    </div>
                  );
                },
              }}
              slotProps={{
                bar: {
                  rx: 4,
                },
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CenterBlockPlan;
