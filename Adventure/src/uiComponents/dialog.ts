import type { GameObj, KAPLAYCtx, Vec2 } from "kaplay";
import { detectDeviceType } from "../utils";

export async function addLine(
  k: KAPLAYCtx,
  textContainer: GameObj,
  lines: string[],
) {
  lines.forEach(async (line: string) => await addChars(k, textContainer, line));
}

export async function addChars(
  _k: KAPLAYCtx,
  textContainer: GameObj,
  line: string,
) {
  for (let char of line) {
    await new Promise((resolve: any) => {
      setTimeout(() => {
        textContainer.text += char;
        resolve();
      }, 30);
    });
  }
}

export function dialogue(
  k: KAPLAYCtx,
  pos: Vec2,
  content: string[],
): Promise<any> {
  return new Promise(async (resolve: any) => {
    const dialogueBox = k.add([k.rect(800, 180), k.pos(pos), k.fixed()]);
    const textContainer = dialogueBox.add([
      k.text("", {
        font: "gameboy",
        width: 700,
        lineSpacing: 10,
        size: 16,
      }),
      k.color(k.Color.fromHex("1288bc")),
      k.pos(20, 40),
      k.fixed(),
      k.outline(10, k.Color.fromHex("1288bc"), 1, "round"),
    ]);

    let index = 0;
    let typing = false;
    let skip = false;

    // Types one line char-by-char. Guarded by `typing` so only one runs at a
    // time; setting `skip` finishes the current line instantly.
    const typeLine = async (line: string) => {
      typing = true;
      skip = false;
      textContainer.text = "";
      for (const char of line) {
        if (skip) break;
        textContainer.text += char;
        await new Promise((r) => setTimeout(r, 30));
      }
      textContainer.text = line;
      typing = false;
    };

    const advanceDialogue = () => {
      // While a line is still typing, a press completes it instead of
      // starting a second (concurrent) typewriter that scrambles the text.
      if (typing) {
        skip = true;
        return;
      }
      index++;
      if (index >= content.length) {
        cleanup();
        resolve();
        return;
      }
      typeLine(content[index]);
    };

    // Keyboard input (for desktop)
    const dialogueKey = k.onKeyPress(["space", "enter"], advanceDialogue);

    // Touch input (for mobile) - tap anywhere on screen to advance
    let dialogueTouch: ReturnType<typeof k.onTouchStart> | null = null;
    const isMobile = detectDeviceType() === "mobile";
    if (isMobile) {
      dialogueTouch = k.onTouchStart(() => {
        advanceDialogue();
      });
    }

    const cleanup = () => {
      dialogueKey.cancel();
      dialogueTouch?.cancel();
      k.destroy(textContainer);
      k.destroy(dialogueBox);
    };

    // Start typing the first line.
    typeLine(content[index]);
  });
}
