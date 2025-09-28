interface NavigatorUAData {
    brands: { brand: string; version: string }[];
    platform: string;
  }
  
  interface Navigator {
    userAgentData?: NavigatorUAData;
  }
  