export const loadState = () => {
    try {
      const serialized = localStorage.getItem('chatState');
      if (!serialized) return undefined;
      return JSON.parse(serialized);
    } catch {
      return undefined;
    }
  };
  
  export const saveState = (state) => {
    try {
      const serialized = JSON.stringify(state);
      localStorage.setItem('chatState', serialized);
    } catch {}
  };
  
  export const clearState = () => {
    try {
      localStorage.removeItem('chatState');
    } catch {}
  };
  