import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const API_BASE = "http://127.0.0.1:3000";
const API_KEY = "mysecretkey";

const POWER_COLORS = {
  P3: "#4f86c6",
  P6: "#f4a261",
  P9: "#2a9d8f",
  P12: "#e76f51",
};

const TARIFF_OPTIONS = [
  { code: "BASE", label: "Base" },
  { code: "HP", label: "Heure Pleine" },
  { code: "HC", label: "Heure Creuse" },
];

export default function SubscriptionPriceChart() {
  const [allPrices, setAllPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedTariff, setSelectedTariff] = useState("BASE");
  const [selectedPowers, setSelectedPowers] = useState(["P3", "P6", "P9", "P12"]);
  const [priceType, setPriceType] = useState("priceTtc");

  useEffect(() => {
    axios
      .get(`${API_BASE}/prices/subscriptions`, {
        headers: { "x-api-key": API_KEY },
      })
      .then((res) => {
        setAllPrices(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Derive available powers and suppliers from data
  const availablePowers = useMemo(() => {
    const codes = [...new Set(allPrices.map((p) => p.meterPower?.code).filter(Boolean))];
    codes.sort();
    return codes;
  }, [allPrices]);

  // Build chart data: one bar group per offer, one bar per selected power
  const chartData = useMemo(() => {
    const filtered = allPrices.filter(
      (p) =>
        p.tariffType?.code === selectedTariff &&
        selectedPowers.includes(p.meterPower?.code)
    );

    // Group by offer label
    const offerMap = {};
    filtered.forEach((p) => {
      const offerLabel = `${p.offerOption?.offer?.supplier?.name ?? ""} – ${p.offerOption?.offer?.name ?? ""}`;
      if (!offerMap[offerLabel]) {
        offerMap[offerLabel] = { name: offerLabel };
      }
      const powerCode = p.meterPower?.code;
      if (powerCode) {
        // Keep the latest entry (data is ordered by startDate desc)
        if (!offerMap[offerLabel][powerCode]) {
          offerMap[offerLabel][powerCode] = parseFloat(p[priceType]?.toFixed(2));
        }
      }
    });

    return Object.values(offerMap).sort((a, b) => a.name.localeCompare(b.name));
  }, [allPrices, selectedTariff, selectedPowers, priceType]);

  function togglePower(code) {
    setSelectedPowers((prev) =>
      prev.includes(code) ? prev.filter((p) => p !== code) : [...prev, code]
    );
  }

  if (loading) return <p>Loading subscription prices…</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div style={{ margin: "2rem 0" }}>
      <h2>Subscription Prices by Supplier</h2>

      {/* Filters */}
      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginBottom: "1.5rem", alignItems: "flex-start" }}>
        {/* Tariff type */}
        <div>
          <strong>Tariff type</strong>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.4rem" }}>
            {TARIFF_OPTIONS.map((t) => (
              <button
                key={t.code}
                onClick={() => setSelectedTariff(t.code)}
                style={{
                  padding: "4px 12px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  background: selectedTariff === t.code ? "#4f86c6" : "#f5f5f5",
                  color: selectedTariff === t.code ? "#fff" : "#333",
                  cursor: "pointer",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Meter powers */}
        <div>
          <strong>Meter power (kVA)</strong>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.4rem" }}>
            {availablePowers.map((code) => (
              <label key={code} style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={selectedPowers.includes(code)}
                  onChange={() => togglePower(code)}
                />
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: "3px",
                    background: POWER_COLORS[code] ?? "#999",
                    color: "#fff",
                    fontSize: "0.85rem",
                  }}
                >
                  {code}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Price type */}
        <div>
          <strong>Price</strong>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.4rem" }}>
            {[
              { value: "priceTtc", label: "TTC" },
              { value: "priceHt", label: "HT" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPriceType(opt.value)}
                style={{
                  padding: "4px 12px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  background: priceType === opt.value ? "#2a9d8f" : "#f5f5f5",
                  color: priceType === opt.value ? "#fff" : "#333",
                  cursor: "pointer",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      {chartData.length === 0 ? (
        <p>No data for selected filters.</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-35}
              textAnchor="end"
              interval={0}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tickFormatter={(v) => `${v} €`}
              label={{ value: `€/year (${priceType === "priceTtc" ? "TTC" : "HT"})`, angle: -90, position: "insideLeft", offset: 10 }}
            />
            <Tooltip formatter={(value) => [`${value} €`, undefined]} />
            <Legend verticalAlign="top" />
            {selectedPowers.map((code) => {
              const powerEntry = allPrices.find((p) => p.meterPower?.code === code)?.meterPower;
              const label = powerEntry ? `${code} – ${powerEntry.kva} kVA` : code;
              return (
                <Bar
                  key={code}
                  dataKey={code}
                  name={label}
                  fill={POWER_COLORS[code] ?? "#999"}
                  radius={[3, 3, 0, 0]}
                />
              );
            })}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
