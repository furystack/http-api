import { LoggerCollection } from "@furystack/core";
import { Injectable } from "@furystack/inject";
import { IncomingMessage, ServerResponse } from "http";
import { IRequestAction } from "./Models";

@Injectable()
export class ErrorAction implements IRequestAction {
    public dispose() { /** */}
    public exec(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    public async returnError(error: any): Promise<void> {
        this.serverResponse.writeHead(500, "Server error",
            { "Content-Type": "application/json" },
        );
        this.serverResponse.write(JSON.stringify({ message: error.message, url: this.incomingMessage.url, stack: error.stack }));
        this.serverResponse.end();
        this.logger.Warning({
            scope: "@furystack/http-api/ErrorAction",
            message: `An action returned 500 from '${this.incomingMessage.url}'.`,
            data: {
                error,
            },
        });
    }

    constructor(private incomingMessage: IncomingMessage, private serverResponse: ServerResponse, private logger: LoggerCollection) { }
}
