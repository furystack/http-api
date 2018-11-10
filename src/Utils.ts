import { IncomingMessage, ServerResponse } from "http";
import { ICorsOptions } from "./Models/ICorsOptions";

export class Utils {
    public static async readPostBody<T>(incomingMessage: IncomingMessage): Promise<T> {
        let body = "";
        await new Promise((resolve, reject) => {
            incomingMessage.on("readable", () => {
                const data = incomingMessage.read();
                if (data) {
                    body += data;
                }
            });
            incomingMessage.on("end", () => {
                resolve();
            });
            incomingMessage.on("error", (err) => {
                reject(err);
            });
        });
        return JSON.parse(body) as T;
    }

    public static addCorsHeaders(incomingMessage: IncomingMessage, serverResponse: ServerResponse, options: ICorsOptions) {
        if (
            incomingMessage.headers &&
            incomingMessage.headers.origin !== incomingMessage.headers.host
            && options.origins.some((origin) => origin === incomingMessage.headers.origin)) {
            serverResponse.setHeader("Access-Control-Allow-Origin", incomingMessage.headers.origin as string);
            serverResponse.setHeader("Access-Control-Allow-Credentials", "true");
        }
    }

}
