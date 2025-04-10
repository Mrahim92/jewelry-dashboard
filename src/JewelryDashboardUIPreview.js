
import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc } from "firebase/firestore";
import { Pencil, Trash2, Package } from 'lucide-react';

export default function JewelryDashboardUIPreview() {
  const [tab, setTab] = useState("inventory");
  const [itemData, setItemData] = useState({
    name: "",
    sku: "",
    weight: "",
    karat: "",
    cost: "",
    tagPrice: "",
    notes: ""
  });
  const [inventoryList, setInventoryList] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  const handleAddInventory = async () => {
    try {
      if (editingId) {
        const itemRef = doc(db, "inventory", editingId);
        await updateDoc(itemRef, itemData);
        setEditingId(null);
      } else {
        await addDoc(collection(db, "inventory"), itemData);
      }
      await fetchInventory();
      setItemData({ name: "", sku: "", weight: "", karat: "", cost: "", tagPrice: "", notes: "" });
    } catch (error) {
      console.error("Error saving item: ", error);
    }
  };

  const fetchInventory = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "inventory"));
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInventoryList(items);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "inventory", id));
      await fetchInventory();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleEdit = (item) => {
    setItemData(item);
    setEditingId(item.id);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const filteredInventory = inventoryList.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.sku.toLowerCase().includes(search.toLowerCase())
  );

  const navItems = [
    { key: "inventory", label: "Inventory", icon: Package },
    { key: "sales", label: "Sales" },
    { key: "customers", label: "Customers" },
    { key: "dashboard", label: "Dashboard" },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 to-blue-100">
      <aside className="w-64 h-screen bg-white border-r border-gray-200 p-6 shadow-xl">
        <h1 className="text-3xl font-extrabold text-blue-600 mb-10 tracking-tight">💎 Jewelry Admin</h1>
        <nav className="space-y-4">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-150 ${tab === key ? "bg-blue-600 text-white shadow" : "text-gray-700 hover:bg-blue-100"}`}
              >
              {Icon && <Icon size={18} />}
              {label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-10">
        {tab === "inventory" && (
          <div className="space-y-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{editingId ? "Edit Inventory Item" : "Add Inventory Item"}</h2>
              <p className="text-sm text-gray-500">Use the form below to manage your product listings.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <input className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-400" placeholder="Item Name" value={itemData.name} onChange={e => setItemData({ ...itemData, name: e.target.value })} />
              <input className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-400" placeholder="Item ID / SKU" value={itemData.sku} onChange={e => setItemData({ ...itemData, sku: e.target.value })} />
              <input className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-400" type="number" placeholder="Weight (grams)" value={itemData.weight} onChange={e => setItemData({ ...itemData, weight: e.target.value })} />
              <input className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-400" placeholder="Karat" value={itemData.karat} onChange={e => setItemData({ ...itemData, karat: e.target.value })} />
              <input className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-400" type="number" placeholder="Purchase Cost ($)" value={itemData.cost} onChange={e => setItemData({ ...itemData, cost: e.target.value })} />
              <input className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-400" type="number" placeholder="Tag Price ($)" value={itemData.tagPrice} onChange={e => setItemData({ ...itemData, tagPrice: e.target.value })} />
            </div>

            <textarea className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400" placeholder="Notes / Description" value={itemData.notes} onChange={e => setItemData({ ...itemData, notes: e.target.value })} />

            <div className="flex items-center justify-between">
              <button onClick={handleAddInventory} className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700">
                {editingId ? "Update Item" : "Add to Inventory"}
              </button>

              <input type="text" className="border p-2 w-1/2 rounded-lg" placeholder="Search by name or SKU..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="p-3 text-left text-xs font-semibold text-gray-700">Item</th>
                    <th className="p-3 text-left text-xs font-semibold text-gray-700">SKU</th>
                    <th className="p-3 text-left text-xs font-semibold text-gray-700">Weight</th>
                    <th className="p-3 text-left text-xs font-semibold text-gray-700">Karat</th>
                    <th className="p-3 text-left text-xs font-semibold text-gray-700">Cost</th>
                    <th className="p-3 text-left text-xs font-semibold text-gray-700">Tag Price</th>
                    <th className="p-3 text-left text-xs font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => (
                    <tr key={item.id} className="even:bg-white odd:bg-slate-50 hover:bg-blue-50 transition">
                      <td className="p-3 font-medium">{item.name}</td>
                      <td className="p-3">{item.sku}</td>
                      <td className="p-3">{item.weight}</td>
                      <td className="p-3">{item.karat}</td>
                      <td className="p-3">${item.cost}</td>
                      <td className="p-3">${item.tagPrice}</td>
                      <td className="p-3 space-x-2">
                        <button onClick={() => handleEdit(item)} className="p-1 bg-yellow-400 hover:bg-yellow-500 text-white rounded">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-1 bg-red-500 hover:bg-red-600 text-white rounded">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
