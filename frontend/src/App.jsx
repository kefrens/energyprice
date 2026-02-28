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
  const [subscriptionPrice, setSubscriptionPrice] = useState("");
  const [priceDate, setPriceDate] = useState("");

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    const res = await axios.get(`${API_URL}/suppliers`, {
      headers: { "x-api-key": API_KEY },
    });
    setSuppliers(res.data);
  };

  const fetchOffers = async (supplierId) => {
    const res = await axios.get(`${API_URL}/offers/${supplierId}`, {
      headers: { "x-api-key": API_KEY },
    });
    setOffers(res.data);
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
    await axios.post(
      `${API_URL}/admin/offers`,
      { name: newOffer, supplierId: selectedSupplier },
      { headers: { "x-api-key": API_KEY } }
    );

    setNewOffer("");
    fetchOffers(selectedSupplier);
  };

  const createPrice = async () => {
    try {
      await axios.post(
        `${API_URL}/admin/prices/${selectedOffer}`,
        {
          priceKwh: parseFloat(priceKwh),
          subscriptionPrice: parseFloat(subscriptionPrice),
          validFrom: priceDate,
        },
        { headers: { "x-api-key": API_KEY } }
      );
  
      alert("Price created!");
      setPriceKwh("");
      setSubscriptionPrice("");
      setPriceDate("");
  
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
              <h3>Add Price</h3>
              <input
                type="number"
                step="0.001"
                placeholder="Price per kWh"
                value={priceKwh}
                onChange={(e) => setPriceKwh(e.target.value)}
              />
              <input
                type="number"
                step="0.01"
                placeholder="Subscription price"
                value={subscriptionPrice}
                onChange={(e) => setSubscriptionPrice(e.target.value)}
              />
              <input
                type="date"
                value={priceDate}
                onChange={(e) => setPriceDate(e.target.value)}
              />
              <button onClick={createPrice}>Create Price</button>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;