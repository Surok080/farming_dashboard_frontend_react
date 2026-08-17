import React from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { sanitizeDateInputYear } from "./warehouseAccountingUtils";

const dateInputSx = {
  "& .MuiOutlinedInput-input": { cursor: "text" },
};

const renderMultiValue = (selected, items, emptyLabel) => {
  if (!selected.length) return emptyLabel;
  const names = selected
    .map((id) => items.find((item) => item.id === id)?.name)
    .filter(Boolean);
  return names.length ? names.join(", ") : emptyLabel;
};

const WarehouseAccountingToolbar = ({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  storages = [],
  sections = [],
  storageIds,
  sectionIds,
  onStorageIdsChange,
  onSectionIdsChange,
}) => (
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
          type="date"
          label="Дата начала"
          value={dateFrom}
          onChange={(e) => onDateFromChange(sanitizeDateInputYear(e.target.value))}
          inputProps={{ maxLength: 10, min: "1000-01-01", max: "9999-12-31" }}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 180 }}
          InputProps={{ sx: dateInputSx }}
        />
        <TextField
          size="small"
          type="date"
          label="Дата окончания"
          value={dateTo}
          onChange={(e) => onDateToChange(sanitizeDateInputYear(e.target.value))}
          inputProps={{ maxLength: 10, min: "1000-01-01", max: "9999-12-31" }}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 180 }}
          InputProps={{ sx: dateInputSx }}
        />
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="warehouse-storages-label">Все склады</InputLabel>
          <Select
            labelId="warehouse-storages-label"
            multiple
            value={storageIds}
            label="Все склады"
            onChange={(e) => onStorageIdsChange(e.target.value)}
            renderValue={(selected) => renderMultiValue(selected, storages, "Все склады")}
          >
            {storages.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                <Checkbox checked={storageIds.includes(item.id)} />
                <ListItemText primary={item.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="warehouse-sections-label">Разделы ТМЦ</InputLabel>
          <Select
            labelId="warehouse-sections-label"
            multiple
            value={sectionIds}
            label="Разделы ТМЦ"
            onChange={(e) => onSectionIdsChange(e.target.value)}
            renderValue={(selected) => renderMultiValue(selected, sections, "Разделы ТМЦ")}
          >
            {sections.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                <Checkbox checked={sectionIds.includes(item.id)} />
                <ListItemText primary={item.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ display: "flex", gap: 1, flexShrink: 0, alignSelf: "flex-end" }}>
        <Button
          disabled
          variant="outlined"
          sx={{
            borderColor: "#62A65D",
            color: "#62A65D",
            textTransform: "uppercase",
            fontWeight: 600,
            px: 2,
            boxShadow: "none",
            padding: "8px 16px",
          }}
          startIcon={<SettingsOutlinedIcon />}
        >
          НАСТРОЙКИ
        </Button>
        <Button
          disabled
          variant="contained"
          sx={{
            backgroundColor: "#62A65D",
            color: "#fff",
            textTransform: "uppercase",
            fontWeight: 600,
            px: 2,
            boxShadow: "none",
            padding: "8px 16px",
          }}
          startIcon={<PlayArrowOutlinedIcon />}
        >
          ВЫПОЛНИТЬ
        </Button>
      </Box>
    </Box>
  </Box>
);

export default WarehouseAccountingToolbar;
