/**
 * Indonesian Administrative Location Service (wilayah.id API)
 * Provides pre-built formatted locations for all Regencies (Kabupaten/Kota) and Provinces.
 */

// In-memory caching for API responses
const provincesCache = { data: null, timestamp: 0 };
const regenciesCache = {};
let allLocationsCache = null;

/**
 * Clean regency names for clean string output.
 * e.g. "Kabupaten Blitar" -> "Blitar", "Kota Surabaya" -> "Surabaya"
 */
export function cleanAreaName(name) {
  if (!name || typeof name !== 'string') return '';
  return name.replace(/^(Kabupaten|Kab\.|Kota)\s+/i, '').trim();
}

/**
 * Format location string to "Kabupaten/Kota, Provinsi"
 * e.g. "Blitar, Jawa Timur"
 */
export function formatLocationString(regencyName, provinceName) {
  const cleanKab = cleanAreaName(regencyName);
  const cleanProv = (provinceName || '').trim();
  const parts = [cleanKab, cleanProv].filter(Boolean);
  return parts.join(', ');
}

/**
 * Fetch list of all provinces
 * GET https://wilayah.id/api/provinces.json
 */
export async function getProvinces() {
  if (provincesCache.data) {
    return provincesCache.data;
  }

  try {
    const res = await fetch('https://wilayah.id/api/provinces.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const list = Array.isArray(json) ? json : json?.data || [];
    provincesCache.data = list;
    return list;
  } catch (err) {
    console.error('Failed to fetch provinces from wilayah.id:', err);
    return [];
  }
}

/**
 * Fetch regencies (Kabupaten/Kota) for a specific province
 * GET https://wilayah.id/api/regencies/[PROVINCE_CODE].json
 */
export async function getRegencies(provinceCode) {
  if (!provinceCode) return [];
  if (regenciesCache[provinceCode]) {
    return regenciesCache[provinceCode];
  }

  try {
    const res = await fetch(`https://wilayah.id/api/regencies/${provinceCode}.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const list = Array.isArray(json) ? json : json?.data || [];
    regenciesCache[provinceCode] = list;
    return list;
  } catch (err) {
    console.error(`Failed to fetch regencies for province ${provinceCode}:`, err);
    return [];
  }
}

/**
 * Get all Kabupaten/Kota + Provinsi combinations in Indonesia formatted as "Kabupaten/Kota, Provinsi"
 */
export async function getAllFormattedLocations() {
  if (allLocationsCache) {
    return allLocationsCache;
  }

  try {
    const provinces = await getProvinces();
    const regListPerProv = await Promise.all(
      provinces.map(async (prov) => {
        const regencies = await getRegencies(prov.code);
        return regencies.map(reg => ({
          code: reg.code,
          regencyName: reg.name,
          cleanRegencyName: cleanAreaName(reg.name),
          provinceName: prov.name,
          formatted: formatLocationString(reg.name, prov.name)
        }));
      })
    );

    const flat = regListPerProv.flatMap(list => list);

    // Deduplicate by formatted string
    const seen = new Set();
    allLocationsCache = flat.filter(item => {
      if (seen.has(item.formatted)) return false;
      seen.add(item.formatted);
      return true;
    });

    return allLocationsCache;
  } catch (err) {
    console.error('Failed to load all formatted locations:', err);
    return [];
  }
}

/**
 * Preload all location data in background
 */
export async function preloadLocationData() {
  await getAllFormattedLocations();
}

/**
 * Search locations across pre-built Regency & Province list
 */
export async function searchLocations(query) {
  const rawQ = (query || '').trim().toLowerCase();
  const allLocations = await getAllFormattedLocations();

  if (!rawQ) return allLocations;

  const parts = rawQ.split(',').map(s => s.trim()).filter(Boolean);

  return allLocations.filter(item => {
    const formattedLower = item.formatted.toLowerCase();
    const rawRegLower = item.regencyName.toLowerCase();
    const provLower = item.provinceName.toLowerCase();

    return parts.every(part => 
      formattedLower.includes(part) || rawRegLower.includes(part) || provLower.includes(part)
    );
  });
}
