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
    await addChars(k, textContainer, content[index]);
    let lineFinished = true;

    const advanceDialogue = async () => {
      if (!lineFinished) return;

      index++;
      if (index >= content.length) {
        cleanup();
        resolve();
        return;
      }
      textContainer.text = "";
      await addChars(k, textContainer, content[index]);
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
  });
}
