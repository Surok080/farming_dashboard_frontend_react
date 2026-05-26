import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LaunchIcon from "@mui/icons-material/Launch";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useSnackbar } from "notistack";
import {
  generateMaxConnectionCode,
  getApiErrorMessage,
  getNotificationChannels,
} from "../../api/notifications";
import maxQrCode from "../../images/max-qr-code.svg";

const MAX_BOT_URL = "https://max.ru/id1683024172_bot";
const MAX_PROVIDER = "MAX";

const cardSx = {
  p: 2.5,
  borderRadius: 2,
  border: "1px solid",
  borderColor: "divider",
  width: "100%",
  maxWidth: 980,
};

const stepSx = {
  display: "flex",
  gap: 1.5,
  alignItems: "flex-start",
  textAlign: "left",
};

const stepNumberSx = {
  width: 28,
  height: 28,
  borderRadius: "50%",
  backgroundColor: "#62A65D",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
  flexShrink: 0,
};

const isMaxChannel = (channel) => {
  const providerLabel = channel?.provider_label || "";
  const provider = channel?.provider || "";
  return provider === MAX_PROVIDER || providerLabel.toUpperCase().includes(MAX_PROVIDER);
};

const copyToClipboard = async (text) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
};

const NotificationSettings = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [channels, setChannels] = useState([]);
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [checkingChannels, setCheckingChannels] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [codeData, setCodeData] = useState(null);

  const maxChannel = useMemo(() => channels.find(isMaxChannel), [channels]);
  const isMaxConnected = Boolean(maxChannel?.is_connected && maxChannel?.is_active);
  const command = codeData?.code ? `/start ${codeData.code}` : "";
  const expiresAt = codeData?.createdAt && codeData?.expires_in_minutes
    ? new Date(codeData.createdAt + codeData.expires_in_minutes * 60 * 1000)
    : null;

  const loadChannels = useCallback(async ({ silent = false } = {}) => {
    if (silent) {
      setCheckingChannels(true);
    } else {
      setLoadingChannels(true);
    }

    try {
      const { data } = await getNotificationChannels();
      setChannels(data || []);

      const hasMaxConnection = (data || []).some(
        (channel) => isMaxChannel(channel) && channel.is_connected && channel.is_active,
      );

      if (silent) {
        enqueueSnackbar(
          hasMaxConnection ? "MAX уведомления подключены" : "Подключение пока не найдено",
          { variant: hasMaxConnection ? "success" : "info" },
        );
      }
    } catch (error) {
      enqueueSnackbar(getApiErrorMessage(error, "Не удалось загрузить каналы уведомлений"), {
        variant: "error",
      });
    } finally {
      setLoadingChannels(false);
      setCheckingChannels(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    loadChannels();
  }, [loadChannels]);

  const handleGenerateCode = async () => {
    setGeneratingCode(true);
    try {
      const { data } = await generateMaxConnectionCode();
      setCodeData({
        ...data,
        createdAt: Date.now(),
      });
      enqueueSnackbar("Код создан. Отправьте команду в группе MAX в течение 10 минут", {
        variant: "success",
      });
    } catch (error) {
      enqueueSnackbar(getApiErrorMessage(error, "Не удалось сгенерировать код"), {
        variant: "error",
      });
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleCopyCommand = async () => {
    if (!command) return;

    try {
      await copyToClipboard(command);
      enqueueSnackbar("Команда скопирована", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Не удалось скопировать команду", { variant: "error" });
    }
  };

  if (loadingChannels) {
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
          Подключите группу MAX, чтобы получать уведомления от Агро-Коннект в рабочий чат.
        </Typography>
      </Box>

      <Paper elevation={0} sx={cardSx}>
        <Stack spacing={2.5}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2}>
            <Box display="flex" gap={1.5} alignItems="center">
              <NotificationsActiveOutlinedIcon sx={{ color: "#62A65D" }} />
              <Box>
                <Typography variant="h6" sx={{ fontSize: "1.1rem" }}>
                  Бот MAX
                </Typography>
                <Link
                  href={MAX_BOT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
                >
                  Открыть бота
                  <LaunchIcon sx={{ fontSize: 16 }} />
                </Link>
              </Box>
            </Box>
            <Chip
              icon={isMaxConnected ? <CheckCircleOutlineIcon /> : undefined}
              label={isMaxConnected ? "Подключено" : "Не подключено"}
              color={isMaxConnected ? "success" : "default"}
              variant={isMaxConnected ? "filled" : "outlined"}
            />
          </Box>

          {isMaxConnected ? (
            <Alert severity="success" sx={{ textAlign: "left" }}>
              Группа MAX подключена. Уведомления будут приходить в привязанный групповой чат.
            </Alert>
          ) : (
            <>
              <Alert severity="info" sx={{ textAlign: "left" }}>
                Сначала сгенерируйте одноразовый код в приложении. Затем добавьте бота в группу MAX
                и отправьте в этой группе команду с полученным кодом.
              </Alert>

              <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "minmax(0, 1fr) 220px" }} gap={3}>
                <Stack spacing={2.2} sx={{ textAlign: "left" }}>
                  <Box sx={stepSx}>
                    <Box sx={stepNumberSx}>1</Box>
                    <Box>
                      <Typography variant="subtitle2">Добавьте бота в группу</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Перейдите по ссылке на бота, добавьте его в нужную группу MAX и назначьте
                        администратором.
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={stepSx}>
                    <Box sx={stepNumberSx}>2</Box>
                    <Box>
                      <Typography variant="subtitle2">Сгенерируйте код</Typography>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        Код действует 10 минут. Если время вышло, создайте новый.
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={handleGenerateCode}
                        disabled={generatingCode}
                        sx={{ textTransform: "none", backgroundColor: "#62A65D", boxShadow: "none" }}
                      >
                        {generatingCode ? "Генерация..." : codeData?.code ? "Сгенерировать новый код" : "Сгенерировать код"}
                      </Button>
                    </Box>
                  </Box>

                  <Box sx={stepSx}>
                    <Box sx={stepNumberSx}>3</Box>
                    <Box width="100%">
                      <Typography variant="subtitle2">Отправьте команду в группе</Typography>
                      {command ? (
                        <Box mt={1}>
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: 1.5,
                              backgroundColor: "#F5F7F5",
                              border: "1px solid",
                              borderColor: "divider",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography
                              component="code"
                              sx={{ fontFamily: "monospace", fontWeight: 700, fontSize: "1rem" }}
                            >
                              {command}
                            </Typography>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<ContentCopyIcon />}
                              onClick={handleCopyCommand}
                              sx={{ textTransform: "none", flexShrink: 0 }}
                            >
                              Скопировать
                            </Button>
                          </Box>
                          {expiresAt && (
                            <Typography variant="caption" color="text.secondary" mt={0.75} display="block">
                              Код действителен до {expiresAt.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Команда появится после генерации кода.
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Box sx={stepSx}>
                    <Box sx={stepNumberSx}>4</Box>
                    <Box>
                      <Typography variant="subtitle2">Проверьте подключение</Typography>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        После сообщения бота об успешной привязке можно убрать у него роль администратора.
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={checkingChannels ? <CircularProgress size={16} /> : <RefreshIcon />}
                        onClick={() => loadChannels({ silent: true })}
                        disabled={checkingChannels}
                        sx={{ textTransform: "none" }}
                      >
                        Проверить подключение
                      </Button>
                    </Box>
                  </Box>
                </Stack>

                <Box
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    minHeight: 220,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    p: 2,
                    backgroundColor: "#FAFAFA",
                  }}
                >
                  <Box
                    component="img"
                    src={maxQrCode}
                    alt="QR-код для открытия бота MAX"
                    sx={{
                      width: 180,
                      height: 180,
                      objectFit: "contain",
                      borderRadius: 1,
                      backgroundColor: "#fff",
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Наведите камеру на QR-код, чтобы открыть бота MAX.
                  </Typography>
                </Box>
              </Box>

              <Divider />

              <Typography variant="caption" color="text.secondary">
                Команда должна быть отправлена именно в группе: <b>/start код</b>. В личных сообщениях
                бот только подскажет инструкцию.
              </Typography>
            </>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default NotificationSettings;
