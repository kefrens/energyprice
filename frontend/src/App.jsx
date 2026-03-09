import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:3000";
const API_KEY = "mysecretkey";

function App() {
  const [suppliers, setSuppliers] = useState([]);
  const [offers, setOffers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [newSupplier, setNewSupplier] = useState("");
  const [newSupplierActive, setNewSupplierActive] = useState(true);
  const [newSupplierLogoUrl, setNewSupplierLogoUrl] = useState("");
  const [newOffer, setNewOffer] = useState("");
  const [newOfferStartDate, setNewOfferStartDate] = useState("");
  const [newOfferEndDate, setNewOfferEndDate] = useState("");
  const [newOfferActive, setNewOfferActive] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState("");
  const [editingOffer, setEditingOffer] = useState(null); // {id, name, startDate, endDate, active}
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

  const fetchOffers = async (supplierId) => {
    const res = await axios.get(`${API_URL}/offers/${supplierId}`, {
      headers: { "x-api-key": API_KEY },
    });
    // backend may not always return active field (older server); default to true
    const offersWithDefaults = res.data.map((o) => ({
      active: o.active !== undefined ? o.active : true,
      ...o,
    }));
    setOffers(offersWithDefaults);
  };

  const deleteSupplier = async (supplierId) => {
    if (!confirm("Are you sure you want to delete this supplier?")) return;
    try {
      await axios.delete(`${API_URL}/admin/suppliers/${supplierId}`, {
        headers: { "x-api-key": API_KEY },
      });
      await fetchSuppliers();
      if (selectedSupplier === supplierId) {
        setSelectedSupplier("");
        setOffers([]);
        setSelectedOffer("");
        setTariffTypes([]);
        setPrices([]);
      }
    } catch (err) {
      console.error("Error deleting supplier:", err);
      alert(err.response?.data?.error || "Error deleting supplier");
    }
  };

  const updateSupplier = async (supplierId, updates) => {
    try {
      await axios.put(`${API_URL}/admin/suppliers/${supplierId}`, updates, {
        headers: { "x-api-key": API_KEY },
      });
      await fetchSuppliers();
    } catch (err) {
      console.error("Error updating supplier:", err);
      alert(err.response?.data?.error || "Error updating supplier");
    }
  };

  const deleteOffer = async (offerId) => {
    if (!confirm("Are you sure you want to delete this offer?")) return;
    try {
      await axios.delete(`${API_URL}/admin/offers/${offerId}`, {
        headers: { "x-api-key": API_KEY },
      });
      await fetchOffers(selectedSupplier);
      if (selectedOffer === offerId) {
        setSelectedOffer("");
        setTariffTypes([]);
        setPrices([]);
      }
    } catch (err) {
      console.error("Error deleting offer:", err);
      alert(err.response?.data?.error || "Error deleting offer");
    }
  };

  const deleteTariffType = async (tariffTypeId) => {
    if (!confirm("Are you sure you want to delete this tariff type?")) return;
    try {
      await axios.delete(`${API_URL}/admin/tariff-types/${tariffTypeId}`, {
        headers: { "x-api-key": API_KEY },
      });
      await fetchTariffTypes(selectedOffer);
    } catch (err) {
      console.error("Error deleting tariff type:", err);
      alert(err.response?.data?.error || "Error deleting tariff type");
    }
  };

  const deletePrice = async (priceId) => {
    if (!confirm("Are you sure you want to delete this price?")) return;
    try {
      await axios.delete(`${API_URL}/admin/prices/${priceId}`, {
        headers: { "x-api-key": API_KEY },
      });
      await fetchPrices(selectedOffer);
    } catch (err) {
      console.error("Error deleting price:", err);
      alert(err.response?.data?.error || "Error deleting price");
    }
  };

  const createSupplier = async () => {
    try {
      await axios.post(
        `${API_URL}/admin/suppliers`,
        { 
          name: newSupplier,
          active: newSupplierActive,
          logoUrl: newSupplierLogoUrl || null
        },
        { headers: { "x-api-key": API_KEY } }
      );
  
      setNewSupplier("");
      setNewSupplierActive(true);
      setNewSupplierLogoUrl("");
      await fetchSuppliers();
  
    } catch (err) {
      alert(err.response?.data?.error || "Error creating supplier");
    }
  };

  const createOffer = async () => {
    try {
      const payload = {
        name: newOffer,
        supplierId: selectedSupplier,
        startDate: newOfferStartDate || undefined,
        endDate: newOfferEndDate || undefined,
        active: newOfferActive,
      };
      await axios.post(
        `${API_URL}/admin/offers`,
        payload,
        { headers: { "x-api-key": API_KEY } }
      );

      setNewOffer("");
      setNewOfferStartDate("");
      setNewOfferEndDate("");
      setNewOfferActive(true);
      fetchOffers(selectedSupplier);
    } catch (err) {
      alert(err.response?.data?.error || "Error creating offer");
    }
  };

  const updateOffer = async () => {
    try {
      const payload = {};
      if (editingOffer.name !== undefined) payload.name = editingOffer.name;
      if (editingOffer.startDate !== undefined) payload.startDate = editingOffer.startDate || null;
      if (editingOffer.endDate !== undefined) payload.endDate = editingOffer.endDate || null;
      if (editingOffer.active !== undefined) payload.active = editingOffer.active;

      await axios.put(`${API_URL}/admin/offers/${editingOffer.id}`, payload, {
        headers: { "x-api-key": API_KEY },
      });
      setEditingOffer(null);
      fetchOffers(selectedSupplier);
    } catch (err) {
      alert(err.response?.data?.error || "Error updating offer");
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

  const createTariffType = async () => {
    try {
      await axios.post(
        `${API_URL}/tariff-types`,
        { name: newTariffType, offerId: selectedOffer },
        { headers: { "x-api-key": API_KEY } }
      );

      setNewTariffType("");
      fetchTariffTypes(selectedOffer); // Refresh tariff types
    } catch (err) {
      alert(err.response?.data?.error || "Error creating tariff type");
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
      <br />
      <label>
        <input
          type="checkbox"
          checked={newSupplierActive}
          onChange={(e) => setNewSupplierActive(e.target.checked)}
        />
        Active
      </label>
      <br />
      <input
        value={newSupplierLogoUrl}
        onChange={(e) => setNewSupplierLogoUrl(e.target.value)}
        placeholder="Logo domain (e.g., edf.com)"
      />
      <button onClick={createSupplier}>Create</button>

      <h3>Suppliers</h3>
      <ul>
        {suppliers.map((s) => (
          <li key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {s.logoUrl && (
              <img 
                src={`https://logos.hunter.io/${s.logoUrl}`} 
                alt={`${s.name} logo`} 
                style={{ height: '20px', width: 'auto' }}
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
            <span style={{ textDecoration: !s.active ? 'line-through' : 'none', opacity: !s.active ? 0.6 : 1 }}>
              {s.name} {!s.active && '(Inactive)'}
            </span>
            <button onClick={() => updateSupplier(s.id, { active: !s.active })}>
              {s.active ? 'Deactivate' : 'Activate'}
            </button>
            <button onClick={() => deleteSupplier(s.id)}>Delete</button>
          </li>
        ))}
      </ul>

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
        {suppliers.filter(s => s.active).map((s) => (
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
          <input
            type="date"
            value={newOfferStartDate}
            onChange={(e) => setNewOfferStartDate(e.target.value)}
            placeholder="Start date"
          />
          <input
            type="date"
            value={newOfferEndDate}
            onChange={(e) => setNewOfferEndDate(e.target.value)}
            placeholder="End date"
          />
          <label>
            <input
              type="checkbox"
              checked={newOfferActive}
              onChange={(e) => setNewOfferActive(e.target.checked)}
            /> Active
          </label>
          <button onClick={createOffer}>Create Offer</button>

          {editingOffer && (
            <div style={{ marginTop: 20, padding: 10, border: '1px solid #ccc' }}>
              <h4>Edit Offer</h4>
              <input
                value={editingOffer.name}
                onChange={(e) => setEditingOffer({...editingOffer, name: e.target.value})}
              />
              <input
                type="date"
                value={editingOffer.startDate || ''}
                onChange={(e) => setEditingOffer({...editingOffer, startDate: e.target.value})}
              />
              <input
                type="date"
                value={editingOffer.endDate || ''}
                onChange={(e) => setEditingOffer({...editingOffer, endDate: e.target.value})}
              />
              <label>
                <input
                  type="checkbox"
                  checked={editingOffer.active}
                  onChange={(e) => setEditingOffer({...editingOffer, active: e.target.checked})}
                /> Active
              </label>
              <button onClick={updateOffer}>Save</button>
              <button onClick={() => setEditingOffer(null)}>Cancel</button>
            </div>
          )}

          <h3>Offers</h3>
          <ul>
            {offers.map((o) => (
              <li key={o.id}>
                <span style={{ textDecoration: o.active ? 'none' : 'line-through', opacity: o.active ? 1 : 0.6 }}>
                  {o.name}
                  {o.startDate && ` (from ${new Date(o.startDate).toLocaleDateString()}`}
                  {o.endDate && ` to ${new Date(o.endDate).toLocaleDateString()}`}
                  {o.startDate && ')'}
                </span>
                <button onClick={() => setEditingOffer({
                  id: o.id,
                  name: o.name,
                  startDate: o.startDate ? o.startDate.slice(0,10) : "",
                  endDate: o.endDate ? o.endDate.slice(0,10) : "",
                  active: o.active,
                })}>Edit</button>
                <button onClick={() => deleteOffer(o.id)}>Delete</button>
              </li>
            ))}
          </ul>

          <h3>Select Offer</h3>
          <select
            value={selectedOffer}
            onChange={(e) => setSelectedOffer(e.target.value)}
          >
            <option value="">-- Select Offer --</option>
            {offers.filter(o => o.active).map((o) => (
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
                  <li key={t.id}>
                    {t.name} <button onClick={() => deleteTariffType(t.id)}>Delete</button>
                  </li>
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
                              <button onClick={() => deletePrice(price.id)}>Delete</button>
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