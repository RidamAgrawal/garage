import type { KAPLAYCtx } from "kaplay";
import { CHARACTER_COUNT, getCharacterPreviewFrame } from "../constants";
import { globalState } from "../state/stateManager";
import { detectDeviceType } from "../utils";

const COLS = 4;
const ROWS = Math.ceil(CHARACTER_COUNT / COLS);
const CELL = 180;
const PREVIEW_SCALE = 5;

export function registerCharacterSelectScene(k: KAPLAYCtx) {
  k.scene("characterSelect", () => {
    const cx = k.width() / 2;
    const gridW = COLS * CELL;
    const gridH = ROWS * CELL;
    const startX = cx - gridW / 2 + CELL / 2;
    const startY = 200 + CELL / 2;

    const cellCenter = (index: number) => {
      const c = index % COLS;
      const r = Math.floor(index / COLS);
      return k.vec2(startX + c * CELL, startY + r * CELL);
    };

    let selected = globalState.selectedCharacter;

    // Background
    k.add([
      k.rect(k.width(), k.height()),
      k.pos(0, 0),
      k.color(20, 18, 40),
      k.fixed(),
    ]);

    k.add([
      k.text("CHOOSE YOUR CHARACTER", { font: "gameboy", size: 40 }),
      k.pos(cx, 90),
      k.anchor("center"),
      k.color(255, 255, 255),
      k.fixed(),
    ]);

    // Highlight box behind the selected preview.
    const highlight = k.add([
      k.rect(CELL - 40, CELL - 40, { radius: 8 }),
      k.pos(cellCenter(selected)),
      k.anchor("center"),
      k.color(88, 120, 200),
      k.outline(5, k.rgb(255, 255, 255)),
      k.z(0),
    ]);

    // Character previews.
    for (let i = 0; i < CHARACTER_COUNT; i++) {
      const preview = k.add([
        k.sprite("assets", { frame: getCharacterPreviewFrame(i) }),
        k.pos(cellCenter(i)),
        k.anchor("center"),
        k.scale(PREVIEW_SCALE),
        k.area(),
        k.z(1),
      ]);
      // Tap/click a character to select it; tapping the selected one confirms.
      preview.onClick(() => {
        if (selected === i) {
          confirm();
        } else {
          selected = i;
          updateSelection();
        }
      });
    }

    const label = k.add([
      k.text("", { font: "gameboy", size: 24 }),
      k.pos(cx, startY + gridH),
      k.anchor("center"),
      k.color(255, 255, 255),
      k.fixed(),
    ]);

    const isMobile = detectDeviceType() === "mobile";
    k.add([
      k.text(
        isMobile
          ? "Tap a character, then tap it again to start"
          : "Arrows/WASD to move  •  Enter/Space to start",
        { font: "gameboy", size: 20, align: "center", width: 600 },
      ),
      k.pos(cx, k.height() - 60),
      k.anchor("center"),
      k.color(180, 180, 200),
      k.fixed(),
    ]);

    function updateSelection() {
      highlight.pos = cellCenter(selected);
      label.text = `Character ${selected + 1} / ${CHARACTER_COUNT}`;
    }

    function move(dc: number, dr: number) {
      const c = selected % COLS;
      const r = Math.floor(selected / COLS);
      const nc = (c + dc + COLS) % COLS;
      const nr = (r + dr + ROWS) % ROWS;
      const next = nr * COLS + nc;
      if (next < CHARACTER_COUNT) {
        selected = next;
        updateSelection();
      }
    }

    function confirm() {
      globalState.selectedCharacter = selected;
      k.go(globalState.characterSelectReturnScene);
    }

    k.onKeyPress(["left", "a"], () => move(-1, 0));
    k.onKeyPress(["right", "d"], () => move(1, 0));
    k.onKeyPress(["up", "w"], () => move(0, -1));
    k.onKeyPress(["down", "s"], () => move(0, 1));
    k.onKeyPress(["enter", "space"], () => confirm());

    updateSelection();
  });
}
