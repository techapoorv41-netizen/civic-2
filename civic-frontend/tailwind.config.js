/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        govNavy: '#0B2545',     // Primary Base (30%) - Headers, Navbars, Footers, Main Headings
        govOrange: '#D96B27',    // Primary Accent (10%) - CTAs, Active States, Alerts
        govSlate: '#134074',     // Secondary Accent - Sub-headings, Secondary buttons, Hover states
        govLight: '#EEF4F8',     // Background Light (60%) - Page/Section backgrounds, Form panels
        govText: '#020B14',      // Text Dark - Body text, Paragraphs, Input labels
      }
    }
  },
  plugins: [],
};
