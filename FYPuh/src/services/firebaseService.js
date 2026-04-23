// src/services/firebaseService.js
import { 
  database, 
  ref, 
  push, 
  set, 
  get, 
  update, 
  remove, 
  onValue 
} from '../config/firebaseConfig';

// ===== USER MANAGEMENT =====
export const saveUser = async (userId, userData) => {
  try {
    await set(ref(database, `users/${userId}`), {
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    console.log('User saved successfully');
    return { success: true };
  } catch (error) {
    console.error('Error saving user:', error);
    return { success: false, error };
  }
};

export const getUser = async (userId) => {
  try {
    const snapshot = await get(ref(database, `users/${userId}`));
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

export const updateUser = async (userId, updates) => {
  try {
    await update(ref(database, `users/${userId}`), {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    console.log('User updated successfully');
    return { success: true };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error };
  }
};

export const deleteUser = async (userId) => {
  try {
    await remove(ref(database, `users/${userId}`));
    console.log('User deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error };
  }
};

// ===== CROWD SENSE AREAS (for crowd sensing) =====
export const addArea = async (areaData) => {
  try {
    const areaName = areaData.name || 'area_' + Date.now();
    await set(ref(database, `imsi_data/${areaName}`), {
      ...areaData,
      lastUpdated: Date.now(),
      id: areaName
    });
    console.log('Area added:', areaName);
    return { success: true, id: areaName };
  } catch (error) {
    console.error('Error adding area:', error);
    return { success: false, error };
  }
};

export const getAreas = async () => {
  try {
    const snapshot = await get(ref(database, 'imsi_data'));
    if (snapshot.exists()) {
      const areasData = snapshot.val();
      return Object.entries(areasData).map(([key, value]) => ({
        id: key,
        ...value
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching areas:', error);
    return [];
  }
};

export const getArea = async (areaId) => {
  try {
    const snapshot = await get(ref(database, `imsi_data/${areaId}`));
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching area:', error);
    return null;
  }
};

export const updateArea = async (areaId, updates) => {
  try {
    await update(ref(database, `imsi_data/${areaId}`), {
      ...updates,
      lastUpdated: Date.now()
    });
    console.log('Area updated');
    return { success: true };
  } catch (error) {
    console.error('Error updating area:', error);
    return { success: false, error };
  }
};

export const deleteArea = async (areaId) => {
  try {
    await remove(ref(database, `imsi_data/${areaId}`));
    console.log('Area deleted');
    return { success: true };
  } catch (error) {
    console.error('Error deleting area:', error);
    return { success: false, error };
  }
};

// ===== REAL-TIME LISTENERS =====
export const listenToUser = (userId, callback) => {
  try {
    onValue(ref(database, `users/${userId}`), (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('Error listening to user:', error);
      callback(null);
    });
  } catch (error) {
    console.error('Error setting up listener:', error);
  }
};

export const listenToAllUsers = (callback) => {
  try {
    onValue(ref(database, 'users'), (snapshot) => {
      if (snapshot.exists()) {
        callback(Object.values(snapshot.val()));
      } else {
        callback([]);
      }
    }, (error) => {
      console.error('Error listening to users:', error);
      callback([]);
    });
  } catch (error) {
    console.error('Error setting up listener:', error);
  }
};

export const listenToAreas = (callback) => {
  try {
    onValue(ref(database, 'imsi_data'), (snapshot) => {
      if (snapshot.exists()) {
        const payload = snapshot.val();
        const areasData = payload.areas && typeof payload.areas === 'object' ? payload.areas : payload;
        const areas = Object.entries(areasData)
          .filter(([, value]) => value && typeof value === 'object')
          .map(([key, value]) => ({
            id: key,
            ...value
          }));
        callback(areas);
      } else {
        callback([]);
      }
    }, (error) => {
      console.error('Error listening to areas:', error);
      callback([]);
    });
  } catch (error) {
    console.error('Error setting up listener:', error);
    callback([]);
  }
};

export const listenToArea = (areaId, callback) => {
  try {
    onValue(ref(database, `imsi_data/${areaId}`), (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      } else {
        callback(null);
      }
    });
  } catch (error) {
    console.error('Error listening to area:', error);
  }
};

// ===== CHAT/MESSAGE MANAGEMENT =====
export const sendMessage = async (chatId, userId, message) => {
  try {
    const newRef = push(ref(database, `chats/${chatId}/messages`));
    await set(newRef, {
      userId,
      message,
      timestamp: new Date().toISOString(),
      id: newRef.key
    });
    console.log('Message sent');
    return { success: true, id: newRef.key };
  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false, error };
  }
};

export const listenToMessages = (chatId, callback) => {
  try {
    onValue(ref(database, `chats/${chatId}/messages`), (snapshot) => {
      if (snapshot.exists()) {
        const messages = Object.values(snapshot.val()).sort((a, b) => 
          new Date(a.timestamp) - new Date(b.timestamp)
        );
        callback(messages);
      } else {
        callback([]);
      }
    });
  } catch (error) {
    console.error('Error listening to messages:', error);
  }
};

// ===== GENERIC OPERATIONS =====
export const addData = async (path, data) => {
  try {
    const newRef = push(ref(database, path));
    await set(newRef, {
      ...data,
      timestamp: new Date().toISOString(),
      id: newRef.key
    });
    return { success: true, id: newRef.key };
  } catch (error) {
    console.error('Error adding data:', error);
    return { success: false, error };
  }
};

export const getData = async (path) => {
  try {
    const snapshot = await get(ref(database, path));
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};

export const updateData = async (path, updates) => {
  try {
    await update(ref(database, path), updates);
    return { success: true };
  } catch (error) {
    console.error('Error updating data:', error);
    return { success: false, error };
  }
};

export const deleteData = async (path) => {
  try {
    await remove(ref(database, path));
    return { success: true };
  } catch (error) {
    console.error('Error deleting data:', error);
    return { success: false, error };
  }
};
