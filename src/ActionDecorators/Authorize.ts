import { Constructable, IContext, IRole } from "@furystack/core";
import { IncomingMessage, ServerResponse } from "http";
import { IRequestAction } from "../Models/IRequestAction";

export const Authorize = (...roles: IRole[]) =>
    <T extends Constructable<IRequestAction>>(constructor: T) => {
    return class extends constructor {
        public readonly authorize: IRole[] = roles;
        public async exec(incomingMessage: IncomingMessage, serverResponse: ServerResponse, getContext: () => IContext): Promise<void> {
            const authorized = await getContext().isAuthorized(...roles);
            if (!authorized) {
                serverResponse.writeHead(403, "Forbidden");
                serverResponse.end();
                return;
            }
            return await super.exec(incomingMessage, serverResponse, getContext);
        }
    };
};
