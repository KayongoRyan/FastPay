export const createSlug = (title: string): string => {
  // If title contains a hyphen, use only the part after the hyphen
  const cleanTitle = title.includes(' - ') 
    ? title.split(' - ')[1] 
    : title;
  
  return cleanTitle
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
};

export const extractTitle = (fullTitle: string): string => {
  // If title contains a hyphen, use only the part after the hyphen
  return fullTitle.includes(' - ') 
    ? fullTitle.split(' - ')[1] 
    : fullTitle;
};
