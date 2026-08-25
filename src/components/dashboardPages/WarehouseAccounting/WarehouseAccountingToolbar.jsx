import React from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { formatApiDateDisplay, sanitizeDateInputYear } from "./warehouseAccountingUtils";

const dateInputSx = {
  "& .MuiOutlinedInput-input": { cursor: "text" },
};

const PRODUCT_SELECT_WIDTH = 220;
const SECTION_SELECT_WIDTH = 180;

const renderMultiValue = (selected, items, emptyLabel) => {
  if (!selected.length) return emptyLabel;
  const names = selected
    .map((id) => items.find((item) => item.id === id)?.name)
    .filter(Boolean);
  return names.length ? names.join(", ") : emptyLabel;
};

const renderCompactSelectValue = (selected, items, emptyLabel) => {
  if (!selected.length) return emptyLabel;
  const firstName = items.find((item) => item.id === selected[0])?.name ?? "Выбрано";
  const rest = selected.length - 1;
  if (rest <= 0) return firstName;
  return `${firstName} +${rest}`;
};

const SelectClearButton = ({ visible, onClear, ariaLabel }) =>
  visible ? (
    <IconButton
      size="small"
      aria-label={ariaLabel}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onClear();
      }}
      sx={{
        position: "absolute",
        right: 28,
        p: 0.25,
        color: "#9aa3af",
      }}
    >
      <CloseOutlinedIcon sx={{ fontSize: 16 }} />
    </IconButton>
  ) : null;

export const WarehouseAccountingFiltersBar = ({
  storages = [],
  sections = [],
  storageIds,
  sectionIds,
  onStorageIdsChange,
  onSectionIdsChange,
  onClearSelection,
  clearDisabled = true,
}) => (
  <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
    <FormControl size="small" sx={{ minWidth: 180 }}>
      <InputLabel id="warehouse-storages-label">Все склады</InputLabel>
      <Select
        labelId="warehouse-storages-label"
        multiple
        value={storageIds}
        label="Все склады"
        onChange={(e) => onStorageIdsChange(e.target.value)}
        renderValue={(selected) => renderMultiValue(selected, storages, "Все склады")}
        sx={{ backgroundColor: "#fff" }}
      >
        {storages.map((item) => (
          <MenuItem key={item.id} value={item.id}>
            <Checkbox checked={storageIds.includes(item.id)} />
            <ListItemText primary={item.name} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
    <FormControl size="small" sx={{ width: SECTION_SELECT_WIDTH, flexShrink: 0 }}>
      <InputLabel id="warehouse-sections-label">Разделы ТМЦ</InputLabel>
      <Select
        labelId="warehouse-sections-label"
        multiple
        value={sectionIds}
        label="Разделы ТМЦ"
        onChange={(e) => onSectionIdsChange(e.target.value)}
        renderValue={(selected) => renderCompactSelectValue(selected, sections, "Разделы ТМЦ")}
        endAdornment={
          <SelectClearButton
            visible={sectionIds.length > 0}
            ariaLabel="Очистить разделы"
            onClear={() => onSectionIdsChange([])}
          />
        }
        sx={{
          width: SECTION_SELECT_WIDTH,
          backgroundColor: "#fff",
          "& .MuiSelect-select": {
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            pr: sectionIds.length ? "52px !important" : "32px !important",
          },
        }}
      >
        {sections.map((item) => (
          <MenuItem key={item.id} value={item.id}>
            <Checkbox checked={sectionIds.includes(item.id)} />
            <ListItemText primary={item.name} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
    <Box sx={{ flex: 1 }} />
    <Button
      size="small"
      disableRipple
      disabled={clearDisabled}
      onClick={onClearSelection}
      sx={{
        fontSize: 12,
        color: clearDisabled ? "#b7c0c9" : "#7b8593",
        textTransform: "none",
        whiteSpace: "nowrap",
        minWidth: "auto",
        px: 0.5,
        "&:hover": {
          backgroundColor: "transparent",
          color: clearDisabled ? "#b7c0c9" : "#4f5a68",
          textDecoration: "underline",
        },
      }}
    >
      Снять выборку
    </Button>
  </Box>
);

export const WarehouseAccountingRunBar = ({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  products = [],
  productIds = [],
  onProductIdsChange,
  lastOperationDate,
  onRun,
  runLoading = false,
}) => (
  <Box sx={{ mt: 1.5 }}>
    <Typography sx={{ fontWeight: 600, fontSize: 14, color: "#2f3743", mb: 1 }}>
      Движение ТМЦ: приход, расход и остаток ТМЦ на складе
    </Typography>
    <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1, flexWrap: "wrap" }}>
      <TextField
        size="small"
        type="date"
        label="Дата начала"
        value={dateFrom}
        onChange={(e) => onDateFromChange(sanitizeDateInputYear(e.target.value))}
        inputProps={{ maxLength: 10, min: "1000-01-01", max: "9999-12-31" }}
        InputLabelProps={{ shrink: true }}
        sx={{ minWidth: 140 }}
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
        sx={{ minWidth: 140 }}
        InputProps={{ sx: dateInputSx }}
      />
      <Button
        variant="contained"
        disabled={runLoading}
        onClick={onRun}
        sx={{
          minWidth: 44,
          width: 44,
          height: 40,
          backgroundColor: "#67b55b",
          color: "#fff",
          boxShadow: "none",
          px: 0,
          minHeight: 40,
          "&:hover": { backgroundColor: "#5aa34f" },
          "&.Mui-disabled": {
            backgroundColor: "#a8d4a1",
            color: "#fff",
          },
        }}
      >
        <PlayArrowOutlinedIcon />
      </Button>
      <FormControl size="small" sx={{ width: PRODUCT_SELECT_WIDTH, flexShrink: 0 }}>
        <InputLabel id="warehouse-products-label">Все наименования</InputLabel>
        <Select
          labelId="warehouse-products-label"
          multiple
          value={productIds}
          label="Все наименования"
          onChange={(e) => onProductIdsChange(e.target.value)}
          renderValue={(selected) => renderCompactSelectValue(selected, products, "Все наименования")}
          endAdornment={
            <SelectClearButton
              visible={productIds.length > 0}
              ariaLabel="Очистить наименования"
              onClear={() => onProductIdsChange([])}
            />
          }
          sx={{
            width: PRODUCT_SELECT_WIDTH,
            backgroundColor: "#fff",
            "& .MuiSelect-select": {
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              pr: productIds.length ? "52px !important" : "32px !important",
            },
          }}
        >
          {products.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              <Checkbox checked={productIds.includes(item.id)} />
              <ListItemText primary={item.name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {lastOperationDate ? (
        <Typography
          sx={{
            fontSize: 11,
            color: "#8b95a3",
            whiteSpace: "nowrap",
            alignSelf: "center",
            ml: "auto",
          }}
        >
          Последняя операция - {formatApiDateDisplay(lastOperationDate)}
        </Typography>
      ) : (
        <Box sx={{ flex: 1, minWidth: 8 }} />
      )}
      <Button
        disabled
        variant="outlined"
        sx={{
          minWidth: 120,
          height: 40,
          borderColor: "#dbe2ea",
          color: "#a5afb9",
          textTransform: "none",
          fontWeight: 500,
          backgroundColor: "#fafbfd",
          boxShadow: "none",
          ml: lastOperationDate ? 1 : 0,
        }}
        startIcon={<SettingsOutlinedIcon />}
      >
        Настройки
      </Button>
    </Box>
  </Box>
);

const WarehouseAccountingToolbar = (props) => <WarehouseAccountingFiltersBar {...props} />;

export default WarehouseAccountingToolbar;
