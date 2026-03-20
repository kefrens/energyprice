import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const API_URL = "http://127.0.0.1:3000";
const API_KEY = "mysecretkey";
const MAX_SERIES = 12;
const CHART_COLORS = [
  "#0f766e",
  "#f97316",
  "#2563eb",
  "#dc2626",
  "#7c3aed",
  "#059669",
  "#d97706",
  "#0891b2",
  "#be185d",
  "#4f46e5",
  "#65a30d",
  "#b45309",
];

function getSelectedValues(event) {
  return Array.from(event.target.selectedOptions, (option) => option.value);
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString();
}

function formatCurrency(value) {
  return `${Number(value ?? 0).toFixed(2)} €`;
}

function buildSeriesLabel(row) {
  return [
    row.supplierName,
    row.offerName,
    row.optionName,
    row.tariffCode,
    row.powerCode,
    row.componentCode,
  ]
    .filter(Boolean)
    .join(" / ");
}

export default function PriceDetailsPage({ onBack }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [selectedOffers, setSelectedOffers] = useState([]);
  const [selectedTariffs, setSelectedTariffs] = useState([]);
  const [selectedPowers, setSelectedPowers] = useState([]);
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [priceMetric, setPriceMetric] = useState("priceTtc");

  useEffect(() => {
    let cancelled = false;

    async function fetchCatalog() {
      setLoading(true);
      setError("");

      try {
        const response = await axios.get(`${API_URL}/admin/prices/catalog`, {
          headers: { "x-api-key": API_KEY },
        });

        if (!cancelled) {
          setRows(response.data);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.response?.data?.error || requestError.message || "Error loading price catalog");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchCatalog();

    return () => {
      cancelled = true;
    };
  }, []);

  const flatRows = useMemo(
    () =>
      rows.map((row) => ({
        id: row.id,
        supplierId: String(row.offerOption?.offer?.supplier?.id ?? ""),
        supplierCode: row.offerOption?.offer?.supplier?.code ?? "",
        supplierName: row.offerOption?.offer?.supplier?.name ?? "Unknown supplier",
        offerId: String(row.offerOption?.offer?.id ?? ""),
        offerCode: row.offerOption?.offer?.code ?? "",
        offerName: row.offerOption?.offer?.name ?? "Unknown offer",
        optionName: row.offerOption?.name ?? "",
        optionCode: row.offerOption?.code ?? "",
        tariffId: String(row.tariffType?.id ?? ""),
        tariffCode: row.tariffType?.code ?? "",
        tariffLabel: row.tariffType?.label ?? "",
        powerId: String(row.meterPower?.id ?? ""),
        powerCode: row.meterPower?.code ?? "",
        powerKva: row.meterPower?.kva ?? null,
        componentId: String(row.component?.id ?? ""),
        componentCode: row.component?.code ?? "",
        componentLabel: row.component?.label ?? "",
        priceHt: row.priceHt,
        priceTtc: row.priceTtc,
        startDate: row.startDate,
        endDate: row.endDate,
      })),
    [rows],
  );

  const supplierOptions = useMemo(() => {
    const map = new Map();

    flatRows.forEach((row) => {
      if (row.supplierId && !map.has(row.supplierId)) {
        map.set(row.supplierId, { value: row.supplierId, label: row.supplierName });
      }
    });

    return Array.from(map.values()).sort((left, right) => left.label.localeCompare(right.label));
  }, [flatRows]);

  const offerOptions = useMemo(() => {
    const map = new Map();

    flatRows.forEach((row) => {
      if (row.offerId && !map.has(row.offerId)) {
        map.set(row.offerId, {
          value: row.offerId,
          label: `${row.offerName} (${row.supplierName})`,
        });
      }
    });

    return Array.from(map.values()).sort((left, right) => left.label.localeCompare(right.label));
  }, [flatRows]);

  const tariffOptions = useMemo(() => {
    const map = new Map();

    flatRows.forEach((row) => {
      if (row.tariffId && !map.has(row.tariffId)) {
        map.set(row.tariffId, {
          value: row.tariffId,
          label: row.tariffLabel || row.tariffCode,
        });
      }
    });

    return Array.from(map.values()).sort((left, right) => left.label.localeCompare(right.label));
  }, [flatRows]);

  const powerOptions = useMemo(() => {
    const map = new Map();

    flatRows.forEach((row) => {
      if (row.powerId && !map.has(row.powerId)) {
        map.set(row.powerId, {
          value: row.powerId,
          label: row.powerKva ? `${row.powerCode} (${row.powerKva} kVA)` : row.powerCode,
        });
      }
    });

    return Array.from(map.values()).sort((left, right) => left.label.localeCompare(right.label));
  }, [flatRows]);

  const componentOptions = useMemo(() => {
    const map = new Map();

    flatRows.forEach((row) => {
      if (row.componentId && !map.has(row.componentId)) {
        map.set(row.componentId, {
          value: row.componentId,
          label: row.componentLabel || row.componentCode,
        });
      }
    });

    return Array.from(map.values()).sort((left, right) => left.label.localeCompare(right.label));
  }, [flatRows]);

  const filteredRows = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return flatRows
      .filter((row) => {
        if (selectedSuppliers.length > 0 && !selectedSuppliers.includes(row.supplierId)) {
          return false;
        }

        if (selectedOffers.length > 0 && !selectedOffers.includes(row.offerId)) {
          return false;
        }

        if (selectedTariffs.length > 0 && !selectedTariffs.includes(row.tariffId)) {
          return false;
        }

        if (selectedPowers.length > 0 && !selectedPowers.includes(row.powerId)) {
          return false;
        }

        if (selectedComponents.length > 0 && !selectedComponents.includes(row.componentId)) {
          return false;
        }

        if (!searchValue) {
          return true;
        }

        return [
          row.supplierName,
          row.supplierCode,
          row.offerName,
          row.offerCode,
          row.optionName,
          row.optionCode,
          row.tariffCode,
          row.tariffLabel,
          row.powerCode,
          row.componentCode,
          row.componentLabel,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(searchValue));
      })
      .sort((left, right) => new Date(right.startDate) - new Date(left.startDate));
  }, [
    flatRows,
    search,
    selectedComponents,
    selectedOffers,
    selectedPowers,
    selectedSuppliers,
    selectedTariffs,
  ]);

  const chartSeries = useMemo(() => {
    const grouped = new Map();

    filteredRows.forEach((row) => {
      const label = buildSeriesLabel(row);
      const existingRows = grouped.get(label) ?? [];
      existingRows.push(row);
      grouped.set(label, existingRows);
    });

    return Array.from(grouped.entries())
      .sort((left, right) => left[0].localeCompare(right[0]))
      .slice(0, MAX_SERIES)
      .map(([label, seriesRows]) => ({
        label,
        rows: [...seriesRows].sort((left, right) => new Date(left.startDate) - new Date(right.startDate)),
      }));
  }, [filteredRows]);

  const hiddenSeriesCount = useMemo(() => {
    const uniqueLabels = new Set(filteredRows.map((row) => buildSeriesLabel(row)));
    return Math.max(0, uniqueLabels.size - chartSeries.length);
  }, [chartSeries.length, filteredRows]);

  const timelineData = useMemo(() => {
    const points = new Map();

    chartSeries.forEach((series) => {
      series.rows.forEach((row) => {
        const dateKey = row.startDate.slice(0, 10);
        const currentEntry = points.get(dateKey) ?? { date: dateKey };
        currentEntry[series.label] = row[priceMetric];
        points.set(dateKey, currentEntry);
      });
    });

    return Array.from(points.values()).sort((left, right) => new Date(left.date) - new Date(right.date));
  }, [chartSeries, priceMetric]);

  const latestComparisonData = useMemo(
    () =>
      chartSeries
        .map((series) => {
          const latestRow = series.rows[series.rows.length - 1];

          return {
            series: series.label,
            value: latestRow?.[priceMetric] ?? 0,
            date: latestRow?.startDate ?? "",
          };
        })
        .sort((left, right) => right.value - left.value),
    [chartSeries, priceMetric],
  );

  if (loading) {
    return (
      <div className="details-page">
        <div className="page-header">
          <div>
            <p className="page-eyebrow">Price catalog</p>
            <h2>Offer details</h2>
          </div>
          <button className="secondary-action" onClick={onBack}>Back to main page</button>
        </div>
        <p className="status-panel">Loading price catalog…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="details-page">
        <div className="page-header">
          <div>
            <p className="page-eyebrow">Price catalog</p>
            <h2>Offer details</h2>
          </div>
          <button className="secondary-action" onClick={onBack}>Back to main page</button>
        </div>
        <p className="status-panel status-panel-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="details-page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Price catalog</p>
          <h2>Offer details</h2>
          <p className="page-subtitle">
            Inspect raw rows and compare historical price evolution across suppliers, powers, tariffs, and components.
          </p>
        </div>
        <button className="secondary-action" onClick={onBack}>Back to main page</button>
      </div>

      <section className="details-card filters-grid">
        <label className="filter-field filter-field-wide">
          <span>Search</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Supplier, offer, tariff, component..."
          />
        </label>

        <label className="filter-field">
          <span>Suppliers</span>
          <select multiple value={selectedSuppliers} onChange={(event) => setSelectedSuppliers(getSelectedValues(event))}>
            {supplierOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          <span>Offers</span>
          <select multiple value={selectedOffers} onChange={(event) => setSelectedOffers(getSelectedValues(event))}>
            {offerOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          <span>Tariff types</span>
          <select multiple value={selectedTariffs} onChange={(event) => setSelectedTariffs(getSelectedValues(event))}>
            {tariffOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          <span>Meter powers</span>
          <select multiple value={selectedPowers} onChange={(event) => setSelectedPowers(getSelectedValues(event))}>
            {powerOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          <span>Components</span>
          <select multiple value={selectedComponents} onChange={(event) => setSelectedComponents(getSelectedValues(event))}>
            {componentOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <div className="filter-field">
          <span>Displayed price</span>
          <div className="segmented-controls">
            <button
              className={priceMetric === "priceTtc" ? "is-active" : ""}
              onClick={() => setPriceMetric("priceTtc")}
            >
              TTC
            </button>
            <button
              className={priceMetric === "priceHt" ? "is-active" : ""}
              onClick={() => setPriceMetric("priceHt")}
            >
              HT
            </button>
          </div>
        </div>
      </section>

      <section className="details-stats">
        <div className="stat-card">
          <strong>{filteredRows.length}</strong>
          <span>matching rows</span>
        </div>
        <div className="stat-card">
          <strong>{new Set(filteredRows.map((row) => row.offerId)).size}</strong>
          <span>offers in scope</span>
        </div>
        <div className="stat-card">
          <strong>{new Set(filteredRows.map((row) => row.supplierId)).size}</strong>
          <span>suppliers in scope</span>
        </div>
        <div className="stat-card">
          <strong>{new Set(filteredRows.map((row) => buildSeriesLabel(row))).size}</strong>
          <span>chart series available</span>
        </div>
      </section>

      <section className="details-card chart-card">
        <div className="chart-card-header">
          <div>
            <h3>Price evolution</h3>
            <p>Each line represents one supplier / offer / option / tariff / power / component combination.</p>
          </div>
          {hiddenSeriesCount > 0 && (
            <p className="chart-note">{hiddenSeriesCount} more series hidden. Narrow filters to show them.</p>
          )}
        </div>

        {timelineData.length === 0 ? (
          <p className="status-panel">No price history matches the current filters.</p>
        ) : (
          <ResponsiveContainer width="100%" height={420}>
            <LineChart data={timelineData} margin={{ top: 10, right: 24, left: 8, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d6d3d1" />
              <XAxis dataKey="date" tickFormatter={formatDate} />
              <YAxis tickFormatter={(value) => `${value.toFixed(2)} €`} width={90} />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                labelFormatter={(value) => formatDate(value)}
              />
              <Legend />
              {chartSeries.map((series, index) => (
                <Line
                  key={series.label}
                  type="monotone"
                  dataKey={series.label}
                  stroke={CHART_COLORS[index % CHART_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </section>

      <section className="details-card chart-card">
        <div className="chart-card-header">
          <div>
            <h3>Latest comparison</h3>
            <p>Latest known value per visible series, using the selected HT/TTC metric.</p>
          </div>
        </div>

        {latestComparisonData.length === 0 ? (
          <p className="status-panel">No current comparison available for the selected filters.</p>
        ) : (
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={latestComparisonData} layout="vertical" margin={{ top: 10, right: 24, left: 140, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d6d3d1" />
              <XAxis type="number" tickFormatter={(value) => `${value.toFixed(2)} €`} />
              <YAxis type="category" dataKey="series" width={240} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                labelFormatter={(value) => value}
              />
              <Bar dataKey="value" fill="#0f766e" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>

      <section className="details-card table-card">
        <div className="chart-card-header">
          <div>
            <h3>Raw values</h3>
            <p>A flat relational table, similar to Prisma Studio, for all rows matching the active filters.</p>
          </div>
        </div>

        <div className="table-scroll">
          <table className="details-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Supplier</th>
                <th>Offer</th>
                <th>Option</th>
                <th>Tariff</th>
                <th>Power</th>
                <th>Component</th>
                <th>HT</th>
                <th>TTC</th>
                <th>Start</th>
                <th>End</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>
                    <strong>{row.supplierName}</strong>
                    <div className="cell-meta">{row.supplierCode}</div>
                  </td>
                  <td>
                    <strong>{row.offerName}</strong>
                    <div className="cell-meta">{row.offerCode}</div>
                  </td>
                  <td>
                    {row.optionName || "-"}
                    {row.optionCode && <div className="cell-meta">{row.optionCode}</div>}
                  </td>
                  <td>
                    {row.tariffLabel || row.tariffCode}
                    {row.tariffCode && <div className="cell-meta">{row.tariffCode}</div>}
                  </td>
                  <td>{row.powerKva ? `${row.powerKva} kVA (${row.powerCode})` : row.powerCode || "-"}</td>
                  <td>
                    {row.componentLabel || row.componentCode}
                    {row.componentCode && <div className="cell-meta">{row.componentCode}</div>}
                  </td>
                  <td>{formatCurrency(row.priceHt)}</td>
                  <td>{formatCurrency(row.priceTtc)}</td>
                  <td>{formatDate(row.startDate)}</td>
                  <td>{formatDate(row.endDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}