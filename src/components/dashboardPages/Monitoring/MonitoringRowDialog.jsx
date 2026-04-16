import React from "react";
import { Box, Chip, Dialog, DialogTitle, Typography } from "@mui/material";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import ParkOutlinedIcon from "@mui/icons-material/ParkOutlined";
import IconButton from "@mui/material/IconButton";
import MonitoringFieldGeometryPreview from "./MonitoringFieldGeometryPreview";
import MonitoringStatusActions from "./MonitoringStatusActions";
import MonitoringRowDialogContent from "./MonitoringRowDialogContent";
import {
  MONITORING_NON_EDITABLE_SENT_STATUSES,
  MONITORING_STATUS_CANCELED,
  MONITORING_STATUS_CONFIRMED,
  MONITORING_STATUS_LABEL,
  MONITORING_STATUS_RAW,
} from "./monitoringConstants";

const getDialogBorderColor = (status) => {
  if (status === MONITORING_STATUS_RAW) return "#000000";
  if (status === MONITORING_STATUS_CONFIRMED) return "#62A65D";
  if (status === MONITORING_STATUS_CANCELED) return "#d32f2f";
  if (MONITORING_NON_EDITABLE_SENT_STATUSES.includes(status)) return "#1565c0";
  return "#62A65D";
};

const getStatusChipBackground = (borderColor) => {
  if (borderColor === "#000000") return "rgba(0, 0, 0, 0.06)";
  if (borderColor === "#62A65D") return "rgba(98, 166, 93, 0.12)";
  if (borderColor === "#d32f2f") return "rgba(211, 47, 47, 0.08)";
  if (borderColor === "#1565c0") return "rgba(21, 101, 192, 0.08)";
  return "rgba(98, 166, 93, 0.12)";
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
  canPublish1C = true,
  onRowChange,
  onSave,
  saveLoading = false,
  onReturn,
  onReject,
  onConfirm,
  onPublish1C,
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

  const dialogBorderColor = getDialogBorderColor(row?.status);
  const statusChipLabel = row?.status ? MONITORING_STATUS_LABEL[row.status] ?? row.status : null;
  const statusChip = statusChipLabel
    ? {
        label: statusChipLabel,
        borderColor: dialogBorderColor,
        backgroundColor: getStatusChipBackground(dialogBorderColor),
      }
    : null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          border: `1px solid ${dialogBorderColor}`,
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0 }}>
            {row ? (
              <Box
                sx={{
                  width: 200,
                  border: `1px solid ${dialogBorderColor}`,
                  borderRadius: 1,
                  px: 1,
                  py: 0.75,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {row?.field_geometry_json ? (
                  <MonitoringFieldGeometryPreview
                    geometry={row.field_geometry_json}
                    stroke={dialogBorderColor}
                    fill={dialogBorderColor === "#000000" ? "rgba(0, 0, 0, 0.12)" : undefined}
                  />
                ) : (
                  <ParkOutlinedIcon sx={{ color: dialogBorderColor, flexShrink: 0, fontSize: 66 }} />
                )}
                <Typography
                  variant="body2"
                  sx={{ mt: 0.5, fontWeight: 600, width: "100%", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis" }}
                >
                  {row.field_name ?? "—"}
                </Typography>
              </Box>
            ) : null}
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Регистрация обработки, Сезон {year ?? new Date().getFullYear()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Редактирование, отклонения и подтверждения потенциальной обработки
              </Typography>
              <MonitoringStatusActions
                row={row}
                canEditStatus={canEditStatus}
                actionLoading={actionLoading}
                activeAction={activeAction}
                canReturn={canReturn}
                canReject={canReject}
                canConfirm={canConfirm}
                canPublish1C={canPublish1C}
                onReturn={onReturn}
                onReject={onReject}
                onConfirm={onConfirm}
                onPublish1C={onPublish1C}
              />
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
            {statusChip ? (
              <Chip
                size="small"
                label={statusChip.label}
                sx={{
                  fontWeight: 600,
                  border: `1px solid ${statusChip.borderColor}`,
                  color: statusChip.borderColor,
                  backgroundColor: statusChip.backgroundColor,
                  "& .MuiChip-label": { px: 1 },
                }}
              />
            ) : null}
            <IconButton onClick={onClose} size="small" sx={{ color: "#d32f2f" }}>
              <CloseOutlinedIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <MonitoringRowDialogContent
        loading={loading}
        row={row}
        canEditStatus={canEditStatus}
        operations={operations}
        trailers={trailers}
        drivers={drivers}
        onTechOperationChange={handleFieldChange("tech_operation_id")}
        onTrailerChange={handleTrailerChange}
        onDriverChange={handleFieldChange("driver_id")}
        onSave={onSave}
        saveLoading={saveLoading}
        onClose={onClose}
      />
    </Dialog>
  );
};

export default MonitoringRowDialog;
