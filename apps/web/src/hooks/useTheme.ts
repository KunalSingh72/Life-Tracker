import { useContext } from "react"
import {ThemeContext} from "@/app/providers/ThemeContext"

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if(!context) {
    throw new Error("useTheme must be used inside ThemeProvider"); 
  }
  return context;
}