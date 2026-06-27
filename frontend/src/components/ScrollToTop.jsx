import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  // useLocation hook hamein current URL (pathname) deta hai
  const { pathname } = useLocation();

  useEffect(() => {
    // Jaise hi pathname change ho, window ko (0, 0) yani top-left par scroll kar do
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // "smooth" bhi rakh sakte hain, par instant zyada natural lagta hai page change par
    });
  }, [pathname]);

  // Yeh component UI mein kuch render nahi karta, is liye null return karega
  return null;
};

export default ScrollToTop;
