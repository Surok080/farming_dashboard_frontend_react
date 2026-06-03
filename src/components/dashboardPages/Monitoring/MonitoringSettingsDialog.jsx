import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Switch,
  Typography,
} from "@mui/material";
import CloudDownloadOutlinedIcon from "@mui/icons-material/CloudDownloadOutlined";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import {
  getApiErrorMessage,
  getMonitoringAutoDownloadStatus,
  postMonitoringDownloadYesterday,
  toggleMonitoringAutoDownload,
} from "../../../api/monitoring";

const yesterdayLabel = () => dayjs().subtract(1, "day").format("DD.MM.YYYY");

const MonitoringSettingsDialog = ({ open, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();

  const [autoEnabled, setAutoEnabled] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const loadAutoStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const { data } = await getMonitoringAutoDownloadStatus();
      setAutoEnabled(Boolean(data?.enabled));
    } catch (error) {
      enqueueSnackbar(getApiErrorMessage(error, "Не удалось загрузить статус автоскачивания"), {
        variant: "error",
      });
    } finally {
      setStatusLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    if (open) {
      loadAutoStatus();
    }
  }, [open, loadAutoStatus]);

  const handleDownloadYesterday = async () => {
    setDownloadLoading(true);
    try {
      const { data } = await postMonitoringDownloadYesterday();
      enqueueSnackbar(
        data?.message || `Скачивание данных за ${yesterdayLabel()} запущено`,
        { variant: "success", autoHideDuration: 5000 },
      );
    } catch (error) {
      enqueueSnackbar(getApiErrorMessage(error, "Не удалось запустить скачивание"), {
        variant: "error",
      });
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleToggleAuto = async () => {
    setToggleLoading(true);
    try {
      const { data } = await toggleMonitoringAutoDownload();
      setAutoEnabled(Boolean(data?.enabled));
      enqueueSnackbar(
        data?.message || (data?.enabled ? "Автоскачивание включено" : "Автоскачивание выключено"),
        { variant: "success" },
      );
    } catch (error) {
      enqueueSnackbar(getApiErrorMessage(error, "Не удалось изменить автоскачивание"), {
        variant: "error",
      });
    } finally {
      setToggleLoading(false);
    }
  };

  const busy = statusLoading || toggleLoading || downloadLoading;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 0, textAlign: "left" }}>Настройки мониторинга</DialogTitle>
      <DialogContent sx={{ pt: 2, textAlign: "left" }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Загрузка данных из SMSR (ФортМонитор) за предыдущий календарный день.
        </Typography>

        <Box sx={{ mb: 2.5 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Ручное скачивание
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Запускает импорт за <b>{yesterdayLabel()}</b>. Ответ приходит сразу, загрузка идёт в фоне
            несколько минут — затем обновите таблицу кнопкой «Выполнить» или обновите страницу.
          </Typography>
          <Button
            variant="contained"
            onClick={handleDownloadYesterday}
            disabled={busy}
            startIcon={
              downloadLoading ? <CircularProgress size={18} color="inherit" /> : <CloudDownloadOutlinedIcon />
            }
            sx={{
              textTransform: "none",
              backgroundColor: "#62A65D",
              boxShadow: "none",
              "&:hover": { backgroundColor: "#4f8f4b", boxShadow: "none" },
            }}
          >
            {downloadLoading ? "Запуск…" : `Скачать за ${yesterdayLabel()}`}
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Автоскачивание
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Каждое утро (04:00–06:59 по Москве) автоматически скачиваются данные за предыдущий день.
          </Typography>

          {statusLoading ? (
            <Box display="flex" alignItems="center" gap={1}>
              <CircularProgress size={20} sx={{ color: "#62A65D" }} />
              <Typography variant="body2" color="text.secondary">
                Загрузка статуса…
              </Typography>
            </Box>
          ) : (
            <FormControlLabel
              sx={{ ml: 0, alignItems: "flex-start" }}
              control={
                <Switch
                  checked={autoEnabled}
                  onChange={handleToggleAuto}
                  disabled={toggleLoading || downloadLoading}
                  color="success"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {autoEnabled ? "Включено" : "Выключено"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Переключатель создаёт задачу при первом включении
                  </Typography>
                </Box>
              }
            />
          )}

          <Alert severity="info" sx={{ mt: 2, textAlign: "left" }}>
            Для скачивания нужна настроенная интеграция SMSR в разделе «Внешние сервисы».
          </Alert>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ textTransform: "none" }} disabled={busy}>
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MonitoringSettingsDialog;
