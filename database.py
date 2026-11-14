"""
database.py - SQLite Database Setup and Seed Data for SyncLearn
Part of SyncLearn (by Team ClaudeNSons)
"""

import sqlite3
import json
import logging
import os
import tempfile
from typing import Dict, List, Any, Optional

# 1. FIX VERCEL READ-ONLY FILESYSTEM CRASH
# If running on Vercel or Linux serverless, write to /tmp or use memory
if os.environ.get("VERCEL") or (os.name != "nt" and os.path.exists("/tmp")):
    DB_FILE = os.path.join("/tmp", "synclearn.db")
else:
    DB_FILE = "synclearn.db"

logger = logging.getLogger("synclearn.db")


def get_db_connection():
    try:
        conn = sqlite3.connect(DB_FILE, timeout=5.0)
        conn.row_factory = sqlite3.Row
        return conn
    except Exception as e:
        logger.warning(f"Database connect warning for {DB_FILE} ({e}). Falling back to in-memory SQLite.")
        conn = sqlite3.connect(":memory:")
        conn.row_factory = sqlite3.Row
        return conn


def init_db():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # 1. Folders table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS folders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            color TEXT DEFAULT 'indigo',
            icon TEXT DEFAULT 'folder',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)

        # 2. Videos table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS videos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            video_id TEXT NOT NULL UNIQUE,
            title TEXT NOT NULL,
            folder_id INTEGER,
            duration_sec INTEGER DEFAULT 2700,
            thumbnail_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (folder_id) REFERENCES folders (id)
        )
        """)

        # 3. Personal Study Pins table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS pins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            video_id TEXT NOT NULL,
            timestamp_sec REAL NOT NULL,
            tag TEXT NOT NULL,
            title TEXT NOT NULL,
            note TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)

        # 4. Segment Analyses table (AI Rescue & Alt Videos)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS analyses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            video_id TEXT NOT NULL,
            peak_id TEXT,
            start_sec REAL NOT NULL,
            end_sec REAL NOT NULL,
            title TEXT NOT NULL,
            concept_breakdown TEXT,
            difficulty_badge TEXT,
            difficulty_score INTEGER,
            difficulty_reason TEXT,
            context_locked_explanation TEXT,
            formula_latex TEXT,
            alt_videos TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)

        # 5. Visual Active Recall & Quizzes table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS quizzes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            video_id TEXT NOT NULL,
            peak_id TEXT,
            start_sec REAL NOT NULL,
            end_sec REAL NOT NULL,
            diagram_title TEXT,
            diagram_nodes TEXT,
            mcqs TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)

        conn.commit()
        conn.close()
        seed_demo_data()
    except Exception as e:
        logger.warning(f"init_db safe catch: {e}")


def seed_demo_data():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if folders already seeded
    cursor.execute("SELECT COUNT(*) as cnt FROM folders")
    if cursor.fetchone()["cnt"] > 0:
        conn.close()
        return

    logger.info("Pre-seeding SyncLearn database with rich default lecture data...")

    # 1. Pre-seed Subject Folders
    folders = [
        ("Engineering Chemistry: Polymers", "violet", "flask-conical"),
        ("Intro to Mechatronics", "cyan", "cpu"),
        ("Digital Electronics", "emerald", "binary")
    ]
    cursor.executemany("INSERT INTO folders (name, color, icon) VALUES (?, ?, ?)", folders)

    # 2. Pre-seed Default Video
    default_vid = "fnF67w6rDpg"
    cursor.execute("""
    INSERT INTO videos (video_id, title, folder_id, duration_sec, thumbnail_url)
    VALUES (?, ?, ?, ?, ?)
    """, (
        default_vid,
        "Engineering Chemistry: Polymers, Molecular Weight Distribution & Stereochemistry",
        1,
        2700,
        f"https://img.youtube.com/vi/{default_vid}/hqdefault.jpg"
    ))

    # 3. Pre-seed 4 Personal Study Pins (as requested by prompt)
    pins = [
        (
            default_vid,
            580.0,  # 09:40
            "exam_priority",
            "Polydispersity Index (PDI = Mw/Mn) Numerical Formula",
            "Polydispersity Index formula: PDI = Mw / Mn. For monodisperse polymers (e.g., biological proteins) PDI = 1.0. For typical industrial synthetic polymers, PDI > 1.5. If PDI=1, all chains have identical length. Highly recurring Question 3 on Midterms!"
        ),
        (
            default_vid,
            675.0,  # 11:15
            "key_formula",
            "Number-Average (Mn) vs Weight-Average (Mw) Formulas",
            "Mn = Σ(Ni·Mi) / ΣNi [measured via Membrane Osmometry & colligative freezing depression]. Mw = Σ(Ni·Mi²) / Σ(Ni·Mi) [measured via Static Light Scattering & Ultracentrifugation]. High-mass chains bias Mw upward, hence Mw >= Mn always."
        ),
        (
            default_vid,
            1335.0, # 22:15
            "key_formula",
            "Ziegler-Natta Stereospecific Polymerization Mechanism",
            "Active catalyst: TiCl4 (transition metal halide) + Al(C2H5)3 (organometallic cocatalyst). Forms a coordinated octahedral titanium complex with a vacant d-orbital site. Directs monomer orientation yielding 99% isotactic polypropylene."
        ),
        (
            default_vid,
            2265.0, # 37:45
            "revisit",
            "Vulcanization Sulfur % vs Viscoelastic Crosslinks",
            "Sulfur bridges across polyisoprene allylic carbons: 2–3% sulfur gives soft elastic tire rubber with high thermal recovery; 25–35% sulfur produces rigid ebonite with restricted segment rotation. Vulcanization permanently suppresses sticky cold flow."
        )
    ]
    cursor.executemany("""
    INSERT INTO pins (video_id, timestamp_sec, tag, title, note)
    VALUES (?, ?, ?, ?, ?)
    """, pins)

    # 4. Pre-seed Analyses for all 3 Peaks (08:00-12:00, 21:30-24:30, 36:00-39:30)
    # Peak 1 Analysis (08:00 - 12:00)
    p1_breakdown = [
        "Molar Mass Distribution: Synthetic polymers are intrinsically polydisperse; macromolecular chain propagation terminates randomly, creating a bell-shaped molecular mass distribution.",
        "Number-Average Molar Mass (Mn): Total sample mass divided by total number of polymer molecules. Strictly sensitive to molecule count, measured by end-group analysis and membrane osmometry.",
        "Weight-Average Molar Mass (Mw): Weighted by individual chain mass fractions, so larger molecules contribute quadratically. Measured by static light scattering.",
        "Polydispersity Index (PDI): PDI = Mw / Mn. Represents distribution heterogeneity. For ideal monodisperse samples PDI = 1.0; commercial polymers range from 1.5 to 10+."
    ]
    p1_alt_videos = [
        {
            "title": "Why Weight-Average (Mw) is Always Greater than Number-Average (Mn)",
            "channel": "Khan Academy MCAT Chemistry",
            "duration": "7:14",
            "thumbnail": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=400&q=80",
            "bridge_note": "Visualizes the difference using a 2-chain bowling ball vs ping-pong ball analogy, clarifying why squaring Mi shifts the distribution mean rightward.",
            "url": "https://www.youtube.com/results?search_query=polymer+weight+average+vs+number+average",
            "timestamp_jump": 180
        },
        {
            "title": "MIT OCW: Polymer Molecular Weights & Polydispersity Index",
            "channel": "MIT 3.091 Introduction to Solid-State Chemistry",
            "duration": "9:42",
            "thumbnail": "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=400&q=80",
            "bridge_note": "Locks onto your professor's exact notation (Mn, Mw, PDI) and walks through a worked numerical calculating PDI from a discrete weight fraction table.",
            "url": "https://www.youtube.com/results?search_query=MIT+OCW+Polydispersity+Index",
            "timestamp_jump": 320
        }
    ]

    # Peak 2 Analysis (21:30 - 24:30)
    p2_breakdown = [
        "Coordination Polymerization: Unlike free-radical addition which yields random atactic chains, Ziegler-Natta catalysis enables precise stereospecific spatial control.",
        "Catalyst Precursor: Heterogeneous TiCl4 (titanium tetrachloride) reacted with Al(C2H5)3 (triethylaluminum) creates active Ti(III) sites with a vacant coordination orbital.",
        "Cossee-Arlman Mechanism: Alkene (propylene) π-electrons coordinate to the vacant titanium orbital, followed by cis-insertion into the Ti-Carbon bond with simultaneous site regeneration.",
        "Industrial Significance: Enables production of high-density crystalline isotactic polypropylene (Tm ~165°C) instead of useless amorphous rubbery atactic wax."
    ]
    p2_alt_videos = [
        {
            "title": "Ziegler-Natta Mechanism 3D Molecular Orbital Animation",
            "channel": "Oxford Chemical Biology",
            "duration": "5:30",
            "thumbnail": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80",
            "bridge_note": "Provides a 3D animated orbit view of the vacant titanium d-orbital cis-insertion step that 2D chalkboard sketches fail to convey.",
            "url": "https://www.youtube.com/results?search_query=Ziegler-Natta+mechanism+3D",
            "timestamp_jump": 120
        },
        {
            "title": "Tacticity Demystified: Isotactic vs Syndiotactic vs Atactic",
            "channel": "Professor Dave Explains",
            "duration": "6:50",
            "thumbnail": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80",
            "bridge_note": "Quick 6-minute refresher on how methyl group side-chain orientations alter physical polymer crystallinity and melting points.",
            "url": "https://www.youtube.com/results?search_query=Tacticity+Isotactic+Syndiotactic+Atactic",
            "timestamp_jump": 195
        }
    ]

    # Peak 3 Analysis (36:00 - 39:30)
    p3_breakdown = [
        "Structure of Natural Rubber: cis-1,4-polyisoprene chains are coiled and held only by weak Van der Waals forces, causing permanent plastic deformation and stickiness when heated.",
        "Vulcanization Reaction: Heating raw elastomer with elemental sulfur (typically 140°C in the presence of ZnO accelerator) forms covalent polysulfide (-Sx-) crosslinks between chains.",
        "Crosslink Density vs Mechanical Properties: 1–3% sulfur allows flexible conformational unwinding (elastic rubber for automobile tires); 25–35% sulfur creates dense rigid networks (ebonite/bowling balls).",
        "Thermodynamic Elasticity: Retractile force in vulcanized rubber is entropy-driven: stretching decreases conformational entropy, so returning to randomized coiled states is spontaneous."
    ]
    p3_alt_videos = [
        {
            "title": "Polymer Physics: Entropic Elasticity of Rubber Networks",
            "channel": "Stanford Engineering Lectures",
            "duration": "8:22",
            "thumbnail": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80",
            "bridge_note": "Explains why stretching rubber actually warms it up and why elasticity is driven by ΔS rather than intermolecular ΔH bonds.",
            "url": "https://www.youtube.com/results?search_query=entropic+elasticity+of+rubber",
            "timestamp_jump": 210
        }
    ]

    analyses = [
        (
            default_vid,
            "peak-1",
            480.0,
            720.0,
            "Degree of Polymerization & Molecular Weight Distribution (PDI)",
            json.dumps(p1_breakdown),
            "High Cognitive Load (88% Replay Spike)",
            88,
            "Students repeatedly rewind the derivation of Number-Average (Mn) vs Weight-Average (Mw) and struggle with discrete summations and why Mw is strictly greater than Mn.",
            "The instructor defines the Polydispersity Index strictly using the ratio of second moment to first moment of the distribution:\n\n$$PDI = \\frac{\\bar{M}_w}{\\bar{M}_n} = \\frac{\\sum N_i M_i^2 \\cdot \\sum N_i}{\\left(\\sum N_i M_i\\right)^2}$$\n\nNotice the professor writes $\\bar{M}_n = \\frac{\\sum N_i M_i}{\\sum N_i}$ and $\\bar{M}_w = \\frac{\\sum w_i M_i}{\\sum w_i}$. When solving midterm problem 2, do not convert to molar fractions $x_i$; keep the professor's $N_i$ count matrix to avoid arithmetic errors.",
            "PDI = \\frac{\\bar{M}_w}{\\bar{M}_n} \\ge 1.0",
            json.dumps(p1_alt_videos)
        ),
        (
            default_vid,
            "peak-2",
            1290.0,
            1470.0,
            "Ziegler-Natta Catalysis & Stereospecific Mechanism",
            json.dumps(p2_breakdown),
            "Abstract Spatial Geometry (92% Replay Spike)",
            92,
            "High rewind rate due to complex 3D organometallic coordination transitions and confusion over how the vacant octahedral d-orbital enforces stereospecific cis-insertion.",
            "The instructor models the catalyst active center as an octahedral titanium center with one vacant coordination site:\n\n$$TiCl_4 + Al(C_2H_5)_3 \\longrightarrow [TiCl_3(C_2H_5)] \\cdot AlCl(C_2H_5)_2 + \\square$$\n\nWhere $\\square$ denotes the vacant d-orbital coordinating the incoming monomer π-bond. The key to solving Question 5 is showing that the growing chain always migrates back to restore the original stereochemical configuration.",
            "R-CH=CH_2 + [Ti-R'] \\longrightarrow [Ti-CH_2-CH(R)-R']",
            json.dumps(p2_alt_videos)
        ),
        (
            default_vid,
            "peak-3",
            2160.0,
            2370.0,
            "Vulcanization, Cross-Linking & Viscoelastic Transition",
            json.dumps(p3_breakdown),
            "Exam Numerical & Property Mapping (82% Replay Spike)",
            82,
            "Students frequently rewind to verify exact sulfur percentages (2-3% vs 30%) and the thermodynamic distinction between entropic elasticity and brittle glass transition Tg.",
            "The instructor writes the allylic hydrogen abstraction and sulfur bridge formation as:\n\n$$-\\text{CH}_2-\\text{C}(\\text{CH}_3)=\\text{CH}-\\text{CH}_2- \\xrightarrow{S_8, \\, \\Delta, \\, \\text{ZnO}} -\\text{CH}_2-\\text{C}(\\text{CH}_3)(S_x)-\\text{CH}-\\text{CH}_2- $$\n\nCrucial exam note: Remember that crosslinking decreases chain mobility, raising $T_g$. For 2–3% sulfur, $T_g$ remains well below room temperature (-70°C), maintaining rubbery elasticity.",
            "\\Delta G = \\Delta H - T \\Delta S \\implies f = -T \\left(\\frac{\\partial S}{\\partial L}\\right)_T",
            json.dumps(p3_alt_videos)
        )
    ]
    cursor.executemany("""
    INSERT INTO analyses (
        video_id, peak_id, start_sec, end_sec, title,
        concept_breakdown, difficulty_badge, difficulty_score,
        difficulty_reason, context_locked_explanation, formula_latex, alt_videos
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, analyses)

    # 5. Pre-seed Quizzes & Active Recall Diagrams
    p1_diagram_nodes = [
        {
            "id": "node-1",
            "title": "Raw Polymer Population",
            "content": "Distribution of chains {N1, M1}, {N2, M2} ... {Ni, Mi}",
            "is_blank": False
        },
        {
            "id": "node-2",
            "title": "Number-Average Molar Mass (Mn)",
            "content": "Mn = Σ(Ni·Mi) / [ ? ]",
            "is_blank": True,
            "prompt": "Complete the denominator for Number-Average Mn:",
            "options": ["ΣNi (Total Molecules)", "Σ(Ni·Mi²) (Mass Moments)", "PDI (Breadth Factor)"],
            "correct_option_index": 0,
            "revealed_text": "Mn = Σ(Ni·Mi) / ΣNi (Colligative Count)"
        },
        {
            "id": "node-3",
            "title": "Weight-Average Molar Mass (Mw)",
            "content": "Mw = Σ(Ni·Mi²) / [ ? ]",
            "is_blank": True,
            "prompt": "Complete the denominator for Weight-Average Mw:",
            "options": ["Σ(Ni·Mi) (Total Sample Mass)", "Avogadro Number NA", "Degree of Polymerization DP"],
            "correct_option_index": 0,
            "revealed_text": "Mw = Σ(Ni·Mi²) / Σ(Ni·Mi) (Mass-Weighted)"
        },
        {
            "id": "node-4",
            "title": "Polydispersity Metric",
            "content": "[ ? ] = Mw / Mn",
            "is_blank": True,
            "prompt": "Identify the ratio symbol used to quantify molecular weight spread:",
            "options": ["PDI (Polydispersity Index)", "Tg (Glass Transition)", "DP (Degree of Poly)"],
            "correct_option_index": 0,
            "revealed_text": "PDI = Mw / Mn (Distribution Spread Ratio)"
        },
        {
            "id": "node-5",
            "title": "Monodisperse Boundary Condition",
            "content": "PDI = 1.0 (Uniform chains, e.g., natural proteins)",
            "is_blank": False
        }
    ]

    p1_mcqs = [
        {
            "id": "mcq-1",
            "question": "For a laboratory-synthesized monodisperse polymer sample where every individual chain has exactly 1,000 monomer repeat units, what is the exact value of the Polydispersity Index (PDI)?",
            "options": [
                "PDI = 0.0 (Zero spread)",
                "PDI = 1.0 (Mw equals Mn)",
                "PDI = 2.0 (Flory-Schulz limit)",
                "PDI > 1.5 (Standard synthetic threshold)"
            ],
            "correct_index": 1,
            "explanation": "When all polymer chains are identical in length, the number-average and weight-average molecular weights are mathematically identical (Mw = Mn), yielding PDI = Mw / Mn = 1.0."
        },
        {
            "id": "mcq-2",
            "question": "Which experimental measurement technique depends exclusively on the total number of dissolved solute particles (colligative properties) and therefore determines the Number-Average Molecular Weight (Mn)?",
            "options": [
                "Static Laser Light Scattering",
                "Analytical Ultracentrifugation",
                "Membrane Osmometry",
                "Viscometry (Mark-Houwink equation)"
            ],
            "correct_index": 2,
            "explanation": "Membrane osmometry measures osmotic pressure, a colligative property proportional strictly to the number density of polymer molecules in solution, directly yielding Mn."
        }
    ]

    # Peak 2 Diagram & Quizzes
    p2_diagram_nodes = [
        {
            "id": "node-p2-1",
            "title": "Catalyst Precursor Complex",
            "content": "TiCl4 (transition metal) + Al(C2H5)3 (organometallic cocatalyst)",
            "is_blank": False
        },
        {
            "id": "node-p2-2",
            "title": "Active Site Geometry",
            "content": "Octahedral Titanium Center with [ ? ]",
            "is_blank": True,
            "prompt": "What key structural feature at the titanium atom allows incoming monomer coordination?",
            "options": ["Vacant coordination d-orbital site", "Lone pair donor oxygen atom", "Positively charged carbocation"],
            "correct_option_index": 0,
            "revealed_text": "Vacant octahedral coordination site (□)"
        },
        {
            "id": "node-p2-3",
            "title": "Monomer Binding",
            "content": "Alkene π-bond coordinates to vacant orbital",
            "is_blank": False
        },
        {
            "id": "node-p2-4",
            "title": "Chain Extension Step",
            "content": "[ ? ] insertion of coordinated olefin into Ti-C bond",
            "is_blank": True,
            "prompt": "What stereospecific rearrangement mechanism links the monomer into the chain?",
            "options": ["Intramolecular Cis-insertion", "Trans-elimination reaction", "Free-radical hydrogen abstraction"],
            "correct_option_index": 0,
            "revealed_text": "Stereospecific cis-migratory insertion"
        },
        {
            "id": "node-p2-5",
            "title": "High Crystallinity Product",
            "content": "[ ? ] polypropylene with high melting point (Tm ~165°C)",
            "is_blank": True,
            "prompt": "Which stereochemical form of polypropylene is formed with all methyl groups on one side?",
            "options": ["Isotactic polypropylene", "Atactic polypropylene (amorphous)", "Syndiotactic polypropylene"],
            "correct_option_index": 0,
            "revealed_text": "Isotactic Polypropylene (>99% crystalline)"
        }
    ]

    p2_mcqs = [
        {
            "id": "mcq-p2-1",
            "question": "What is the primary role of the organoaluminum cocatalyst, Al(C2H5)3, when reacted with TiCl4 in Ziegler-Natta polymerization?",
            "options": [
                "It serves as a chain transfer terminating agent",
                "It alkylates and reduces the titanium center to create the active coordinated Ti-C bond",
                "It increases the boiling point of the hydrocarbon solvent",
                "It acts as a free-radical peroxide initiator"
            ],
            "correct_index": 1,
            "explanation": "Al(C2H5)3 alkylates the TiCl4 and reduces Ti(IV) to Ti(III), generating the active titanium-alkyl bond with an adjacent empty coordination site."
        },
        {
            "id": "mcq-p2-2",
            "question": "Why is isotactic polypropylene commercially superior to atactic polypropylene for engineering parts?",
            "options": [
                "Isotactic polypropylene is completely water-soluble",
                "Regular spatial arrangement allows tight chain packing, high crystallinity, and higher tensile strength",
                "Atactic polypropylene has a higher melting temperature of 300°C",
                "Isotactic polypropylene undergoes spontaneous biodegradation in air"
            ],
            "correct_index": 1,
            "explanation": "In isotactic polypropylene, all methyl substituents point in the same stereochemical direction, allowing chains to crystallize into strong helices with high melting temperatures (165°C)."
        }
    ]

    # Peak 3 Diagram & Quizzes
    p3_diagram_nodes = [
        {
            "id": "node-p3-1",
            "title": "Raw Polyisoprene",
            "content": "Uncrosslinked cis-1,4 chains exhibit viscous plastic creep",
            "is_blank": False
        },
        {
            "id": "node-p3-2",
            "title": "Vulcanizing Agent Addition",
            "content": "Heating at 140°C with [ ? ] and ZnO accelerator",
            "is_blank": True,
            "prompt": "What chemical element provides the covalent crosslinking bridges?",
            "options": ["Elemental Sulfur (S8)", "Carbon Black Nanoparticles", "Titanium Dioxide (TiO2)"],
            "correct_option_index": 0,
            "revealed_text": "Elemental Sulfur (S8) with ZnO activator"
        },
        {
            "id": "node-p3-3",
            "title": "Elastic Tire Formulation",
            "content": "[ ? ] sulfur content yields high-recovery elastomer",
            "is_blank": True,
            "prompt": "What sulfur weight percentage produces flexible automobile tires?",
            "options": ["2% to 3% Sulfur", "25% to 35% Sulfur", "50% to 60% Sulfur"],
            "correct_option_index": 0,
            "revealed_text": "2% to 3% Sulfur (Automobile tire elastomer)"
        },
        {
            "id": "node-p3-4",
            "title": "Rigid Network Formulation",
            "content": "[ ? ] sulfur content yields highly crosslinked Ebonite",
            "is_blank": True,
            "prompt": "What sulfur weight percentage creates hard, rigid vulcanite / ebonite?",
            "options": ["25% to 35% Sulfur", "0.5% Sulfur", "5% to 8% Sulfur"],
            "correct_option_index": 0,
            "revealed_text": "25% to 35% Sulfur (Rigid Ebonite)"
        },
        {
            "id": "node-p3-5",
            "title": "Crosslinked Network Performance",
            "content": "Suppresses cold flow, stabilizes Tg, provides entropic elasticity",
            "is_blank": False
        }
    ]

    p3_mcqs = [
        {
            "id": "mcq-p3-1",
            "question": "What thermodynamic parameter primarily drives the spontaneous retractile recoil force of stretched vulcanized rubber when released?",
            "options": [
                "Increase in conformational entropy (ΔS > 0)",
                "Exothermic enthalpy of crystallization (ΔH < 0)",
                "Coulombic repulsion between neighboring sulfur atoms",
                "Decrease in ambient atmospheric pressure"
            ],
            "correct_index": 0,
            "explanation": "Stretching aligns the polymer chains into lower-entropy conformations. Releasing the tension allows the chains to spontaneously maximize their conformational entropy (ΔS > 0)."
        },
        {
            "id": "mcq-p3-2",
            "question": "What is the structural consequence of increasing sulfur crosslinking in polyisoprene from 2% to 30%?",
            "options": [
                "The polymer degrades into volatile monomer gas",
                "Chain segment mobility is severely restricted, transforming flexible rubber into rigid ebonite",
                "The glass transition temperature Tg drops below -150°C",
                "The rubber becomes water-soluble"
            ],
            "correct_index": 1,
            "explanation": "High sulfur concentrations (25–35%) form a dense 3D thermoset network where segments cannot slide past each other, raising Tg well above room temperature to form ebonite."
        }
    ]

    quizzes = [
        (
            default_vid,
            "peak-1",
            480.0,
            720.0,
            "Active Recall: Polydispersity Index & Molecular Weight Formulas",
            json.dumps(p1_diagram_nodes),
            json.dumps(p1_mcqs)
        ),
        (
            default_vid,
            "peak-2",
            1290.0,
            1470.0,
            "Active Recall: Ziegler-Natta Catalysis Mechanism",
            json.dumps(p2_diagram_nodes),
            json.dumps(p2_mcqs)
        ),
        (
            default_vid,
            "peak-3",
            2160.0,
            2370.0,
            "Active Recall: Rubber Vulcanization & Crosslinking Thermodynamics",
            json.dumps(p3_diagram_nodes),
            json.dumps(p3_mcqs)
        )
    ]

    cursor.executemany("""
    INSERT INTO quizzes (
        video_id, peak_id, start_sec, end_sec,
        diagram_title, diagram_nodes, mcqs
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    """, quizzes)

    conn.commit()
    conn.close()
    logger.info("Database initialized and demo data seeded successfully!")
