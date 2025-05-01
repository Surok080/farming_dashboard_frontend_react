import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { TehMapApi } from "../../../api/tehMap";
import CulturalList from "./CulturalList";
import { CheckBox } from "@mui/icons-material";

const LeftBlockPlanFact = ({ year, data, setData }) => {
  const [checked, setChecked] = useState([]);
  const [checkedAll, setCheckedAll] = useState(false);
  const [dataCulture, setDataCulture] = useState([]);

  useEffect(() => {
    TehMapApi.getPlanFact(year).then((res) => {
      setDataCulture(res.data);
    });
  }, [year]);

  useEffect(() => {
    TehMapApi.getPlanFactCultureInfo(year, checked).then((res) => {
      setData(res.data);
    });
  }, [checked]);

  return (
    <Box display={"flex"} flexDirection={"column"} gap={1} maxHeight={"100%"}>
      <Box
        sx={{
          background: "#F9F9F9",
          border: "1px solid #bfbfbf",
          borderRadius: "4px",
          height: "100%",
          overflowY: "scroll",
          padding: 0,
          flexDirection: "column",
        }}
        display={"flex"}
        p={2}
      >
        <Box display={"flex"} flexDirection={"column"} gap={1}>
          <CulturalList
            data={dataCulture}
            checked={checked}
            setChecked={setChecked}
          />
          <Button
            disabled={checked.length < 1}
            onClick={() => {
              setChecked([]);
            }}
          >
            Отменить выбор
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default LeftBlockPlanFact;
