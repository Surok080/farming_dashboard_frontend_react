import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Chart } from "react-google-charts";
import { httpService } from "../../../api/setup";

const colorPalette = [
  "#4285F4",
  "#34A853",
  "#FBBC05",
  "#EA4335",
  "#9C27B0",
  "#00BCD4",
  "#FF9800",
  "#4CAF50",
];

const PlanFactStructure = ({ year }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    if (!year) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    httpService
      .get("/plan_fact_v2/fields/report", { params: { year: Number(year) } })
      .then((res) => {
        if (res?.status === 200 && res.data) {
          setData(res.data);
        } else {
          setData(null);
        }
      })
      .catch((err) => {
        setError(err?.message || "Ошибка загрузки");
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [year]);

  // Круговая диаграмма: groups (group_name, area, share_percent)
  const pieChartData = React.useMemo(() => {
    if (!data?.groups?.length) return null;
    const rows = [["Группа", "Площадь"]];
    const colors = [];
    data.groups.forEach((g, i) => {
      const area = Number(g.area) || 0;
      rows.push([`${g.group_name || ""} (${area.toFixed(1)} га)`, area]);
      colors.push(colorPalette[i % colorPalette.length]);
    });
    return { rows, colors };
  }, [data?.groups]);

  // Столбчатая диаграмма: cultures (culture_name, share_percent)
  const barChartData = React.useMemo(() => {
    if (!data?.cultures?.length) return null;
    const rows = [
      ["Культура", "Доля, %", { type: "string", role: "annotation" }],
    ];
    const sorted = [...data.cultures].sort(
      (a, b) => (Number(b.share_percent) || 0) - (Number(a.share_percent) || 0)
    );
    sorted.forEach((c) => {
      const pct = Number(c.share_percent) || 0;
      rows.push([c.culture_name || "", pct, `${pct.toFixed(1)}%`]);
    });
    return rows;
  }, [data?.cultures]);

  const maxBarValue = React.useMemo(() => {
    if (!barChartData || barChartData.length < 2) return 100;
    const values = barChartData.slice(1).map((r) => r[1]);
    return Math.ceil((Math.max(...values) || 0) * 1.1);
  }, [barChartData]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          minHeight: 200,
        }}
      >
        <Typography color="text.secondary">Загрузка данных...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          minHeight: 200,
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          minHeight: 200,
        }}
      >
        <Typography color="text.secondary">Нет данных</Typography>
      </Box>
    );
  }

  const pieOptions = {
    title: "Распределение по группам культур",
    pieHole: 0.4,
    legend: { position: "right", alignment: "center" },
    chartArea: { left: 0, top: 50, width: "100%", height: "80%" },
    colors: pieChartData?.colors || [],
    pieSliceText: "percentage",
    fontSize: 12,
    tooltip: {
      trigger: "selection",
    },
  };

  const barOptions = {
    title: "Доля культур (% от общей площади)",
    hAxis: {
      title: "Доля, %",
      minValue: 0,
      maxValue: maxBarValue,
    },
    legend: { position: "none" },
    chartArea: { left: 140, top: 50, width: "70%", height: "85%" },
    fontSize: 11,
    tooltip: {
      trigger: "selection",
    },
    annotations: {
      textStyle: { fontSize: 10, color: "#000" },
      alwaysOutside: false,
    },
  };

  const tableRows = data.table || [];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isSmallScreen ? "column" : "row",
        gap: 2,
        p: 2,
        height: "100%",
        overflow: "auto",
      }}
    >
      {/* Левая колонка: круговая + столбчатая */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          minWidth: isSmallScreen ? "100%" : 420,
          flex: isSmallScreen ? "0 0 auto" : "0 0 420px",
        }}
      >
        {pieChartData && (
          <Paper sx={{ p: 1.5, height: 320 }}>
            <Chart
              chartType="PieChart"
              width="100%"
              height="280px"
              data={pieChartData.rows}
              options={pieOptions}
              key={`plan-fact-structure-pie-${year}`}
            />
          </Paper>
        )}
        {barChartData && barChartData.length > 1 && (
          <Paper sx={{ p: 1.5, height: 340 }}>
            <Chart
              chartType="BarChart"
              width="100%"
              height="300px"
              data={barChartData}
              options={barOptions}
              key={`plan-fact-structure-bar-${year}`}
            />
          </Paper>
        )}
      </Box>

      {/* Правая колонка: таблица */}
      <Paper sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <Box sx={{ p: 1.5, borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Структура по группам и культурам
          </Typography>
          {data.total_area != null && (
            <Typography variant="caption" color="text.secondary">
              Общая площадь: {Number(data.total_area).toFixed(1)} га
            </Typography>
          )}
        </Box>
        <TableContainer sx={{ flex: 1, overflow: "auto" }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Группа</TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  Площадь, га
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  Доля, %
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Культуры</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableRows.map((row, idx) => (
                <React.Fragment key={idx}>
                  <TableRow>
                    <TableCell>{row.group_name || "—"}</TableCell>
                    <TableCell align="right">
                      {row.area != null ? Number(row.area).toFixed(1) : "—"}
                    </TableCell>
                    <TableCell align="right">
                      {row.share_percent != null
                        ? `${Number(row.share_percent).toFixed(1)}%`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {row.cultures?.length ? (
                        <Box component="ul" sx={{ m: 0, pl: 2, py: 0 }}>
                          {row.cultures.map((c, i) => (
                            <li key={i}>
                              {c.culture_name || "—"} —{" "}
                              {c.area != null
                                ? `${Number(c.area).toFixed(1)} га`
                                : "—"}
                              {c.share_percent_in_group != null &&
                                ` (${Number(c.share_percent_in_group).toFixed(1)}% в группе)`}
                            </li>
                          ))}
                        </Box>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default PlanFactStructure;
