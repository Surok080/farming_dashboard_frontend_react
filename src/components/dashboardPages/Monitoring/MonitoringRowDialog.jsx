import React from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ParkOutlinedIcon from "@mui/icons-material/ParkOutlined";
import IconButton from "@mui/material/IconButton";
import { formatNumberForDisplay, formatPeriodStartDisplay } from "./monitoringUtils";

const statCardSx = {
  border: "1px solid #d7d7d7",
  borderRadius: "8px",
  minWidth: 130,
  px: 2,
  py: 1,
};

const outlinedActionSx = {
  textTransform: "uppercase",
  fontWeight: 600,
  borderWidth: 2,
  "&:hover": { borderWidth: 2 },
};

const statusLabelMap = {
  RAW: "Сырой статус",
  CANCELED: "Отклоненный статус",
  CONFIRMED: "Подтвержденный статус",
  READY_FOR_1C: "Отправлено в 1С",
  SENT: "Отправлено в 1С",
  SENT_TO_1C: "Отправлено в 1С",
};

const MonitoringRowDialog = ({
  open,
  onClose,
  loading,
  data,
  year,
  actionLoading,
  activeAction,
  canEditStatus = true,
  canConfirm = true,
  canReject = true,
  canReturn = true,
  onRowChange,
  onSave,
  saveLoading = false,
  onReturn,
  onReject,
  onConfirm,
}) => {
  const row = data?.row;
  const drivers = data?.drivers ?? [];
  const operations = data?.tech_operations ?? [];
  const trailers = data?.trailers ?? [];

  const handleFieldChange = (field) => (event) => {
    const value = event?.target?.value ?? "";
    onRowChange?.({ [field]: value });
  };

  const handleTrailerChange = (event) => {
    const selectedId = event?.target?.value ?? "";
    const selectedTrailer = trailers.find((t) => String(t.id) === String(selectedId));
    onRowChange?.({
      trailer_id: selectedId,
      trailer_width: selectedTrailer?.width ?? row?.trailer_width ?? "",
    });
  };

  const areaFmt = row ? formatNumberForDisplay(row.area, 3) : null;
  const trailerWidthFmt = row ? formatNumberForDisplay(row.trailer_width, 3) : null;

  const renderNumericValue = (value) => {
    const f = formatNumberForDisplay(value, 3);
    if (!f.hasTooltip) return f.display;
    return (
      <Tooltip title={f.full} enterDelay={300} arrow placement="top">
        <Box component="span" sx={{ cursor: "help", borderBottom: "1px dotted rgba(0,0,0,0.25)" }}>
          {f.display}
        </Box>
      </Tooltip>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          border: "2px solid #62A65D",
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Регистрация обработки, Сезон {year ?? new Date().getFullYear()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Редактирование, отклонения и подтверждения потенциальной обработки
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: "#d32f2f" }}>
            <CloseOutlinedIcon />
          </IconButton>
        </Box>

        {row ? (
          <Box
            sx={{
              mt: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                border: "2px solid #62A65D",
                borderRadius: 1,
                px: 1.5,
                py: 0.75,
                minWidth: 0,
                flex: "1 1 240px",
              }}
            >
              <ParkOutlinedIcon sx={{ color: "#62A65D", flexShrink: 0 }} />
              <Typography variant="body2" sx={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis" }}>
                {row.field_name ?? "—"}
              </Typography>
            </Box>
            {canEditStatus ? (
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  disabled={actionLoading || !canReturn}
                  onClick={onReturn}
                  startIcon={
                    actionLoading && activeAction === "return" ? <CircularProgress size={16} /> : <HelpOutlineOutlinedIcon />
                  }
                  sx={{
                    ...outlinedActionSx,
                    borderColor: "#62A65D",
                    color: "#62A65D",
                  }}
                >
                  Сырой статус
                </Button>
                <Button
                  variant="outlined"
                  disabled={actionLoading || !canReject}
                  onClick={onReject}
                  startIcon={actionLoading && activeAction === "reject" ? <CircularProgress size={16} /> : <CancelOutlinedIcon />}
                  sx={{
                    ...outlinedActionSx,
                    borderColor: "#d32f2f",
                    color: "#d32f2f",
                  }}
                >
                  Отклоненный статус
                </Button>
                <Button
                  variant="outlined"
                  disabled={actionLoading || !canConfirm}
                  onClick={onConfirm}
                  startIcon={actionLoading && activeAction === "confirm" ? <CircularProgress size={16} /> : <CheckCircleOutlineIcon />}
                  sx={{
                    ...outlinedActionSx,
                    borderColor: "#62A65D",
                    color: "#62A65D",
                  }}
                >
                  Подтвержденный статус
                </Button>
              </Box>
            ) : (
              <Box
                sx={{
                  border: "1px solid #bdbdbd",
                  borderRadius: 1,
                  px: 1.5,
                  py: 0.75,
                  backgroundColor: "#f5f5f5",
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {statusLabelMap[row?.status] ?? "Отправлено в 1С"}
                </Typography>
              </Box>
            )}
          </Box>
        ) : null}
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        {loading ? (
          <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : row ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Box sx={statCardSx}>
                <Typography variant="caption" color="text.secondary">
                  Период
                </Typography>
                <Typography variant="body1">{formatPeriodStartDisplay(row.period_start)}</Typography>
              </Box>
              <Box sx={statCardSx}>
                <Typography variant="caption" color="text.secondary">
                  Расход (л)
                </Typography>
                <Typography variant="body1">{renderNumericValue(row.fuel)}</Typography>
              </Box>
              <Box sx={statCardSx}>
                <Typography variant="caption" color="text.secondary">
                  Моточасы
                </Typography>
                <Typography variant="body1">{renderNumericValue(row.duration_hours)}</Typography>
              </Box>
              <Box sx={{ ...statCardSx, borderWidth: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Выработка, га
                </Typography>
                <Typography variant="body1">{renderNumericValue(row.area_worked)}</Typography>
              </Box>
            </Box>

            <Divider />

            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Работа в агрозоне
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(200px, 1fr))", gap: 2 }}>
              <TextField size="small" label="Геозона, поле" value={row.field_name ?? ""} InputLabelProps={{ shrink: true }} />
              <TextField size="small" label="Культура" value={row.culture_name ?? ""} InputLabelProps={{ shrink: true }} />
              <TextField
                size="small"
                label="Площадь, га"
                value={areaFmt?.display === "—" ? "" : areaFmt?.display ?? ""}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  title: areaFmt?.hasTooltip ? areaFmt.full : undefined,
                }}
              />
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Движение
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(200px, 1fr))", gap: 2 }}>
              <FormControl size="small">
                <InputLabel id="dlg-tech-op-label">Техоперация</InputLabel>
                <Select
                  labelId="dlg-tech-op-label"
                  label="Техоперация"
                  value={row.tech_operation_id ?? ""}
                  onChange={handleFieldChange("tech_operation_id")}
                >
                  {operations.map((o) => (
                    <MenuItem key={o.id} value={o.id}>
                      {o.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small">
                <InputLabel id="dlg-trailer-label">Прицепное устройство</InputLabel>
                <Select
                  labelId="dlg-trailer-label"
                  label="Прицепное устройство"
                  value={row.trailer_id ?? ""}
                  onChange={handleTrailerChange}
                >
                  {trailers.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                size="small"
                label="Ширина, м"
                value={trailerWidthFmt?.display === "—" ? "" : trailerWidthFmt?.display ?? ""}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  title: trailerWidthFmt?.hasTooltip ? trailerWidthFmt.full : undefined,
                }}
              />
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Водитель, тракторист-машинист
            </Typography>
            <Box sx={{ width: 300 }}>
              <FormControl size="small" fullWidth>
                <InputLabel id="dlg-driver-label">Водитель</InputLabel>
                <Select
                  labelId="dlg-driver-label"
                  label="Водитель"
                  value={row.driver_id ?? ""}
                  onChange={handleFieldChange("driver_id")}
                >
                  {drivers.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <Button
                variant="contained"
                onClick={onSave}
                disabled={saveLoading || !canEditStatus}
                startIcon={saveLoading ? <CircularProgress size={16} color="inherit" /> : null}
                sx={{ backgroundColor: "#62A65D" }}
              >
                Сохранить
              </Button>
              <Button variant="outlined" onClick={onClose}>
                Отмена
              </Button>
            </Box>
          </Box>
        ) : (
          <Typography color="text.secondary">Нет данных по выбранной строке.</Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MonitoringRowDialog;
