import React, { createContext, useContext, useState, useEffect } from 'react';

const BloodBankContext = createContext();

export const useBloodBank = () => {
  const context = useContext(BloodBankContext);
  if (!context) {
    throw new Error('useBloodBank must be used within a BloodBankProvider');
  }
  return context;
};

export const BloodBankProvider = ({ children }) => {
  const [inventory, setInventory] = useState([]);
  const [stockHistory, setStockHistory] = useState(() => {
    const saved = localStorage.getItem('bloodBankStockHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [apiAvailable, setApiAvailable] = useState(true);

  // Fetch all blood bank data
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch inventory
      const inventoryResponse = await fetch('https://hospital-resource-and-blood-bank.onrender.com/api/blood-inventory');
      if (inventoryResponse.ok) {
        const inventoryData = await inventoryResponse.json();
        setInventory(inventoryData);
      }

      // Fetch stock history (if API exists)
      try {
        const historyResponse = await fetch('https://hospital-resource-and-blood-bank.onrender.com/api/stock-history');
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          setStockHistory(historyData);
          localStorage.setItem('bloodBankStockHistory', JSON.stringify(historyData));
        } else if (historyResponse.status === 404) {
          // Endpoint doesn't exist, use localStorage data silently
          const saved = localStorage.getItem('bloodBankStockHistory');
          if (saved) {
            setStockHistory(JSON.parse(saved));
          } else {
            setStockHistory([]);
          }
        }
      } catch (e) {
        // If stock history API doesn't exist, use localStorage data
        const saved = localStorage.getItem('bloodBankStockHistory');
        if (saved) {
          setStockHistory(JSON.parse(saved));
        } else {
          setStockHistory([]);
        }
      }

      // Fetch notifications (if API exists)
      try {
        const notificationsResponse = await fetch('https://hospital-resource-and-blood-bank.onrender.com/api/notifications');
        if (notificationsResponse.ok) {
          const notificationsData = await notificationsResponse.json();
          setNotifications(notificationsData);
        } else if (notificationsResponse.status === 404) {
          // Endpoint doesn't exist, use empty array silently
          setNotifications([]);
        }
      } catch (e) {
        // If notifications API doesn't exist, use empty array
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching blood bank data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Trigger refresh of all data
  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Add stock history entry
  const addStockHistoryEntry = async (entry) => {
    try {
      const response = await fetch('https://hospital-resource-and-blood-bank.onrender.com/api/stock-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      if (response.ok) {
        triggerRefresh();
      } else {
        // If API fails, add to local state
        const newEntry = { ...entry, _id: Date.now().toString() };
        setStockHistory(prev => {
          const updated = [...prev, newEntry];
          localStorage.setItem('bloodBankStockHistory', JSON.stringify(updated));
          return updated;
        });
        setApiAvailable(false);
      }
    } catch (error) {
      console.error('Error adding stock history entry:', error);
      // Add to local state as fallback
      const newEntry = { ...entry, _id: Date.now().toString() };
      setStockHistory(prev => {
        const updated = [...prev, newEntry];
        localStorage.setItem('bloodBankStockHistory', JSON.stringify(updated));
        return updated;
      });
      setApiAvailable(false);
    }
  };

  // Add notification
  const addNotification = async (notification) => {
    try {
      const response = await fetch('https://hospital-resource-and-blood-bank.onrender.com/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification)
      });
      if (response.ok) {
        triggerRefresh();
      }
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  };

  // Fetch data on mount and when refreshTrigger changes
  useEffect(() => {
    fetchAllData();
  }, [refreshTrigger]);

  const value = {
    inventory,
    stockHistory,
    notifications,
    loading,
    triggerRefresh,
    addStockHistoryEntry,
    addNotification,
    refreshTrigger
  };

  return (
    <BloodBankContext.Provider value={value}>
      {children}
    </BloodBankContext.Provider>
  );
};
