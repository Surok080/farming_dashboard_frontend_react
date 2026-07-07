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
  InputAdornment,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import CloudDownloadOutlinedIcon from "@mui/icons-material/CloudDownloadOutlined";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import {
  getApiErrorMessage,
  getAutoReportSettings,
  postAutoReportSettings,
} from "../../../api/notifications";
import { getApiErrorMessage as getMonitoringApiErrorMessage, postMonitoringDownloadYesterday } from "../../../api/monitoring";
import { formatSecondsAsTime, parseTimeToSeconds } from "./monitoringUtils";

const yesterdayLabel = () => dayjs().subtract(1, "day").format("DD.MM.YYYY");

const DEFAULT_AUTO_REPORT_SETTINGS = {
  enabled: false,
  min_agro_zone_percent: 0,
  min_visit_interval_seconds: 0,
  min_speed_kmh: 0,
  max_speed_kmh: 0,
};

const toNonNegativeInt = (value) => {
  const n = Number.parseInt(String(value), 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

const MonitoringSettingsDialog = ({ open, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();

  const [downloadLoading, setDownloadLoading] = useState(false);
  const [autoReportLoading, setAutoReportLoading] = useState(false);
  const [autoReportSaving, setAutoReportSaving] = useState(false);
  const [autoReportSettings, setAutoReportSettings] = useState(DEFAULT_AUTO_REPORT_SETTINGS);
  const [visitIntervalInput, setVisitIntervalInput] = useState("00:00:00");

  const loadAutoReportSettings = useCallback(async () => {
    setAutoReportLoading(true);
    try {
      const { data } = await getAutoReportSettings();
      const next = {
        enabled: Boolean(data?.enabled),
        min_agro_zone_percent: toNonNegativeInt(data?.min_agro_zone_percent),
        min_visit_interval_seconds: toNonNegativeInt(data?.min_visit_interval_seconds),
        min_speed_kmh: toNonNegativeInt(data?.min_speed_kmh),
        max_speed_kmh: toNonNegativeInt(data?.max_speed_kmh),
      };
      setAutoReportSettings(next);
      setVisitIntervalInput(formatSecondsAsTime(next.min_visit_interval_seconds));
    } catch (error) {
      enqueueSnackbar(getApiErrorMessage(error, "Не удалось загрузить настройки автоматизированного отчёта"), {
        variant: "error",
      });
    } finally {
      setAutoReportLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    if (open) {
      loadAutoReportSettings();
    }
  }, [open, loadAutoReportSettings]);

  const saveAutoReportSettings = useCallback(
    async (nextSettings, { successMessage = "Настройки сохранены" } = {}) => {
      setAutoReportSaving(true);
      try {
        const payload = {
          enabled: Boolean(nextSettings.enabled),
          min_agro_zone_percent: toNonNegativeInt(nextSettings.min_agro_zone_percent),
          min_visit_interval_seconds: toNonNegativeInt(nextSettings.min_visit_interval_seconds),
          min_speed_kmh: toNonNegativeInt(nextSettings.min_speed_kmh),
          max_speed_kmh: toNonNegativeInt(nextSettings.max_speed_kmh),
        };
        await postAutoReportSettings(payload);
        setAutoReportSettings(payload);
        enqueueSnackbar(successMessage, { variant: "success" });
        return true;
      } catch (error) {
        enqueueSnackbar(getApiErrorMessage(error, "Не удалось сохранить настройки"), {
          variant: "error",
        });
        return false;
      } finally {
        setAutoReportSaving(false);
      }
    },
    [enqueueSnackbar],
  );

  const handleDownloadYesterday = async () => {
    setDownloadLoading(true);
    try {
      const { data } = await postMonitoringDownloadYesterday();
      enqueueSnackbar(
        data?.message || `Скачивание данных за ${yesterdayLabel()} запущено`,
        { variant: "success", autoHideDuration: 5000 },
      );
    } catch (error) {
      enqueueSnackbar(getMonitoringApiErrorMessage(error, "Не удалось запустить скачивание"), {
        variant: "error",
      });
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleToggleAutoReport = async (event) => {
    const enabled = event.target.checked;
    const prev = autoReportSettings;
    const next = { ...prev, enabled };
    setAutoReportSettings(next);
    const ok = await saveAutoReportSettings(next, {
      successMessage: enabled ? "Автоматизированный отчёт включён" : "Автоматизированный отчёт выключен",
    });
    if (!ok) {
      setAutoReportSettings(prev);
    }
  };

  const handleNumericFieldBlur = (field) => async (event) => {
    const value = toNonNegativeInt(event.target.value);
    if (value === autoReportSettings[field]) return;
    const prev = autoReportSettings;
    const next = { ...prev, [field]: value };
    setAutoReportSettings(next);
    const ok = await saveAutoReportSettings(next);
    if (!ok) {
      setAutoReportSettings(prev);
    }
  };

  const handleVisitIntervalBlur = async () => {
    const seconds = parseTimeToSeconds(visitIntervalInput);
    if (seconds === null) {
      enqueueSnackbar("Укажите время в формате ЧЧ:ММ:СС", { variant: "warning" });
      setVisitIntervalInput(formatSecondsAsTime(autoReportSettings.min_visit_interval_seconds));
      return;
    }
    if (seconds === autoReportSettings.min_visit_interval_seconds) return;
    const prev = autoReportSettings;
    const next = { ...prev, min_visit_interval_seconds: seconds };
    setAutoReportSettings(next);
    setVisitIntervalInput(formatSecondsAsTime(seconds));
    const ok = await saveAutoReportSettings(next);
    if (!ok) {
      setAutoReportSettings(prev);
      setVisitIntervalInput(formatSecondsAsTime(prev.min_visit_interval_seconds));
    }
  };

  const busy = downloadLoading || autoReportLoading || autoReportSaving;
  const settingsDisabled = busy || !autoReportSettings.enabled;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
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
            Автоматизированный отчёт
          </Typography>

          {autoReportLoading ? (
            <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
              <CircularProgress size={20} sx={{ color: "#62A65D" }} />
              <Typography variant="body2" color="text.secondary">
                Загрузка настроек…
              </Typography>
            </Box>
          ) : (
            <>
              <FormControlLabel
                sx={{ ml: 0, alignItems: "flex-start", mb: 2 }}
                control={
                  <Switch
                    checked={autoReportSettings.enabled}
                    onChange={handleToggleAutoReport}
                    disabled={busy}
                    color="success"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {autoReportSettings.enabled ? "Включено" : "Выключено"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Автоматическая генерация обработка данных с использованием алгоритмов и последующим
                      отправлением в мессенджер
                    </Typography>
                  </Box>
                }
              />

              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                Задать настройки (ручной режим)
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
                <TextField
                  size="small"
                  fullWidth
                  type="number"
                  label="Не показывать агрозоны, % обработки которых меньше"
                  value={autoReportSettings.min_agro_zone_percent}
                  onChange={(e) =>
                    setAutoReportSettings((prev) => ({
                      ...prev,
                      min_agro_zone_percent: e.target.value,
                    }))
                  }
                  onBlur={handleNumericFieldBlur("min_agro_zone_percent")}
                  disabled={settingsDisabled}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: 0, step: 1 }}
                />

                <TextField
                  size="small"
                  fullWidth
                  label="Минимальное время между посещениями геозон"
                  value={visitIntervalInput}
                  onChange={(e) => setVisitIntervalInput(e.target.value)}
                  onBlur={handleVisitIntervalBlur}
                  disabled={settingsDisabled}
                  InputLabelProps={{ shrink: true }}
                  placeholder="00:00:10"
                  inputProps={{ pattern: "[0-9]{2}:[0-9]{2}:[0-9]{2}" }}
                />

                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Средняя рабочая скорость техники (км/час)
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: 2,
                    }}
                  >
                    <TextField
                      size="small"
                      type="number"
                      value={autoReportSettings.min_speed_kmh}
                      onChange={(e) =>
                        setAutoReportSettings((prev) => ({
                          ...prev,
                          min_speed_kmh: e.target.value,
                        }))
                      }
                      onBlur={handleNumericFieldBlur("min_speed_kmh")}
                      disabled={settingsDisabled}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">от</InputAdornment>,
                      }}
                      inputProps={{ min: 0, step: 1, "aria-label": "Минимальная скорость, км/ч" }}
                    />
                    <TextField
                      size="small"
                      type="number"
                      value={autoReportSettings.max_speed_kmh}
                      onChange={(e) =>
                        setAutoReportSettings((prev) => ({
                          ...prev,
                          max_speed_kmh: e.target.value,
                        }))
                      }
                      onBlur={handleNumericFieldBlur("max_speed_kmh")}
                      disabled={settingsDisabled}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">до</InputAdornment>,
                      }}
                      inputProps={{ min: 0, step: 1, "aria-label": "Максимальная скорость, км/ч" }}
                    />
                  </Box>
                </Box>
              </Box>

              <Alert severity="info" sx={{ textAlign: "left" }}>
                Принимая решения на основе автоматически выдаваемых ответов, вы берёте ответственность за любые
                последствия на себя. Чтобы минимизировать риски и обезопасить себя, рекомендуется создавать или
                редактировать полевые обработки вручную.
              </Alert>
            </>
          )}
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
