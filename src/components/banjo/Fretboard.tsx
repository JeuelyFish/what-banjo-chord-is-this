"use client";

import { NUM_FRETS, type Fingering, type StringDef, type StringIndex } from "@/lib/banjo/tuning";
import { pitchClass } from "@/lib/banjo/notes";

// Scales the whole fretboard (width, spacing, dots, strokes, labels)
// uniformly. Base values below were tuned at SCALE = 1 for a ~184px-wide
// board; SCALE = 1.8 brings it to ~333px while keeping every part in the
// same proportion to each other.
const SCALE = 1.1;

const FRET_HEIGHT = 40 * SCALE;
const STRING_SPACING = 32 * SCALE;
const NECK_TOP_MARGIN = 56 * SCALE;
const SIDE_MARGIN = 28 * SCALE;
const DOT_RADIUS = 12 * SCALE;
const OPEN_STRING_OVERHANG = 20 * SCALE;
const STRING_LABEL_GAP = 16 * SCALE;
const FRET_NUMBER_GAP = 12 * SCALE;
const OPEN_TARGET_INSET = 3 * SCALE;
const NUT_STROKE_WIDTH = 3 * SCALE;
const FRET_LINE_STROKE_WIDTH = 1 * SCALE;
const STRING_STROKE_WIDTH = 2 * SCALE;
const OPEN_TARGET_STROKE_WIDTH = 2 * SCALE;
const FRETTED_TARGET_STROKE_WIDTH = 1 * SCALE;
const BOTTOM_MARGIN = 20 * SCALE;

// Rendered left-to-right as viewed head-on (looking at the front of the
// banjo, playing hand toward you): the short 5th drone string on the left,
// then 4th, 3rd, 2nd, 1st.
const DISPLAY_ORDER: StringIndex[] = [0, 1, 2, 3, 4];

const svgWidth = SIDE_MARGIN * 2 + STRING_SPACING * (DISPLAY_ORDER.length - 1);
const svgHeight = NECK_TOP_MARGIN + FRET_HEIGHT * NUM_FRETS + BOTTOM_MARGIN;

// The fretboard's rendered pixel width, exposed so sibling UI (e.g. the
// strum button) can match it exactly rather than guessing at a layout width.
export const FRETBOARD_WIDTH = svgWidth;

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
  tuning: StringDef[];
  onFret: (stringIndex: StringIndex, fret: number) => void;
  onOpen: (stringIndex: StringIndex) => void;
}

export function Fretboard({ fingering, tuning, onFret, onOpen }: FretboardProps) {
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
          x1={fret < tuning[0].minFret - 1 ? screenX(1) : screenX(0)}
          x2={screenX(4)}
          y1={fretLineY(fret)}
          y2={fretLineY(fret)}
          className={fret === 0 ? "stroke-foreground" : "stroke-foreground/30"}
          strokeWidth={fret === 0 ? NUT_STROKE_WIDTH : FRET_LINE_STROKE_WIDTH}
        />
      ))}

      {/* fret number labels */}
      {Array.from({ length: NUM_FRETS }, (_, i) => i + 1).map((fret) => (
        <text
          key={fret}
          x={SIDE_MARGIN - FRET_NUMBER_GAP}
          y={dotY(fret)}
          textAnchor="end"
          dominantBaseline="middle"
          className="fill-foreground/40 text-[20px]"
        >
          {fret}
        </text>
      ))}

      {/* strings */}
      {tuning.map((stringDef) => {
        const x = screenX(stringDef.index);
        const topY =
          stringDef.minFret > 0
            ? fretLineY(stringDef.minFret - 1)
            : fretLineY(0) - OPEN_STRING_OVERHANG;
        return (
          <line
            key={stringDef.index}
            x1={x}
            x2={x}
            y1={topY}
            y2={fretLineY(NUM_FRETS)}
            className="stroke-foreground/60"
            strokeWidth={STRING_STROKE_WIDTH}
          />
        );
      })}

      {/* string note labels */}
      {tuning.map((stringDef) => {
        const topY =
          stringDef.minFret > 0
            ? fretLineY(stringDef.minFret - 1)
            : fretLineY(0) - OPEN_STRING_OVERHANG;
        return (
          <text
            key={stringDef.index}
            x={screenX(stringDef.index)}
            y={topY - STRING_LABEL_GAP}
            textAnchor="middle"
            className="fill-foreground/50 text-[20px]"
          >
            {stringDef.minFret > 0
              ? pitchClass(stringDef.openNote).toLowerCase()
              : pitchClass(stringDef.openNote)}
          </text>
        );
      })}

      {/* open-string targets */}
      {tuning.map((stringDef) => {
        const x = screenX(stringDef.index);
        const y =
          stringDef.minFret > 0
            ? fretLineY(stringDef.minFret - 1)
            : fretLineY(0) - OPEN_STRING_OVERHANG;
        const isOpen = fingering[stringDef.index] === null;
        return (
          <circle
            key={stringDef.index}
            cx={x}
            cy={y}
            r={DOT_RADIUS - OPEN_TARGET_INSET}
            onClick={() => onOpen(stringDef.index)}
            className={`cursor-pointer stroke-foreground/60 ${
              isOpen ? "fill-transparent" : "fill-transparent hover:fill-accent/20"
            }`}
            strokeWidth={isOpen ? OPEN_TARGET_STROKE_WIDTH : FRETTED_TARGET_STROKE_WIDTH}
          />
        );
      })}

      {/* fretted positions */}
      {tuning.flatMap((stringDef) =>
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
