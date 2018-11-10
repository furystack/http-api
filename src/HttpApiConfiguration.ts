import { Constructable, Injectable } from "@furystack/inject";
import { IncomingMessage, Server as HttpServer, ServerResponse } from "http";
import { Server } from "net";
import { ErrorAction } from "./ErrorAction";
import { IRequestAction } from "./Models";
import { ICorsOptions } from "./Models/ICorsOptions";
import { NotFoundAction } from "./NotFoundAction";
export class HttpApiConfiguration {
    constructor(
            public defaultAction: Constructable<IRequestAction>  = NotFoundAction,
            public errorAction: Constructable<ErrorAction> = ErrorAction,
            public hostName: string = "localhost",
            public serverFactory: (requestListener: (incomingMessage: IncomingMessage, serverResponse: ServerResponse) => void) => Server = (listener) => new HttpServer(listener),
            public notFoundAction: Constructable<NotFoundAction> = NotFoundAction,
            public actions: Array<(incomingMessage: IncomingMessage) => Constructable<IRequestAction> | undefined> = [],
            public port: number = 8080,
            public protocol: "http" | "https" = "http",
            public corsOptions: ICorsOptions = {
                origins: [],

            },
    ) {
        /** */
    }
}
