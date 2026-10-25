import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  InputAdornment,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import {
  getApiErrorMessage,
  getAutoReportSettings,
  postAutoReportSettings,
} from "../../../api/notifications";
import {
  getMonitoringAutoDownloadStatus,
  getMonitoringFilterSettings,
  postMonitoringFilterSettings,
  toggleMonitoringAutoDownload,
} from "../../../api/monitoring";
import { DEFAULT_FILTER_SETTINGS, DEFAULT_REPORT_SETTINGS, isSendTimeAllowed } from "./monitoringAutoFilter";
import { formatSecondsAsTime, parseTimeToSeconds } from "./monitoringUtils";

const EMPTY_FIELD_ERRORS = {
  percent: "",
  interval: "",
  speed: "",
  sendTime: "",
};

const parseFiniteNumber = (value) => {
  const raw = String(value ?? "").trim().replace(",", ".");
  if (raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
};

const parsePercent = (value) => {
  const n = parseFiniteNumber(value);
  if (n == null || n < 0 || n > 100) return null;
  return n;
};

const pickNumber = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const asObject = (data) => (data && typeof data === "object" && !Array.isArray(data) ? data : {});

const filterFieldsFrom = (data, fallback) => {
  const source = asObject(data);
  const base = fallback ?? DEFAULT_FILTER_SETTINGS;
  return {
    enabled: source.enabled == null ? Boolean(base.enabled) : Boolean(source.enabled),
    min_agro_zone_percent: pickNumber(source.min_agro_zone_percent, base.min_agro_zone_percent),
    min_visit_interval_seconds: pickNumber(source.min_visit_interval_seconds, base.min_visit_interval_seconds),
    min_speed_kmh: pickNumber(source.min_speed_kmh, base.min_speed_kmh),
    max_speed_kmh: pickNumber(source.max_speed_kmh, base.max_speed_kmh),
  };
};

const reportFieldsFrom = (data, fallback) => {
  const source = asObject(data);
  const base = fallback ?? DEFAULT_REPORT_SETTINGS;
  const raw = typeof source.send_time === "string" ? source.send_time.trim() : "";
  const match = /^(\d{2}:\d{2})/.exec(raw);
  return {
    enabled: source.enabled == null ? Boolean(base.enabled) : Boolean(source.enabled),
    send_time: match ? match[1] : raw || base.send_time,
  };
};

const MonitoringSettingsDialog = ({ open, onClose, onFilterSaved }) => {
  const { enqueueSnackbar } = useSnackbar();

  const [autoEnabled, setAutoEnabled] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);

  const [settingsLoading, setSettingsLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  const [filterEnabled, setFilterEnabled] = useState(DEFAULT_FILTER_SETTINGS.enabled);
  const [percentInput, setPercentInput] = useState(String(DEFAULT_FILTER_SETTINGS.min_agro_zone_percent));
  const [visitIntervalInput, setVisitIntervalInput] = useState(
    formatSecondsAsTime(DEFAULT_FILTER_SETTINGS.min_visit_interval_seconds),
  );
  const [minSpeedInput, setMinSpeedInput] = useState(String(DEFAULT_FILTER_SETTINGS.min_speed_kmh));
  const [maxSpeedInput, setMaxSpeedInput] = useState(String(DEFAULT_FILTER_SETTINGS.max_speed_kmh));
  const [reportEnabled, setReportEnabled] = useState(DEFAULT_REPORT_SETTINGS.enabled);
  const [sendTime, setSendTime] = useState(DEFAULT_REPORT_SETTINGS.send_time);
  const [fieldErrors, setFieldErrors] = useState(EMPTY_FIELD_ERRORS);

  const applyFilterFields = useCallback((fields) => {
    setFilterEnabled(Boolean(fields.enabled));
    setPercentInput(String(fields.min_agro_zone_percent));
    setVisitIntervalInput(formatSecondsAsTime(fields.min_visit_interval_seconds));
    setMinSpeedInput(String(fields.min_speed_kmh));
    setMaxSpeedInput(String(fields.max_speed_kmh));
  }, []);

  const applyReportFields = useCallback((fields) => {
    setReportEnabled(Boolean(fields.enabled));
    setSendTime(fields.send_time);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    const isCancelled = () => cancelled;
    setSettingsLoading(true);
    setLoadFailed(false);
    setFieldErrors(EMPTY_FIELD_ERRORS);

    const loadAutoStatus = async () => {
      setStatusLoading(true);
      try {
        const { data } = await getMonitoringAutoDownloadStatus();
        if (isCancelled()) return;
        setAutoEnabled(Boolean(data?.enabled));
      } catch (error) {
        if (isCancelled()) return;
        enqueueSnackbar(getApiErrorMessage(error, "Не удалось загрузить статус автоскачивания"), {
          variant: "error",
        });
      } finally {
        if (!isCancelled()) setStatusLoading(false);
      }
    };

    const loadFilter = async () => {
      try {
        const { data } = await getMonitoringFilterSettings();
        if (isCancelled()) return;
        applyFilterFields(filterFieldsFrom(data, DEFAULT_FILTER_SETTINGS));
      } catch (error) {
        if (isCancelled()) return;
        if (error?.response?.status === 404) {
          applyFilterFields(DEFAULT_FILTER_SETTINGS);
          return;
        }
        setLoadFailed(true);
        enqueueSnackbar(getApiErrorMessage(error, "Не удалось загрузить настройки фильтра"), {
          variant: "error",
        });
      }
    };

    const loadReport = async () => {
      try {
        const { data } = await getAutoReportSettings();
        if (isCancelled()) return;
        applyReportFields(reportFieldsFrom(data, DEFAULT_REPORT_SETTINGS));
      } catch (error) {
        if (isCancelled()) return;
        if (error?.response?.status === 404) {
          applyReportFields(DEFAULT_REPORT_SETTINGS);
          return;
        }
        setLoadFailed(true);
        enqueueSnackbar(getApiErrorMessage(error, "Не удалось загрузить настройки отчёта"), {
          variant: "error",
        });
      }
    };

    Promise.all([loadAutoStatus(), loadFilter(), loadReport()]).finally(() => {
      if (!isCancelled()) setSettingsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [open, enqueueSnackbar, applyFilterFields, applyReportFields]);

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

  const handleSave = async () => {
    if (savingRef.current || settingsLoading || loadFailed) return;

    const nextErrors = { ...EMPTY_FIELD_ERRORS };
    const percent = parsePercent(percentInput);
    if (percent == null) {
      nextErrors.percent = "Укажите процент от 0 до 100";
    }
    const seconds = parseTimeToSeconds(visitIntervalInput);
    if (seconds == null) {
      nextErrors.interval = "Укажите время в формате ЧЧ:ММ:СС";
    }
    const minSpeed = parseFiniteNumber(minSpeedInput);
    const maxSpeed = parseFiniteNumber(maxSpeedInput);
    if (minSpeed == null || maxSpeed == null) {
      nextErrors.speed = "Укажите скорость";
    } else if (minSpeed > maxSpeed) {
      nextErrors.speed = "Минимальная скорость не может быть больше максимальной";
    }
    if (!isSendTimeAllowed(sendTime)) {
      nextErrors.sendTime = "Время отправки должно быть с 05:00 до 22:00";
    }
    setFieldErrors(nextErrors);
    if (nextErrors.percent || nextErrors.interval || nextErrors.speed || nextErrors.sendTime) return;

    const filterPayload = {
      enabled: Boolean(filterEnabled),
      min_agro_zone_percent: percent,
      min_visit_interval_seconds: seconds,
      min_speed_kmh: minSpeed,
      max_speed_kmh: maxSpeed,
    };
    const reportPayload = {
      enabled: filterEnabled ? Boolean(reportEnabled) : false,
      send_time: sendTime,
    };

    savingRef.current = true;
    setSaving(true);
    try {
      const filterRes = await postMonitoringFilterSettings(filterPayload);
      onFilterSaved?.({
        enabled: filterPayload.enabled,
        min_agro_zone_percent: filterPayload.min_agro_zone_percent,
        min_visit_interval_seconds: filterPayload.min_visit_interval_seconds,
        min_speed_kmh: filterPayload.min_speed_kmh,
        max_speed_kmh: filterPayload.max_speed_kmh,
      });
      try {
        const reportRes = await postAutoReportSettings(reportPayload);
        const savedFilter = filterFieldsFrom(filterRes?.data, filterPayload);
        const savedReport = reportFieldsFrom(reportRes?.data, reportPayload);
        enqueueSnackbar("Настройки сохранены", { variant: "success" });
        applyFilterFields(savedFilter);
        applyReportFields(savedReport);
      } catch (reportError) {
        enqueueSnackbar(getApiErrorMessage(reportError, "Не удалось сохранить настройки отчёта"), {
          variant: "error",
        });
      }
    } catch (error) {
      enqueueSnackbar(getApiErrorMessage(error, "Не удалось сохранить настройки"), {
        variant: "error",
      });
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const filterFieldsDisabled = !filterEnabled || settingsLoading || saving;
  const reportToggleDisabled = !filterEnabled || settingsLoading || saving;
  const reportSwitchChecked = filterEnabled && reportEnabled;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1, textAlign: "left" }}>Настройки мониторинга</DialogTitle>
      <DialogContent sx={{ pt: 1, textAlign: "left" }}>
        <Alert severity="info" sx={{ textAlign: "left", mb: 2 }}>
          Принимая решения на основе автоматически выдаваемых ответов, вы берёте ответственность за любые
          последствия на себя. Чтобы минимизировать риски и обезопасить себя, рекомендуется создавать или
          редактировать полевые обработки вручную.
        </Alert>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
            alignItems: "start",
          }}
        >
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Автозагрузка данных
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  Загрузка данных из SMSR (ФортМонитор) за предыдущий календарный день.
                </Typography>

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
                        disabled={toggleLoading || statusLoading}
                        color="success"
                        inputProps={{ "aria-label": "Автоскачивание" }}
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
              </CardContent>
            </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Автофильтрование строк
              </Typography>
              {settingsLoading ? (
                <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
                  <CircularProgress size={20} sx={{ color: "#62A65D" }} />
                  <Typography variant="body2" color="text.secondary">
                    Загрузка настроек…
                  </Typography>
                </Box>
              ) : null}
              <FormControlLabel
                sx={{ ml: 0, alignItems: "flex-start", mb: 2 }}
                control={
                  <Switch
                    checked={filterEnabled}
                    onChange={(event) => setFilterEnabled(event.target.checked)}
                    disabled={settingsLoading || saving}
                    color="success"
                    inputProps={{ "aria-label": "Автофильтрование строк" }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {filterEnabled ? "Включено" : "Выключено"}
                  </Typography>
                }
              />

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  size="small"
                  fullWidth
                  type="number"
                  label="Не показывать агрозоны, % обработки которых меньше"
                  value={percentInput}
                  onChange={(event) => {
                    setPercentInput(event.target.value);
                    setFieldErrors((prev) => ({ ...prev, percent: "" }));
                  }}
                  disabled={filterFieldsDisabled}
                  error={Boolean(fieldErrors.percent)}
                  helperText={fieldErrors.percent || " "}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: 0, max: 100, step: 1, "aria-label": "Процент обработки агрозоны" }}
                />

                <TextField
                  size="small"
                  fullWidth
                  label="Минимальное время между посещениями геозон"
                  value={visitIntervalInput}
                  onChange={(event) => {
                    setVisitIntervalInput(event.target.value);
                    setFieldErrors((prev) => ({ ...prev, interval: "" }));
                  }}
                  disabled={filterFieldsDisabled}
                  error={Boolean(fieldErrors.interval)}
                  helperText={fieldErrors.interval || " "}
                  InputLabelProps={{ shrink: true }}
                  placeholder="00:00:10"
                  inputProps={{
                    pattern: "[0-9]{2}:[0-9]{2}:[0-9]{2}",
                    "aria-label": "Минимальное время между посещениями геозон",
                  }}
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
                      value={minSpeedInput}
                      onChange={(event) => {
                        setMinSpeedInput(event.target.value);
                        setFieldErrors((prev) => ({ ...prev, speed: "" }));
                      }}
                      disabled={filterFieldsDisabled}
                      error={Boolean(fieldErrors.speed)}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">от</InputAdornment>,
                      }}
                      inputProps={{ min: 0, step: 1, "aria-label": "Минимальная скорость, км/ч" }}
                    />
                    <TextField
                      size="small"
                      type="number"
                      value={maxSpeedInput}
                      onChange={(event) => {
                        setMaxSpeedInput(event.target.value);
                        setFieldErrors((prev) => ({ ...prev, speed: "" }));
                      }}
                      disabled={filterFieldsDisabled}
                      error={Boolean(fieldErrors.speed)}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">до</InputAdornment>,
                      }}
                      inputProps={{ min: 0, step: 1, "aria-label": "Максимальная скорость, км/ч" }}
                    />
                  </Box>
                  {fieldErrors.speed ? (
                    <Typography variant="caption" color="error" sx={{ display: "block", mt: 0.5 }}>
                      {fieldErrors.speed}
                    </Typography>
                  ) : null}
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ gridColumn: { md: "1 / -1" } }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Автоматизированные уведомления
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Ежедневная отправка в MAX строк, которые разметил автофильтр
              </Typography>
              <FormControlLabel
                sx={{ ml: 0, alignItems: "flex-start", mb: 1 }}
                control={
                  <Switch
                    checked={reportSwitchChecked}
                    onChange={(event) => {
                      if (!filterEnabled) return;
                      setReportEnabled(event.target.checked);
                    }}
                    disabled={reportToggleDisabled}
                    color="success"
                    inputProps={{ "aria-label": "Автоматизированные уведомления" }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {reportSwitchChecked ? "Включено" : "Выключено"}
                  </Typography>
                }
              />
              <TextField
                size="small"
                fullWidth
                type="time"
                label="Время отправки"
                value={sendTime}
                onChange={(event) => {
                  setSendTime(event.target.value);
                  setFieldErrors((prev) => ({ ...prev, sendTime: "" }));
                }}
                disabled={settingsLoading || saving}
                error={Boolean(fieldErrors.sendTime)}
                helperText={fieldErrors.sendTime || " "}
                InputLabelProps={{ shrink: true }}
                inputProps={{ "aria-label": "Время отправки", step: 60 }}
                sx={{ mb: 1.5, maxWidth: 280 }}
              />
              <Typography variant="body2" color="text.secondary">
                Чтобы отчёт уходил в MAX, подключите бота в Настройки → Уведомления
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: "flex-end" }}>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={settingsLoading || saving || loadFailed}
          sx={{
            textTransform: "none",
            backgroundColor: "#62A65D",
            boxShadow: "none",
            "&:hover": { backgroundColor: "#4f8f4b", boxShadow: "none" },
          }}
        >
          {saving ? "Сохранение…" : "Сохранить"}
        </Button>
        <Button onClick={onClose} variant="outlined" sx={{ textTransform: "none" }}>
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MonitoringSettingsDialog;
