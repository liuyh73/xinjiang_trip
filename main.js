import { itinerary as defaultItinerary, spots as defaultSpots, activityTypes, shareText } from './data.js?v=20260506';

// ==================== 本地存储管理 ====================
const STORAGE_KEY = 'xj9days_custom_data_v1';

function loadCustomData() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed && parsed.itinerary && parsed.spots) return parsed;
    } catch (e) { console.warn('读取本地数据失败', e); }
    return null;
}
function saveCustomData(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch (e) { console.error('保存本地数据失败', e); return false; }
}
function clearCustomData() { localStorage.removeItem(STORAGE_KEY); }

// 可变的数据引用：深拷贝一份默认数据 + 本地覆盖
let state = (() => {
    const saved = loadCustomData();
    if (saved) {
        try {
            // 结构兼容性检测：老版本数据可能缺少 activities 字段，导致时间轴空白
            // 如果大部分天数没有 activities 数组，就认为结构不兼容，回退到默认数据
            const itiArr = Array.isArray(saved.itinerary) ? saved.itinerary : [];
            const hasActivitiesCount = itiArr.filter(d => d && Array.isArray(d.activities) && d.activities.length > 0).length;
            if (itiArr.length === 0 || hasActivitiesCount < itiArr.length / 2) {
                console.warn('本地数据结构与新版不兼容，使用默认数据');
                clearCustomData();
                return {
                    itinerary: JSON.parse(JSON.stringify(defaultItinerary)),
                    spots: JSON.parse(JSON.stringify(defaultSpots))
                };
            }
            // 保证小红书链接等新字段即使本地存储是老版本也能显示
            itiArr.forEach((day, idx) => {
                const def = defaultItinerary[idx];
                if (def && (!day.xhsLinks || !Array.isArray(day.xhsLinks) || day.xhsLinks.length === 0)) {
                    day.xhsLinks = JSON.parse(JSON.stringify(def.xhsLinks || []));
                }
                // 确保 activities 字段存在
                if (!Array.isArray(day.activities)) {
                    day.activities = def ? JSON.parse(JSON.stringify(def.activities || [])) : [];
                }
            });
            // 确保 spots 字段存在
            if (!Array.isArray(saved.spots) || saved.spots.length === 0) {
                saved.spots = JSON.parse(JSON.stringify(defaultSpots));
            }
        } catch (e) {
            console.warn('本地数据兼容处理失败，使用默认数据', e);
            clearCustomData();
            return {
                itinerary: JSON.parse(JSON.stringify(defaultItinerary)),
                spots: JSON.parse(JSON.stringify(defaultSpots))
            };
        }
        return saved;
    }
    return {
        itinerary: JSON.parse(JSON.stringify(defaultItinerary)),
        spots: JSON.parse(JSON.stringify(defaultSpots))
    };
})();

// ==================== 导航滚动效果 ====================
const navbar = document.getElementById('navbar');
if (navbar) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    });
}

// ==================== 地图相关 ====================
// 多瓦片源 fallback：优先使用高德（国内访问快）、其次 Esri（全球稳定）、最后 OSM
const TILE_SOURCES = [
    {
        name: 'AutoNavi',
        url: 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
        options: { subdomains: ['1','2','3','4'], attribution: '&copy; 高德地图', maxZoom: 18 }
    },
    {
        name: 'Esri',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        options: { attribution: '&copy; Esri', maxZoom: 18 }
    },
    {
        name: 'OSM-DE',
        url: 'https://tile.openstreetmap.de/{z}/{x}/{y}.png',
        options: { attribution: '&copy; OpenStreetMap contributors', maxZoom: 18 }
    },
    {
        name: 'OSM',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        options: { subdomains: ['a','b','c'], attribution: '&copy; OpenStreetMap contributors', maxZoom: 19, crossOrigin: true }
    }
];

/**
 * 为某个 Leaflet 地图添加瓦片层，并在瓦片加载失败时自动切换到下一个源
 */
function addResilientTileLayer(map) {
    let sourceIdx = 0;
    let currentLayer = null;
    function addNext() {
        if (sourceIdx >= TILE_SOURCES.length) return;
        const src = TILE_SOURCES[sourceIdx++];
        try {
            currentLayer = L.tileLayer(src.url, src.options);
            let errorCount = 0;
            const threshold = 3; // 连续失败超过阈值就切换下一源
            currentLayer.on('tileerror', () => {
                errorCount++;
                if (errorCount > threshold && sourceIdx < TILE_SOURCES.length) {
                    try { map.removeLayer(currentLayer); } catch(e){}
                    console.warn(`瓦片源 ${src.name} 频繁失败，切换到下一源`);
                    addNext();
                }
            });
            currentLayer.addTo(map);
        } catch (e) {
            console.warn('瓦片层初始化失败:', e);
            addNext();
        }
    }
    addNext();
}

/**
 * 等待 Leaflet 库加载就绪（考虑 CDN fallback 场景）
 */
function waitForLeaflet(maxMs = 8000) {
    return new Promise((resolve, reject) => {
        if (typeof L !== 'undefined') return resolve(true);
        const start = Date.now();
        const timer = setInterval(() => {
            if (typeof L !== 'undefined') {
                clearInterval(timer);
                resolve(true);
            } else if (Date.now() - start > maxMs) {
                clearInterval(timer);
                reject(new Error('Leaflet 加载超时'));
            }
        }, 100);
    });
}

// 日程颜色序列（更鲜艳的渐变色）
const DAY_COLORS = [
    '#ef4444', // red
    '#f59e0b', // amber
    '#eab308', // yellow
    '#10b981', // emerald
    '#06b6d4', // cyan
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#64748b'  // slate
];

let overviewMap = null;
let dayMap = null;
let dayMapLayers = []; // 存放当前 dayMap 上的图层，便于清空

// OSRM 路线请求缓存
const routeCache = new Map();

/**
 * 使用 OSRM 公共服务获取真实路网路线
 * @param {Array<[lat,lng]>} points - 路径点（至少2个）
 * @returns {Promise<Array<[lat,lng]>>} 返回路网路径点
 */
async function fetchRoute(points) {
    if (!points || points.length < 2) return points || [];
    const validPts = points.filter(p => p && p.length === 2 && !isNaN(p[0]) && !isNaN(p[1]));
    if (validPts.length < 2) return validPts;
    
    const key = validPts.map(p => `${p[0].toFixed(4)},${p[1].toFixed(4)}`).join(';');
    if (routeCache.has(key)) return routeCache.get(key);
    
    // OSRM 格式: lng,lat;lng,lat
    const coords = validPts.map(p => `${p[1]},${p[0]}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
    
    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        const resp = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);
        if (!resp.ok) throw new Error('OSRM 请求失败');
        const data = await resp.json();
        if (data.code !== 'Ok' || !data.routes || !data.routes[0]) throw new Error('OSRM 数据异常');
        // GeoJSON coordinates 格式: [lng, lat]
        const coordinates = data.routes[0].geometry.coordinates;
        const latlngs = coordinates.map(c => [c[1], c[0]]);
        routeCache.set(key, latlngs);
        return latlngs;
    } catch (e) {
        console.warn('路线规划失败，降级为直线:', e.message);
        // 降级：返回直线连接点
        routeCache.set(key, validPts);
        return validPts;
    }
}

/**
 * 创建带名称标签的地图标记
 */
function createNamedMarker(latlng, number, color, placeName, options = {}) {
    const size = options.size || 36;
    const showLabel = options.showLabel !== false;
    const labelPosition = options.labelPosition || 'right'; // 'right' 或 'bottom'
    
    const labelHtml = (showLabel && placeName) ? `
        <div class="xj-marker-label xj-marker-label-${labelPosition}">${placeName}</div>
    ` : '';
    
    const icon = L.divIcon({
        className: 'xj-marker',
        html: `
            <div class="xj-marker-wrap">
                <div class="xj-marker-pulse" style="background:${color};"></div>
                <div class="xj-marker-inner" style="background:linear-gradient(135deg, ${color}, ${shadeColor(color, -20)});">
                    <span class="xj-marker-num">${number}</span>
                </div>
                ${labelHtml}
            </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size/2, size/2]
    });
    return L.marker(latlng, { icon });
}

// 颜色加深/变浅工具
function shadeColor(color, percent) {
    const f = parseInt(color.slice(1), 16);
    const t = percent < 0 ? 0 : 255;
    const p = Math.abs(percent) / 100;
    const R = f >> 16, G = (f >> 8) & 0x00FF, B = f & 0x0000FF;
    return '#' + (
        0x1000000 +
        (Math.round((t - R) * p) + R) * 0x10000 +
        (Math.round((t - G) * p) + G) * 0x100 +
        (Math.round((t - B) * p) + B)
    ).toString(16).slice(1);
}

async function initOverviewMap() {
    if (overviewMap) return;
    try {
        await waitForLeaflet();
    } catch (e) {
        showMapFallback('overviewMap', '地图库加载失败，请检查网络后刷新页面');
        return;
    }
    try {
        overviewMap = L.map('overviewMap', {
            center: [43.5, 83],
            zoom: 7,
            zoomControl: true,
            scrollWheelZoom: false,
        });
        addResilientTileLayer(overviewMap);
        renderOverviewMap();
    } catch (e) {
        console.error('概览地图初始化失败:', e);
        showMapFallback('overviewMap', '地图初始化失败');
    }
}

async function renderOverviewMap() {
    if (!overviewMap) return;
    // 清除非瓦片图层
    overviewMap.eachLayer(layer => {
        if (!(layer instanceof L.TileLayer)) overviewMap.removeLayer(layer);
    });

    const allPoints = [];
    // 为每一天先放置标记
    state.itinerary.forEach((day, dayIdx) => {
        const color = DAY_COLORS[dayIdx % DAY_COLORS.length];
        const acts = (day.activities || []).filter(a => a.location && Array.isArray(a.location));
        acts.forEach((act, i) => {
            const latlng = [act.location[1], act.location[0]];
            allPoints.push(latlng);

            // 概览图只显示每天的第一个点为 Day 标记（主锚点）
            const isAnchor = (i === 0);
            const markerHtml = isAnchor
                ? `
                    <div class="xj-marker-wrap">
                        <div class="xj-marker-pulse" style="background:${color};"></div>
                        <div class="xj-marker-inner xj-marker-day" style="background:linear-gradient(135deg, ${color}, ${shadeColor(color, -25)});">
                            <span class="xj-marker-num">D${day.day}</span>
                        </div>
                        <div class="xj-marker-label xj-marker-label-bottom">${act.place || day.title}</div>
                    </div>
                `
                : `
                    <div class="xj-marker-wrap">
                        <div class="xj-marker-dot" style="background:${color};border-color:${shadeColor(color, -20)};"></div>
                    </div>
                `;
            const icon = L.divIcon({
                className: 'xj-marker',
                html: markerHtml,
                iconSize: isAnchor ? [36, 36] : [14, 14],
                iconAnchor: isAnchor ? [18, 18] : [7, 7]
            });
            const marker = L.marker(latlng, { icon, zIndexOffset: isAnchor ? 1000 : 0 }).addTo(overviewMap);
            marker.bindPopup(`
                <div style="min-width:200px;">
                    <div style="font-weight:700;font-size:13px;color:${color};margin-bottom:6px;display:flex;align-items:center;gap:6px;">
                        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};"></span>
                        Day ${day.day} · ${day.date}
                    </div>
                    <div style="font-weight:600;margin-bottom:3px;color:#1f2937;">${act.time} ${act.title || act.text || ''}</div>
                    <div style="font-size:12px;color:#6b7280;">📍 ${act.place || ''}</div>
                </div>
            `);
        });
    });

    if (allPoints.length > 0) {
        overviewMap.fitBounds(L.latLngBounds(allPoints).pad(0.15));
    }

    // 异步获取每天的路网路线并绘制
    for (let dayIdx = 0; dayIdx < state.itinerary.length; dayIdx++) {
        const day = state.itinerary[dayIdx];
        const color = DAY_COLORS[dayIdx % DAY_COLORS.length];
        const acts = (day.activities || []).filter(a => a.location && Array.isArray(a.location));
        if (acts.length < 2) continue;
        
        // 抽取关键点：每日首尾 + 每天之间连接
        const pts = acts.map(a => [a.location[1], a.location[0]]);
        
        fetchRoute(pts).then(routePts => {
            if (!overviewMap || routePts.length < 2) return;
            // 绘制当日路线（底层阴影）
            L.polyline(routePts, {
                color: 'white',
                weight: 6,
                opacity: 0.8,
                lineCap: 'round',
                lineJoin: 'round'
            }).addTo(overviewMap);
            // 顶层有色线
            L.polyline(routePts, {
                color,
                weight: 3.5,
                opacity: 0.9,
                lineCap: 'round',
                lineJoin: 'round'
            }).addTo(overviewMap);
        });
    }
    
    // 绘制日之间的连接（跨日虚线）
    for (let i = 0; i < state.itinerary.length - 1; i++) {
        const curDay = state.itinerary[i];
        const nextDay = state.itinerary[i+1];
        const curActs = (curDay.activities || []).filter(a => a.location);
        const nextActs = (nextDay.activities || []).filter(a => a.location);
        if (curActs.length === 0 || nextActs.length === 0) continue;
        const from = curActs[curActs.length - 1].location;
        const to = nextActs[0].location;
        // 不同一天的首尾如果坐标相同/接近就跳过
        if (Math.abs(from[0] - to[0]) < 0.01 && Math.abs(from[1] - to[1]) < 0.01) continue;
        L.polyline([[from[1], from[0]], [to[1], to[0]]], {
            color: '#94a3b8',
            weight: 1.5,
            opacity: 0.5,
            dashArray: '4,6'
        }).addTo(overviewMap);
    }
}

async function initDayMap() {
    if (dayMap) return;
    try {
        await waitForLeaflet();
    } catch (e) {
        showMapFallback('dayMap', '地图库加载失败');
        return;
    }
    try {
        dayMap = L.map('dayMap', {
            center: [43.5, 83],
            zoom: 8,
            scrollWheelZoom: false,
            zoomControl: true
        });
        addResilientTileLayer(dayMap);
    } catch (e) {
        console.error('每日地图初始化失败:', e);
        showMapFallback('dayMap', '地图初始化失败');
    }
}

async function renderDayMap(dayIdx) {
    await initDayMap();
    if (!dayMap) return;
    // 清除之前的图层
    dayMapLayers.forEach(layer => { try { dayMap.removeLayer(layer); } catch(e){} });
    dayMapLayers = [];

    const day = state.itinerary[dayIdx];
    if (!day) return;
    const color = DAY_COLORS[dayIdx % DAY_COLORS.length];
    const acts = (day.activities || []).filter(a => a.location && Array.isArray(a.location));
    const pts = acts.map(a => [a.location[1], a.location[0]]);
    
    // 绘制标记（带名称标签）
    acts.forEach((act, i) => {
        const latlng = [act.location[1], act.location[0]];
        const num = i + 1;
        const marker = createNamedMarker(latlng, num, color, act.place || act.title || '', {
            size: 40,
            showLabel: true,
            labelPosition: i % 2 === 0 ? 'right' : 'bottom'
        }).addTo(dayMap);
        
        marker.bindPopup(`
            <div style="min-width:220px;">
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
                    <span style="display:inline-block;padding:2px 8px;background:${color};color:white;font-size:11px;border-radius:9999px;font-weight:600;">${num}</span>
                    <span style="font-size:11px;color:#9ca3af;">${act.time} · ${(activityTypes[act.type]||{}).text||''}</span>
                </div>
                <div style="font-weight:700;margin-bottom:4px;color:#1f2937;font-size:14px;">${act.title || act.text || ''}</div>
                <div style="font-size:12px;color:#6b7280;display:flex;align-items:flex-start;gap:4px;">
                    <i class="ri-map-pin-2-fill" style="color:${color};margin-top:2px;"></i>
                    <span>${act.place || ''}</span>
                </div>
            </div>
        `);
        dayMapLayers.push(marker);
    });
    
    // 先画直线作为 fallback，防止慢速网络
    if (pts.length >= 2) {
        const fallbackLine = L.polyline(pts, {
            color,
            weight: 3,
            opacity: 0.3,
            dashArray: '4,6'
        }).addTo(dayMap);
        dayMapLayers.push(fallbackLine);
    }
    
    // 调整视野
    setTimeout(() => {
        dayMap.invalidateSize();
        if (pts.length > 0) dayMap.fitBounds(L.latLngBounds(pts).pad(0.3));
        else if (day.mapCenter) dayMap.setView([day.mapCenter[1], day.mapCenter[0]], day.mapZoom || 8);
    }, 100);

    // 渲染路线列表
    const listEl = document.getElementById('dayPathList');
    listEl.innerHTML = `
        <div class="flex items-center justify-between mb-2.5">
            <div class="text-gray-600 text-xs font-semibold flex items-center gap-1">
                <i class="ri-route-line" style="color:${color};"></i>
                <span>导航路线节点</span>
            </div>
            <span class="text-[10px] text-gray-400">共 ${acts.length} 站</span>
        </div>
        <div class="path-list space-y-1">
            ${acts.map((act, i) => `
                <div class="path-item">
                    <span class="path-num" style="background:${color};">${i+1}</span>
                    <span class="path-time">${act.time}</span>
                    <span class="path-name" title="${escapeAttr(act.place || act.title || '')}">${act.place || act.title || ''}</span>
                </div>
            `).join('')}
        </div>
    `;
    document.getElementById('dayMapLabel').textContent = `Day ${day.day} · ${day.date}`;
    
    // 异步获取 OSRM 真实路网
    if (pts.length >= 2) {
        const routePts = await fetchRoute(pts);
        if (routePts.length >= 2) {
            // 底层白色阴影线
            const shadowLine = L.polyline(routePts, {
                color: 'white',
                weight: 9,
                opacity: 0.9,
                lineCap: 'round',
                lineJoin: 'round'
            }).addTo(dayMap);
            dayMapLayers.push(shadowLine);
            
            // 顶层彩色线
            const mainLine = L.polyline(routePts, {
                color,
                weight: 5,
                opacity: 0.95,
                lineCap: 'round',
                lineJoin: 'round'
            }).addTo(dayMap);
            dayMapLayers.push(mainLine);
            
            // 方向装饰虚线
            const arrowLine = L.polyline(routePts, {
                color: 'rgba(255,255,255,0.85)',
                weight: 2,
                opacity: 0.9,
                dashArray: '2,10',
                lineCap: 'round'
            }).addTo(dayMap);
            dayMapLayers.push(arrowLine);
            
            // 重新 fitBounds 包含路线
            try {
                dayMap.fitBounds(L.latLngBounds(routePts).pad(0.2));
            } catch(e){}
        }
    }
}

// ==================== 渲染 Day 切换按钮 ====================
let currentDayIdx = 0;
function renderDayTabs() {
    const container = document.getElementById('dayTabs');
    container.innerHTML = state.itinerary.map((day, idx) => `
        <button class="day-tab ${idx === currentDayIdx ? 'active' : ''}" data-idx="${idx}">
            <i class="ri-${getTabIcon(idx)} text-base"></i>
            <span>Day ${day.day}</span>
        </button>
    `).join('');
    container.querySelectorAll('.day-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.idx);
            switchDay(idx);
        });
    });
}

function getTabIcon(idx) {
    const icons = ['rocket-line','road-map-line','landscape-line','plant-line','leaf-line','snowflake-line','route-line','compass-3-line','home-5-line'];
    return icons[idx % icons.length];
}

function switchDay(idx) {
    currentDayIdx = idx;
    renderDayTabs();
    renderDayHeader(idx);
    renderDayActivities(idx);
    renderDayMap(idx);
}

// ==================== 渲染 Day 标题 ====================
function renderDayHeader(idx) {
    const day = state.itinerary[idx];
    if (!day) return;
    document.getElementById('dayHeader').innerHTML = `
        <div class="font-serif-sc text-3xl md:text-4xl font-bold text-xj-ink mb-2">
            Day ${day.day} · ${day.title}
        </div>
        <div class="text-sm text-gray-500 flex items-center justify-center gap-3 flex-wrap">
            <span class="inline-flex items-center gap-1"><i class="ri-calendar-line"></i>${day.date} · ${day.weekday}</span>
            <span class="inline-flex items-center gap-1"><i class="ri-route-line"></i>${day.theme || (day.from + ' → ' + day.to)}</span>
        </div>
        ${day.tips ? `
            <div class="mt-4 inline-block max-w-2xl mx-auto px-4 py-2 bg-amber-50 text-xs text-gray-600 rounded-lg border-l-2 border-xj-gold text-left">
                💡 ${day.tips}
            </div>
        ` : ''}
    `;
}

// ==================== 渲染每日活动卡片（截图样式） ====================
function renderDayActivities(idx) {
    const day = state.itinerary[idx];
    const container = document.getElementById('dayActivities');
    if (!day) { container.innerHTML = ''; return; }

    const activitiesHtml = (day.activities || []).map((act, i) => {
        const type = activityTypes[act.type] || activityTypes.spot;
        return `
            <div class="activity-item" style="--dot-color:${type.fg};">
                <div class="activity-dot"></div>
                <div class="activity-card" style="--card-color:${type.fg};">
                    <div class="flex items-center gap-2 mb-2 flex-wrap">
                        <span class="activity-time">${act.time}</span>
                        <span class="activity-tag" style="background:${type.bg};color:${type.fg};">${type.text}</span>
                        ${act.place ? `<span class="text-[11px] text-gray-400 inline-flex items-center gap-0.5"><i class="ri-map-pin-2-line"></i>${act.place}</span>` : ''}
                    </div>
                    <div class="activity-title">
                        <span class="activity-icon">${act.icon || '📌'}</span>
                        <span>${act.title || act.text || ''}</span>
                    </div>
                    ${act.desc ? `<div class="activity-desc">${act.desc}</div>` : ''}
                </div>
            </div>
        `;
    }).join('');

    // 小红书攻略区域
    const xhsHtml = (day.xhsLinks && day.xhsLinks.length > 0) ? `
        <div class="xhs-section">
            <div class="xhs-header">
                <div class="xhs-icon-wrap">
                    <div class="xhs-icon">小</div>
                </div>
                <div class="flex-1">
                    <div class="xhs-title">小红书攻略参考</div>
                    <div class="xhs-subtitle">当天行程的真实出行攻略，点击跳转查看</div>
                </div>
                <span class="xhs-count">${day.xhsLinks.length} 篇</span>
            </div>
            <div class="xhs-list">
                ${day.xhsLinks.map((link, i) => `
                    <a class="xhs-item" href="${link.url}" target="_blank" rel="noopener" title="${escapeAttr(link.title)}">
                        <span class="xhs-item-idx">${i+1}</span>
                        <div class="xhs-item-body">
                            <div class="xhs-item-title">${link.title}</div>
                            <div class="xhs-item-meta">
                                <i class="ri-book-open-line"></i>
                                <span>小红书攻略</span>
                                <i class="ri-external-link-line ml-auto"></i>
                            </div>
                        </div>
                    </a>
                `).join('')}
            </div>
        </div>
    ` : '';

    container.innerHTML = activitiesHtml + xhsHtml;
}

// ==================== 渲染景点 ====================
function renderSpots(filter = 'all') {
    const container = document.getElementById('spotsContainer');
    const filtered = filter === 'all' ? state.spots : state.spots.filter(s => s.category === filter);
    container.innerHTML = filtered.map(spot => `
        <div class="spot-card" data-spot-id="${spot.id}">
            <div class="spot-img">
                <img src="${spot.img}" alt="${spot.name}" loading="lazy">
                <span class="spot-tag">${spot.tag}</span>
                <span class="spot-day-badge">${spot.day}</span>
            </div>
            <div class="spot-body">
                <div class="spot-title">
                    <span>${spot.name}</span>
                    <i class="ri-arrow-right-up-line text-xj-gold"></i>
                </div>
                <div class="spot-subtitle">${spot.nameEn} · ${spot.categoryText}</div>
                <div class="spot-desc">${spot.desc}</div>
                <div class="spot-meta">
                    <span class="spot-meta-item"><i class="ri-mountain-line"></i>${spot.altitude}</span>
                    <span class="spot-meta-item"><i class="ri-time-line"></i>${spot.duration}</span>
                    <span class="spot-meta-item"><i class="ri-ticket-line"></i>${spot.ticket}</span>
                </div>
            </div>
        </div>
    `).join('');
    container.querySelectorAll('.spot-card').forEach(card => {
        card.addEventListener('click', () => openSpotModal(card.dataset.spotId));
    });
}

function openSpotModal(spotId) {
    const spot = state.spots.find(s => s.id === spotId);
    if (!spot) return;
    const highlightsHtml = (spot.highlights || []).map(h => `
        <li class="flex items-start gap-2 py-1">
            <span class="text-xj-gold mt-1 flex-shrink-0"><i class="ri-checkbox-circle-fill"></i></span>
            <span class="text-sm text-gray-700 leading-relaxed">${h}</span>
        </li>
    `).join('');
    const content = `
        <img src="${spot.img}" alt="${spot.name}" class="modal-hero">
        <div class="modal-body">
            <div class="flex items-center gap-2 mb-2 flex-wrap">
                <span class="px-3 py-1 bg-xj-gold/10 text-xj-gold text-xs rounded-full">${spot.day}</span>
                <span class="px-3 py-1 bg-xj-sky/10 text-xj-sky text-xs rounded-full">${spot.categoryText}</span>
                <span class="px-3 py-1 bg-xj-grass/10 text-xj-grass text-xs rounded-full">${spot.tag}</span>
            </div>
            <div class="modal-title">${spot.name}</div>
            <div class="modal-subtitle">${spot.nameEn}</div>
            <div class="modal-info-grid">
                <div class="modal-info-item"><div class="modal-info-label">🏔️ 海拔</div><div class="modal-info-value">${spot.altitude}</div></div>
                <div class="modal-info-item"><div class="modal-info-label">⏱️ 建议游玩</div><div class="modal-info-value">${spot.duration}</div></div>
                <div class="modal-info-item"><div class="modal-info-label">🎫 门票</div><div class="modal-info-value">${spot.ticket}</div></div>
            </div>
            <div class="modal-section" style="margin-top:1.5rem;">
                <div class="modal-section-title"><i class="ri-book-open-line"></i>景点介绍</div>
                <div class="modal-section-content">${spot.desc}</div>
            </div>
            <div class="modal-section">
                <div class="modal-section-title"><i class="ri-star-line"></i>游玩亮点</div>
                <ul class="modal-section-content">${highlightsHtml}</ul>
            </div>
            <div class="modal-section">
                <div class="modal-section-title"><i class="ri-lightbulb-line"></i>游玩贴士</div>
                <div class="p-4 bg-amber-50 border-l-4 border-xj-gold rounded-lg">
                    <div class="text-sm text-gray-700 leading-relaxed">${spot.tip}</div>
                </div>
            </div>
        </div>
    `;
    document.getElementById('modalContent').innerHTML = content;
    const modal = document.getElementById('spotModal');
    modal.classList.add('active');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}
function closeSpotModal() {
    const modal = document.getElementById('spotModal');
    modal.classList.remove('active');
    modal.style.display = 'none';
    document.body.style.overflow = '';
}
document.getElementById('closeModal').addEventListener('click', closeSpotModal);
document.getElementById('spotModal').addEventListener('click', (e) => {
    if (e.target.id === 'spotModal') closeSpotModal();
});

// 景点筛选
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderSpots(btn.dataset.filter);
    });
});

// ==================== 渲染酒店 ====================
function renderHotels() {
    const container = document.getElementById('hotelsContainer');
    const hotelDays = state.itinerary.filter(d => d.hotel && d.hotelPrice > 0);
    container.innerHTML = hotelDays.map(day => `
        <div class="hotel-card">
            <div class="hotel-day">DAY ${day.day} · ${day.date}</div>
            <div class="hotel-name">${day.hotel}</div>
            <div class="hotel-loc">
                <i class="ri-map-pin-line text-xj-gold"></i>
                <span>${day.to}</span>
            </div>
            <div class="hotel-price">
                <div class="hotel-price-num">¥${day.hotelPrice}<span class="text-sm text-gray-400 font-normal ml-1">/晚</span></div>
                <span class="hotel-tag ${day.breakfast ? '' : 'no-breakfast'}">${day.breakfast ? '含早餐' : '不含早'}</span>
            </div>
        </div>
    `).join('');
    const total = hotelDays.reduce((s, d) => s + (d.hotelPrice || 0), 0);
    document.getElementById('hotelTotal').textContent = `¥ ${total.toLocaleString()}`;
    document.getElementById('hotelAvg').textContent = hotelDays.length > 0
        ? `均价约 ¥${Math.round(total / hotelDays.length)}/晚（视房型可能浮动）`
        : '';
}

// ==================== 分享 ====================
const shareBtn = document.getElementById('shareBtn');
const shareModal = document.getElementById('shareModal');
const closeShareModal = document.getElementById('closeShareModal');
const shareUrl = document.getElementById('shareUrl');
const copyBtn = document.getElementById('copyBtn');
const copyBtnText = document.getElementById('copyBtnText');

shareBtn.addEventListener('click', () => {
    shareUrl.value = window.location.href;
    shareModal.classList.add('active');
    shareModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
});
closeShareModal.addEventListener('click', () => { shareModal.classList.remove('active'); shareModal.style.display='none'; document.body.style.overflow=''; });
shareModal.addEventListener('click', (e) => { if (e.target.id === 'shareModal') { shareModal.classList.remove('active'); shareModal.style.display='none'; document.body.style.overflow=''; } });
copyBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl.value}`);
        copyBtnText.textContent = '已复制!';
        setTimeout(() => { copyBtnText.textContent = '复制'; }, 2000);
    } catch (err) {
        shareUrl.select();
        document.execCommand('copy');
        copyBtnText.textContent = '已复制!';
        setTimeout(() => { copyBtnText.textContent = '复制'; }, 2000);
    }
});
document.querySelectorAll('.share-option').forEach(opt => {
    opt.addEventListener('click', () => {
        shareUrl.select();
        navigator.clipboard?.writeText(`${shareText}\n${shareUrl.value}`);
        alert('✅ 链接已复制，请粘贴分享');
    });
});

// ==================== 数据编辑面板 ====================
const editBtn = document.getElementById('editBtn');
const editModal = document.getElementById('editModal');
const closeEditModal = document.getElementById('closeEditModal');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const saveEditBtn = document.getElementById('saveEditBtn');
const resetBtn = document.getElementById('resetBtn');
const exportBtn = document.getElementById('exportBtn');
const importInput = document.getElementById('importInput');
const jsonEditor = document.getElementById('jsonEditor');
const editStatus = document.getElementById('editStatus');

// 编辑器内部数据（独立于 state，避免未保存时影响页面）
let editingData = null;
let editingDayIdx = 0;

function openEditModal() {
    editingData = JSON.parse(JSON.stringify(state));
    editingDayIdx = currentDayIdx;
    renderEditDayList();
    renderEditDayContent();
    jsonEditor.value = JSON.stringify(editingData, null, 2);
    editModal.classList.add('active');
    editModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    setEditStatus('✅ 已加载当前数据，修改后请点击「保存并应用」');
}
function hideEditModal() {
    editModal.classList.remove('active');
    editModal.style.display = 'none';
    document.body.style.overflow = '';
}
function setEditStatus(text, isError=false) {
    editStatus.textContent = text;
    editStatus.className = 'text-xs ' + (isError ? 'text-red-500' : 'text-gray-500');
}

editBtn.addEventListener('click', openEditModal);
closeEditModal.addEventListener('click', hideEditModal);
cancelEditBtn.addEventListener('click', hideEditModal);
editModal.addEventListener('click', (e) => { if (e.target.id === 'editModal') hideEditModal(); });

// Tab 切换
document.querySelectorAll('.edit-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.edit-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.dataset.tab;
        document.getElementById('editFormPanel').classList.toggle('hidden', target !== 'form');
        document.getElementById('editJsonPanel').classList.toggle('hidden', target !== 'json');
        if (target === 'json') {
            jsonEditor.value = JSON.stringify(editingData, null, 2);
        } else {
            // 从 JSON 同步回表单
            try {
                const parsed = JSON.parse(jsonEditor.value);
                if (parsed && parsed.itinerary && parsed.spots) {
                    editingData = parsed;
                    renderEditDayList();
                    renderEditDayContent();
                }
            } catch (e) { /* 忽略 */ }
        }
    });
});

// 左侧 day 列表
function renderEditDayList() {
    const container = document.getElementById('editDayList');
    const days = editingData.itinerary || [];
    container.innerHTML = `
        <div class="text-[11px] text-gray-400 px-2 mb-2 font-semibold tracking-wider">每日行程</div>
        ${days.map((d, i) => `
            <div class="edit-day-item ${i === editingDayIdx ? 'active' : ''}" data-idx="${i}">
                <span class="edit-day-num">${d.day}</span>
                <div class="flex-1 min-w-0">
                    <div class="font-medium text-sm truncate">${d.title || ''}</div>
                    <div class="text-[10px] text-gray-400">${d.date || ''}</div>
                </div>
            </div>
        `).join('')}
        <button id="addDayBtn" class="w-full mt-3 py-2 text-xs border-2 border-dashed border-gray-300 hover:border-xj-gold hover:text-xj-gold rounded-xl text-gray-400 transition flex items-center justify-center gap-1">
            <i class="ri-add-line"></i> 新增一天
        </button>
    `;
    container.querySelectorAll('.edit-day-item').forEach(item => {
        item.addEventListener('click', () => {
            // 保存当前表单数据
            syncFormToData();
            editingDayIdx = parseInt(item.dataset.idx);
            renderEditDayList();
            renderEditDayContent();
        });
    });
    const addBtn = container.querySelector('#addDayBtn');
    if (addBtn) addBtn.addEventListener('click', () => {
        syncFormToData();
        const nextDay = (editingData.itinerary[editingData.itinerary.length - 1]?.day || 0) + 1;
        editingData.itinerary.push({
            day: nextDay, date: '', weekday: '', title: '新的一天', theme: '', from: '', to: '',
            activities: [], hotel: null, hotelPrice: 0, breakfast: false, tips: '',
            mapCenter: [83, 43.5], mapZoom: 8
        });
        editingDayIdx = editingData.itinerary.length - 1;
        renderEditDayList();
        renderEditDayContent();
    });
}

// 右侧编辑区
function renderEditDayContent() {
    const container = document.getElementById('editDayContent');
    const day = editingData.itinerary[editingDayIdx];
    if (!day) { container.innerHTML = '<div class="text-gray-400">请选择一天</div>'; return; }
    container.innerHTML = `
        <div class="flex items-center justify-between mb-5">
            <h4 class="font-serif-sc text-xl font-bold">编辑 Day ${day.day}</h4>
            <button id="deleteDayBtn" class="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                <i class="ri-delete-bin-line"></i> 删除此日
            </button>
        </div>

        <div class="grid grid-cols-2 gap-3 mb-4">
            <label class="edit-field"><span>第几天 (day)</span><input type="number" data-path="day" value="${day.day ?? ''}"></label>
            <label class="edit-field"><span>日期 (date)</span><input type="text" data-path="date" value="${escapeAttr(day.date)}" placeholder="如 06.13"></label>
            <label class="edit-field"><span>星期</span><input type="text" data-path="weekday" value="${escapeAttr(day.weekday)}"></label>
            <label class="edit-field"><span>标题</span><input type="text" data-path="title" value="${escapeAttr(day.title)}"></label>
            <label class="edit-field col-span-2"><span>主题（副标题）</span><input type="text" data-path="theme" value="${escapeAttr(day.theme)}" placeholder="如 伊犁 → 尼勒克 → 唐布拉"></label>
            <label class="edit-field"><span>起点</span><input type="text" data-path="from" value="${escapeAttr(day.from)}"></label>
            <label class="edit-field"><span>终点</span><input type="text" data-path="to" value="${escapeAttr(day.to)}"></label>
            <label class="edit-field"><span>住宿名称</span><input type="text" data-path="hotel" value="${escapeAttr(day.hotel || '')}"></label>
            <label class="edit-field"><span>住宿价格</span><input type="number" data-path="hotelPrice" value="${day.hotelPrice ?? 0}"></label>
            <label class="edit-field flex-row items-center gap-2">
                <input type="checkbox" data-path="breakfast" ${day.breakfast ? 'checked' : ''} style="width:auto;"> 
                <span>含早餐</span>
            </label>
            <label class="edit-field col-span-2"><span>小贴士</span><textarea data-path="tips" rows="2">${escapeHtml(day.tips || '')}</textarea></label>
        </div>

        <div class="border-t border-gray-100 pt-5">
            <div class="flex items-center justify-between mb-3">
                <h5 class="font-semibold text-sm flex items-center gap-1"><i class="ri-list-check-2 text-xj-gold"></i>活动列表</h5>
                <button id="addActivityBtn" class="px-3 py-1.5 bg-xj-gold/10 hover:bg-xj-gold/20 text-xj-gold text-xs rounded-full flex items-center gap-1">
                    <i class="ri-add-line"></i> 新增活动
                </button>
            </div>
            <div id="activitiesEdit" class="space-y-3">
                ${(day.activities || []).map((act, i) => renderActivityEditor(act, i)).join('')}
            </div>
        </div>
    `;

    // 绑定事件
    container.querySelectorAll('input[data-path], textarea[data-path]').forEach(input => {
        input.addEventListener('input', syncFormToData);
        input.addEventListener('change', syncFormToData);
    });
    container.querySelector('#deleteDayBtn').addEventListener('click', () => {
        if (!confirm('确定删除这一天吗？')) return;
        editingData.itinerary.splice(editingDayIdx, 1);
        if (editingDayIdx >= editingData.itinerary.length) editingDayIdx = editingData.itinerary.length - 1;
        renderEditDayList();
        renderEditDayContent();
    });
    container.querySelector('#addActivityBtn').addEventListener('click', () => {
        syncFormToData();
        editingData.itinerary[editingDayIdx].activities.push({
            time: '', title: '', desc: '', icon: '📌', type: 'spot', location: [83, 43.5], place: ''
        });
        renderEditDayContent();
    });
    bindActivityEvents();
}

function renderActivityEditor(act, i) {
    return `
        <div class="activity-edit" data-act-idx="${i}">
            <div class="flex items-start gap-2 mb-2">
                <div class="flex-shrink-0 w-6 h-6 rounded-full bg-xj-gold text-white text-xs flex items-center justify-center">${i+1}</div>
                <div class="flex-1 grid grid-cols-2 gap-2">
                    <input type="text" class="edit-input" data-field="time" value="${escapeAttr(act.time)}" placeholder="时间 如 09:00">
                    <select class="edit-input" data-field="type">
                        ${Object.keys(activityTypes).map(k => `<option value="${k}" ${act.type===k?'selected':''}>${activityTypes[k].text} (${k})</option>`).join('')}
                    </select>
                    <input type="text" class="edit-input col-span-2" data-field="title" value="${escapeAttr(act.title)}" placeholder="活动标题">
                    <textarea class="edit-input col-span-2" data-field="desc" rows="2" placeholder="详细描述">${escapeHtml(act.desc || '')}</textarea>
                    <input type="text" class="edit-input" data-field="icon" value="${escapeAttr(act.icon)}" placeholder="Emoji图标 🏔️">
                    <input type="text" class="edit-input" data-field="place" value="${escapeAttr(act.place)}" placeholder="地点名称">
                    <input type="number" step="0.0001" class="edit-input" data-field="lng" value="${act.location?.[0] ?? ''}" placeholder="经度 lng">
                    <input type="number" step="0.0001" class="edit-input" data-field="lat" value="${act.location?.[1] ?? ''}" placeholder="纬度 lat">
                </div>
                <button class="delete-act flex-shrink-0 w-7 h-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center" title="删除活动">
                    <i class="ri-delete-bin-line"></i>
                </button>
            </div>
        </div>
    `;
}

function bindActivityEvents() {
    const container = document.getElementById('activitiesEdit');
    if (!container) return;
    container.querySelectorAll('.activity-edit').forEach(el => {
        el.querySelectorAll('input[data-field], textarea[data-field], select[data-field]').forEach(input => {
            input.addEventListener('input', syncFormToData);
            input.addEventListener('change', syncFormToData);
        });
        el.querySelector('.delete-act').addEventListener('click', () => {
            const idx = parseInt(el.dataset.actIdx);
            editingData.itinerary[editingDayIdx].activities.splice(idx, 1);
            renderEditDayContent();
        });
    });
}

function syncFormToData() {
    const day = editingData.itinerary[editingDayIdx];
    if (!day) return;
    // 日属性
    document.querySelectorAll('#editDayContent [data-path]').forEach(input => {
        const path = input.dataset.path;
        let val = input.type === 'checkbox' ? input.checked : (input.type === 'number' ? Number(input.value) : input.value);
        day[path] = val;
    });
    // 活动
    const actEls = document.querySelectorAll('#activitiesEdit .activity-edit');
    actEls.forEach(el => {
        const idx = parseInt(el.dataset.actIdx);
        const act = day.activities[idx];
        if (!act) return;
        el.querySelectorAll('input[data-field], textarea[data-field], select[data-field]').forEach(input => {
            const field = input.dataset.field;
            if (field === 'lng' || field === 'lat') {
                if (!Array.isArray(act.location)) act.location = [0,0];
                const v = parseFloat(input.value);
                if (field === 'lng') act.location[0] = isNaN(v) ? 0 : v;
                else act.location[1] = isNaN(v) ? 0 : v;
            } else {
                act[field] = input.value;
            }
        });
    });
}

// 保存
saveEditBtn.addEventListener('click', () => {
    // 如果当前在 JSON 面板，从 JSON 同步
    const isJson = !document.getElementById('editJsonPanel').classList.contains('hidden');
    if (isJson) {
        try {
            const parsed = JSON.parse(jsonEditor.value);
            if (!parsed.itinerary || !parsed.spots) throw new Error('JSON 必须包含 itinerary 和 spots 字段');
            editingData = parsed;
        } catch (e) {
            setEditStatus('❌ JSON 格式错误: ' + e.message, true);
            return;
        }
    } else {
        syncFormToData();
    }
    state = JSON.parse(JSON.stringify(editingData));
    saveCustomData(state);
    reloadAll();
    setEditStatus('✅ 已保存并应用到页面');
    setTimeout(hideEditModal, 500);
});

// 重置
resetBtn.addEventListener('click', () => {
    if (!confirm('确定要重置为默认数据吗？本地修改将被清除。')) return;
    clearCustomData();
    state = {
        itinerary: JSON.parse(JSON.stringify(defaultItinerary)),
        spots: JSON.parse(JSON.stringify(defaultSpots))
    };
    editingData = JSON.parse(JSON.stringify(state));
    editingDayIdx = 0;
    renderEditDayList();
    renderEditDayContent();
    jsonEditor.value = JSON.stringify(editingData, null, 2);
    reloadAll();
    setEditStatus('🔄 已重置为默认数据');
});

// 导出
exportBtn.addEventListener('click', () => {
    // 从当前编辑状态导出
    syncFormToData();
    const blob = new Blob([JSON.stringify(editingData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `新疆行程_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setEditStatus('📦 已导出 JSON 文件');
});

// 导入
importInput.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const parsed = JSON.parse(ev.target.result);
            if (!parsed.itinerary || !parsed.spots) throw new Error('JSON 必须包含 itinerary 和 spots 字段');
            editingData = parsed;
            editingDayIdx = 0;
            renderEditDayList();
            renderEditDayContent();
            jsonEditor.value = JSON.stringify(editingData, null, 2);
            setEditStatus('📥 导入成功，请点击「保存并应用」使之生效');
        } catch (err) {
            setEditStatus('❌ 导入失败: ' + err.message, true);
        }
    };
    reader.readAsText(file);
    importInput.value = '';
});

// ==================== 工具函数 ====================
function escapeHtml(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function escapeAttr(s) {
    if (s == null) return '';
    return escapeHtml(s);
}

/**
 * 地图加载失败时显示友好占位提示
 */
function showMapFallback(containerId, message) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = `
        <div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:24px;text-align:center;background:linear-gradient(135deg,#eaf3f8,#fff8ed);color:#6b7280;">
            <div style="font-size:42px;opacity:.65;">🗺️</div>
            <div style="font-weight:600;color:#374151;font-size:14px;">${escapeHtml(message || '地图加载失败')}</div>
            <div style="font-size:12px;color:#9ca3af;max-width:320px;line-height:1.6;">请检查网络连接（部分地图资源位于境外 CDN），或刷新页面重试。文字行程内容不受影响。</div>
        </div>
    `;
    el.style.background = '#eaf3f8';
}


// ==================== 重新渲染全部 ====================
function reloadAll() {
    renderDayTabs();
    renderDayHeader(currentDayIdx);
    renderDayActivities(currentDayIdx);
    if (dayMap) renderDayMap(currentDayIdx);
    renderSpots(document.querySelector('.filter-btn.active')?.dataset.filter || 'all');
    renderHotels();
    if (overviewMap) renderOverviewMap();
}

// ==================== ESC 关闭弹窗 ====================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeSpotModal();
        shareModal.classList.remove('active'); shareModal.style.display='none';
        if (editModal.classList.contains('active')) hideEditModal();
        document.body.style.overflow = '';
    }
});

// ==================== 平滑滚动 ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            const offset = 80;
            const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    });
});

// ==================== 初始化 ====================
// 每一步都用 try/catch 包装，保证某一步失败不影响其它渲染
function safeRun(fn, label) {
    try { fn(); } catch (e) { console.error(`[初始化失败] ${label}:`, e); }
}

safeRun(() => renderDayTabs(), 'renderDayTabs');
safeRun(() => renderDayHeader(0), 'renderDayHeader');
safeRun(() => renderDayActivities(0), 'renderDayActivities');
safeRun(() => renderSpots(), 'renderSpots');
safeRun(() => renderHotels(), 'renderHotels');

// 使用 IntersectionObserver 延迟加载地图（带降级）
try {
    if (typeof IntersectionObserver !== 'undefined') {
        const mapSectionObs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                if (entry.target.id === 'overviewMap') {
                    initOverviewMap().catch(err => console.warn('概览地图加载异常:', err));
                    mapSectionObs.unobserve(entry.target);
                } else if (entry.target.id === 'dayMap') {
                    renderDayMap(currentDayIdx).catch(err => console.warn('每日地图加载异常:', err));
                    mapSectionObs.unobserve(entry.target);
                }
            });
        }, { rootMargin: '200px' });
        const ovEl = document.getElementById('overviewMap');
        const dmEl = document.getElementById('dayMap');
        if (ovEl) mapSectionObs.observe(ovEl);
        if (dmEl) mapSectionObs.observe(dmEl);
    } else {
        // 浏览器不支持 IntersectionObserver 时直接加载
        initOverviewMap();
        renderDayMap(currentDayIdx);
    }
} catch (e) {
    console.error('地图延迟加载初始化失败:', e);
    // 保底直接加载
    try { initOverviewMap(); } catch(err) { showMapFallback('overviewMap', '地图初始化失败'); }
    try { renderDayMap(currentDayIdx); } catch(err) { showMapFallback('dayMap', '地图初始化失败'); }
}