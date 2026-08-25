import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import zernoIcon from "../../../images/sclad/zerno.svg";
import udobrenieIcon from "../../../images/sclad/udobrenie.svg";
import szrIcon from "../../../images/sclad/szr.svg";
import kormaIcon from "../../../images/sclad/korma.svg";
import gsmIcon from "../../../images/sclad/gsm.svg";
import zapchastiIcon from "../../../images/sclad/zapchasti.svg";
import uslugiIcon from "../../../images/sclad/uslugi.svg";
import prochieIcon from "../../../images/sclad/prochie.svg";
import { formatMoney, formatQuantities } from "./warehouseAccountingUtils";

const getSectionAccent = (sectionName = "") => {
  const name = sectionName.toLowerCase();
  if (name.includes("зер") || name.includes("сем")) {
    return { color: "#f4b400", icon: zernoIcon };
  }
  if (name.includes("удобр")) {
    return { color: "#20b7d8", icon: udobrenieIcon };
  }
  if (name.includes("сзр")) {
    return { color: "#5cb85c", icon: szrIcon };
  }
  if (name.includes("корм")) {
    return { color: "#c49a6c", icon: kormaIcon };
  }
  if (name.includes("гсм") || name.includes("топлив")) {
    return { color: "#e57373", icon: gsmIcon };
  }
  if (name.includes("зап") || name.includes("материал")) {
    return { color: "#4db6ac", icon: zapchastiIcon };
  }
  if (name.includes("услуг")) {
    return { color: "#a88ceb", icon: uslugiIcon };
  }
  return { color: "#90a4ae", icon: prochieIcon };
};

const WarehouseAccountingSectionCards = ({ items = [], selectedIds = [], onToggle }) => {
  const cards = Array.isArray(items) ? items : [];
  if (!cards.length) return null;
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 1.5,
        mt: 1.5,
        alignItems: "stretch",
      }}
    >
      {cards.map((item) => {
        const selected = selectedIds.includes(item.section_id);
        const accent = getSectionAccent(item.section_name);
        return (
          <Paper
            key={item.section_id}
            onClick={() => onToggle(item.section_id)}
            variant="outlined"
            sx={{
              p: 1.25,
              width: 130,
              maxWidth: 130,
              flex: "0 0 130px",
              boxSizing: "border-box",
              cursor: "pointer",
              minHeight: 102,
              borderRadius: "8px",
              borderColor: selected ? accent.color : "#d9e0ea",
              backgroundColor: selected ? `${accent.color}12` : "#fff",
              boxShadow: "none",
              transition: "border-color .2s ease, background-color .2s ease",
              overflow: "hidden",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1, minWidth: 0 }}>
              <Box
                component="img"
                src={accent.icon}
                alt=""
                sx={{ width: 18, height: 18, flexShrink: 0, objectFit: "contain" }}
              />
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: 12,
                  color: accent.color,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {item.section_name}
              </Typography>
            </Box>
            <Typography
              sx={{
                fontSize: 11,
                color: "#555",
                minHeight: 32,
                mb: 0.75,
                wordBreak: "break-word",
              }}
            >
              {formatQuantities(item.closing_quantities)}
            </Typography>
            <Typography sx={{ fontWeight: 500, fontSize: 10, color: "#8a93a0" }}>Сумма</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: 13, color: "#394150", wordBreak: "break-word" }}>
              {formatMoney(item.closing_amount)}
            </Typography>
          </Paper>
        );
      })}
    </Box>
  );
};

export default WarehouseAccountingSectionCards;
