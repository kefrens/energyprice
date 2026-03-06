import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:3000";
const API_KEY = "mysecretkey";

function App() {
  const [suppliers, setSuppliers] = useState([]);
  const [offers, setOffers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [newSupplier, setNewSupplier] = useState("");
  const [newOffer, setNewOffer] = useState("");
  const [selectedOffer, setSelectedOffer] = useState("");
  const [priceKwh, setPriceKwh] = useState("");
  const [priceDate, setPriceDate] = useState("");
  const [tariffTypes, setTariffTypes] = useState([]);
  const [selectedTariffType, setSelectedTariffType] = useState("");
  const [newTariffType, setNewTariffType] = useState("");
  const [prices, setPrices] = useState([]);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    fetchTariffTypes(selectedOffer);
    fetchPrices(selectedOffer);
  }, [selectedOffer]);

  const fetchSuppliers = async () => {
    const res = await axios.get(`${API_URL}/suppliers`, {
      headers: { "x-api-key": API_KEY },
    });
    setSuppliers(res.data);
  };

  const fetchTariffTypes = async (offerId) => {
    if (!offerId) {
      setTariffTypes([]);
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/tariff-types/${offerId}`, {
        headers: { "x-api-key": API_KEY },
      });
      setTariffTypes(res.data);
    } catch (err) {
      console.error("Error fetching tariff types:", err);
    }
  };

  const fetchPrices = async (offerId) => {
    if (!offerId) {
      setPrices([]);
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/prices/history/${offerId}`, {
        headers: { "x-api-key": API_KEY },
      });
      setPrices(res.data);
    } catch (err) {
      console.error("Error fetching prices:", err);
    }
  };

  const fetchOffers = async (supplierId) => {
    const res = await axios.get(`${API_URL}/offers/${supplierId}`, {
      headers: { "x-api-key": API_KEY },
    });
    setOffers(res.data);
  };

  const createTariffType = async () => {
    if (!selectedOffer) {
      alert("Select an offer first");
      return;
    }
    try {
      await axios.post(
        `${API_URL}/admin/tariff-types`,
        { name: newTariffType, offerId: selectedOffer },
        { headers: { "x-api-key": API_KEY } }
      );
      setNewTariffType("");
      fetchTariffTypes(selectedOffer);
    } catch (err) {
      alert(err.response?.data?.error || "Error creating tariff type");
    }
  };

  const createSupplier = async () => {
    try {
      await axios.post(
        `${API_URL}/admin/suppliers`,
        { name: newSupplier },
        { headers: { "x-api-key": API_KEY } }
      );
  
      setNewSupplier("");
      await fetchSuppliers();
  
    } catch (err) {
      alert(err.response?.data?.error || "Error creating supplier");
    }
  };

  const createOffer = async () => {
    try {
      await axios.post(
        `${API_URL}/admin/offers`,
        { name: newOffer, supplierId: selectedSupplier },
        { headers: { "x-api-key": API_KEY } }
      );

      setNewOffer("");
      fetchOffers(selectedSupplier);
    } catch (err) {
      alert(err.response?.data?.error || "Error creating offer");
    }
  };

  const createPrice = async () => {
    try {
      await axios.post(
        `${API_URL}/admin/prices/${selectedOffer}`,
        {
          priceKwh: parseFloat(priceKwh),
          tariffTypeId: parseInt(selectedTariffType),
          validFrom: priceDate,
        },
        { headers: { "x-api-key": API_KEY } }
      );

      alert("Price created!");
      setPriceKwh("");
      setSelectedTariffType("");
      setPriceDate("");
      fetchPrices(selectedOffer); // Refresh prices
    } catch (err) {
      alert(err.response?.data?.error || "Error creating price");
    }
  };

  console.log("SUPPLIERS:", suppliers);

  return (
    <div style={{ padding: 40 }}>
      <h2>Admin Energy Prices</h2>

      <h3>Create Supplier</h3>
      <input
        value={newSupplier}
        onChange={(e) => setNewSupplier(e.target.value)}
        placeholder="Supplier name"
      />
      <button onClick={createSupplier}>Create</button>

      <h3>Select Supplier</h3>
      <select
        value={selectedSupplier}
        onChange={(e) => {
          const supplierId = e.target.value;
          setSelectedSupplier(supplierId);
        
          if (supplierId) {
            fetchOffers(supplierId);
          } else {
            setOffers([]);
            setSelectedOffer("");
            setTariffTypes([]);
            setPrices([]);
          }
        }}
      >
        <option value="">-- Select --</option>
        {suppliers.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      {selectedSupplier && (
        <>
          <h3>Create Offer</h3>
          <input
            value={newOffer}
            onChange={(e) => setNewOffer(e.target.value)}
            placeholder="Offer name"
          />
          <button onClick={createOffer}>Create Offer</button>

          <h3>Offers</h3>
          <ul>
            {offers.map((o) => (
              <li key={o.id}>{o.name}</li>
            ))}
          </ul>

          <h3>Select Offer</h3>
          <select
            value={selectedOffer}
            onChange={(e) => setSelectedOffer(e.target.value)}
          >
            <option value="">-- Select Offer --</option>
            {offers.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>

          {selectedOffer && (
            <>
              <h3>Tariff Types</h3>
              <ul>
                {tariffTypes.map((t) => (
                  <li key={t.id}>{t.name}</li>
                ))}
              </ul>

              <h4>Create Tariff Type</h4>
              <input
                value={newTariffType}
                onChange={(e) => setNewTariffType(e.target.value)}
                placeholder="Tariff type name"
              />
              <button onClick={createTariffType}>Add Type</button>

              <h3>Add Price</h3>
              <input
                type="number"
                step="0.001"
                placeholder="Price per kWh"
                value={priceKwh}
                onChange={(e) => setPriceKwh(e.target.value)}
              />
              <select
                value={selectedTariffType}
                onChange={(e) => setSelectedTariffType(e.target.value)}
              >
                <option value="">-- Select Tariff Type --</option>
                {tariffTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={priceDate}
                onChange={(e) => setPriceDate(e.target.value)}
              />
              <button onClick={createPrice}>Create Price</button>

              <h3>Prices</h3>
              {prices.length === 0 ? (
                <p>No prices found for this offer.</p>
              ) : (
                <div>
                  {tariffTypes.map((tariffType) => {
                    const tariffPrices = prices.filter(p => p.tariffTypeId === tariffType.id);
                    if (tariffPrices.length === 0) return null;
                    return (
                      <div key={tariffType.id} style={{ marginBottom: 20 }}>
                        <h4>{tariffType.name}</h4>
                        <ul>
                          {tariffPrices.map((price) => (
                            <li key={price.id}>
                              {price.priceKwh} €/kWh - Valid from: {new Date(price.validFrom).toLocaleDateString()}
                              {price.validTo && ` to ${new Date(price.validTo).toLocaleDateString()}`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;