import React from "react";
import { Box, Dialog, DialogTitle, Typography } from "@mui/material";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import ParkOutlinedIcon from "@mui/icons-material/ParkOutlined";
import IconButton from "@mui/material/IconButton";
import MonitoringFieldGeometryPreview from "./MonitoringFieldGeometryPreview";
import MonitoringStatusActions from "./MonitoringStatusActions";
import MonitoringRowDialogContent from "./MonitoringRowDialogContent";

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
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0 }}>
            {row ? (
              <Box
                sx={{
                  width: 200,
                  border: "2px solid #62A65D",
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
                  <MonitoringFieldGeometryPreview geometry={row.field_geometry_json} />
                ) : (
                  <ParkOutlinedIcon sx={{ color: "#62A65D", flexShrink: 0, fontSize: 66 }} />
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
          <IconButton onClick={onClose} size="small" sx={{ color: "#d32f2f" }}>
            <CloseOutlinedIcon />
          </IconButton>
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
