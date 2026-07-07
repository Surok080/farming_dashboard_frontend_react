import React from "react";
import {
    Box,
    Button,
    CircularProgress,
    DialogContent,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material";
import {formatNumberForDisplay, formatPeriodRangeDisplay} from "./monitoringUtils";
import MonitoringFieldTrackMap from "./MonitoringFieldTrackMap";

const MonitoringRowDialogContent = ({
                                        loading,
                                        row,
                                        canEditStatus,
                                        operations,
                                        trailers,
                                        drivers,
                                        onTechOperationChange,
                                        onTrailerChange,
                                        onDriverChange,
                                        onSave,
                                        saveLoading,
                                        onClose,
                                    }) => {
    const missingOptionsOutlineSx = {
        "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(255, 187, 40, .5)",
            borderWidth: 1,
        },
    };
    const isTechOperationMissing = canEditStatus && !row?.tech_operation_id;
    const isTrailerMissing = canEditStatus && !row?.trailer_id;
    const isDriverMissing = canEditStatus && !row?.driver_id;

    const areaFmt = row ? formatNumberForDisplay(row.area, 3) : null;
    const trailerWidthFmt = row ? formatNumberForDisplay(row.trailer_width, 3) : null;
    const fuelFmt = row ? formatNumberForDisplay(row.fuel, 3) : null;
    const durationFmt = row ? formatNumberForDisplay(row.duration_hours, 3) : null;
    const areaWorkedFmt = row ? formatNumberForDisplay(row.area_worked, 3) : null;
    const periodRangeDisplay = row ? formatPeriodRangeDisplay(row.period_start, row.period_stop) : "";

    return (
        <DialogContent sx={{ pt: 1 }}>
            {loading ? (
                <Box sx={{py: 6, display: "flex", justifyContent: "center"}}>
                    <CircularProgress/>
                </Box>
            ) : row ? (
                <Box sx={{display: "flex", flexDirection: "column", gap: 2}}>
                    {row.is_created_by_merge ? (
                        <Box
                            sx={{
                                border: "1px solid #90caf9",
                                borderRadius: 1,
                                px: 1.5,
                                py: 1,
                                backgroundColor: "#e3f2fd",
                            }}
                        >
                            <Typography variant="body2" sx={{fontWeight: 600, color: "#1565c0"}}>
                                Поле состоит из объединённых полей
                            </Typography>
                        </Box>
                    ) : null}
                    <Box sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                        gap: 2,
                        pt: 1
                    }}>
                        <TextField disabled size="small" label="Период"
                                   value={periodRangeDisplay === "—" ? "" : periodRangeDisplay}
                                   InputLabelProps={{shrink: true}}/>
                        <TextField
                            disabled
                            size="small"
                            label="Расход (л)"
                            value={fuelFmt?.display === "—" ? "" : fuelFmt?.display ?? ""}
                            InputLabelProps={{shrink: true}}
                            inputProps={{title: fuelFmt?.hasTooltip ? fuelFmt.full : undefined}}
                        />
                        <TextField
                            disabled
                            size="small"
                            label="Моточасы"
                            value={durationFmt?.display === "—" ? "" : durationFmt?.display ?? ""}
                            InputLabelProps={{shrink: true}}
                            inputProps={{title: durationFmt?.hasTooltip ? durationFmt.full : undefined}}
                        />
                        <TextField
                            disabled
                            size="small"
                            label="Выработка, га"
                            value={areaWorkedFmt?.display === "—" ? "" : areaWorkedFmt?.display ?? ""}
                            InputLabelProps={{shrink: true}}
                            inputProps={{title: areaWorkedFmt?.hasTooltip ? areaWorkedFmt.full : undefined}}
                            sx={{"& .MuiOutlinedInput-notchedOutline": {borderWidth: 1}}}
                        />
                    </Box>

                    <Divider/>

                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "column", md: "row" },
                            gap: 2,
                            alignItems: { xs: "stretch", md: "flex-start" },
                        }}
                    >
                        <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                            {row.equipment_name ? (
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {row.equipment_name}
                                </Typography>
                            ) : null}
                            <Typography variant="h6" sx={{fontWeight: 700}}>
                                Работа в агрозоне
                            </Typography>
                            <Box sx={{display: "grid", gridTemplateColumns: "repeat(3, minmax(160px, 1fr))", gap: 2}}>
                                <TextField disabled size="small" label="Геозона, поле" value={row.field_name ?? ""}
                                           InputLabelProps={{shrink: true}}/>
                                <TextField disabled size="small" label="Культура" value={row.culture_name ?? ""}
                                           InputLabelProps={{shrink: true}}/>
                                <TextField
                                    disabled
                                    size="small"
                                    label="Площадь, га"
                                    value={areaFmt?.display === "—" ? "" : areaFmt?.display ?? ""}
                                    InputLabelProps={{shrink: true}}
                                    inputProps={{title: areaFmt?.hasTooltip ? areaFmt.full : undefined}}
                                />
                            </Box>

                            <Typography variant="h6" sx={{fontWeight: 700}}>
                                Движение
                            </Typography>
                            <Box sx={{display: "grid", gridTemplateColumns: "repeat(3, minmax(160px, 1fr))", gap: 2}}>
                                <FormControl size="small" sx={isTechOperationMissing ? missingOptionsOutlineSx : undefined}>
                                    <InputLabel id="dlg-tech-op-label">Техоперация</InputLabel>
                                    <Select
                                        disabled={!canEditStatus}
                                        labelId="dlg-tech-op-label"
                                        label="Техоперация"
                                        value={row.tech_operation_id ?? ""}
                                        onChange={onTechOperationChange}
                                    >
                                        {operations.map((o) => (
                                            <MenuItem key={o.id} value={o.id}>
                                                {o.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl size="small" sx={isTrailerMissing ? missingOptionsOutlineSx : undefined}>
                                    <InputLabel id="dlg-trailer-label">Прицепное устройство</InputLabel>
                                    <Select
                                        disabled={!canEditStatus}
                                        labelId="dlg-trailer-label"
                                        label="Прицепное устройство"
                                        value={row.trailer_id ?? ""}
                                        onChange={onTrailerChange}
                                    >
                                        {trailers.map((t) => (
                                            <MenuItem key={t.id} value={t.id}>
                                                {t.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <TextField
                                    disabled
                                    size="small"
                                    label="Ширина, м"
                                    value={trailerWidthFmt?.display === "—" ? "" : trailerWidthFmt?.display ?? ""}
                                    InputLabelProps={{shrink: true}}
                                    inputProps={{title: trailerWidthFmt?.hasTooltip ? trailerWidthFmt.full : undefined}}
                                />
                            </Box>

                            <Typography variant="h6" sx={{fontWeight: 700}}>
                                Водитель, тракторист-машинист
                            </Typography>
                            <Box sx={{width: { xs: "100%", sm: 300 }, maxWidth: "100%"}}>
                                <FormControl size="small" fullWidth sx={isDriverMissing ? missingOptionsOutlineSx : undefined}>
                                    <InputLabel id="dlg-driver-label">Водитель</InputLabel>
                                    <Select
                                        disabled={!canEditStatus}
                                        labelId="dlg-driver-label"
                                        label="Водитель"
                                        value={row.driver_id ?? ""}
                                        onChange={onDriverChange}
                                    >
                                        {drivers.map((d) => (
                                            <MenuItem key={d.id} value={d.id}>
                                                {d.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        </Box>

                        <Box sx={{ width: { xs: "100%", md: 280 }, flexShrink: 0 }}>
                            <MonitoringFieldTrackMap
                                geometry={row.field_geometry_json}
                                trackPoints={row.track_points}
                            />
                        </Box>
                    </Box>

                    <Box sx={{display: "flex", justifyContent: "flex-end", gap: 1}}>
                        <Button
                            variant="contained"
                            onClick={onSave}
                            disabled={saveLoading || !canEditStatus}
                            startIcon={saveLoading ? <CircularProgress size={16} color="inherit"/> : null}
                            sx={{backgroundColor: "#62A65D"}}
                        >
                            Сохранить
                        </Button>
                        <Button variant="outlined" onClick={onClose}>
                            Отмена
                        </Button>
                    </Box>
                </Box>
            ) : (
                <Typography color="text.secondary">Нет данных по выбранной строке.</Typography>
            )}
        </DialogContent>
    );
};

export default MonitoringRowDialogContent;
