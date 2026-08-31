/**
 * Titanium — Approved How-To library (agentic field assist)
 *
 * AUTO-GENERATED from the approved how-to JSON (attica/voltara/aquaflow).
 * Each video was verified live via YouTube oEmbed. In production the company
 * curates its own approved library; web results are a clearly-labeled fallback.
 */

export type HowTo = {
  title: string;
  system: string;
  equipment: string;
  difficulty: string;
  estMinutes: number;
  whenToUse: string;
  safety: string[];
  steps: string[];
  channel: string;
  videoId: string;
};

export type Vertical = {
  key: string;
  label: string;
  trade: string;
  accent: string;
  systems: Record<string, string>;
  items: HowTo[];
};

export const VERTICALS: Vertical[] = [
  {
    "key": "attica",
    "label": "Attica",
    "trade": "HVAC",
    "accent": "#D99A3C",
    "systems": {
      "Cooling": "#2563EB",
      "Heating": "#DC2626",
      "Controls": "#7C3AED",
      "Airflow": "#0D9488"
    },
    "items": [
      {
        "title": "Test and Replace a Dual-Run Capacitor on an AC Condenser",
        "system": "Cooling",
        "equipment": "Outdoor AC condensing unit / split system",
        "difficulty": "Intermediate",
        "estMinutes": 30,
        "whenToUse": "Compressor and/or condenser fan hum but won't start, the unit trips, or the fan spins slowly, pointing to a weak or failed run capacitor.",
        "safety": [
          "Cut power at the disconnect and lock it out before opening the electrical panel",
          "Discharge the capacitor across its terminals with an insulated resistor before touching them",
          "Verify capacitor MFD and voltage rating match the old part before installing"
        ],
        "steps": [
          "Turn off power at the outdoor disconnect and the breaker, then confirm zero volts with a meter",
          "Remove the condenser access panel and photograph the capacitor wiring for reference",
          "Safely discharge the capacitor across each terminal pair using an insulated resistor",
          "Label and disconnect the HERM, FAN, and COMMON (C) wires from the capacitor terminals",
          "Test the old capacitor's MFD with a multimeter and compare to its rating to confirm failure",
          "Mount the new capacitor of matching MFD and voltage in the strap",
          "Reconnect the wires to the correct HERM, FAN, and C terminals per your photo",
          "Replace the panel, restore power, and confirm the compressor and fan start and run normally"
        ],
        "channel": "AC Service Tech LLC",
        "videoId": "-NirH1VBTp8"
      },
      {
        "title": "Clean or Replace a Furnace Flame Sensor",
        "system": "Heating",
        "equipment": "Gas furnace with hot surface / spark ignition",
        "difficulty": "Basic",
        "estMinutes": 20,
        "whenToUse": "Furnace ignites then shuts off after a few seconds and short-cycles, indicating the flame sensor isn't proving flame.",
        "safety": [
          "Turn off electrical power and the gas supply to the furnace before starting",
          "Let the burner assembly cool before handling the sensor",
          "Do not use sandpaper on the sensor rod; use fine steel wool or an emery cloth"
        ],
        "steps": [
          "Shut off power at the furnace switch or breaker and close the gas valve",
          "Remove the burner compartment door to access the flame sensor near the burners",
          "Remove the single screw holding the sensor and gently pull it out with its wire",
          "Lightly clean the metal rod with fine steel wool or emery cloth to remove oxidation",
          "Wipe the rod clean and inspect the porcelain base for cracks; replace the sensor if cracked",
          "Reinstall the sensor, secure the screw, and reconnect the wire",
          "Replace the door, restore gas and power, and run a heat cycle to confirm the flame stays lit"
        ],
        "channel": "HouseImprovements",
        "videoId": "R7AKPgBB_R4"
      },
      {
        "title": "Wire a Thermostat to a Furnace and AC Unit (Color Code)",
        "system": "Controls",
        "equipment": "Low-voltage thermostat with gas furnace + split AC",
        "difficulty": "Intermediate",
        "estMinutes": 30,
        "whenToUse": "Installing or replacing a thermostat, or diagnosing a no-heat/no-cool call caused by low-voltage wiring at the R, W, Y, G, and C terminals.",
        "safety": [
          "Turn off power to the furnace at the disconnect before touching low-voltage wiring",
          "Photograph existing terminal connections before removing any wires",
          "Never cross 24V R with C or you will blow the control-board transformer fuse"
        ],
        "steps": [
          "Cut power to the furnace and confirm the thermostat is de-energized",
          "Note the standard color code: R=24V power, W=heat, Y=cooling, G=fan, C=common",
          "Land the R, W, Y, G, and C wires on the matching thermostat sub-base terminals",
          "At the furnace control board, connect the same wires to R, W, Y, G, and C terminals",
          "Run the Y and C circuit out to the condenser contactor coil for the cooling call",
          "Double-check each terminal against your photo and the wiring diagram",
          "Restore power and test a heat call (W), a cool call (Y), and fan-only (G) to confirm each function"
        ],
        "channel": "AC Service Tech LLC",
        "videoId": "GoThAlOvSts"
      },
      {
        "title": "Replace a Furnace / Air Handler Blower Motor",
        "system": "Airflow",
        "equipment": "Furnace or air handler with PSC blower motor",
        "difficulty": "Advanced",
        "estMinutes": 90,
        "whenToUse": "Blower won't run, runs slow, overheats, or smells burnt, and the motor tests bad after ruling out the capacitor and control board.",
        "safety": [
          "Shut off power at the furnace disconnect and breaker before removing panels",
          "Discharge the blower run capacitor before disconnecting motor leads",
          "Match the replacement motor HP, RPM/speed taps, rotation, and capacitor rating to the original"
        ],
        "steps": [
          "Cut power to the furnace and remove the blower compartment door",
          "Photograph and label the motor wiring, speed taps, and capacitor connections",
          "Disconnect the motor leads and discharge the run capacitor",
          "Unbolt the blower housing and slide the squirrel-cage assembly out of the furnace",
          "Loosen the setscrew and pull the blower wheel off the old motor shaft",
          "Remove the motor from its mount, transfer the wheel to the new matching motor, and set the wheel spacing",
          "Reinstall the blower assembly, wire the new motor and capacitor per your photo, and secure it",
          "Restore power and run the blower on each speed to confirm proper rotation and airflow"
        ],
        "channel": "Word of Advice TV",
        "videoId": "_3TxcnCkd18"
      }
    ]
  },
  {
    "key": "voltara",
    "label": "Voltara",
    "trade": "Electrical",
    "accent": "#F59E0B",
    "systems": {
      "Panel": "#334155",
      "Devices": "#2563EB",
      "Switches": "#7C3AED",
      "Troubleshooting": "#DC2626"
    },
    "items": [
      {
        "title": "Replace a Tripping or Failed Circuit Breaker in the Panel",
        "system": "Panel",
        "equipment": "Residential load center / main breaker panel",
        "difficulty": "Intermediate",
        "estMinutes": 30,
        "whenToUse": "A branch breaker won't reset, trips immediately on reset, feels warm, or shows heat damage, and the breaker itself has tested bad after ruling out a downstream fault.",
        "safety": [
          "Turn off the main breaker and treat the incoming lugs as always live even with the main off",
          "Verify the branch circuit is de-energized with a meter or non-contact tester before touching the wire",
          "Use one hand and stand on a dry surface when working inside the panel"
        ],
        "steps": [
          "Identify the faulty breaker and switch off the main breaker to kill the bus",
          "Remove the panel deadfront cover and set it aside carefully",
          "Confirm zero volts on the breaker's load screw with a meter or tester",
          "Loosen the load screw and pull the circuit conductor free from the old breaker",
          "Rock the old breaker out of the bus clip and remove it from the panel",
          "Snap the new matching-brand, same-amperage breaker onto the bus stab",
          "Land the circuit conductor under the load screw and torque it snug",
          "Reinstall the deadfront, switch the main back on, and confirm the circuit is live and holding"
        ],
        "channel": "Silver Cymbal",
        "videoId": "ta0CvuSGQgY"
      },
      {
        "title": "Replace a Faulty GFCI Receptacle",
        "system": "Devices",
        "equipment": "120V GFCI outlet (kitchen, bath, garage, or exterior)",
        "difficulty": "Basic",
        "estMinutes": 20,
        "whenToUse": "A GFCI won't reset, trips repeatedly, or has dead downstream outlets, indicating the device has failed or is miswired on its LINE/LOAD terminals.",
        "safety": [
          "Switch off the breaker feeding the outlet and lock or tag it out",
          "Verify the box is de-energized with a tester on every conductor before touching wires",
          "Never reverse the LINE and LOAD terminals; feed power to LINE only"
        ],
        "steps": [
          "Turn off the breaker and confirm the outlet is dead with a non-contact tester",
          "Unscrew and pull the old GFCI out of the box, noting which pair is LINE and which is LOAD",
          "Label the incoming LINE conductors before disconnecting anything",
          "Transfer the hot and neutral to the new GFCI's LINE terminals, and any downstream pair to LOAD",
          "Connect the bare or green ground wire to the green grounding screw",
          "Fold the wires neatly and seat the new GFCI into the box, then screw it in",
          "Install the cover plate, restore power, and press TEST then RESET to confirm it trips and resets",
          "Verify protection with a plug-in GFCI tester at this outlet and any downstream outlets"
        ],
        "channel": "The DIY Depot",
        "videoId": "Z5ndKI8tvUY"
      },
      {
        "title": "Replace a 3-Way Light Switch",
        "system": "Switches",
        "equipment": "3-way switch pair controlling one light from two locations",
        "difficulty": "Intermediate",
        "estMinutes": 30,
        "whenToUse": "A light controlled from two switches works intermittently or only from one location, pointing to a failed 3-way switch or a traveler landed on the wrong screw.",
        "safety": [
          "Kill the breaker for the circuit and verify zero volts at the switch with a tester",
          "Identify the single darker (COMMON) screw before removing any wires",
          "Label the two traveler wires so they are not swapped with the common"
        ],
        "steps": [
          "Turn off the breaker and confirm the switch is de-energized with a tester",
          "Unscrew the old 3-way switch and pull it from the box",
          "Locate the common terminal (the odd-colored screw) and tag that conductor",
          "Tag the two traveler wires on the brass screws so their positions are known",
          "Disconnect all three conductors and the ground from the old switch",
          "Land the common wire on the new switch's common screw first",
          "Connect the two travelers to the two brass traveler screws and the ground to green",
          "Reinstall the switch and plate, restore power, and test that the light works from both switch locations"
        ],
        "channel": "Electrician U",
        "videoId": "5tD5XEVI2Gc"
      },
      {
        "title": "Troubleshoot a Dead Outlet",
        "system": "Troubleshooting",
        "equipment": "Non-working 120V receptacle, multimeter, and non-contact tester",
        "difficulty": "Intermediate",
        "estMinutes": 40,
        "whenToUse": "An outlet has no power while the breaker appears on, calling for a systematic trace of a tripped GFCI, an open hot or neutral, or a loose back-stab or terminal connection.",
        "safety": [
          "De-energize the circuit at the breaker before opening any device or box",
          "Confirm zero volts with a meter before touching conductors or terminals",
          "Re-torque terminals to spec; loose connections are a fire risk, not just a dead outlet"
        ],
        "steps": [
          "Check whether any upstream GFCI has tripped and reset it, then retest the dead outlet",
          "Confirm the branch breaker is fully on by cycling it off and back on",
          "With power on, meter hot-to-neutral, hot-to-ground, and neutral-to-ground to isolate an open leg",
          "Kill power at the breaker and verify the outlet is dead before opening the box",
          "Inspect the receptacle for failed back-stab connections and loose terminal screws",
          "Move any back-stabbed conductors to the side screw terminals and tighten firmly",
          "Check upstream outlets and junction boxes in the circuit for the same loose connections",
          "Restore power and confirm correct voltage and wiring with the meter and an outlet tester"
        ],
        "channel": "Remote Electrician",
        "videoId": "_fW-42aNqdU"
      }
    ]
  },
  {
    "key": "aquaflow",
    "label": "Aquaflow",
    "trade": "Plumbing",
    "accent": "#0EA5E9",
    "systems": {
      "Fixtures": "#0D9488",
      "Supply": "#2563EB",
      "Drains": "#64748B",
      "Water Heater": "#DC2626"
    },
    "items": [
      {
        "title": "Replace a Toilet Fill Valve",
        "system": "Fixtures",
        "equipment": "Adjustable pliers, sponge/towel, replacement fill valve; toilet tank",
        "difficulty": "Basic",
        "estMinutes": 30,
        "whenToUse": "Toilet runs continuously, hisses, or the tank refills on its own between flushes. Use when a new flapper did not stop the running water.",
        "safety": [
          "Shut off the toilet supply stop valve before starting",
          "Flush and sponge out the tank to relieve water and avoid spills",
          "Keep a towel and bucket down to catch residual tank water"
        ],
        "steps": [
          "Shut off the supply stop and flush to empty the tank",
          "Sponge out remaining water from the tank bottom",
          "Disconnect the supply line from the old fill valve",
          "Unthread the lock nut and lift out the old fill valve",
          "Set the new valve height, then seat it and hand-tighten the lock nut",
          "Reconnect the supply line and attach the fill/overflow tube",
          "Turn the water back on and check for leaks",
          "Adjust the float so the fill stops below the overflow tube"
        ],
        "channel": "The Home Depot",
        "videoId": "H5G4OeIDXMk"
      },
      {
        "title": "Replace a Leaking Angle Stop Valve",
        "system": "Supply",
        "equipment": "Two adjustable wrenches, bucket/rag, replacement quarter-turn angle stop; under-sink or toilet supply",
        "difficulty": "Intermediate",
        "estMinutes": 45,
        "whenToUse": "The shutoff valve under a sink or toilet drips, weeps at the stem, or will no longer close. Use when the stop is seized or leaking onto the floor.",
        "safety": [
          "Shut off the main or branch water supply before removing the stop",
          "Open a faucet to relieve line pressure and drain residual water",
          "Keep a bucket and rags ready for water still trapped in the line"
        ],
        "steps": [
          "Shut off the main water supply to the fixture",
          "Open the fixture to relieve pressure and drain the line",
          "Disconnect the supply riser from the old angle stop",
          "Loosen the compression nut and pull the old valve off the pipe",
          "Slide on the new nut and compression ring, then the new valve",
          "Tighten the compression nut while holding the valve square",
          "Reconnect the supply riser to the new stop",
          "Restore water and inspect the joint and stem for leaks"
        ],
        "channel": "DIY On The House",
        "videoId": "__51CGPJr_g"
      },
      {
        "title": "Clear a Clogged Sink P-Trap",
        "system": "Drains",
        "equipment": "Channel-lock pliers, bucket, bottle brush, rag; under-sink P-trap",
        "difficulty": "Basic",
        "estMinutes": 25,
        "whenToUse": "A sink drains slowly, backs up, or smells even after plunging. Use when the clog is caught in the U-shaped trap under the sink.",
        "safety": [
          "Do not run the disposal or hot water while the trap is open",
          "Place a bucket underneath to catch standing drain water",
          "Wear gloves and avoid mixing any leftover chemical drain cleaner"
        ],
        "steps": [
          "Place a bucket directly under the P-trap",
          "Loosen both slip nuts on the trap by hand or with pliers",
          "Lower the trap and empty debris into the bucket",
          "Scrub the trap and arm clean with a bottle brush",
          "Check the slip-joint washers and replace if worn",
          "Reseat the trap and hand-tighten both slip nuts",
          "Snug the nuts a quarter turn without overtightening",
          "Run water and watch the joints for any drips"
        ],
        "channel": "Eddie Helps Homeowners",
        "videoId": "M8rpC8I2h3o"
      },
      {
        "title": "Replace Water Heater Element and Thermostat",
        "system": "Water Heater",
        "equipment": "Element wrench, screwdriver, voltage tester, garden hose, replacement element and thermostat; electric tank water heater",
        "difficulty": "Advanced",
        "estMinutes": 90,
        "whenToUse": "No hot water, not enough hot water, or water heats slowly. Use when a tripped reset or a failed heating element/thermostat is suspected.",
        "safety": [
          "Turn off the breaker and verify power is dead with a voltage tester",
          "Shut off the cold supply and drain the tank before removing the element",
          "Confirm the tank is full and air is purged before restoring power"
        ],
        "steps": [
          "Switch off the water heater breaker and confirm no voltage",
          "Shut the cold supply valve and open a hot tap to vent",
          "Connect a hose and drain the tank fully",
          "Remove access panels, insulation, and the plastic covers",
          "Label and disconnect the wires from the element and thermostat",
          "Unscrew the old element and swap in the new element and thermostat",
          "Refill the tank and purge air by opening a hot faucet",
          "Reconnect wiring, replace panels, and restore power"
        ],
        "channel": "Mend and Make",
        "videoId": "a7wLmj4FC5Y"
      }
    ]
  }
];

export const thumbUrl = (videoId: string) =>
  `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

export const watchUrl = (videoId: string) =>
  `https://www.youtube.com/watch?v=${videoId}`;
