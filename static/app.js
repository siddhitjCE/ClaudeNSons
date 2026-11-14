/**
 * static/app.js - SyncLearn Interactive YouTube Learning Studio
 * Built by Team ClaudeNSons
 * Refactored for User-Centred Design, Cognitive Accessibility, and Hick's Law
 */

// ==========================================
// UNIFIED STORAGE MANAGER & STATIC SEEDED FALLBACK DATA
// (Ensures 100% reliable operation on Vercel Serverless and fresh browsers)
// ==========================================

const STATIC_FALLBACK_DATA = {
  "folders": [
    {
      "id": 1,
      "name": "Engineering Chemistry: Polymers",
      "color": "violet",
      "icon": "flask-conical",
      "video_count": 3
    },
    {
      "id": 2,
      "name": "Intro to Mechatronics",
      "color": "cyan",
      "icon": "cpu",
      "video_count": 0
    },
    {
      "id": 3,
      "name": "Digital Electronics",
      "color": "emerald",
      "icon": "binary",
      "video_count": 1
    }
  ],
  "videos": [
    {
      "id": 3,
      "video_id": "fnF67w6rDpg",
      "title": "Engineering Chemistry: Polymers, Molecular Weight Distribution & Stereochemistry",
      "author": "YouTube Studio",
      "folder_id": 1,
      "duration_sec": 2700,
      "thumbnail_url": "https://img.youtube.com/vi/fnF67w6rDpg/hqdefault.jpg"
    },
    {
      "id": 4,
      "video_id": "OSCKBmkrH_g",
      "title": "The Ultimate Component: OpAmp (ElectroBOOM101 \u2013 013)",
      "author": "ElectroBOOM",
      "folder_id": 3,
      "duration_sec": 754,
      "thumbnail_url": "https://img.youtube.com/vi/OSCKBmkrH_g/hqdefault.jpg"
    },
    {
      "id": 1,
      "video_id": "KfODG5REyss",
      "title": "I finally saw quantum mechanics with my own eyes... (It's spookier than I expected)",
      "author": "Veritasium",
      "folder_id": null,
      "duration_sec": 3955,
      "thumbnail_url": "https://i.ytimg.com/vi/KfODG5REyss/hqdefault.jpg"
    },
    {
      "id": 2,
      "video_id": "Y-W-w8yNiKU",
      "title": "Why is there antimatter?",
      "author": "Veritasium",
      "folder_id": 1,
      "duration_sec": 2123,
      "thumbnail_url": "https://img.youtube.com/vi/Y-W-w8yNiKU/hqdefault.jpg"
    },
    {
      "id": 5,
      "video_id": "fEjvSbI_PT4",
      "title": "Dying Is Complicated",
      "author": "Kurzgesagt",
      "folder_id": 1,
      "duration_sec": 840,
      "thumbnail_url": "https://img.youtube.com/vi/fEjvSbI_PT4/hqdefault.jpg"
    },
    {
      "id": 6,
      "video_id": "lyfx8CL7AkI",
      "title": "This CHIP Changed the WORLD! MOSFET (ElectroBOOM101 - 012)",
      "author": "ElectroBOOM",
      "folder_id": 1,
      "duration_sec": 738,
      "thumbnail_url": "https://img.youtube.com/vi/lyfx8CL7AkI/hqdefault.jpg"
    }
  ],
  "pins": [
    {
      "id": 1,
      "video_id": "fnF67w6rDpg",
      "timestamp_sec": 580.0,
      "tag": "exam_priority",
      "title": "Polydispersity Index (PDI = Mw/Mn) Numerical Formula",
      "note": "Polydispersity Index formula: PDI = Mw / Mn. For monodisperse polymers (biological proteins) PDI = 1.0. For typical synthetic polymers, PDI > 1.5. Highly recurring Question 3 on midterms!",
      "created_at": "2026-11-13 22:49:06"
    },
    {
      "id": 2,
      "video_id": "fnF67w6rDpg",
      "timestamp_sec": 675.0,
      "tag": "key_formula",
      "title": "Number-Average (Mn) vs Weight-Average (Mw) Formulas",
      "note": "Mn = \u03a3(Ni\u00b7Mi) / \u03a3Ni (osmometry). Mw = \u03a3(Ni\u00b7Mi\u00b2) / \u03a3(Ni\u00b7Mi) (light scattering). High-mass chains bias Mw upward, hence Mw >= Mn always.",
      "created_at": "2026-11-13 22:49:06"
    },
    {
      "id": 3,
      "video_id": "fnF67w6rDpg",
      "timestamp_sec": 1360.0,
      "tag": "revisit",
      "title": "Ziegler-Natta Catalysis Monometallic Cossee-Arlman Mechanism",
      "note": "Titanium tetrachloride (TiCl4) coordinated with Triethylaluminium Al(C2H5)3 creates active stereospecific vacant orbital for syndiotactic / isotactic polypropylene.",
      "created_at": "2026-11-13 22:49:06"
    },
    {
      "id": 4,
      "video_id": "fnF67w6rDpg",
      "timestamp_sec": 2260.0,
      "tag": "exam_priority",
      "title": "Vulcanization Sulfur Crosslink Density vs Glass Transition (Tg)",
      "note": "2-3% sulfur gives elastic soft rubber (tires); 25-35% sulfur crosslinks all conformational rotation, forming rigid ebonite.",
      "created_at": "2026-11-13 22:49:06"
    },
    {
      "id": 5,
      "video_id": "OSCKBmkrH_g",
      "timestamp_sec": 180.0,
      "tag": "exam_priority",
      "title": "Virtual Ground Assumption (V- \u2248 V+ = 0V)",
      "note": "Because open-loop gain AOL is massive (~100,000), negative feedback drives differential input voltage (V+ - V-) towards zero. With V+ grounded, V- is a virtual ground!",
      "created_at": "2026-11-13 22:49:06"
    },
    {
      "id": 6,
      "video_id": "OSCKBmkrH_g",
      "timestamp_sec": 340.0,
      "tag": "key_formula",
      "title": "Inverting Amplifier Closed Gain (Av = -Rf / Rin)",
      "note": "Applying KCL at the inverting node: (Vin - 0)/Rin = (0 - Vout)/Rf => Vout = -(Rf/Rin) * Vin. Negative sign indicates 180\u00b0 phase inversion.",
      "created_at": "2026-11-13 22:49:06"
    },
    {
      "id": 7,
      "video_id": "OSCKBmkrH_g",
      "timestamp_sec": 520.0,
      "tag": "revisit",
      "title": "Power Supply Rail Clipping Saturation",
      "note": "Output cannot swing beyond supply rails (VEE <= Vout <= VCC). If driven beyond rails, peaks get clipped flat.",
      "created_at": "2026-11-13 22:49:06"
    }
  ],
  "heatmaps": {
    "fnF67w6rDpg": {
      "video_id": "fnF67w6rDpg",
      "title": "Engineering Chemistry: Polymers, Molecular Weight Distribution & Stereochemistry",
      "duration_sec": 2700,
      "chapters": [
        {
          "start_time": 0,
          "end_time": 720,
          "title": "Polymers & Molecular Weight Distribution"
        },
        {
          "start_time": 720,
          "end_time": 1800,
          "title": "Ziegler-Natta Catalysis & Stereospecific Mechanism"
        },
        {
          "start_time": 1800,
          "end_time": 2700,
          "title": "Vulcanization & Viscoelastic Properties"
        }
      ],
      "intensity_points": [
        {
          "time_sec": 0.0,
          "percentage": 0.0,
          "intensity": 0.34
        },
        {
          "time_sec": 22.7,
          "percentage": 0.84,
          "intensity": 0.3358
        },
        {
          "time_sec": 45.4,
          "percentage": 1.68,
          "intensity": 0.3322
        },
        {
          "time_sec": 68.1,
          "percentage": 2.52,
          "intensity": 0.3291
        },
        {
          "time_sec": 90.8,
          "percentage": 3.36,
          "intensity": 0.3264
        },
        {
          "time_sec": 113.4,
          "percentage": 4.2,
          "intensity": 0.3241
        },
        {
          "time_sec": 136.1,
          "percentage": 5.04,
          "intensity": 0.3221
        },
        {
          "time_sec": 158.8,
          "percentage": 5.88,
          "intensity": 0.3203
        },
        {
          "time_sec": 181.5,
          "percentage": 6.72,
          "intensity": 0.3187
        },
        {
          "time_sec": 204.2,
          "percentage": 7.56,
          "intensity": 0.3172
        },
        {
          "time_sec": 226.9,
          "percentage": 8.4,
          "intensity": 0.3158
        },
        {
          "time_sec": 249.6,
          "percentage": 9.24,
          "intensity": 0.3145
        },
        {
          "time_sec": 272.3,
          "percentage": 10.08,
          "intensity": 0.3134
        },
        {
          "time_sec": 295.0,
          "percentage": 10.92,
          "intensity": 0.3128
        },
        {
          "time_sec": 317.6,
          "percentage": 11.76,
          "intensity": 0.3134
        },
        {
          "time_sec": 340.3,
          "percentage": 12.61,
          "intensity": 0.3166
        },
        {
          "time_sec": 363.0,
          "percentage": 13.45,
          "intensity": 0.3247
        },
        {
          "time_sec": 385.7,
          "percentage": 14.29,
          "intensity": 0.341
        },
        {
          "time_sec": 408.4,
          "percentage": 15.13,
          "intensity": 0.3701
        },
        {
          "time_sec": 431.1,
          "percentage": 15.97,
          "intensity": 0.4164
        },
        {
          "time_sec": 453.8,
          "percentage": 16.81,
          "intensity": 0.4832
        },
        {
          "time_sec": 476.5,
          "percentage": 17.65,
          "intensity": 0.5704
        },
        {
          "time_sec": 499.2,
          "percentage": 18.49,
          "intensity": 0.6724
        },
        {
          "time_sec": 521.8,
          "percentage": 19.33,
          "intensity": 0.7776
        },
        {
          "time_sec": 544.5,
          "percentage": 20.17,
          "intensity": 0.87
        },
        {
          "time_sec": 567.2,
          "percentage": 21.01,
          "intensity": 0.9324
        },
        {
          "time_sec": 589.9,
          "percentage": 21.85,
          "intensity": 0.952
        },
        {
          "time_sec": 612.6,
          "percentage": 22.69,
          "intensity": 0.9238
        },
        {
          "time_sec": 635.3,
          "percentage": 23.53,
          "intensity": 0.8527
        },
        {
          "time_sec": 658.0,
          "percentage": 24.37,
          "intensity": 0.7516
        },
        {
          "time_sec": 680.7,
          "percentage": 25.21,
          "intensity": 0.6377
        },
        {
          "time_sec": 703.4,
          "percentage": 26.05,
          "intensity": 0.5271
        },
        {
          "time_sec": 726.1,
          "percentage": 26.89,
          "intensity": 0.4313
        },
        {
          "time_sec": 748.7,
          "percentage": 27.73,
          "intensity": 0.3561
        },
        {
          "time_sec": 771.4,
          "percentage": 28.57,
          "intensity": 0.3017
        },
        {
          "time_sec": 794.1,
          "percentage": 29.41,
          "intensity": 0.2648
        },
        {
          "time_sec": 816.8,
          "percentage": 30.25,
          "intensity": 0.241
        },
        {
          "time_sec": 839.5,
          "percentage": 31.09,
          "intensity": 0.2257
        },
        {
          "time_sec": 862.2,
          "percentage": 31.93,
          "intensity": 0.2157
        },
        {
          "time_sec": 884.9,
          "percentage": 32.77,
          "intensity": 0.2086
        },
        {
          "time_sec": 907.6,
          "percentage": 33.61,
          "intensity": 0.203
        },
        {
          "time_sec": 930.3,
          "percentage": 34.45,
          "intensity": 0.1983
        },
        {
          "time_sec": 952.9,
          "percentage": 35.29,
          "intensity": 0.194
        },
        {
          "time_sec": 975.6,
          "percentage": 36.13,
          "intensity": 0.1902
        },
        {
          "time_sec": 998.3,
          "percentage": 36.97,
          "intensity": 0.1867
        },
        {
          "time_sec": 1021.0,
          "percentage": 37.82,
          "intensity": 0.1836
        },
        {
          "time_sec": 1043.7,
          "percentage": 38.66,
          "intensity": 0.1808
        },
        {
          "time_sec": 1066.4,
          "percentage": 39.5,
          "intensity": 0.1786
        },
        {
          "time_sec": 1089.1,
          "percentage": 40.34,
          "intensity": 0.1772
        },
        {
          "time_sec": 1111.8,
          "percentage": 41.18,
          "intensity": 0.1773
        },
        {
          "time_sec": 1134.5,
          "percentage": 42.02,
          "intensity": 0.1802
        },
        {
          "time_sec": 1157.1,
          "percentage": 42.86,
          "intensity": 0.1887
        },
        {
          "time_sec": 1179.8,
          "percentage": 43.7,
          "intensity": 0.207
        },
        {
          "time_sec": 1202.5,
          "percentage": 44.54,
          "intensity": 0.2408
        },
        {
          "time_sec": 1225.2,
          "percentage": 45.38,
          "intensity": 0.2962
        },
        {
          "time_sec": 1247.9,
          "percentage": 46.22,
          "intensity": 0.3767
        },
        {
          "time_sec": 1270.6,
          "percentage": 47.06,
          "intensity": 0.4798
        },
        {
          "time_sec": 1293.3,
          "percentage": 47.9,
          "intensity": 0.5942
        },
        {
          "time_sec": 1316.0,
          "percentage": 48.74,
          "intensity": 0.7007
        },
        {
          "time_sec": 1338.7,
          "percentage": 49.58,
          "intensity": 0.7767
        },
        {
          "time_sec": 1361.3,
          "percentage": 50.42,
          "intensity": 0.804
        },
        {
          "time_sec": 1384.0,
          "percentage": 51.26,
          "intensity": 0.7762
        },
        {
          "time_sec": 1406.7,
          "percentage": 52.1,
          "intensity": 0.7012
        },
        {
          "time_sec": 1429.4,
          "percentage": 52.94,
          "intensity": 0.5982
        },
        {
          "time_sec": 1452.1,
          "percentage": 53.78,
          "intensity": 0.4898
        },
        {
          "time_sec": 1474.8,
          "percentage": 54.62,
          "intensity": 0.3943
        },
        {
          "time_sec": 1497.5,
          "percentage": 55.46,
          "intensity": 0.3219
        },
        {
          "time_sec": 1520.2,
          "percentage": 56.3,
          "intensity": 0.2741
        },
        {
          "time_sec": 1542.9,
          "percentage": 57.14,
          "intensity": 0.2469
        },
        {
          "time_sec": 1565.5,
          "percentage": 57.98,
          "intensity": 0.2341
        },
        {
          "time_sec": 1588.2,
          "percentage": 58.82,
          "intensity": 0.2301
        },
        {
          "time_sec": 1610.9,
          "percentage": 59.66,
          "intensity": 0.2309
        },
        {
          "time_sec": 1633.6,
          "percentage": 60.5,
          "intensity": 0.2337
        },
        {
          "time_sec": 1656.3,
          "percentage": 61.34,
          "intensity": 0.2375
        },
        {
          "time_sec": 1679.0,
          "percentage": 62.18,
          "intensity": 0.2415
        },
        {
          "time_sec": 1701.7,
          "percentage": 63.03,
          "intensity": 0.2454
        },
        {
          "time_sec": 1724.4,
          "percentage": 63.87,
          "intensity": 0.2492
        },
        {
          "time_sec": 1747.1,
          "percentage": 64.71,
          "intensity": 0.2528
        },
        {
          "time_sec": 1769.7,
          "percentage": 65.55,
          "intensity": 0.2561
        },
        {
          "time_sec": 1792.4,
          "percentage": 66.39,
          "intensity": 0.2591
        },
        {
          "time_sec": 1815.1,
          "percentage": 67.23,
          "intensity": 0.2617
        },
        {
          "time_sec": 1837.8,
          "percentage": 68.07,
          "intensity": 0.2641
        },
        {
          "time_sec": 1860.5,
          "percentage": 68.91,
          "intensity": 0.2661
        },
        {
          "time_sec": 1883.2,
          "percentage": 69.75,
          "intensity": 0.2677
        },
        {
          "time_sec": 1905.9,
          "percentage": 70.59,
          "intensity": 0.2689
        },
        {
          "time_sec": 1928.6,
          "percentage": 71.43,
          "intensity": 0.2698
        },
        {
          "time_sec": 1951.3,
          "percentage": 72.27,
          "intensity": 0.2704
        },
        {
          "time_sec": 1973.9,
          "percentage": 73.11,
          "intensity": 0.271
        },
        {
          "time_sec": 1996.6,
          "percentage": 73.95,
          "intensity": 0.2722
        },
        {
          "time_sec": 2019.3,
          "percentage": 74.79,
          "intensity": 0.2749
        },
        {
          "time_sec": 2042.0,
          "percentage": 75.63,
          "intensity": 0.2811
        },
        {
          "time_sec": 2064.7,
          "percentage": 76.47,
          "intensity": 0.294
        },
        {
          "time_sec": 2087.4,
          "percentage": 77.31,
          "intensity": 0.3177
        },
        {
          "time_sec": 2110.1,
          "percentage": 78.15,
          "intensity": 0.3568
        },
        {
          "time_sec": 2132.8,
          "percentage": 78.99,
          "intensity": 0.4144
        },
        {
          "time_sec": 2155.5,
          "percentage": 79.83,
          "intensity": 0.4903
        },
        {
          "time_sec": 2178.2,
          "percentage": 80.67,
          "intensity": 0.5786
        },
        {
          "time_sec": 2200.8,
          "percentage": 81.51,
          "intensity": 0.6676
        },
        {
          "time_sec": 2223.5,
          "percentage": 82.35,
          "intensity": 0.7411
        },
        {
          "time_sec": 2246.2,
          "percentage": 83.19,
          "intensity": 0.7833
        },
        {
          "time_sec": 2268.9,
          "percentage": 84.03,
          "intensity": 0.7838
        },
        {
          "time_sec": 2291.6,
          "percentage": 84.87,
          "intensity": 0.7416
        },
        {
          "time_sec": 2314.3,
          "percentage": 85.71,
          "intensity": 0.6653
        },
        {
          "time_sec": 2337.0,
          "percentage": 86.55,
          "intensity": 0.5701
        },
        {
          "time_sec": 2359.7,
          "percentage": 87.39,
          "intensity": 0.4725
        },
        {
          "time_sec": 2382.4,
          "percentage": 88.24,
          "intensity": 0.3856
        },
        {
          "time_sec": 2405.0,
          "percentage": 89.08,
          "intensity": 0.3166
        },
        {
          "time_sec": 2427.7,
          "percentage": 89.92,
          "intensity": 0.267
        },
        {
          "time_sec": 2450.4,
          "percentage": 90.76,
          "intensity": 0.234
        },
        {
          "time_sec": 2473.1,
          "percentage": 91.6,
          "intensity": 0.2133
        },
        {
          "time_sec": 2495.8,
          "percentage": 92.44,
          "intensity": 0.2007
        },
        {
          "time_sec": 2518.5,
          "percentage": 93.28,
          "intensity": 0.1928
        },
        {
          "time_sec": 2541.2,
          "percentage": 94.12,
          "intensity": 0.1875
        },
        {
          "time_sec": 2563.9,
          "percentage": 94.96,
          "intensity": 0.1835
        },
        {
          "time_sec": 2586.6,
          "percentage": 95.8,
          "intensity": 0.1803
        },
        {
          "time_sec": 2609.2,
          "percentage": 96.64,
          "intensity": 0.1777
        },
        {
          "time_sec": 2631.9,
          "percentage": 97.48,
          "intensity": 0.1754
        },
        {
          "time_sec": 2654.6,
          "percentage": 98.32,
          "intensity": 0.1735
        },
        {
          "time_sec": 2677.3,
          "percentage": 99.16,
          "intensity": 0.1721
        },
        {
          "time_sec": 2700.0,
          "percentage": 100.0,
          "intensity": 0.171
        }
      ],
      "peaks": [
        {
          "id": "peak-1",
          "start_sec": 480,
          "end_sec": 720,
          "peak_sec": 590,
          "intensity": 0.94,
          "label": "Degree of Polymerization & Molecular Weight Distribution (PDI)",
          "description": "High crowd replay peak: Students repeatedly review derivations for Number-Average (Mn) vs Weight-Average (Mw) and Polydispersity Index (PDI = Mw/Mn)."
        },
        {
          "id": "peak-2",
          "start_sec": 1290,
          "end_sec": 1470,
          "peak_sec": 1360,
          "intensity": 0.89,
          "label": "Ziegler-Natta Catalysis & Stereospecific Mechanism",
          "description": "High replay cluster: Coordination polymerisation mechanism between TiCl4 and Al(C2H5)3, focusing on monometallic vs bimetallic active sites."
        },
        {
          "id": "peak-3",
          "start_sec": 2160,
          "end_sec": 2370,
          "peak_sec": 2260,
          "intensity": 0.82,
          "label": "Vulcanization, Cross-Linking & Viscoelastic Transition",
          "description": "Critical exam section: Sulfur bridge crosslinking percentage vs polymer chain mobility, contrasting soft tire elastomer with rigid ebonite."
        }
      ],
      "source": "pre_seeded_curated"
    },
    "OSCKBmkrH_g": {
      "video_id": "OSCKBmkrH_g",
      "title": "The Ultimate Component: OpAmp (ElectroBOOM101 \u2013 013)",
      "duration_sec": 754,
      "chapters": [
        {
          "start_time": 0,
          "end_time": 240,
          "title": "OpAmp Fundamentals & Virtual Ground"
        },
        {
          "start_time": 240,
          "end_time": 440,
          "title": "Inverting & Non-Inverting Amplifier Configurations"
        },
        {
          "start_time": 440,
          "end_time": 754,
          "title": "Saturation, Power Rails & Applications"
        }
      ],
      "intensity_points": [
        {
          "time_sec": 0.0,
          "percentage": 0.0,
          "intensity": 0.2
        },
        {
          "time_sec": 7.6,
          "percentage": 1.01,
          "intensity": 0.2057
        },
        {
          "time_sec": 15.2,
          "percentage": 2.02,
          "intensity": 0.2114
        },
        {
          "time_sec": 22.8,
          "percentage": 3.03,
          "intensity": 0.2169
        },
        {
          "time_sec": 30.5,
          "percentage": 4.04,
          "intensity": 0.2224
        },
        {
          "time_sec": 38.1,
          "percentage": 5.05,
          "intensity": 0.2277
        },
        {
          "time_sec": 45.7,
          "percentage": 6.06,
          "intensity": 0.2329
        },
        {
          "time_sec": 53.3,
          "percentage": 7.07,
          "intensity": 0.2382
        },
        {
          "time_sec": 60.9,
          "percentage": 8.08,
          "intensity": 0.2437
        },
        {
          "time_sec": 68.5,
          "percentage": 9.09,
          "intensity": 0.2501
        },
        {
          "time_sec": 76.2,
          "percentage": 10.1,
          "intensity": 0.2581
        },
        {
          "time_sec": 83.8,
          "percentage": 11.11,
          "intensity": 0.2691
        },
        {
          "time_sec": 91.4,
          "percentage": 12.12,
          "intensity": 0.285
        },
        {
          "time_sec": 99.0,
          "percentage": 13.13,
          "intensity": 0.3083
        },
        {
          "time_sec": 106.6,
          "percentage": 14.14,
          "intensity": 0.3416
        },
        {
          "time_sec": 114.2,
          "percentage": 15.15,
          "intensity": 0.3878
        },
        {
          "time_sec": 121.9,
          "percentage": 16.16,
          "intensity": 0.4487
        },
        {
          "time_sec": 129.5,
          "percentage": 17.17,
          "intensity": 0.5245
        },
        {
          "time_sec": 137.1,
          "percentage": 18.18,
          "intensity": 0.6131
        },
        {
          "time_sec": 144.7,
          "percentage": 19.19,
          "intensity": 0.7094
        },
        {
          "time_sec": 152.3,
          "percentage": 20.2,
          "intensity": 0.8053
        },
        {
          "time_sec": 159.9,
          "percentage": 21.21,
          "intensity": 0.891
        },
        {
          "time_sec": 167.6,
          "percentage": 22.22,
          "intensity": 0.9561
        },
        {
          "time_sec": 175.2,
          "percentage": 23.23,
          "intensity": 0.9919
        },
        {
          "time_sec": 182.8,
          "percentage": 24.24,
          "intensity": 0.9933
        },
        {
          "time_sec": 190.4,
          "percentage": 25.25,
          "intensity": 0.9596
        },
        {
          "time_sec": 198.0,
          "percentage": 26.26,
          "intensity": 0.8952
        },
        {
          "time_sec": 205.6,
          "percentage": 27.27,
          "intensity": 0.8084
        },
        {
          "time_sec": 213.3,
          "percentage": 28.28,
          "intensity": 0.7096
        },
        {
          "time_sec": 220.9,
          "percentage": 29.29,
          "intensity": 0.6097
        },
        {
          "time_sec": 228.5,
          "percentage": 30.3,
          "intensity": 0.5182
        },
        {
          "time_sec": 236.1,
          "percentage": 31.31,
          "intensity": 0.4422
        },
        {
          "time_sec": 243.7,
          "percentage": 32.32,
          "intensity": 0.3862
        },
        {
          "time_sec": 251.3,
          "percentage": 33.33,
          "intensity": 0.3523
        },
        {
          "time_sec": 258.9,
          "percentage": 34.34,
          "intensity": 0.3405
        },
        {
          "time_sec": 266.6,
          "percentage": 35.35,
          "intensity": 0.3499
        },
        {
          "time_sec": 274.2,
          "percentage": 36.36,
          "intensity": 0.3788
        },
        {
          "time_sec": 281.8,
          "percentage": 37.37,
          "intensity": 0.4245
        },
        {
          "time_sec": 289.4,
          "percentage": 38.38,
          "intensity": 0.4838
        },
        {
          "time_sec": 297.0,
          "percentage": 39.39,
          "intensity": 0.5522
        },
        {
          "time_sec": 304.6,
          "percentage": 40.4,
          "intensity": 0.6244
        },
        {
          "time_sec": 312.3,
          "percentage": 41.41,
          "intensity": 0.6939
        },
        {
          "time_sec": 319.9,
          "percentage": 42.42,
          "intensity": 0.7541
        },
        {
          "time_sec": 327.5,
          "percentage": 43.43,
          "intensity": 0.7989
        },
        {
          "time_sec": 335.1,
          "percentage": 44.44,
          "intensity": 0.8232
        },
        {
          "time_sec": 342.7,
          "percentage": 45.45,
          "intensity": 0.8241
        },
        {
          "time_sec": 350.3,
          "percentage": 46.46,
          "intensity": 0.8015
        },
        {
          "time_sec": 358.0,
          "percentage": 47.47,
          "intensity": 0.7574
        },
        {
          "time_sec": 365.6,
          "percentage": 48.48,
          "intensity": 0.6966
        },
        {
          "time_sec": 373.2,
          "percentage": 49.49,
          "intensity": 0.625
        },
        {
          "time_sec": 380.8,
          "percentage": 50.51,
          "intensity": 0.5494
        },
        {
          "time_sec": 388.4,
          "percentage": 51.52,
          "intensity": 0.476
        },
        {
          "time_sec": 396.0,
          "percentage": 52.53,
          "intensity": 0.4105
        },
        {
          "time_sec": 403.7,
          "percentage": 53.54,
          "intensity": 0.3569
        },
        {
          "time_sec": 411.3,
          "percentage": 54.55,
          "intensity": 0.3179
        },
        {
          "time_sec": 418.9,
          "percentage": 55.56,
          "intensity": 0.295
        },
        {
          "time_sec": 426.5,
          "percentage": 56.57,
          "intensity": 0.2884
        },
        {
          "time_sec": 434.1,
          "percentage": 57.58,
          "intensity": 0.2977
        },
        {
          "time_sec": 441.7,
          "percentage": 58.59,
          "intensity": 0.322
        },
        {
          "time_sec": 449.4,
          "percentage": 59.6,
          "intensity": 0.3599
        },
        {
          "time_sec": 457.0,
          "percentage": 60.61,
          "intensity": 0.4095
        },
        {
          "time_sec": 464.6,
          "percentage": 61.62,
          "intensity": 0.4683
        },
        {
          "time_sec": 472.2,
          "percentage": 62.63,
          "intensity": 0.5333
        },
        {
          "time_sec": 479.8,
          "percentage": 63.64,
          "intensity": 0.6008
        },
        {
          "time_sec": 487.4,
          "percentage": 64.65,
          "intensity": 0.6666
        },
        {
          "time_sec": 495.1,
          "percentage": 65.66,
          "intensity": 0.7263
        },
        {
          "time_sec": 502.7,
          "percentage": 66.67,
          "intensity": 0.7759
        },
        {
          "time_sec": 510.3,
          "percentage": 67.68,
          "intensity": 0.8115
        },
        {
          "time_sec": 517.9,
          "percentage": 68.69,
          "intensity": 0.8307
        },
        {
          "time_sec": 525.5,
          "percentage": 69.7,
          "intensity": 0.8323
        },
        {
          "time_sec": 533.1,
          "percentage": 70.71,
          "intensity": 0.8165
        },
        {
          "time_sec": 540.7,
          "percentage": 71.72,
          "intensity": 0.785
        },
        {
          "time_sec": 548.4,
          "percentage": 72.73,
          "intensity": 0.7408
        },
        {
          "time_sec": 556.0,
          "percentage": 73.74,
          "intensity": 0.6875
        },
        {
          "time_sec": 563.6,
          "percentage": 74.75,
          "intensity": 0.6292
        },
        {
          "time_sec": 571.2,
          "percentage": 75.76,
          "intensity": 0.5698
        },
        {
          "time_sec": 578.8,
          "percentage": 76.77,
          "intensity": 0.5127
        },
        {
          "time_sec": 586.4,
          "percentage": 77.78,
          "intensity": 0.4604
        },
        {
          "time_sec": 594.1,
          "percentage": 78.79,
          "intensity": 0.4146
        },
        {
          "time_sec": 601.7,
          "percentage": 79.8,
          "intensity": 0.3761
        },
        {
          "time_sec": 609.3,
          "percentage": 80.81,
          "intensity": 0.3449
        },
        {
          "time_sec": 616.9,
          "percentage": 81.82,
          "intensity": 0.3204
        },
        {
          "time_sec": 624.5,
          "percentage": 82.83,
          "intensity": 0.3017
        },
        {
          "time_sec": 632.1,
          "percentage": 83.84,
          "intensity": 0.2877
        },
        {
          "time_sec": 639.8,
          "percentage": 84.85,
          "intensity": 0.2774
        },
        {
          "time_sec": 647.4,
          "percentage": 85.86,
          "intensity": 0.2696
        },
        {
          "time_sec": 655.0,
          "percentage": 86.87,
          "intensity": 0.2636
        },
        {
          "time_sec": 662.6,
          "percentage": 87.88,
          "intensity": 0.2587
        },
        {
          "time_sec": 670.2,
          "percentage": 88.89,
          "intensity": 0.2543
        },
        {
          "time_sec": 677.8,
          "percentage": 89.9,
          "intensity": 0.2502
        },
        {
          "time_sec": 685.5,
          "percentage": 90.91,
          "intensity": 0.2461
        },
        {
          "time_sec": 693.1,
          "percentage": 91.92,
          "intensity": 0.2418
        },
        {
          "time_sec": 700.7,
          "percentage": 92.93,
          "intensity": 0.2373
        },
        {
          "time_sec": 708.3,
          "percentage": 93.94,
          "intensity": 0.2325
        },
        {
          "time_sec": 715.9,
          "percentage": 94.95,
          "intensity": 0.2275
        },
        {
          "time_sec": 723.5,
          "percentage": 95.96,
          "intensity": 0.2223
        },
        {
          "time_sec": 731.2,
          "percentage": 96.97,
          "intensity": 0.2169
        },
        {
          "time_sec": 738.8,
          "percentage": 97.98,
          "intensity": 0.2113
        },
        {
          "time_sec": 746.4,
          "percentage": 98.99,
          "intensity": 0.2057
        },
        {
          "time_sec": 754.0,
          "percentage": 100.0,
          "intensity": 0.2
        }
      ],
      "peaks": [
        {
          "id": "peak-1",
          "start_sec": 60,
          "end_sec": 240,
          "peak_sec": 180,
          "intensity": 0.95,
          "label": "Virtual Ground Assumption (V- \u2248 V+ = 0V)",
          "description": "Crowd replay peak: Why negative feedback forces inverting terminal to 0V without physical ground connection."
        },
        {
          "id": "peak-2",
          "start_sec": 240,
          "end_sec": 420,
          "peak_sec": 340,
          "intensity": 0.88,
          "label": "Inverting Amplifier Closed Gain (Av = -Rf / Rin)",
          "description": "High replay cluster: Applying KCL at the inverting node to derive closed-loop gain and 180\u00b0 phase inversion."
        },
        {
          "id": "peak-3",
          "start_sec": 440,
          "end_sec": 600,
          "peak_sec": 520,
          "intensity": 0.82,
          "label": "Power Supply Rail Clipping Saturation",
          "description": "Exam pitfall: Output voltage limits bounded by VEE and VCC, and clipping when driven beyond rails."
        }
      ],
      "source": "pre_seeded_curated"
    }
  },
  "analyses": {
    "fnF67w6rDpg": [
      {
        "target_sec": 590,
        "data": {
          "segment_window": "07:50 - 11:50",
          "section_classification": "Potentially Difficult Mathematical Derivation",
          "why_students_struggle": "Students struggle with the discrete summation indices and fail to recognize why weight-average (Mw) squares individual chain masses while number-average (Mn) weights them linearly.",
          "identified_concepts": [
            {
              "name": "Number-Average Molar Mass ($M_n$)",
              "difficulty": "Intermediate",
              "modality": "Mathematical"
            },
            {
              "name": "Weight-Average Molar Mass ($M_w$)",
              "difficulty": "Intermediate",
              "modality": "Mathematical"
            },
            {
              "name": "Polydispersity Index ($PDI = M_w / M_n$)",
              "difficulty": "Beginner",
              "modality": "Theoretical"
            },
            {
              "name": "Moment Inequality ($M_w \\ge M_n$)",
              "difficulty": "Advanced",
              "modality": "Visual"
            }
          ],
          "context_locked_explanation": "In this segment around 09:50, the instructor derives the statistical moments governing polymer chain length distributions:\n\n$$\\bar{M}_n = \\frac{\\sum N_i M_i}{\\sum N_i} = \\sum x_i M_i \\quad \\text{(Colligative / Osmometry Count)}$$\n$$\\bar{M}_w = \\frac{\\sum N_i M_i^2}{\\sum N_i M_i} = \\sum w_i M_i \\quad \\text{(Static Light Scattering)}$$\n\n$$\\text{Polydispersity Index: } PDI = \\frac{\\bar{M}_w}{\\bar{M}_n} \\ge 1.0$$\n\n**Real-World Analogy:** Think of calculating average population wealth. $\\bar{M}_n$ is the simple per-capita arithmetic mean where every person counts as one vote ($N_i$). $\\bar{M}_w$ weights each category by total dollars ($w_i = N_i M_i$), which makes billionaires pull the average drastically higher!",
          "terminology_bridge": [
            {
              "prof_term": "Polydispersity Index (PDI)",
              "alt_video_term": "Dispersity ($\u0110$)",
              "clarification": "Modern IUPAC nomenclature uses the symbol \u0110 (D-stroke), while Indian and US engineering midterms still write PDI = Mw/Mn."
            },
            {
              "prof_term": "Number-Average ($M_n$)",
              "alt_video_term": "Colligative Molar Mass",
              "clarification": "Techniques that count particle numbers (membrane osmometry, freezing point depression) always yield Mn."
            },
            {
              "prof_term": "Weight-Average ($M_w$)",
              "alt_video_term": "Mass-Fraction Average",
              "clarification": "Techniques sensitive to particle mass (static light scattering, ultracentrifugation) always yield Mw."
            }
          ],
          "recommended_search_queries": [
            "polydispersity index explained visually",
            "why weight average molecular weight is greater than number average",
            "polymer molecular weight distribution intuition"
          ],
          "visual_diagram": {
            "title": "Molecular Weight Distribution & PDI Flow",
            "nodes": [
              {
                "id": "1",
                "label": "Polymer Chain Distribution Matrix {Ni, Mi}",
                "is_hidden_quiz": false
              },
              {
                "id": "2",
                "label": "$M_n = \\sum(N_i M_i) / \\sum N_i$",
                "is_hidden_quiz": true,
                "options": [
                  "$M_n = \\sum(N_i M_i) / \\sum N_i$",
                  "$M_n = \\sum N_i M_i^2$",
                  "$M_n = PDI \\cdot DP$"
                ]
              },
              {
                "id": "3",
                "label": "$M_w = \\sum(N_i M_i^2) / \\sum(N_i M_i)$",
                "is_hidden_quiz": false
              },
              {
                "id": "4",
                "label": "Dispersity Metric: $PDI = M_w / M_n$",
                "is_hidden_quiz": true,
                "options": [
                  "$PDI = M_w / M_n$",
                  "$PDI = M_n / M_w$",
                  "$PDI = M_w \\cdot M_n$"
                ]
              }
            ]
          },
          "checkpoint_mcqs": [
            {
              "question": "For a pure biological protein sample where every single macromolecular chain contains exactly 450 amino acid units, what is the exact value of PDI?",
              "options": [
                "PDI = 1.0 (Strict monodisperse boundary)",
                "PDI = 0.0 (Zero spread)",
                "PDI = 2.0 (Flory-Schulz distribution)",
                "PDI > 1.5 (Industrial synthetic polymer)"
              ],
              "correct_index": 0,
              "explanation": "When all chains have identical molecular weights, Mw = Mn, meaning PDI = Mw / Mn = 1.0.",
              "review_timestamp_sec": 590
            },
            {
              "question": "Which analytical technique counts the number of dissolved polymer particles independent of size, directly yielding the Number-Average Molecular Weight (Mn)?",
              "options": [
                "Membrane Osmometry (Colligative pressure)",
                "Static Laser Light Scattering",
                "Analytical Ultracentrifugation",
                "Differential Scanning Calorimetry"
              ],
              "correct_index": 0,
              "explanation": "Membrane osmometry measures osmotic pressure, a colligative property proportional to the number density of polymer molecules in solution.",
              "review_timestamp_sec": 590
            }
          ],
          "source": "domain_chemistry_fallback",
          "has_live_transcript": false
        }
      }
    ],
    "OSCKBmkrH_g": [
      {
        "target_sec": 180,
        "data": {
          "segment_window": "01:00 - 05:00",
          "section_classification": "Potentially Difficult Mathematical Derivation",
          "why_students_struggle": "Students struggle with the virtual ground assumption, failing to understand how negative feedback dynamically forces the inverting terminal to 0V without drawing physical ground current.",
          "identified_concepts": [
            {
              "name": "Virtual Ground Condition ($V_+ \\approx V_-$)",
              "difficulty": "Intermediate",
              "modality": "Mathematical"
            },
            {
              "name": "Infinite Input Impedance ($I_{in} \\approx 0$)",
              "difficulty": "Beginner",
              "modality": "Theoretical"
            },
            {
              "name": "Closed-Loop Gain ($A_v = -R_f / R_{in}$)",
              "difficulty": "Intermediate",
              "modality": "Mathematical"
            },
            {
              "name": "Power Rail Saturation Limits ($V_{EE} \\le V_{out} \\le V_{CC}$)",
              "difficulty": "Advanced",
              "modality": "Visual"
            }
          ],
          "context_locked_explanation": "In this segment around 03:00, the instructor applies the two Golden Rules of Operational Amplifiers with negative feedback:\n\n$$1) \\quad I_+ = I_- = 0 \\quad \\text{(Infinite Input Impedance)}$$\n$$2) \\quad V_+ - V_- \\approx 0 \\implies V_- = V_+ \\quad \\text{(Virtual Ground when $V_+$ is grounded)}$$\n\nApplying Kirchhoff's Current Law (KCL) at the inverting node summing point:\n\n$$\\frac{V_{in} - 0}{R_{in}} = \\frac{0 - V_{out}}{R_f} \\implies V_{out} = -\\left(\\frac{R_f}{R_{in}}\\right) V_{in}$$\n\n**Real-World Analogy:** Think of the op-amp as a high-speed seesaw pivot. The negative feedback instantly pushes the inverting node back down whenever the input pushes it up, keeping the midpoint balanced at 0V!",
          "terminology_bridge": [
            {
              "prof_term": "Virtual Ground ($V_- = 0V$)",
              "alt_video_term": "Virtual Earth / Summing Point",
              "clarification": "Both refer to the inverting input being held at zero volts by negative feedback without a physical ground connection."
            },
            {
              "prof_term": "Open-Loop Gain ($A_{OL} \\to \\infty$)",
              "alt_video_term": "Internal Differential Gain",
              "clarification": "The raw amplifier gain before connecting the external $R_f$ feedback loop."
            },
            {
              "prof_term": "Rail Saturation ($V_{CC} / V_{EE}$)",
              "alt_video_term": "Output Voltage Clipping",
              "clarification": "The physical voltage limit of the op-amp supply rails beyond which waveforms get flat-topped."
            }
          ],
          "recommended_search_queries": [
            "Op-Amp virtual ground explained visually",
            "inverting amplifier negative feedback intuition",
            "why op-amps clip at power supply rails"
          ],
          "visual_diagram": {
            "title": "Inverting Op-Amp Feedback Process Flow",
            "nodes": [
              {
                "id": "1",
                "label": "Differential Input Voltage $(V_+ - V_-)$",
                "is_hidden_quiz": false
              },
              {
                "id": "2",
                "label": "Golden Rule 1: $I_{in} = 0A$",
                "is_hidden_quiz": true,
                "options": [
                  "$I_{in} = 0A$ (Infinite Impedance)",
                  "$I_{in} = 10mA$ (Load Current)",
                  "$I_{in} \\to \\infty$ (Short)"
                ]
              },
              {
                "id": "3",
                "label": "Virtual Ground Node ($V_- = 0V$)",
                "is_hidden_quiz": false
              },
              {
                "id": "4",
                "label": "Closed Gain: $V_{out} = -(R_f/R_{in})V_{in}$",
                "is_hidden_quiz": true,
                "options": [
                  "$V_{out} = -(R_f/R_{in})V_{in}$",
                  "$V_{out} = (1 + R_f/R_{in})V_{in}$",
                  "$V_{out} = A_{OL} V_{in}$"
                ]
              }
            ]
          },
          "checkpoint_mcqs": [
            {
              "question": "What primary mechanism enforces the 'virtual ground' condition at the inverting input terminal of an Op-Amp?",
              "options": [
                "Negative feedback driving the differential input voltage (V+ - V-) towards zero",
                "A permanent internal short circuit to the chassis ground plate",
                "High capacitance between input pins bypassing DC voltages",
                "Positive feedback causing the amplifier to self-oscillate"
              ],
              "correct_index": 0,
              "explanation": "Because open-loop gain AOL is massive, negative feedback feeds output voltage back to drive (V+ - V-) to approximately zero.",
              "review_timestamp_sec": 180
            },
            {
              "question": "If an inverting Op-Amp has Rin = 5 k\u03a9 and Rf = 50 k\u03a9 with Vin = 1.0 V, what is the output voltage Vout (assuming \u00b115V supplies)?",
              "options": [
                "-10.0 V (Phase inverted 10x gain)",
                "+10.0 V (Non-inverting gain)",
                "-0.1 V (Attenuation)",
                "+11.0 V (Non-inverting formula)"
              ],
              "correct_index": 0,
              "explanation": "Vout = -(Rf / Rin) * Vin = -(50k / 5k) * 1.0V = -10.0V.",
              "review_timestamp_sec": 180
            }
          ],
          "source": "domain_opamp_fallback",
          "has_live_transcript": false
        }
      }
    ]
  }
};

const StorageManager = {
  get(key, fallback = null) {
    try {
      const val = localStorage.getItem(`synclearn_${key}`);
      return val ? JSON.parse(val) : fallback;
    } catch (e) {
      console.warn("StorageManager.get error:", e);
      return fallback;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(`synclearn_${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn("StorageManager.set error:", e);
    }
  },

  getFolders() {
    const custom = this.get("folders", null);
    if (custom && Array.isArray(custom) && custom.length > 0) return custom;
    return STATIC_FALLBACK_DATA.folders;
  },

  saveFolder(folder) {
    const folders = this.getFolders().slice();
    const newId = folders.length > 0 ? Math.max(...folders.map(f => f.id || 0)) + 1 : 1;
    const newFolder = { id: newId, video_count: 0, ...folder };
    folders.push(newFolder);
    this.set("folders", folders);
    return newFolder;
  },

  getVideos() {
    const custom = this.get("videos", null);
    if (custom && Array.isArray(custom) && custom.length > 0) return custom;
    return STATIC_FALLBACK_DATA.videos;
  },

  saveVideo(video) {
    const list = this.getVideos().slice();
    const idx = list.findIndex(v => v.video_id === video.video_id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...video };
    } else {
      list.push(video);
    }
    this.set("videos", list);
  },

  getPins(videoId) {
    const allPins = this.get("pins", null);
    const base = allPins !== null ? allPins : STATIC_FALLBACK_DATA.pins;
    return base.filter(p => p.video_id === videoId);
  },

  savePin(pin) {
    const allPins = (this.get("pins", null) || STATIC_FALLBACK_DATA.pins).slice();
    const newId = pin.id || Date.now();
    const fullPin = { ...pin, id: newId, created_at: new Date().toISOString() };
    allPins.push(fullPin);
    this.set("pins", allPins);
    return fullPin;
  },

  deletePin(pinId) {
    const allPins = (this.get("pins", null) || STATIC_FALLBACK_DATA.pins).slice();
    const filtered = allPins.filter(p => p.id !== pinId);
    this.set("pins", filtered);
  },

  getAnalysis(videoId, timestampSec) {
    // 1. Check local storage cache
    const key = `analysis_${videoId}_${Math.round(timestampSec / 60)}`;
    const cached = this.get(key, null);
    if (cached) return cached;

    // 2. Check static fallback data
    const list = STATIC_FALLBACK_DATA.analyses[videoId] || [];
    for (const item of list) {
      if (Math.abs(item.target_sec - timestampSec) <= 180) {
        return item.data;
      }
    }
    return null;
  },

  saveAnalysis(videoId, timestampSec, data) {
    const key = `analysis_${videoId}_${Math.round(timestampSec / 60)}`;
    this.set(key, data);
  }
};

// Global Application State
const state = {
  currentVideoId: "fnF67w6rDpg", // Default Engineering Chemistry lecture
  durationSec: 2700,
  currentTimeSec: 0,
  previousTimeSec: 0,
  player: null,
  isPlayerReady: false,
  heatmapData: null,
  pins: [],
  activeAnalysis: null,
  activeQuiz: null,
  activeFilter: "all",
  activeTab: "tab-content-rescue",
  currentFolderId: 1,
  // User-Centred Settings
  analysisWindowSeconds: 240, // Default ±2m (240s window)
  autoPauseEnabled: true,
  triggeredAutoPauses: new Set(),
  // Undo Deletion State
  pendingDeleteTimeout: null,
  pendingDeletedPin: null,
  // Session Learning Data
  sessionTerminologyBridges: [
    {
      prof_term: "\\bar{M}_n \\text{ vs } \\bar{M}_w",
      alt_video_term: "Number-Avg vs Weight-Avg Molar Mass",
      clarification: "Mn linear chains count; Mw squares chain weight reflecting mechanical toughness."
    },
    {
      prof_term: "\\text{PDI} = \\frac{\\bar{M}_w}{\\bar{M}_n}",
      alt_video_term: "Dispersity Index (Đ)",
      clarification: "IUPAC standard dispersity. PDI = 1.0 indicates strictly monodisperse chains."
    },
    {
      prof_term: "\\text{DP}_n",
      alt_video_term: "Chain Length / Degree of Polymerization",
      clarification: "Average number of repeat monomer units per polymer macromolecule."
    }
  ],
  missedQuizQuestions: [],
  conceptMastery: { total: 0, unlocked: 0 }
};

// Initialize Application on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  initUIEventListeners();
  loadSubjectFolders();
  renderCheatSheetBridges();
  renderCheatSheetMissedMCQs();
  loadVideoStudio(state.currentVideoId);
});

// ==========================================
// 1. YOUTUBE IFRAME PLAYER INTEGRATION (BULLETPROOF)
// ==========================================

function initYouTubePlayer() {
  if (state.player && typeof state.player.loadVideoById === "function") return;

  const playerEl = document.getElementById("youtube-player");
  if (!playerEl) return;

  try {
    if (window.YT && window.YT.Player) {
      state.player = new YT.Player("youtube-player", {
        height: "100%",
        width: "100%",
        videoId: state.currentVideoId,
        playerVars: {
          enablejsapi: 1,
          playsinline: 1,
          modestbranding: 1,
          rel: 0
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onError: onPlayerError
        }
      });
    } else {
      fallbackToDirectIframe();
    }
  } catch (err) {
    console.warn("YT.Player initialization notice:", err);
    fallbackToDirectIframe();
  }
}

// Global YouTube callback
window.onYouTubeIframeAPIReady = function() {
  initYouTubePlayer();
};

// Check if YT script is already loaded or inject dynamically
if (window.YT && window.YT.Player) {
  initYouTubePlayer();
} else {
  if (!document.getElementById("yt-iframe-api-script")) {
    const tag = document.createElement("script");
    tag.id = "yt-iframe-api-script";
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }
}

// Safety timeout: Ensure the loading screen NEVER stays stuck covering the video
setTimeout(() => {
  const loader = document.getElementById("player-loader");
  if (loader && !loader.classList.contains("hidden")) {
    loader.style.opacity = "0";
    setTimeout(() => loader.classList.add("hidden"), 300);
  }
  if (!state.isPlayerReady) {
    fallbackToDirectIframe();
  }
}, 2200);

function onPlayerReady(event) {
  state.isPlayerReady = true;
  const loader = document.getElementById("player-loader");
  if (loader) {
    loader.style.opacity = "0";
    setTimeout(() => loader.classList.add("hidden"), 300);
  }

  // If landing page overlay is visible on initial load, ensure player starts paused
  const landingOverlay = document.getElementById("landing-page-view");
  if (landingOverlay && !landingOverlay.classList.contains("hidden")) {
    try {
      if (state.player && typeof state.player.pauseVideo === "function") {
        state.player.pauseVideo();
      }
    } catch (_) {}
  }

  const duration = state.player.getDuration();
  if (duration && duration > 0 && Math.abs(duration - state.durationSec) > 3) {
    state.durationSec = Math.round(duration);
    updateDurationBadge();
    if (state.heatmapData) renderHeatmap(state.heatmapData);
  }

  // Start Scrubber Polling Ticker (runs every 200ms)
  setInterval(syncPlayhead, 200);
}

function onPlayerError(event) {
  console.warn("YouTube Player error event:", event);
  fallbackToDirectIframe();
}

function fallbackToDirectIframe() {
  const container = document.getElementById("youtube-player");
  if (container && (!state.player || !state.isPlayerReady)) {
    container.innerHTML = `
      <iframe 
        id="direct-yt-iframe"
        class="w-full h-full"
        src="https://www.youtube.com/embed/${state.currentVideoId}?enablejsapi=1&rel=0&playsinline=1"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen>
      </iframe>
    `;
    const loader = document.getElementById("player-loader");
    if (loader) loader.classList.add("hidden");
    state.isPlayerReady = true;
    setInterval(syncPlayhead, 200);
  }
}

function onPlayerStateChange(event) {
  // If landing page overlay is visible and video begins playing, immediately pause it
  const landingOverlay = document.getElementById("landing-page-view");
  if (landingOverlay && !landingOverlay.classList.contains("hidden") && event.data === YT.PlayerState.PLAYING) {
    try {
      if (state.player && typeof state.player.pauseVideo === "function") {
        state.player.pauseVideo();
      }
    } catch (_) {}
  }

  const playBtn = document.getElementById("ctrl-play-pause");
  if (playBtn) {
    if (event.data === YT.PlayerState.PLAYING) {
      playBtn.innerHTML = '<i data-lucide="pause" class="w-4 h-4 fill-current" aria-hidden="true"></i>';
    } else {
      playBtn.innerHTML = '<i data-lucide="play" class="w-4 h-4 fill-current" aria-hidden="true"></i>';
    }
    lucide.createIcons();
  }

  // Synchronize duration if video changed
  if (event.data === YT.PlayerState.PLAYING || event.data === YT.PlayerState.CUED) {
    if (state.player && typeof state.player.getDuration === "function") {
      const dur = state.player.getDuration();
      if (dur && dur > 10 && Math.abs(dur - state.durationSec) > 5) {
        state.durationSec = Math.round(dur);
        updateDurationBadge();
        if (state.heatmapData) renderHeatmap(state.heatmapData);
      }
    }
  }
}

function triggerAutoPauseToast(message) {
  const toast = document.getElementById("autopause-toast");
  const toastMsg = document.getElementById("autopause-toast-msg");
  if (!toast || !toastMsg) return;
  toastMsg.textContent = message;
  toast.classList.remove("hidden");
  lucide.createIcons();

  if (window._autopauseToastTimer) clearTimeout(window._autopauseToastTimer);
  window._autopauseToastTimer = setTimeout(() => {
    if (toast) toast.classList.add("hidden");
  }, 7000);
}

function syncPlayhead() {
  let current = state.currentTimeSec;
  if (state.isPlayerReady && state.player && typeof state.player.getCurrentTime === "function") {
    try {
      current = state.player.getCurrentTime() || current;
    } catch (e) {}
  }
  state.currentTimeSec = current;

  // Update Time Display
  const timeDisplay = document.getElementById("time-display");
  if (timeDisplay) {
    timeDisplay.textContent = `${formatTime(current)} / ${formatTime(state.durationSec)}`;
  }

  // Update Scrubber Bar Position & Accessibility Slider Attributes
  const playhead = document.getElementById("timeline-playhead");
  const timelineContainer = document.getElementById("timeline-container");
  if (playhead && state.durationSec > 0) {
    const pct = Math.min(100, Math.max(0, (current / state.durationSec) * 100));
    playhead.style.left = `${pct}%`;
  }
  if (timelineContainer) {
    timelineContainer.setAttribute("aria-valuenow", Math.round(current));
    timelineContainer.setAttribute("aria-valuetext", `${formatTime(current)} of ${formatTime(state.durationSec)}`);
  }

  // ----------------------------------------------------
  // AUTO-PAUSE CHECKPOINT DETECTION (High-Replay Peaks & Exam Pins)
  // ----------------------------------------------------
  if (state.autoPauseEnabled && state.isPlayerReady && state.previousTimeSec > 0) {
    // 1. Check if crossing near the end of a High-Replay Peak
    if (state.heatmapData && state.heatmapData.peaks && Array.isArray(state.heatmapData.peaks)) {
      state.heatmapData.peaks.forEach(p => {
        const peakEndTime = p.end_sec;
        if (state.previousTimeSec < peakEndTime && current >= peakEndTime && (current - peakEndTime) < 3.0) {
          const key = `peak-${p.id || p.start_sec}`;
          if (!state.triggeredAutoPauses.has(key)) {
            state.triggeredAutoPauses.add(key);
            if (state.player && typeof state.player.pauseVideo === "function") {
              try { state.player.pauseVideo(); } catch (e) {}
            }
            const cleanTitle = (p.label || "").split("(")[0].trim() || "Tricky Spot";
            triggerAutoPauseToast(`⚡ Tricky spot passed ("${cleanTitle}") — Auto-pausing for quick practice!`);
            switchTab("tab-content-recall");
          }
        }
      });
    }

    // 2. Check if crossing an Exam Priority Personal Pin
    if (state.pins && Array.isArray(state.pins)) {
      state.pins.forEach(pin => {
        if (pin.tag === "exam_priority") {
          const pinTime = pin.timestamp_sec;
          if (state.previousTimeSec < pinTime && current >= pinTime && (current - pinTime) < 3.0) {
            const key = `pin-${pin.id}`;
            if (!state.triggeredAutoPauses.has(key)) {
              state.triggeredAutoPauses.add(key);
              if (state.player && typeof state.player.pauseVideo === "function") {
                try { state.player.pauseVideo(); } catch (e) {}
              }
              triggerAutoPauseToast(`★ Reached Exam Important Note ("${pin.title}") — Auto-pausing for quick practice!`);
              switchTab("tab-content-recall");
            }
          }
        }
      });
    }
  }

  // If student scrubbed backward significantly, re-arm triggers that are ahead
  if (current < state.previousTimeSec - 5) {
    for (const key of Array.from(state.triggeredAutoPauses)) {
      if (key.startsWith("peak-")) {
        const pId = key.replace("peak-", "");
        const p = (state.heatmapData?.peaks || []).find(x => (x.id || x.start_sec) == pId);
        if (p && p.end_sec > current + 2) state.triggeredAutoPauses.delete(key);
      } else if (key.startsWith("pin-")) {
        const pinId = key.replace("pin-", "");
        const pin = (state.pins || []).find(x => x.id == pinId);
        if (pin && pin.timestamp_sec > current + 2) state.triggeredAutoPauses.delete(key);
      }
    }
  }

  state.previousTimeSec = current;
}

function jumpToTime(seconds, triggerAnalysis = true) {
  state.previousTimeSec = seconds;
  if (state.isPlayerReady && state.player && typeof state.player.seekTo === "function") {
    try {
      state.player.seekTo(seconds, true);
      state.player.playVideo();
    } catch (e) {
      console.warn("Player seekTo notice:", e);
    }
  } else {
    const iframe = document.getElementById("direct-yt-iframe");
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(JSON.stringify({
        event: "command",
        func: "seekTo",
        args: [seconds, true]
      }), "*");
      iframe.contentWindow.postMessage(JSON.stringify({
        event: "command",
        func: "playVideo",
        args: []
      }), "*");
    }
  }
  state.currentTimeSec = seconds;
  syncPlayhead();

  if (triggerAnalysis) {
    fetchSegmentAnalysis(seconds);
    fetchSegmentQuiz(seconds);
  }
}

// ==========================================
// 2. VIDEO STUDIO LOADING & DYNAMIC SWITCHING
// ==========================================

async function loadVideoStudio(videoId) {
  try {
    state.currentVideoId = videoId;
    state.triggeredAutoPauses.clear();
    state.previousTimeSec = 0;

    // Reset session bridges and missed questions for a new video
    if (videoId !== "fnF67w6rDpg") {
      state.sessionTerminologyBridges = [];
      state.missedQuizQuestions = [];
    }
    renderCheatSheetBridges();
    renderCheatSheetMissedMCQs();

    // 1. Instant fallback metadata & heatmap from StorageManager or STATIC_FALLBACK_DATA
    const fallbackHeatmap = STATIC_FALLBACK_DATA.heatmaps[videoId];
    const fallbackVideo = StorageManager.getVideos().find(v => v.video_id === videoId);

    if (fallbackVideo) {
      const titleEl = document.getElementById("video-title");
      if (titleEl) titleEl.textContent = fallbackVideo.title;
      if (fallbackVideo.duration_sec) state.durationSec = fallbackVideo.duration_sec;
    }
    if (fallbackHeatmap) {
      state.heatmapData = fallbackHeatmap;
      if (fallbackHeatmap.duration_sec) state.durationSec = fallbackHeatmap.duration_sec;
      renderHeatmap(fallbackHeatmap);
      renderDynamicPeaksUI(fallbackHeatmap);
    }
    updateDurationBadge();

    // 2. Load Pins synchronously
    await loadPins(videoId);

    // Switch video in player or fallback iframe
    if (state.isPlayerReady && state.player && typeof state.player.loadVideoById === "function") {
      try {
        state.player.loadVideoById(videoId);
      } catch (e) {
        fallbackToDirectIframe();
      }
    } else {
      fallbackToDirectIframe();
    }

    // Dismiss loader overlay
    const loader = document.getElementById("player-loader");
    if (loader) {
      loader.style.opacity = "0";
      setTimeout(() => loader.classList.add("hidden"), 300);
    }

    // Determine target initial peak for analysis
    let initialTimestamp = 30;
    if (state.heatmapData && state.heatmapData.peaks && state.heatmapData.peaks.length > 0) {
      initialTimestamp = state.heatmapData.peaks[0].peak_sec || state.heatmapData.peaks[0].start_sec;
    }

    // Automatically load analysis & quiz for this initial focus point
    fetchSegmentAnalysis(initialTimestamp);
    fetchSegmentQuiz(initialTimestamp);

    // 3. Concurrently fetch real backend heatmap and video info in background
    fetch(`/api/video/${videoId}`)
      .then(res => res.json())
      .then(data => {
        if (data.video && data.video.title) {
          const titleEl = document.getElementById("video-title");
          if (titleEl) titleEl.textContent = data.video.title;
          if (data.video.duration_sec) state.durationSec = data.video.duration_sec;
        }
        if (data.heatmap && data.heatmap.intensity_points && data.heatmap.intensity_points.length > 0) {
          state.heatmapData = data.heatmap;
          if (data.heatmap.duration_sec) state.durationSec = data.heatmap.duration_sec;
          renderHeatmap(data.heatmap);
          renderDynamicPeaksUI(data.heatmap);
          updateDurationBadge();
        }
      })
      .catch(e => console.debug("Video backend sync notice:", e));

  } catch (err) {
    console.error("Failed to load video studio:", err);
  }
}

function updateDurationBadge() {
  const durStr = formatTime(state.durationSec);
  const badge = document.getElementById("video-duration-badge");
  if (badge) badge.textContent = durStr;
  const endMarker = document.getElementById("timeline-end-time");
  if (endMarker) endMarker.textContent = durStr;
  const container = document.getElementById("timeline-container");
  if (container) container.setAttribute("aria-valuemax", Math.round(state.durationSec));
}

// Renders dynamic timeline labels and quick peak buttons for any loaded video
function renderDynamicPeaksUI(heatmap) {
  const labelsContainer = document.getElementById("timeline-peaks-label-container");
  const buttonsContainer = document.getElementById("quick-peaks-buttons");
  const peakCountBadge = document.getElementById("timeline-peak-count");

  const peaks = heatmap.peaks || [];

  if (peakCountBadge) {
    peakCountBadge.textContent = `⚡ ${peaks.length} Tricky Spots Found`;
  }

  // Render bottom timeline peak labels
  if (labelsContainer) {
    labelsContainer.innerHTML = "";
    peaks.forEach(p => {
      const startStr = formatTime(p.start_sec);
      const endStr = formatTime(p.end_sec);
      const cleanLabel = (p.label || "").split("(")[0].trim();
      const span = document.createElement("span");
      span.className = "text-amber-300 hover:text-amber-200 cursor-pointer truncate max-w-[200px] font-medium";
      span.title = p.description || p.label;
      span.textContent = `${startStr} - ${endStr} (${cleanLabel})`;
      span.addEventListener("click", () => jumpToTime(p.peak_sec || p.start_sec, true));
      labelsContainer.appendChild(span);
    });
  }

  // Render Quick Peak Jump Navigator Bar
  if (buttonsContainer) {
    buttonsContainer.innerHTML = "";
    peaks.forEach(p => {
      const peakTime = p.peak_sec || p.start_sec;
      const cleanLabel = (p.label || "").split("(")[0].trim();
      const intensityPct = Math.round((p.intensity || 0.8) * 100);

      const btn = document.createElement("button");
      btn.className = "peak-jump-btn min-h-[38px] bg-slate-800 hover:bg-indigo-600/30 hover:border-indigo-500/50 border border-slate-700 px-3 py-1.5 rounded-lg text-slate-100 transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer font-medium";
      btn.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
        <span class="truncate max-w-[190px]">${formatTime(peakTime)} • ${cleanLabel} (${intensityPct}% replayed)</span>
      `;
      btn.addEventListener("click", () => jumpToTime(peakTime, true));
      buttonsContainer.appendChild(btn);
    });
    lucide.createIcons();
  }
}

// ==========================================
// 3. MOST REPLAYED HEATMAP CURVE & TIMELINE
// ==========================================

function renderHeatmap(heatmap) {
  const svg = document.getElementById("heatmap-svg");
  const fillPath = document.getElementById("heatmap-curve-fill");
  const strokePath = document.getElementById("heatmap-curve-stroke");
  const zonesGroup = document.getElementById("difficult-zones-group");

  if (!svg || !fillPath || !strokePath || !heatmap.intensity_points) return;
  svg.setAttribute("viewBox", "0 0 1000 100");

  const points = heatmap.intensity_points;
  const numPoints = points.length;
  if (numPoints === 0) return;

  const svgWidth = 1000;
  const svgHeight = 100;

  // Build SVG path
  let pathD = "";
  points.forEach((pt, i) => {
    const x = (pt.percentage / 100) * svgWidth;
    const y = svgHeight - (pt.intensity * (svgHeight - 15)) - 5;
    if (i === 0) {
      pathD += `M ${x} ${y}`;
    } else {
      pathD += ` L ${x} ${y}`;
    }
  });

  strokePath.setAttribute("d", pathD);
  const closedPathD = `${pathD} L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z`;
  fillPath.setAttribute("d", closedPathD);

  // Render Highlighted Tricky Spots (Peaks)
  zonesGroup.innerHTML = "";
  if (heatmap.peaks && Array.isArray(heatmap.peaks)) {
    heatmap.peaks.forEach(peak => {
      const startPct = (peak.start_sec / state.durationSec) * 100;
      const endPct = (peak.end_sec / state.durationSec) * 100;
      const x = (startPct / 100) * svgWidth;
      const w = Math.max(15, ((endPct - startPct) / 100) * svgWidth);

      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", x);
      rect.setAttribute("y", "0");
      rect.setAttribute("width", w);
      rect.setAttribute("height", svgHeight);
      rect.setAttribute("fill", "url(#peak-zone-grad)");
      rect.setAttribute("opacity", "0.65");
      rect.classList.add("cursor-pointer");

      rect.addEventListener("click", (e) => {
        e.stopPropagation();
        jumpToTime(peak.peak_sec || peak.start_sec);
      });

      zonesGroup.appendChild(rect);
    });
  }
}

// Timeline User Interactions (Hover Tooltip & Seeking)
function initTimelineInteractions() {
  const container = document.getElementById("timeline-container");
  const tooltip = document.getElementById("timeline-tooltip");
  const tooltipText = document.getElementById("tooltip-text");

  if (!container || !tooltip || !tooltipText) return;

  container.addEventListener("mousemove", (e) => {
    const rect = container.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const pct = offsetX / rect.width;
    const hoverTimeSec = pct * state.durationSec;

    // Position tooltip
    tooltip.style.left = `${Math.min(rect.width - 150, Math.max(10, offsetX - 70))}px`;
    tooltip.classList.remove("hidden");

    // Check if inside tricky spot
    let peakLabel = "";
    if (state.heatmapData && state.heatmapData.peaks) {
      const match = state.heatmapData.peaks.find(p => hoverTimeSec >= p.start_sec && hoverTimeSec <= p.end_sec);
      if (match) {
        peakLabel = ` • ⚡ ${match.label.split("(")[0].trim()}`;
      }
    }

    let intensityPct = 40;
    if (state.heatmapData && state.heatmapData.intensity_points) {
      const pts = state.heatmapData.intensity_points;
      const idx = Math.min(pts.length - 1, Math.floor(pct * pts.length));
      intensityPct = Math.round((pts[idx]?.intensity || 0.4) * 100);
    }

    tooltipText.textContent = `${formatTime(hoverTimeSec)} (${intensityPct}% Replayed)${peakLabel}`;
  });

  container.addEventListener("mouseleave", () => {
    tooltip.classList.add("hidden");
  });

  container.addEventListener("click", (e) => {
    if (e.target.closest(".timeline-pin-badge")) return;

    const rect = container.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const pct = offsetX / rect.width;
    const targetTimeSec = Math.round(pct * state.durationSec);
    jumpToTime(targetTimeSec, true);
  });
}

// ==========================================
// 4. PERSONAL STUDY PINS (ACCESSIBLE TAGS & UNDO DELETION)
// ==========================================

async function loadPins(videoId) {
  // 1. Instant synchronous load from StorageManager
  state.pins = StorageManager.getPins(videoId);
  renderTimelinePins();
  renderCheatSheetPins();

  // 2. Concurrently fetch and sync with backend if online
  try {
    const res = await fetch(`/api/pins/${videoId}`);
    if (res.ok) {
      const data = await res.json();
      if (data.pins && data.pins.length > 0) {
        state.pins = data.pins;
        // Merge into StorageManager
        const allPins = (StorageManager.get("pins", null) || STATIC_FALLBACK_DATA.pins).slice();
        const otherPins = allPins.filter(p => p.video_id !== videoId);
        StorageManager.set("pins", [...otherPins, ...data.pins]);
        renderTimelinePins();
        renderCheatSheetPins();
      }
    }
  } catch (err) {
    console.debug("Backend pins sync notice (fallback active):", err);
  }
}

function renderTimelinePins() {
  const overlay = document.getElementById("timeline-pins-overlay");
  if (!overlay) return;
  overlay.innerHTML = "";

  state.pins.forEach(pin => {
    const pct = (pin.timestamp_sec / state.durationSec) * 100;
    const badge = document.createElement("div");
    badge.className = "timeline-pin-badge";
    badge.style.left = `${pct}%`;

    let colorClasses = "bg-rose-500/25 text-rose-200 border-rose-500";
    let icon = "★";
    let accessibleLabel = "Exam Important";
    if (pin.tag === "revisit") {
      colorClasses = "bg-amber-500/25 text-amber-200 border-amber-500";
      icon = "?";
      accessibleLabel = "Needs Review";
    } else if (pin.tag === "key_formula") {
      colorClasses = "bg-cyan-500/25 text-cyan-200 border-cyan-500";
      icon = "∑";
      accessibleLabel = "Key Formula";
    }

    badge.innerHTML = `
      <div class="flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-bold shadow-md backdrop-blur-md ${colorClasses}">
        <span aria-hidden="true">${icon}</span>
        <span class="font-mono text-[10px]">${formatTime(pin.timestamp_sec)}</span>
      </div>
    `;

    badge.setAttribute("role", "button");
    badge.setAttribute("aria-label", `${accessibleLabel}: ${pin.title} at ${formatTime(pin.timestamp_sec)}`);
    badge.title = `[${accessibleLabel}] ${pin.title}: ${pin.note || ""}`;
    badge.addEventListener("click", (e) => {
      e.stopPropagation();
      jumpToTime(pin.timestamp_sec, true);
      switchTab("tab-content-rescue");
    });

    overlay.appendChild(badge);
  });
}

function renderCheatSheetPins() {
  const container = document.getElementById("pins-list-container");
  const countBadge = document.getElementById("pins-count-badge");
  const filterAll = document.getElementById("filter-cnt-all");
  const filterExam = document.getElementById("filter-cnt-exam");
  const filterRevisit = document.getElementById("filter-cnt-revisit");
  const filterFormula = document.getElementById("filter-cnt-formula");

  if (!container) return;

  const total = state.pins.length;
  const examCnt = state.pins.filter(p => p.tag === "exam_priority").length;
  const revisitCnt = state.pins.filter(p => p.tag === "revisit").length;
  const formulaCnt = state.pins.filter(p => p.tag === "key_formula").length;

  if (countBadge) countBadge.textContent = total;
  if (filterAll) filterAll.textContent = total;
  if (filterExam) filterExam.textContent = examCnt;
  if (filterRevisit) filterRevisit.textContent = revisitCnt;
  if (filterFormula) filterFormula.textContent = formulaCnt;

  const filtered = state.pins.filter(p => {
    if (state.activeFilter === "all") return true;
    return p.tag === state.activeFilter;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 text-slate-300 text-xs">
        <i data-lucide="bookmark" class="w-8 h-8 mx-auto mb-2 opacity-50" aria-hidden="true"></i>
        No saved notes found for this filter. Save a note while watching to review later!
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = "";
  filtered.forEach(pin => {
    const card = document.createElement("div");
    card.className = "bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 space-y-2 transition-all";

    let tagBadge = `<span class="px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-bold">★ Exam Important</span>`;
    if (pin.tag === "revisit") {
      tagBadge = `<span class="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">? Needs Review</span>`;
    } else if (pin.tag === "key_formula") {
      tagBadge = `<span class="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold">∑ Key Formula</span>`;
    }

    card.innerHTML = `
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          ${tagBadge}
          <button class="pin-jump-btn font-mono text-[11px] font-bold text-indigo-300 hover:text-white bg-indigo-950/60 border border-indigo-800/60 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer" data-time="${pin.timestamp_sec}">
            <i data-lucide="play" class="w-3 h-3 fill-current" aria-hidden="true"></i> ${formatTime(pin.timestamp_sec)}
          </button>
        </div>
        <button class="delete-pin-btn min-h-[36px] min-w-[36px] text-slate-400 hover:text-rose-400 p-1.5 transition-colors cursor-pointer rounded-lg hover:bg-slate-900" data-id="${pin.id}" title="Delete Saved Note" aria-label="Delete saved note: ${pin.title}">
          <i data-lucide="trash-2" class="w-4 h-4" aria-hidden="true"></i>
        </button>
      </div>
      <h4 class="text-xs font-bold text-slate-100">${pin.title}</h4>
      ${pin.note ? `<p class="text-xs text-slate-300 leading-relaxed font-serif bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">${pin.note}</p>` : ""}
    `;

    card.querySelector(".pin-jump-btn").addEventListener("click", () => {
      jumpToTime(pin.timestamp_sec, true);
      switchTab("tab-content-rescue");
    });

    card.querySelector(".delete-pin-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      deletePinWithUndo(pin.id);
    });

    container.appendChild(card);
  });

  lucide.createIcons();
}

// User-friendly Deletion with 5-Second Undo Toast
function deletePinWithUndo(pinId) {
  const pinIndex = state.pins.findIndex(p => p.id === pinId);
  if (pinIndex === -1) return;

  const deletedPin = state.pins[pinIndex];

  // If there was an already pending deletion, execute it immediately
  if (state.pendingDeleteTimeout) {
    clearTimeout(state.pendingDeleteTimeout);
    if (state.pendingDeletedPin) {
      executePermanentDelete(state.pendingDeletedPin.id);
    }
  }

  // Optimistic UI removal
  state.pins.splice(pinIndex, 1);
  renderTimelinePins();
  renderCheatSheetPins();

  state.pendingDeletedPin = deletedPin;

  // Show Undo Toast
  const toast = document.getElementById("undo-delete-toast");
  const msg = document.getElementById("undo-delete-msg");
  const undoBtn = document.getElementById("undo-delete-btn");

  if (toast && msg && undoBtn) {
    msg.textContent = `Saved note "${deletedPin.title}" deleted.`;
    toast.classList.remove("hidden");

    undoBtn.onclick = () => {
      // Undo action!
      if (state.pendingDeleteTimeout) clearTimeout(state.pendingDeleteTimeout);
      state.pins.push(deletedPin);
      state.pins.sort((a, b) => a.timestamp_sec - b.timestamp_sec);
      state.pendingDeletedPin = null;
      state.pendingDeleteTimeout = null;
      toast.classList.add("hidden");
      renderTimelinePins();
      renderCheatSheetPins();
    };

    // Set 5-second timer before permanent API deletion
    state.pendingDeleteTimeout = setTimeout(() => {
      toast.classList.add("hidden");
      executePermanentDelete(deletedPin.id);
      state.pendingDeletedPin = null;
      state.pendingDeleteTimeout = null;
    }, 5000);
  } else {
    executePermanentDelete(deletedPin.id);
  }
}

async function executePermanentDelete(pinId) {
  StorageManager.deletePin(pinId);
  try {
    await fetch(`/api/pins/${pinId}`, { method: "DELETE" });
  } catch (err) {
    console.debug("Backend delete pin notice:", err);
  }
}

// ==========================================
// 5. TAB 1: SIMPLE EXPLANATION (STEP-BY-STEP PROGRESS & PLAIN LANGUAGE)
// ==========================================

async function runAiSegmentAnalysis(timestampSec, studentDoubt = null, forceFresh = false) {
  const skeleton = document.getElementById("rescue-loading-skeleton");
  const content = document.getElementById("rescue-real-content");
  const winBanner = document.getElementById("rescue-window-time");
  const skStep1 = document.getElementById("sk-step-1");
  const skStep2 = document.getElementById("sk-step-2");
  const skStep3 = document.getElementById("sk-step-3");

  const windowSec = state.analysisWindowSeconds || 240;
  const halfWin = windowSec / 2;
  const startSec = Math.max(0, timestampSec - halfWin);
  const endSec = timestampSec + halfWin;

  if (winBanner) {
    winBanner.textContent = `${formatTime(startSec)} – ${formatTime(endSec)}`;
  }

  // 1. Instant check in StorageManager (0ms latency!) on initial load
  if (!forceFresh && !studentDoubt) {
    const cachedAnalysis = StorageManager.getAnalysis(state.currentVideoId, timestampSec);
    if (cachedAnalysis) {
      state.activeAnalysis = cachedAnalysis;
      renderTab1AIRescue(cachedAnalysis, timestampSec);
      if (cachedAnalysis.visual_diagram) {
        renderVisualDiagram(cachedAnalysis.visual_diagram);
      }
      if (cachedAnalysis.checkpoint_mcqs) {
        renderCheckpointMCQs(cachedAnalysis.checkpoint_mcqs);
      }
      if (skeleton) skeleton.classList.add("hidden");
      if (content) content.classList.remove("hidden");
      lucide.createIcons();
      return;
    }
  }

  // Show friendly step-by-step skeleton while AI analysis is running
  if (skeleton) skeleton.classList.remove("hidden");
  if (content) content.classList.add("hidden");

  // Animate progress steps
  if (skStep1) skStep1.className = "flex items-center gap-2 text-indigo-300 font-bold";
  if (skStep2) skStep2.className = "flex items-center gap-2 text-slate-400";
  if (skStep3) skStep3.className = "flex items-center gap-2 text-slate-400";

  const stepTimer1 = setTimeout(() => {
    if (skStep2) skStep2.className = "flex items-center gap-2 text-indigo-300 font-bold";
  }, 700);

  const stepTimer2 = setTimeout(() => {
    if (skStep3) skStep3.className = "flex items-center gap-2 text-indigo-300 font-bold";
  }, 1400);

  const videoTitle = document.getElementById("video-title")?.textContent || "College Lecture";

  try {
    const res = await fetch("/api/analyze-segment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        video_id: state.currentVideoId,
        video_title: videoTitle,
        center_timestamp_sec: timestampSec,
        window_seconds: windowSec,
        student_doubt: studentDoubt
      })
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    state.activeAnalysis = data;
    StorageManager.saveAnalysis(state.currentVideoId, timestampSec, data);

    // Render Tab 1 Simple Explanation
    renderTab1AIRescue(data, timestampSec);

    // Sync Tab 2 (Visual Practice Diagram & Checkpoint MCQs)
    if (data.visual_diagram) {
      renderVisualDiagram(data.visual_diagram);
    }
    if (data.checkpoint_mcqs) {
      renderCheckpointMCQs(data.checkpoint_mcqs);
    }

  } catch (err) {
    console.warn("AI segment analysis API fallback invoked:", err);
    // Graceful fallback to static data so user never sees a broken state
    const fallback = StorageManager.getAnalysis(state.currentVideoId, timestampSec) || 
      (STATIC_FALLBACK_DATA.analyses["fnF67w6rDpg"] && STATIC_FALLBACK_DATA.analyses["fnF67w6rDpg"][0]?.data);
    if (fallback) {
      state.activeAnalysis = fallback;
      renderTab1AIRescue(fallback, timestampSec);
      if (fallback.visual_diagram) renderVisualDiagram(fallback.visual_diagram);
      if (fallback.checkpoint_mcqs) renderCheckpointMCQs(fallback.checkpoint_mcqs);
    }
  } finally {
    clearTimeout(stepTimer1);
    clearTimeout(stepTimer2);
    if (skeleton) skeleton.classList.add("hidden");
    if (content) content.classList.remove("hidden");
    lucide.createIcons();
  }
}

// Unified alias for callers
async function fetchSegmentAnalysis(timestampSec, studentDoubt = null, forceFresh = false) {
  return await runAiSegmentAnalysis(timestampSec, studentDoubt, forceFresh);
}

async function fetchSegmentQuiz(timestampSec) {
  if (state.activeAnalysis && state.activeAnalysis.visual_diagram && state.activeAnalysis.checkpoint_mcqs) {
    renderVisualDiagram(state.activeAnalysis.visual_diagram);
    renderCheckpointMCQs(state.activeAnalysis.checkpoint_mcqs);
    return;
  }
  try {
    const res = await fetch(`/api/quiz/${state.currentVideoId}?timestamp_sec=${timestampSec}`);
    const data = await res.json();
    if (data.quiz) {
      renderVisualDiagram(data.quiz);
    }
  } catch (e) {
    console.warn("Quiz fallback notice:", e);
  }
}

function renderTab1AIRescue(data, timestampSec) {
  const winBanner = document.getElementById("rescue-window-time");
  const classBadge = document.getElementById("rescue-classification-badge");
  const titleEl = document.getElementById("rescue-title");
  const struggleEl = document.getElementById("rescue-why-struggle");
  const pillsContainer = document.getElementById("rescue-concept-pills");
  const explEl = document.getElementById("rescue-explanation");
  const tableBody = document.getElementById("rescue-terminology-bridge-body");

  if (winBanner && data.segment_window) {
    winBanner.textContent = data.segment_window;
  }

  // Classification Badge (Plain Language)
  if (classBadge) {
    const isMath = (data.section_classification || "").toLowerCase().includes("math");
    if (isMath) {
      classBadge.className = "px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 border border-rose-500/30 text-rose-300";
      classBadge.innerHTML = `★ Potentially Difficult Math`;
    } else {
      classBadge.className = "px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300";
      classBadge.innerHTML = `💡 High-Density Concept`;
    }
  }

  // Title
  if (titleEl) {
    const primaryConcept = data.identified_concepts?.[0]?.name;
    titleEl.textContent = primaryConcept ? `${primaryConcept} (Simple Breakdown)` : `Section Explanation (${data.segment_window || formatTime(timestampSec)})`;
  }

  // Why Students Rewatch This Part
  if (struggleEl) {
    struggleEl.textContent = data.why_students_struggle || "Students struggle with the fast transitions in notation and abstract physical assumptions.";
  }

  // Key Takeaways (Concepts & Pills with high-contrast text)
  if (pillsContainer) {
    pillsContainer.innerHTML = "";
    const concepts = data.identified_concepts || [];
    if (concepts.length === 0) {
      pillsContainer.innerHTML = `<span class="text-xs text-slate-300">Core lecture principles and derivation steps.</span>`;
    } else {
      concepts.forEach(c => {
        let diffColor = "bg-amber-500/15 text-amber-200 border-amber-500/30";
        if (c.difficulty === "Beginner") diffColor = "bg-emerald-500/15 text-emerald-200 border-emerald-500/30";
        if (c.difficulty === "Advanced") diffColor = "bg-rose-500/15 text-rose-200 border-rose-500/30";

        let modColor = "bg-indigo-500/15 text-indigo-200 border-indigo-500/30";
        if (c.modality === "Visual") modColor = "bg-purple-500/15 text-purple-200 border-purple-500/30";
        if (c.modality === "Mathematical") modColor = "bg-cyan-500/15 text-cyan-200 border-cyan-500/30";

        const pill = document.createElement("div");
        pill.className = "flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs hover:border-slate-600 transition-colors";
        pill.innerHTML = `
          <span class="font-bold text-slate-100">${c.name}</span>
          <span class="text-[9px] px-1.5 py-0.2 rounded border font-mono font-bold ${diffColor}">${c.difficulty || "Core"}</span>
          <span class="text-[9px] px-1.5 py-0.2 rounded border font-mono font-bold ${modColor}">${c.modality || "Concept"}</span>
        `;
        pillsContainer.appendChild(pill);
      });
    }
  }

  // Step-by-Step Breakdown (Using the Video's Exact Terms) & KaTeX
  if (explEl) {
    explEl.innerHTML = formatMarkdownAndMath(data.context_locked_explanation || "");
    renderMathInElementSafe(explEl);
  }

  // Term Comparison Table (Lecture Term vs. Other Videos' Term)
  if (tableBody) {
    tableBody.innerHTML = "";
    const bridgeItems = data.terminology_bridge || [];
    if (bridgeItems.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="3" class="p-3 text-center text-slate-400 text-xs">Standard notation aligns with common engineering textbooks.</td></tr>`;
    } else {
      bridgeItems.forEach(row => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-slate-900/60 transition-colors";
        tr.innerHTML = `
          <td class="p-2.5 border-b border-slate-800 font-mono font-bold text-indigo-300 text-xs">${row.prof_term || ""}</td>
          <td class="p-2.5 border-b border-slate-800 font-mono text-cyan-300 text-xs">${row.alt_video_term || ""}</td>
          <td class="p-2.5 border-b border-slate-800 text-slate-200 text-xs font-serif leading-snug">${row.clarification || ""}</td>
        `;
        tableBody.appendChild(tr);
        renderMathInElementSafe(tr);

        // Accumulate into session cheat-sheet matrix
        if (row && row.prof_term && !state.sessionTerminologyBridges.some(b => b.prof_term === row.prof_term)) {
          state.sessionTerminologyBridges.push(row);
        }
      });
      renderCheatSheetBridges();
    }
  }

  // Auto-Save Summary Button
  const autoSaveBtn = document.getElementById("btn-autosave-summary-pin");
  if (autoSaveBtn) {
    autoSaveBtn.onclick = async () => {
      const topConcept = data.identified_concepts?.[0]?.name || "Core Concept";
      const newPin = {
        video_id: state.currentVideoId,
        timestamp_sec: timestampSec,
        tag: "exam_priority",
        title: `Summary: ${topConcept}`,
        note: `★ Key Takeaway: ${data.why_students_struggle}\n\n💡 Breakdown: ${data.context_locked_explanation ? data.context_locked_explanation.slice(0, 320) : ""}...`
      };

      const savedPin = StorageManager.savePin(newPin);
      state.pins.push(savedPin);
      state.pins.sort((a, b) => a.timestamp_sec - b.timestamp_sec);
      renderTimelinePins();
      renderCheatSheetPins();

      autoSaveBtn.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-400" aria-hidden="true"></i><span class="text-emerald-300 font-bold">✓ Saved to Notes!</span>`;
      lucide.createIcons();
      setTimeout(() => {
        autoSaveBtn.innerHTML = `<i data-lucide="bookmark-plus" class="w-3.5 h-3.5" aria-hidden="true"></i><span>Save as Note</span>`;
        lucide.createIcons();
      }, 2500);

      try {
        await fetch("/api/pins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newPin)
        });
      } catch (err) {
        console.debug("Auto-save note backend sync notice:", err);
      }
    };
  }

  // Fetch and render Alternative Videos
  const query = (data.recommended_search_queries && data.recommended_search_queries[0]) ||
                (data.identified_concepts && data.identified_concepts[0]?.name) ||
                "lecture concept visual intuition";
  loadAlternativeVideos(query);
}

async function loadAlternativeVideos(query) {
  const altsContainer = document.getElementById("rescue-alt-videos");
  if (!altsContainer) return;

  altsContainer.innerHTML = `
    <div class="text-xs text-slate-300 flex items-center gap-2 p-3 bg-slate-900 rounded-xl">
      <i data-lucide="loader-2" class="w-4 h-4 animate-spin text-indigo-400" aria-hidden="true"></i>
      <span>Finding intuitive animations and visual explanations for "${query}"...</span>
    </div>
  `;
  lucide.createIcons();

  try {
    const res = await fetch(`/api/alternative-videos?q=${encodeURIComponent(query)}&max_results=4`);
    const data = await res.json();
    const videos = data.videos || [];

    if (videos.length === 0) {
      altsContainer.innerHTML = `<div class="text-xs text-slate-400 py-2">No other videos found for this topic.</div>`;
      return;
    }

    altsContainer.innerHTML = "";
    videos.forEach(v => {
      const card = document.createElement("div");
      card.className = "flex items-start gap-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-3 transition-all group";
      card.innerHTML = `
        <div class="relative w-24 h-16 rounded-lg overflow-hidden shrink-0 border border-slate-800 cursor-pointer alt-video-thumb">
          <img src="${v.thumbnail}" alt="${v.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform" onerror="this.src='https://img.youtube.com/vi/${v.video_id}/hqdefault.jpg'" />
          <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <i data-lucide="play" class="w-5 h-5 text-white fill-current" aria-hidden="true"></i>
          </div>
          <span class="absolute bottom-1 right-1 bg-black/80 text-[9px] font-mono px-1 rounded text-white">${v.duration || "Visual"}</span>
        </div>
        <div class="flex-1 min-w-0 space-y-1">
          <div class="flex items-center justify-between gap-1">
            <span class="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 truncate">${v.tag || "Visual Animation"}</span>
            <span class="text-[10px] text-slate-400 truncate">${v.channel}</span>
          </div>
          <h5 class="text-xs font-bold text-slate-100 line-clamp-1 group-hover:text-indigo-300 transition-colors cursor-pointer alt-video-title">${v.title}</h5>
          <p class="text-[11px] text-slate-300 line-clamp-2 font-serif">${v.description || "Intuitive visual breakdown of this exact concept."}</p>
        </div>
        <div class="flex flex-col gap-1 shrink-0">
          <button class="preview-alt-btn min-h-[36px] min-w-[36px] p-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center" title="Preview inside studio" aria-label="Preview video: ${v.title}">
            <i data-lucide="play" class="w-3.5 h-3.5" aria-hidden="true"></i>
          </button>
          <a href="${v.url || `https://www.youtube.com/watch?v=${v.video_id}`}" target="_blank" rel="noopener noreferrer" class="min-h-[36px] min-w-[36px] p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center justify-center" title="Open on YouTube" aria-label="Open on YouTube: ${v.title}">
            <i data-lucide="external-link" class="w-3.5 h-3.5" aria-hidden="true"></i>
          </a>
        </div>
      `;

      const openModal = () => openAltVideoModal(v);
      card.querySelector(".alt-video-thumb").addEventListener("click", openModal);
      card.querySelector(".alt-video-title").addEventListener("click", openModal);
      card.querySelector(".preview-alt-btn").addEventListener("click", openModal);

      altsContainer.appendChild(card);
    });

    lucide.createIcons();

  } catch (err) {
    console.error("Failed to load alternative videos:", err);
    altsContainer.innerHTML = `<div class="text-xs text-rose-300 py-1">Failed to load other videos.</div>`;
  }
}

function openAltVideoModal(video) {
  const modal = document.getElementById("alt-video-modal");
  const title = document.getElementById("alt-modal-title");
  const iframe = document.getElementById("alt-modal-iframe");
  if (!modal || !iframe) return;

  if (title) title.textContent = `${video.title} (${video.channel || "Alternative Studio"})`;
  iframe.src = `https://www.youtube.com/embed/${video.video_id}?autoplay=1&rel=0`;
  modal.classList.remove("hidden");
}

function closeAltVideoModal() {
  const modal = document.getElementById("alt-video-modal");
  const iframe = document.getElementById("alt-modal-iframe");
  if (iframe) iframe.src = "";
  if (modal) modal.classList.add("hidden");
}

// Ask Follow-up Question to AI Tutor
async function handleAskFollowup() {
  const input = document.getElementById("ai-question-input");
  const responseBox = document.getElementById("ai-response-box");
  const responseContent = document.getElementById("ai-response-content");

  if (!input || !input.value.trim()) return;
  const question = input.value.trim();

  responseBox.classList.remove("hidden");
  responseContent.innerHTML = `<span class="flex items-center gap-2 text-slate-300"><i data-lucide="loader-2" class="w-4 h-4 animate-spin text-indigo-400" aria-hidden="true"></i> Finding answer from lecture context...</span>`;
  lucide.createIcons();

  try {
    const res = await fetch("/api/analysis/followup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        video_id: state.currentVideoId,
        current_time_sec: state.currentTimeSec,
        question: question,
        context_text: state.activeAnalysis?.context_locked_explanation || ""
      })
    });
    const data = await res.json();
    responseContent.innerHTML = formatMarkdownAndMath(data.answer || "Answer generated.");
    renderMathInElementSafe(responseContent);
    input.value = "";
  } catch (err) {
    responseContent.innerHTML = `<span class="text-rose-300 font-medium">Sorry, could not connect right now. Please try again.</span>`;
  }
}

// ==========================================
// 6. TAB 2: QUICK PRACTICE (VISUAL FLOW & MCQS)
// ==========================================

function renderVisualDiagram(diagram) {
  const titleEl = document.getElementById("diagram-title");
  const nodesContainer = document.getElementById("diagram-nodes-container");
  const scoreBadge = document.getElementById("recall-score-badge");

  if (!diagram) return;
  if (titleEl) titleEl.textContent = diagram.title || "Quick Practice: Concept Flow";
  if (!nodesContainer) return;

  const nodes = diagram.nodes || [];
  nodesContainer.innerHTML = "";

  const hiddenNodes = nodes.filter(n => n.is_hidden_quiz || n.is_blank);
  const totalHidden = hiddenNodes.length;
  state.conceptMastery = { total: totalHidden, unlocked: 0 };

  const updateMasteryBadge = () => {
    if (!scoreBadge) return;
    if (totalHidden === 0) {
      scoreBadge.textContent = "⚡ Mastered";
      scoreBadge.className = "text-xs font-mono font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 rounded";
    } else {
      const pct = Math.round((state.conceptMastery.unlocked / totalHidden) * 100);
      scoreBadge.textContent = `⚡ Mastery: ${state.conceptMastery.unlocked} / ${totalHidden} (${pct}%)`;
      if (pct === 100) {
        scoreBadge.className = "text-xs font-mono font-bold text-emerald-300 bg-emerald-500/25 border border-emerald-500/50 px-2.5 py-0.5 rounded shadow-[0_0_8px_rgba(16,185,129,0.3)] animate-pulse";
      } else {
        scoreBadge.className = "text-xs font-mono font-bold text-cyan-300 bg-cyan-500/20 border border-cyan-500/40 px-2.5 py-0.5 rounded";
      }
    }
  };
  updateMasteryBadge();

  nodes.forEach((node, idx) => {
    // Flowchart Arrow Connector between sequential nodes
    if (idx > 0) {
      const connector = document.createElement("div");
      connector.className = "flex justify-center my-1 text-cyan-400";
      connector.innerHTML = `<i data-lucide="arrow-down" class="w-4 h-4" aria-hidden="true"></i>`;
      nodesContainer.appendChild(connector);
    }

    const isHidden = Boolean(node.is_hidden_quiz || node.is_blank);
    const correctLabel = node.label || node.revealed_text || (node.options && node.options[0]) || "";

    if (!isHidden) {
      const card = document.createElement("div");
      card.className = "bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-sm";
      card.innerHTML = `
        <div class="space-y-0.5 min-w-0">
          <div class="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span> Step ${idx + 1}
          </div>
          <div class="text-xs font-bold text-slate-100 truncate node-content">${node.label || node.title || node.content || ""}</div>
        </div>
        <div class="w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
          <i data-lucide="check" class="w-4 h-4 text-emerald-400" aria-hidden="true"></i>
        </div>
      `;
      renderMathInElementSafe(card.querySelector(".node-content"));
      nodesContainer.appendChild(card);
    } else {
      const card = document.createElement("div");
      card.id = `diag-node-${idx}`;
      card.className = "recall-node-card locked border border-cyan-500/50 rounded-2xl p-4 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/20 space-y-3 shadow-sm transition-all";

      let options = Array.isArray(node.options) && node.options.length >= 2 ? [...node.options] : [
        correctLabel,
        "High-density kinetic threshold",
        "Linear equilibrium constant"
      ];
      if (!options.includes(correctLabel)) {
        options.unshift(correctLabel);
      }

      card.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="text-[10px] uppercase font-mono font-bold tracking-wider text-cyan-300 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            Practice Slot • Step ${idx + 1}
          </div>
          <span class="node-status-pill text-[10px] text-cyan-300 font-mono font-bold bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded">Click to Recall</span>
        </div>
        <div class="slot-action-area">
          <button class="blank-slot-btn w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-bold bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/60 text-cyan-100 shadow-[0_0_12px_rgba(6,182,212,0.25)] flex items-center justify-center gap-2 cursor-pointer transition-all">
            <i data-lucide="help-circle" class="w-4 h-4 text-cyan-400 animate-pulse" aria-hidden="true"></i>
            <span class="font-mono tracking-wide">[ ? Click to Recall ]</span>
          </button>
        </div>
        <div id="diag-options-${idx}" class="hidden p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5 shadow-inner">
          <div class="flex items-center justify-between text-xs text-cyan-300 font-bold">
            <span>Choose the correct concept or formula:</span>
            <span class="text-[10px] text-slate-400 font-mono">3 choices</span>
          </div>
          <div class="feedback-msg text-xs hidden font-medium"></div>
          <div class="grid grid-cols-1 gap-2">
            ${options.map((opt, oIdx) => `
              <button class="diag-opt-btn min-h-[44px] text-left text-xs bg-slate-900 hover:bg-slate-800 px-3.5 py-2.5 rounded-xl border border-slate-700 hover:border-slate-600 text-slate-100 transition-all flex items-center justify-between cursor-pointer group" data-node-idx="${idx}" data-val="${opt.replace(/"/g, '&quot;')}">
                <span class="opt-label group-hover:text-cyan-300 transition-colors font-medium">${String.fromCharCode(65 + oIdx)}) ${opt}</span>
                <i data-lucide="chevron-right" class="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" aria-hidden="true"></i>
              </button>
            `).join("")}
          </div>
        </div>
      `;

      const toggleBtn = card.querySelector(".blank-slot-btn");
      const optBox = card.querySelector(`#diag-options-${idx}`);
      const feedbackDiv = card.querySelector(".feedback-msg");
      const actionArea = card.querySelector(".slot-action-area");
      const statusPill = card.querySelector(".node-status-pill");

      toggleBtn.addEventListener("click", () => {
        optBox.classList.toggle("hidden");
      });

      card.querySelectorAll(".diag-opt-btn").forEach(optBtn => {
        optBtn.addEventListener("click", () => {
          const selectedVal = optBtn.getAttribute("data-val");
          if (selectedVal === correctLabel) {
            // Correct choice
            card.className = "recall-node-card unlocked border border-emerald-500/60 rounded-2xl p-4 bg-gradient-to-br from-slate-900 via-emerald-950/20 to-slate-900 space-y-3 shadow-sm transition-all";
            
            actionArea.innerHTML = `
              <div class="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-bold bg-emerald-950/60 border border-emerald-500/70 text-emerald-200 flex items-center justify-between shadow-sm">
                <div class="flex items-center gap-2">
                  <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true"></i>
                  <span class="revealed-text font-serif text-[13px]">${correctLabel}</span>
                </div>
                <span class="text-[10px] font-mono text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded font-bold">Locked</span>
              </div>
            `;
            renderMathInElementSafe(actionArea.querySelector(".revealed-text"));

            statusPill.className = "node-status-pill text-[10px] text-emerald-300 font-mono font-bold bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded";
            statusPill.textContent = "✓ Unlocked";

            optBox.innerHTML = `
              <div class="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 font-bold flex items-center gap-2">
                <i data-lucide="sparkles" class="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true"></i>
                <span>Locked into memory! (+1 Mastery Point)</span>
              </div>
            `;
            
            state.conceptMastery.unlocked++;
            updateMasteryBadge();
            lucide.createIcons();
          } else {
            // Incorrect choice
            feedbackDiv.classList.remove("hidden");
            feedbackDiv.className = "feedback-msg text-xs text-rose-300 font-medium flex items-center gap-2 p-2.5 rounded-xl bg-rose-950/40 border border-rose-900/60";
            feedbackDiv.innerHTML = `<i data-lucide="alert-circle" class="w-4 h-4 text-rose-400 shrink-0" aria-hidden="true"></i> <span>✕ Not quite right — consider the core intuition and try another choice!</span>`;
            optBtn.classList.add("bg-rose-950/50", "border-rose-500/80", "text-rose-200");
            lucide.createIcons();
          }
        });
      });

      nodesContainer.appendChild(card);
    }
  });

  lucide.createIcons();
}

function renderCheckpointMCQs(mcqs) {
  const mcqsContainer = document.getElementById("mcqs-container");
  if (!mcqsContainer) return;
  if (!mcqs || !Array.isArray(mcqs)) return;

  mcqsContainer.innerHTML = "";

  mcqs.forEach((mcq, qIdx) => {
    const qCard = document.createElement("div");
    qCard.className = "bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3.5";
    
    const reviewTime = mcq.review_timestamp_sec || state.currentTimeSec;

    qCard.innerHTML = `
      <div class="flex items-start gap-2.5">
        <span class="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-indigo-500/30">
          Q${qIdx + 1}
        </span>
        <p class="text-xs font-bold text-slate-100 leading-snug">${mcq.question}</p>
      </div>
      <div class="grid grid-cols-1 gap-2 pt-0.5">
        ${(mcq.options || []).map((opt, oIdx) => `
          <button class="mcq-option-btn text-left text-xs bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-3 text-slate-200 flex items-center justify-between transition-all cursor-pointer group" data-q-idx="${qIdx}" data-o-idx="${oIdx}">
            <span class="group-hover:text-indigo-200 transition-colors font-medium">${String.fromCharCode(65 + oIdx)}) ${opt}</span>
            <span class="opt-status font-mono text-xs hidden shrink-0 ml-2"></span>
          </button>
        `).join("")}
      </div>
      <div id="mcq-expl-${qIdx}" class="hidden p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-900/60 text-xs text-slate-200 leading-relaxed font-serif space-y-2.5">
        <div class="flex items-start gap-2">
          <i data-lucide="info" class="w-4 h-4 text-indigo-300 shrink-0 mt-0.5" aria-hidden="true"></i>
          <div><strong class="text-indigo-200 font-sans">Explanation & Intuition:</strong> ${mcq.explanation}</div>
        </div>
        <div class="review-btn-container pt-1">
          <!-- Rewatch button injected dynamically on wrong answer -->
        </div>
      </div>
    `;

    qCard.querySelectorAll(".mcq-option-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const qI = parseInt(btn.getAttribute("data-q-idx"));
        const oI = parseInt(btn.getAttribute("data-o-idx"));
        const targetMcq = mcqs[qI];
        const explDiv = document.getElementById(`mcq-expl-${qI}`);
        const reviewContainer = explDiv ? explDiv.querySelector(".review-btn-container") : null;

        qCard.querySelectorAll(".mcq-option-btn").forEach(b => {
          b.disabled = true;
          b.classList.remove("cursor-pointer", "hover:border-slate-700");
        });

        if (oI === targetMcq.correct_index) {
          btn.className = "mcq-option-btn text-left text-xs bg-emerald-950/50 border border-emerald-500 rounded-xl p-3 text-emerald-200 flex items-center justify-between shadow-sm";
          const statusSpan = btn.querySelector(".opt-status");
          statusSpan.classList.remove("hidden");
          statusSpan.innerHTML = `<span class="px-2 py-0.5 rounded bg-emerald-500/25 text-emerald-300 font-bold flex items-center gap-1"><i data-lucide="check" class="w-3.5 h-3.5" aria-hidden="true"></i> Correct</span>`;
        } else {
          btn.className = "mcq-option-btn text-left text-xs bg-rose-950/50 border border-rose-500 rounded-xl p-3 text-rose-200 flex items-center justify-between shadow-sm";
          const statusSpan = btn.querySelector(".opt-status");
          statusSpan.classList.remove("hidden");
          statusSpan.innerHTML = `<span class="px-2 py-0.5 rounded bg-rose-500/25 text-rose-300 font-bold">✕ Incorrect</span>`;

          const allOptions = qCard.querySelectorAll(".mcq-option-btn");
          if (allOptions[targetMcq.correct_index]) {
            allOptions[targetMcq.correct_index].className = "mcq-option-btn text-left text-xs bg-emerald-950/40 border border-emerald-500/70 rounded-xl p-3 text-emerald-200 flex items-center justify-between";
            const rightStatus = allOptions[targetMcq.correct_index].querySelector(".opt-status");
            rightStatus.classList.remove("hidden");
            rightStatus.innerHTML = `<span class="text-xs text-emerald-400 font-mono font-bold">✓ Correct Answer</span>`;
          }

          // Record in missedQuizQuestions for Tab 3 Saved Notes
          const existing = state.missedQuizQuestions.find(m => m.question === targetMcq.question);
          if (!existing) {
            state.missedQuizQuestions.push({
              question: targetMcq.question,
              options: targetMcq.options,
              correct_index: targetMcq.correct_index,
              correct_answer: targetMcq.options[targetMcq.correct_index],
              wrong_answer: targetMcq.options[oI],
              explanation: targetMcq.explanation,
              review_timestamp_sec: reviewTime
            });
            renderCheatSheetMissedMCQs();
          }

          // Inject the Rewatch 30s explanation button
          if (reviewContainer) {
            reviewContainer.innerHTML = `
              <button class="jump-review-btn w-full min-h-[44px] bg-gradient-to-r from-rose-600/30 via-amber-600/30 to-rose-600/30 hover:from-rose-600/50 hover:to-amber-600/50 border border-amber-500/50 text-amber-100 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer">
                <i data-lucide="rotate-ccw" class="w-4 h-4 text-amber-400" aria-hidden="true"></i>
                <span>⏪ Rewatch Exact 30s Explanation (${formatTime(reviewTime)})</span>
              </button>
            `;
            const rBtn = reviewContainer.querySelector(".jump-review-btn");
            if (rBtn) {
              rBtn.onclick = () => {
                jumpToTime(Math.max(0, reviewTime - 15), false);
              };
            }
          }
        }

        if (explDiv) {
          explDiv.classList.remove("hidden");
        }
        lucide.createIcons();
      });
    });

    mcqsContainer.appendChild(qCard);
  });

  lucide.createIcons();
}

// Tab 3: Session Terminology Bridge Matrix
function renderCheatSheetBridges() {
  const tbody = document.getElementById("cheatsheet-bridge-body");
  const countBadge = document.getElementById("bridges-count-badge");
  if (!tbody) return;

  if (countBadge) {
    countBadge.textContent = `${state.sessionTerminologyBridges.length} Mappings`;
  }

  if (state.sessionTerminologyBridges.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" class="p-3 text-center text-slate-400 text-xs">No term comparisons accumulated yet. They appear as you explore tricky spots!</td></tr>`;
    return;
  }

  tbody.innerHTML = "";
  state.sessionTerminologyBridges.forEach(b => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-slate-900/60 transition-colors";
    tr.innerHTML = `
      <td class="p-2.5 border-b border-slate-800 font-mono font-bold text-indigo-300 text-xs bridge-math">${b.prof_term || ""}</td>
      <td class="p-2.5 border-b border-slate-800 font-mono text-cyan-300 text-xs">${b.alt_video_term || ""}</td>
      <td class="p-2.5 border-b border-slate-800 text-slate-200 text-xs font-serif leading-snug">${b.clarification || ""}</td>
    `;
    tbody.appendChild(tr);
    renderMathInElementSafe(tr.querySelector(".bridge-math"));
  });
}

// Tab 3: Targeted Revision: Missed Checkpoints
function renderCheatSheetMissedMCQs() {
  const container = document.getElementById("cheatsheet-missed-mcqs-container");
  const countBadge = document.getElementById("missed-count-badge");
  if (!container) return;

  if (countBadge) {
    countBadge.textContent = `${state.missedQuizQuestions.length} To Review`;
    if (state.missedQuizQuestions.length > 0) {
      countBadge.className = "text-[10px] font-mono text-rose-300 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded font-bold animate-pulse";
    } else {
      countBadge.className = "text-[10px] font-mono text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded font-semibold";
    }
  }

  if (state.missedQuizQuestions.length === 0) {
    container.innerHTML = `
      <div class="text-center py-5 bg-emerald-950/20 border border-emerald-900/40 rounded-2xl text-xs text-emerald-300 flex flex-col items-center justify-center gap-1.5">
        <div class="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
          <i data-lucide="check-circle" class="w-4 h-4 text-emerald-400" aria-hidden="true"></i>
        </div>
        <span class="font-bold text-slate-100">Zero Missed Checkpoints!</span>
        <span class="text-xs text-slate-300">When you answer a checkpoint question incorrectly, it appears here for targeted pre-exam cramming.</span>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = "";
  state.missedQuizQuestions.forEach((m, idx) => {
    const card = document.createElement("div");
    card.className = "bg-slate-950/80 border border-rose-900/50 hover:border-rose-700/60 rounded-2xl p-3.5 space-y-2.5 transition-all shadow-sm";
    card.innerHTML = `
      <div class="flex items-center justify-between gap-2">
        <span class="text-[10px] font-mono uppercase text-rose-300 font-bold flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          Question to Review #${idx + 1}
        </span>
        <button class="review-missed-btn min-h-[36px] px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/40 text-xs text-indigo-200 hover:text-white font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer" data-rev-time="${m.review_timestamp_sec}">
          <i data-lucide="play" class="w-3 h-3 fill-current" aria-hidden="true"></i> Jump to ${formatTime(m.review_timestamp_sec)}
        </button>
      </div>
      <p class="text-xs font-bold text-slate-100 leading-snug">${m.question}</p>
      <div class="bg-slate-900 rounded-xl p-3 border border-slate-800 space-y-1.5 text-xs">
        <div class="text-emerald-300 font-bold flex items-center gap-1.5 text-xs">
          <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true"></i>
          <span>Correct Insight: <strong>${m.correct_answer || m.options?.[m.correct_index] || ""}</strong></span>
        </div>
        <div class="text-slate-300 font-serif text-xs leading-relaxed pl-5 border-l-2 border-emerald-500/40">
          ${m.explanation || "Review the video explanation at this exact timestamp."}
        </div>
      </div>
    `;

    card.querySelector(".review-missed-btn").addEventListener("click", () => {
      jumpToTime(m.review_timestamp_sec, false);
      switchTab("tab-content-rescue");
    });

    container.appendChild(card);
  });

  lucide.createIcons();
}

// ==========================================
// 7. TAB NAVIGATION & MODALS
// ==========================================

function switchTab(tabPaneId) {
  state.activeTab = tabPaneId;

  document.querySelectorAll(".tab-btn").forEach(btn => {
    const isTarget = btn.getAttribute("data-target") === tabPaneId;
    if (isTarget) {
      btn.classList.add("active", "text-indigo-300", "bg-slate-800", "border-indigo-500/40");
      btn.classList.remove("text-slate-300", "border-transparent");
      btn.setAttribute("aria-selected", "true");
      btn.setAttribute("tabindex", "0");
    } else {
      btn.classList.remove("active", "text-indigo-300", "bg-slate-800", "border-indigo-500/40");
      btn.classList.add("text-slate-300", "border-transparent");
      btn.setAttribute("aria-selected", "false");
      btn.setAttribute("tabindex", "-1");
    }
  });

  document.querySelectorAll(".tab-pane").forEach(pane => {
    if (pane.id === tabPaneId) {
      pane.classList.remove("hidden");
      pane.removeAttribute("aria-hidden");
    } else {
      pane.classList.add("hidden");
      pane.setAttribute("aria-hidden", "true");
    }
  });
}

function isValidYouTubeUrl(input) {
  const clean = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) return true;
  const ytRegex = /^(https?:\/\/)?(www\.|m\.)?(youtube\.com\/(watch\?v=|embed\/|v\/|live\/|shorts\/)|youtu\.be\/)[a-zA-Z0-9_-]{11}/i;
  return ytRegex.test(clean);
}

function initUIEventListeners() {
  initTimelineInteractions();

  // Tab Header Click Events
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-target");
      switchTab(target);
    });
  });

  // Action Bar Button 1: Explain This Part Simply
  const confusedBtn = document.getElementById("btn-confused-rescue");
  if (confusedBtn) {
    confusedBtn.addEventListener("click", () => {
      fetchSegmentAnalysis(state.currentTimeSec, null, true);
      fetchSegmentQuiz(state.currentTimeSec);
      switchTab("tab-content-rescue");
    });
  }

  // Advanced Settings Popover Button & Window Adjustments
  const advSettingsBtn = document.getElementById("btn-advanced-settings");
  const advSettingsPopover = document.getElementById("advanced-settings-popover");
  const closeAdvSettingsBtn = document.getElementById("close-advanced-settings-btn");

  if (advSettingsBtn && advSettingsPopover) {
    advSettingsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isHidden = advSettingsPopover.classList.toggle("hidden");
      advSettingsBtn.setAttribute("aria-expanded", String(!isHidden));
    });

    if (closeAdvSettingsBtn) {
      closeAdvSettingsBtn.addEventListener("click", () => {
        advSettingsPopover.classList.add("hidden");
        advSettingsBtn.setAttribute("aria-expanded", "false");
      });
    }

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (!advSettingsPopover.contains(e.target) && e.target !== advSettingsBtn) {
        advSettingsPopover.classList.add("hidden");
        advSettingsBtn.setAttribute("aria-expanded", "false");
      }
    });

    // Window size buttons
    document.querySelectorAll(".window-size-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".window-size-btn").forEach(b => {
          b.className = "window-size-btn text-[11px] font-mono py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer";
        });
        btn.className = "window-size-btn active text-[11px] font-mono py-1.5 rounded-lg border border-indigo-500 bg-indigo-600/30 text-indigo-200 font-bold transition-colors cursor-pointer";
        state.analysisWindowSeconds = parseInt(btn.getAttribute("data-window")) || 240;
      });
    });
  }

  // Auto-pause Toggle Switch
  const toggleAutopause = document.getElementById("toggle-autopause");
  if (toggleAutopause) {
    toggleAutopause.checked = state.autoPauseEnabled;
    toggleAutopause.addEventListener("change", (e) => {
      state.autoPauseEnabled = e.target.checked;
    });
  }

  const dismissToastBtn = document.getElementById("dismiss-autopause-toast-btn");
  if (dismissToastBtn) {
    dismissToastBtn.addEventListener("click", () => {
      const toast = document.getElementById("autopause-toast");
      if (toast) toast.classList.add("hidden");
    });
  }

  // Action Bar Button 2: Save Timestamp Note
  const dropPinBtn = document.getElementById("btn-drop-pin");
  if (dropPinBtn) {
    dropPinBtn.addEventListener("click", () => {
      openPinModal();
    });
  }

  // Global Keyboard Shortcuts (Alt + E and Alt + S)
  window.addEventListener("keydown", (e) => {
    // Check if Alt + E is pressed
    if (e.altKey && (e.key === "e" || e.key === "E")) {
      e.preventDefault();
      const primaryBtn = document.getElementById("btn-confused-rescue");
      if (primaryBtn) primaryBtn.click();
    }
    // Check if Alt + S is pressed
    else if (e.altKey && (e.key === "s" || e.key === "S")) {
      e.preventDefault();
      const noteBtn = document.getElementById("btn-drop-pin");
      if (noteBtn) noteBtn.click();
    }
  });

  // Player Controls
  const playBtn = document.getElementById("ctrl-play-pause");
  if (playBtn) {
    playBtn.addEventListener("click", () => {
      if (!state.isPlayerReady || !state.player) return;
      const pState = state.player.getPlayerState();
      if (pState === YT.PlayerState.PLAYING) {
        state.player.pauseVideo();
      } else {
        state.player.playVideo();
      }
    });
  }

  const rewindBtn = document.getElementById("ctrl-rewind");
  if (rewindBtn) {
    rewindBtn.addEventListener("click", () => {
      jumpToTime(Math.max(0, state.currentTimeSec - 10), false);
    });
  }

  const forwardBtn = document.getElementById("ctrl-forward");
  if (forwardBtn) {
    forwardBtn.addEventListener("click", () => {
      jumpToTime(Math.min(state.durationSec, state.currentTimeSec + 10), false);
    });
  }

  const speedSelect = document.getElementById("playback-speed-select");
  if (speedSelect) {
    speedSelect.addEventListener("change", (e) => {
      if (state.isPlayerReady && state.player) {
        state.player.setPlaybackRate(parseFloat(e.target.value));
      }
    });
  }

  // Load YouTube URL Input with Frontend Validation
  const loadBtn = document.getElementById("load-video-btn");
  const urlInput = document.getElementById("youtube-url-input");
  const urlError = document.getElementById("youtube-url-error");

  if (loadBtn && urlInput) {
    const handleLoad = async () => {
      const val = urlInput.value.trim();
      if (!val) return;

      // Validate URL before sending
      if (!isValidYouTubeUrl(val)) {
        if (urlError) urlError.classList.remove("hidden");
        urlInput.classList.add("border-rose-500", "ring-1", "ring-rose-500");
        return;
      }

      // Valid URL
      if (urlError) urlError.classList.add("hidden");
      urlInput.classList.remove("border-rose-500", "ring-1", "ring-rose-500");

      loadBtn.disabled = true;
      loadBtn.innerHTML = `<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin" aria-hidden="true"></i><span>Finding Heatmap...</span>`;
      lucide.createIcons();

      try {
        const res = await fetch("/api/videos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url_or_id: val,
            folder_id: state.currentFolderId
          })
        });
        const data = await res.json();
        if (data.video) {
          await loadVideoStudio(data.video.video_id);
        }
      } catch (err) {
        alert("Failed to load YouTube video: " + err);
      } finally {
        loadBtn.disabled = false;
        loadBtn.innerHTML = `<i data-lucide="play" class="w-3.5 h-3.5 fill-current" aria-hidden="true"></i><span>Load Video</span>`;
        lucide.createIcons();
      }
    };

    loadBtn.addEventListener("click", handleLoad);
    urlInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleLoad();
    });

    // Clear error on input
    urlInput.addEventListener("input", () => {
      if (urlError) urlError.classList.add("hidden");
      urlInput.classList.remove("border-rose-500", "ring-1", "ring-rose-500");
    });
  }

  // AI Tutor Followup Button
  const askAiBtn = document.getElementById("ai-ask-btn");
  const aiInput = document.getElementById("ai-question-input");
  if (askAiBtn) askAiBtn.addEventListener("click", handleAskFollowup);
  if (aiInput) {
    aiInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleAskFollowup();
    });
  }

  // Reset Quiz Button
  const resetQuizBtn = document.getElementById("reset-quiz-btn");
  if (resetQuizBtn) {
    resetQuizBtn.addEventListener("click", () => {
      if (state.activeAnalysis) {
        if (state.activeAnalysis.visual_diagram) renderVisualDiagram(state.activeAnalysis.visual_diagram);
        if (state.activeAnalysis.checkpoint_mcqs) renderCheckpointMCQs(state.activeAnalysis.checkpoint_mcqs);
      } else if (state.activeQuiz) {
        renderVisualDiagram(state.activeQuiz);
      }
    });
  }

  // Saved Notes Filter Pills
  document.querySelectorAll(".pin-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".pin-filter-btn").forEach(b => {
        b.classList.remove("active", "bg-indigo-600", "text-white");
        b.classList.add("bg-slate-800", "text-slate-300");
      });
      btn.classList.add("active", "bg-indigo-600", "text-white");
      btn.classList.remove("bg-slate-800", "text-slate-300");
      state.activeFilter = btn.getAttribute("data-filter");
      renderCheatSheetPins();
    });
  });

  // Modal Event Listeners
  initModalListeners();

  // Landing Page Overlay Listeners
  initLandingPageListeners();
}

// ------------------------------------------
// Full-Screen Landing Page Interactions
// ------------------------------------------
function initLandingPageListeners() {
  const landingView = document.getElementById("landing-page-view");
  const landingForm = document.getElementById("landing-url-form");
  const landingInput = document.getElementById("landing-url-input");
  const landingError = document.getElementById("landing-url-error");
  const landingBtn = document.getElementById("landing-submit-btn");
  const backHomeBtn = document.getElementById("back-to-landing-btn");
  const navbarInput = document.getElementById("youtube-url-input");
  const navbarLoadBtn = document.getElementById("load-video-btn");

  if (!landingView) return;

  // Clear validation error when user types
  if (landingInput && landingError) {
    landingInput.addEventListener("input", () => {
      landingError.classList.add("hidden");
      landingInput.classList.remove("border-rose-500", "ring-1", "ring-rose-500");
    });
  }

  // Handle Landing Form Submission
  if (landingForm) {
    landingForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!landingInput) return;

      const val = landingInput.value.trim();

      // Step A: Validate YouTube URL
      if (!val || !isValidYouTubeUrl(val)) {
        if (landingError) landingError.classList.remove("hidden");
        landingInput.classList.add("border-rose-500", "ring-1", "ring-rose-500");
        landingInput.focus();
        return;
      }

      if (landingError) landingError.classList.add("hidden");
      landingInput.classList.remove("border-rose-500", "ring-1", "ring-rose-500");

      // Step B: Change button text to Loading Workspace...
      if (landingBtn) {
        landingBtn.disabled = true;
        landingBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin" aria-hidden="true"></i><span>Loading Workspace...</span>`;
        lucide.createIcons();
      }

      // Step C: Copy value directly to existing top navbar input
      if (navbarInput) {
        navbarInput.value = val;
      }

      // Step D: Smoothly hide landing page overlay
      landingView.classList.add("opacity-0", "pointer-events-none");
      setTimeout(() => {
        landingView.classList.add("hidden");
        if (landingBtn) {
          landingBtn.disabled = false;
          landingBtn.innerHTML = `<span>Start Studying This Video &rarr;</span>`;
          lucide.createIcons();
        }
      }, 300);

      // Trigger the existing navbar "Load" button handler to enter the study studio
      if (navbarLoadBtn) {
        navbarLoadBtn.click();
      }
    });
  }

  // Step 3: Handle "← Home" Button in Existing Top Navbar
  if (backHomeBtn) {
    backHomeBtn.addEventListener("click", () => {
      // Pause YouTube player if active
      if (state.player && typeof state.player.pauseVideo === "function") {
        try {
          state.player.pauseVideo();
        } catch (_) {}
      }

      // Show landing page overlay again
      landingView.classList.remove("hidden");
      requestAnimationFrame(() => {
        landingView.classList.remove("opacity-0", "pointer-events-none");
      });

      if (landingInput) {
        landingInput.focus();
      }
    });
  }
}

// Modal Setup & Listeners
function initModalListeners() {
  // Pin Modal
  const pinModal = document.getElementById("pin-modal");
  const closePinBtn = document.getElementById("close-pin-modal-btn");
  const cancelPinBtn = document.getElementById("cancel-pin-btn");
  const savePinBtn = document.getElementById("save-pin-btn");

  if (closePinBtn) closePinBtn.addEventListener("click", () => pinModal.classList.add("hidden"));
  if (cancelPinBtn) cancelPinBtn.addEventListener("click", () => pinModal.classList.add("hidden"));

  if (savePinBtn) {
    savePinBtn.addEventListener("click", async () => {
      const title = document.getElementById("pin-title-input").value.trim();
      const note = document.getElementById("pin-note-input").value.trim();
      const tag = document.querySelector('input[name="pin-tag"]:checked')?.value || "exam_priority";

      if (!title) {
        alert("Please enter a title for the note.");
        return;
      }

      const newPin = {
        video_id: state.currentVideoId,
        timestamp_sec: state.currentTimeSec,
        tag: tag,
        title: title,
        note: note
      };

      const savedPin = StorageManager.savePin(newPin);
      state.pins.push(savedPin);
      state.pins.sort((a, b) => a.timestamp_sec - b.timestamp_sec);
      renderTimelinePins();
      renderCheatSheetPins();
      pinModal.classList.add("hidden");

      try {
        await fetch("/api/pins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newPin)
        });
      } catch (err) {
        console.debug("Backend pin save notice:", err);
      }
    });
  }

  // Folder Select & Modal
  const folderSelect = document.getElementById("folder-select");
  const folderModal = document.getElementById("folder-modal");
  const closeFolderBtn = document.getElementById("close-folder-modal-btn");
  const cancelFolderBtn = document.getElementById("cancel-folder-btn");
  const saveFolderBtn = document.getElementById("save-folder-btn");

  if (folderSelect) {
    folderSelect.addEventListener("change", (e) => {
      if (e.target.value === "add_new") {
        folderModal.classList.remove("hidden");
      } else {
        state.currentFolderId = parseInt(e.target.value);
      }
    });
  }

  if (closeFolderBtn) closeFolderBtn.addEventListener("click", () => folderModal.classList.add("hidden"));
  if (cancelFolderBtn) cancelFolderBtn.addEventListener("click", () => folderModal.classList.add("hidden"));

  if (saveFolderBtn) {
    saveFolderBtn.addEventListener("click", async () => {
      const name = document.getElementById("new-folder-name").value.trim();
      const color = document.getElementById("new-folder-color").value;
      if (!name) return;

      const createdFolder = StorageManager.saveFolder({ name, color, icon: "folder" });
      folderModal.classList.add("hidden");
      await loadSubjectFolders();
      if (folderSelect) folderSelect.value = createdFolder.id;
      state.currentFolderId = createdFolder.id;

      try {
        await fetch("/api/folders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, color })
        });
      } catch (err) {
        console.debug("Backend folder save notice:", err);
      }
    });
  }

  // Folder Videos Explorer Drawer & Modal
  const openFolderDrawerBtn = document.getElementById("btn-open-folder-drawer");
  const folderVideosModal = document.getElementById("folder-videos-modal");
  const closeFolderVideosBtn = document.getElementById("close-folder-videos-modal-btn");
  const closeFolderVideosBottomBtn = document.getElementById("btn-close-folder-videos-bottom");

  if (openFolderDrawerBtn) {
    openFolderDrawerBtn.addEventListener("click", () => {
      openFolderVideosModal(state.currentFolderId || 1);
    });
  }

  if (closeFolderVideosBtn && folderVideosModal) {
    closeFolderVideosBtn.addEventListener("click", () => folderVideosModal.classList.add("hidden"));
  }
  if (closeFolderVideosBottomBtn && folderVideosModal) {
    closeFolderVideosBottomBtn.addEventListener("click", () => folderVideosModal.classList.add("hidden"));
  }
  if (folderVideosModal) {
    folderVideosModal.addEventListener("click", (e) => {
      if (e.target === folderVideosModal) folderVideosModal.classList.add("hidden");
    });
  }

  // Export Saved Notes Modal Handlers
  const exportBtn = document.getElementById("export-cheatsheet-btn");
  const exportModal = document.getElementById("export-modal");
  const closeExportBtn = document.getElementById("close-export-modal-btn");
  const copyMdBtn = document.getElementById("copy-markdown-btn");
  const printSheetBtn = document.getElementById("print-sheet-btn");
  const downloadMdBtn = document.getElementById("download-markdown-btn");
  const exportTabView = document.getElementById("export-tab-view");
  const exportTabRaw = document.getElementById("export-tab-raw");
  const exportVisualPreview = document.getElementById("export-visual-preview");
  const exportMarkdownContent = document.getElementById("export-markdown-content");

  if (exportBtn && exportModal) {
    exportBtn.addEventListener("click", () => {
      renderVisualCheatSheetPreview();
      if (exportMarkdownContent) {
        exportMarkdownContent.value = generateMarkdownCheatSheet();
      }
      exportModal.classList.remove("hidden");
    });
  }

  if (closeExportBtn) closeExportBtn.addEventListener("click", () => exportModal.classList.add("hidden"));

  // View vs Raw Markdown switcher
  if (exportTabView && exportTabRaw && exportVisualPreview && exportMarkdownContent) {
    exportTabView.addEventListener("click", () => {
      exportTabView.className = "px-3.5 py-1.5 rounded-lg font-bold bg-indigo-600 text-white transition-all cursor-pointer";
      exportTabRaw.className = "px-3.5 py-1.5 rounded-lg font-medium text-slate-300 hover:text-white transition-all cursor-pointer";
      exportVisualPreview.classList.remove("hidden");
      exportMarkdownContent.classList.add("hidden");
    });

    exportTabRaw.addEventListener("click", () => {
      exportTabRaw.className = "px-3.5 py-1.5 rounded-lg font-bold bg-indigo-600 text-white transition-all cursor-pointer";
      exportTabView.className = "px-3.5 py-1.5 rounded-lg font-medium text-slate-300 hover:text-white transition-all cursor-pointer";
      exportMarkdownContent.classList.remove("hidden");
      exportVisualPreview.classList.add("hidden");
    });
  }

  // Copy Markdown to Clipboard
  if (copyMdBtn) {
    copyMdBtn.addEventListener("click", () => {
      const content = generateMarkdownCheatSheet();
      navigator.clipboard.writeText(content);
      copyMdBtn.innerHTML = `<i data-lucide="check" class="w-4 h-4 text-emerald-300" aria-hidden="true"></i> Copied!`;
      lucide.createIcons();
      setTimeout(() => {
        copyMdBtn.innerHTML = `<i data-lucide="copy" class="w-4 h-4" aria-hidden="true"></i> Copy to Clipboard`;
        lucide.createIcons();
      }, 2200);
    });
  }

  // Download .md File
  if (downloadMdBtn) {
    downloadMdBtn.addEventListener("click", downloadMarkdownFile);
  }

  // Print Friendly
  if (printSheetBtn) {
    printSheetBtn.addEventListener("click", () => {
      window.print();
    });
  }

  // Alternative Video Preview Modal
  const closeAltBtn = document.getElementById("close-alt-modal-btn");
  const altModal = document.getElementById("alt-video-modal");
  if (closeAltBtn) closeAltBtn.addEventListener("click", closeAltVideoModal);
  if (altModal) {
    altModal.addEventListener("click", (e) => {
      if (e.target === altModal) closeAltVideoModal();
    });
  }
}

function openPinModal() {
  const pinModal = document.getElementById("pin-modal");
  const pinTimeInput = document.getElementById("pin-time-input");
  const titleInput = document.getElementById("pin-title-input");
  const noteInput = document.getElementById("pin-note-input");

  if (pinTimeInput) pinTimeInput.value = formatTime(state.currentTimeSec);
  if (titleInput) titleInput.value = "";
  if (noteInput) noteInput.value = "";

  if (pinModal) pinModal.classList.remove("hidden");
}

async function loadSubjectFolders() {
  const select = document.getElementById("folder-select");

  // 1. Instantaneous populate from StorageManager
  state.folders = StorageManager.getFolders();
  renderFoldersUI(select, state.folders);

  // 2. Concurrently fetch and sync with backend
  try {
    const res = await fetch("/api/folders");
    if (res.ok) {
      const data = await res.json();
      if (data.folders && data.folders.length > 0) {
        state.folders = data.folders;
        StorageManager.set("folders", data.folders);
        renderFoldersUI(select, data.folders);
      }
    }
  } catch (err) {
    console.debug("Backend folders sync notice (fallback active):", err);
  }
}

function renderFoldersUI(select, folders) {
  if (select) {
    select.innerHTML = "";
    folders.forEach(f => {
      const opt = document.createElement("option");
      opt.value = f.id;
      opt.textContent = `${f.name} (${f.video_count || 0} vids)`;
      opt.className = "bg-slate-900 text-slate-100 font-medium py-1";
      select.appendChild(opt);
    });
    const addNewOpt = document.createElement("option");
    addNewOpt.value = "add_new";
    addNewOpt.textContent = "+ Add To Personal Library";
    addNewOpt.className = "bg-slate-900 text-indigo-400 font-semibold py-1";
    select.appendChild(addNewOpt);

    if (state.currentFolderId) {
      select.value = state.currentFolderId;
    }
  }
  renderLandingFolders(folders);
}

// ------------------------------------------
// Video Card HTML Generator
// ------------------------------------------
function createVideoCardHtml(v, isActiveVideo = false, isLanding = false) {
  const thumb = v.thumbnail_url || `https://img.youtube.com/vi/${v.video_id}/mqdefault.jpg`;
  const durStr = formatTime(v.duration_sec || 2700);

  if (isLanding) {
    return `
      <div class="landing-video-card group bg-slate-900/90 border border-slate-800 hover:border-indigo-500/70 rounded-2xl p-3.5 transition-all flex flex-col justify-between cursor-pointer shadow-lg shadow-black/40 hover:-translate-y-1 hover:shadow-indigo-500/10" data-video-id="${v.video_id}">
        <div class="space-y-2.5">
          <div class="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
            <img src="${thumb}" alt="${v.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.src='https://img.youtube.com/vi/${v.video_id}/hqdefault.jpg'" />
            <span class="absolute bottom-1.5 right-1.5 bg-slate-950/85 backdrop-blur-md text-[10px] font-mono px-2 py-0.5 rounded-md text-slate-200 font-semibold border border-slate-800">
              ${durStr}
            </span>
          </div>
          <h3 class="text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2 leading-relaxed">
            ${v.title}
          </h3>
        </div>
        <div class="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between">
          <span class="text-[10px] font-mono text-slate-400">ID: ${v.video_id}</span>
          <button class="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm transition-all pointer-events-none">
            <i data-lucide="play" class="w-3 h-3 fill-current" aria-hidden="true"></i>
            <span>Study Video</span>
          </button>
        </div>
      </div>
    `;
  }

  // Inside Main Page Modal
  return `
    <div class="folder-modal-video-card group flex items-center justify-between p-3 rounded-xl border ${isActiveVideo ? 'bg-indigo-950/50 border-indigo-500/60 shadow-md shadow-indigo-500/10' : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'} transition-all cursor-pointer" data-video-id="${v.video_id}">
      <div class="flex items-center space-x-3 overflow-hidden">
        <div class="relative w-28 aspect-video rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-800">
          <img src="${thumb}" alt="${v.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" onerror="this.src='https://img.youtube.com/vi/${v.video_id}/hqdefault.jpg'" />
          <span class="absolute bottom-1 right-1 bg-slate-950/90 font-mono text-[9px] px-1.5 py-0.5 rounded text-slate-300 font-semibold">${durStr}</span>
        </div>
        <div class="min-w-0 pr-3">
          <h4 class="text-xs font-bold ${isActiveVideo ? 'text-indigo-200' : 'text-slate-100 group-hover:text-indigo-300'} truncate transition-colors">
            ${v.title}
          </h4>
          <p class="text-[11px] text-slate-400 font-mono mt-1">ID: ${v.video_id}</p>
        </div>
      </div>
      <div class="shrink-0 pl-2">
        ${isActiveVideo ? `
          <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Active Now
          </span>
        ` : `
          <button class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 shadow-sm">
            <i data-lucide="play" class="w-3 h-3 fill-current" aria-hidden="true"></i>
            <span>Load Video</span>
          </button>
        `}
      </div>
    </div>
  `;
}

// ------------------------------------------
// Landing Page Folder Pills & Video Cards
// ------------------------------------------
function renderLandingFolders(folders) {
  const pillsContainer = document.getElementById("landing-folder-pills");
  if (!pillsContainer || !folders || folders.length === 0) return;

  pillsContainer.innerHTML = "";
  let activeId = state.currentFolderId || folders[0].id;

  folders.forEach(f => {
    const btn = document.createElement("button");
    const isActive = f.id === activeId;
    btn.type = "button";
    btn.className = `px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
      isActive 
        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/40 font-bold" 
        : "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
    }`;
    btn.innerHTML = `
      <i data-lucide="folder" class="w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-indigo-400'}" aria-hidden="true"></i>
      <span>${f.name}</span>
      <span class="px-1.5 py-0.2 rounded-full text-[10px] font-mono ${isActive ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-800 text-slate-400'}">${f.video_count || 0}</span>
    `;

    btn.addEventListener("click", () => {
      document.querySelectorAll("#landing-folder-pills button").forEach(b => {
        b.className = "px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800";
        const icon = b.querySelector("i");
        if (icon) icon.className = "w-3.5 h-3.5 text-indigo-400";
      });
      btn.className = "px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/40 font-bold";
      const activeIcon = btn.querySelector("i");
      if (activeIcon) activeIcon.className = "w-3.5 h-3.5 text-white";

      state.currentFolderId = f.id;
      loadLandingFolderVideos(f.id);
    });

    pillsContainer.appendChild(btn);
  });

  lucide.createIcons();
  loadLandingFolderVideos(activeId);
}

async function loadLandingFolderVideos(folderId) {
  const grid = document.getElementById("landing-folder-videos-grid");
  if (!grid) return;

  grid.innerHTML = `
    <div class="col-span-full py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
      <i data-lucide="loader-2" class="w-4 h-4 animate-spin text-indigo-400" aria-hidden="true"></i>
      <span>Loading saved lectures in this folder...</span>
    </div>
  `;
  lucide.createIcons();

  try {
    const res = await fetch(`/api/videos?folder_id=${folderId}`);
    const data = await res.json();
    let videos = data.videos || [];
    if (videos.length === 0) {
      videos = StorageManager.getVideos().filter(v => v.folder_id === folderId);
    }

    if (videos.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-8 text-center text-xs text-slate-400 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl space-y-2 p-6">
          <i data-lucide="folder-open" class="w-7 h-7 text-slate-600 mx-auto" aria-hidden="true"></i>
          <p class="font-medium text-slate-300">No lectures saved in this folder yet.</p>
          <p class="text-[11px] text-slate-400">Paste any YouTube lecture URL above to add a video into this folder!</p>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    grid.innerHTML = "";
    videos.forEach(v => {
      const cardWrapper = document.createElement("div");
      cardWrapper.innerHTML = createVideoCardHtml(v, v.video_id === state.currentVideoId, true);
      const card = cardWrapper.firstElementChild;

      card.addEventListener("click", async () => {
        const landingView = document.getElementById("landing-page-view");
        if (landingView) {
          landingView.classList.add("opacity-0", "pointer-events-none");
          setTimeout(() => landingView.classList.add("hidden"), 300);
        }
        state.currentFolderId = folderId;
        const folderSelect = document.getElementById("folder-select");
        if (folderSelect) folderSelect.value = folderId;
        await loadVideoStudio(v.video_id);
      });

      grid.appendChild(card);
    });

    lucide.createIcons();
  } catch (err) {
    console.debug("Landing folder videos backend notice (using StorageManager):", err);
    const videos = StorageManager.getVideos().filter(v => v.folder_id === folderId);
    if (videos.length > 0) {
      grid.innerHTML = "";
      videos.forEach(v => {
        const cardWrapper = document.createElement("div");
        cardWrapper.innerHTML = createVideoCardHtml(v, v.video_id === state.currentVideoId, true);
        const card = cardWrapper.firstElementChild;
        card.addEventListener("click", async () => {
          const landingView = document.getElementById("landing-page-view");
          if (landingView) {
            landingView.classList.add("opacity-0", "pointer-events-none");
            setTimeout(() => landingView.classList.add("hidden"), 300);
          }
          state.currentFolderId = folderId;
          const folderSelect = document.getElementById("folder-select");
          if (folderSelect) folderSelect.value = folderId;
          await loadVideoStudio(v.video_id);
        });
        grid.appendChild(card);
      });
      lucide.createIcons();
    } else {
      grid.innerHTML = `<div class="col-span-full py-4 text-xs text-rose-400">Failed to load lectures.</div>`;
    }
  }
}

// ------------------------------------------
// Main Studio Folder Videos Modal Explorer
// ------------------------------------------
async function openFolderVideosModal(targetFolderId) {
  const modal = document.getElementById("folder-videos-modal");
  const titleEl = document.getElementById("folder-videos-modal-title");
  const countEl = document.getElementById("folder-videos-modal-subtitle");
  const tabsContainer = document.getElementById("modal-folder-tabs");
  const listContainer = document.getElementById("folder-videos-list");

  if (!modal || !listContainer) return;

  const currentId = targetFolderId || state.currentFolderId || 1;
  state.currentFolderId = currentId;

  const currentFolder = (state.folders || []).find(f => f.id === currentId);
  if (titleEl) titleEl.textContent = currentFolder ? currentFolder.name : "Study Folder Lectures";

  // Render Folder Tabs inside Modal
  if (tabsContainer && state.folders) {
    tabsContainer.innerHTML = "";
    state.folders.forEach(f => {
      const tabBtn = document.createElement("button");
      const isSel = f.id === currentId;
      tabBtn.type = "button";
      tabBtn.className = `px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
        isSel 
          ? "bg-indigo-600 text-white font-bold shadow-sm" 
          : "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
      }`;
      tabBtn.innerHTML = `<span>${f.name}</span><span class="text-[10px] opacity-75 font-mono">(${f.video_count || 0})</span>`;
      tabBtn.addEventListener("click", () => {
        openFolderVideosModal(f.id);
        const folderSelect = document.getElementById("folder-select");
        if (folderSelect) folderSelect.value = f.id;
      });
      tabsContainer.appendChild(tabBtn);
    });
  }

  // Load videos for this folder
  listContainer.innerHTML = `
    <div class="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
      <i data-lucide="loader-2" class="w-4 h-4 animate-spin text-indigo-400" aria-hidden="true"></i>
      <span>Loading folder lectures...</span>
    </div>
  `;
  lucide.createIcons();
  modal.classList.remove("hidden");

  try {
    const res = await fetch(`/api/videos?folder_id=${currentId}`);
    const data = await res.json();
    let videos = data.videos || [];
    if (videos.length === 0) {
      videos = StorageManager.getVideos().filter(v => v.folder_id === currentId);
    }

    if (countEl) countEl.textContent = `${videos.length} lecture${videos.length === 1 ? '' : 's'} saved in this folder`;

    if (videos.length === 0) {
      listContainer.innerHTML = `
        <div class="py-12 text-center text-xs text-slate-400 bg-slate-950/40 border border-dashed border-slate-800 rounded-xl space-y-2 p-6">
          <i data-lucide="folder-open" class="w-8 h-8 text-slate-600 mx-auto" aria-hidden="true"></i>
          <p class="font-medium text-slate-300">No lectures saved in this folder yet.</p>
          <p class="text-[11px] text-slate-400">Use the top URL bar to paste any educational YouTube lecture and save it here!</p>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    listContainer.innerHTML = "";
    videos.forEach(v => {
      const cardWrapper = document.createElement("div");
      cardWrapper.innerHTML = createVideoCardHtml(v, v.video_id === state.currentVideoId, false);
      const card = cardWrapper.firstElementChild;

      card.addEventListener("click", async () => {
        modal.classList.add("hidden");
        const folderSelect = document.getElementById("folder-select");
        if (folderSelect) folderSelect.value = currentId;
        await loadVideoStudio(v.video_id);
      });

      listContainer.appendChild(card);
    });

    lucide.createIcons();
  } catch (err) {
    console.debug("Folder videos backend notice (using StorageManager):", err);
    const videos = StorageManager.getVideos().filter(v => v.folder_id === currentId);
    if (countEl) countEl.textContent = `${videos.length} lecture${videos.length === 1 ? '' : 's'} saved in this folder`;
    if (videos.length > 0) {
      listContainer.innerHTML = "";
      videos.forEach(v => {
        const cardWrapper = document.createElement("div");
        cardWrapper.innerHTML = createVideoCardHtml(v, v.video_id === state.currentVideoId, false);
        const card = cardWrapper.firstElementChild;
        card.addEventListener("click", async () => {
          modal.classList.add("hidden");
          const folderSelect = document.getElementById("folder-select");
          if (folderSelect) folderSelect.value = currentId;
          await loadVideoStudio(v.video_id);
        });
        listContainer.appendChild(card);
      });
      lucide.createIcons();
    } else {
      listContainer.innerHTML = `<div class="py-4 text-xs text-rose-400">No lectures found in this folder.</div>`;
    }
  }
}

// Render Rich Visual Preview in Export Modal
function renderVisualCheatSheetPreview() {
  const container = document.getElementById("export-visual-preview");
  if (!container) return;

  const lectureTitle = document.getElementById("video-title")?.textContent || "Lecture Study Studio";
  const dateStr = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

  let html = `
    <div class="border-b border-slate-800 pb-3">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-bold text-white">${lectureTitle}</h3>
        <span class="text-[10px] font-mono text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 px-2.5 py-0.5 rounded font-bold">SyncLearn Study Studio</span>
      </div>
      <p class="text-[11px] text-slate-300 mt-1">Generated: ${dateStr} • Duration: ${formatTime(state.durationSec)} • Video ID: ${state.currentVideoId}</p>
    </div>

    <!-- Section 1: Study Pins & Formulas -->
    <div class="space-y-2">
      <h4 class="text-xs font-bold text-amber-300 flex items-center gap-1.5">
        <i data-lucide="bookmark" class="w-4 h-4 text-amber-400" aria-hidden="true"></i> Saved Timestamp Notes & Formulas (${state.pins.length})
      </h4>
      <div class="space-y-2">
  `;

  if (state.pins.length === 0) {
    html += `<p class="text-[11px] text-slate-400 italic">No saved notes yet.</p>`;
  } else {
    state.pins.forEach((p, i) => {
      let tagBadge = "★ Exam Important";
      let tagColor = "border-rose-500/40 text-rose-300 bg-rose-500/15";
      if (p.tag === "revisit") {
        tagBadge = "? Needs Review";
        tagColor = "border-amber-500/40 text-amber-300 bg-amber-500/15";
      } else if (p.tag === "key_formula") {
        tagBadge = "∑ Key Formula";
        tagColor = "border-cyan-500/40 text-cyan-300 bg-cyan-500/15";
      }

      html += `
        <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-slate-100">[${formatTime(p.timestamp_sec)}] ${p.title}</span>
            <span class="text-[10px] px-2 py-0.2 rounded border font-mono font-bold ${tagColor}">${tagBadge}</span>
          </div>
          ${p.note ? `<p class="text-xs text-slate-300 font-serif leading-relaxed">${p.note.replace(/\n/g, '<br/>')}</p>` : ""}
        </div>
      `;
    });
  }

  html += `
      </div>
    </div>

    <!-- Section 2: Terminology Comparison Matrix -->
    <div class="space-y-2">
      <h4 class="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
        <i data-lucide="git-compare" class="w-4 h-4 text-emerald-400" aria-hidden="true"></i> Term Comparison Matrix (${state.sessionTerminologyBridges.length})
      </h4>
  `;

  if (state.sessionTerminologyBridges.length === 0) {
    html += `<p class="text-[11px] text-slate-400 italic">No term comparisons accumulated yet.</p>`;
  } else {
    html += `
      <table class="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
        <thead class="bg-slate-900 text-slate-300 text-[10px] uppercase font-mono">
          <tr>
            <th class="p-2.5 border-b border-slate-800 font-bold">Lecture Term / Symbol</th>
            <th class="p-2.5 border-b border-slate-800 font-bold">What Other Videos Call It</th>
            <th class="p-2.5 border-b border-slate-800 font-bold">How They Connect</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800 text-slate-200">
    `;
    state.sessionTerminologyBridges.forEach(b => {
      html += `
        <tr>
          <td class="p-2.5 border-b border-slate-800 font-mono text-indigo-300 font-bold">${b.prof_term}</td>
          <td class="p-2.5 border-b border-slate-800 font-mono text-cyan-300">${b.alt_video_term}</td>
          <td class="p-2.5 border-b border-slate-800 font-serif">${b.clarification}</td>
        </tr>
      `;
    });
    html += `
        </tbody>
      </table>
    `;
  }

  html += `
    </div>

    <!-- Section 3: Targeted Revision: Missed Checkpoints -->
    <div class="space-y-2">
      <h4 class="text-xs font-bold text-rose-300 flex items-center gap-1.5">
        <i data-lucide="alert-circle" class="w-4 h-4 text-rose-400" aria-hidden="true"></i> Targeted Revision: Questions to Review (${state.missedQuizQuestions.length})
      </h4>
  `;

  if (state.missedQuizQuestions.length === 0) {
    html += `<p class="text-xs text-emerald-300 font-semibold">✓ No missed checkpoints! All practice questions were cleared successfully.</p>`;
  } else {
    state.missedQuizQuestions.forEach((m, idx) => {
      html += `
        <div class="p-3 rounded-xl bg-slate-900 border border-rose-900/40 space-y-1">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-slate-100">#${idx + 1}. ${m.question}</span>
            <span class="font-mono text-indigo-300 text-[10px] bg-indigo-950/60 px-2 py-0.5 rounded font-bold">Review @ ${formatTime(m.review_timestamp_sec)}</span>
          </div>
          <div class="text-xs text-emerald-300 font-bold">✓ Correct Answer: ${m.correct_answer || m.options?.[m.correct_index] || ""}</div>
          <p class="text-xs text-slate-300 font-serif">${m.explanation || ""}</p>
        </div>
      `;
    });
  }

  html += `</div>`;

  container.innerHTML = html;
  renderMathInElementSafe(container);
  lucide.createIcons();
}

// Generate Markdown for Cheat Sheet Export
function generateMarkdownCheatSheet() {
  const lectureTitle = document.getElementById("video-title")?.textContent || "Lecture Study Studio";
  const dateStr = new Date().toLocaleDateString();

  let md = `# SyncLearn Study Guide & Saved Notes\n\n`;
  md += `**Lecture:** ${lectureTitle}\n`;
  md += `**Video ID:** \`${state.currentVideoId}\`\n`;
  md += `**Date:** ${dateStr}\n`;
  md += `**Duration:** ${formatTime(state.durationSec)}\n\n`;
  md += `---\n\n`;

  md += `## 1. Saved Timestamp Notes & Formulas\n\n`;
  if (state.pins.length === 0) {
    md += `*No saved notes yet.*\n\n`;
  } else {
    state.pins.forEach((p, idx) => {
      let tagStr = "★ Exam Important";
      if (p.tag === "revisit") tagStr = "? Needs Review";
      if (p.tag === "key_formula") tagStr = "∑ Key Formula";

      md += `### ${idx + 1}. [${formatTime(p.timestamp_sec)}] ${p.title}\n`;
      md += `**Category:** ${tagStr}\n\n`;
      if (p.note) {
        md += `${p.note}\n\n`;
      }
      md += `---\n\n`;
    });
  }

  md += `## 2. Term Comparison Matrix (Lecture vs Other Videos)\n\n`;
  if (state.sessionTerminologyBridges.length === 0) {
    md += `*Standard nomenclature aligns with textbook conventions.*\n\n`;
  } else {
    md += `| Lecture Symbol / Term | What Other Videos Call It | How They Connect |\n`;
    md += `| :--- | :--- | :--- |\n`;
    state.sessionTerminologyBridges.forEach(b => {
      md += `| \`${b.prof_term}\` | **${b.alt_video_term}** | ${b.clarification} |\n`;
    });
    md += `\n---\n\n`;
  }

  md += `## 3. Targeted Revision: Checkpoint Questions to Review\n\n`;
  if (state.missedQuizQuestions.length === 0) {
    md += `*Zero missed checkpoints! All practice concepts were mastered successfully.*\n\n`;
  } else {
    state.missedQuizQuestions.forEach((m, idx) => {
      md += `### Review Question #${idx + 1} (Video Review Point: ${formatTime(m.review_timestamp_sec)})\n`;
      md += `**Question:** ${m.question}\n\n`;
      md += `**Correct Answer:** ${m.correct_answer || m.options?.[m.correct_index] || ""}\n\n`;
      md += `**Explanation:** ${m.explanation}\n\n`;
      md += `---\n\n`;
    });
  }

  return md;
}

// Download Markdown File
function downloadMarkdownFile() {
  const content = generateMarkdownCheatSheet();
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `SyncLearn-StudyGuide-${state.currentVideoId}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ==========================================
// 8. UTILITIES & MATH RENDERING
// ==========================================

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function formatMarkdownAndMath(text) {
  if (!text) return "";
  let formatted = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n\n/g, "<br/><br/>");
  return formatted;
}

function renderMathInElementSafe(element) {
  if (window.renderMathInElement && element) {
    try {
      renderMathInElement(element, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false }
        ],
        throwOnError: false
      });
    } catch (e) {
      console.warn("KaTeX render notice:", e);
    }
  }
}
