import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Collapse,
  IconButton
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import { httpService } from "../../../api/setup";

const LeftBlockPlanFactV2 = ({ year, onDataReceived, onSelectionChange }) => {
  const [techcardValue, setTechcardValue] = useState("");
  const [checked, setChecked] = useState([]);
  const [checkedFields, setCheckedFields] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [cropsData, setCropsData] = useState([]);
  const [planTypes, setPlanTypes] = useState([]);

  // Функция для получения типов планов с сервера
  const fetchPlanTypes = async () => {
    try {
      const response = await httpService.get('/plan_fact_v2/plan-types');
      setPlanTypes(response.data || []);
      
      // Устанавливаем первый тип плана как значение по умолчанию, если есть данные
      if (response.data && response.data.length > 0) {
        setTechcardValue(response.data[0].key);
      }
      
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении типов планов:', error);
      setPlanTypes([]);
      return null;
    }
  };

  // Функция для получения данных культур с сервера
  const fetchCulturesData = async () => {
    try {
      const response = await httpService.get('/plan_fact_v2/cultures/tree', {
        params: {
          year: year,
          plan_type: techcardValue
        }
      });
      setCropsData(response.data || []);
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении данных культур:', error);
      setCropsData([]);
      return null;
    }
  };

  // Функция для получения данных по выбранным культурам
  const fetchDashboardData = async () => {
    try {
      // Собираем ID выбранных культур и структур
      const cultureIds = [];
      const structureIds = [];

      // Добавляем выбранные культуры
      checked.forEach(cropId => {
        const crop = cropsData.find(c => c.id === cropId);
        if (crop) {
          cultureIds.push(crop.id);
        }
      });

      // Добавляем выбранные структуры (поля)
      checkedFields.forEach(fieldId => {
        structureIds.push(fieldId);
      });

      // Если ничего не выбрано или выбрано все, отправляем запрос со всеми культурами
      const allCultureIds = cropsData.map(crop => crop.id);
      const allStructureIds = cropsData.flatMap(crop => crop.children ? crop.children.map(child => child.id) : []);
      
      const isAllSelected = cultureIds.length === allCultureIds.length && structureIds.length === allStructureIds.length;
      const isNothingSelected = cultureIds.length === 0 && structureIds.length === 0;

      const requestBody = {
        year: year,
        plan_type: techcardValue,
        culture_ids: (isNothingSelected || isAllSelected) ? allCultureIds : cultureIds,
        structure_ids: (isNothingSelected || isAllSelected) ? allStructureIds : structureIds
      };

      const response = await httpService.post('/plan_fact_v2/dashboard', requestBody);
      
      // Передаем данные в родительский компонент
      if (onDataReceived) {
        onDataReceived(response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении данных dashboard:', error);
      return null;
    }
  };

  // Загрузка типов планов при монтировании компонента
  useEffect(() => {
    const loadPlanTypes = async () => {
      if (planTypes.length === 0) {
        const planTypesData = await fetchPlanTypes();
        if (planTypesData && planTypesData.length > 0) {
          // Ищем "Итоги сева" (results_seva) в списке типов планов
          const resultsSeva = planTypesData.find(type => type.key === "results_seva");
          if (resultsSeva) {
            // Если "Итоги сева" есть, выбираем его
            setTechcardValue("results_seva");
          } else {
            // Если нет, выбираем первый доступный тип
            setTechcardValue(planTypesData[0].key);
          }
        }
      }
    };
    
    loadPlanTypes();
  }, []);

  // Загрузка данных культур при изменении года или типа плана
  useEffect(() => {
    const loadCulturesData = async () => {
      // Загружаем данные культур только если есть валидные значения
      if (year && techcardValue && techcardValue.trim() !== "" && planTypes.length > 0) {
        // Очищаем старые данные культур перед загрузкой новых, чтобы предотвратить запросы со старыми данными
        setCropsData([]);
        await fetchCulturesData();
      }
    };
    
    loadCulturesData();
  }, [year, techcardValue]);

  // Автоматическое получение данных при изменении выбранных культур или полей
  // Важно: не включаем techcardValue в зависимости, так как он уже учтен через cropsData
  // Это предотвращает отправку запроса со старыми данными при смене techcardValue
  useEffect(() => {
    const loadDashboardData = async () => {
      // Загружаем данные только если есть валидные значения
      // cropsData уже содержит данные для текущего techcardValue после загрузки
      if (year && techcardValue && techcardValue.trim() !== "" && cropsData.length > 0) {
        await fetchDashboardData();
        
        // Уведомляем родительский компонент об изменении выбора
        if (onSelectionChange) {
          const cultureIds = [];
          const structureIds = [];

          // Добавляем выбранные культуры
          checked.forEach(cropId => {
            const crop = cropsData.find(c => c.id === cropId);
            if (crop) {
              cultureIds.push(crop.id);
            }
          });

          // Добавляем выбранные структуры (поля)
          checkedFields.forEach(fieldId => {
            structureIds.push(fieldId);
          });

          onSelectionChange(cultureIds, structureIds, techcardValue);
        }
      }
    };
    
    loadDashboardData();
  }, [checked, checkedFields, year, cropsData]);


  const handleCheckboxChange = (cropId) => {
    const crop = cropsData.find(c => c.id === cropId);
    const currentState = getMainCheckboxState(cropId);
    
    if (crop && crop.children && crop.children.length > 0) {
      // Если у культуры есть подполя, управляем ими
      if (currentState === true) {
        // Снимаем выбор со всех подполей
        const cropFieldIds = crop.children.map(field => field.id);
        setCheckedFields(prev => prev.filter(id => !cropFieldIds.includes(id)));
        setChecked(prev => prev.filter(id => id !== cropId));
      } else {
        // Выбираем все подполя
        const cropFieldIds = crop.children.map(field => field.id);
        setCheckedFields(prev => [...new Set([...prev, ...cropFieldIds])]);
        setChecked(prev => prev.includes(cropId) ? prev : [...prev, cropId]);
      }
    } else {
      // Обычная логика для культур без подполей
      setChecked(prev => 
        prev.includes(cropId) 
          ? prev.filter(id => id !== cropId)
          : [...prev, cropId]
      );
    }
  };

  const handleFieldCheckboxChange = (fieldId, cropId) => {
    const newCheckedFields = checkedFields.includes(fieldId) 
      ? checkedFields.filter(id => id !== fieldId)
      : [...checkedFields, fieldId];
    
    setCheckedFields(newCheckedFields);
    
    // Обновляем состояние основной культуры
    updateMainCropState(cropId, newCheckedFields);
  };

  // Функция для обновления состояния основной культуры
  const updateMainCropState = (cropId, newCheckedFields) => {
    const crop = cropsData.find(c => c.id === cropId);
    if (!crop || !crop.children || crop.children.length === 0) return;
    
    const cropFieldIds = crop.children.map(field => field.id);
    const selectedFieldsForCrop = newCheckedFields.filter(id => cropFieldIds.includes(id));
    
    if (selectedFieldsForCrop.length === 0) {
      // Ни одно подполе не выбрано - убираем основную культуру
      setChecked(prev => prev.filter(id => id !== cropId));
    } else if (selectedFieldsForCrop.length === cropFieldIds.length) {
      // Все подполя выбраны - добавляем основную культуру
      setChecked(prev => prev.includes(cropId) ? prev : [...prev, cropId]);
    }
    // Если выбраны не все подполя, основная культура остается в текущем состоянии
  };

  // Функция для определения состояния чекбокса основной культуры
  const getMainCheckboxState = (cropId) => {
    const crop = cropsData.find(c => c.id === cropId);
    if (!crop || !crop.children || crop.children.length === 0) {
      // Если нет подполей, используем обычную логику
      return checked.includes(cropId);
    }
    
    const cropFieldIds = crop.children.map(field => field.id);
    const selectedFieldsForCrop = checkedFields.filter(id => cropFieldIds.includes(id));
    
    if (selectedFieldsForCrop.length === 0) {
      return false; // Ни одно подполе не выбрано
    } else if (selectedFieldsForCrop.length === cropFieldIds.length) {
      return true; // Все подполя выбраны
    } else {
      return 'indeterminate'; // Частично выбраны
    }
  };

  const handleExpandRow = (cropId) => {
    setExpandedRows(prev => ({
      ...prev,
      [cropId]: !prev[cropId]
    }));
  };

  const totalFields = cropsData.reduce((sum, crop) => sum + (crop.total_count || 0), 0);
  const totalArea = cropsData.reduce((sum, crop) => sum + (crop.total_area || 0), 0);

  // Функция для определения состояния кнопки "Выбрать все" / "Снять выбор"
  const getSelectAllButtonState = () => {
    const allCultureIds = cropsData.map(crop => crop.id);
    const allStructureIds = cropsData.flatMap(crop => crop.children ? crop.children.map(child => child.id) : []);
    
    const isAllSelected = checked.length === allCultureIds.length && checkedFields.length === allStructureIds.length;
    const isNothingSelected = checked.length === 0 && checkedFields.length === 0;
    
    if (isAllSelected) {
      return { text: "Снять выбор", action: "deselect" };
    } else if (isNothingSelected) {
      return { text: "Выбрать все", action: "select" };
    } else {
      return { text: "Выбрать все", action: "select" };
    }
  };

  // Обработчик клика по кнопке "Выбрать все" / "Снять выбор"
  const handleSelectAllToggle = () => {
    const buttonState = getSelectAllButtonState();
    
    if (buttonState.action === "select") {
      // Выбираем все культуры и поля
      const allCultureIds = cropsData.map(crop => crop.id);
      const allStructureIds = cropsData.flatMap(crop => crop.children ? crop.children.map(child => child.id) : []);
      
      setChecked(allCultureIds);
      setCheckedFields(allStructureIds);
    } else {
      // Снимаем выбор со всех культур и полей
      setChecked([]);
      setCheckedFields([]);
    }
  };

  return (
    <Box display={"flex"} flexDirection={"column"} gap={2} height={"100%"} maxHeight={"100%"}>
      {/* Фильтры */}
      <Box display={"flex"} alignItems={"center"} gap={2}>
        <FormControl size="small" fullWidth sx={{ minWidth: 150 }}>
          <InputLabel id="select-techcard">Техкарта:</InputLabel>
          <Select
            labelId="select-techcard"
            id="select-techcard"
            label="Техкарта:"
            value={techcardValue}
            onChange={(e) => {
              setTechcardValue(e.target.value);
              // Сбрасываем выбор при смене типа плана
              setChecked([]);
              setCheckedFields([]);
            }}
          >
            {planTypes.map((planType) => (
              <MenuItem key={planType.key} value={planType.key}>
                {planType.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="outlined"
          size="medium"
          onClick={handleSelectAllToggle}
          disabled={cropsData.length === 0}
          sx={{ minWidth: 160, padding: '7px'}}
        >
          {getSelectAllButtonState().text}
        </Button>
      </Box>

      {/* Список культур */}
      <Box
        sx={{
          background: "#F9F9F9",
          border: "1px solid #bfbfbf",
          borderRadius: "4px",
          height: "100%",
          overflowY: "auto",
          padding: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell 
                  align="center" 
                  sx={{ 
                    fontWeight: "bold", 
                    fontSize: "11px", 
                    width: "60%", 
                    padding: "4px 4px",
                    borderRight: "1px solid #d0d0d0"
                  }}
                >
                  Культура
                </TableCell>
                <TableCell 
                  align="center" 
                  sx={{ 
                    fontWeight: "bold", 
                    fontSize: "11px", 
                    textAlign: "center", 
                    width: "15%", 
                    padding: "4px 4px",
                    borderRight: "1px solid #d0d0d0"
                  }}
                >
                  Кол-во полей
                </TableCell>
                <TableCell 
                  align="center" 
                  sx={{ 
                    fontWeight: "bold", 
                    fontSize: "11px", 
                    textAlign: "center", 
                    width: "25%", 
                    padding: "4px 4px"
                  }}
                >
                  Общая площадь, га
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cropsData.map((crop) => (
                <React.Fragment key={crop.id}>
                  <TableRow>
                    <TableCell sx={{ padding: "10px 5px", width: "60%" }}>
                      <Box display="flex" alignItems="center" gap={0}>
                        {crop.children && crop.children.length > 0 && (
                          <IconButton
                            size={"small"}
                            onClick={() => handleExpandRow(crop.id)}
                            sx={{ padding: "0px", minWidth: "20px", width: "20px", height: "20px" }}
                          >
                            {expandedRows[crop.id] ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                          </IconButton>
                        )}
                        <Checkbox
                          size="small"
                          checked={getMainCheckboxState(crop.id) === true}
                          indeterminate={getMainCheckboxState(crop.id) === 'indeterminate'}
                          onChange={() => handleCheckboxChange(crop.id)}
                          sx={{ padding: "2px", marginRight: "4px" }}
                        />
                        <Typography variant="caption" sx={{ fontWeight: "bold", fontSize: "11px" }}>
                          {crop.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ padding: "10px 5px", textAlign: "center", width: "15%" }}>
                      <Typography variant="caption" sx={{ fontWeight: "bold", fontSize: "11px" }}>
                        {crop.total_count || 0}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ padding: "10px 5px", textAlign: "center", width: "25%" }}>
                      <Typography variant="caption" sx={{ fontWeight: "bold", fontSize: "11px" }}>
                        {crop.total_area || 0}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  
                  {/* Подполя */}
                  {crop.children && crop.children.length > 0 && (
                    <TableRow>
                      <TableCell colSpan={3} sx={{ padding: 0 }}>
                        <Collapse in={expandedRows[crop.id]} timeout="auto" unmountOnExit>
                          <Box sx={{ paddingLeft: 2, backgroundColor: "#fafafa" }}>
                            {crop.children.map((field, index) => (
                              <Box key={field.id} sx={{ padding: "4px 8px", borderBottom: "1px solid #e0e0e0", display: "flex", alignItems: "center", gap: 1 }}>
                                <Checkbox
                                  size="small"
                                  checked={checkedFields.includes(field.id)}
                                  onChange={() => handleFieldCheckboxChange(field.id, crop.id)}
                                />
                                <Typography variant="caption">
                                  {field.name}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
               {/* Строка с итогами */}
               <TableRow sx={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #d0d0d0" }}>
                <TableCell sx={{ 
                  padding: "8px 5px", 
                  width: "60%",
                  fontWeight: "bold",
                  fontSize: "12px",
                  color: "#333"
                }}>
                  <Typography variant="body2" sx={{ fontWeight: "bold", fontSize: "12px" }}>
                    ИТОГО:
                  </Typography>
                </TableCell>
                <TableCell sx={{ 
                  padding: "8px 5px", 
                  textAlign: "center", 
                  width: "15%",
                  fontWeight: "bold",
                  fontSize: "12px",
                  color: "#333"
                }}>
                  <Typography variant="body2" sx={{ fontWeight: "bold", fontSize: "12px" }}>
                    {totalFields}
                  </Typography>
                </TableCell>
                <TableCell sx={{ 
                  padding: "8px 5px", 
                  textAlign: "center", 
                  width: "25%",
                  fontWeight: "bold",
                  fontSize: "12px",
                  color: "#333"
                }}>
                  <Typography variant="body2" sx={{ fontWeight: "bold", fontSize: "12px" }}>
                    {totalArea.toFixed(1)}
                  </Typography>
                </TableCell>
              </TableRow>
              
            </TableBody>
          </Table>
                </TableContainer>
      </Box>
    </Box>
  );
};

export default LeftBlockPlanFactV2;
