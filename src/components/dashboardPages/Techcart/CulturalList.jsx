import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  IconButton,
  Collapse,
  Box,
  Typography,
  Paper,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

const CulturalTable = ({ data, checked, setChecked }) => {
  const [expanded, setExpanded] = useState([]);

  const handleToggle = (id) => {
    const newChecked = checked.includes(id)
      ? checked.filter((item) => item !== id)
      : [...checked, id];
    setChecked(newChecked);
  };

  const handleExpand = (id) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const renderRow = (node, level = 0, isChild = false) => (
    <React.Fragment key={node.id}>
      <TableRow>
        <TableCell sx={{ width: 30, p: 1, pr: 0 }}>
          {node.children && (
            <IconButton
              sx={{ p: 0 }}
              size="small"
              onClick={() => handleExpand(node.id)}
            >
              {expanded.includes(node.id) ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          )}
        </TableCell>

        <TableCell sx={{ width: 30, p: 1, pr: 0 }}>
          {!isChild && (
            <Checkbox
              sx={{ p: 1 }}
              checked={checked.includes(node.id)}
              onChange={() => handleToggle(node.id)}
            />
          )}
        </TableCell>

        <TableCell
          sx={{
            p: 2,
            fontWeight: !isChild ? "bold" : "normal",
            pl: isChild ? 0 : 2, // Добавляем отступ только для дочерних элементов
          }}
        >
          {node.culture}
        </TableCell>

        <TableCell
          align="right"
          sx={{
            color: "text.secondary",
            fontWeight: !isChild ? "bold" : "normal",
            p: 2,
          }}
        >
          {node.total_count ?? "-"}
        </TableCell>

        <TableCell
          align="right"
          sx={{
            color: "text.secondary",
            fontWeight: !isChild ? "bold" : "normal",
            p: 2,
          }}
        >
          {node.total_area ?? "-"}
        </TableCell>
      </TableRow>

      {node.children && (
        <TableRow>
          <TableCell colSpan={5} sx={{ p: 0 }}>
            <Collapse in={expanded.includes(node.id)}>
              <Box
                sx={{
                  ml: 2, // Добавляем отступ для всей вложенной таблицы
                  width: "calc(100% - 16px)", // Компенсируем отступ
                }}
              >
                <Table
                  size="small"
                  sx={{
                    width: "100%",
                    tableLayout: "fixed", // Фиксируем layout таблицы
                  }}
                >
                  <TableBody>
                    {node.children.map((child) =>
                      renderRow(child, level + 1, true)
                    )}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );

  return (
    <TableContainer component={Paper}>
      <Table sx={{ tableLayout: "fixed" }}>
        <colgroup>
          <col style={{ width: "30px" }} />
          <col style={{ width: "30px" }} />
          <col style={{ width: "40%" }} />
          <col style={{ width: "30%" }} />
          <col style={{ width: "30%" }} />
        </colgroup>
        <TableHead>
          <TableRow
            sx={{ background: "#62A65D"}}
          >
            <TableCell sx={{ width: 30 }}></TableCell>
            <TableCell sx={{ width: 30 }}></TableCell>
            <TableCell sx={{ color: "white", fontWeight: 700, borderRight: '1px solid black' }}>Культура</TableCell>
            <TableCell sx={{ color: "white", fontWeight: 700, borderRight: '1px solid black' }} align="center">Кол-во полей</TableCell>
            <TableCell sx={{ color: "white", fontWeight: 700 }} align="center">Общая площадь (га)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{data.map((node) => renderRow(node))}</TableBody>
      </Table>
    </TableContainer>
  );
};

export default CulturalTable;
