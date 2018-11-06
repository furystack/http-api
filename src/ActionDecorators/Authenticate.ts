import { Constructable, IContext, LoggerCollection } from "@furystack/core";
import { IncomingMessage, ServerResponse } from "http";
import { IRequestAction } from "../Models/IRequestAction";

export const Authenticate = () =>
    <T extends Constructable<IRequestAction>>(constructor: T) => {
        return class extends constructor {

            public readonly authenticate: boolean = true;

            public async exec(incomingMessage: IncomingMessage, serverResponse: ServerResponse, getContext: () => IContext): Promise<void> {
                const authenticated = await getContext().isAuthenticated();
                if (!authenticated) {
                    serverResponse.writeHead(401, "Unauthorized", {
                        "WWW-Authenticate": "Basic",
                    });
                    serverResponse.end();
                    getContext().getInjector().GetInstance(LoggerCollection).Warning({
                        scope: "@furystack/http-api/@Authenticate()",
                        message: `A Visitor user has been tried to access to action '${incomingMessage.url}' without authentication.`,
                        data: {
                            url: incomingMessage.url,
                        },
                    });
                    return;
                }
                return await super.exec(incomingMessage, serverResponse, getContext);
            }
        };
    };
