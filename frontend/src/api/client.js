// 在开发环境中，使用相对路径通过Vite代理访问API
// 在生产环境中，使用完整URL
const getApiBaseUrl = () => {
  // 开发环境：使用相对路径，Vite会代理到后端
  if (import.meta.env.DEV) {
    return '';
  }
  
  // 生产环境：使用环境变量或默认值
  if (import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (import.meta.env && import.meta.env.REACT_APP_API_URL) {
    return import.meta.env.REACT_APP_API_URL;
  }
  return 'http://localhost:8000';
};

const API_BASE_URL = getApiBaseUrl();

class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    console.log('API Client initialized with base URL:', this.baseURL || '(using proxy)');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    console.log('Making API request to:', url);
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/77189bd5-cf28-46a6-93a6-2efc554a2100',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client.js:request',message:'API request initiated',data:{url,endpoint,baseURL:this.baseURL},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/77189bd5-cf28-46a6-93a6-2efc554a2100',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client.js:request',message:'API response received',data:{url,status:response.status,ok:response.ok},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          message: `HTTP error! status: ${response.status}` 
        }));
        console.error('API request failed:', {
          url,
          status: response.status,
          error: errorData
        });
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/77189bd5-cf28-46a6-93a6-2efc554a2100',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client.js:request',message:'API request failed',data:{url,status:response.status,error:errorData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/77189bd5-cf28-46a6-93a6-2efc554a2100',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client.js:request',message:'API request exception',data:{url,error:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      throw error;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export default new ApiClient();
