import {Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper} from "@mui/material";
import React from "react";

const StructureTable = ({reportData}) => {
    if (!reportData?.groups || !reportData.total_area) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '20px'}}>
                <Typography>Нет данных</Typography>
            </Box>
        );
    }

    // Подготовка данных для таблицы
    const getTableData = () => {
        const rows = [];
        
        reportData.groups.forEach(group => {
            // Добавляем заголовок группы
            rows.push({
                type: 'group',
                name: group.group_name,
                area: group.total_area,
                share: group.share_pct_of_total,
            });
            
            group.subgroups?.forEach(subgroup => {
                // Добавляем культуры подгруппы
                subgroup.crops?.forEach(crop => {
                    // Используем процент культуры в подгруппе из API
                    rows.push({
                        type: 'crop',
                        name: crop.crop_name,
                        area: crop.area,
                        share: crop.share_pct_in_subgroup,
                    });
                });
                
                // Добавляем итоговую строку для подгруппы (если есть название и культуры)
                if (subgroup.subgroup_name && subgroup.crops && subgroup.crops.length > 0) {
                    // Используем процент подгруппы в группе из API
                    rows.push({
                        type: 'subgroup',
                        name: `Итого ${subgroup.subgroup_name.toLowerCase()}`,
                        area: subgroup.total_area,
                        share: subgroup.share_pct_in_group,
                    });
                }
            });
        });
        
        // Добавляем итоговую строку "Пашня" в конец
        rows.push({
            type: 'group',
            name: 'Пашня',
            area: reportData.total_area,
            share: reportData.all_pct || 100,
        });
        
        return rows;
    };

    const tableData = getTableData();

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            padding: '20px',
            overflow: 'auto',
        }}>
            <TableContainer component={Paper} sx={{maxHeight: '100%', overflow: 'auto'}}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{fontWeight: 'bold', backgroundColor: '#f5f5f5'}}>Культура</TableCell>
                            <TableCell align="right" sx={{fontWeight: 'bold', backgroundColor: '#f5f5f5'}}>Площадь, га</TableCell>
                            <TableCell align="right" sx={{fontWeight: 'bold', backgroundColor: '#f5f5f5'}}>Доля, % пашни</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tableData.map((row, index) => {
                            const isGroup = row.type === 'group';
                            const isSubgroup = row.type === 'subgroup';
                            
                            return (
                                <TableRow 
                                    key={index}
                                    sx={{
                                        backgroundColor: isGroup ? '#f5f5f5' : isSubgroup ? '#fafafa' : 'white',
                                        '& .MuiTableCell-root': {
                                            fontWeight: isGroup ? 'bold' : isSubgroup ? 'bold' : 'normal',
                                            paddingTop: '8px',
                                            paddingBottom: '8px',
                                            color: isGroup ? '#4CAF50' : 'inherit',
                                        }
                                    }}
                                >
                                    <TableCell>{row.name}</TableCell>
                                    <TableCell align="right">{row.area?.toFixed(2) || '-'}</TableCell>
                                    <TableCell align="right">
                                        {row.share ? `${row.share.toFixed(1)}%` : '-'}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default StructureTable;

