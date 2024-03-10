//Component from stackoverflow
//https://stackoverflow.com/questions/36904185/react-router-scroll-to-top-on-every-transition

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({top: 0, left: 0, behavior: "instant"});
  }, [pathname]);

  return null;
}