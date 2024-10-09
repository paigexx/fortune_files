import { PinataSDK } from "pinata";
import { OpenAI } from "openai";


export const pinata = new PinataSDK({
  pinataJwt: `${process.env.PINATA_JWT}`,
  pinataGateway: `${process.env.GATEWAY_URL}`
})
    

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
