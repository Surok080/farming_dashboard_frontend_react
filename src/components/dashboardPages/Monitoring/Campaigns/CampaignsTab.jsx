import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  LinearProgress,
  Popover,
  Typography,
} from "@mui/material";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import { useSnackbar } from "notistack";
import {
  deleteCampaign,
  getApiErrorMessage,
  getCampaigns,
  getCampaignTriggers,
  saveCampaignTriggers,
} from "../../../../api/campaigns";
import MonitoringStatusConfirmDialog from "../MonitoringStatusConfirmDialog";
import CampaignCreateDialog from "./CampaignCreateDialog";
import CampaignsTable from "./CampaignsTable";
import { TRIGGER_FIELDS, emptyTriggerSettings } from "./campaignUtils";

const CampaignsTab = ({ active, year }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [triggers, setTriggers] = useState(emptyTriggerSettings);
  const [triggerAnchor, setTriggerAnchor] = useState(null);
  const [triggerSaving, setTriggerSaving] = useState(false);

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCampaigns();
      const data = res?.data;
      setCampaigns(Array.isArray(data) ? data : []);
    } catch (err) {
      enqueueSnackbar(getApiErrorMessage(err, "Не удалось загрузить кампании"), { variant: "error" });
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    if (!active) return;
    loadCampaigns();
  }, [active, loadCampaigns]);

  const openTriggers = async (event) => {
    setTriggerAnchor(event.currentTarget);
    try {
      const res = await getCampaignTriggers();
      const data = res?.data ?? {};
      setTriggers({
        threshold_60: Boolean(data.threshold_60),
        threshold_80: Boolean(data.threshold_80),
        threshold_90: Boolean(data.threshold_90),
      });
    } catch (err) {
      enqueueSnackbar(getApiErrorMessage(err, "Не удалось загрузить триггеры"), { variant: "error" });
    }
  };

  const handleTriggerChange = async (key, checked) => {
    const next = { ...triggers, [key]: checked };
    setTriggers(next);
    setTriggerSaving(true);
    try {
      await saveCampaignTriggers(next);
    } catch (err) {
      setTriggers(triggers);
      enqueueSnackbar(getApiErrorMessage(err, "Не удалось сохранить триггеры"), { variant: "error" });
    } finally {
      setTriggerSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteCampaign(deleteTarget.id);
      enqueueSnackbar("Кампания удалена", { variant: "success" });
      setDeleteTarget(null);
      setExpandedIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteTarget.id);
        return next;
      });
      await loadCampaigns();
    } catch (err) {
      enqueueSnackbar(getApiErrorMessage(err, "Не удалось удалить кампанию"), { variant: "error" });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0, flex: 1 }}>
      <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap", mb: 1 }}>
        <Typography
          sx={{ background: "#62A65D", color: "white", padding: "8px 16px", borderRadius: "4px", fontWeight: "bold", fontSize: "16px" }}
        >
          Мониторинг-{year}
        </Typography>
        <Typography sx={{ fontSize: 14, color: "#333" }}>
          Спутниковый мониторинг сельскохозяйственной техники (источник данных Форт Монитор)
        </Typography>
      </Box>

      <Alert
        severity="info"
        sx={{
          mb: 1.5,
          alignItems: "flex-start",
          textAlign: "left",
          "& .MuiAlert-message": { textAlign: "left", width: "100%" },
        }}
      >
        На этой вкладке Вы можете планировать предстоящие работы, объединяя их в кампании, и контролировать соблюдение плана.
        Кампании создаются в случае, если одна и та же операция должна выполняться на нескольких полях в течение нескольких дней.
      </Alert>

      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, flexWrap: "wrap", mb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="contained"
            onClick={() => setCreateOpen(true)}
            sx={{ backgroundColor: "#62A65D", color: "#fff", textTransform: "none", "&:hover": { backgroundColor: "#4f8f4b" } }}
          >
            Создать
          </Button>
          <Typography sx={{ fontSize: 14, color: "#555" }}>Найдено: {campaigns.length}</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={loading ? <CircularProgress size={16} /> : <RefreshOutlinedIcon />}
            onClick={loadCampaigns}
            disabled={loading}
            sx={{ borderColor: "#bdbdbd", color: "#555", textTransform: "uppercase" }}
          >
            Обновить данные
          </Button>
          <Button
            variant="outlined"
            startIcon={<TuneOutlinedIcon />}
            onClick={openTriggers}
            sx={{ borderColor: "#bdbdbd", color: "#555", textTransform: "uppercase" }}
          >
            Свойства
          </Button>
        </Box>
      </Box>

      <LinearProgress sx={{ mb: 1, visibility: loading ? "visible" : "hidden" }} />

      <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        <CampaignsTable
          campaigns={campaigns}
          expandedIds={expandedIds}
          onToggle={(id) =>
            setExpandedIds((prev) => {
              const next = new Set(prev);
              if (next.has(id)) next.delete(id);
              else next.add(id);
              return next;
            })
          }
          onDelete={setDeleteTarget}
        />
      </Box>

      <CampaignCreateDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreated={loadCampaigns} />

      <Popover
        open={Boolean(triggerAnchor)}
        anchorEl={triggerAnchor}
        onClose={() => setTriggerAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box sx={{ p: 2, minWidth: 220 }}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>Настройка триггеров</Typography>
          <FormGroup>
            {TRIGGER_FIELDS.map((item) => (
              <FormControlLabel
                key={item.key}
                control={
                  <Checkbox
                    size="small"
                    checked={Boolean(triggers[item.key])}
                    disabled={triggerSaving}
                    onChange={(event) => handleTriggerChange(item.key, event.target.checked)}
                    sx={{ color: "#62A65D", "&.Mui-checked": { color: "#62A65D" } }}
                  />
                }
                label={item.label}
              />
            ))}
          </FormGroup>
        </Box>
      </Popover>

      <MonitoringStatusConfirmDialog
        open={Boolean(deleteTarget)}
        title="Удаление кампании"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!deleteLoading) setDeleteTarget(null);
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Удалить кампанию «{deleteTarget?.name}» вместе с собранными данными?
        </Typography>
      </MonitoringStatusConfirmDialog>
    </Box>
  );
};

export default CampaignsTab;
