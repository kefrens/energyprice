import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_URL = "http://127.0.0.1:3000";
const API_KEY = "mysecretkey";

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const response = await axios.get(
      `${API_URL}/prices/history/1`,
      {
        headers: {
          "x-api-key": API_KEY,
        },
      }
    );

    const formatted = response.data.map((item) => ({
      date: new Date(item.validFrom).toISOString().split("T")[0],
      price: item.priceKwh,
    }));

    setData(formatted);
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>EDF Tempo – Price History</h2>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="price" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default App;