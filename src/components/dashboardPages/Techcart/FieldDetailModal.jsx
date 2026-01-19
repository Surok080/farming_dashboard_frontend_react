import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { httpService } from "../../../api/setup";

// Функция для вычисления bounding box из SVG path данных
const getPathBounds = (pathData) => {
  if (!pathData) return null;
  
  try {
    // Извлекаем все числа, включая отрицательные и десятичные
    // Регулярное выражение ищет числа в формате: -123.456 или +123.456 или 123.456
    const numbers = pathData.match(/[-+]?(?:\d+\.?\d*|\.\d+)/g);
    if (!numbers || numbers.length < 2) return null;
    
    const coords = numbers.map(Number).filter(n => !isNaN(n));
    if (coords.length < 2) return null;
    
    // Находим минимальные и максимальные значения для X и Y
    let minX = coords[0];
    let maxX = coords[0];
    let minY = coords[1] !== undefined ? coords[1] : coords[0];
    let maxY = coords[1] !== undefined ? coords[1] : coords[0];
    
    // Обрабатываем координаты парами (x, y)
    for (let i = 0; i < coords.length - 1; i += 2) {
      const x = coords[i];
      const y = coords[i + 1];
      if (x !== undefined && !isNaN(x) && y !== undefined && !isNaN(y)) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
    
    // Проверяем, что получились валидные размеры
    if (isNaN(minX) || isNaN(maxX) || isNaN(minY) || isNaN(maxY)) {
      return null;
    }
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  } catch (error) {
    console.error("Ошибка при вычислении границ SVG path:", error);
    return null;
  }
};

const FieldDetailModal = ({ open, onClose, structureId, year }) => {
  const [loading, setLoading] = useState(false);
  const [fieldData, setFieldData] = useState(null);
  const [error, setError] = useState(null);
  const [expandedPassport, setExpandedPassport] = useState(true);
  const [expandedFertilizer, setExpandedFertilizer] = useState(true);
  const [expandedSevooborot, setExpandedSevooborot] = useState(true);
  const [expandedShzr, setExpandedShzr] = useState(true);

  useEffect(() => {
    if (open && structureId && year) {
      const fetchFieldDetail = async () => {
        setLoading(true);
        setError(null);

        try {
          const response = await httpService.get(
            `/plan_fact_v2/detail_field/${structureId}`,
            {
              params: {
                year: year,
              },
            }
          );
          setFieldData(response.data);
        } catch (err) {
          console.error("Ошибка при получении детальной информации о поле:", err);
          setError("Не удалось загрузить информацию о поле");
        } finally {
          setLoading(false);
        }
      };

      fetchFieldDetail();
    } else {
      // Сбрасываем данные при закрытии модального окна
      setFieldData(null);
      setError(null);
    }
  }, [open, structureId, year]);


  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 2,
          borderBottom: "1px solid #e0e0e0",
          backgroundColor: "#fff",
          px: 2.5,
          py: 1.5,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
          ДАННЫЕ ПОЛЯ
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: "#d32f2f",
            padding: 0.5,
            "&:hover": { backgroundColor: "rgba(211, 47, 47, 0.1)" },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ px: 2.5, py: 2, "&.MuiDialogContent-root": { pt: 2 } }}>
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="200px"
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="200px"
          >
            <Typography color="error">{error}</Typography>
          </Box>
        ) : fieldData ? (
          <Box display="flex" flexDirection="column" gap={1.5}>
            {/* Заголовок с информацией о культуре */}
            {fieldData.passport && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  p: 1.5,
                  backgroundColor: "rgba(76, 175, 80, 0.08)",
                  borderRadius: 1,
                  border: "1px solid rgba(76, 175, 80, 0.2)",
                }}
              >
                {fieldData.svg ? (() => {
                  const bounds = getPathBounds(fieldData.svg);
                  
                  if (!bounds) {
                    // Если не удалось вычислить границы, показываем квадратик
                    return (
                      <Box
                        sx={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "2px",
                          backgroundColor: "#4caf50",
                          flexShrink: 0,
                        }}
                      />
                    );
                  }
                  
                  // Вычисляем viewBox с небольшим отступом для лучшей видимости
                  const padding = Math.max(bounds.width, bounds.height) * 0.02;
                  const viewBox = `${bounds.x - padding} ${bounds.y - padding} ${bounds.width + padding * 2} ${bounds.height + padding * 2}`;
                  
                  return (
                    <Box
                      sx={{
                        width: "40px",
                        height: "40px",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        border: "1px solid rgba(76, 175, 80, 0.2)",
                        borderRadius: "4px",
                        backgroundColor: "rgba(76, 175, 80, 0.05)",
                      }}
                    >
                      <svg
                        viewBox={viewBox}
                        preserveAspectRatio="xMidYMid meet"
                        style={{ 
                          width: "100%", 
                          height: "100%",
                          display: "block"
                        }}
                      >
                        <path 
                          d={fieldData.svg} 
                          fill="#4caf50"
                          fillOpacity="0.6"
                        />
                      </svg>
                    </Box>
                  );
                })() : (
                  <Box
                    sx={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "2px",
                      backgroundColor: "#4caf50",
                      flexShrink: 0,
                    }}
                  />
                )}
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500, fontSize: "0.875rem", flexGrow: 1 }}
                >
                  {`${fieldData.passport.culture_name || ""} ${fieldData.passport.sort_name || ""} ${fieldData.passport.field_number || ""}`.trim()}
                </Typography>
              </Box>
            )}

            {/* Две колонки с секциями */}
            <Box display="flex" gap={2} alignItems="flex-start">
              {/* Левая колонка (30%) */}
              <Box sx={{ width: "30%", display: "flex", flexDirection: "column", gap: 1.5 }}>
                {/* Секция "Паспорт поле" */}
                {fieldData.passport && (
                  <Accordion
                    expanded={expandedPassport}
                    onChange={() => setExpandedPassport(!expandedPassport)}
                    sx={{
                      boxShadow: "none",
                      border: "1px solid #e0e0e0",
                      borderRadius: 1,
                      "&:before": { display: "none" },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{
                        px: 2,
                        py: 1,
                        minHeight: 40,
                        "&.Mui-expanded": { minHeight: 40 },
                      }}
                    >
                      <Typography sx={{ fontWeight: 500, fontSize: "0.9rem" }}>
                        Паспорт поле
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 2, pb: 2, pt: 0 }}>
                      <Box display="flex" flexDirection="column" gap={1.5}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" color="text.secondary">
                            Номер поля
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {fieldData.passport.field_number || "-"}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" color="text.secondary">
                            Культура
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {fieldData.passport.culture_name || "-"}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" color="text.secondary">
                            Сорт
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {fieldData.passport.sort_name || "Нет данных"}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" color="text.secondary">
                            Репродукция
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {fieldData.passport.reproduction || "Нет данных"}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" color="text.secondary">
                            Площадь, га
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {fieldData.passport.area ? `${fieldData.passport.area}` : "-"}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" color="text.secondary">
                            Год
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {fieldData.passport.year || "-"}
                          </Typography>
                        </Box>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                )}

                {/* Секция "Севооборот" */}
                <Accordion
                  expanded={expandedSevooborot}
                  onChange={() => setExpandedSevooborot(!expandedSevooborot)}
                  sx={{
                    boxShadow: "none",
                    border: "1px solid #e0e0e0",
                    borderRadius: 1,
                    "&:before": { display: "none" },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      px: 2,
                      py: 1,
                      minHeight: 40,
                      "&.Mui-expanded": { minHeight: 40 },
                    }}
                  >
                    <Typography sx={{ fontWeight: 500, fontSize: "0.9rem" }}>
                      Севооборот
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 2, pb: 2, pt: 0 }}>
                    {fieldData.sevooborot && fieldData.sevooborot.length > 0 ? (
                      <TableContainer
                        component={Paper}
                        sx={{
                          maxHeight: 300,
                          boxShadow: "none",
                          border: "none",
                        }}
                      >
                        <Table size="small" sx={{ "& .MuiTableCell-root": { borderBottom: "1px solid #f0f0f0" } }}>
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600, fontSize: "0.8rem", py: 1 }}>
                                Год
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600, fontSize: "0.8rem", py: 1 }}>
                                Культура
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {fieldData.sevooborot.map((row, index) => (
                              <TableRow
                                key={index}
                                sx={{
                                  "&:hover": {
                                    backgroundColor: "rgba(0, 0, 0, 0.02)",
                                  },
                                }}
                              >
                                <TableCell sx={{ fontSize: "0.8rem", py: 1 }}>
                                  {row.year || "-"}
                                </TableCell>
                                <TableCell sx={{ fontSize: "0.8rem", py: 1 }}>
                                  {row.culture_name || "-"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontStyle: "italic", fontSize: "0.85rem" }}
                      >
                        История севооборота недоступна
                      </Typography>
                    )}
                  </AccordionDetails>
                </Accordion>
              </Box>

              {/* Правая колонка (70%) */}
              <Box sx={{ width: "70%", display: "flex", flexDirection: "column", gap: 1.5 }}>
                {/* Секция "Удобрение" */}
                {fieldData.fertilizers && (
              <Accordion
                expanded={expandedFertilizer}
                onChange={() => setExpandedFertilizer(!expandedFertilizer)}
                sx={{
                  boxShadow: "none",
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    px: 2,
                    py: 1,
                    minHeight: 40,
                    "&.Mui-expanded": { minHeight: 40 },
                  }}
                >
                  <Typography sx={{ fontWeight: 500, fontSize: "0.9rem" }}>
                    Удобрение
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 2, pb: 2, pt: 0 }}>
                  <Box display="flex" flexDirection="column" gap={1.5}>
                    {fieldData.fertilizers.items && fieldData.fertilizers.items.length > 0 ? (
                      <>
                        <TableContainer component={Paper} sx={{ boxShadow: "none", border: "1px solid #e0e0e0" }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600, fontSize: "0.8rem" }}>
                                  Наименование
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, fontSize: "0.8rem" }}>
                                  Содержание д.в., %
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, fontSize: "0.8rem" }}>
                                  Кол-во, кг
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, fontSize: "0.8rem" }}>
                                  Внесено (физ.вес)
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {fieldData.fertilizers.items.map((item, index) => (
                                <TableRow key={index}>
                                  <TableCell sx={{ fontSize: "0.8rem" }}>
                                    {item.name}
                                  </TableCell>
                                  <TableCell align="center" sx={{ fontSize: "0.8rem" }}>
                                    {item.dv_percent || "-"}
                                  </TableCell>
                                  <TableCell align="center" sx={{ fontSize: "0.8rem" }}>
                                    {item.quantity ? item.quantity.toLocaleString() : "-"}
                                  </TableCell>
                                  <TableCell align="center" sx={{ fontSize: "0.8rem" }}>
                                    {item.dv_total ? item.dv_total.toFixed(1) : "-"}
                                  </TableCell>
                                </TableRow>
                              ))}
                              <TableRow sx={{ backgroundColor: "#f5f5f5", fontWeight: 600 }}>
                                <TableCell sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                                  Итого
                                </TableCell>
                                <TableCell align="center" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                                  -
                                </TableCell>
                                <TableCell align="center" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                                  -
                                </TableCell>
                                <TableCell align="center" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                                  {fieldData.fertilizers.total_dv ? fieldData.fertilizers.total_dv.toFixed(1) : "-"}
                                </TableCell>
                              </TableRow>
                              <TableRow sx={{ backgroundColor: "#f5f5f5", fontWeight: 600 }}>
                                <TableCell colSpan={3} sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                                  Пересчет на 1 га кг д.в.
                                </TableCell>
                                <TableCell align="center" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                                  {fieldData.fertilizers.total_dv_per_ha ? fieldData.fertilizers.total_dv_per_ha.toFixed(1) : "-"}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", fontSize: "0.85rem" }}>
                        Данные об удобрениях недоступны
                      </Typography>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}

                {/* Секция "Средства защиты растений (СХЗР)" */}
                {fieldData.shzr && (
                  <Accordion
                    expanded={expandedShzr}
                    onChange={() => setExpandedShzr(!expandedShzr)}
                    sx={{
                      boxShadow: "none",
                      border: "1px solid #e0e0e0",
                      borderRadius: 1,
                      "&:before": { display: "none" },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{
                        px: 2,
                        py: 1,
                        minHeight: 40,
                        "&.Mui-expanded": { minHeight: 40 },
                      }}
                    >
                      <Typography sx={{ fontWeight: 500, fontSize: "0.9rem" }}>
                        Средства защиты растений (СХЗР)
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 2, pb: 2, pt: 0 }}>
                      {fieldData.shzr.items && fieldData.shzr.items.length > 0 ? (
                        <TableContainer component={Paper} sx={{ boxShadow: "none", border: "1px solid #e0e0e0" }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600, fontSize: "0.8rem" }}>
                                  Наименование
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, fontSize: "0.8rem" }}>
                                  Ед.изм
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, fontSize: "0.8rem" }}>
                                  Внесено (физ.вес)
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {fieldData.shzr.items.map((item, index) => (
                                <TableRow key={index}>
                                  <TableCell sx={{ fontSize: "0.8rem" }}>
                                    {item.name}
                                  </TableCell>
                                  <TableCell align="center" sx={{ fontSize: "0.8rem" }}>
                                    {item.unit || "-"}
                                  </TableCell>
                                  <TableCell align="center" sx={{ fontSize: "0.8rem" }}>
                                    {item.quantity ? item.quantity.toFixed(1) : "-"}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", fontSize: "0.85rem" }}>
                          Данные о средствах защиты растений недоступны
                        </Typography>
                      )}
                    </AccordionDetails>
                  </Accordion>
                )}
              </Box>
            </Box>
          </Box>
        ) : (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="200px"
          >
            <Typography color="text.secondary">Нет данных для отображения</Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FieldDetailModal;

