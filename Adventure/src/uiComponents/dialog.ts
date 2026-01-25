import type { GameObj, KAPLAYCtx, Vec2 } from "kaplay";

export async function addLine(
  k: KAPLAYCtx,
  textContainer: GameObj,
  lines: string[],
) {
  lines.forEach(async (line: string) => await addChars(k, textContainer, line));
}

export async function addChars(
  k: KAPLAYCtx,
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
    // k.debug.log(content);
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
    // await addLine(k, textContainer, content);
    let index = 0;
    await addChars(k, textContainer, content[index]);
    let lineFinished = true;
    const dialogueKey = k.onKeyPress(["space", "enter"], async () => {
      if (!lineFinished) return;

      index++;
      if (index >= content.length) {
        dialogueKey.cancel();
        k.destroy(textContainer);
        k.destroy(dialogueBox);
        resolve();
        return;
      }
      textContainer.text = "";
      await addChars(k, textContainer, content[index]);
    });
  });
}
