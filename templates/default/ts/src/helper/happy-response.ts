const HIDE_FEILDS: string[] = [];

export const happyResponse = (object: any) => {
  const hideKeys = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(hideKeys);
    } else if (typeof obj === "object" && obj !== null) {
      HIDE_FEILDS.forEach((item) => {
        delete obj[item];
      });

      // Recursively call hideKeys for each property in the object
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          obj[key] = hideKeys(obj[key]);
        }
      }
    }
    return obj;
  };

  return { success: true, data: hideKeys(object) };
};
