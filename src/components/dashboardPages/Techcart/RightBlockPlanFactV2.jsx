import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Modal,
    Button
} from "@mui/material";
import React, {useState, useEffect, useMemo, useRef} from "react";
import {BarChart} from "@mui/x-charts/BarChart";
import {httpService} from "../../../api/setup";

const RightBlockPlanFactV2 = ({dashboardData, selectedCultures, selectedFields, year, planType}) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [detailsData, setDetailsData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [chartHeight, setChartHeight] = useState(400);
    const chartContainerRef = useRef(null);

    // Данные из API
    const totalCostsData = dashboardData?.summary ? {
        planned: {total: dashboardData.summary.plan, perHa: dashboardData.summary.plan_per_ha},
        actual: {total: dashboardData.summary.fact, perHa: dashboardData.summary.fact_per_ha}
    } : {
        planned: {total: 0, perHa: 0},
        actual: {total: 0, perHa: 0}
    };

    const grossOutputData = dashboardData?.production ? {
        planned: {total: dashboardData.production.plan, perHa: dashboardData.production.plan_c_per_ha},
        actual: {total: dashboardData.production.fact, perHa: dashboardData.production.fact_c_per_ha}
    } : {
        planned: {total: 0, perHa: 0},
        actual: {total: 0, perHa: 0}
    };

    const materialCostsData = dashboardData?.materials ? [
        {
            category: "Семена",
            plan: dashboardData.materials.seeds.plan,
            fact: dashboardData.materials.seeds.fact,
            percentage: dashboardData.materials.seeds.percent
        },
        {
            category: "Удобрения",
            plan: dashboardData.materials.fertilizers.plan,
            fact: dashboardData.materials.fertilizers.fact,
            percentage: dashboardData.materials.fertilizers.percent
        },
        {
            category: "СХЗР",
            plan: dashboardData.materials.shzr.plan,
            fact: dashboardData.materials.shzr.fact,
            percentage: dashboardData.materials.shzr.percent
        },
        {
            category: "ГСМ",
            plan: dashboardData.materials.fuel.plan,
            fact: dashboardData.materials.fuel.fact,
            percentage: dashboardData.materials.fuel.percent
        },
        {
            category: "Оплата труда",
            plan: dashboardData.materials.payment_work.plan,
            fact: dashboardData.materials.payment_work.fact,
            percentage: dashboardData.materials.payment_work.percent
        },
        {
            category: "Прочие затраты",
            plan: dashboardData.materials.other.plan,
            fact: dashboardData.materials.other.fact,
            percentage: dashboardData.materials.other.percent
        }
    ] : [
        {category: "Семена", plan: 0, fact: 0, percentage: 0},
        {category: "Удобрения", plan: 0, fact: 0, percentage: 0},
        {category: "СХЗР", plan: 0, fact: 0, percentage: 0},
        {category: "ГСМ", plan: 0, fact: 0, percentage: 0},
        {category: "Оплата труда", plan: 0, fact: 0, percentage: 0},
        {category: "Прочие затраты", plan: 0, fact: 0, percentage: 0}
    ];

    // Мемоизация данных для графика для оптимизации производительности
    const chartData = useMemo(() => ({
        plan: materialCostsData.map(item => item.plan),
        fact: materialCostsData.map(item => item.fact),
        percentages: materialCostsData.map(item => item.percentage),
        categories: materialCostsData.map(item => item.category)
    }), [materialCostsData]);

    const formatNumber = (num) => {
        return new Intl.NumberFormat("ru-RU").format(Math.round(num));
    };

    // Функция для получения деталей по категории
    const fetchDetailsData = async (categoryName) => {
        setLoading(true);
        try {
            // Маппинг названий категорий на группы
            const categoryToGroup = {
                "Семена": "seeds",
                "Удобрения": "fertilizers",
                "СХЗР": "shzr",
                "ГСМ": "fuel",
                "Оплата труда": "payment_work",
                "Прочие затраты": "other"
            };

            const requestBody = {
                year: year || 2025,
                plan_type: planType || "results_seva",
                group: categoryToGroup[categoryName] || "seeds",
                culture_ids: selectedCultures || [],
                structure_ids: selectedFields || []
            };

            const response = await httpService.post('/plan_fact_v2/dashboard/details', requestBody);

            setDetailsData(response.data);
            return response.data;
        } catch (error) {
            console.error('Ошибка при получении деталей:', error);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Обработчик клика на столбец
    const handleBarClick = async (dataIndex) => {
        // Игнорируем клик, если модальное окно уже открыто
        if (modalOpen) {
            return;
        }

        if (dataIndex !== undefined && dataIndex >= 0 && dataIndex < chartData.categories.length) {
            const category = chartData.categories[dataIndex];
            const categoryData = materialCostsData[dataIndex];

            setSelectedCategory({
                name: category,
                ...categoryData
            });
            setModalOpen(true);

            // Получаем детали по выбранной категории
            await fetchDetailsData(category);
        }
    };

    // Вычисление высоты графика асинхронно через useEffect для оптимизации производительности
    useEffect(() => {
        const calculateChartHeight = () => {
            // Используем requestAnimationFrame для отложенного вычисления после рендера
            requestAnimationFrame(() => {
                if (chartContainerRef.current) {
                    // Вычисляем высоту на основе контейнера, а не всего документа
                    const containerHeight = chartContainerRef.current.offsetHeight;
                    const calculatedHeight = Math.max(300, containerHeight - 100);
                    setChartHeight(calculatedHeight);
                } else {
                    // Fallback: используем высоту окна, если контейнер еще не готов
                    const windowHeight = window.innerHeight;
                    const calculatedHeight = Math.max(300, windowHeight - 680);
                    setChartHeight(calculatedHeight);
                }
            });
        };

        // Вычисляем высоту при монтировании и изменении данных
        calculateChartHeight();

        // Обработчик изменения размера окна
        const handleResize = () => {
            calculateChartHeight();
        };

        // Используем debounce для оптимизации обработки resize
        let resizeTimeout;
        const debouncedResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(handleResize, 150);
        };

        window.addEventListener('resize', debouncedResize);

        return () => {
            window.removeEventListener('resize', debouncedResize);
            clearTimeout(resizeTimeout);
        };
    }, [dashboardData]);
    return (
        <Box display={"flex"} flexDirection={"column"} gap={2} minHeight={"100%"}>
            {/* Верхние блоки - расположены горизонтально */}
            <Box display={"flex"} gap={2} minHeight={"45%"}>
                {/* Левая колонка - два блока друг под другом */}
                <Box display={"flex"} flexDirection={"column"} justifyContent={"space-between"} gap={2} width={"45%"}>
                    {/* Итого затраты */}
                    <Box
                        sx={{
                            background: "#F9F9F9",
                            border: "1px solid #bfbfbf",
                            borderRadius: "4px",
                            borderTop: "4px solid #62A65D",
                            padding: 0,
                            flexDirection: "column",
                            width: "100%"
                        }}
                    >
                        <Box
                            p={1}
                            textAlign={"center"}
                        >
                            <Typography
                                variant="body1"
                            >
                                Итого затраты, руб
                            </Typography>
                        </Box>
                        <Box p={2} pt={0}>
                            {/* Заголовки колонок */}
                            <Box display="flex">
                                <Box sx={{
                                    width: "30%",
                                    textAlign: "center",
                                    borderRight: "1px solid #d0d0d0",
                                    paddingRight: 1
                                }}>
                                    <Typography variant="body2" sx={{
                                        fontWeight: "bold",
                                        fontSize: "12px",
                                        paddingBottom: '10px'
                                    }}>Затраты</Typography>
                                </Box>
                                <Box sx={{
                                    width: "40%",
                                    textAlign: "center",
                                    borderRight: "1px solid #d0d0d0",
                                    paddingRight: 1
                                }}>
                                    <Typography variant="body2"
                                                sx={{fontWeight: "bold", fontSize: "12px"}}>Всего</Typography>
                                </Box>
                                <Box sx={{width: "30%", textAlign: "center"}}>
                                    <Typography variant="body2" sx={{fontWeight: "bold", fontSize: "12px"}}>На 1
                                        га</Typography>
                                </Box>
                            </Box>

                            {/* Строка "Плановые" */}
                            <Box display="flex">
                                <Box sx={{
                                    width: "30%",
                                    textAlign: "left",
                                    borderRight: "1px solid #d0d0d0",
                                    paddingRight: 1
                                }}>
                                    <Typography variant="body2"
                                                sx={{fontSize: "12px", paddingBottom: '10px'}}>Плановые</Typography>
                                </Box>
                                <Box sx={{
                                    width: "40%",
                                    textAlign: "center",
                                    borderRight: "1px solid #d0d0d0",
                                    paddingRight: 1
                                }}>
                                    <Typography color="#62A65D" fontWeight={"bold"} variant="body2"
                                                sx={{fontSize: "12px"}}>{formatNumber(totalCostsData.planned.total)}</Typography>
                                </Box>
                                <Box sx={{width: "30%", textAlign: "center"}}>
                                    <Typography color="#62A65D" fontWeight={"bold"} variant="body2"
                                                sx={{fontSize: "12px"}}>{formatNumber(totalCostsData.planned.perHa)}</Typography>
                                </Box>
                            </Box>

                            {/* Строка "Фактические" */}
                            <Box display="flex">
                                <Box sx={{
                                    width: "30%",
                                    textAlign: "left",
                                    borderRight: "1px solid #d0d0d0",
                                    paddingRight: 1
                                }}>
                                    <Typography variant="body2" sx={{fontSize: "12px"}}>Фактические</Typography>
                                </Box>
                                <Box sx={{
                                    width: "40%",
                                    textAlign: "center",
                                    borderRight: "1px solid #d0d0d0",
                                    paddingRight: 1
                                }}>
                                    <Typography color="#62A65D" fontWeight={"bold"} variant="body2"
                                                sx={{fontSize: "12px"}}>
                                        {formatNumber(totalCostsData.actual.total)}
                                    </Typography>
                                </Box>
                                <Box sx={{width: "30%", textAlign: "center"}}>
                                    <Typography color="#62A65D" fontWeight={"bold"} variant="body2"
                                                sx={{fontSize: "12px"}}>
                                        {formatNumber(totalCostsData.actual.perHa)}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                    {/* Валовый выход продукции */}
                    <Box
                        sx={{
                            background: "#F9F9F9",
                            border: "1px solid #bfbfbf",
                            borderRadius: "4px",
                            borderTop: "4px solid #62A65D",
                            padding: 0,
                            flexDirection: "column",
                            width: "100%"
                        }}
                    >
                        <Box
                            p={2}
                        >
                            <Typography
                                variant="body1"
                            >
                                Валовый выход продукции
                            </Typography>
                        </Box>
                        <Box p={2} pt={0}>
                            {/* Заголовки колонок */}
                            <Box display="flex">
                                <Box sx={{
                                    width: "30%",
                                    textAlign: "center",
                                    borderRight: "1px solid #d0d0d0",
                                    paddingRight: 1
                                }}>
                                    <Typography variant="body2" sx={{
                                        fontWeight: "bold",
                                        fontSize: "12px",
                                        paddingBottom: '10px'
                                    }}>Продукция</Typography>
                                </Box>
                                <Box sx={{
                                    width: "40%",
                                    textAlign: "center",
                                    borderRight: "1px solid #d0d0d0",
                                    paddingRight: 1
                                }}>
                                    <Typography variant="body2"
                                                sx={{fontWeight: "bold", fontSize: "12px"}}>Всего</Typography>
                                </Box>
                                <Box sx={{width: "30%", textAlign: "center"}}>
                                    <Typography variant="body2" sx={{fontWeight: "bold", fontSize: "12px"}}>ц, с 1
                                        га</Typography>
                                </Box>
                            </Box>

                            {/* Строка "Плановые" */}
                            <Box display="flex">
                                <Box sx={{
                                    width: "30%",
                                    textAlign: "left",
                                    borderRight: "1px solid #d0d0d0",
                                    paddingRight: 1
                                }}>
                                    <Typography variant="body2"
                                                sx={{fontSize: "12px", paddingBottom: '10px'}}>Плановые</Typography>
                                </Box>
                                <Box sx={{
                                    width: "40%",
                                    textAlign: "center",
                                    borderRight: "1px solid #d0d0d0",
                                    paddingRight: 1
                                }}>
                                    <Typography color="#62A65D" fontWeight={"bold"} variant="body2"
                                                sx={{fontSize: "12px"}}>{formatNumber(grossOutputData.planned.total)}</Typography>
                                </Box>
                                <Box sx={{width: "30%", textAlign: "center"}}>
                                    <Typography color="#62A65D" fontWeight={"bold"} variant="body2"
                                                sx={{fontSize: "12px"}}>{grossOutputData.planned.perHa}</Typography>
                                </Box>
                            </Box>

                            {/* Строка "Фактические" */}
                            <Box display="flex">
                                <Box sx={{
                                    width: "30%",
                                    textAlign: "left",
                                    borderRight: "1px solid #d0d0d0",
                                    paddingRight: 1
                                }}>
                                    <Typography variant="body2" sx={{fontSize: "12px"}}>Фактические</Typography>
                                </Box>
                                <Box sx={{
                                    width: "40%",
                                    textAlign: "center",
                                    borderRight: "1px solid #d0d0d0",
                                    paddingRight: 1
                                }}>
                                    <Typography color="#62A65D" fontWeight={"bold"} variant="body2"
                                                sx={{fontSize: "12px"}}>
                                        {formatNumber(grossOutputData.actual.total)}
                                    </Typography>
                                </Box>
                                <Box sx={{width: "30%", textAlign: "center"}}>
                                    <Typography color="#62A65D" fontWeight={"bold"} variant="body2"
                                                sx={{fontSize: "12px"}}>
                                        {grossOutputData.actual.perHa}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* Правая колонка - Материальные затраты */}
                <Box width={"55%"}>
                    {/* Материальные затраты */}
                    <Box
                        sx={{
                            background: "#F9F9F9",
                            border: "1px solid #bfbfbf",
                            borderRadius: "4px",
                            borderTop: "4px solid #62A65D",
                            padding: 0,
                            flexDirection: "column",
                            height: "100%",
                            display: "flex"
                        }}
                    >
                        <Box p={1}>
                            <Typography
                                variant="body1"
                            >
                                Материальные затраты, руб.
                            </Typography>
                        </Box>
                        <Box p={2}>
                            {/* Заголовки колонок */}
                            <Box display="flex">
                                <Box sx={{
                                    width: "26%",
                                    textAlign: "center",
                                    borderRight: "1px solid #d0d0d0",
                                    paddingRight: 1
                                }}>
                                    <Typography variant="body2" sx={{
                                        fontWeight: "bold",
                                        fontSize: "12px",
                                        paddingBottom: '10px'
                                    }}>Затраты</Typography>
                                </Box>
                                <Box sx={{
                                    width: "32%",
                                    textAlign: "center",
                                    borderRight: "1px solid #d0d0d0",
                                    paddingRight: 1
                                }}>
                                    <Typography variant="body2"
                                                sx={{fontWeight: "bold", fontSize: "12px"}}>План</Typography>
                                </Box>
                                <Box sx={{width: "42%", textAlign: "center"}}>
                                    <Typography variant="body2"
                                                sx={{fontWeight: "bold", fontSize: "12px"}}>Факт</Typography>
                                </Box>
                            </Box>

                            {/* Строки данных */}
                            {materialCostsData.map((item, index) => (
                                <Box key={index} display="flex">
                                    <Box sx={{
                                        width: "26%",
                                        textAlign: "left",
                                        borderRight: "1px solid #d0d0d0",
                                        paddingRight: 1
                                    }}>
                                        <Typography variant="body2" sx={{
                                            fontSize: "12px",
                                            paddingBottom: index < materialCostsData.length - 1 ? '10px' : '0px'
                                        }}>
                                            {item.category}
                                        </Typography>
                                    </Box>
                                    <Box sx={{
                                        width: "32%",
                                        textAlign: "center",
                                        borderRight: "1px solid #d0d0d0",
                                        paddingRight: 1
                                    }}>
                                        <Typography color="#62A65D" fontWeight={"bold"} variant="body2"
                                                    sx={{fontSize: "12px"}}>
                                            {formatNumber(item.plan)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{
                                        width: "42%",
                                        textAlign: "center",
                                        display: "flex",
                                        justifyContent: "space-around"
                                    }}>
                                        <Typography color={item.percentage < 100 ? "#FF0000" : "#62A65D"}
                                                    fontWeight={"bold"} variant="body2" sx={{fontSize: "12px"}}>
                                            {formatNumber(item.fact)}
                                        </Typography>
                                        <Typography color="#00BCE5" variant="body2"
                                                    sx={{fontSize: "10px", marginTop: "2px"}}>
                                            {item.percentage}%
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                        {/* Пояснение */}
                        <Box sx={{
                            padding: "8px 16px",
                            textAlign: "right",
                            mt: "auto",
                            height: "100%",
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'flex-end'
                        }}>
                            <Typography color="#00BCE5" variant="caption" sx={{fontSize: "10px"}}>
                                % выполнения плана
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* График - отдельно внизу */}
            <Box
                sx={{
                    background: "#F9F9F9",
                    border: "1px solid #bfbfbf",
                    borderRadius: "4px",
                    borderTop: "4px solid #62A65D",
                    padding: 0,
                    flexDirection: "column",
                    height: "100%",
                    flex: 1
                }}
            >
                <Box
                    p={2}
                    pb={0}
                >
                    <Typography
                        variant="body1"
                    >
                        План-фактный анализ по затратам, в руб.
                    </Typography>
                </Box>
                <Box 
                    ref={chartContainerRef}
                    sx={{padding: "16px", height: "100%", position: "relative"}}
                >
                    <BarChart
                        key={`chart-${planType}-${year}`}
                        height={chartHeight}
                        margin={{
                            left: 10,
                            right: 10,
                            top: 20,
                            bottom: 20
                        }}
                        sx={{
                            padding: "5px 0",
                            width: "100%",
                            "& .MuiChartsAxis-label": {
                                fontSize: "0.75rem",
                                transform: "translate(-10px, 0)"
                            }
                        }}
                        series={[
                            {
                                data: chartData.plan,
                                label: "План",
                                color: "#62A65D",
                                type: "bar",
                            },
                            {
                                data: chartData.fact,
                                label: "Факт",
                                color: "#00BCE5",
                                type: "bar",
                                valueFormatter: (value) => {
                                    const dataIndex = chartData.fact.indexOf(value) || 0;
                                    const percentage = chartData.percentages[dataIndex] || 0;
                                    return `${formatNumber(value)} (${percentage}%)`;
                                }
                            },
                        ]}
                        xAxis={[
                            {
                                data: [0, 1, 2, 3, 4, 5],
                                scaleType: "band",
                                valueFormatter: (index) => chartData.categories[index],
                                labelStyle: {
                                    fontSize: "0.75rem",
                                    transform: "translateY(40px)"
                                }
                            },
                        ]}
                        slotProps={{
                            bar: {
                                rx: 4,
                            },
                        }}
                        // ↓↓↓ ДОБАВЬТЕ ОБРАБОТЧИКИ СЮДА ↓↓↓
                        onItemClick={(event, params) => {
                            handleBarClick(params.dataIndex);
                        }}
                        onAxisClick={(event, params) => {
                            handleBarClick(params.dataIndex);
                        }}
                    />
                </Box>
            </Box>

            {/* Модальное окно */}
            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                aria-labelledby="modal-title"
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '80%',
                        maxWidth: '1200px',
                        height: '80vh',
                        maxHeight: '80vh',
                        bgcolor: 'background.paper',
                        border: '2px solid #000',
                        boxShadow: 24,
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                    }}
                >
                    {/* Заголовок модального окна */}
                    <Box sx={{p: 3, pb: 2, borderBottom: '1px solid #e0e0e0'}}>
                        <Typography id="modal-title" variant="h6" component="h2">
                            Сводные данные по определению затрат на производство
                            продукции: {detailsData?.summary?.group || selectedCategory?.name}
                        </Typography>
                    </Box>

                    {/* Основное содержимое с скроллом */}
                    <Box sx={{
                        flex: 1,
                        overflow: 'auto',
                        p: 3,
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {loading ? (
                            <Box sx={{
                                mb: 2,
                                textAlign: 'center',
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Typography variant="body1">Загрузка данных...</Typography>
                            </Box>
                        ) : (
                            <>
                                {selectedCategory && (
                                    <Box sx={{mb: 2}}>
                                        <Typography variant="body1" sx={{mb: 1}}>
                                            <strong>План:</strong> {formatNumber(selectedCategory.plan)} руб.
                                        </Typography>
                                        <Typography variant="body1" sx={{mb: 1}}>
                                            <strong>Факт:</strong> {formatNumber(selectedCategory.fact)} руб.
                                        </Typography>
                                        <Typography variant="body1" sx={{mb: 1}}>
                                            <strong>% выполнения:</strong> {selectedCategory.percentage}%
                                        </Typography>
                                    </Box>
                                )}

                                {detailsData && (
                                    <Box sx={{mb: 2}}>
                                        <Typography variant="h6" sx={{mb: 2}}>
                                            Сравнительная таблица: {selectedCategory?.name}
                                        </Typography>

                                        {/* Таблица в стиле референса */}
                                        <TableContainer component={Paper}
                                                        sx={{boxShadow: 'none', border: '1px solid #d0d0d0'}}>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell
                                                            sx={{
                                                                backgroundColor: 'white',
                                                                color: 'black',
                                                                fontWeight: 'bold',
                                                                textAlign: 'center',
                                                                border: '1px solid #d0d0d0'
                                                            }}
                                                        >
                                                        </TableCell>
                                                        <TableCell
                                                            colSpan={3}
                                                            sx={{
                                                                backgroundColor: 'white',
                                                                color: 'black',
                                                                fontWeight: 'bold',
                                                                textAlign: 'center',
                                                                border: '1px solid #d0d0d0'
                                                            }}
                                                        >
                                                            Затраты, руб
                                                        </TableCell>
                                                        <TableCell
                                                            colSpan={3}
                                                            sx={{
                                                                backgroundColor: 'white',
                                                                color: 'black',
                                                                fontWeight: 'bold',
                                                                textAlign: 'center',
                                                                border: '1px solid #d0d0d0'
                                                            }}
                                                        >
                                                            Затраты, на 1 га
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell
                                                            sx={{
                                                                backgroundColor: '#62A65D',
                                                                color: 'white',
                                                                fontWeight: 'bold',
                                                                textAlign: 'left',
                                                                border: '1px solid #d0d0d0'
                                                            }}
                                                        >
                                                            Материалы
                                                        </TableCell>
                                                        <TableCell
                                                            sx={{
                                                                backgroundColor: '#62A65D',
                                                                color: 'white',
                                                                fontWeight: 'bold',
                                                                textAlign: 'center',
                                                                border: '1px solid #d0d0d0'
                                                            }}
                                                        >
                                                            План
                                                        </TableCell>
                                                        <TableCell
                                                            sx={{
                                                                backgroundColor: '#00BCE5',
                                                                color: 'white',
                                                                fontWeight: 'bold',
                                                                textAlign: 'center',
                                                                border: '1px solid #d0d0d0'
                                                            }}
                                                        >
                                                            Факт
                                                        </TableCell>
                                                        <TableCell
                                                            sx={{
                                                                backgroundColor: '#62A65D',
                                                                color: 'white',
                                                                fontWeight: 'bold',
                                                                textAlign: 'center',
                                                                border: '1px solid #d0d0d0'
                                                            }}
                                                        >
                                                            %, выполнение
                                                        </TableCell>
                                                        <TableCell
                                                            sx={{
                                                                backgroundColor: '#62A65D',
                                                                color: 'white',
                                                                fontWeight: 'bold',
                                                                textAlign: 'center',
                                                                border: '1px solid #d0d0d0'
                                                            }}
                                                        >
                                                            План
                                                        </TableCell>
                                                        <TableCell
                                                            sx={{
                                                                backgroundColor: '#00BCE5',
                                                                color: 'white',
                                                                fontWeight: 'bold',
                                                                textAlign: 'center',
                                                                border: '1px solid #d0d0d0'
                                                            }}
                                                        >
                                                            Факт
                                                        </TableCell>
                                                        <TableCell
                                                            sx={{
                                                                backgroundColor: '#62A65D',
                                                                color: 'white',
                                                                fontWeight: 'bold',
                                                                textAlign: 'center',
                                                                border: '1px solid #d0d0d0'
                                                            }}
                                                        >
                                                            %, выполнение
                                                        </TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {/* Основная категория из summary */}
                                                    {detailsData?.summary && (
                                                        <TableRow>
                                                            <TableCell
                                                                sx={{
                                                                    fontWeight: 'bold',
                                                                    textAlign: 'left',
                                                                    border: '1px solid #d0d0d0'
                                                                }}
                                                            >
                                                                {detailsData.summary.group || selectedCategory?.name}
                                                            </TableCell>
                                                            <TableCell
                                                                sx={{
                                                                    fontWeight: 'bold',
                                                                    textAlign: 'right',
                                                                    border: '1px solid #d0d0d0'
                                                                }}
                                                            >
                                                                {formatNumber(detailsData.summary.plan || 0)}
                                                            </TableCell>
                                                            <TableCell
                                                                sx={{
                                                                    fontWeight: 'bold',
                                                                    textAlign: 'right',
                                                                    border: '1px solid #d0d0d0'
                                                                }}
                                                            >
                                                                {formatNumber(detailsData.summary.fact || 0)}
                                                            </TableCell>
                                                            <TableCell
                                                                sx={{
                                                                    fontWeight: 'bold',
                                                                    textAlign: 'right',
                                                                    border: '1px solid #d0d0d0'
                                                                }}
                                                            >
                                                                {detailsData.summary.percent || 0}
                                                            </TableCell>
                                                            <TableCell
                                                                sx={{
                                                                    fontWeight: 'bold',
                                                                    textAlign: 'right',
                                                                    border: '1px solid #d0d0d0'
                                                                }}
                                                            >
                                                                {formatNumber(detailsData.summary.plan_per_ha || 0)}
                                                            </TableCell>
                                                            <TableCell
                                                                sx={{
                                                                    fontWeight: 'bold',
                                                                    textAlign: 'right',
                                                                    border: '1px solid #d0d0d0'
                                                                }}
                                                            >
                                                                {formatNumber(detailsData.summary.fact_per_ha || 0)}
                                                            </TableCell>
                                                            <TableCell
                                                                sx={{
                                                                    fontWeight: 'bold',
                                                                    textAlign: 'right',
                                                                    border: '1px solid #d0d0d0'
                                                                }}
                                                            >
                                                                {detailsData.summary.percent_per_ha || 0}
                                                            </TableCell>
                                                        </TableRow>
                                                    )}

                                                    {/* Элементы из items */}
                                                    {detailsData?.items?.map((item, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell
                                                                sx={{
                                                                    textAlign: 'left',
                                                                    paddingLeft: 3,
                                                                    border: '1px solid #d0d0d0'
                                                                }}
                                                            >
                                                                {item.nomenclature_name}
                                                            </TableCell>
                                                            <TableCell
                                                                sx={{
                                                                    textAlign: 'right',
                                                                    border: '1px solid #d0d0d0'
                                                                }}
                                                            >
                                                                {formatNumber(item.plan || 0)}
                                                            </TableCell>
                                                            <TableCell
                                                                sx={{
                                                                    textAlign: 'right',
                                                                    border: '1px solid #d0d0d0'
                                                                }}
                                                            >
                                                                {formatNumber(item.fact || 0)}
                                                            </TableCell>
                                                            <TableCell
                                                                sx={{
                                                                    textAlign: 'right',
                                                                    border: '1px solid #d0d0d0'
                                                                }}
                                                            >
                                                                {item.percent || 0}
                                                            </TableCell>
                                                            <TableCell
                                                                sx={{
                                                                    textAlign: 'right',
                                                                    border: '1px solid #d0d0d0'
                                                                }}
                                                            >
                                                                {formatNumber(item.plan_per_ha || 0)}
                                                            </TableCell>
                                                            <TableCell
                                                                sx={{
                                                                    textAlign: 'right',
                                                                    border: '1px solid #d0d0d0'
                                                                }}
                                                            >
                                                                {formatNumber(item.fact_per_ha || 0)}
                                                            </TableCell>
                                                            <TableCell
                                                                sx={{
                                                                    textAlign: 'right',
                                                                    border: '1px solid #d0d0d0'
                                                                }}
                                                            >
                                                                {item.percent_per_ha || 0}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Box>
                                )}
                            </>
                        )}
                    </Box>

                    {/* Кнопка закрытия - всегда видна внизу */}
                    <Box sx={{
                        p: 3,
                        pt: 2,
                        borderTop: '1px solid #e0e0e0',
                        backgroundColor: '#f9f9f9'
                    }}>
                        <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
                            <Button
                                variant="contained"
                                onClick={() => setModalOpen(false)}
                                sx={{backgroundColor: '#62A65D'}}
                            >
                                Закрыть
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
};

export default RightBlockPlanFactV2;