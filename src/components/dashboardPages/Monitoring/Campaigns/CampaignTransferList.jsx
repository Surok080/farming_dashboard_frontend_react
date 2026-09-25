import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const listBoxSx = {
  flex: 1,
  minWidth: 0,
  border: "1px solid #e0e0e0",
  borderRadius: 1,
  height: 280,
  overflow: "auto",
  backgroundColor: "#fff",
};

const matchesQuery = (item, query) => {
  if (!query) return true;
  return item.label.toLowerCase().includes(query.trim().toLowerCase());
};

const CampaignTransferList = ({
  items,
  selectedIds,
  onChange,
  availableLabel,
  selectedLabel,
  enableCultureFilter = false,
}) => {
  const [query, setQuery] = useState("");
  const [culture, setCulture] = useState("");
  const [leftChecked, setLeftChecked] = useState([]);
  const [rightChecked, setRightChecked] = useState([]);

  const cultures = useMemo(() => {
    const names = new Set(items.map((item) => item.culture).filter(Boolean));
    return Array.from(names).sort((a, b) => a.localeCompare(b, "ru"));
  }, [items]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        if (enableCultureFilter && culture && item.culture !== culture) return false;
        return matchesQuery(item, query);
      }),
    [culture, enableCultureFilter, items, query]
  );

  const leftItems = filtered.filter((item) => !selectedSet.has(item.id));
  const rightItems = items.filter((item) => selectedSet.has(item.id) && matchesQuery(item, query));

  const areaSum = (list) => list.reduce((sum, item) => sum + (Number(item.area) || 0), 0);

  const toggle = (checked, setChecked, id) => {
    setChecked(checked.includes(id) ? checked.filter((value) => value !== id) : [...checked, id]);
  };

  const moveRight = () => {
    const next = new Set(selectedIds);
    leftChecked.forEach((id) => next.add(id));
    onChange(Array.from(next));
    setLeftChecked([]);
  };

  const moveLeft = () => {
    const remove = new Set(rightChecked);
    onChange(selectedIds.filter((id) => !remove.has(id)));
    setRightChecked([]);
  };

  const renderList = (list, checked, setChecked) => (
    <List dense disablePadding>
      {list.length === 0 ? (
        <Typography sx={{ px: 1.5, py: 1, fontSize: 13, color: "#888" }}>Ничего не найдено</Typography>
      ) : (
        list.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton dense onClick={() => toggle(checked, setChecked, item.id)}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Checkbox
                  edge="start"
                  size="small"
                  checked={checked.includes(item.id)}
                  tabIndex={-1}
                  disableRipple
                  sx={{ color: "#62A65D", "&.Mui-checked": { color: "#62A65D" } }}
                />
              </ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 13 }} />
            </ListItemButton>
          </ListItem>
        ))
      )}
    </List>
  );

  const availableArea = enableCultureFilter ? areaSum(items.filter((item) => !selectedSet.has(item.id))) : null;
  const selectedArea = enableCultureFilter ? areaSum(items.filter((item) => selectedSet.has(item.id))) : null;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, mb: 1, flexWrap: "wrap" }}>
        <Typography sx={{ fontSize: 13, color: "#666" }}>
          {availableLabel}: {items.length - selectedIds.length}
          {availableArea != null ? ` (${availableArea.toLocaleString("ru-RU", { maximumFractionDigits: 1 })} га)` : ""}
        </Typography>
        <Typography sx={{ fontSize: 13, color: "#666" }}>
          {selectedLabel}: {selectedIds.length}
          {selectedArea != null ? ` (${selectedArea.toLocaleString("ru-RU", { maximumFractionDigits: 1 })} га)` : ""}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}>
        <TextField
          size="small"
          placeholder="Поиск"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          sx={{ flex: 1, minWidth: 160 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        {enableCultureFilter ? (
          <TextField
            select
            size="small"
            label="Культура"
            value={culture}
            onChange={(event) => setCulture(event.target.value)}
            sx={{ minWidth: 180 }}
            InputLabelProps={{ shrink: true }}
          >
            <MenuItem value="">Все</MenuItem>
            {cultures.map((name) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </TextField>
        ) : null}
      </Box>
      <Box sx={{ display: "flex", gap: 1, alignItems: "stretch" }}>
        <Box sx={listBoxSx}>{renderList(leftItems, leftChecked, setLeftChecked)}</Box>
        <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 1 }}>
          <IconButton
            onClick={moveRight}
            disabled={leftChecked.length === 0}
            sx={{ backgroundColor: "#62A65D", color: "#fff", borderRadius: 1, "&:hover": { backgroundColor: "#4f8f4b" }, "&.Mui-disabled": { backgroundColor: "#e0e0e0" } }}
          >
            <ChevronRightIcon />
          </IconButton>
          <IconButton
            onClick={moveLeft}
            disabled={rightChecked.length === 0}
            sx={{ backgroundColor: "#9e9e9e", color: "#fff", borderRadius: 1, "&:hover": { backgroundColor: "#757575" }, "&.Mui-disabled": { backgroundColor: "#e0e0e0" } }}
          >
            <ChevronLeftIcon />
          </IconButton>
        </Box>
        <Box sx={listBoxSx}>{renderList(rightItems, rightChecked, setRightChecked)}</Box>
      </Box>
      {enableCultureFilter ? (
        <Button
          size="small"
          sx={{ mt: 0.5, color: "#62A65D", textTransform: "none" }}
          onClick={() => setLeftChecked(leftItems.map((item) => item.id))}
          disabled={leftItems.length === 0}
        >
          Выделить все
        </Button>
      ) : null}
    </Box>
  );
};

export default CampaignTransferList;
