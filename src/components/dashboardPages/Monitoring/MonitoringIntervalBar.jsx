import React, { useCallback } from "react";
import { Box, Button, TextField } from "@mui/material";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

const datetimeLocalInputSx = {
  "& .MuiOutlinedInput-input": { cursor: "text" },
};

const MonitoringIntervalBar = ({
  intervalFrom,
  setIntervalFrom,
  intervalTo,
  setIntervalTo,
  onRun,
  onOpenSettings,
}) => {
  const handleFromChange = useCallback(
    (e) => {
      const next = e.target.value;
      setIntervalFrom(next);
    },
    [setIntervalFrom]
  );

  const handleToChange = useCallback(
    (e) => {
      const next = e.target.value;
      setIntervalTo(next);
    },
    [setIntervalTo]
  );

  return (
    <Box sx={{ mt: 1 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
          mt: 1,
          width: "100%",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-end", gap: 2, flexWrap: "wrap", flex: "1 1 auto", minWidth: 0 }}>
          <TextField
            size="small"
            type="datetime-local"
            label="Дата и время начала"
            value={intervalFrom}
            onChange={handleFromChange}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 240 }}
            InputProps={{ sx: datetimeLocalInputSx }}
          />
          <TextField
            size="small"
            type="datetime-local"
            label="Дата и время окончания"
            value={intervalTo}
            onChange={handleToChange}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 240 }}
            InputProps={{ sx: datetimeLocalInputSx }}
          />

          <Button
            onClick={onRun}
            size="medium"
            variant="contained"
            sx={{
              backgroundColor: "#62A65D",
              color: "#fff",
              textTransform: "uppercase",
              fontWeight: 600,
              px: 2,
              boxShadow: "none",
              "&:hover": { backgroundColor: "#569a51", boxShadow: "none" },
              padding: '8px 16px',
            }}
            startIcon={<PlayArrowOutlinedIcon />}
          >
            ВЫПОЛНИТЬ
          </Button>
        </Box>

        <Button
          onClick={onOpenSettings}
          variant="outlined"
          sx={{
            borderColor: "#62A65D",
            color: "#62A65D",
            textTransform: "uppercase",
            fontWeight: 600,
            px: 2,
            boxShadow: "none",
            flexShrink: 0,
            alignSelf: "flex-end",
            padding: '8px 16px',
          }}
          startIcon={<SettingsOutlinedIcon />}
        >
          НАСТРОЙКИ
        </Button>
      </Box>
    </Box>
  );
};

export default MonitoringIntervalBar;
