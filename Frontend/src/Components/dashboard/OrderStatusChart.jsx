import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const data = [
  { name: "Jan", Orders: 120, Sales: 100, Returns: 10 },
  { name: "Feb", Orders: 150, Sales: 130, Returns: 5 },
  { name: "Mar", Orders: 170, Sales: 160, Returns: 8 },
  { name: "Apr", Orders: 140, Sales: 120, Returns: 12 },
  { name: "May", Orders: 200, Sales: 180, Returns: 15 },
  { name: "Jun", Orders: 160, Sales: 150, Returns: 9 },
  { name: "Jul", Orders: 180, Sales: 170, Returns: 7 },
  { name: "Aug", Orders: 190, Sales: 175, Returns: 6 },
  { name: "Sep", Orders: 170, Sales: 160, Returns: 10 },
  { name: "Oct", Orders: 210, Sales: 195, Returns: 4 },
  { name: "Nov", Orders: 220, Sales: 200, Returns: 6 },
  { name: "Dec", Orders: 250, Sales: 230, Returns: 11 },
];

const OrderStatusChart = ({ isLoading }) => {
  return (
    <div className="bg-white rounded-lg p-5">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Order Status</h2>
      {isLoading ? (
        <Skeleton height={300} />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                border: "none",
              }}
            />
            <Legend />
            <Bar dataKey="Orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Sales" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Returns" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default OrderStatusChart;