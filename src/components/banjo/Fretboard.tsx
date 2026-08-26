"use client";

import { OPEN_G_TUNING, NUM_FRETS, type Fingering, type StringIndex } from "@/lib/banjo/tuning";
import { pitchClass } from "@/lib/banjo/notes";

const FRET_HEIGHT = 40;
const STRING_SPACING = 32;
const NECK_TOP_MARGIN = 56;
const SIDE_MARGIN = 28;
const DOT_RADIUS = 12;

// Rendered left-to-right as viewed head-on (looking at the front of the
// banjo, playing hand toward you): the short 5th drone string on the left,
// then 4th, 3rd, 2nd, 1st.
const DISPLAY_ORDER: StringIndex[] = [0, 1, 2, 3, 4];

const svgWidth = SIDE_MARGIN * 2 + STRING_SPACING * (DISPLAY_ORDER.length - 1);
const svgHeight = NECK_TOP_MARGIN + FRET_HEIGHT * NUM_FRETS + 20;

function screenX(stringIndex: StringIndex): number {
  return SIDE_MARGIN + DISPLAY_ORDER.indexOf(stringIndex) * STRING_SPACING;
}

function fretLineY(fret: number): number {
  return NECK_TOP_MARGIN + fret * FRET_HEIGHT;
}

function dotY(fret: number): number {
  return NECK_TOP_MARGIN + (fret - 0.5) * FRET_HEIGHT;
}

interface FretboardProps {
  fingering: Fingering;
  onFret: (stringIndex: StringIndex, fret: number) => void;
  onOpen: (stringIndex: StringIndex) => void;
}

export function Fretboard({ fingering, onFret, onOpen }: FretboardProps) {
  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      width={svgWidth}
      height={svgHeight}
      role="group"
      aria-label="Interactive banjo fretboard"
    >
      {/* fret lines */}
      {Array.from({ length: NUM_FRETS + 1 }, (_, fret) => (
        <line
          key={fret}
          x1={fret < OPEN_G_TUNING[0].minFret - 1 ? screenX(1) : screenX(0)}
          x2={screenX(4)}
          y1={fretLineY(fret)}
          y2={fretLineY(fret)}
          className={fret === 0 ? "stroke-foreground" : "stroke-foreground/30"}
          strokeWidth={fret === 0 ? 3 : 1}
        />
      ))}

      {/* fret number labels */}
      {Array.from({ length: NUM_FRETS }, (_, i) => i + 1).map((fret) => (
        <text
          key={fret}
          x={SIDE_MARGIN - 12}
          y={dotY(fret)}
          textAnchor="end"
          dominantBaseline="middle"
          className="fill-foreground/40 text-[11px]"
        >
          {fret}
        </text>
      ))}

      {/* strings */}
      {OPEN_G_TUNING.map((stringDef) => {
        const x = screenX(stringDef.index);
        const topY =
          stringDef.minFret > 0 ? fretLineY(stringDef.minFret - 1) : fretLineY(0) - 20;
        return (
          <line
            key={stringDef.index}
            x1={x}
            x2={x}
            y1={topY}
            y2={fretLineY(NUM_FRETS)}
            className="stroke-foreground/60"
            strokeWidth={2}
          />
        );
      })}

      {/* string note labels */}
      {OPEN_G_TUNING.map((stringDef) => {
        const topY =
          stringDef.minFret > 0 ? fretLineY(stringDef.minFret - 1) : fretLineY(0) - 20;
        return (
          <text
            key={stringDef.index}
            x={screenX(stringDef.index)}
            y={topY - 16}
            textAnchor="middle"
            className="fill-foreground/50 text-[11px]"
          >
            {stringDef.minFret > 0
              ? pitchClass(stringDef.openNote).toLowerCase()
              : pitchClass(stringDef.openNote)}
          </text>
        );
      })}

      {/* open-string targets */}
      {OPEN_G_TUNING.map((stringDef) => {
        const x = screenX(stringDef.index);
        const y =
          stringDef.minFret > 0 ? fretLineY(stringDef.minFret - 1) : fretLineY(0) - 20;
        const isOpen = fingering[stringDef.index] === null;
        return (
          <circle
            key={stringDef.index}
            cx={x}
            cy={y}
            r={DOT_RADIUS - 3}
            onClick={() => onOpen(stringDef.index)}
            className={`cursor-pointer stroke-foreground/60 ${
              isOpen ? "fill-transparent" : "fill-transparent hover:fill-accent/20"
            }`}
            strokeWidth={isOpen ? 2 : 1}
          />
        );
      })}

      {/* fretted positions */}
      {OPEN_G_TUNING.flatMap((stringDef) =>
        Array.from({ length: NUM_FRETS }, (_, i) => i + 1)
          .filter((fret) => fret >= Math.max(stringDef.minFret, 1))
          .map((fret) => {
            const isPressed = fingering[stringDef.index] === fret;
            return (
              <circle
                key={`${stringDef.index}-${fret}`}
                cx={screenX(stringDef.index)}
                cy={dotY(fret)}
                r={DOT_RADIUS}
                onClick={() => onFret(stringDef.index, fret)}
                className={`cursor-pointer fill-accent transition-opacity duration-150 ${
                  isPressed ? "opacity-100" : "opacity-0 hover:opacity-30"
                }`}
              />
            );
          })
      )}
    </svg>
  );
}
