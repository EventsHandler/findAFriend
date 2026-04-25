<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const mapContainer = ref<HTMLElement | null>(null);
const map = ref<L.Map | null>(null);
const marker = ref<L.Marker | null>(null);
const location = ref<{ lat: number, lng: number } | null>(null);
const lastUpdate = ref<string>('Never');
const activePOI = ref<any>(null);

// Predefined Points of Interest (Exemple)
const pointsOfInterest = [
  { id: 1, lat: 47.023924, lng: 28.833546, label: 'ZONE A', type: 'objective' },
  { id: 2, lat: 44.425, lng: 26.110, label: 'SUPPLY DROP', type: 'reward' },
  { id: 3, lat: 44.418, lng: 26.095, label: 'ENCOUNTER', type: 'enemy' },
];

// Helper to create custom icons
const createCustomIcon = (colorClass: string, shadowColor: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="group relative">
             <div class="w-3 h-3 ${colorClass} rounded-full shadow-[0_0_10px_${shadowColor}] border border-white/50"></div>
             <div class="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-bold text-white bg-black/50 px-1 rounded backdrop-blur-sm border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
               LABEL
             </div>
           </div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });
};

const playerIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="w-4 h-4 bg-lime-400 rounded-full shadow-[0_0_15px_#84ff7a] border-2 border-white"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

const initMap = () => {
  if (!mapContainer.value) return;

  map.value = L.map(mapContainer.value, {
    zoomControl: false,
    attributionControl: false
  }).setView([44.4268, 26.1025], 14);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
  }).addTo(map.value);

  // Add the POIs to the map
  pointsOfInterest.forEach(poi => {
    let color = 'bg-lime-400';
    let shadow = '#84ff7a';

    if (poi.type === 'reward') {
      color = 'bg-orange-500';
      shadow = '#f97316';
    } else if (poi.type === 'enemy') {
      color = 'bg-red-500';
      shadow = '#ef4444';
    }

    const icon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="flex flex-col items-center">
               <div class="w-3 h-3 ${color} rounded-full shadow-[0_0_8px_${shadow}] border border-white/20"></div>
               <div class="text-[8px] text-white/70 mt-1 font-mono tracking-tighter uppercase">${poi.label}</div>
             </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 10]
    });

    const markerInstance = L.marker([poi.lat, poi.lng], { icon }).addTo(map.value!);

    if (poi.id === 1) {
    markerInstance.on('click', () => {
        activePOI.value = poi;
    });
    }
  });
};


const updateLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        location.value = { lat: latitude, lng: longitude };
        lastUpdate.value = new Date().toLocaleTimeString();
        
        if (map.value) {
          if (!marker.value) {
            marker.value = L.marker([latitude, longitude], { icon: playerIcon }).addTo(map.value);
            map.value.setView([latitude, longitude], 15);
          } else {
            marker.value.setLatLng([latitude, longitude]);
          }
        }
      },
      (error) => {
        console.error("Error getting location:", error);
      },
      { enableHighAccuracy: true }
    );
  }
};

let intervalId: any = null;

onMounted(() => {
  initMap();
  updateLocation();
  // Update location every 5 seconds
  intervalId = setInterval(updateLocation, 5000);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
  if (map.value) map.value.remove();
});
</script>

<template>
  <div class="min-h-screen bg-[#0b0f0c] text-white font-sans flex flex-col">
    <!-- TOP HUD -->
    <header class="p-4 flex justify-between items-center z-10 bg-[#0b0f0c]/80 backdrop-blur-md">
      <div class="flex items-center gap-2">
        <svg class="w-6 h-6 text-lime-400 animate-pulse" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" opacity="0.3"/>
          <circle cx="12" cy="12" r="6" stroke="currentColor" opacity="0.6"/>
          <path d="M12 12 L20 6" stroke="currentColor"/>
        </svg>
        <span class="text-sm tracking-widest text-lime-300 uppercase">Radar Scan</span>
      </div>

      <div class="flex items-center gap-3">
        <div class="text-[10px] text-gray-400 uppercase tracking-tighter text-right leading-none">
          Last Signal<br/>
          <span class="text-xs text-lime-400 font-mono">{{ lastUpdate }}</span>
        </div>
        <div class="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full border border-orange-500/30 font-bold">
          LVL 7
        </div>
      </div>
    </header>

    <!-- MAP AREA -->
    <div class="flex-1 relative overflow-hidden">
      <div ref="mapContainer" class="absolute inset-0 z-0"></div>
      
      <!-- Overlay Scan Lines -->
      <div class="absolute inset-0 pointer-events-none opacity-10 z-1"
           style="background: repeating-linear-gradient(0deg, transparent, transparent 2px, #84ff7a 3px);"></div>

      <!-- Objectives Overlay -->
      <div class="absolute top-4 left-4 z-10 pointer-events-none w-48 space-y-2">
        <div class="bg-[#101712]/80 border border-lime-500/20 p-2 rounded-lg backdrop-blur-sm pointer-events-auto">
          <div class="text-[8px] text-gray-500 tracking-widest uppercase mb-1">Active Objective</div>
          <div class="text-[10px] text-lime-300">Move 50m to decrypt</div>
        </div>
      </div>
      
      <!-- Overlay UI -->
      <div class="absolute bottom-6 left-4 right-4 z-10 pointer-events-none">
        <div class="bg-[#101712]/90 border border-lime-500/20 p-4 rounded-2xl backdrop-blur-sm pointer-events-auto shadow-2xl">
          <div class="flex justify-between items-start mb-2">
            <div>
              <div class="text-xs text-gray-400 tracking-widest uppercase">Coordinates</div>
              <div v-if="location" class="text-sm font-mono text-lime-300">
                {{ location.lat.toFixed(6) }}, {{ location.lng.toFixed(6) }}
              </div>
              <div v-else class="text-sm text-gray-500 animate-pulse italic">
                Acquiring GPS signal...
              </div>
            </div>
            <div class="bg-lime-500/10 text-lime-400 text-[10px] px-2 py-1 rounded border border-lime-400/20">
              SECURE LINK
            </div>
          </div>
          
          <div class="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div class="h-full bg-lime-400 w-full animate-[shimmer_2s_infinite]"></div>
          </div>
        </div>
      </div>
      
      <!-- Map Scanners (Visual only) -->
      <div class="absolute top-4 right-4 z-10 pointer-events-none flex flex-col gap-2">
         <div class="w-12 h-12 rounded-full border border-lime-500/20 flex items-center justify-center bg-[#0b0f0c]/40 backdrop-blur-sm">
            <svg class="w-6 h-6 text-lime-400/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <path d="M12 3v18M3 12h18" />
            </svg>
         </div>
      </div>
    </div>

    <!-- BOTTOM NAV -->
    <footer class="bg-[#0b0f0c] border-t border-lime-500/10 flex justify-around py-4 z-10">
      <router-link to="/MapPage" class="flex flex-col items-center text-lime-300 text-[10px] gap-1">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        TRACKER
      </router-link>

      <button class="flex flex-col items-center text-gray-500 text-[10px] gap-1">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
        SIGNAL
      </button>

      <router-link to="/me" class="flex flex-col items-center text-gray-500 text-[10px] gap-1">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        PROFILE
      </router-link>
    </footer>
  </div>
<div 
  v-if="activePOI"
  class="absolute top-20 right-4 z-20 w-56 bg-[#101712]/95 border border-lime-500/30 rounded-xl p-4 backdrop-blur-md shadow-xl"
>
  <div class="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
    Location Detected
  </div>

  <div class="text-sm text-lime-300 font-bold mb-2">
    {{ activePOI.label }}
  </div>

  <div class="text-xs text-gray-400 mb-3">
    Mission available in this zone.
  </div>

  <button 
    @click="startMission"
    class="w-full text-xs bg-lime-500/20 hover:bg-lime-500/30 border border-lime-400/30 text-lime-300 py-2 rounded transition"
  >
    ▶ Start Mission
  </button>

  <button 
    @click="activePOI = null"
    class="w-full mt-2 text-[10px] text-gray-500 hover:text-white"
  >
    Close
  </button>
</div>
</template>

<style scoped>
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.custom-div-icon {
  background: none;
  border: none;
}

/* Ensure Leaflet markers don't have default backgrounds if any styles bleed in */
:deep(.leaflet-marker-icon) {
  background: transparent;
  border: none;
}
</style>
