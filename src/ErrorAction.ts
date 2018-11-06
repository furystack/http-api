import { IContext, LoggerCollection } from "@furystack/core";
import { IncomingMessage, ServerResponse } from "http";
import { Authorize } from "./ActionDecorators/Authorize";
import { RequestAction } from "./RequestAction";

export class ErrorAction extends RequestAction {
    public exec(incomingMessage: IncomingMessage, serverResponse: ServerResponse, getContext: () => IContext): Promise<void> {
        throw new Error("Method not implemented.");
    }
    public async returnError(incomingMessage: IncomingMessage, serverResponse: ServerResponse, getContext: () => IContext, error: any): Promise<void> {
        serverResponse.writeHead(500, "Server error",
            { "Content-Type": "application/json" },
        );
        serverResponse.write(JSON.stringify({ message: error.message, url: incomingMessage.url, stack: error.stack }));
        serverResponse.end();
        getContext().getInjector().GetInstance(LoggerCollection).Warning({
            scope: "@furystack/http-api/ErrorAction",
            message: `An action returned 500 from '${incomingMessage.url}'.`,
            data: {
                error,
            },
        });
    }
    public segmentName: string = "";

    constructor() {
        super();
    }
}
