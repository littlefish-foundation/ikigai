import React from "react";
import { Card, Space } from "antd";
import useSheetData from "../../../hooks/getSheetData";

const ValuesCard = (props) => {
  const values = props.values;

  // Split the experience string at each comma and map over the resulting array
  const ValuesList = values?.split(",").map((values, index) => {
    // Trim any leading or trailing whitespace from the experience
    const trimmedValues = values.trim();
    // Create a new p element for each experience
    return <p key={index}>{trimmedValues}</p>;
  });

  return (
    <Space direction="vertical" size={16}>
      <Card
        title="Values"
        style={{
          width: 300,
          height: "auto",
          background: "rgb(70, 76, 69)",
          opacity: 0.9,

          top: -2350,
          left: 2400,
          color: "#ffffff",
          fontSize: "30px",
        }}
      >
        {ValuesList}
      </Card>
    </Space>
  );
};

export default ValuesCard;