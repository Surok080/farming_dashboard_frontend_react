import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

const LeftBlockPlan = () => {
  const [age, setAge] = useState("");

  const handleChange = (event) => {
    setAge(event.target.value);
  };
  return (
    <Box display={"flex"} flexDirection={"column"} gap={1}>
      <FormControl
        sx={{ background: "#F9F9F9", borderRadius: "4px" }}
        fullWidth
      >
        <InputLabel id="demo-simple-select-label">Выберите культуру</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={age}
          label="Выберите культуру"
          onChange={handleChange}
        >
          <MenuItem value={10}>Ячмень яровой</MenuItem>
          <MenuItem value={20}>Ячмень не яровой</MenuItem>
          <MenuItem value={30}>Ячмень очень яровой</MenuItem>
        </Select>
      </FormControl>
      <Box
        sx={{
          background: "#F9F9F9",
          border: "1px solid #bfbfbf",
          borderRadius: "4px",
        }}
        display={"flex"}
        p={2}
      >
        <Box width={"50%"} gap={2} display={'flex'} flexDirection={'column'}>
          <Typography variant="h6">Площадь</Typography>
          <Typography sx={{fontWeight: 'bold', color: '#62A65D'}} variant="h5">2050.10 га</Typography>
        </Box>
        <Box width={"50%"} gap={2} display={'flex'} flexDirection={'column'}>
          <Typography variant="h6">Кол-во полей</Typography>
          <Typography sx={{fontWeight: 'bold', color: '#62A65D'}} variant="h5">15</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default LeftBlockPlan;
