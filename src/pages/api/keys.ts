import { pinata } from "../../../utils/config";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
        const key = await pinata.keys.create({
            keyName: "user 1",
            permissions: {
              admin: true,
            },
            maxUses: 2,
          });
      return res.status(200).json(key);
    } catch (e) {
      console.log(e);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
