import React from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { MONITORING_STATUS_OPTIONS } from "./monitoringConstants";

const statusLabel = (status) => MONITORING_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;

const MonitoringSettingsDialog = ({ open, onClose, status, onApply }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle sx={{ pb: 0 }}>Настройки мониторинга</DialogTitle>
    <DialogContent sx={{ pt: 2 }}>
      <Typography variant="body1" sx={{ fontWeight: 600, mb: 1.5 }}>
        Данный функционал в разработке, скоро ожидается.
      </Typography>
      <Typography variant="body2" sx={{ color: "#666", mb: 2 }}>
        Здесь появятся настройки мониторинга: параметры операций, геозоны, фильтры по технике и другое.
      </Typography>
      <Typography variant="body2" sx={{ color: "#666" }}>
        Текущий статус: <b>{statusLabel(status)}</b>
      </Typography>
    </DialogContent>
    <DialogActions sx={{ p: 2 }}>
      <Button onClick={onClose} variant="outlined" sx={{ textTransform: "none" }}>
        Закрыть
      </Button>
      <Button onClick={onApply} variant="contained" sx={{ textTransform: "none", backgroundColor: "#62A65D", boxShadow: "none" }}>
        Применить
      </Button>
    </DialogActions>
  </Dialog>
);

export default MonitoringSettingsDialog;
