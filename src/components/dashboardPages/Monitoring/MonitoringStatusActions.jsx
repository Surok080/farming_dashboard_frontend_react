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
  MONITORING_STATUS_RAW_COLOR,
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
  "& .MuiButton-startIcon": { color: "#9e9e9e" },
};

/** Текст «как у дизейбла», рамка — цвет кнопки; по hover текст и иконка — в цвет кнопки */
const MUTED_TEXT = "#9e9e9e";

const enabledInteractiveAccentSx = (accent, hoverBg) => ({
  borderColor: accent,
  color: MUTED_TEXT,
  "& .MuiButton-startIcon": {
    color: MUTED_TEXT,
  },
  "&:hover": {
    borderWidth: 1,
    borderColor: accent,
    color: accent,
    backgroundColor: hoverBg,
    "& .MuiButton-startIcon": {
      color: accent,
    },
  },
});

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
    "& .MuiButton-startIcon": {
      color,
    },
  },
});

const mergeStatusButtonSx = (accent, hoverBg, isCurrentStatus, disabled) => {
  if (disabled && isCurrentStatus) {
    return {
      ...outlinedActionSx,
      ...activeDisabledOverrideSx(accent, accent, hoverBg),
    };
  }
  if (disabled && !isCurrentStatus) {
    return {
      ...outlinedActionSx,
      ...grayInactiveSx,
      ...disabledCursorSx,
    };
  }
  return {
    ...outlinedActionSx,
    ...enabledInteractiveAccentSx(accent, hoverBg),
    cursor: "pointer",
  };
};

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
        sx={mergeStatusButtonSx(MONITORING_STATUS_RAW_COLOR, "rgba(255, 152, 0, 0.12)", activeRaw, disabledReturn)}
      >
        Сырой статус
      </Button>
      <Button
        variant="outlined"
        disabled={disabledReject}
        onClick={onReject}
        startIcon={actionLoading && activeAction === "reject" ? <CircularProgress size={16} /> : <CancelOutlinedIcon />}
        sx={mergeStatusButtonSx("#d32f2f", "rgba(211, 47, 47, 0.08)", activeReject, disabledReject)}
      >
        Отклоненный
      </Button>
      <Button
        variant="outlined"
        disabled={disabledConfirm}
        onClick={onConfirm}
        startIcon={actionLoading && activeAction === "confirm" ? <CircularProgress size={16} /> : <CheckCircleOutlineIcon />}
        sx={mergeStatusButtonSx("#62A65D", "rgba(98, 166, 93, 0.12)", activeConfirm, disabledConfirm)}
      >
        Подтвержденный
      </Button>
      <Button
        variant="outlined"
        disabled={disabledPublish}
        onClick={onPublish1C}
        startIcon={actionLoading && activeAction === "publish_1c" ? <CircularProgress size={16} /> : <CheckCircleOutlineIcon />}
        sx={mergeStatusButtonSx("#1565c0", "rgba(21, 101, 192, 0.08)", activePublish, disabledPublish)}
      >
        Опубликовать в 1с
      </Button>
    </Box>
  );
};

export default MonitoringStatusActions;
