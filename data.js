// ==================== 活动类型配置 ====================
// 为截图样式的类型色标提供映射
export const activityTypes = {
    flight:   { text: "抵达", color: "sky",    bg: "#DBEAFE", fg: "#2563EB" },
    train:    { text: "高铁", color: "indigo", bg: "#E0E7FF", fg: "#4338CA" },
    transit:  { text: "交通", color: "blue",   bg: "#DBEAFE", fg: "#2563EB" },
    drive:    { text: "自驾", color: "amber",  bg: "#FEF3C7", fg: "#B45309" },
    spot:     { text: "景点", color: "green",  bg: "#D1FAE5", fg: "#047857" },
    meal:     { text: "美食", color: "orange", bg: "#FED7AA", fg: "#C2410C" },
    rest:     { text: "休闲", color: "purple", bg: "#EDE9FE", fg: "#6D28D9" },
    hotel:    { text: "住宿", color: "rose",   bg: "#FFE4E6", fg: "#BE185D" },
    free:     { text: "自由", color: "gray",   bg: "#F3F4F6", fg: "#4B5563" },
};

// ==================== 行程数据 ====================
// 每个活动含 location: [lng, lat] 经纬度坐标（用于地图标注）
// 每天的 path 数组按顺序绘制路线
export const itinerary = [
    {
        day: 1,
        date: "06.13",
        weekday: "周六",
        title: "启程 · 天山天池",
        theme: "乌鲁木齐 → 天山天池 → 伊宁",
        from: "乌鲁木齐",
        to: "乌鲁木齐 → 伊宁",
        activities: [
            { time: "07:00", title: "抵达乌鲁木齐", desc: "抵达乌鲁木齐后集合取车，具体交通编号、出发地和同行人信息已在公开页面隐藏。", icon: "✈️", type: "flight", location: [87.4739, 43.9071], place: "乌鲁木齐机场" },
            { time: "08:30", title: "携程包车出发", desc: "落地后机场吃早饭，携程包车接机出发。", icon: "🚗", type: "drive", location: [87.9849, 44.1581], place: "阜康市" },
            { time: "10:00", title: "天山天池景区", desc: "实际按精简线路游览天池主湖与经典观景点，控制在3-5小时内，为后续转场预留时间。", icon: "🏔️", type: "spot", location: [88.1192, 43.8861], place: "天山天池" },
            { time: "15:00", title: "离开天山天池", desc: "从景区离开返回乌鲁木齐，预留市区交通时间。", icon: "🚗", type: "drive", location: [87.6329, 43.7798], place: "乌鲁木齐" },
            { time: "傍晚", title: "转场前往伊宁", desc: "傍晚从乌鲁木齐转场至伊宁，公开页隐藏具体交通编号。", icon: "🚄", type: "transit", location: [81.3556, 43.9219], place: "伊宁站" },
            { time: "夜间", title: "入住伊宁", desc: "抵达伊宁后入住酒店，第二天从伊宁正式进入伊犁环线。", icon: "🏨", type: "hotel", location: [81.3297, 43.9142], place: "尚客优悦酒店" }
        ],
        hotel: "尚客优悦酒店",
        hotelPrice: 286,
        breakfast: false,
        tips: "实际路线：乌鲁木齐 → 天山天池 → 伊宁。公开版已隐藏同行成员、交通编号、出发地等敏感信息。",
        mapCenter: [85.5, 43.9],
        mapZoom: 7,
        photos: [
            { src: "assets/photos/day1-1.jpg", title: "天山天池", place: "乌鲁木齐" },
            { src: "assets/photos/day1-2.jpg", title: "天山天池", place: "乌鲁木齐" }
        ],
        xhsLinks: []
    },
    {
        day: 2,
        date: "06.14",
        weekday: "周日",
        title: "六星街 · 唐布拉孟克特",
        theme: "伊宁 → 乌拉斯台一道湾 → 唐布拉",
        from: "伊宁",
        to: "唐布拉孟克特",
        activities: [
            { time: "12:00", title: "前往六星街午餐", desc: "上午休整后出发到六星街午餐，简单逛街、补给，公开版隐藏同行人信息。", icon: "🍜", type: "meal", location: [81.3297, 43.9142], place: "伊宁六星街" },
            { time: "14:00", title: "六星街小逛", desc: "14:00-16:00 逛六星街，体验当地小吃与街区色彩；价格偏贵、口味见仁见智。", icon: "🏘️", type: "spot", location: [81.3297, 43.9142], place: "伊宁六星街" },
            { time: "16:00", title: "走779县道前往唐布拉", desc: "出发前往孟克特，添加中途点乌拉斯台一道湾可走779县道，沿途水库与山谷天气好时很出片。", icon: "🚗", type: "drive", location: [82.1500, 43.7200], place: "乌拉斯台一道湾" },
            { time: "傍晚", title: "抵达唐布拉住宿", desc: "全程约4-6小时，备好干粮和水，晚上住宿唐布拉。", icon: "🏡", type: "hotel", location: [82.5111, 43.7903], place: "牧云暖栖民宿" }
        ],
        hotel: "牧云暖栖民宿",
        hotelPrice: 508,
        breakfast: false,
        tips: "门票：免费｜主要行程：六星街 → 乌拉斯台一道湾 → 唐布拉孟克特住宿，779县道沿途水库与山谷很适合拍照。",
        mapCenter: [81.9, 43.82],
        mapZoom: 8,
        photos: [
            { src: "assets/photos/day2-1.jpg", title: "唐布拉沿途", place: "乌拉斯台一道湾" },
            { src: "assets/photos/day2-2.jpg", title: "唐布拉沿途", place: "779县道" }
        ],
        xhsLinks: []
    },
    {
        day: 3,
        date: "06.15",
        weekday: "周一",
        title: "孟克特古道 · 骑马上山",
        theme: "唐布拉 → 孟克特古道 → 唐布拉",
        from: "唐布拉",
        to: "孟克特古道",
        activities: [
            { time: "上午", title: "尝试布隆沟", desc: "早上尝试前往布隆沟，实际遇到关闭无法进入，随后调整为孟克特古道。", icon: "🚧", type: "drive", location: [82.6500, 43.7800], place: "布隆沟方向" },
            { time: "12:00", title: "抵达孟克特古道", desc: "到达景区后直接开车前往最深处，自驾票约200元/车。", icon: "🌄", type: "spot", location: [83.7500, 43.5500], place: "孟克特古道" },
            { time: "13:00", title: "骑马继续上山", desc: "在最深处选择骑马继续上山，实际体验约300元/人；天气晴朗时雪山风景非常值得。", icon: "🐎", type: "spot", location: [83.8200, 43.5200], place: "孟克特古道深处" },
            { time: "17:00", title: "下山与观景台停留", desc: "下山后沿途在多个观景台停留拍照，雪山、草甸、溪谷层次很丰富。", icon: "📸", type: "spot", location: [83.6500, 43.6000], place: "孟克特观景台" },
            { time: "20:30", title: "晚饭与住宿", desc: "晚饭后继续住唐布拉，第二天经百里画廊与独库公路前往库尔德宁。", icon: "🍖", type: "meal", location: [82.5111, 43.7903], place: "牧云暖栖民宿" }
        ],
        hotel: "牧云暖栖民宿",
        hotelPrice: 508,
        breakfast: false,
        tips: "门票：自驾票200元/车，最深处骑马约300元/人｜主要行程：孟克特古道，深处雪山风景很漂亮。",
        mapCenter: [83.2, 43.65],
        mapZoom: 8,
        photos: [
            { src: "assets/photos/day3-1.jpg", title: "孟克特古道", place: "唐布拉" },
            { src: "assets/photos/day3-2.jpg", title: "孟克特雪山", place: "孟克特古道深处" }
        ],
        xhsLinks: [
            { title: "唐布拉百里画廊｜雪山草原日出攻略", url: "https://www.xiaohongshu.com/discovery/item/6839a2f3000000002102f163" },
            { title: "孟克特古道｜唐布拉景区体验", url: "https://www.xiaohongshu.com/discovery/item/6852add20000000023005393" }
        ]
    },
    {
        day: 4,
        date: "06.16",
        weekday: "周二",
        title: "百里画廊 · 独库公路",
        theme: "唐布拉 → 乔尔玛 → 独库公路 → 库尔德宁",
        from: "唐布拉",
        to: "库尔德宁",
        activities: [
            { time: "09:00", title: "早餐后出发", desc: "从唐布拉住宿出发，沿百里画廊前往乔尔玛方向。", icon: "🍳", type: "meal", location: [82.5111, 43.7903], place: "唐布拉" },
            { time: "10:00", title: "途经百里画廊", desc: "百里画廊沿线适合走走停停，草原、河谷、雪山同框。", icon: "🏞️", type: "spot", location: [82.8500, 43.7600], place: "唐布拉百里画廊" },
            { time: "12:00", title: "前往乔尔玛", desc: "沿独库方向继续前进，乔尔玛一带可短暂停留休整。", icon: "🛣️", type: "drive", location: [84.1500, 43.3000], place: "乔尔玛" },
            { time: "12:00-16:00", title: "独库公路观景台", desc: "在多个独库公路观景台停留拍照，独库中段山顶草原观景台非常值得停留。", icon: "📸", type: "spot", location: [84.0000, 43.1800], place: "独库公路中段" },
            { time: "16:00-18:00", title: "抵达库尔德宁镇", desc: "傍晚抵达库尔德宁镇，入住也许小院。", icon: "🏡", type: "hotel", location: [82.8900, 43.1800], place: "库尔德宁也许小院" }
        ],
        hotel: "库尔德宁也许小院",
        hotelPrice: 280,
        breakfast: false,
        tips: "门票：免费｜主要行程：唐布拉孟克特景区 → 乔尔玛 → 独库公路 → 库尔德宁，独库中段山顶草原观景台很惊喜。",
        mapCenter: [83.4, 43.45],
        mapZoom: 8,
        photos: [
            { src: "assets/photos/day4-1.jpg", title: "独库公路", place: "独库公路观景台" }
        ],
        xhsLinks: [
            { title: "独库公路通车与观景备忘", url: "http://xhslink.com/o/ARttCK2gkQY" }
        ]
    },
    {
        day: 5,
        date: "06.17",
        weekday: "周三",
        title: "库尔德宁 · 恰甫其海 · 特克斯",
        theme: "库尔德宁 → 恰甫其海 → 特克斯八卦城",
        from: "库尔德宁",
        to: "特克斯",
        activities: [
            { time: "09:00", title: "库尔德宁中沟检票", desc: "前往库尔德宁中沟检票口自驾检票，门票/交通以现场为准。", icon: "🌲", type: "spot", location: [82.8900, 43.1800], place: "库尔德宁中沟" },
            { time: "上午", title: "自驾核心线路", desc: "自驾覆盖游客中心、十里画廊、蜂香驿站、暗峰大本营等核心点。", icon: "🚗", type: "drive", location: [82.9500, 43.1600], place: "库尔德宁景区" },
            { time: "14:00", title: "东沟出口离开", desc: "从东沟出口出景区，继续前往恰甫其海。", icon: "🛣️", type: "drive", location: [83.0500, 43.1700], place: "库尔德宁东沟" },
            { time: "15:00", title: "恰甫其海停留", desc: "到达恰甫其海，湖面与山色适合短暂停留拍照。", icon: "🌊", type: "spot", location: [82.5200, 43.3300], place: "恰甫其海" },
            { time: "18:00", title: "特克斯八卦城", desc: "抵达特克斯八卦城，逛街晚饭，入住望舒民宿。", icon: "🏘️", type: "hotel", location: [81.8400, 43.2100], place: "特克斯八卦城" }
        ],
        hotel: "特克斯望舒民宿",
        hotelPrice: 297,
        breakfast: false,
        tips: "门票：库尔德宁60元/人｜主要行程：库尔德宁 → 恰甫其海 → 特克斯八卦城，自驾入口为库尔德宁中沟检票口。八卦城中心转盘处蜜雪冰城🍦非常建议尝试，非常好吃！",
        mapCenter: [82.35, 43.2],
        mapZoom: 9,
        photos: [
            { src: "assets/photos/day5-1.jpg", title: "库尔德宁", place: "库尔德宁" },
            { src: "assets/photos/day5-2.jpg", title: "恰甫其海", place: "恰甫其海" }
        ],
        xhsLinks: [
            { title: "库尔德宁自驾攻略", url: "https://www.xiaohongshu.com/discovery/item/6943caf4000000001e008c09" }
        ]
    },
    {
        day: 6,
        date: "06.18",
        weekday: "周四",
        title: "阔克苏大峡谷 · 昭苏湿地",
        theme: "喀拉峻阔克苏 → 昭苏湿地公园 → 夏塔",
        from: "昭苏湿地公园",
        to: "夏塔",
        activities: [
            { time: "09:00", title: "出发前往阔克苏峡谷", desc: "导航喀拉峻国际生态旅游区南门，自驾进入阔克苏大峡谷；盘山路会车困难，注意减速。", icon: "🚗", type: "drive", location: [82.0500, 43.1200], place: "阔克苏大峡谷" },
            { time: "上午", title: "阔克苏大峡谷游览", desc: "重点看峡谷、鳄鱼湾、人体草原等景观；自驾票约50元/人，以现场为准。", icon: "🏔️", type: "spot", location: [82.0200, 43.1000], place: "喀拉峻阔克苏" },
            { time: "13:00", title: "走乡道前往昭苏", desc: "前往昭苏湿地公园，选择296、249乡道，沿途风景不错。", icon: "🛣️", type: "drive", location: [81.5200, 43.1500], place: "296/249乡道" },
            { time: "17:00", title: "昭苏湿地公园", desc: "到达昭苏湿地公园，可观看天马浴河表演，场次以现场为准。", icon: "🐎", type: "spot", location: [81.1300, 43.2000], place: "昭苏湿地公园" },
            { time: "19:00", title: "前往夏塔住宿", desc: "离开昭苏湿地公园前往夏塔附近住宿，入住昭苏申途民宿。", icon: "🏡", type: "hotel", location: [80.9800, 42.8600], place: "昭苏申途民宿" }
        ],
        hotel: "昭苏申途民宿",
        hotelPrice: 482,
        breakfast: false,
        tips: "门票：阔克苏大峡谷自驾票50元/人，昭苏湿地公园自驾票70元/人｜主要行程：喀拉峻阔克苏峡谷 → 昭苏湿地公园 → 夏塔。走296、249乡道，沿途风景不错",
        mapCenter: [81.45, 43.05],
        mapZoom: 9,
        photos: [
            { src: "assets/photos/day6-1.jpg", title: "阔克苏大峡谷", place: "喀拉峻阔克苏" },
            { src: "assets/photos/day6-2.jpg", title: "昭苏湿地", place: "昭苏湿地公园" }
        ],
        xhsLinks: [
            { title: "喀拉峻阔克苏峡谷玩法", url: "https://www.xiaohongshu.com/discovery/item/686cc6ec000000002400ab74" }
        ]
    },
    {
        day: 7,
        date: "06.19",
        weekday: "周五",
        title: "夏塔徒步 · 伊昭公路 · 赛里木湖日落",
        theme: "夏塔 → 伊昭公路 → 伊宁 → 赛里木湖",
        from: "夏塔",
        to: "赛里木湖",
        activities: [
            { time: "09:00", title: "夏塔停车场", desc: "导航自驾至夏塔停车场，夏塔当天不必买自驾票；先坐区间车约45分钟到温泉酒店。", icon: "🚗", type: "drive", location: [80.8500, 42.8800], place: "夏塔停车场" },
            { time: "10:00", title: "天空之镜机位", desc: "换乘观光车约15分钟到天空之镜，下车后可往回走一段，同时拍到云杉与雪山。", icon: "📸", type: "spot", location: [80.7800, 42.8300], place: "夏塔天空之镜" },
            { time: "11:00", title: "步行前往1-4号房子", desc: "从天空之镜继续步行前往1-4号房子，最深处雪山很震撼，适合慢慢拍照。", icon: "🥾", type: "spot", location: [80.7200, 42.8000], place: "夏塔1-4号房子" },
            { time: "14:00", title: "原路返回", desc: "从将军桥坐区间车原路返回，整理装备准备长距离转场。", icon: "🚌", type: "transit", location: [80.8500, 42.8800], place: "夏塔景区" },
            { time: "15:00", title: "走伊昭公路前往赛里木湖", desc: "从夏塔方向走伊昭公路车较少，经伊宁转场至赛里木湖，全程约6小时。", icon: "🛣️", type: "drive", location: [81.0000, 43.1500], place: "伊昭公路" },
            { time: "22:00", title: "赛里木湖日落", desc: "日落前到达赛里木湖，湖面晚霞很漂亮，晚上入住蓝溪汐酒店；也可选择车内露营看日出。", icon: "🌅", type: "spot", location: [81.1917, 44.5500], place: "赛里木湖" }
        ],
        hotel: "赛里木湖蓝溪汐酒店",
        hotelPrice: 810,
        breakfast: false,
        tips: "门票：夏塔区间车90元/人｜主要行程：夏塔 → 伊昭公路 → 伊宁 → 赛里木湖，行程较赶，建议带好干粮。",
        mapCenter: [81.2, 43.8],
        mapZoom: 8,
        photos: [
            { src: "assets/photos/day7-1.jpg", title: "夏塔雪山", place: "夏塔" },
            { src: "assets/photos/day7-2.jpg", title: "赛里木湖日落", place: "赛里木湖" }
        ],
        xhsLinks: [
            { title: "夏塔转运桥徒步路线", url: "https://www.xiaohongshu.com/discovery/item/66bb2a3e000000001e018179" },
            { title: "听劝：夏塔时间紧直奔转运桥", url: "https://www.xiaohongshu.com/discovery/item/66a6707d0000000027011389" }
        ]
    },
    {
        day: 8,
        date: "06.20",
        weekday: "周六",
        title: "赛里木湖顺时针环湖",
        theme: "赛里木湖 → 果子沟大桥 → 伊宁",
        from: "赛里木湖",
        to: "伊宁",
        activities: [
            { time: "08:00", title: "东门进入赛里木湖", desc: "尽量8点开门第一时间进景区，人少、光线好；实际路线选择顺时针环湖。", icon: "🌊", type: "spot", location: [81.3000, 44.5200], place: "赛里木湖东门" },
            { time: "上午", title: "顺时针环湖", desc: "顺时针逛赛里木湖，重点停留亲水湖岸、草原、天鹅/红嘴鸥出没区域和观景台。", icon: "🚗", type: "drive", location: [81.1917, 44.5500], place: "赛里木湖环湖路" },
            { time: "14:00", title: "离开赛里木湖", desc: "14:00前离开景区，前往果子沟大桥方向。", icon: "🛣️", type: "drive", location: [81.0500, 44.4300], place: "赛里木湖西侧" },
            { time: "15:00", title: "果子沟大桥", desc: "途经果子沟大桥，视时间停留拍照。", icon: "🌉", type: "spot", location: [80.8500, 44.3800], place: "果子沟大桥" },
            { time: "傍晚", title: "返回伊宁", desc: "返回伊宁后晚餐或自由安排；个人返程交通信息已隐藏。", icon: "🍽️", type: "meal", location: [81.3297, 43.9142], place: "伊宁市区" }
        ],
        hotel: "晚上飞机返回",
        hotelPrice: 0,
        breakfast: false,
        tips: "门票：赛里木湖自驾144元/人｜主要行程：赛里木湖 → 果子沟大桥 → 伊宁，东门进入后顺时针环湖。",
        mapCenter: [81.0, 44.2],
        mapZoom: 8,
        photos: [
            { src: "assets/photos/day8-1.jpg", title: "赛里木湖", place: "赛里木湖" },
            { src: "assets/photos/day8-2.jpg", title: "果子沟大桥", place: "果子沟" }
        ],
        xhsLinks: [
            { title: "赛里木湖一定要顺时针", url: "https://www.xiaohongshu.com/discovery/item/682f32c9000000002100afdc" },
            { title: "赛里木湖顺时针环湖攻略", url: "https://www.xiaohongshu.com/discovery/item/688a2464000000002501d45b" }
        ]
    },
    {
        day: 9,
        date: "06.21",
        weekday: "周日",
        title: "返程 · 再见新疆",
        theme: "伊宁 → 返程",
        from: "伊宁",
        to: "各自返程",
        activities: [
            { time: "09:00", title: "市内自由活动", desc: "可再逛六星街、汉人街，购买伊犁特产或整理照片。", icon: "🌇", type: "free", location: [81.3297, 43.9142], place: "伊宁市区" },
            { time: "中午", title: "返程交通准备", desc: "整理行李并前往返程交通点，公开页面隐藏具体交通编号、目的地与同行人信息。", icon: "🚕", type: "transit", location: [81.3301, 43.9576], place: "伊宁交通枢纽" },
            { time: "下午", title: "结束行程，各自返程", desc: "挥手告别新疆山河，整理照片和故事，期待下次再会。", icon: "👋", type: "flight", location: [81.3301, 43.9576], place: "伊宁" }
        ],
        hotel: null,
        hotelPrice: 0,
        tips: "返程交通编号、个人去向已隐藏；公开版仅展示行程结束节点。",
        mapCenter: [81.35, 43.94],
        mapZoom: 12,
        xhsLinks: []
    }
];

// ==================== 景点数据 ====================
export const spots = [
    {
        id: "tianshan",
        name: "天山天池",
        nameEn: "Tianshan Tianchi",
        day: "Day 1",
        category: "lake",
        categoryText: "高山湖泊",
        tag: "5A景区",
        img: "https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/0c0771eb-1e27-41f6-a597-9ed27d094fc4/image_1778080023_3_3.jpg",
        altitude: "海拔 1,910m",
        duration: "3-5 小时",
        ticket: "约 ¥125",
        desc: "天山天池是中国著名的高山湖泊，古称'瑶池'，传说西王母宴请周穆王之处。湖水碧蓝澄澈，四周雪峰环抱，白云倒映其中，被誉为'天山明珠'。",
        highlights: [
            "湖面海拔1910米，长3.4公里，平均深度约40米",
            "四周雪岭云杉成林，'东方瑞士'的美誉",
            "瑶池、小天池、定海神针古榆等多处打卡点",
            "夏季可乘船游湖，冬季可观雪山冰湖"
        ],
        tip: "08:00开门，建议上午到达避开旅行团。如要赶17:06的高铁，请控制游玩时间在3小时内"
    },
    {
        id: "tangbula",
        name: "唐布拉百里画廊",
        nameEn: "Tangbula",
        day: "Day 2",
        category: "grassland",
        categoryText: "草原峡谷",
        tag: "独库精华",
        img: "https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/c948b918-ebce-4b99-8085-d87acdadf699/image_1778080031_1_1.jpg",
        altitude: "海拔 1,800-2,400m",
        duration: "半日-一日",
        ticket: "孟克特自驾 ¥200/车",
        desc: "唐布拉百里画廊是独库公路段最美的风景线之一，沿途草原、雪山、河流、森林层次分明。从蜜蜂小镇到乔尔玛之间尤为出彩，被誉为'新疆美景天花板'。",
        highlights: [
            "孟克特景区：最多5人自驾票¥200，超过40/人",
            "仙女湖：可骑马游览，体验价¥200/人",
            "沿途开阔草原与雪山景观交相辉映",
            "乔尔玛英雄纪念碑，独库公路修建者的纪念地"
        ],
        tip: "孟克特 vs 仙女湖二选一，孟克特整体评价更高。途中景色极好，建议预留充足拍照时间"
    },
    {
        id: "kuerdening",
        name: "库尔德宁",
        nameEn: "Kuerdening",
        day: "Day 4",
        category: "mountain",
        categoryText: "云杉森林",
        tag: "世界自然遗产",
        img: "https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/04ae0675-0764-4183-b12e-8b10cc9849a3/image_1778080059_2_3.jpg",
        altitude: "海拔 1,500-2,000m",
        duration: "半日",
        ticket: "门票 ¥60/人",
        desc: "库尔德宁是世界自然遗产'新疆天山'的核心区域，拥有最茂密、最壮观的雪岭云杉森林，被誉为'天山山脉的植物博物馆'。",
        highlights: [
            "覆盖游客中心→十里画廊→蜂香驿站→暗峰大本营",
            "大横木、海蒂小木屋、飞屋环游记气球小屋等绝美机位",
            "雪岭云杉古树成林，生态原始",
            "适合森林徒步与慢游"
        ],
        tip: "S648宝柯段限高3.3米，大车绕行。自驾线路(绿色)为核心游览线路，旺季可能堵车"
    },
    {
        id: "kalajun",
        name: "喀拉峻大草原",
        nameEn: "Kalajun",
        day: "Day 5",
        category: "grassland",
        categoryText: "立体草原",
        tag: "世界遗产",
        img: "https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/3269fd67-39be-430b-9ed2-02fdc41df821/image_1778080066_1_1.jpg",
        altitude: "海拔 2,000-3,500m",
        duration: "一日",
        ticket: "自驾¥160/人",
        desc: "喀拉峻是世界自然遗产，以'立体草原'闻名——同时可见草原、雪山、峡谷三重景观。6月鲜花盛放，草原呈现梦幻曲线美。",
        highlights: [
            "空中草原、人体草原、五花草甸",
            "阔克苏大峡谷、鳄鱼湾奇观",
            "鲜花台、猎鹰台最佳观景点",
            "草原曲线随光影变换，犹如女人体态"
        ],
        tip: "草原区和峡谷区分开游览，全程自驾。6月正是花季，建议穿亮色衣服出片"
    },
    {
        id: "xiata",
        name: "夏塔古道",
        nameEn: "Xiata",
        day: "Day 6",
        category: "mountain",
        categoryText: "雪山圣境",
        tag: "登山圣地",
        img: "https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/0a6b4647-9f38-48e7-a70d-8c4531276cf0/image_1778080075_1_1.jpg",
        altitude: "海拔 1,800-3,500m",
        duration: "一日",
        ticket: "自驾票需抢购",
        desc: "夏塔古道是古代丝绸之路之一，也是通往天山南北的重要通道。两侧雪峰对峙，木扎尔特冰川是哈萨克族人心中的圣地。",
        highlights: [
            "转运桥→将军桥徒步段最精华",
            "鲜花台可同框雪松+雪山",
            "7000米级的汗腾格里峰就在视野之中",
            "古丝绸之路历史遗迹"
        ],
        tip: "⚠️ 自驾票极难抢，一定要提前！如未抢到将军桥骑马票可能排队2-3h。建议徒步到鲜花台"
    },
    {
        id: "duku",
        name: "独库公路",
        nameEn: "Duku Highway",
        day: "贯穿全程",
        category: "road",
        categoryText: "景观公路",
        tag: "中国最美公路",
        img: "https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/9e0e4e13-5ee6-4c82-a3eb-62ba53f5c5c2/image_1778080090_1_1.jpg",
        altitude: "海拔 0-3,300m",
        duration: "2-3日",
        ticket: "免费",
        desc: "独库公路连通独山子与库车，全长561公里，一日可穿四季、十里不同天。被誉为'中国最美公路'，每年仅6-10月开放通行。",
        highlights: [
            "一日四季：沙漠戈壁→草原→雪山→森林",
            "巴音布鲁克、唐布拉都在沿线",
            "乔尔玛纪念碑、哈希勒根达坂",
            "高山峡谷段风景最壮丽"
        ],
        tip: "限速严格，弯道多，注意安全。加油站较少，务必规划加油时点"
    },
    {
        id: "sayram",
        name: "赛里木湖",
        nameEn: "Sayram Lake",
        day: "Day 7-8",
        category: "lake",
        categoryText: "高山冷水湖",
        tag: "5A · 大西洋最后一滴眼泪",
        img: "https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/6a8bdb5e-192f-423b-8b17-6256cc48c7ff/image_1778080099_2_1.jpg",
        altitude: "海拔 2,073m",
        duration: "1-2 日",
        ticket: "自驾 ¥144/人",
        desc: "赛里木湖蒙古语意为'山脊梁上的湖'，被誉为'大西洋最后一滴眼泪'。湖水呈现梦幻蓝色，四季皆景，是新疆最美的湖泊之一。",
        highlights: [
            "环湖公路约100km，自驾最佳",
            "点将台、天鹅滩、西海草原核心点位",
            "6月野花盛开，湖色蓝紫交织",
            "清晨日出和日落时分最美"
        ],
        tip: "湖边风大温度低，准备厚外套。建议环湖一圈，顺时针或逆时针都行"
    },
    {
        id: "guozigou",
        name: "果子沟大桥",
        nameEn: "Guozigou Bridge",
        day: "Day 8",
        category: "road",
        categoryText: "地标建筑",
        tag: "打卡圣地",
        img: "https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/13108872-51f0-4989-8bee-7f25ea5f22c7/image_1778080117_1_1.jpg",
        altitude: "海拔约 1,500m",
        duration: "1 小时",
        ticket: "免费",
        desc: "果子沟大桥是新疆第一座特大桥梁，横跨果子沟峡谷，与两岸郁郁葱葱的山谷形成绝美画面，被誉为'连霍高速第一桥'。",
        highlights: [
            "双塔双索面斜拉桥，建筑奇观",
            "与赛里木湖顺路，是回伊宁必经之路",
            "可在观景台俯瞰全桥",
            "春夏翠绿，秋季金黄"
        ],
        tip: "从赛里木湖回伊宁顺路经过，不需要刻意绕路"
    },
    {
        id: "yining",
        name: "伊宁六星街",
        nameEn: "Yining Six-Star Street",
        day: "Day 1 & 8",
        category: "town",
        categoryText: "特色街区",
        tag: "网红打卡",
        img: "https://zhiyan-ai-agent-with-1258344702.cos.ap-guangzhou.tencentcos.cn/with/b51c5496-164e-4830-a05a-47ae42e7aec2/image_1778080135_2_1.jpg",
        altitude: "海拔 664m",
        duration: "半日",
        ticket: "免费",
        desc: "六星街是伊宁市最具民族特色的街区，汇聚了俄罗斯族、维吾尔族、哈萨克族等多民族建筑。彩色房屋、手风琴博物馆、咖啡馆构成独特的异域风情。",
        highlights: [
            "亚历山大手风琴珍藏馆",
            "网红咖啡馆众多：黄房子、六星咖啡等",
            "特色俄式、维式建筑",
            "购买伊犁小毯子、刺绣等手工艺品"
        ],
        tip: "晚上氛围更好，有当地人表演。建议在这里吃一顿正宗新疆菜"
    },
];

// 分享文案
export const shareText = "🏔️ 2026端午新疆9天8晚实走环线 · 唐布拉+孟克特+独库公路+夏塔+赛里木湖";