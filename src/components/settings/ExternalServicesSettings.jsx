import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Typography,
} from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { useSnackbar } from "notistack";
import { useSelector } from "react-redux";
import {
  deleteExternalIntegration,
  getApiErrorMessage,
  getExternalServices,
  getMyExternalIntegrations,
} from "../../api/externalIntegrations";
import ExternalServiceConnectDialog from "./ExternalServiceConnectDialog";

const cardSx = {
  p: 2.5,
  borderRadius: 2,
  border: "1px solid",
  borderColor: "divider",
  display: "flex",
  flexDirection: "column",
  gap: 1.5,
  height: "100%",
};

const ExternalServicesSettings = () => {
  const { enqueueSnackbar } = useSnackbar();
  const user = useSelector((state) => state.user);
  const hasAccess = user?.userInfo?.module?.includes("external_integrations");

  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [integrations, setIntegrations] = useState([]);
  const [connectDialog, setConnectDialog] = useState({ open: false, service: null });
  const [disconnectDialog, setDisconnectDialog] = useState({ open: false, service: null });
  const [deleting, setDeleting] = useState(false);

  const connectedByCode = useMemo(() => {
    const map = {};
    integrations.forEach((item) => {
      if (item?.service?.code) {
        map[item.service.code] = item;
      }
    });
    return map;
  }, [integrations]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [servicesRes, integrationsRes] = await Promise.all([
        getExternalServices(),
        getMyExternalIntegrations(),
      ]);
      setServices(servicesRes.data || []);
      setIntegrations(integrationsRes.data || []);
    } catch (error) {
      enqueueSnackbar(getApiErrorMessage(error, "Не удалось загрузить внешние сервисы"), {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    if (hasAccess) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [hasAccess, loadData]);

  const handleDisconnect = async () => {
    const service = disconnectDialog.service;
    if (!service?.code) return;

    setDeleting(true);
    try {
      await deleteExternalIntegration(service.code);
      enqueueSnackbar(`Подключение «${service.name}» удалено`, { variant: "success" });
      setDisconnectDialog({ open: false, service: null });
      await loadData();
    } catch (error) {
      enqueueSnackbar(getApiErrorMessage(error, "Не удалось отключить сервис"), {
        variant: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  const openConnect = (service) => {
    setConnectDialog({ open: true, service });
  };

  const closeConnect = () => {
    setConnectDialog({ open: false, service: null });
  };

  if (!hasAccess) {
    return (
      <Typography variant="body1" color="text.secondary">
        У вашей учётной записи нет доступа к разделу «Внешние интеграции». Обратитесь к администратору.
      </Typography>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress sx={{ color: "#62A65D" }} />
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" gap={3} alignItems="flex-start">
      <Box textAlign="left">
        <Typography variant="body2" color="textSecondary">
          Подключение внешних систем к спутниковому мониторингу (ГЛОНАСС/GPS). Сервер спутникового мониторинга передает в учетную запись
          обработанные данные (пробег, расход, координаты и другие параматеры) по запросу (REST API) или по расписанию
        </Typography>
      </Box>

      {services.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Нет доступных сервисов для подключения.
        </Typography>
      ) : (
        <Box
          display="grid"
          gridTemplateColumns={{ xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }}
          gap={2}
          width="100%"
          maxWidth={900}
        >
          {services.map((service) => {
            const connected = Boolean(connectedByCode[service.code]);
            const requiredParamKeys = Object.keys(service.required_params || {});

            return (
              <Paper key={service.id} elevation={0} sx={cardSx}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1}>
                  <Typography variant="h6" sx={{ fontSize: "1.1rem" }}>
                    {service.name}
                  </Typography>
                  <Chip
                    size="small"
                    label={connected ? "Подключено" : "Не подключено"}
                    color={connected ? "success" : "default"}
                    variant={connected ? "filled" : "outlined"}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary">
                  Код: {service.code}
                </Typography>

                {requiredParamKeys.length > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    Доп. параметры:{" "}
                    {requiredParamKeys
                      .map((key) => service.required_params[key]?.label || key)
                      .join(", ")}
                  </Typography>
                )}

                <Box display="flex" flexWrap="wrap" gap={1} mt="auto" pt={1}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={connected ? <EditOutlinedIcon /> : <LinkIcon />}
                    onClick={() => openConnect(service)}
                    sx={{
                      textTransform: "none",
                      backgroundColor: "#62A65D",
                      boxShadow: "none",
                    }}
                  >
                    {connected ? "Изменить" : "Подключить"}
                  </Button>
                  {connected && (
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      startIcon={<LinkOffIcon />}
                      onClick={() => setDisconnectDialog({ open: true, service })}
                      sx={{ textTransform: "none" }}
                    >
                      Отключить
                    </Button>
                  )}
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}

      <ExternalServiceConnectDialog
        open={connectDialog.open}
        onClose={closeConnect}
        service={connectDialog.service}
        isConnected={Boolean(connectDialog.service && connectedByCode[connectDialog.service.code])}
        onSuccess={loadData}
        enqueueSnackbar={enqueueSnackbar}
      />

      <Dialog
        open={disconnectDialog.open}
        onClose={() => !deleting && setDisconnectDialog({ open: false, service: null })}
      >
        <DialogTitle>Отключить сервис?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Подключение «{disconnectDialog.service?.name}» будет удалено. Связанные модули перестанут
            использовать эти учётные данные.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDisconnectDialog({ open: false, service: null })}
            disabled={deleting}
            sx={{ textTransform: "none" }}
          >
            Отмена
          </Button>
          <Button
            onClick={handleDisconnect}
            color="error"
            variant="contained"
            disabled={deleting}
            sx={{ textTransform: "none" }}
          >
            {deleting ? "Удаление…" : "Отключить"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExternalServicesSettings;
