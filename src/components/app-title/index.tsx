import React from "react";
import { Typography } from "antd";

const { Title } = Typography;

export const AppTitle: React.FC<{ collapsed: boolean }> = ({ collapsed }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        padding: collapsed ? "12px 0" : "12px 16px",
        height: "64px",
      }}
    >
      {!collapsed && (
        <Title
          level={4}
          style={{
            margin: 0,
            color: "#003478",
            fontWeight: 700,
            fontSize: "18px",
          }}
        >
          Ebook Ford
        </Title>
      )}
      {collapsed && (
        <Title
          level={4}
          style={{
            margin: 0,
            color: "#003478",
            fontWeight: 700,
            fontSize: "16px",
          }}
        >
          EF
        </Title>
      )}
    </div>
  );
};
