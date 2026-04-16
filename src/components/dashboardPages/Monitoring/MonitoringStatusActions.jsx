import React from "react";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import {
  MONITORING_NON_EDITABLE_SENT_STATUSES,
  MONITORING_STATUS_CANCELED,
  MONITORING_STATUS_CONFIRMED,
  MONITORING_STATUS_RAW,
} from "./monitoringConstants";

const outlinedActionSx = {
  textTransform: "uppercase",
  fontWeight: 600,
  borderWidth: 1,
  "&:hover": { borderWidth: 1 },
};

const grayInactiveSx = {
  borderColor: "#bdbdbd",
  color: "#9e9e9e",
  "&:hover": {
    borderWidth: 1,
    borderColor: "#bdbdbd",
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
};

const statusLabelMap = {
  RAW: "Сырой статус",
  CANCELED: "Отклоненный статус",
  CONFIRMED: "Подтвержденный статус",
  READY_FOR_1C: "Опубликованно в 1с",
  SENT: "Опубликованно в 1с",
  SENT_TO_1C: "Опубликованно в 1с",
};

const isPublishedLikeStatus = (status) => MONITORING_NON_EDITABLE_SENT_STATUSES.includes(status);

/** MUI по умолчанию ставит pointer-events: none на disabled — курсор не меняется. */
const disabledCursorSx = {
  "&.Mui-disabled": {
    cursor: "not-allowed",
    pointerEvents: "auto",
  },
};

/** Активная кнопка остаётся цветной даже при disabled (текущий статус). */
const activeDisabledOverrideSx = (borderColor, color, bgMuted) => ({
  "&.Mui-disabled": {
    cursor: "not-allowed",
    pointerEvents: "auto",
    opacity: 1,
    borderColor,
    color,
    backgroundColor: bgMuted,
    WebkitTextFillColor: color,
  },
});

const MonitoringStatusActions = ({
  row,
  canEditStatus,
  actionLoading,
  activeAction,
  canReturn,
  canReject,
  canConfirm,
  canPublish1C,
  onReturn,
  onReject,
  onConfirm,
  onPublish1C,
}) => {
  if (!row) return null;

  if (!canEditStatus) {
    return (
      <Box
        sx={{
          mt: 1,
          border: "1px solid #bdbdbd",
          borderRadius: 1,
          px: 1.5,
          py: 0.75,
          backgroundColor: "#f5f5f5",
          width: "fit-content",
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }} p={"3px"} color={"#1565c0"}>
          {statusLabelMap[row?.status] ?? "Отправлено в 1С"}
        </Typography>
      </Box>
    );
  }

  const s = row?.status;
  const activeRaw = s === MONITORING_STATUS_RAW;
  const activeReject = s === MONITORING_STATUS_CANCELED;
  const activeConfirm = s === MONITORING_STATUS_CONFIRMED;
  const activePublish = isPublishedLikeStatus(s);

  const disabledReturn = actionLoading || !canReturn;
  const disabledReject = actionLoading || !canReject;
  const disabledConfirm = actionLoading || !canConfirm;
  const disabledPublish = actionLoading || !canPublish1C;

  return (
    <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
      <Button
        variant="outlined"
        disabled={disabledReturn}
        onClick={onReturn}
        startIcon={actionLoading && activeAction === "return" ? <CircularProgress size={16} /> : <HelpOutlineOutlinedIcon />}
        sx={{
          ...outlinedActionSx,
          ...(activeRaw
            ? {
                borderColor: "#000000",
                color: "#000000",
                "&:hover": { borderWidth: 1, borderColor: "#000000", backgroundColor: "rgba(0, 0, 0, 0.06)" },
              }
            : grayInactiveSx),
          ...(disabledReturn
            ? activeRaw
              ? activeDisabledOverrideSx("#000000", "#000000", "rgba(0, 0, 0, 0.06)")
              : disabledCursorSx
            : { cursor: "pointer" }),
        }}
      >
        Сырой статус
      </Button>
      <Button
        variant="outlined"
        disabled={disabledReject}
        onClick={onReject}
        startIcon={actionLoading && activeAction === "reject" ? <CircularProgress size={16} /> : <CancelOutlinedIcon />}
        sx={{
          ...outlinedActionSx,
          ...(activeReject
            ? {
                borderColor: "#d32f2f",
                color: "#d32f2f",
                "&:hover": { borderWidth: 1, borderColor: "#d32f2f", backgroundColor: "rgba(211, 47, 47, 0.08)" },
              }
            : grayInactiveSx),
          ...(disabledReject
            ? activeReject
              ? activeDisabledOverrideSx("#d32f2f", "#d32f2f", "rgba(211, 47, 47, 0.08)")
              : disabledCursorSx
            : { cursor: "pointer" }),
        }}
      >
        Отклоненный
      </Button>
      <Button
        variant="outlined"
        disabled={disabledConfirm}
        onClick={onConfirm}
        startIcon={actionLoading && activeAction === "confirm" ? <CircularProgress size={16} /> : <CheckCircleOutlineIcon />}
        sx={{
          ...outlinedActionSx,
          ...(activeConfirm
            ? {
                borderColor: "#62A65D",
                color: "#62A65D",
                "&:hover": { borderWidth: 1, borderColor: "#62A65D", backgroundColor: "rgba(98, 166, 93, 0.12)" },
              }
            : grayInactiveSx),
          ...(disabledConfirm
            ? activeConfirm
              ? activeDisabledOverrideSx("#62A65D", "#62A65D", "rgba(98, 166, 93, 0.12)")
              : disabledCursorSx
            : { cursor: "pointer" }),
        }}
      >
        Подтвержденный
      </Button>
      <Button
        variant="outlined"
        disabled={disabledPublish}
        onClick={onPublish1C}
        startIcon={actionLoading && activeAction === "publish_1c" ? <CircularProgress size={16} /> : <CheckCircleOutlineIcon />}
        sx={{
          ...outlinedActionSx,
          ...(activePublish
            ? {
                borderColor: "#1565c0",
                color: "#1565c0",
                "&:hover": { borderWidth: 1, borderColor: "#1565c0", backgroundColor: "rgba(21, 101, 192, 0.08)" },
              }
            : grayInactiveSx),
          ...(disabledPublish
            ? activePublish
              ? activeDisabledOverrideSx("#1565c0", "#1565c0", "rgba(21, 101, 192, 0.08)")
              : disabledCursorSx
            : { cursor: "pointer" }),
        }}
      >
        Опубликовать в 1с
      </Button>
    </Box>
  );
};

export default MonitoringStatusActions;
