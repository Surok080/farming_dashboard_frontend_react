import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { createCampaign, getApiErrorMessage, getCampaignDicts } from "../../../../api/campaigns";
import CampaignTransferList from "./CampaignTransferList";
import { sanitizeDateInputYear } from "../monitoringUtils";
import { addDays, campaignPeriodError, parseFieldCulture, toCampaignApiDate, tomorrowIso } from "./campaignUtils";

const cardSx = {
  border: "1px solid #e6e6e6",
  borderRadius: 1,
  p: 2,
  backgroundColor: "#fff",
  height: "100%",
  boxSizing: "border-box",
};

const fieldLabel = (field) => {
  const name = field?.name || "Поле";
  if (/\d+(?:[.,]\d+)?\s*га\s*$/i.test(name)) return name;
  const area = Number(field?.area);
  if (!Number.isFinite(area)) return name;
  return `${name} ${area} га`;
};

const CampaignCreateDialog = ({ open, onClose, onCreated }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loadingDicts, setLoadingDicts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dicts, setDicts] = useState({ tech_operations: [], fields: [], objects: [] });
  const [name, setName] = useState("");
  const [techOperationId, setTechOperationId] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateStop, setDateStop] = useState("");
  const [fieldIds, setFieldIds] = useState([]);
  const [equipmentIds, setEquipmentIds] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return undefined;
    const start = tomorrowIso();
    setName("");
    setTechOperationId("");
    setDateStart(start);
    setDateStop(addDays(start, 1));
    setFieldIds([]);
    setEquipmentIds([]);
    setError("");
    setLoadingDicts(true);
    let cancelled = false;
    getCampaignDicts()
      .then((res) => {
        if (cancelled) return;
        const data = res?.data ?? {};
        setDicts({
          tech_operations: Array.isArray(data.tech_operations) ? data.tech_operations : [],
          fields: Array.isArray(data.fields) ? data.fields : [],
          objects: Array.isArray(data.objects) ? data.objects : [],
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setError(getApiErrorMessage(err, "Не удалось загрузить справочники"));
      })
      .finally(() => {
        if (!cancelled) setLoadingDicts(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const fieldItems = useMemo(
    () =>
      dicts.fields.map((field) => ({
        id: field.id,
        label: fieldLabel(field),
        area: Number(field.area) || 0,
        culture: parseFieldCulture(field.name),
      })),
    [dicts.fields]
  );

  const objectItems = useMemo(
    () => dicts.objects.map((item) => ({ id: item.id, label: item.name || "Техника" })),
    [dicts.objects]
  );

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Укажите наименование кампании");
      return;
    }
    if (!techOperationId) {
      setError("Выберите технологическую операцию");
      return;
    }
    const periodError = campaignPeriodError(dateStart, dateStop);
    if (periodError) {
      setError(periodError);
      return;
    }
    if (equipmentIds.length === 0) {
      setError("Выберите технику для кампании");
      return;
    }
    if (fieldIds.length === 0) {
      setError("Выберите поля для кампании");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const res = await createCampaign({
        name: trimmed,
        tech_operation_id: Number(techOperationId),
        date_start: toCampaignApiDate(dateStart),
        date_stop: toCampaignApiDate(dateStop),
        field_ids: fieldIds,
        equipment_ids: equipmentIds,
      });
      enqueueSnackbar(res?.data?.message || "Кампания создана", { variant: "success" });
      onCreated?.();
      onClose?.();
    } catch (err) {
      setError(getApiErrorMessage(err, "Не удалось создать кампанию"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Чтобы создать кампанию, выполните следующее:</DialogTitle>
      <DialogContent>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}
        {loadingDicts ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: "#62A65D" }} />
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 2 }}>
              <Box sx={cardSx}>
                <Typography sx={{ fontWeight: 700, mb: 1 }}>Наименование</Typography>
                <Typography sx={{ fontSize: 13, color: "#666", mb: 1 }}>1. Укажите наименование кампании:</Typography>
                <TextField
                  fullWidth
                  size="small"
                  label="Наименование"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </Box>
              <Box sx={cardSx}>
                <Typography sx={{ fontWeight: 700, mb: 1 }}>Технологическая операция</Typography>
                <Typography sx={{ fontSize: 13, color: "#666", mb: 1 }}>2. В выпадающем списке выберите операцию:</Typography>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Техоперация"
                  value={techOperationId}
                  onChange={(event) => setTechOperationId(event.target.value)}
                >
                  {dicts.tech_operations.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              <Box sx={cardSx}>
                <Typography sx={{ fontWeight: 700, mb: 1 }}>Интервал</Typography>
                <Typography sx={{ fontSize: 13, color: "#666", mb: 1 }}>
                  3. Укажите период, в который должна выполняться кампания (от 2 до 30 дней)
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <TextField
                    size="small"
                    type="date"
                    label="Начало"
                    value={dateStart}
                    onChange={(event) => setDateStart(sanitizeDateInputYear(event.target.value))}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: tomorrowIso() }}
                    sx={{ flex: 1, minWidth: 140 }}
                  />
                  <TextField
                    size="small"
                    type="date"
                    label="Окончание"
                    value={dateStop}
                    onChange={(event) => setDateStop(sanitizeDateInputYear(event.target.value))}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: dateStart || tomorrowIso() }}
                    sx={{ flex: 1, minWidth: 140 }}
                  />
                </Box>
              </Box>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={cardSx}>
                <Typography sx={{ fontWeight: 700, mb: 0.5 }}>4. Укажите, какие объекты должны использоваться</Typography>
                <Typography sx={{ fontSize: 13, color: "#666", mb: 1 }}>для выполнения кампании</Typography>
                <CampaignTransferList
                  items={objectItems}
                  selectedIds={equipmentIds}
                  onChange={setEquipmentIds}
                  availableLabel="Доступные объекты"
                  selectedLabel="Выбрано"
                />
              </Box>
              <Box sx={cardSx}>
                <Typography sx={{ fontWeight: 700, mb: 0.5 }}>5. Выберите поля</Typography>
                <Typography sx={{ fontSize: 13, color: "#666", mb: 1 }}>
                  Чтобы найти необходимые поля, используйте поиск и фильтр по культуре.
                </Typography>
                <CampaignTransferList
                  items={fieldItems}
                  selectedIds={fieldIds}
                  onChange={setFieldIds}
                  availableLabel="Доступные поля"
                  selectedLabel="Выбрано"
                  enableCultureFilter
                />
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          variant="contained"
          disabled={saving || loadingDicts}
          onClick={handleSave}
          sx={{ backgroundColor: "#62A65D", color: "#fff", textTransform: "none", "&:hover": { backgroundColor: "#4f8f4b" } }}
        >
          {saving ? "Сохранение..." : "Сохранить"}
        </Button>
        <Button variant="outlined" onClick={onClose} disabled={saving} sx={{ textTransform: "none", borderColor: "#62A65D", color: "#62A65D" }}>
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CampaignCreateDialog;
