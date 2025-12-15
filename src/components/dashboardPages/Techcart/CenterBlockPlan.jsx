import {Box, Typography} from "@mui/material";
import React, {useEffect, useState, useMemo} from "react";
import {BarChart} from "@mui/x-charts/BarChart";

const CenterBlockPlan = ({data}) => {
    const [safeUData, setSafeUData] = useState([0, 0, 0, 0, 0, 0]);
    const [safeXData, setSafeXData] = useState([0, 0, 0, 0, 0, 0]);

    useEffect(() => {
        // Проверяем, что data существует и имеет нужную структуру
        if (data && data.plan_fact_analyze) {
            setSafeUData([
                data.plan_fact_analyze.seeds?.plan ?? 0,
                data.plan_fact_analyze.fertilizers?.plan ?? 0,
                data.plan_fact_analyze.shzr?.plan ?? 0,
                data.plan_fact_analyze.fuel?.plan ?? 0,
                data.plan_fact_analyze.payment_work?.plan ?? 0,
                data.plan_fact_analyze.other_expenses?.plan ?? 0,
            ]);
            setSafeXData([
                data.plan_fact_analyze.seeds?.fact ?? 0,
                data.plan_fact_analyze.fertilizers?.fact ?? 0,
                data.plan_fact_analyze.shzr?.fact ?? 0,
                data.plan_fact_analyze.fuel?.fact ?? 0,
                data.plan_fact_analyze.payment_work?.fact ?? 0,
                data.plan_fact_analyze.other_expenses?.fact ?? 0,
            ]);
        } else {
            // Если данных нет, устанавливаем значения по умолчанию
            setSafeUData([0, 0, 0, 0, 0, 0]);
            setSafeXData([0, 0, 0, 0, 0, 0]);
        }
    }, [data]);

    // Мемоизация массивов для оптимизации производительности
    const xLabels = useMemo(() => [0, 1, 2, 3, 4, 5], []);
    const xAxisLabels = useMemo(() => [
        "Семена",
        "Удобрения",
        "СХЗР",
        "ГСМ",
        "Оплата труда",
        "Прочие затраты",
    ], []);

    // Мемоизация данных для серий графика
    const chartSeries = useMemo(() => [
        {
            data: safeUData,
            label: "План",
            color: "#82F865",
            type: "bar",
        },
        {
            data: safeXData,
            label: "Факт",
            color: "#D9D9D9",
            type: "bar",
        },
    ], [safeUData, safeXData]);

    return (
        <Box display={"flex"} flexDirection={"column"} gap={1} minHeight={"100%"}>
            <Box display={"flex"} maxHeight={"35"} gap={1}>
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
                        sx={{background: "#62A65D"}}
                        textAlign={"start"}
                        width={"100%"}
                    >
                        <Typography
                            sx={{fontWeight: "bold", color: "white"}}
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
                                    sx={{fontWeight: "bold", color: "#62A65D"}}
                                    variant="h6"
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
                                    sx={{fontWeight: "bold", color: "#62A65D"}}
                                    variant="h6"
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
                    width={"65%"}
                >
                    <Box
                        p={2}
                        sx={{background: "#62A65D"}}
                        textAlign={"start"}
                        width={"100%"}
                    >
                        <Typography
                            sx={{fontWeight: "bold", color: "white"}}
                            variant="body"
                        >
                            Планируемый бюджет, руб
                        </Typography>
                    </Box>
                    <Box p={2} display={"flex"} flexDirection={"column"} gap={1}>
                        <Box display={"flex"}>
                            {/*в семенах*/}
                            <Box
                                width={"50%"}
                                gap={1}
                                display={"flex"}
                                flexDirection={"column"}
                            >
                                <Typography variant="body1">в семенах</Typography>
                                <Box
                                    position={"relative"}
                                    display={"flex"}
                                    alignItems={"flex-end"}
                                    gap={1}
                                    justifyContent={"center"}
                                >
                                    <Typography
                                        sx={{fontWeight: "bold", color: "#62A65D"}}
                                        variant="h6"
                                    >
                                        {data?.plan_budget?.seeds?.plan_rub
                                            ? new Intl.NumberFormat("ru-RU").format(
                                                data.plan_budget.seeds.plan_rub.toFixed(0)
                                            )
                                            : 0}
                                    </Typography>
                                    <Typography color={"#00BCE5"} variant={"caption"}>
                                        {data?.plan_budget?.seeds?.fact_per
                                            ? data.plan_budget.seeds.fact_per
                                            : 0}{" "}
                                        %
                                    </Typography>
                                </Box>
                            </Box>
                            {/*ГСМ*/}
                            <Box
                                width={"50%"}
                                gap={1}
                                display={"flex"}
                                flexDirection={"column"}
                            >
                                <Typography variant="body1">ГСМ</Typography>
                                <Box
                                    position={"relative"}
                                    display={"flex"}
                                    alignItems={"flex-end"}
                                    gap={1}
                                    justifyContent={"center"}
                                >
                                    <Typography
                                        sx={{fontWeight: "bold", color: "#62A65D"}}
                                        variant="h6"
                                    >
                                        {data?.plan_budget?.fuel?.plan_rub
                                            ? new Intl.NumberFormat("ru-RU").format(
                                                data.plan_budget.fuel.plan_rub.toFixed(0)
                                            )
                                            : 0}
                                    </Typography>
                                    <Typography color={"#00BCE5"} variant={"caption"}>
                                        {data?.plan_budget?.fuel?.fact_per
                                            ? data.plan_budget.fuel.fact_per
                                            : 0}{" "}
                                        %
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                        <Box display={"flex"}>
                            {/*СХЗР*/}
                            <Box
                                width={"50%"}
                                gap={1}
                                display={"flex"}
                                flexDirection={"column"}
                            >
                                <Typography variant="body1">в СХЗР</Typography>
                                <Box
                                    position={"relative"}
                                    display={"flex"}
                                    alignItems={"flex-end"}
                                    gap={1}
                                    justifyContent={"center"}
                                >
                                    <Typography
                                        sx={{fontWeight: "bold", color: "#62A65D"}}
                                        variant="h6"
                                    >
                                        {data?.plan_budget?.shzr?.plan_rub
                                            ? new Intl.NumberFormat("ru-RU").format(
                                                data.plan_budget.shzr.plan_rub.toFixed(0)
                                            )
                                            : 0}
                                    </Typography>
                                    <Typography color={"#00BCE5"} variant={"caption"}>
                                        {data?.plan_budget?.shzr?.fact_per
                                            ? data.plan_budget.shzr.fact_per
                                            : 0}{" "}
                                        %
                                    </Typography>
                                </Box>
                            </Box>
                            {/*Продукция*/}
                            <Box
                                width={"50%"}
                                gap={1}
                                display={"flex"}
                                flexDirection={"column"}
                            >
                                <Typography variant="body1">оплата труда </Typography>

                                <Box
                                    position={"relative"}
                                    display={"flex"}
                                    alignItems={"flex-end"}
                                    gap={1}
                                    justifyContent={"center"}
                                >
                                    <Typography
                                        sx={{fontWeight: "bold", color: "#62A65D"}}
                                        variant="h6"
                                    >
                                        {data?.plan_budget?.payment_work?.plan_rub
                                            ? new Intl.NumberFormat("ru-RU").format(
                                                data.plan_budget.payment_work.plan_rub.toFixed(0)
                                            )
                                            : 0}
                                    </Typography>
                                    <Typography color={"#00BCE5"} variant={"caption"}>
                                        {data?.plan_budget?.payment_work?.fact_per
                                            ? data.plan_budget.payment_work.fact_per
                                            : 0}{" "}
                                        %
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                        {/*В минеральных удобрениях*/}
                        <Box display={"flex"}>
                            <Box
                                width={"50%"}
                                gap={1}
                                display={"flex"}
                                flexDirection={"column"}
                            >
                                <Typography variant="body1">в мин. удобрениях</Typography>

                                <Box
                                    position={"relative"}
                                    display={"flex"}
                                    alignItems={"flex-end"}
                                    gap={1}
                                    justifyContent={"center"}
                                >
                                    <Typography
                                        sx={{fontWeight: "bold", color: "#62A65D"}}
                                        variant="h6"
                                    >
                                        {data?.plan_budget?.fertilizers?.plan_rub
                                            ? new Intl.NumberFormat("ru-RU").format(
                                                data.plan_budget.fertilizers.plan_rub.toFixed(0)
                                            )
                                            : 0}
                                    </Typography>
                                    <Typography color={"#00BCE5"} variant={"caption"}>
                                        {data?.plan_budget?.fertilizers?.fact_per
                                            ? data.plan_budget.fertilizers.fact_per
                                            : 0}{" "}
                                        %
                                    </Typography>
                                </Box>
                            </Box>

                            {/*Прочие затраты*/}
                            <Box
                                width={"50%"}
                                gap={1}
                                display={"flex"}
                                flexDirection={"column"}
                            >
                                <Typography variant="body1">прочие затраты </Typography>

                                <Box
                                    position={"relative"}
                                    display={"flex"}
                                    alignItems={"flex-end"}
                                    gap={1}
                                    justifyContent={"center"}
                                >
                                    <Typography
                                        sx={{fontWeight: "bold", color: "#62A65D"}}
                                        variant="h6"
                                    >
                                        {data?.plan_budget?.other_expenses?.plan_rub
                                            ? new Intl.NumberFormat("ru-RU").format(
                                                data.plan_budget.other_expenses.plan_rub.toFixed(0)
                                            )
                                            : 0}
                                    </Typography>
                                    <Typography color={"#00BCE5"} variant={"caption"}>
                                        {data?.plan_budget?.other_expenses?.fact_per
                                            ? data.plan_budget.other_expenses.fact_per
                                            : 0}{" "}
                                        %
                                    </Typography>
                                </Box>
                            </Box>

                        </Box>
                    </Box>
                    <Typography color={"#00BCE5"} variant={"caption"}>
                        % выполнения плана
                    </Typography>
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
                        sx={{background: "#62A65D"}}
                        width={"100%"}
                    >
                        <Typography
                            sx={{fontWeight: "bold", color: "white"}}
                            variant="body"
                        >
                            План-фактный анализ по затратам, в руб
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            padding: "0 16px",
                            width: "100%", // Добавляем полную ширину
                            overflow: "visible" // Разрешаем overflow для видимости подписей
                        }}
                        display={"flex"}
                        flexDirection={"column"}
                        gap={1}
                    >
                        <BarChart
                            height={300}
                            skipAnimation={true}
                            disableAxisListener={true}
                            margin={{ // Добавляем отступы для осей
                                left: 20, // Увеличиваем место для подписей Y
                                right: 20,
                                top: 30,
                                bottom: 30 // Увеличиваем место для подписей X
                            }}
                            sx={{
                                padding: "5px 0",
                                width: "100%",
                                "& .MuiChartsAxis-label": { // Стили для подписей осей
                                    fontSize: "0.75rem",
                                    transform: "translate(-10px, 0)" // Сдвигаем подпись оси Y влево
                                }
                            }}
                            series={chartSeries}
                            xAxis={[
                                {
                                    data: xLabels,
                                    scaleType: "band",

                                    valueFormatter: (index) => xAxisLabels[index],
                                    labelStyle: { // Стили для подписи оси X
                                        fontSize: "0.75rem",
                                        transform: "translateY(40px)" // Сдвигаем подпись вниз
                                    }
                                },
                            ]}
                    
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
