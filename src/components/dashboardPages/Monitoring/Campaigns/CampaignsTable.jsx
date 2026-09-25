import React from "react";
import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { CAMPAIGN_STATUS_LABEL, formatCampaignDate, formatCampaignNumber } from "./campaignUtils";

const headCellSx = { fontWeight: 700, fontSize: 12, whiteSpace: "nowrap", borderBottom: "1px solid #e0e0e0" };
const cellSx = { fontSize: 13, verticalAlign: "top" };

const unitLines = (row) => {
  const trailers = Array.isArray(row.trailers) ? row.trailers : [];
  const drivers = Array.isArray(row.drivers) ? row.drivers : [];
  const count = Math.max(trailers.length, drivers.length, 1);
  return Array.from({ length: count }, (_, index) => ({
    trailer: trailers[index]?.name || "—",
    width: trailers[index]?.width,
    driver: drivers[index] || "—",
  }));
};

const CampaignsTable = ({ campaigns, expandedIds, onToggle, onDelete }) => {
  if (campaigns.length === 0) {
    return (
      <Typography sx={{ py: 2, color: "#666", fontSize: 14 }}>
        Кампаний пока нет. Нажмите «Создать».
      </Typography>
    );
  }

  return (
    <Table size="small" sx={{ minWidth: 960 }}>
      <TableHead>
        <TableRow>
          <TableCell sx={{ ...headCellSx, width: 40 }} />
          <TableCell sx={headCellSx}>Наименование</TableCell>
          <TableCell sx={headCellSx}>Тех. операция</TableCell>
          <TableCell sx={headCellSx}>Интервал</TableCell>
          <TableCell sx={headCellSx}>Кол-во полей</TableCell>
          <TableCell sx={headCellSx}>Площадь выработки</TableCell>
          <TableCell sx={headCellSx}>Выполнено, га (%)</TableCell>
          <TableCell sx={{ ...headCellSx, width: 48 }} />
        </TableRow>
      </TableHead>
      <TableBody>
        {campaigns.map((campaign) => {
          const expanded = expandedIds.has(campaign.id);
          const rows = Array.isArray(campaign.rows) ? campaign.rows : [];
          return (
            <React.Fragment key={campaign.id}>
              <TableRow hover>
                <TableCell sx={cellSx}>
                  <IconButton size="small" onClick={() => onToggle(campaign.id)} aria-label="Показать строки">
                    {expanded ? <KeyboardArrowDownIcon fontSize="small" /> : <KeyboardArrowRightIcon fontSize="small" />}
                  </IconButton>
                </TableCell>
                <TableCell sx={cellSx}>
                  <Box>{campaign.name}</Box>
                  <Typography sx={{ fontSize: 12, color: "#888" }}>
                    {CAMPAIGN_STATUS_LABEL[campaign.status] || campaign.status}
                  </Typography>
                </TableCell>
                <TableCell sx={cellSx}>{campaign.tech_operation_name || "—"}</TableCell>
                <TableCell sx={{ ...cellSx, whiteSpace: "nowrap" }}>
                  {formatCampaignDate(campaign.date_start)} - {formatCampaignDate(campaign.date_stop)}
                </TableCell>
                <TableCell sx={cellSx}>{campaign.fields_count ?? "—"}</TableCell>
                <TableCell sx={cellSx}>{formatCampaignNumber(campaign.plan_area, 1)} га</TableCell>
                <TableCell sx={{ ...cellSx, whiteSpace: "nowrap" }}>
                  {formatCampaignNumber(campaign.fact_area, 2)} га ({formatCampaignNumber(campaign.fact_percent, 2)}%)
                </TableCell>
                <TableCell sx={cellSx}>
                  <IconButton size="small" color="error" onClick={() => onDelete(campaign)} aria-label="Удалить кампанию">
                    <RemoveCircleOutlineIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
              {expanded ? (
                rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ fontSize: 13, color: "#777", pl: 7 }}>
                      Данных о выполнении пока нет. Сбор начнётся с даты старта кампании.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row, index) => (
                    <TableRow key={`${campaign.id}-${row.field_id}-${row.work_date}-${index}`} sx={{ backgroundColor: "#fafafa" }}>
                      <TableCell />
                      <TableCell sx={cellSx}>{formatCampaignDate(row.work_date)}</TableCell>
                      <TableCell sx={cellSx}>{row.field_name}</TableCell>
                      <TableCell sx={cellSx}>
                        {unitLines(row).map((unit, unitIndex) => (
                          <Box key={`trailer-${unitIndex}`}>{unit.trailer}</Box>
                        ))}
                      </TableCell>
                      <TableCell sx={cellSx}>
                        {unitLines(row).map((unit, unitIndex) => (
                          <Box key={`width-${unitIndex}`}>{formatCampaignNumber(unit.width, 1)}</Box>
                        ))}
                      </TableCell>
                      <TableCell sx={{ ...cellSx, color: "#d32f2f" }}>{row.tech_operation_name}</TableCell>
                      <TableCell sx={cellSx}>
                        {unitLines(row).map((unit, unitIndex) => (
                          <Box key={`driver-${unitIndex}`}>{unit.driver}</Box>
                        ))}
                      </TableCell>
                      <TableCell sx={cellSx}>
                        {formatCampaignNumber(row.area_worked, 2)} / {formatCampaignNumber(row.cumulative_area, 2)} (
                        {formatCampaignNumber(row.cumulative_percent, 2)}%)
                      </TableCell>
                    </TableRow>
                  ))
                )
              ) : null}
            </React.Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default CampaignsTable;
