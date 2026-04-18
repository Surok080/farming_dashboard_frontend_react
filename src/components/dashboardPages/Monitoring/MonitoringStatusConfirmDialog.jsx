import React from "react";
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { MONITORING_STATUS_LABEL, MONITORING_STATUS_READY_FOR_1C } from "./monitoringConstants";

const MonitoringStatusConfirmDialog = ({
  open,
  nextStatus,
  onConfirm,
  onCancel,
  loading = false,
  title,
  children,
}) => {
  const label = nextStatus ? MONITORING_STATUS_LABEL[nextStatus] ?? nextStatus : "";
  const isPublishTo1C = nextStatus === MONITORING_STATUS_READY_FOR_1C;
  const dialogTitleId = "monitoring-status-confirm-title";

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth aria-labelledby={dialogTitleId}>
      <DialogTitle id={dialogTitleId}>{title ?? "Подтверждение смены статуса"}</DialogTitle>
      <DialogContent>
        {children ?? (
          <>
            <Typography variant="body2" color="text.secondary">
              Сменить статус на «{label}»?
            </Typography>
            {isPublishTo1C ? (
              <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }} color="error">
                После публикации в 1с вернуть статус обратно будет нельзя.
              </Typography>
            ) : null}
          </>
        )}
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
