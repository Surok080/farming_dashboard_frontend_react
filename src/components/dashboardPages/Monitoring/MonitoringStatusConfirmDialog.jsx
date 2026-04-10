import React from "react";
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { MONITORING_STATUS_LABEL } from "./monitoringConstants";

const MonitoringStatusConfirmDialog = ({ open, nextStatus, onConfirm, onCancel, loading = false }) => {
  const label = nextStatus ? MONITORING_STATUS_LABEL[nextStatus] ?? nextStatus : "";

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth aria-labelledby="monitoring-status-confirm-title">
      <DialogTitle id="monitoring-status-confirm-title">Подтверждение смены статуса</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          Сменить статус на «{label}» ({nextStatus})?
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} disabled={loading}>
          Отмена
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={loading}
          sx={{ backgroundColor: "#62A65D" }}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
        >
          Подтвердить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MonitoringStatusConfirmDialog;
