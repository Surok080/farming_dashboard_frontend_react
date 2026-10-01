import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
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
  const [cultureMenuAnchor, setCultureMenuAnchor] = useState(null);
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
  const rightItems = items.filter((item) => selectedSet.has(item.id));

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

  const renderList = (list, checked, setChecked, emptyText) => (
    <List dense disablePadding>
      {list.length === 0 ? (
        <Typography sx={{ px: 1.5, py: 1, fontSize: 13, color: "#888", textAlign: "left" }}>{emptyText}</Typography>
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
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, mb: 1, flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", minWidth: 0 }}>
          <Typography sx={{ fontSize: 13, color: "#666", textAlign: "left" }}>
            {availableLabel}: {items.length - selectedIds.length}
            {availableArea != null ? ` (${availableArea.toLocaleString("ru-RU", { maximumFractionDigits: 1 })} га)` : ""}
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#666", textAlign: "left" }}>
            {selectedLabel}: {selectedIds.length}
            {selectedArea != null ? ` (${selectedArea.toLocaleString("ru-RU", { maximumFractionDigits: 1 })} га)` : ""}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", ml: "auto" }}>
          <TextField
            size="small"
            placeholder="Поиск"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            sx={{ width: 180 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {query ? (
                    <IconButton aria-label="Очистить поиск" size="small" onClick={() => setQuery("")} edge="end">
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  ) : (
                    <SearchIcon fontSize="small" />
                  )}
                </InputAdornment>
              ),
            }}
          />
          {enableCultureFilter ? (
            <>
              <IconButton
                aria-label="Фильтр по культуре"
                onClick={(event) => setCultureMenuAnchor(event.currentTarget)}
                sx={{ color: culture ? "#62A65D" : "#757575", border: "1px solid", borderColor: culture ? "#62A65D" : "#e0e0e0", borderRadius: 1 }}
              >
                <FilterAltOutlinedIcon fontSize="small" />
              </IconButton>
              {culture ? (
                <Chip
                  size="small"
                  label={culture}
                  onDelete={() => setCulture("")}
                  sx={{ maxWidth: 200 }}
                />
              ) : null}
            </>
          ) : null}
          <Menu
            anchorEl={cultureMenuAnchor}
            open={Boolean(cultureMenuAnchor)}
            onClose={() => setCultureMenuAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem
              selected={culture === ""}
              onClick={() => {
                setCulture("");
                setCultureMenuAnchor(null);
              }}
            >
              Все культуры
            </MenuItem>
            {cultures.map((name) => (
              <MenuItem
                key={name}
                selected={culture === name}
                onClick={() => {
                  setCulture(name);
                  setCultureMenuAnchor(null);
                }}
              >
                {name}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Box>
      <Box sx={{ display: "flex", gap: 1, alignItems: "stretch" }}>
        <Box sx={{ ...listBoxSx, display: "flex", flexDirection: "column" }}>
          <Typography sx={{ px: 1.5, py: 0.75, fontSize: 12, fontWeight: 700, color: "#333", textAlign: "left", borderBottom: "1px solid #eee" }}>
            Выбрано
          </Typography>
          {renderList(rightItems, rightChecked, setRightChecked, "Переместите выбранное сюда")}
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 1 }}>
          <IconButton
            aria-label="Переместить в выбранное"
            onClick={moveRight}
            disabled={leftChecked.length === 0}
            sx={{ backgroundColor: "#62A65D", color: "#fff", borderRadius: 1, "&:hover": { backgroundColor: "#4f8f4b" }, "&.Mui-disabled": { backgroundColor: "#e0e0e0" } }}
          >
            <ChevronLeftIcon />
          </IconButton>
          <IconButton
            aria-label="Вернуть в справочник"
            onClick={moveLeft}
            disabled={rightChecked.length === 0}
            sx={{ backgroundColor: "#9e9e9e", color: "#fff", borderRadius: 1, "&:hover": { backgroundColor: "#757575" }, "&.Mui-disabled": { backgroundColor: "#e0e0e0" } }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
        <Box sx={{ ...listBoxSx, display: "flex", flexDirection: "column" }}>
          <Typography sx={{ px: 1.5, py: 0.75, fontSize: 12, fontWeight: 700, color: "#333", textAlign: "left", borderBottom: "1px solid #eee" }}>
            Справочник
          </Typography>
          {renderList(leftItems, leftChecked, setLeftChecked, "В справочнике ничего не найдено")}
        </Box>
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
