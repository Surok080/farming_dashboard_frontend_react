import React from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Link, Typography } from "@mui/material";

const SUPPORT_EMAIL = "sof-it.tech@yandex.ru";

const MonitoringPublish1CUnavailableDialog = ({ open, onClose }) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle sx={{ pb: 1 }}>Данный функционал недоступен!</DialogTitle>
    <DialogContent>
      <Typography variant="body2" color="text.secondary">
        Для подключения к тарифу на интеграцию с 1С* оставьте заявку на электронную почту{" "}
        <Link href={`mailto:${SUPPORT_EMAIL}`} underline="hover">
          {SUPPORT_EMAIL}
        </Link>
      </Typography>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2 }}>
      <Button onClick={onClose} variant="contained" sx={{ textTransform: "none", backgroundColor: "#62A65D" }}>
        Закрыть
      </Button>
    </DialogActions>
  </Dialog>
);

export default MonitoringPublish1CUnavailableDialog;
