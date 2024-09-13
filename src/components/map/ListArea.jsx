import {
  Box,
  Button,
  Checkbox,
  IconButton,
  List,
  ListItemButton,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

const ListArea = ({
  layer,
  setActiveArea,
  setDeleteIdArea,
  handleOpenConfirmDelete,
  state = false,
}) => {
  // State to track selected items
  const [selectedItems, setSelectedItems] = useState([]);

  // Handle individual checkbox toggle
  const handleToggle = (value) => {
    const currentIndex = selectedItems.indexOf(value);
    const newChecked = [...selectedItems];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setSelectedItems(newChecked);
  };

  // Handle select all checkboxes
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(layer.map((item) => item.properties.id));
    } else {
      setSelectedItems([]);
    }
  };

  // Check if all items are selected
  const isAllSelected = layer.length === selectedItems.length;

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 0,
        }}
      >
        <Box display={"flex"} gap={4} alignItems={"center"}>
          <Checkbox
            sx={{ padding: 0, marginLeft: "-2px" }}
            edge="end"
            onChange={handleSelectAll}
            checked={isAllSelected}
            inputProps={{ "aria-label": "select all areas" }}
          />
          <Typography variant="body">Выбрать все</Typography>
        </Box>
        <IconButton
            disabled={selectedItems?.length === 0}
          onClick={(e) => {
            e.stopPropagation();
            // e.preventDefault()
            setDeleteIdArea(selectedItems);
            handleOpenConfirmDelete();
          }}
        >
          <DeleteForeverIcon />
        </IconButton>
      </Box>
      <List
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          bgcolor: "background.paper",
        }}
      >
        {layer.map((item, index) => {
          const svgString = item.properties.svg.replace(
            'stroke-width="40"',
            'stroke-width="30"'
          );
          const labelId = `checkbox-list-label-${item.properties.id}`;

          return (
            <Box display={"flex"}>
              <Checkbox
                edge="start"
                checked={selectedItems.indexOf(item.properties.id) !== -1}
                tabIndex={-1}
                disableRipple
                inputProps={{ "aria-labelledby": labelId }}
                onChange={() => handleToggle(item.properties.id)}
              />
              <ListItemButton
                key={index}
                style={{
                  width: "100%",
                  display: "flex",
                  gap: "5px",
                  // height: "100px",
                  padding: "0",
                  justifyContent: "space-between",
                  "&:hover": {
                    backgroundColor: "blue",
                    color: "white",
                    "& .MuiListItemIcon-root": {
                      color: "white",
                    },
                  },
                }}
                onClick={() => {
                  setActiveArea(item);
                }}
              >
                <svg
                  style={{
                    width: "100%",
                    maxWidth: "70px",
                    height: "70px",
                  }}
                  dangerouslySetInnerHTML={{ __html: svgString }}
                />
                <Box display={"flex"} flexDirection={"column"} flexGrow={1}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: "bold", fontSize: "12px" }}
                  >
                    {state
                      ? item.properties.plot_сadastral_number
                      : item.properties.crop}
                  </Typography>
                  <Typography noWrap maxWidth={140} variant="caption">
                    {state
                      ? item.properties.plot_form_owner
                      : item.properties.crop_kind}
                  </Typography>
                  <Typography noWrap maxWidth={140} variant="caption">
                    {state
                      ? item.properties.plot_land_category
                      : item.properties.name}
                  </Typography>
                </Box>
                <Typography variant="caption">
                  {item.properties.area} га
                </Typography>
                <IconButton
                  disabled={selectedItems.indexOf(item.properties.id) !== -1}
                  onClick={(e) => {
                    e.stopPropagation();
                    // e.preventDefault()
                    setDeleteIdArea(item.properties.id);
                    handleOpenConfirmDelete();
                  }}
                >
                  <DeleteForeverIcon />
                </IconButton>
              </ListItemButton>
            </Box>
          );
        })}
      </List>
    </>
  );
};

export default ListArea;
