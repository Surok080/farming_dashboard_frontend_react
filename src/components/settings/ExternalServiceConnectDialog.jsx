import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { connectExternalIntegration, getApiErrorMessage } from "../../api/externalIntegrations";

const INTEGRATION_STATUS = {
  ACTIVE: "ACTIVE",
  NEEDS_COMPANY_SELECTION: "NEEDS_COMPANY_SELECTION",
};

const ExternalServiceConnectDialog = ({
  open,
  onClose,
  service,
  isConnected,
  onSuccess,
  enqueueSnackbar,
}) => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [companies, setCompanies] = useState([]);
  const [needsCompanySelection, setNeedsCompanySelection] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const serviceCode = service?.code;
  const requiresCompany = serviceCode === "SMSR";

  useEffect(() => {
    if (!open) return;
    setLogin("");
    setPassword("");
    setCompanyId("");
    setCompanies([]);
    setNeedsCompanySelection(false);
  }, [open, serviceCode]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!serviceCode) return;

    const trimmedLogin = login.trim();
    if (!trimmedLogin || !password) {
      enqueueSnackbar("Укажите логин и пароль", { variant: "warning" });
      return;
    }

    const params = {};
    if (requiresCompany && companyId !== "") {
      params.company_id = Number(companyId);
    }

    setSubmitting(true);
    try {
      const { data } = await connectExternalIntegration(serviceCode, {
        login: trimmedLogin,
        password,
        params,
      });

      if (data.status === INTEGRATION_STATUS.NEEDS_COMPANY_SELECTION) {
        setNeedsCompanySelection(true);
        setCompanies(data.companies || []);
        enqueueSnackbar(data.status_label || "Выберите компанию", { variant: "info" });
        return;
      }

      enqueueSnackbar(
        data.status_label || (isConnected ? "Подключение обновлено" : "Сервис подключён"),
        { variant: "success" },
      );
      onSuccess?.(data);
      onClose();
    } catch (error) {
      enqueueSnackbar(getApiErrorMessage(error, "Не удалось подключить сервис"), {
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit} autoComplete="off">
        <DialogTitle sx={{ pb: 1 }}>
          {isConnected ? "Изменить подключение" : "Подключить"} — {service?.name}
        </DialogTitle>
        <DialogContent sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          {service?.code === "SMSR" && (
            <Typography variant="body2" color="text.secondary">
              ФортМонитор (SMSR). Если у аккаунта несколько компаний, после проверки логина и пароля
              нужно будет выбрать компанию из списка.
            </Typography>
          )}
          {service?.code === "GLONASSSOFT" && (
            <Typography variant="body2" color="text.secondary">
              Для ГлонассСофт достаточно логина и пароля.
            </Typography>
          )}

          <Box aria-hidden="true" sx={{ position: "absolute", left: -10000, top: "auto", width: 1, height: 1, overflow: "hidden" }}>
            <input type="text" name="username" autoComplete="username" tabIndex={-1} />
            <input type="password" name="password" autoComplete="current-password" tabIndex={-1} />
          </Box>

          <TextField
            label="Логин"
            name="smsr-login"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            fullWidth
            autoComplete="off"
            disabled={submitting}
            inputProps={{
              autoComplete: "off",
              autoCorrect: "off",
              autoCapitalize: "off",
              spellCheck: "false",
              "data-1p-ignore": "true",
              "data-lpignore": "true",
              "data-form-type": "other",
            }}
          />
          <TextField
            label="Пароль"
            name="smsr-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            autoComplete="new-password"
            disabled={submitting}
            inputProps={{
              autoComplete: "new-password",
              "data-1p-ignore": "true",
              "data-lpignore": "true",
              "data-form-type": "other",
            }}
          />

          {needsCompanySelection && companies.length > 0 && (
            <FormControl fullWidth disabled={submitting}>
              <InputLabel id="company-select-label">Компания</InputLabel>
              <Select
                labelId="company-select-label"
                label="Компания"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
               variant={'filled'}>
                {companies.map((company) => (
                  <MenuItem key={company.id} value={String(company.id)}>
                    {company.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {isConnected && (
            <Typography variant="caption" color="text.secondary">
              Сохранённые учётные данные недоступны для просмотра — введите логин и пароль заново.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={submitting} sx={{ textTransform: "none" }}>
            Отмена
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            sx={{
              textTransform: "none",
              backgroundColor: "#62A65D",
              boxShadow: "none",
              minWidth: 120,
            }}
          >
            {submitting ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={18} color="inherit" />
                Проверка…
              </Box>
            ) : needsCompanySelection ? (
              "Сохранить компанию"
            ) : (
              "Подключить"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ExternalServiceConnectDialog;
