import {Box, Typography} from "@mui/material";
import React, {useEffect, useState} from "react";
import {Chart} from 'react-google-charts';

const StructureContent = ({year, reportData}) => {
    const loading = !reportData && year;
    const [isVisible, setIsVisible] = useState(false);

    // Пересчет размера диаграмм при монтировании и изменении данных
    useEffect(() => {
        if (reportData) {
            // Сначала делаем блок прозрачным
            setIsVisible(false);
            
            let timer2;
            
            // Задержка для того, чтобы контейнер успел отобразиться после переключения вкладок
            const timer1 = setTimeout(() => {
                // Вызываем событие resize для пересчета размера диаграмм
                window.dispatchEvent(new Event('resize'));
                
                // Плавно показываем графики после пересчета
                timer2 = setTimeout(() => {
                    setIsVisible(true);
                }, 50);
            }, 200);
            
            return () => {
                clearTimeout(timer1);
                if (timer2) clearTimeout(timer2);
            };
        }
    }, [reportData]);

    // Подготовка данных для круговой диаграммы (группы)
    const getDonutChartData = () => {
        if (!reportData?.groups) return null;
        
        const data = [['Группа', 'Площадь']];
        const colors = [];
        const colorPalette = ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#9C27B0', '#00BCD4', '#FF9800', '#4CAF50'];
        
        reportData.groups.forEach((group, index) => {
            const area = group.total_area ? parseFloat(group.total_area).toFixed(2) : '0';
            const label = `${group.group_name} (${area} Га)`;
            data.push([label, group.total_area]);
            colors.push(colorPalette[index % colorPalette.length]);
        });
        
        return { data, colors };
    };

    // Подготовка данных для горизонтальной гистограммы (культуры)
    const getBarChartData = () => {
        if (!reportData?.groups || !reportData.total_area) return null;
        
        const data = [['Культура', 'Доля, %', {type: 'string', role: 'annotation'}]];
        const totalArableArea = reportData.total_area;
        
        reportData.groups.forEach(group => {
            group.subgroups?.forEach(subgroup => {
                subgroup.crops?.forEach(crop => {
                    // Вычисляем долю от общей площади пашни
                    const share = totalArableArea > 0 ? (crop.area / totalArableArea * 100) : 0;
                    data.push([crop.crop_name, share, `${share.toFixed(1)}%`]);
                });
            });
        });
        
        // Сортируем по доле
        const header = data[0];
        const rows = data.slice(1).sort((a, b) => b[1] - a[1]);
        
        return [header, ...rows];
    };

    const donutData = getDonutChartData();
    const barData = getBarChartData();

    // Вычисляем максимальное значение для динамического масштаба гистограммы
    const getMaxBarValue = () => {
        if (!barData || barData.length < 2) return 100;
        const values = barData.slice(1).map(row => row[1]);
        const maxValue = Math.max(...values);
        // Добавляем 10% отступа сверху для лучшей визуализации
        return Math.ceil(maxValue * 1.1);
    };

    const maxBarValue = getMaxBarValue();

    if (loading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
                <Typography>Загрузка данных...</Typography>
            </Box>
        );
    }

    if (!reportData) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
                <Typography>Нет данных</Typography>
            </Box>
        );
    }

    const donutOptions = {
        title: 'Распределение площадей сельскохозяйственных культур по группам культур',
        pieHole: 0.4,
        legend: {
            position: 'right',
            alignment: 'center',
        },
        chartArea: {left: 0, top: 60, width: '100%', height: '75%'},
        colors: donutData?.colors || [],
        pieSliceText: 'percentage',
        fontSize: 12,
        tooltip: {
            trigger: 'selection',
        },
    };

    const barOptions = {
        title: 'Структура посевов по сельскохозяйственным культурам (% доли общей площади)',
        hAxis: {
            title: 'Доля, %',
            minValue: 0,
            maxValue: maxBarValue,
        },
        legend: {position: 'none'},
        chartArea: {left: 120, top: 60, width: '75%', height: '85%'},
        fontSize: 12,
        tooltip: {
            trigger: 'selection',
        },
        annotations: {
            textStyle: {
                fontSize: 11,
                color: '#000',
            },
            alwaysOutside: false,
        },
    };

    return (
        <Box 
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                gap: '20px',
                padding: '20px',
                overflow: 'visible',
                opacity: isVisible ? 1 : 0,
                transition: 'opacity 0.3s ease-in-out',
            }}
        >
            {/* Круговая диаграмма - сверху */}
            {donutData && (
                <Box sx={{
                    minHeight: '300px',
                    height: '380px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingBottom: '80px',
                    paddingTop: '20px',
                    paddingLeft: '20px',
                    overflow: 'visible',
                    position: 'relative',
                }}>
                    <Chart
                        chartType="PieChart"
                        width="100%"
                        height="300px"
                        data={donutData.data}
                        options={donutOptions}
                        key={`donut-${reportData?.year || year}`}
                    />
                </Box>
            )}

            {/* Горизонтальная гистограмма - снизу */}
            {barData && barData.length > 1 && (
                <Box sx={{
                    minHeight: '400px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Chart
                        chartType="BarChart"
                        width="100%"
                        height="400px"
                        data={barData}
                        options={barOptions}
                        key={`bar-${reportData?.year || year}`}
                    />
                </Box>
            )}
        </Box>
    );
};

export default StructureContent;

