import { Request, Response } from "express";

export class StringCheckerController {
  check(req: Request, res: Response): void {
    try {
      const { input1, input2, type } = req.body as {
        input1: string;
        input2: string;
        type: "sensitive" | "non-sensitive";
      };

      if (!input1 || !input2 || !type) {
        res.status(422).json({ success: false, message: "input1, input2, and type are required" });
        return;
      }

      const isSensitive = type === "sensitive";
      const totalChars = input1.length;           
      const matchedChars: string[] = [];
      const notMatchedChars: string[] = [];
      let matchedCount = 0;

      for (let i = 0; i < input1.length; i++) {
        const charToFind = input1[i];
        let found = false;

        for (let j = 0; j < input2.length; j++) {
          const charInInput2 = input2[j];

          if (isSensitive) {
            // Case sensitive: exact match
            if (charToFind === charInInput2) {
              found = true;
              break;
            }
          } else {
            // Case insensitive: lowercase comparison
            if (charToFind.toLowerCase() === charInInput2.toLowerCase()) {
              found = true;
              break;
            }
          }
        }

        if (found) {
          matchedCount++;
          if (!matchedChars.includes(charToFind)) {
            matchedChars.push(charToFind);
          }
        } else {
          if (!notMatchedChars.includes(charToFind)) {
            notMatchedChars.push(charToFind);
          }
        }
      }

      const percentage = totalChars > 0
        ? Math.round((matchedCount / totalChars) * 100 * 100) / 100
        : 0;

      res.json({
        success: true,
        data: {
          input1,
          input2,
          type,
          totalChars,
          matchedCount,
          percentage,
          matchedChars,
          notMatchedChars,
          summary: `${matchedCount} / ${totalChars} karakter input1 ditemukan di input2 = ${percentage}%`,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

export const stringCheckerController = new StringCheckerController();