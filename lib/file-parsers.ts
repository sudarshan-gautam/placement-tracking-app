import * as XLSX from 'xlsx';

interface ImportedUser {
  name: string;
  email: string;
  role: string;
  status: string;
  password?: string;
}

/**
 * Parse a CSV file and return the user data
 */
export const parseCSV = async (file: File): Promise<ImportedUser[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        if (!event.target?.result) {
          reject(new Error('Failed to read file'));
          return;
        }
        
        const csvText = event.target.result as string;
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
        
        // Validate headers
        const requiredHeaders = ['name', 'email', 'role', 'status'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        
        if (missingHeaders.length > 0) {
          reject(new Error(`Missing required columns: ${missingHeaders.join(', ')}`));
          return;
        }
        
        // Parse data
        const users: ImportedUser[] = [];
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue; // Skip empty lines
          
          const values = lines[i].split(',').map(value => value.trim());
          
          // Make sure we have enough values
          if (values.length < requiredHeaders.length) continue;
          
          const user: Record<string, string> = {};
          headers.forEach((header, index) => {
            if (index < values.length) {
              user[header] = values[index];
            }
          });
          
          // Ensure the user object has the required fields before adding it
          if (
            'name' in user && 
            'email' in user && 
            'role' in user && 
            'status' in user
          ) {
            users.push({
              name: user.name,
              email: user.email,
              role: user.role,
              status: user.status,
              password: user.password
            });
          }
        }
        
        resolve(users);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading CSV file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Parse an Excel file and return the user data
 */
export const parseExcel = async (file: File): Promise<ImportedUser[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        if (!event.target?.result) {
          reject(new Error('Failed to read file'));
          return;
        }
        
        const data = new Uint8Array(event.target.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json<ImportedUser>(worksheet);
        
        // Validate required fields
        const requiredFields = ['name', 'email', 'role', 'status'];
        
        // Check if the first row has all required fields
        if (jsonData.length > 0) {
          const firstRow = jsonData[0];
          const missingFields = requiredFields.filter(field => 
            !Object.keys(firstRow).map(k => k.toLowerCase()).includes(field.toLowerCase())
          );
          
          if (missingFields.length > 0) {
            reject(new Error(`Missing required columns: ${missingFields.join(', ')}`));
            return;
          }
        }
        
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading Excel file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Parse a JSON file and return the user data
 */
export const parseJSON = async (file: File): Promise<ImportedUser[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        if (!event.target?.result) {
          reject(new Error('Failed to read file'));
          return;
        }
        
        const jsonText = event.target.result as string;
        const jsonData = JSON.parse(jsonText) as ImportedUser[];
        
        // Validate required fields
        const requiredFields = ['name', 'email', 'role', 'status'];
        
        if (!Array.isArray(jsonData)) {
          reject(new Error('JSON data must be an array of user objects'));
          return;
        }
        
        // Check if all objects have required fields
        if (jsonData.length > 0) {
          const firstItem = jsonData[0];
          const missingFields = requiredFields.filter(field => 
            !Object.keys(firstItem).map(k => k.toLowerCase()).includes(field.toLowerCase())
          );
          
          if (missingFields.length > 0) {
            reject(new Error(`Missing required fields: ${missingFields.join(', ')}`));
            return;
          }
        }
        
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading JSON file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Parse any supported file format (CSV, Excel, JSON)
 */
export const parseImportFile = async (file: File): Promise<ImportedUser[]> => {
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.csv')) {
    return parseCSV(file);
  } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    return parseExcel(file);
  } else if (fileName.endsWith('.json')) {
    return parseJSON(file);
  } else {
    throw new Error('Unsupported file format. Please use CSV, Excel, or JSON');
  }
}; 