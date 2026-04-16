import React from "react";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const outlinedActionSx = {
  textTransform: "uppercase",
  fontWeight: 600,
  borderWidth: 1,
  "&:hover": { borderWidth: 1 },
};

const statusLabelMap = {
  RAW: "Сырой статус",
  CANCELED: "Отклоненный статус",
  CONFIRMED: "Подтвержденный статус",
  READY_FOR_1C: "Опубликованно в 1с",
  SENT: "Опубликованно в 1с",
  SENT_TO_1C: "Опубликованно в 1с",
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

  return (
    <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
      <Button
        variant="outlined"
        disabled={actionLoading || !canReturn}
        onClick={onReturn}
        startIcon={actionLoading && activeAction === "return" ? <CircularProgress size={16} /> : <HelpOutlineOutlinedIcon />}
        sx={{
          ...outlinedActionSx,
          borderColor: "#000000",
          color: "#000000",
          "&:hover": { borderWidth: 1, borderColor: "#000000", backgroundColor: "rgba(0, 0, 0, 0.06)" },
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
          "&:hover": { borderWidth: 1, borderColor: "#d32f2f", backgroundColor: "rgba(211, 47, 47, 0.08)" },
        }}
      >
        Отклоненный
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
        Подтвержденный
      </Button>
      <Button
        variant="outlined"
        disabled={actionLoading || !canPublish1C}
        onClick={onPublish1C}
        startIcon={actionLoading && activeAction === "publish_1c" ? <CircularProgress size={16} /> : <CheckCircleOutlineIcon />}
        sx={{
          ...outlinedActionSx,
          borderColor: "#1565c0",
          color: "#1565c0",
          "&:hover": { borderWidth: 1, borderColor: "#1565c0", backgroundColor: "rgba(21, 101, 192, 0.08)" },
        }}
      >
        Опубликовать в 1с
      </Button>
    </Box>
  );
};

export default MonitoringStatusActions;
