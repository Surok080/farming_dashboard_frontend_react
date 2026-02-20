import React, { useState } from "react";
import {
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const FieldInfoModal = ({ open, onClose, field, year, rotationHistory = [] }) => {
  const [expandedPassport, setExpandedPassport] = useState(true);
  const [expandedRotation, setExpandedRotation] = useState(true);

  // Проверка после всех хуков
  if (!field || !field.properties) return null;

  const properties = field.properties;
  
  // Используем rotationHistory из prop, затем rotation_history, затем sevooborot из ответа API
  const actualRotationHistory =
    (rotationHistory && rotationHistory.length > 0)
      ? rotationHistory
      : (properties.rotation_history && properties.rotation_history.length > 0)
        ? properties.rotation_history
        : (Array.isArray(properties.sevooborot) ? properties.sevooborot : []);
  
  // Формируем строку для отображения поля (как в списке)
  const fieldDisplayName = `${properties.crop_name || properties.crop || ""} ${
    properties.cultivar || properties.crop_kind || ""
  } ${properties.name || properties.id || ""}`.trim();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 1,
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          position: "absolute",
          right: -12,
          top: 35,
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
          Общая информация
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
        <Box display="flex" flexDirection="column" gap={1.5}>
          {/* Выделенное поле вверху */}
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
            <Box
              sx={{
                width: "12px",
                height: "12px",
                borderRadius: "2px",
                backgroundColor: properties.color || "#4caf50",
                flexShrink: 0,
              }}
            />
            <Typography
              variant="body2"
              sx={{ fontWeight: 500, fontSize: "0.875rem", flexGrow: 1 }}
            >
              {fieldDisplayName}
            </Typography>
          </Box>

          {properties.has_geometry === false && (
            <Alert severity="info" sx={{ mt: 0 }}>
              Отсутствуют координаты поля — на карте оно не отображается.
            </Alert>
          )}

          {/* Секция "Паспорт поле" */}
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
                    {properties.name || properties.id || "-"}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Культура
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {properties.crop_name || properties.crop || "-"}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Сорт
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {properties.cultivar || properties.crop_kind || "Нет данных"}
                  </Typography>
                </Box>
                {properties.reproduction && (
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Репродукция
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {properties.reproduction}
                    </Typography>
                  </Box>
                )}
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Площадь, га
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {properties.area ? `${properties.area} га` : "-"}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Год
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {year || "-"}
                  </Typography>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Секция "Севооборот" */}
          <Accordion
            expanded={expandedRotation}
            onChange={() => setExpandedRotation(!expandedRotation)}
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
            <AccordionDetails sx={{ px: 0, pb: 2, pt: 0 }}>
              {actualRotationHistory && actualRotationHistory.length > 0 ? (
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
                      {actualRotationHistory.map((row, index) => {
                        const isCurrentYear = row.year === year;
                        const cropDisplay = `${row.crop_name || row.crop || row.culture_name || "Нет данных"} ${
                          row.cultivar || row.crop_kind || ""
                        } ${row.field_number || row.field_id || row.name || ""}`.trim();

                        return (
                          <TableRow
                            key={index}
                            sx={{
                              backgroundColor: isCurrentYear
                                ? "rgba(76, 175, 80, 0.08)"
                                : "inherit",
                              "&:hover": {
                                backgroundColor: isCurrentYear
                                  ? "rgba(76, 175, 80, 0.12)"
                                  : "rgba(0, 0, 0, 0.02)",
                              },
                            }}
                          >
                            <TableCell sx={{ fontSize: "0.8rem", py: 1 }}>
                              {row.year || "-"}
                            </TableCell>
                            <TableCell sx={{ fontSize: "0.8rem", py: 1 }}>
                              {cropDisplay}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ px: 2, fontStyle: "italic", fontSize: "0.85rem" }}
                >
                  История севооборота недоступна
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default FieldInfoModal;

