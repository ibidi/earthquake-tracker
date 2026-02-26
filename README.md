# Earthquake Tracker Dashboard 🌍🇹🇷

A beautifully designed, real-time Earthquake Tracking Dashboard built specifically for Turkey and its surrounding regions. It leverages live data from the **Kandilli Observatory** and **AFAD** through the [Orhan Aydoğdu Deprem API](https://api.orhanaydogdu.com.tr/deprem).

Built with **Next.js (App Router)**, **React**, **Tailwind CSS**, and **React-Leaflet**, featuring a sleek premium dark-mode, glassmorphism UI, and smooth Framer Motion animations.

---

## ✨ Features

- **Live Earthquake Feed:** Fetches and displays real-time earthquake data automatically.
- **Interactive Map:** A dynamic Leaflet map tracking the latest epicenters with custom magnitude-scaled markers.
- **Dual API Providers:** Instantly toggle between `Kandilli` and `AFAD` data sources.
- **Smart Filtering:** Filter active earthquakes instantly by selecting specific cities.
- **Past Earthquake Search:** Query the API to find historical earthquake data based on city parameters.
- **Geolocation Distance:** Requests your browser location to calculate exactly how far (in `km`) each earthquake is from you!
- **Server Health Indicator:** Real-time API status ping and millisecond (`ms`) latency reporting.
- **Glassmorphism UI:** Stunning dark-mode aesthetics using heavy blur effects, smooth gradients, and `framer-motion` list animations.

---

## 🚀 Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Library:** React 18
- **Styling:** Tailwind CSS (v3.4) + Custom CSS variables
- **Animations:** Framer Motion
- **Map:** Leaflet.js & React-Leaflet
- **Icons:** Lucide React
- **Date Formatting:** date-fns

---

## ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ibidi/earthquake-tracker.git
   cd earthquake-tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🎨 Design System

The application uses custom Tailwind configuration to clearly distinguish earthquake severities:
- `mag-low` (< 3.0): Green tint
- `mag-medium` (3.0 - 4.0): Yellow tint
- `mag-high` (4.0 - 5.0): Orange tint
- `mag-extreme` (> 5.0): Red tint

These colors dynamically alter the marker dots on the map, the card borders, and the magnitude text colors for intuitive scanning.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit Pull Requests for bugs, new API features, or UI improvements.

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
